import { useState, useEffect } from 'react';

export default function SimpleTest() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        setLoading(true);
        console.log('Testing API connection...');
        
        // Test health endpoint
        const healthResponse = await fetch('http://localhost:8000/health');
        const healthData = await healthResponse.json();
        console.log('Health response:', healthData);
        
        // Test patients endpoint
        const patientsResponse = await fetch('http://localhost:8000/api/v1/patients');
        const patientsData = await patientsResponse.json();
        console.log('Patients response:', patientsData);
        
        setData({
          health: healthData,
          patients: patientsData,
          patientCount: patientsData.length
        });
        
      } catch (err) {
        console.error('API test error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">API Test</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4 text-red-600">API Test Error</h2>
        <p className="text-red-500">{error}</p>
        <p className="text-sm text-gray-600 mt-2">
          Make sure the backend is running on http://localhost:8000
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">API Test Results</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Health Status</h3>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(data.health, null, 2)}
        </pre>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Patients Data</h3>
        <p className="mb-2">Found {data.patientCount} patients</p>
        <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
          {JSON.stringify(data.patients, null, 2)}
        </pre>
      </div>
      
      {data.patients && data.patients.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Sample Patient Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.patients.slice(0, 3).map((patient) => (
              <div key={patient.id} className="border rounded-lg p-4">
                <h4 className="font-semibold">{patient.name}</h4>
                <p className="text-sm">Bed: {patient.bed}</p>
                <p className="text-sm">Age: {patient.age}</p>
                <p className="text-sm">Status: {patient.status}</p>
                <p className="text-sm">Risk: {patient.riskScore}</p>
                <p className="text-sm">Condition: {patient.condition}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
