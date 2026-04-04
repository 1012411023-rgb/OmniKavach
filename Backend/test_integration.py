import asyncio
from app.rag import initialize_vector_db
from app.data_loader import get_mimic_patient
from app.engine import analyze_patient_data

async def test_complete_integration():
    print('🚀 Testing Complete OmniKavach Integration...')
    
    # 1. Initialize RAG system
    print('📚 Step 1: Initializing RAG system...')
    rag_success = initialize_vector_db()
    status = "✅ Active" if rag_success else "❌ Failed"
    print(f'RAG Status: {status}')
    
    # 2. Test patient data loading
    print('📊 Step 2: Testing MIMIC-III data loading...')
    patient = get_mimic_patient(10006)
    print(f'Patient 10006: {len(patient.lab_results)} labs, {len(patient.vital_signs)} vitals')
    
    # 3. Test AI analysis pipeline
    print('🤖 Step 3: Testing AI analysis pipeline...')
    try:
        result = await analyze_patient_data(patient)
        print(f'✅ Analysis completed - Risk Score: {result.risk_score:.2f}')
        print(f'🔍 Anomalies detected: {len(result.detected_anomalies)}')
        print(f'💡 Recommendations: {len(result.recommendations)}')
    except Exception as e:
        print(f'⚠️ AI Analysis: {str(e)} (Expected if no API key)')
    
    print('🎉 Backend integration test completed!')

if __name__ == "__main__":
    asyncio.run(test_complete_integration())
