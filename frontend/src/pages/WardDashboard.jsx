import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPatients } from '../services/api';
import { ChevronRight, RefreshCw } from 'lucide-react';

const STATUS_DOT = {
  critical: 'bg-[var(--danger)]',
  warning: 'bg-[var(--warning)]',
  stable: 'bg-[var(--success)]',
};

const RISK_COLOR = (s) =>
  s >= 75 ? 'text-[var(--danger)]' : s >= 50 ? 'text-[var(--warning)]' : 'text-[var(--success)]';

const RISK_BAR = (s) =>
  s >= 75 ? 'bg-[var(--danger)]' : s >= 50 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]';

function PatientCard({ patient, onClick }) {
  return (
    <button
      onClick={() => onClick(patient.id)}
      className="surface w-full text-left p-5 group cursor-pointer
        hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${STATUS_DOT[patient.status]} ${patient.status === 'critical' ? 'animate-pulse' : ''}`} />
          <span className="text-[11px] font-medium text-[var(--text-tertiary)] tracking-wide uppercase">
            {patient.bed}
          </span>
        </div>
        <span className={`badge-${patient.status}`}>
          {patient.status}
        </span>
      </div>

      {/* Name + meta */}
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors">
        {patient.name}
      </h3>
      <p className="text-[12px] text-[var(--text-secondary)] mb-5">
        {patient.age} yrs · {patient.condition}
      </p>

      {/* Risk score */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-[11px] font-medium text-[var(--text-tertiary)]">Risk Score</span>
          <span className={`text-[13px] font-bold tabular-nums ${RISK_COLOR(patient.riskScore)}`}>
            {patient.riskScore}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${RISK_BAR(patient.riskScore)}`}
            style={{ width: `${patient.riskScore}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-end gap-1 text-[11px] text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors">
        View <ChevronRight className="w-3 h-3" />
      </div>
    </button>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 surface">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <div>
        <p className="text-[20px] font-bold tracking-tight text-[var(--text-primary)] tabular-nums leading-none">
          {value}
        </p>
        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function WardDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllPatients();
      setPatients(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const counts = {
    critical: patients.filter((p) => p.status === 'critical').length,
    warning: patients.filter((p) => p.status === 'warning').length,
    stable: patients.filter((p) => p.status === 'stable').length,
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-5">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)] leading-tight">
            ICU Ward Monitor
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            {patients.length} patients monitored · Bay A & B
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium
            text-[var(--text-secondary)] hover:text-[var(--text-primary)]
            bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-hover)]
            transition-all shadow-sm hover:shadow active:scale-[0.98]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatPill label="Total Patients" value={patients.length} color="bg-[var(--accent)]" />
        <StatPill label="Critical" value={counts.critical} color="bg-[var(--danger)]" />
        <StatPill label="Warning" value={counts.warning} color="bg-[var(--warning)]" />
        <StatPill label="Stable" value={counts.stable} color="bg-[var(--success)]" />
      </div>

      {/* Patient Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="surface p-5 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="h-3 bg-[var(--bg-secondary)] rounded w-16" />
                <div className="h-5 bg-[var(--bg-secondary)] rounded-full w-16" />
              </div>
              <div className="h-4 bg-[var(--bg-secondary)] rounded w-2/3" />
              <div className="h-3 bg-[var(--bg-secondary)] rounded w-1/3" />
              <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {patients.map((p, i) => (
            <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
              <PatientCard patient={p} onClick={(id) => navigate(`/patient/${id}`)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
