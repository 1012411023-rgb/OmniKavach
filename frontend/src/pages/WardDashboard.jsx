import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPatients } from '../services/api';
import { AlertTriangle, Activity, Users, Shield, RefreshCw, ChevronRight } from 'lucide-react';

const STATUS = {
  critical: {
    dot:    'bg-red-500 animate-pulse',
    border: 'border-red-200 dark:border-red-500/25 hover:border-red-300 dark:hover:border-red-400/40',
    glow:   'dark:hover:shadow-glow-red',
    badge:  'badge-critical',
    label:  'Critical',
  },
  warning: {
    dot:    'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-400/40',
    glow:   'dark:hover:shadow-glow-amber',
    badge:  'badge-warning',
    label:  'Warning',
  },
  stable: {
    dot:    'bg-emerald-500',
    border: 'border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600/60',
    glow:   '',
    badge:  'badge-stable',
    label:  'Stable',
  },
};

const riskColor = (s) => s >= 75 ? 'text-red-600 dark:text-red-400' : s >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
const riskBar   = (s) => s >= 75 ? 'bg-red-500'   : s >= 50 ? 'bg-amber-500'  : 'bg-emerald-500';

function PatientCard({ patient, onClick }) {
  const cfg = STATUS[patient.status];
  return (
    <button
      onClick={() => onClick(patient.id)}
      className={`w-full text-left bg-white dark:bg-slate-800 border rounded-xl p-4
        shadow-sm dark:shadow-lg transition-all duration-200 group cursor-pointer animate-slide-up
        ${cfg.border} ${cfg.glow}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500">{patient.bed}</span>
        </div>
        <span className={cfg.badge}>
          {patient.status === 'critical' && '⚠ '}{cfg.label}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors mb-0.5">
          {patient.name}
        </h3>
        <p className="text-[11px] text-slate-500">{patient.age} yrs · {patient.condition}</p>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">AI Risk Score</span>
          <span className={`text-xs font-black font-mono ${riskColor(patient.riskScore)}`}>
            {patient.riskScore}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${riskBar(patient.riskScore)}`}
            style={{ width: `${patient.riskScore}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-500 transition-colors">
        View Detail <ChevronRight className="w-3 h-3" />
      </div>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border rounded-xl p-4 shadow-sm dark:shadow-none ${color.border}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color.icon}`} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${color.icon}`}>{label}</span>
      </div>
      <span className={`text-3xl font-black ${color.value}`}>{value}</span>
    </div>
  );
}

export default function WardDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllPatients();
      setPatients(res.data);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => { load(); }, []);

  const counts = {
    critical: patients.filter((p) => p.status === 'critical').length,
    warning:  patients.filter((p) => p.status === 'warning').length,
    stable:   patients.filter((p) => p.status === 'stable').length,
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Global Ward Monitor</h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
            ICU Bay A & B —{' '}
            <span className="font-mono text-slate-500 dark:text-slate-400">
              Updated {lastRefresh.toLocaleTimeString('en-IN', { hour12: false })}
            </span>
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg
            bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50
            hover:border-blue-300 dark:hover:border-cyan-500/40
            text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400
            text-xs transition-all shadow-sm dark:shadow-none"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}         label="Total"    value={patients.length}
          color={{ border: 'border-slate-200 dark:border-slate-700/50', icon: 'text-slate-400', value: 'text-slate-900 dark:text-white' }} />
        <StatCard icon={AlertTriangle} label="Critical" value={counts.critical}
          color={{ border: 'border-red-200 dark:border-red-500/20', icon: 'text-red-500 dark:text-red-400', value: 'text-red-600 dark:text-red-400' }} />
        <StatCard icon={Activity}      label="Warning"  value={counts.warning}
          color={{ border: 'border-amber-200 dark:border-amber-500/20', icon: 'text-amber-500 dark:text-amber-400', value: 'text-amber-600 dark:text-amber-400' }} />
        <StatCard icon={Shield}        label="Stable"   value={counts.stable}
          color={{ border: 'border-emerald-200 dark:border-emerald-500/20', icon: 'text-emerald-500 dark:text-emerald-400', value: 'text-emerald-600 dark:text-emerald-400' }} />
      </div>

      {/* Patient Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 animate-pulse space-y-3">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => (
            <PatientCard key={p.id} patient={p} onClick={(id) => navigate(`/patient/${id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
