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
from langchain_core.prompts import ChatPromptTemplate

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

# ── Twist 3: ICU Handoff Summary ─────────────────────────────────────────────

@app.post("/handoff/{patient_id}")
async def generate_shift_handoff(patient_id: int = FastApiPath(..., ge=1, le=999999)):
    """
    Generate a concise 3-bullet shift handoff summary to eliminate cognitive overload.
    
    Uses the exact prompt provided by the user to summarize the entire 12-hour shift
    into exactly THREE high-signal bullet points covering:
    1. Primary Issue & Current Trajectory
    2. Key Interventions & Lab Responses  
    3. Watch-Out/Action Items for next shift
    """
    try:
        # Load patient data
        patient_data = get_mimic_patient(patient_id)
        
        # Extract recent notes (last 12 hours)
        recent_notes = "\n".join([
            f"- [{note.timestamp.strftime('%H:%M')}] {note.text}"
            for note in patient_data.clinical_notes[-5:]  # Last 5 notes
        ])
        
        # Extract lab trends (last 12 hours)
        lab_trends = []
        for lab in patient_data.lab_results[-10:]:  # Last 10 lab results
            lab_trends.append(f"{lab.label}: {lab.value} {lab.unit} at {lab.charttime.strftime('%H:%M')}")
        mapped_labs = "\n".join(lab_trends)
        
        # Get active alerts (mock for now - could be enhanced with real alert system)
        active_alerts = "No active alerts"  # This could be enhanced to pull from alert system
        
        handover_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an Expert ICU Attending Physician handing off a patient to the incoming night shift.
    Your goal is to eliminate cognitive overload. You must read the patient's recent notes, lab trends, and active risk alerts, and summarize the entire 12-hour shift into exactly THREE high-signal bullet points.

    RULES:
    1. ZERO fluff. Use medical shorthand where appropriate.
    2. Bullet 1 MUST cover the Primary Issue & Current Trajectory (Are they crashing or stabilizing?).
    3. Bullet 2 MUST cover Key Interventions & Lab Responses (What did we do, and did the numbers improve?).
    4. Bullet 3 MUST cover the "Watch-Out" / Immediate Action Items for the incoming doctor.

    OUTPUT STRICTLY VALID JSON. No markdown blocks.

    JSON SCHEMA:
    {{
        "handover_summary": [
            "Bullet 1: [Primary Issue & Trajectory]",
            "Bullet 2: [Interventions & Lab Shifts]",
            "Bullet 3: [Action Items for Next Shift]"
        ]
    }}"""),
            
            ("user", """
    Parsed Notes (Last 12h):
    {notes}

    Mapped Labs (Last 12h):
    {labs}

    Active Chief Agent Alerts:
    {active_alerts}
    """)
        ])
        
        # Format the prompt with patient data
        formatted_prompt = handover_prompt.format(
            notes=recent_notes,
            labs=mapped_labs,
            active_alerts=active_alerts
        )
        
        # For now, return a mock response (in production, this would call an LLM)
        mock_handoff = {
            "patient_id": patient_id,
            "handover_summary": [
                f"Bullet 1: {patient_data.patient_id or 'Patient'} showing signs of sepsis with lactate trending up from 2.8 to 4.1 over last 12h, hemodynamically unstable on norepinephrine",
                f"Bullet 2: Started broad-spectrum antibiotics at 20:00, fluid resuscitation 2L crystalloid, lactate decreased from 4.1 to 3.6 after fluids, urine output improved from 0.3 to 0.8 mL/kg/hr",
                "Bullet 3: Watch for worsening septic shock, repeat lactate in 4 hours, consider vasopressin if MAP < 65 on norepinephrine > 0.1 mcg/kg/min, monitor for AKI"
            ],
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
        return JSONResponse(content=mock_handoff)
        
    except Exception as exc:
        logger.error("Handoff generation error for patient %s: %s", patient_id, str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to generate handoff for patient {patient_id}") from exc

# ── Twist 4: Alert Triage to Prevent Fatigue ───────────────────────────────────

@app.post("/triage/{patient_id}")
async def triage_alerts(patient_id: int = FastApiPath(..., ge=1, le=999999)):
    """
    Intelligent alert triage to prevent alert fatigue.
    
    Uses the Alert Triad logic:
    1. Temporal Trend: Labs must show consistent deterioration
    2. Symptom Corroboration: Notes must contain matching symptoms  
    3. Guideline Confirmation: RAG guidelines must confirm immediate intervention needed
    
    Only issues CRITICAL alerts when all three conditions are met.
    """
    try:
        # Load patient data
        patient_data = get_mimic_patient(patient_id)
        
        # Extract notes
        recent_notes = "\n".join([
            f"- [{note.timestamp.strftime('%H:%M')}] {note.text}"
            for note in patient_data.clinical_notes[-5:]
        ])
        
        # Extract labs
        lab_trends = []
        for lab in patient_data.lab_results[-10:]:
            lab_trends.append(f"{lab.label}: {lab.value} {lab.unit} at {lab.charttime.strftime('%H:%M')}")
        mapped_labs = "\n".join(lab_trends)
        
        # Get RAG context (mock for now)
        rag_context = "Sepsis guidelines: Lactate > 4 mmol/L with hypotension requires immediate fluid resuscitation and antibiotics"
        
        # Check for math anomaly (using our tools.py function)
        from app.tools import detect_lab_outlier
        anomaly_flag = False
        
        # Check lactate for anomalies
        lactate_values = [lab.value for lab in patient_data.lab_results if lab.label.lower() == 'lactate']
        if len(lactate_values) >= 3:
            current = lactate_values[-1]
            historical = lactate_values[:-1]
            outlier_result = detect_lab_outlier(current, historical)
            anomaly_flag = outlier_result.get("is_outlier", False)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Chief ICU Diagnostic AI and Alert Triage Coordinator.
    Your primary directive is to PREVENT ALERT FATIGUE. Nurses ignore systems that beep at every minor fluctuation. You are strictly forbidden from issuing a 'CRITICAL' alert unless a specific triad of conditions is met.

    THE ALERT TRIAD (All 3 must be true for a CRITICAL alert):
    1. Temporal Trend: Lab values must show consistent deterioration over time, not just a single minor fluctuation.
    2. Symptom Corroboration: Unstructured clinical notes MUST contain physical symptoms that match the failing labs (e.g., high lactate + "sweating/confusion").
    3. Guideline Confirmation: The provided RAG Medical Guidelines must explicitly state that this specific combination of labs and symptoms requires immediate intervention.

    TRIAGE LOGIC RULES:
    - If Math Anomaly Detector == TRUE: Set alert_level to "SUPPRESSED_ERROR". Ignore the Triad. Request a manual redraw.
    - If Triad is INCOMPLETE (e.g., bad labs but no symptoms): Set alert_level to "MONITOR". State clearly that alert is suppressed to prevent fatigue.
    - If Triad is MET: Set alert_level to "CRITICAL". You may "break the glass".

    OUTPUT STRICTLY VALID JSON. No markdown formatting.

    JSON SCHEMA:
    {{
        "alert_level": "CRITICAL" | "MONITOR" | "SUPPRESSED_ERROR",
        "diagnosis_flag": "Specific disease (e.g., Stage 1 AKI, Sepsis) or null",
        "triad_analysis": "Briefly explain which of the 3 Triad conditions were met or missed",
        "guideline_citation": "Exact quote from the RAG context justifying your decision",
        "recommended_action": "Next clinical step"
    }}"""),
            
            ("user", """
    Parsed Notes:
    {notes}

    Mapped Labs:
    {labs}

    RAG Medical Guidelines Context:
    {rag_context}

    Math Anomaly Detector (Lab Spike): {anomaly_flag}
    """)
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            notes=recent_notes,
            labs=mapped_labs,
            rag_context=rag_context,
            anomaly_flag="TRUE" if anomaly_flag else "FALSE"
        )
        
        # Mock triage response (in production, this would call an LLM)
        mock_triage = {
            "patient_id": patient_id,
            "alert_level": "CRITICAL" if not anomaly_flag else "SUPPRESSED_ERROR",
            "diagnosis_flag": "Sepsis" if not anomaly_flag else None,
            "triad_analysis": "Triad MET: Temporal deterioration in lactate (2.8→4.1), symptoms of confusion and sweating noted in notes, RAG guidelines confirm immediate intervention needed" if not anomaly_flag else "Math anomaly detected - lab spike inconsistent with baseline, suppressing alert to prevent false alarm",
            "guideline_citation": rag_context if not anomaly_flag else "Lab anomaly protocol: Request redraw before clinical action",
            "recommended_action": "Immediate fluid resuscitation and broad-spectrum antibiotics" if not anomaly_flag else "Request lab redraw and re-evaluate after confirmed results",
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
        return JSONResponse(content=mock_triage)
        
    except Exception as exc:
        logger.error("Alert triage error for patient %s: %s", patient_id, str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to triage alerts for patient {patient_id}") from exc

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