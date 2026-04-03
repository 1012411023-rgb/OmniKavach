from pathlib import Path
import asyncio
import logging
from typing import List

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import schemas
from app.data_loader import get_available_subject_ids, get_mimic_patient
from app.engine import analyze_patient_data
from app.exceptions import AIProcessingTimeout, ClinicalDataIncompleteError

app = FastAPI()

# Configure logging
LOG_FILE = Path(__file__).resolve().parent / "server_errors.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "online"}


@app.exception_handler(ClinicalDataIncompleteError)
async def clinical_data_incomplete_handler(
    request: Request, exc: ClinicalDataIncompleteError
) -> JSONResponse:
    logger.error(
        "ClinicalDataIncompleteError on %s: %s", request.url.path, str(exc), exc_info=True
    )
    return JSONResponse(
        status_code=422,
        content={
            "error": "Incomplete Data",
            "detail": "The patient record is missing vital fields required for Sepsis analysis.",
        },
    )


@app.exception_handler(AIProcessingTimeout)
async def ai_processing_timeout_handler(
    request: Request, exc: AIProcessingTimeout
) -> JSONResponse:
    logger.error("AIProcessingTimeout on %s: %s", request.url.path, str(exc), exc_info=True)
    fallback_report = schemas.AnalysisReport(
        risk_score=0.0,
        detected_anomalies=["AI processing exceeded clinical response threshold"],
        recommendations=[
            "Repeat analysis request",
            "Escalate to bedside clinical assessment immediately",
        ],
    )
    return JSONResponse(status_code=504, content=fallback_report.model_dump())


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception on %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected system error occurred. Please contact the ICU technical team.",
        },
    )


@app.get("/patients/summary", response_model=List[int])
def get_patients_summary() -> List[int]:
    """Return available subject IDs from the MIMIC dataset."""
    return get_available_subject_ids()


@app.get("/patients/{patient_id}", response_model=schemas.PatientData)
def get_patient(patient_id: int) -> schemas.PatientData:
    """Return full patient data loaded from MIMIC files for a specific subject."""
    patient_data = get_mimic_patient(patient_id)

    if (
        len(patient_data.lab_results) == 0
        and len(patient_data.vital_signs) == 0
        and len(patient_data.clinical_notes) == 0
    ):
        raise HTTPException(
            status_code=404,
            detail=f"Patient with SUBJECT_ID {patient_id} not found in MIMIC sources",
        )

    return patient_data


@app.post("/analyze/{patient_id}", response_model=schemas.AnalysisReport)
async def analyze_patient(patient_id: int) -> schemas.AnalysisReport:
    """Load MIMIC patient data and run the analysis engine."""
    logger.info("Risk Analysis requested for patient SUBJECT_ID: %s", patient_id)

    patient_data = get_mimic_patient(patient_id)

    if not patient_data.vital_signs or not patient_data.lab_results:
        raise ClinicalDataIncompleteError(
            f"Patient {patient_id} is missing vital signs or laboratory results"
        )

    try:
        return await asyncio.wait_for(analyze_patient_data(patient_data), timeout=5)
    except asyncio.TimeoutError as exc:
        raise AIProcessingTimeout(
            f"AI analysis timed out after 5 seconds for patient {patient_id}"
        ) from exc
