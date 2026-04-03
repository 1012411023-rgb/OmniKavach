import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientData, runAgentAnalysis } from '../services/api';
import PatientNote from '../components/PatientNote';
import PatientTimeline from '../components/PatientTimeline';
import RiskReport from '../components/RiskReport';
import {
  ArrowLeft, User, Cpu, CheckCircle2, Loader2, AlertTriangle,
  FileText, TrendingUp, Brain,
} from 'lucide-react';

const STATUS_COLOR = {
  critical: 'text-red-600 dark:text-red-400',
  warning:  'text-amber-600 dark:text-amber-400',
  stable:   'text-emerald-600 dark:text-emerald-400',
};

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [analysis, setAnalysis]       = useState('idle'); // idle | running | complete

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
    try {
      await runAgentAnalysis(id);
      setAnalysis('complete');
    } catch {
      setAnalysis('idle');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 dark:text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading patient data…</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 font-semibold text-sm">Patient data unavailable</p>
          <button onClick={() => navigate('/')} className="mt-3 text-xs text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
            ← Return to Ward
          </button>
        </div>
      </div>
    );
  }

  const sc = STATUS_COLOR[patient.status];

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Patient Info Bar */}
      <div className="flex-shrink-0 bg-slate-100/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700/50 px-5 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{patient.name}</h2>
              <span className={`text-[10px] font-mono font-bold ${sc}`}>● {patient.status.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono flex-wrap">
              <span>{patient.bed}</span><span>·</span>
              <span>{patient.age} yrs</span><span>·</span>
              <span>{patient.mrn}</span><span>·</span>
              <span>Admitted {patient.admitDate}</span><span>·</span>
              <span>{patient.physician}</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-700/40 border border-slate-300/60 dark:border-slate-600/40 flex-shrink-0">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Condition:</span>
            <span className="text-[10px] font-semibold text-slate-800 dark:text-white">{patient.condition}</span>
            <span className="ml-2 text-[10px] text-slate-400 dark:text-slate-500">Risk:</span>
            <span className={`text-sm font-black font-mono ${sc}`}>{patient.riskScore}%</span>
          </div>
        </div>

        {/* Run Analysis Button */}
        <button
          id="btn-run-analysis"
          onClick={handleAnalysis}
          disabled={analysis === 'running'}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all
            ${analysis === 'complete'
              ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : analysis === 'running'
              ? 'bg-blue-50 dark:bg-cyan-500/10 border-blue-200 dark:border-cyan-500/30 text-blue-500 dark:text-cyan-400 cursor-not-allowed'
              : 'bg-blue-50 dark:bg-cyan-500/15 border-blue-200 dark:border-cyan-500/40 text-blue-600 dark:text-cyan-400 hover:bg-blue-100 dark:hover:bg-cyan-500/25'
            }`}
        >
          {analysis === 'running'  && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running Agents…</>}
          {analysis === 'complete' && <><CheckCircle2 className="w-3.5 h-3.5" /> Analysis Complete</>}
          {analysis === 'idle'     && <><Cpu className="w-3.5 h-3.5" /> Run Agent Analysis</>}
        </button>
      </div>

      {/* 3-Column Content Area */}
      <div className="flex-1 grid grid-cols-3 min-h-0 overflow-hidden divide-x divide-slate-200 dark:divide-slate-700/50">

        {/* Column 1 — Raw Feed / Note Parser */}
        <div className="flex flex-col overflow-hidden">
          <div className="col-header">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-cyan-400 flex-shrink-0" />
            <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="col-header-title">Raw Feed — Note Parser</span>
            <span className="ml-auto text-[9px] font-mono text-slate-400 dark:text-slate-600">{patient.notes.length} notes</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {patient.notes.map((note) => (
              <PatientNote key={note.id} note={note} highlightedWords={patient.highlightedWords} />
            ))}
          </div>
        </div>

        {/* Column 2 — Temporal Trajectory */}
        <div className="flex flex-col overflow-hidden">
          <div className="col-header">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 flex-shrink-0" />
            <TrendingUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="col-header-title">Temporal Trajectory — 72h</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <PatientTimeline data={patient.timeline} />
          </div>
        </div>

        {/* Column 3 — Diagnostic Synthesis */}
        <div className="flex flex-col overflow-hidden">
          <div className="col-header">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />
            <Brain className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="col-header-title">Diagnostic Synthesis — AI</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <RiskReport synthesis={patient.aiSynthesis} riskScore={patient.riskScore} />
          </div>
        </div>

      </div>
    </div>
  );
}
