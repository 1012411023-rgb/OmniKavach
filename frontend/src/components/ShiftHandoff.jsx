import { Users, Clock, AlertTriangle, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { generateShiftHandoff } from '../services/api';

const ShiftHandoff = ({ patientId, patientName }) => {
  const [handoffData, setHandoffData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateHandoff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateShiftHandoff(patientId);
      setHandoffData(result);
    } catch (err) {
      setError(err.message || 'Failed to generate handoff summary');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Users className="w-4 h-4 text-slate-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Shift Handoff</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Generating summary...</p>
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
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Shift Handoff</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Generation failed</p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button
            onClick={generateHandoff}
            className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!handoffData) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Shift Handoff</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cognitive handoff summary</p>
          </div>
        </div>
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Generate a concise 3-bullet shift handoff
          </p>
          <button
            onClick={generateHandoff}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowRight className="w-3 h-3" />
            Generate Handoff
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Users className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Shift Handoff Summary</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              12-hour handoff for {patientName || `Patient ${patientId}`}
            </p>
          </div>
        </div>
        <button
          onClick={generateHandoff}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Regenerate"
        >
          <RefreshCw className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Handoff Summary */}
      <div className="space-y-3">
        {handoffData.handover_summary.map((bullet, index) => (
          <div key={index} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
            <div className="flex-shrink-0 w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {index + 1}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
              {bullet}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>OmniKavach AI</span>
          <span>{new Date(handoffData.generated_at).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ShiftHandoff;
