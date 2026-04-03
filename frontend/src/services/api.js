import axios from 'axios';
import { PATIENTS } from '../data/mockData';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`[OmniKavach] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

const mockDelay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

export const getAllPatients = async () => {
  await mockDelay(500);
  return {
    data: PATIENTS.map(({ id, bed, name, age, status, condition, riskScore }) => ({
      id, bed, name, age, status, condition, riskScore,
    })),
  };
};

export const getPatientData = async (id) => {
  await mockDelay(800);
  const patient = PATIENTS.find((p) => p.id === id);
  if (!patient) throw new Error(`Patient ${id} not found`);
  return { data: patient };
};

export const runAgentAnalysis = async (id) => {
  await mockDelay(2500);
  return {
    data: {
      status: 'complete',
      agentId: `omnk-${Date.now()}`,
      patientId: id,
      agentsRun: 6,
      totalTime: '2.4s',
      timestamp: new Date().toISOString(),
    },
  };
};

export default apiClient;
