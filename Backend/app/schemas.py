from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class LabResult(BaseModel):
    """Laboratory test result from MIMIC-III data."""
    
    item_id: str = Field(
        ...,
        description="Laboratory item identifier (e.g., 'Lactate', 'Glucose')",
        example="Lactate"
    )
    value: float = Field(
        ...,
        description="Numerical value of the lab result",
        example=3.5
    )
    unit: str = Field(
        ...,
        description="Unit of measurement for the lab value",
        example="mmol/L"
    )
    timestamp: datetime = Field(
        ...,
        description="Timestamp when the lab result was recorded",
        example="2024-01-15T10:30:00Z"
    )


class VitalSign(BaseModel):
    """Vital sign measurement from patient monitoring."""
    
    type: str = Field(
        ...,
        description="Type of vital sign being measured",
        example="Heart Rate"
    )
    value: float = Field(
        ...,
        description="Numerical value of the vital sign",
        example=92.5
    )
    timestamp: datetime = Field(
        ...,
        description="Timestamp when the vital sign was recorded",
        example="2024-01-15T10:30:00Z"
    )


class ClinicalNote(BaseModel):
    """Clinical or nursing note from patient record."""
    
    note_id: str = Field(
        ...,
        description="Unique identifier for the clinical note",
        example="NOTE_12345"
    )
    text_content: str = Field(
        ...,
        description="Full text content of the clinical note",
        example="Patient presents with signs of infection and elevated lactate levels."
    )
    category: str = Field(
        ...,
        description="Category or type of note",
        example="Nursing"
    )


class PatientData(BaseModel):
    """Container model for a patient's clinical data."""
    
    lab_results: List[LabResult] = Field(
        default_factory=list,
        description="List of laboratory test results",
        example=[]
    )
    vital_signs: List[VitalSign] = Field(
        default_factory=list,
        description="List of vital sign measurements",
        example=[]
    )
    clinical_notes: List[ClinicalNote] = Field(
        default_factory=list,
        description="List of clinical notes",
        example=[]
    )


class AnalysisReport(BaseModel):
    """AI-generated analysis report for sepsis risk assessment."""
    
    risk_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Sepsis risk score ranging from 0.0 (no risk) to 1.0 (critical risk)",
        example=0.78
    )
    detected_anomalies: List[str] = Field(
        default_factory=list,
        description="List of detected clinical anomalies",
        example=["Elevated Lactate", "Tachycardia", "Fever"]
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Clinical recommendations based on the analysis",
        example=["Consider blood culture", "Monitor lactate trends", "Review antibiotic coverage"]
    )
    safety_disclaimer: str = Field(
        default="This is a decision-support tool only. Clinical judgment and direct patient assessment take priority.",
        description="Important safety disclaimer for clinical use",
        example="This is a decision-support tool only. Clinical judgment and direct patient assessment take priority."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "risk_score": 0.78,
                "detected_anomalies": ["Elevated Lactate", "Tachycardia"],
                "recommendations": ["Monitor vitals", "Consider labs"],
                "safety_disclaimer": "This is a decision-support tool only. Clinical judgment and direct patient assessment take priority."
            }
        }
