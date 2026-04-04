import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientData, runAgentAnalysis, formatAnalysisForUI } from '../services/api';
import PatientNote from '../components/PatientNote';
import NoteParser from '../components/NoteParser';
import PatientTimeline from '../components/PatientTimeline';
import RiskReport from '../components/RiskReport';
import FamilyCommunication from '../components/FamilyCommunication';
import OutlierAlert from '../components/OutlierAlert';
import ShiftHandoff from '../components/ShiftHandoff';
import AlertTriage from '../components/AlertTriage';
import {
  ArrowLeft, Cpu, CheckCircle2, Loader2, AlertTriangle, Upload,
  FileText, TrendingUp, Brain, Heart, Users, ShieldAlert,
} from 'lucide-react';

const STATUS_STYLES = {
  critical: { text: 'text-[var(--danger)]', bg: 'bg-[var(--danger-bg)]' },
  warning: { text: 'text-[var(--warning)]', bg: 'bg-[var(--warning-bg)]' },
  stable: { text: 'text-[var(--success)]', bg: 'bg-[var(--success-bg)]' },
};

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState('idle');
  const [analysisData, setAnalysisData] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [outlierAlert, setOutlierAlert] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPatientData(id)
      .then((res) => setPatient(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnalysis = async () => {
    setAnalysis('running');
    setAnalysisData(null);
    setOutlierAlert(null);
    setAnalysisError(null);
    try {
      const result = await runAgentAnalysis(id, { includeTimeline: true, includeRAG: true });
      const formattedAnalysis = formatAnalysisForUI(result);
      setAnalysisData(formattedAnalysis);
      if (result.outlierData) {
        setOutlierAlert(result.outlierData);
      } else if (result.status === 'WAITING FOR REDRAW') {
        setOutlierAlert({
          is_outlier: true, severity: 'critical',
          reason: 'PROBABLE MISLABELED RESULT / SENSOR ERROR',
          details: 'Lab result contradicts 3-day baseline. Waiting for redraw.',
          recommendation: 'WAITING FOR REDRAW',
        });
      }
      setAnalysis('complete');
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis('error');
      setAnalysisError(error.message || 'Analysis failed. Please try again.');
    }
  };

  const handleRedrawRequest = async () => {
    setOutlierAlert({ ...outlierAlert, is_outlier: false, reason: 'Lab redraw requested' });
    setTimeout(() => {
      setOutlierAlert(null);
      handleAnalysis();
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-[var(--text-secondary)]">Loading patient data</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center surface px-8 py-8 max-w-sm">
          <AlertTriangle className="w-6 h-6 text-[var(--danger)] mx-auto mb-3" />
          <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1">Patient data unavailable</p>
          <p className="text-[12px] text-[var(--text-secondary)] mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-[13px] text-[var(--accent)] hover:underline"
          >
            Return to Ward
          </button>
        </div>
      </div>
    );
  }

  const st = STATUS_STYLES[patient.status] || STATUS_STYLES.stable;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-5 pt-4 pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-[18px] font-semibold text-[var(--text-primary)] tracking-tight">
                  {patient.name}
                </h2>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${st.text} ${st.bg}`}>
                  {patient.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)] mt-0.5 flex-wrap">
                <span>{patient.bed}</span>
                <span className="text-[var(--text-tertiary)]">·</span>
                <span>{patient.age} yrs</span>
                <span className="text-[var(--text-tertiary)]">·</span>
                <span>{patient.mrn}</span>
                <span className="text-[var(--text-tertiary)]">·</span>
                <span>{patient.physician}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Condition + Risk */}
            <div className="hidden lg:flex items-center gap-3 text-[12px] text-[var(--text-secondary)]">
              <span>{patient.condition}</span>
              <span className="text-[var(--text-tertiary)]">·</span>
              <span className={`font-bold tabular-nums ${st.text}`}>{patient.riskScore}%</span>
            </div>

            {/* Analysis button */}
            <button
              id="btn-run-analysis"
              onClick={handleAnalysis}
              disabled={analysis === 'running'}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all active:scale-[0.98]
                ${analysis === 'complete'
                  ? 'bg-[var(--success-bg)] text-[var(--success)]'
                  : analysis === 'running'
                  ? 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] cursor-not-allowed'
                  : 'bg-[var(--accent)] text-white hover:opacity-90'
                }`}
            >
              {analysis === 'running' && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>}
              {analysis === 'complete' && <><CheckCircle2 className="w-3.5 h-3.5" /> Complete</>}
              {analysis === 'error' && <><AlertTriangle className="w-3.5 h-3.5" /> Retry</>}
              {analysis === 'idle' && <><Cpu className="w-3.5 h-3.5" /> Run Analysis</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Outlier Alert ── */}
      {outlierAlert && (
        <div className="px-5">
          <OutlierAlert
            outlierData={outlierAlert}
            onRedrawRequest={handleRedrawRequest}
            isLoading={analysis === 'running'}
          />
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-1">
          {[
            { key: 'analysis', icon: Brain, label: 'Analysis' },
            { key: 'family', icon: Heart, label: 'Family' },
            { key: 'handoff', icon: Users, label: 'Handoff' },
            { key: 'triage', icon: ShieldAlert, label: 'Triage' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all
                ${activeTab === tab.key
                  ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-h-0 px-5 pb-5">
        {activeTab === 'analysis' ? (
          <div className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Left: Notes + Parser */}
            <div className="surface overflow-hidden flex flex-col min-h-[320px]">
              <div className="col-header">
                <FileText className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                <span className="col-header-title">Clinical Notes</span>
                <span className="ml-auto text-[10px] font-mono text-[var(--text-tertiary)]">
                  {patient.notes.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {patient.notes.map((note) => (
                  <PatientNote key={note.id} note={note} highlightedWords={patient.highlightedWords} />
                ))}
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Attach
                  </span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
                <NoteParser patientId={parseInt(id)} />
              </div>
            </div>

            {/* Middle: Timeline */}
            <div className="surface overflow-hidden flex flex-col min-h-[320px]">
              <div className="col-header">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                <span className="col-header-title">Temporal Trajectory</span>
                <span className="ml-auto text-[10px] font-mono text-[var(--text-tertiary)]">72h</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <PatientTimeline data={patient.timeline} />
              </div>
            </div>

            {/* Right: AI Analysis */}
            <div className="surface overflow-hidden flex flex-col min-h-[320px]">
              <div className="col-header">
                <Brain className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                <span className="col-header-title">AI Diagnostic</span>
                <span className="ml-auto text-[10px] font-mono text-[var(--text-tertiary)]">
                  {analysis === 'complete' ? '✓' : analysis === 'running' ? '...' : '—'}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <RiskReport
                  analysisData={analysisData}
                  isLoading={analysis === 'running'}
                  patientId={parseInt(id)}
                  error={analysisError}
                />
              </div>
            </div>
          </div>
        ) : activeTab === 'handoff' ? (
          <div className="h-full min-h-0 overflow-y-auto">
            <ShiftHandoff
              patientId={parseInt(id)}
              patientName={patient?.name}
            />
          </div>
        ) : activeTab === 'triage' ? (
          <div className="h-full min-h-0 overflow-y-auto">
            <AlertTriage
              patientId={parseInt(id)}
              patientName={patient?.name}
            />
          </div>
        ) : (
          <div className="h-full min-h-0 overflow-y-auto">
            <FamilyCommunication
              familyData={analysisData?.family_communication}
              isLoading={analysis === 'running'}
              patientName={patient?.name || `Patient ${id}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
