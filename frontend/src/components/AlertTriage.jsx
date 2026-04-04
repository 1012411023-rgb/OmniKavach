import { AlertTriangle, ShieldAlert, Activity, CheckCircle2, Ban, Eye, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { triageAlerts } from '../services/api';

const AlertTriage = ({ patientId, patientName }) => {
  const [triageData, setTriageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTriage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await triageAlerts(patientId);
      setTriageData(result);
    } catch (err) {
      setError(err.message || 'Failed to triage alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertLevelTheme = (level) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50 dark:bg-red-950',
          border: 'border-red-200 dark:border-red-900',
          text: 'text-red-900 dark:text-red-100',
          icon: <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />,
          badge: 'bg-red-600 text-white',
        };
      case 'MONITOR':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950',
          border: 'border-amber-200 dark:border-amber-900',
          text: 'text-amber-900 dark:text-amber-100',
          icon: <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          badge: 'bg-amber-600 text-white',
        };
      case 'SUPPRESSED_ERROR':
        return {
          bg: 'bg-slate-50 dark:bg-slate-900',
          border: 'border-slate-200 dark:border-slate-700',
          text: 'text-slate-900 dark:text-slate-100',
          icon: <Ban className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
          badge: 'bg-slate-600 text-white',
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950',
          border: 'border-blue-200 dark:border-blue-900',
          text: 'text-blue-900 dark:text-blue-100',
          icon: <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          badge: 'bg-blue-600 text-white',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-slate-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Alert Triage</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Analyzing alerts...</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-4/5 animate-pulse" />
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-3/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Alert Triage</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Analysis failed</p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button
            onClick={runTriage}
            className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!triageData) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Alert Triage</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Prevent alert fatigue</p>
          </div>
        </div>
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Run intelligent alert triage analysis
          </p>
          <button
            onClick={runTriage}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowRight className="w-3 h-3" />
            Run Triage
          </button>
        </div>
      </div>
    );
  }

  const theme = getAlertLevelTheme(triageData.alert_level);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {theme.icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Alert Triage Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {patientName || `Patient ${patientId}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-[10px] font-medium ${theme.badge}`}>
            {triageData.alert_level}
          </span>
          <button
            onClick={runTriage}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Re-run triage"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Alert Level Banner */}
      <div className={`${theme.bg} ${theme.border} border rounded-lg p-4 mb-4`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {theme.icon}
          </div>
          <div className="flex-1">
            <h4 className={`text-sm font-medium ${theme.text} mb-1`}>
              Alert Level: {triageData.alert_level}
            </h4>
            <p className={`text-xs ${theme.text} opacity-80`}>
              {triageData.alert_level === 'CRITICAL' && 'All triad conditions met - immediate attention required'}
              {triageData.alert_level === 'MONITOR' && 'Incomplete triad - alert suppressed to prevent fatigue'}
              {triageData.alert_level === 'SUPPRESSED_ERROR' && 'Lab anomaly detected - alert suppressed pending redraw'}
            </p>
          </div>
        </div>
      </div>

      {/* Triage Results */}
      <div className="space-y-3">
        {/* Diagnosis Flag */}
        {triageData.diagnosis_flag && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Diagnosis Flag
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              {triageData.diagnosis_flag}
            </p>
          </div>
        )}

        {/* Triad Analysis */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Triad Analysis
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {triageData.triad_analysis}
          </p>
        </div>

        {/* Guideline Citation */}
        <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-3 border border-emerald-200 dark:border-emerald-900">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Guideline Citation
            </span>
          </div>
          <p className="text-xs text-emerald-800 dark:text-emerald-200 font-mono leading-relaxed">
            {triageData.guideline_citation}
          </p>
        </div>

        {/* Recommended Action */}
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-200 dark:border-blue-900">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Recommended Action
            </span>
          </div>
          <p className="text-xs text-blue-800 dark:text-blue-200 font-mono leading-relaxed">
            {triageData.recommended_action}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>OmniKavach AI</span>
          <span>{new Date(triageData.generated_at).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default AlertTriage;
