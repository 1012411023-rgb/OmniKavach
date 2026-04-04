"""
Family Communication Agent - Twist 1 Implementation
Translates technical medical reports into compassionate, bilingual family communication
"""

import json
import asyncio
from typing import Dict, Any, Optional
from groq import AsyncGroq
from datetime import datetime

class FamilyCommunicationAgent:
    """Transforms technical medical reports into compassionate family communication"""
    
    def __init__(self, groq_client: AsyncGroq):
        self.client = groq_client
        self.model = "llama-3.3-70b-versatile"
    
    async def generate_family_summary(
        self, 
        technical_report: Dict[str, Any],
        patient_name: str,
        hours_period: int = 12
    ) -> Dict[str, str]:
        """
        Generate compassionate, bilingual family communication
        
        Args:
            technical_report: Technical output from Chief Synthesis Agent
            patient_name: Patient identifier for personalization
            hours_period: Time window to summarize (default 12 hours)
            
        Returns:
            Dict with 'english' and 'regional' (Hindi) translations
        """
        
        # Extract key information from technical report
        risk_score = technical_report.get('risk_score', 0)
        anomalies = technical_report.get('detected_anomalies', [])
        recommendations = technical_report.get('recommendations', [])
        chief_summary = technical_report.get('chief_summary', '')
        
        # Determine risk level in simple terms
        if risk_score >= 0.75:
            risk_level_simple = "very high"
            urgency = "immediate medical attention"
        elif risk_score >= 0.5:
            risk_level_simple = "moderate"
            urgency = "close monitoring"
        else:
            risk_level_simple = "low"
            urgency = "routine care"
        
        # Simplify anomalies for family understanding
        simple_anomalies = []
        for anomaly in anomalies[:3]:  # Limit to top 3
            if 'lactate' in anomaly.lower():
                simple_anomalies.append("elevated lactate levels (indicator of stress)")
            elif 'fever' in anomaly.lower():
                simple_anomalies.append("fever or elevated temperature")
            elif 'heart rate' in anomaly.lower():
                simple_anomalies.append("irregular heart rate")
            else:
                simple_anomalies.append("changes in vital signs")
        
        # Simplify recommendations
        simple_recommendations = []
        for rec in recommendations[:3]:
            if 'antibiotics' in rec.lower():
                simple_recommendations.append("starting antibiotic treatment")
            elif 'monitor' in rec.lower():
                simple_recommendations.append("continuous monitoring of vital signs")
            elif 'consult' in rec.lower():
                simple_recommendations.append("specialist consultation")
            else:
                simple_recommendations.append("adjusting treatment plan")
        
        # Create the compassionate prompt
        prompt = f"""
You are a compassionate medical communicator. Your task is to explain a patient's condition to their family members in simple, caring language at an 8th-grade reading level.

PATIENT: {patient_name}
TIME PERIOD: Last {hours_period} hours
RISK LEVEL: {risk_level_simple} (score: {risk_score:.0%})
URGENCY: {urgency}

KEY FINDINGS:
{chr(10).join([f"• {finding}" for finding in simple_anomalies]) if simple_anomalies else "• Stable condition with no major concerns"}

RECOMMENDED ACTIONS:
{chr(10).join([f"• {action}" for action in simple_recommendations]) if simple_recommendations else "• Continue current care plan"}

IMPORTANT GUIDELINES:
1. Use warm, caring tone
2. Avoid medical jargon completely
3. Be honest but hopeful
4. Include reassurance where appropriate
5. Explain what the medical team is doing
6. Mention what family can do to help

RESPONSE FORMAT: Return a JSON object with exactly these keys:
{{
    "english": "[Your compassionate explanation in English]",
    "regional": "[Your compassionate explanation in Hindi language]"
}}

Do not add any explanations outside the JSON. Provide only the JSON response.
"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a compassionate medical communicator who translates complex medical information into simple, caring language for family members."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,  # Low temperature for consistency
                max_tokens=800,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Validate response structure
            if not isinstance(result, dict) or 'english' not in result or 'regional' not in result:
                raise ValueError("Invalid response structure from Family Communication Agent")
            
            return result
            
        except Exception as e:
            print(f"Family Communication Agent error: {str(e)}")
            # Fallback response
            return {
                "english": f"The medical team is closely monitoring {patient_name}. Over the last {hours_period} hours, we've observed {risk_level_simple} risk levels. The doctors are providing {urgency} and the family can help by staying informed and following the medical team's guidance.",
                "regional": f"मेडिकल टीम {patient_name} की निगरानी कर रही है। पिछले {hours_period} घंटों में, हमने {risk_level_simple} जोखिम स्तर देखा है। डॉक्टर {urgency} प्रदान कर रहे हैं और परिवार को जानकारी रखने और मेडिकल टीम के मार्गदर्शन का पालन करके मदद कर सकते हैं।"
            }

# Utility function for integration
async def create_family_communication(
    groq_client: AsyncGroq,
    technical_report: Dict[str, Any],
    patient_name: str
) -> Dict[str, str]:
    """Helper function to create family communication"""
    agent = FamilyCommunicationAgent(groq_client)
    return await agent.generate_family_summary(technical_report, patient_name)
