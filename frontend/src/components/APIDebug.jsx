import { useState, useEffect } from 'react';

export default function APIDebug() {
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testAPI = async () => {
      addLog('Starting API test...');
      
      // Test 1: Direct fetch to mock endpoint
      try {
        addLog('Testing direct fetch to mock endpoint...');
        const response = await fetch('http://localhost:8000/api/v1/patients-mock');
        const data = await response.json();
        addLog(`✅ Direct fetch success: ${data.length} patients`);
      } catch (error) {
        addLog(`❌ Direct fetch failed: ${error.message}`);
      }

      // Test 2: Axios call to mock endpoint
      try {
        addLog('Testing Axios call to mock endpoint...');
        const axios = (await import('axios')).default;
        const response = await axios.get('http://localhost:8000/api/v1/patients-mock', { timeout: 5000 });
        addLog(`✅ Axios success: ${response.data.length} patients`);
      } catch (error) {
        addLog(`❌ Axios failed: ${error.message}`);
      }

      // Test 3: Import and test getAllPatients function
      try {
        addLog('Testing getAllPatients function...');
        const { getAllPatients } = await import('../services/api');
        const patients = await getAllPatients();
        addLog(`✅ getAllPatients success: ${patients.length} patients`);
      } catch (error) {
        addLog(`❌ getAllPatients failed: ${error.message}`);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">API Debug Logs</h2>
      <div className="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
        {logs.map((log, index) => (
          <div key={index} className="text-sm font-mono mb-1">
            {log}
          </div>
        ))}
      </div>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Reload Page
      </button>
    </div>
  );
}
