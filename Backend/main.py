from pathlib import Path
import asyncio
import json
import logging
import random
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request, Path as FastApiPath
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from contextlib import asynccontextmanager

from app import schemas
from app.data_loader import get_available_subject_ids, get_mimic_patient
from app.engine import analyze_patient_data
from app.exceptions import AIProcessingTimeout, ClinicalDataIncompleteError
from app.rag import initialize_vector_db, get_db_status

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager with RAG initialization."""
    logger.info("🚀 Starting OmniKavach Backend Server...")
    
    # Initialize ChromaDB vector database on startup
    logger.info("📚 Initializing Medical Librarian (ChromaDB)...")
    rag_initialized = initialize_vector_db()
    
    if rag_initialized:
        db_status = get_db_status()
        logger.info(f"✅ ChromaDB initialized successfully: {db_status}")
    else:
        logger.error("❌ ChromaDB initialization failed - RAG functionality unavailable")
    
    logger.info("🏥 OmniKavach Backend ready for ICU sepsis detection")
    
    yield
    
    # Cleanup on shutdown
    logger.info("🛑 Shutting down OmniKavach Backend...")

app = FastAPI(
    title="OmniKavach ICU Sepsis Detection",
    description="AI-powered sepsis risk assessment using multi-agent pipeline",
    version="1.0.0",
    lifespan=lifespan
)

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
async def clinical_data_incomplete_handler(request: Request, exc: ClinicalDataIncompleteError) -> JSONResponse:
    logger.error("ClinicalDataIncompleteError on %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=422,
        content={"error": "Incomplete Data", "detail": "The patient record is missing vital fields required for Sepsis analysis."},
    )

@app.exception_handler(AIProcessingTimeout)
async def ai_processing_timeout_handler(request: Request, exc: AIProcessingTimeout) -> JSONResponse:
    logger.error("AIProcessingTimeout on %s: %s", request.url.path, str(exc), exc_info=True)
    fallback_report = schemas.AnalysisReport(
        risk_score=0.0,
        detected_anomalies=["AI processing exceeded clinical response threshold"],
        recommendations=["Repeat analysis request", "Escalate to bedside clinical assessment immediately"],
    )
    return JSONResponse(status_code=504, content=fallback_report.model_dump())

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception on %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": "An unexpected system error occurred. Please contact the ICU technical team."},
    )

@app.get("/patients", response_model=list[int])
def get_patients() -> list[int]:
    try:
        return get_available_subject_ids()
    except ClinicalDataIncompleteError as exc:
        logger.error("Failed to load patient list: %s", str(exc))
        raise HTTPException(status_code=503, detail="MIMIC dataset is not properly configured or accessible") from exc
    except Exception as exc:
        logger.error("Unexpected error loading patients: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error while loading patient data") from exc

@app.get("/patients/{patient_id}", response_model=schemas.PatientData)
def get_patient(patient_id: int = FastApiPath(..., ge=1, le=999999, description="MIMIC subject ID (must be positive integer)")) -> schemas.PatientData:
    """Return full patient data loaded from MIMIC files for a specific subject."""
    logger.info("Requesting patient data for SUBJECT_ID: %s", patient_id)
    try:
        patient_data = get_mimic_patient(patient_id)
    except ClinicalDataIncompleteError as exc:
        logger.error("Data loading error for patient %s: %s", patient_id, str(exc))
        raise HTTPException(status_code=503, detail="MIMIC dataset is not properly configured or accessible") from exc
    except Exception as exc:
        logger.error("Unexpected error loading patient %s: %s", patient_id, str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error while loading patient {patient_id}") from exc

    if len(patient_data.lab_results) == 0 and len(patient_data.vital_signs) == 0 and len(patient_data.clinical_notes) == 0:
        raise HTTPException(status_code=404, detail=f"Patient with SUBJECT_ID {patient_id} not found in MIMIC sources")

    return patient_data

@app.post("/analyze/{patient_id}", response_model=schemas.AnalysisReport)
async def analyze_patient(patient_id: int = FastApiPath(..., ge=1, le=999999, description="MIMIC subject ID (must be positive integer)")) -> schemas.AnalysisReport:
    """Load MIMIC patient data and run the analysis engine."""
    logger.info("Risk Analysis requested for patient SUBJECT_ID: %s", patient_id)

    try:
        patient_data = get_mimic_patient(patient_id)
    except ClinicalDataIncompleteError as exc:
        raise HTTPException(status_code=503, detail="MIMIC dataset is not properly configured or accessible") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal server error while loading patient {patient_id} for analysis") from exc

    if not patient_data.vital_signs or not patient_data.lab_results:
        raise ClinicalDataIncompleteError(f"Patient {patient_id} is missing vital signs or laboratory results")

    try:
        # TIMEOUT INCREASED TO 20 SECONDS
        analysis_result = await asyncio.wait_for(analyze_patient_data(patient_data), timeout=20)
        
        if analysis_result is None:
            raise HTTPException(status_code=500, detail="Analysis engine failed to generate results")
            
        return analysis_result
        
    except asyncio.TimeoutError as exc:
        logger.error("AI analysis timed out after 20 seconds for patient %s", patient_id)
        raise AIProcessingTimeout(f"AI analysis timed out after 20 seconds for patient {patient_id}") from exc
    except Exception as exc:
        logger.error("Analysis engine error for patient %s: %s", patient_id, str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis engine encountered an error for patient {patient_id}") from exc

# ── Phase 3: Live Data Simulator (Server-Sent Events) ─────────────────────

@app.get("/stream/{patient_id}")
async def stream_vitals(patient_id: int = FastApiPath(..., ge=1, le=999999)):
    """
    Simulate a live ICU bedside monitor via Server-Sent Events.

    Loads the patient's real vital signs from MIMIC CSVs, then replays them
    one reading every 2 seconds.  If no real data exists, synthetic vitals
    are generated so the frontend always has something to animate.
    """

    async def event_generator():
        # Try loading real vital signs from the optimized CSV pipeline
        real_vitals = []
        try:
            patient_data = get_mimic_patient(patient_id)
            real_vitals = [
                {"type": v.type, "value": v.value, "timestamp": v.timestamp.isoformat()}
                for v in patient_data.vital_signs
            ]
        except Exception:
            logger.warning("No MIMIC vitals for patient %s — using synthetic data", patient_id)

        tick = 0
        while True:
            if real_vitals and tick < len(real_vitals):
                reading = real_vitals[tick]
            else:
                # Synthetic fallback: realistic ICU waveform with jitter
                reading = {
                    "type": random.choice(["Heart Rate", "MAP"]),
                    "value": round(
                        random.gauss(85, 12) if random.random() > 0.5
                        else random.gauss(72, 8),
                        1,
                    ),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }

            payload = json.dumps({"tick": tick, "patient_id": patient_id, **reading})
            yield f"data: {payload}\n\n"

            tick += 1
            await asyncio.sleep(2)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )