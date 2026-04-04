// Simple API test script
// Run this in browser console on http://localhost:5174

async function testAPI() {
  try {
    console.log('Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:8000/health');
    const healthData = await healthResponse.json();
    console.log('Health:', healthData);
    
    console.log('Testing patients endpoint...');
    const patientsResponse = await fetch('http://localhost:8000/api/v1/patients');
    const patientsData = await patientsResponse.json();
    console.log('Patients:', patientsData);
    console.log('Number of patients:', patientsData.length);
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Auto-run test
testAPI();
