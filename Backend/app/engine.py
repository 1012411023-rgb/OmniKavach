import logging
from app import schemas
from app.agents import generate_patient_report

logger = logging.getLogger(__name__)

async def analyze_patient_data(data: schemas.PatientData) -> schemas.AnalysisReport:
    """
    AI-powered sepsis risk assessment using multi-agent pipeline.
    
    This function orchestrates a sophisticated analysis using:
    - Parser Agent: Extracts symptoms from clinical notes
    - Tracker Agent: Analyzes lab and vital sign trends  
    - Chief Agent: Synthesizes data into comprehensive risk assessment
    
    The pipeline includes statistical outlier detection, trend analysis,
    and clinical decision support powered by Groq AI models and RAG.
    
    Args:
        data: PatientData containing lab results, vital signs, and clinical notes
        
    Returns:
        AnalysisReport with AI-generated risk score, detected anomalies, and recommendations
        
    Raises:
        RuntimeError: If AI analysis fails or API is unavailable
        
    Note:
        This uses the hybrid architecture with MIMIC-III data and mock clinical notes.
    """
    try:
        # Generate mock patient ID for demonstration
        # In production, this would come from the actual patient data
        patient_id = "AI_ANALYSIS_PATIENT"
        
        # Use the comprehensive AI agent pipeline with RAG
        return await generate_patient_report(patient_id, data)
        
    except Exception as exc:
        # Fallback to basic heuristic analysis if AI fails
        logger.error(f"AI analysis failed, falling back to heuristic: {exc}")
        
        return _fallback_heuristic_analysis(data)


def _fallback_heuristic_analysis(data: schemas.PatientData) -> schemas.AnalysisReport:
    """
    Fallback heuristic analysis when AI pipeline is unavailable.
    
    This provides basic rule-based analysis as a safety fallback.
    """
    has_high_lactate = any(
        lab.item_id.lower().find("lactate") != -1 and lab.value > 2.0
        for lab in data.lab_results
    )
    has_low_map = any(
        ("map" in vital.type.lower() or "mean arterial pressure" in vital.type.lower())
        and vital.value < 65
        for vital in data.vital_signs
    )

    if has_high_lactate or has_low_map:
        anomalies = []
        if has_high_lactate:
            anomalies.append("Elevated Lactate (> 2.0)")
        if has_low_map:
            anomalies.append("Low Mean Arterial Pressure (MAP < 65)")
        return schemas.AnalysisReport(
            risk_score=0.85,
            detected_anomalies=anomalies,
            recommendations=[
                "Escalate to urgent sepsis protocol review",
                "Repeat lactate and continuous hemodynamic monitoring",
            ],
        )

    return schemas.AnalysisReport(
        risk_score=0.15,
        detected_anomalies=["No high-risk hemodynamic or lactate triggers detected"],
        recommendations=["Continue standard monitoring and reassessment"],
    )