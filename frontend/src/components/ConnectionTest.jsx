import { useState, useEffect } from 'react';

export default function ConnectionTest() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      setLoading(true);
      const testResults = {};

      // Test 0: Simple test endpoint
      try {
        console.log('Testing simple endpoint...');
        const simpleResponse = await fetch('http://localhost:8000/test-simple');
        const simpleData = await simpleResponse.json();
        testResults.simple = { success: true, data: simpleData };
        console.log('Simple test success:', simpleData);
      } catch (error) {
        testResults.simple = { success: false, error: error.message };
        console.error('Simple test failed:', error);
      }

      // Test 1: Direct fetch to health endpoint
      try {
        console.log('Testing direct fetch to health...');
        const healthResponse = await fetch('http://localhost:8000/health');
        const healthData = await healthResponse.json();
        testResults.health = { success: true, data: healthData };
        console.log('Health test success:', healthData);
      } catch (error) {
        testResults.health = { success: false, error: error.message };
        console.error('Health test failed:', error);
      }

      // Test 2: Direct fetch to patients endpoint
      try {
        console.log('Testing direct fetch to patients...');
        const patientsResponse = await fetch('http://localhost:8000/api/v1/patients');
        const patientsData = await patientsResponse.json();
        testResults.patients = { success: true, data: patientsData, count: patientsData.length };
        console.log('Patients test success:', patientsData.length, 'patients');
      } catch (error) {
        testResults.patients = { success: false, error: error.message };
        console.error('Patients test failed:', error);
      }

      // Test 3: Axios request to patients endpoint
      try {
        console.log('Testing axios to patients...');
        const axios = (await import('axios')).default;
        const response = await axios.get('http://localhost:8000/api/v1/patients', { timeout: 5000 });
        testResults.axios = { success: true, data: response.data, count: response.data.length };
        console.log('Axios test success:', response.data.length, 'patients');
      } catch (error) {
        testResults.axios = { success: false, error: error.message };
        console.error('Axios test failed:', error);
      }

      setResults(testResults);
      setLoading(false);
    };

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Connection Test</h2>
        <p>Testing connection to backend...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Connection Test Results</h2>
      
      <div className="space-y-6">
        <div className={`p-4 rounded ${results.simple?.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-semibold mb-2">Simple Test Endpoint</h3>
          {results.simple?.success ? (
            <div>
              <p className="text-green-700">✅ Success</p>
              <pre className="text-sm bg-white p-2 rounded mt-2">
                {JSON.stringify(results.simple.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <p className="text-red-700">❌ Failed</p>
              <p className="text-red-600">{results.simple?.error}</p>
            </div>
          )}
        </div>

        <div className={`p-4 rounded ${results.health?.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-semibold mb-2">Health Endpoint (Direct Fetch)</h3>
          {results.health?.success ? (
            <div>
              <p className="text-green-700">✅ Success</p>
              <pre className="text-sm bg-white p-2 rounded mt-2">
                {JSON.stringify(results.health.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <p className="text-red-700">❌ Failed</p>
              <p className="text-red-600">{results.health?.error}</p>
            </div>
          )}
        </div>

        <div className={`p-4 rounded ${results.patients?.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-semibold mb-2">Patients Endpoint (Direct Fetch)</h3>
          {results.patients?.success ? (
            <div>
              <p className="text-green-700">✅ Success - {results.patients.count} patients</p>
              <pre className="text-sm bg-white p-2 rounded mt-2 max-h-40 overflow-auto">
                {JSON.stringify(results.patients.data.slice(0, 2), null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <p className="text-red-700">❌ Failed</p>
              <p className="text-red-600">{results.patients?.error}</p>
            </div>
          )}
        </div>

        <div className={`p-4 rounded ${results.axios?.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-semibold mb-2">Patients Endpoint (Axios)</h3>
          {results.axios?.success ? (
            <div>
              <p className="text-green-700">✅ Success - {results.axios.count} patients</p>
              <pre className="text-sm bg-white p-2 rounded mt-2 max-h-40 overflow-auto">
                {JSON.stringify(results.axios.data.slice(0, 2), null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <p className="text-red-700">❌ Failed</p>
              <p className="text-red-600">{results.axios?.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
