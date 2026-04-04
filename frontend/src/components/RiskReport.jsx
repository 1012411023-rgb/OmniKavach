import { ShieldAlert, BookOpen, Bot, CheckCircle2, AlertTriangle, XCircle, Activity, Clock, TrendingUp, FileText, Ban } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getRAGStatus } from '../services/api';

const AGENT_ICONS = {
  complete: <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />,
  flagged: <AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)]" />,
  blocked: <Ban className="w-3.5 h-3.5 text-[var(--danger)]" />,
  error: <XCircle className="w-3.5 h-3.5 text-[var(--danger)]" />,
  running: <Activity className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />,
};

export default function RiskReport({ analysisData, isLoading, patientId, error }) {
  const [ragStatus, setRagStatus] = useState(null);

  useEffect(() => {
    getRAGStatus().then(setRagStatus).catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5 text-[var(--accent)] animate-pulse" />
          <p className="text-[14px] font-medium text-[var(--text-primary)]">Analyzing</p>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-3 bg-[var(--bg-secondary)] rounded w-3/4" />
          <div className="h-2 bg-[var(--bg-secondary)] rounded w-1/2" />
          <div className="h-16 bg-[var(--bg-secondary)] rounded-xl" />
          <div className="h-12 bg-[var(--bg-secondary)] rounded-xl" />
        </div>
        <p className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> Running multi-agent pipeline...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <XCircle className="w-10 h-10 text-[var(--danger)] mx-auto mb-3 opacity-60" />
        <p className="text-[14px] font-medium text-[var(--text-primary)]">Analysis Failed</p>
        <p className="text-[12px] text-[var(--text-secondary)] mt-1">{error}</p>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="text-center py-10">
        <Bot className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3 opacity-40" />
        <p className="text-[14px] text-[var(--text-secondary)]">No analysis yet</p>
        <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Run AI analysis to see results</p>
      </div>
    );
  }

  const { analysisReport, agentSummary, ragCitations, processingTime } = analysisData;
  const riskScore = Math.round(analysisReport.riskScore * 100);
  const riskColor = riskScore >= 75 ? 'var(--danger)' : riskScore >= 50 ? 'var(--warning)' : 'var(--success)';
  const riskLevel = riskScore >= 75 ? 'High' : riskScore >= 50 ? 'Medium' : 'Low';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--danger-bg)]">
        <ShieldAlert className="w-4 h-4 text-[var(--danger)] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[var(--danger)] leading-relaxed">
          <strong>Decision support only.</strong> All outputs must be validated by a licensed clinician.
        </p>
      </div>

      {/* Blocked Banner */}
      {analysisReport.status === 'WAITING FOR REDRAW' && (
        <div className="bg-[var(--danger)] rounded-xl p-3.5 flex items-center gap-3">
          <Ban className="w-4 h-4 text-white flex-shrink-0" />
          <div className="flex-1">
            <p className="text-white font-semibold text-[12px]">Diagnosis Blocked</p>
            <p className="text-white/70 text-[10px] mt-0.5">Anomalous lab value quarantined. Using verified baseline only.</p>
          </div>
        </div>
      )}

      {/* Risk Score */}
      <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">AI Risk Score</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[24px] font-bold tabular-nums" style={{ color: riskColor }}>{riskScore}%</span>
            <span className="text-[11px] font-medium" style={{ color: riskColor }}>{riskLevel}</span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-[var(--bg)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${riskScore}%`, backgroundColor: riskColor }}
          />
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Completed in {processingTime?.toFixed(1) || '—'}s
        </p>
      </div>

      {/* Anomalies */}
      {analysisReport.detected_anomalies?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="section-label">Anomalies</span>
            <span className="text-[10px] font-medium text-[var(--danger)]">
              {analysisReport.detected_anomalies.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {analysisReport.detected_anomalies.map((a, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--warning-bg)]">
                <AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysisReport.recommendations?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="section-label">Recommendations</span>
            <span className="text-[10px] font-medium text-[var(--accent)]">
              {analysisReport.recommendations.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {analysisReport.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--accent-bg)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RAG Citations */}
      {ragCitations?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="section-label">Evidence Guidelines</span>
            {ragStatus?.ragEnabled && (
              <span className="text-[10px] font-medium text-[var(--success)]">RAG Active</span>
            )}
          </div>
          <div className="space-y-1.5">
            {ragCitations.map((c, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--success-bg)]">
                <BookOpen className="w-3.5 h-3.5 text-[var(--success)] flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Pipeline */}
      {agentSummary && (
        <div>
          <span className="section-label block mb-2">Agent Pipeline</span>
          <div className="space-y-2">
            {Object.entries(agentSummary).map(([name, data]) => (
              <div key={name} className="rounded-xl bg-[var(--bg-secondary)] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {AGENT_ICONS[data.status] || AGENT_ICONS.complete}
                    <span className="text-[12px] font-medium text-[var(--text-primary)]">
                      {name.replace('Agent', '')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{data.processingTime}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-[var(--text-secondary)]">
                  {data.symptomsExtracted != null && <span>Symptoms: <strong>{data.symptomsExtracted}</strong></span>}
                  {data.labsAnalyzed != null && <span>Labs: <strong>{data.labsAnalyzed}</strong></span>}
                  {data.riskScore != null && <span>Risk: <strong>{Math.round(data.riskScore * 100)}%</strong></span>}
                </div>
                {data.blockedReason && (
                  <div className="mt-2 flex items-start gap-1.5 p-2 rounded-lg bg-[var(--danger-bg)]">
                    <Ban className="w-3 h-3 text-[var(--danger)] flex-shrink-0 mt-0.5" />
                    <span className="text-[10px] text-[var(--danger)]">{data.blockedReason}</span>
                  </div>
                )}
                {data.outlierDetected && !data.blockedReason && (
                  <div className="mt-2 flex items-start gap-1.5 p-2 rounded-lg bg-[var(--warning-bg)]">
                    <AlertTriangle className="w-3 h-3 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                    <span className="text-[10px] text-[var(--warning)]">Outlier detected — value quarantined</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
