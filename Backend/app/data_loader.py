from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, Iterator, List, Optional

import pandas as pd

from app.exceptions import ClinicalDataIncompleteError
from app import schemas


DATASET_DIR = Path(
    os.getenv(
        "MIMIC_DATA_DIR",
        str(Path(__file__).resolve().parents[2] / "mimic-iii-clinical-database-demo-1.4"),
    )
)


def _resolve_dataset_file(stem: str) -> Path:
    """Resolve either compressed or uncompressed CSV file for a MIMIC table."""
    gz = DATASET_DIR / f"{stem}.csv.gz"
    plain = DATASET_DIR / f"{stem}.csv"
    if gz.exists():
        return gz
    if plain.exists():
        return plain
    raise ClinicalDataIncompleteError(
        f"Required MIMIC file is missing: {stem}.csv.gz (or {stem}.csv)"
    )


def _subject_chunks(
    file_path: Path,
    subject_id: int,
    usecols: List[str],
    chunksize: int = 50000,
) -> Iterator[pd.DataFrame]:
    """Yield chunks that contain only rows for a single subject_id."""
    try:
        for chunk in pd.read_csv(file_path, usecols=usecols, chunksize=chunksize):
            if "subject_id" not in chunk.columns:
                continue
            filtered = chunk[chunk["subject_id"] == subject_id]
            if not filtered.empty:
                yield filtered
    except FileNotFoundError as exc:
        raise ClinicalDataIncompleteError(
            f"Required MIMIC file not found: {file_path.name}"
        ) from exc


def _read_label_map(file_path: Path, id_col: str = "itemid") -> Dict[int, str]:
    """Read ITEMID to LABEL map for lookup tables like D_ITEMS and D_LABITEMS."""
    try:
        df = pd.read_csv(file_path, usecols=[id_col, "label"])
    except ValueError:
        return {}
    except FileNotFoundError as exc:
        raise ClinicalDataIncompleteError(
            f"Required dictionary file not found: {file_path.name}"
        ) from exc

    cleaned = df.dropna(subset=[id_col, "label"])
    return {int(row[id_col]): str(row["label"]) for _, row in cleaned.iterrows()}


def get_available_subject_ids(limit: Optional[int] = None) -> List[int]:
    """Return available subject IDs from the MIMIC dataset."""
    patients_file = _resolve_dataset_file("PATIENTS")
    try:
        df = pd.read_csv(patients_file, usecols=["subject_id"])
    except FileNotFoundError as exc:
        raise ClinicalDataIncompleteError("PATIENTS file is unavailable") from exc

    subject_ids = sorted(df["subject_id"].dropna().astype(int).unique().tolist())
    if limit is not None:
        return subject_ids[:limit]
    return subject_ids


def get_mimic_patient(subject_id: int) -> schemas.PatientData:
    """Load a patient's labs, vitals, and notes from MIMIC demo CSVs."""
    labevents_file = _resolve_dataset_file("LABEVENTS")
    chartevents_file = _resolve_dataset_file("CHARTEVENTS")
    noteevents_file = _resolve_dataset_file("NOTEEVENTS")

    d_labitems_file = _resolve_dataset_file("D_LABITEMS")
    d_items_file = _resolve_dataset_file("D_ITEMS")

    lab_label_map = _read_label_map(d_labitems_file)
    chart_label_map = _read_label_map(d_items_file)

    lab_results: List[schemas.LabResult] = []
    for rows in _subject_chunks(
        labevents_file,
        subject_id,
        usecols=["subject_id", "itemid", "valuenum", "valueuom", "charttime"],
    ):
        rows["valuenum"] = pd.to_numeric(rows["valuenum"], errors="coerce")
        rows = rows.dropna(subset=["valuenum"])
        for _, row in rows.iterrows():
            item_id_int = int(row["itemid"])
            item_label = lab_label_map.get(item_id_int, f"ITEMID_{item_id_int}")
            timestamp_raw = row.get("charttime")
            timestamp = pd.to_datetime(timestamp_raw, errors="coerce")
            if pd.isna(timestamp):
                continue
            lab_results.append(
                schemas.LabResult(
                    item_id=item_label,
                    value=float(row["valuenum"]),
                    unit=str(row.get("valueuom") or "unknown"),
                    timestamp=timestamp.to_pydatetime(),
                )
            )

    vital_signs: List[schemas.VitalSign] = []
    for rows in _subject_chunks(
        chartevents_file,
        subject_id,
        usecols=["subject_id", "itemid", "valuenum", "valueuom", "charttime", "storetime"],
    ):
        rows["valuenum"] = pd.to_numeric(rows["valuenum"], errors="coerce")
        rows = rows.dropna(subset=["valuenum"])
        for _, row in rows.iterrows():
            item_id_int = int(row["itemid"])
            item_label = chart_label_map.get(item_id_int, f"ITEMID_{item_id_int}")
            label_lower = item_label.lower()

            if "heart rate" in label_lower:
                vital_type = "Heart Rate"
            elif "mean" in label_lower and "pressure" in label_lower:
                vital_type = "MAP"
            elif "arterial bp" in label_lower and "mean" in label_lower:
                vital_type = "MAP"
            elif "blood pressure" in label_lower:
                vital_type = "Blood Pressure"
            else:
                continue

            timestamp_raw = row.get("charttime") or row.get("storetime")
            timestamp = pd.to_datetime(timestamp_raw, errors="coerce")
            if pd.isna(timestamp):
                continue

            vital_signs.append(
                schemas.VitalSign(
                    type=vital_type,
                    value=float(row["valuenum"]),
                    timestamp=timestamp.to_pydatetime(),
                )
            )

    clinical_notes: List[schemas.ClinicalNote] = []
    for rows in _subject_chunks(
        noteevents_file,
        subject_id,
        usecols=["subject_id", "row_id", "text", "category"],
        chunksize=20000,
    ):
        rows = rows.dropna(subset=["text"])
        for _, row in rows.iterrows():
            clinical_notes.append(
                schemas.ClinicalNote(
                    note_id=str(row.get("row_id", "unknown")),
                    text_content=str(row["text"]),
                    category=str(row.get("category") or "General"),
                )
            )

    return schemas.PatientData(
        lab_results=lab_results,
        vital_signs=vital_signs,
        clinical_notes=clinical_notes,
    )
