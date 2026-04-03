from datetime import datetime, timedelta
from typing import Dict
from app.schemas import PatientData, LabResult, VitalSign, ClinicalNote

# Mock patient database
MOCK_PATIENTS: Dict[str, PatientData] = {
    "101": PatientData(
        lab_results=[
            LabResult(
                item_id="Lactate",
                value=1.8,
                unit="mmol/L",
                timestamp=datetime.now() - timedelta(hours=2)
            ),
            LabResult(
                item_id="Glucose",
                value=95.0,
                unit="mg/dL",
                timestamp=datetime.now() - timedelta(hours=2)
            ),
            LabResult(
                item_id="White Blood Cells",
                value=8.5,
                unit="K/uL",
                timestamp=datetime.now() - timedelta(hours=4)
            ),
        ],
        vital_signs=[
            VitalSign(
                type="Heart Rate",
                value=78.0,
                timestamp=datetime.now() - timedelta(minutes=30)
            ),
            VitalSign(
                type="Blood Pressure (MAP)",
                value=85.0,
                timestamp=datetime.now() - timedelta(minutes=30)
            ),
            VitalSign(
                type="Temperature",
                value=37.1,
                timestamp=datetime.now() - timedelta(minutes=30)
            ),
            VitalSign(
                type="Respiratory Rate",
                value=16.0,
                timestamp=datetime.now() - timedelta(minutes=30)
            ),
        ],
        clinical_notes=[
            ClinicalNote(
                note_id="NOTE_101_001",
                text_content="Patient is stable and responding well to treatment. Vitals within normal limits. No signs of distress.",
                category="Nursing"
            ),
            ClinicalNote(
                note_id="NOTE_101_002",
                text_content="Patient ambulating with assistance. Appetite good. Pain well controlled.",
                category="Physician"
            ),
        ]
    ),
    "102": PatientData(
        lab_results=[
            LabResult(
                item_id="Lactate",
                value=4.2,
                unit="mmol/L",
                timestamp=datetime.now() - timedelta(hours=1)
            ),
            LabResult(
                item_id="Lactate",
                value=3.8,
                unit="mmol/L",
                timestamp=datetime.now() - timedelta(hours=3)
            ),
            LabResult(
                item_id="Lactate",
                value=2.9,
                unit="mmol/L",
                timestamp=datetime.now() - timedelta(hours=6)
            ),
            LabResult(
                item_id="White Blood Cells",
                value=15.2,
                unit="K/uL",
                timestamp=datetime.now() - timedelta(hours=2)
            ),
            LabResult(
                item_id="Glucose",
                value=145.0,
                unit="mg/dL",
                timestamp=datetime.now() - timedelta(hours=2)
            ),
        ],
        vital_signs=[
            VitalSign(
                type="Heart Rate",
                value=112.0,
                timestamp=datetime.now() - timedelta(minutes=15)
            ),
            VitalSign(
                type="Heart Rate",
                value=105.0,
                timestamp=datetime.now() - timedelta(hours=1)
            ),
            VitalSign(
                type="Blood Pressure (MAP)",
                value=58.0,
                timestamp=datetime.now() - timedelta(minutes=15)
            ),
            VitalSign(
                type="Blood Pressure (MAP)",
                value=62.0,
                timestamp=datetime.now() - timedelta(hours=1)
            ),
            VitalSign(
                type="Temperature",
                value=38.4,
                timestamp=datetime.now() - timedelta(minutes=15)
            ),
            VitalSign(
                type="Respiratory Rate",
                value=24.0,
                timestamp=datetime.now() - timedelta(minutes=15)
            ),
        ],
        clinical_notes=[
            ClinicalNote(
                note_id="NOTE_102_001",
                text_content="Patient appears acutely ill. Tachycardic and hypotensive. Concern for sepsis.",
                category="Physician"
            ),
            ClinicalNote(
                note_id="NOTE_102_002",
                text_content="Patient reports increased weakness and confusion over past 6 hours. Family reports decreased urine output.",
                category="Nursing"
            ),
            ClinicalNote(
                note_id="NOTE_102_003",
                text_content="STAT labs ordered. Blood cultures drawn. Broad spectrum antibiotics initiated.",
                category="Emergency"
            ),
        ]
    ),
}

def get_patient_data(patient_id: str) -> PatientData | None:
    """Retrieve patient data from mock database."""
    return MOCK_PATIENTS.get(patient_id)

def get_all_patients() -> Dict[str, PatientData]:
    """Retrieve all patient data from mock database."""
    return MOCK_PATIENTS
