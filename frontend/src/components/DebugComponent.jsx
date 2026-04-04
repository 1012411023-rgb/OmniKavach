import { useState, useEffect } from 'react';
import { getAllPatients, getHealthStatus } from '../services/api';

export default function DebugComponent() {
  const [status, setStatus] = useState('Loading...');
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setStatus('Testing health...');
        const health = await getHealthStatus();
        console.log('Health status:', health);
        setStatus(`Health: ${health.status}`);
        
        setStatus('Loading patients...');
        const patientsData = await getAllPatients();
        console.log('Patients data:', patientsData);
        setPatients(patientsData);
        setStatus(`Loaded ${patientsData.length} patients`);
        
      } catch (error) {
        console.error('Debug error:', error);
        setError(error.message);
        setStatus('Error');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg m-4">
      <h2 className="text-xl font-bold mb-4">Debug Component</h2>
      <p className="mb-2">Status: {status}</p>
      {error && <p className="text-red-500 mb-2">Error: {error}</p>}
      {patients.length > 0 && (
        <div>
          <p className="font-semibold mb-2">Patients ({patients.length}):</p>
          <ul className="list-disc pl-5">
            {patients.slice(0, 3).map(patient => (
              <li key={patient.id}>
                {patient.name} - {patient.status} - {patient.bed}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
