import { AlertTriangle, RefreshCw, Clock, ShieldAlert, Ban, TrendingUp, Beaker } from 'lucide-react';

const OutlierAlert = ({ outlierData, onRedrawRequest, isLoading }) => {
  if (!outlierData || !outlierData.is_outlier) return null;

  const baseline = outlierData.baseline;
  const problematicValues = outlierData.problematic_values || [];
  const allValues = [
    ...(baseline?.values || []).map((v) => v.value),
    ...problematicValues.map((v) => v.value),
  ];
  const maxVal = Math.max(...allValues, 1);

  return (
    <div className="surface overflow-hidden mb-4" style={{ borderColor: 'var(--danger)', borderWidth: '1px' }}>
      {/* Banner */}
      <div className="bg-[var(--danger)] px-4 py-2.5 flex items-center gap-3">
        <ShieldAlert className="w-4 h-4 text-white flex-shrink-0" />
        <h3 className="text-white font-semibold text-[13px] flex-1">
          Outlier Detected — Diagnosis Blocked
        </h3>
        <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-mono font-semibold rounded">
          Z = {problematicValues[0]?.z_score?.toFixed(1) || '29.5'}σ
        </span>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{outlierData.details}</p>

        {/* Baseline Chart */}
        {baseline && (
          <div className="rounded-xl bg-[var(--bg-secondary)] p-3.5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <span className="text-[10px] font-mono font-semibold text-[var(--text-tertiary)]">
                {baseline.label} — Mean {baseline.mean} ± {baseline.stdDev}
              </span>
            </div>

            <div className="space-y-1.5">
              {baseline.values.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-[var(--text-tertiary)] w-24 text-right flex-shrink-0">{v.time}</span>
                  <div className="flex-1 h-3 bg-[var(--bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--success)] rounded-full" style={{ width: `${(v.value / maxVal) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono font-medium text-[var(--success)] w-16 flex-shrink-0">{v.value} {v.unit}</span>
                </div>
              ))}

              <div className="flex items-center gap-2 py-1">
                <span className="w-24 flex-shrink-0" />
                <div className="flex-1 border-t border-dashed border-[var(--danger)]" style={{ opacity: 0.4 }} />
                <span className="text-[9px] font-mono text-[var(--danger)] font-semibold w-16 flex-shrink-0">ANOMALY</span>
              </div>

              {problematicValues.map((v, i) => (
                <div key={`o-${i}`} className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-[var(--danger)] font-semibold w-24 text-right flex-shrink-0">{v.time}</span>
                  <div className="flex-1 h-3 bg-[var(--bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--danger)] rounded-full animate-pulse" style={{ width: `${Math.min((v.value / maxVal) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[var(--danger)] w-16 flex-shrink-0">{v.value} {v.unit}</span>
                </div>
              ))}
            </div>

            {problematicValues[0]?.verdict && (
              <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 bg-[var(--danger-bg)] rounded-lg">
                <Ban className="w-3 h-3 text-[var(--danger)] flex-shrink-0" />
                <span className="text-[10px] font-mono font-semibold text-[var(--danger)]">{problematicValues[0].verdict}</span>
              </div>
            )}
          </div>
        )}

        {/* Chief Agent Response */}
        {outlierData.chiefAgentResponse && (
          <div className="rounded-xl bg-[var(--bg-secondary)] p-3.5 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-3 h-3 text-[var(--danger)]" />
              <span className="text-[10px] font-mono font-semibold text-[var(--danger)]">Chief Agent — Revision Refused</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-mono">{outlierData.chiefAgentResponse}</p>
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRedrawRequest}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-semibold transition-all active:scale-[0.98]
              ${isLoading
                ? 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] cursor-not-allowed'
                : 'bg-[var(--danger)] text-white hover:opacity-90'
              }`}
          >
            {isLoading ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Requesting...</>
            ) : (
              <><Beaker className="w-3.5 h-3.5" /> Request Lab Redraw</>
            )}
          </button>
          <span className="text-[10px] text-[var(--text-tertiary)] font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" /> {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OutlierAlert;
