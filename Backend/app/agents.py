import os
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path
import json

from groq import Groq
from dotenv import load_dotenv

from app.schemas import PatientData, LabResult, VitalSign, ClinicalNote, AnalysisReport
from app.tools import detect_lab_outlier, calculate_trend, validate_vital_sign_ranges
from app.rag import retrieve_guideline

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class AIAgent:
    """Base class for AI agents using Groq."""
    
    def __init__(self, model_name: str = "llama3-8b-8192"):
        """Initialize the AI agent with Groq client."""
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable not set")
        
        self.client = Groq(api_key=api_key)
        self.model = model_name
        self.max_retries = 3
        self.retry_delay = 1.0
    
    async def _call_groq_with_retry(self, messages: List[Dict[str, str]], temperature: float = 0.1) -> str:
        """Call Groq API with retry logic."""
        for attempt in range(self.max_retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=1024,
                    response_format={"type": "json_object"}
                )
                return response.choices[0].message.content
                
            except Exception as exc:
                logger.warning(f"Groq API call attempt {attempt + 1} failed: {exc}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (2 ** attempt))
                else:
                    raise RuntimeError(f"Failed to call Groq API after {self.max_retries} attempts: {exc}")


class ParserAgent(AIAgent):
    """Agent responsible for extracting key symptoms from clinical notes."""
    
    def __init__(self, model_name: str = "llama3-8b-8192"):
        """Initialize the Parser Agent with mock clinical notes file."""
        super().__init__(model_name)
        self.mock_notes_file = Path(__file__).resolve().parent.parent / "mock_clinical_notes.txt"
    
    async def extract_symptoms(self, clinical_note_text: str) -> List[str]:
        """
        Extract key symptoms from clinical notes text.
        
        Args:
            clinical_note_text: Raw clinical notes text
            
        Returns:
            List of extracted symptoms as strings
        """
        try:
            # Read mock clinical notes from file if not provided
            if not clinical_note_text:
                if not self.mock_notes_file.exists():
                    logger.warning(f"Mock clinical notes file not found: {self.mock_notes_file}")
                    return []
                
                with open(self.mock_notes_file, 'r', encoding='utf-8') as f:
                    clinical_note_text = f.read()
                
                logger.info("Using mock clinical notes for symptom extraction")
            
        except Exception as exc:
            logger.error(f"Failed to read clinical notes: {exc}")
            return []
        
        system_prompt = """You are an ICU nurse specialist extracting symptoms from clinical shift notes.

Your task is to extract key clinical symptoms and observations from the provided text.
Focus on:
- Subjective symptoms (pain, nausea, dizziness, lethargy, confusion)
- Objective observations (rash, swelling, cyanosis, clammy skin, mottling)
- Functional changes (shortness of breath, difficulty breathing)
- Mental status changes (confusion, agitation, unresponsiveness)
- Vital sign abnormalities mentioned in text

Return a JSON object with this exact structure:
{
    "symptoms": ["symptom1", "symptom2", "symptom3"]
}

Be concise and medically accurate. Include only clinically relevant findings."""
        
        user_prompt = f"""Extract key symptoms from these ICU shift notes:\n\n{clinical_note_text}"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        try:
            response = await self._call_groq_with_retry(messages)
            result = json.loads(response)
            return result.get("symptoms", [])
            
        except Exception as exc:
            logger.error(f"Parser agent failed to extract symptoms: {exc}")
            return []


class TrackerAgent(AIAgent):
    """Agent responsible for analyzing lab trends and detecting outliers."""
    
    def __init__(self, model_name: str = "llama3-8b-8192"):
        """Initialize the Tracker Agent."""
        super().__init__(model_name)
    
    async def analyze_labs(self, patient_csv_data: List[LabResult]) -> Dict[str, Any]:
        """
        Analyze lab data using deterministic tools and AI synthesis.
        
        Args:
            patient_csv_data: List of LabResult objects from MIMIC CSV data
            
        Returns:
            Dictionary with trends, outlier warnings, and analysis summary
        """
        if not patient_csv_data:
            return {"trends": [], "outlier_warnings": [], "summary": "No lab data available"}
        
        # Group lab results by item_id for analysis
        lab_groups = {}
        for lab in patient_csv_data:
            if lab.item_id not in lab_groups:
                lab_groups[lab.item_id] = []
            lab_groups[lab.item_id].append(lab)
        
        trends = []
        outlier_warnings = []
        
        for lab_name, labs in lab_groups.items():
            if len(labs) < 2:
                continue
            
            # Sort by timestamp
            labs.sort(key=lambda x: x.timestamp)
            
            values = [lab.value for lab in labs]
            
            # Use deterministic tools
            trend = calculate_trend(values)
            
            # Check for outliers
            current_value = values[-1]
            historical_values = values[:-1]
            
            outlier_result = detect_lab_outlier(current_value, historical_values)
            
            trend_info = {
                "lab_name": lab_name,
                "trend": trend,
                "current_value": current_value,
                "data_points": len(labs)
            }
            
            if outlier_result["is_outlier"]:
                outlier_warnings.append(f"OUTLIER DETECTED: {lab_name} = {current_value}. {outlier_result['reason']}")
                trend_info["outlier_warning"] = outlier_result["reason"]
            
            trends.append(trend_info)
        
        # Generate summary using AI
        summary = await self._generate_lab_summary(trends, outlier_warnings)
        
        return {
            "trends": trends,
            "outlier_warnings": outlier_warnings,
            "summary": summary
        }
    
    async def _generate_lab_summary(self, trends: List[Dict], outlier_warnings: List[str]) -> str:
        """Generate AI summary of lab analysis."""
        system_prompt = """You are a clinical laboratory analyst summarizing lab trend analysis.

Create a concise summary of lab trends and any concerns. Focus on:
- Key trends (increasing/decreasing/stable)
- Any outlier warnings
- Clinical implications

Return JSON with this structure:
{
    "summary": "Brief clinical summary of lab findings"
}

Be medically accurate and concise."""
        
        trends_text = "; ".join([f"{t['lab_name']}: {t['trend']}" for t in trends])
        warnings_text = "; ".join(outlier_warnings) if outlier_warnings else "No outliers detected"
        
        user_prompt = f"""Summarize these lab findings:\nTrends: {trends_text}\nWarnings: {warnings_text}"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        try:
            response = await self._call_groq_with_retry(messages)
            result = json.loads(response)
            return result.get("summary", "Lab analysis completed")
        except Exception as exc:
            logger.error(f"Failed to generate lab summary: {exc}")
            return f"Lab analysis: {len(trends)} tests analyzed"


class ChiefSynthesisAgent(AIAgent):
    """Chief agent that synthesizes all data into final analysis report."""
    
    def __init__(self, model_name: str = "llama3-70b-8192"):
        """Initialize Chief Agent with more powerful model."""
        super().__init__(model_name)
    
    async def generate_patient_report(self, patient_id: str, symptoms: List[str], 
                                    lab_analysis: Dict[str, Any]) -> AnalysisReport:
        """
        Generate comprehensive sepsis risk assessment report.
        
        Args:
            patient_id: Patient identifier
            symptoms: List of extracted symptoms
            lab_analysis: Lab analysis results from Tracker Agent
            
        Returns:
            AnalysisReport matching exact Pydantic schema
        """
        # Retrieve relevant guidelines using RAG based on symptoms
        symptoms_query = "; ".join(symptoms) if symptoms else "sepsis assessment"
        guidelines_text = await retrieve_guideline(symptoms_query)
        
        # Prepare data for analysis
        symptoms_text = "; ".join(symptoms) if symptoms else "No symptoms reported"
        lab_summary = lab_analysis.get("summary", "No lab data available")
        outlier_warnings = lab_analysis.get("outlier_warnings", [])
        
        system_prompt = """You are a critical care AI specialist generating sepsis risk assessment.

Analyze the provided clinical data and generate a comprehensive sepsis risk assessment.
Consider:
- Extracted symptoms from clinical notes
- Lab trends and any outlier warnings
- Sepsis guidelines for evidence-based recommendations

CRITICAL: If any outlier warnings are present, you MUST mention the need for lab redraw in recommendations and NOT base diagnosis on that specific value.

Return JSON with this exact structure matching the AnalysisReport schema:
{
    "risk_score": 0.85,
    "detected_anomalies": ["Elevated Lactate", "Tachycardia"],
    "recommendations": ["Immediate blood culture", "Monitor lactate trends"]
}

Risk score guidelines:
- 0.0-0.2: Low risk
- 0.3-0.6: Moderate risk  
- 0.7-1.0: High risk

Be clinically accurate and prioritize patient safety."""
        
        user_prompt = f"""Patient ID: {patient_id}

SYMPTOMS: {symptoms_text}

LAB ANALYSIS: {lab_summary}

OUTLIER WARNINGS: {'; '.join(outlier_warnings) if outlier_warnings else 'None'}

SEPSIS GUIDELINES: {guidelines_text[:1000]}...

Generate comprehensive sepsis risk assessment."""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        try:
            response = await self._call_groq_with_retry(messages, temperature=0.2)
            result = json.loads(response)
            
            # Validate and enforce schema compliance
            risk_score = max(0.0, min(1.0, float(result.get("risk_score", 0.5))))
            detected_anomalies = result.get("detected_anomalies", [])
            recommendations = result.get("recommendations", [])
            
            # Ensure lists
            if not isinstance(detected_anomalies, list):
                detected_anomalies = [str(detected_anomalies)]
            if not isinstance(recommendations, list):
                recommendations = [str(recommendations)]
            
            # Add outlier warning to recommendations if present
            if outlier_warnings:
                recommendations.append("Repeat lab tests due to statistical outliers detected")
            
            # Ensure we have content
            if not detected_anomalies:
                detected_anomalies = ["Analysis completed"]
            if not recommendations:
                recommendations = ["Clinical assessment recommended"]
            
            return AnalysisReport(
                risk_score=risk_score,
                detected_anomalies=detected_anomalies,
                recommendations=recommendations
            )
            
        except Exception as exc:
            logger.error(f"Chief agent failed to generate analysis: {exc}")
            # Fallback to conservative analysis
            fallback_score = 0.7 if symptoms or outlier_warnings else 0.3
            return AnalysisReport(
                risk_score=fallback_score,
                detected_anomalies=["Analysis unavailable"],
                recommendations=["Immediate clinical assessment required"]
            )


async def generate_patient_report(patient_id: str, patient_data: PatientData) -> AnalysisReport:
    """
    Main orchestration function that generates comprehensive patient analysis report.
    
    This function coordinates all AI agents to analyze patient data and produce
    a sepsis risk assessment report using the hybrid architecture.
    
    Args:
        patient_id: Unique patient identifier
        patient_data: Complete patient clinical data from MIMIC CSVs
        
    Returns:
        AnalysisReport with risk assessment and clinical recommendations
        
    Raises:
        RuntimeError: If AI analysis fails or API is unavailable
    """
    logger.info(f"Starting AI analysis for patient {patient_id}")
    
    try:
        # Initialize agents
        parser = ParserAgent()
        tracker = TrackerAgent()
        chief = ChiefSynthesisAgent()
        
        # Execute analysis pipeline
        logger.info("Extracting symptoms from clinical notes...")
        # Parser uses mock notes file, not patient_data.clinical_notes
        symptoms = await parser.extract_symptoms("")
        
        logger.info("Analyzing lab trends from MIMIC CSV data...")
        lab_analysis = await tracker.analyze_labs(patient_data.lab_results)
        
        logger.info("Generating final analysis report...")
        final_report = await chief.generate_patient_report(
            patient_id=patient_id,
            symptoms=symptoms,
            lab_analysis=lab_analysis
        )
        
        logger.info(f"AI analysis completed for patient {patient_id} - Risk Score: {final_report.risk_score:.2f}")
        return final_report
        
    except Exception as exc:
        logger.error(f"Failed to generate patient report for {patient_id}: {exc}")
        raise RuntimeError(f"AI analysis failed: {exc}") from exc
