import { useState, useEffect } from 'react';
import { getAllPatients, formatPatientForUI, getHealthStatus } from '../services/api';

export default function SimpleDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[SimpleDashboard] Loading patients...');
      const res = await getAllPatients();
      console.log('[SimpleDashboard] Raw patients response:', res);
      
      if (!Array.isArray(res)) {
        throw new Error('Invalid response format: expected array');
      }
      
      const formattedPatients = res.map(formatPatientForUI);
      console.log('[SimpleDashboard] Formatted patients:', formattedPatients);
      setPatients(formattedPatients);
      
    } catch (error) {
      console.error('[SimpleDashboard] Failed to load patients:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Simple Dashboard</h2>
        <p>Loading patients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
        <p className="text-red-500">{error}</p>
        <button onClick={load} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Simple Dashboard</h2>
        <p className="text-sm text-gray-600">
          Debug: Loading={loading.toString()}, Patients={patients.length}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <div key={patient.id} className="border rounded-lg p-4 bg-white shadow">
            <h3 className="font-semibold text-lg">{patient.name}</h3>
            <p className="text-sm text-gray-600">Bed: {patient.bed}</p>
            <p className="text-sm text-gray-600">Age: {patient.age}</p>
            <p className="text-sm text-gray-600">Status: {patient.status}</p>
            <p className="text-sm text-gray-600">Condition: {patient.condition}</p>
            <p className="text-sm font-medium">Risk Score: {patient.riskScore}%</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${patient.riskScore}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
