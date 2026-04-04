import { ShieldAlert, BookOpen, Bot, CheckCircle2, AlertTriangle, XCircle, Activity, Clock, TrendingUp, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getRAGStatus } from '../services/api';



const SEVERITY = {

  critical: {

    bar: 'bg-red-500',

    text: 'text-red-600 dark:text-red-400',

    bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',

  },

  warning: {

    bar: 'bg-amber-500',

    text: 'text-amber-600 dark:text-amber-400',

    bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',

  },

  info: {

    bar: 'bg-blue-500',

    text: 'text-blue-600 dark:text-blue-400',

    bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',

  }

};



const SOURCE_COLORS = {

  protocol: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20',

  dataset: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20',

  guideline: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',

};



const AGENT_ICONS = {

  complete: <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />,

  flagged: <AlertTriangle className="w-3 h-3 text-amber-500 dark:text-amber-400" />,

  error: <XCircle className="w-3 h-3 text-red-500 dark:text-red-400" />,

  running: <Activity className="w-3 h-3 text-blue-500 animate-pulse" />

};



// Loading skeleton component

const LoadingSkeleton = () => (

  <div className="space-y-4">

    <div className="animate-pulse">

      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>

      <div className="h-2 bg-gray-200 rounded w-1/2"></div>

    </div>

    <div className="animate-pulse space-y-2">

      <div className="h-3 bg-gray-200 rounded"></div>

      <div className="h-3 bg-gray-200 rounded w-5/6"></div>

      <div className="h-3 bg-gray-200 rounded w-4/6"></div>

    </div>

    <div className="animate-pulse">

      <div className="h-20 bg-gray-200 rounded"></div>

    </div>

  </div>

);



export default function RiskReport({ analysisData, isLoading, patientId, error }) {

  const [ragStatus, setRagStatus] = useState(null);

  const [expandedSection, setExpandedSection] = useState('risk');



  // Fetch RAG status when component mounts

  useEffect(() => {

    const fetchRAGStatus = async () => {
      try {
        const status = await getRAGStatus();
        setRagStatus(status);
      } catch (err) {
        console.error('Failed to fetch RAG status:', err);
      }
    };

    

    fetchRAGStatus();

  }, []);



  if (isLoading) {

    return (

      <div className="panel rounded-2xl p-6 shadow-sm dark:shadow-none">

        <div className="flex items-center gap-3 mb-4">

          <Activity className="w-5 h-5 text-blue-500 animate-pulse" />

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">AI Analyzing Patient Data</h3>

        </div>

        <LoadingSkeleton />

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

          <Clock className="w-4 h-4" />

          <span>Running multi-agent analysis...</span>

        </div>

      </div>

    );

  }



  if (error) {
    return (
      <div className="panel rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="text-center py-8">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 font-semibold">Analysis Failed</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error}</p>
          <p className="text-xs text-slate-400 mt-2">Click &quot;Run Agent Analysis&quot; to retry</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="panel rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="text-center py-8">
          <Bot className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">No analysis data available</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Run an AI analysis to see results</p>
        </div>
      </div>
    );
  }



  const { analysisReport, agentSummary, ragCitations, processingTime } = analysisData;

  const riskScore = Math.round(analysisReport.riskScore * 100);

  const riskColor = riskScore >= 75 ? 'text-red-600 dark:text-red-400' : riskScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';

  const riskBar = riskScore >= 75 ? 'bg-red-500' : riskScore >= 50 ? 'bg-amber-500' : 'bg-emerald-500';

  const riskLevel = riskScore >= 75 ? 'High' : riskScore >= 50 ? 'Medium' : 'Low';



  return (

    <div className="space-y-4 animate-fade-in">

      {/* Medical Disclaimer */}

      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/40 rounded-2xl p-3 flex gap-3 shadow-sm dark:shadow-none">

        <ShieldAlert className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />

        <div>

          <p className="text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">

            Decision Support Only

          </p>

          <p className="text-red-500/70 dark:text-red-300/70 text-[10px] leading-relaxed">

            Not a clinical diagnosis. All AI-generated outputs must be reviewed and validated by a licensed

            clinician before influencing any medical decision.

          </p>

        </div>

      </div>



      {/* Risk Score Section */}

      <div className="panel rounded-2xl p-4 shadow-sm dark:shadow-none">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2">

            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-cyan-400" />

            <p className="section-label">AI Composite Risk Score</p>

          </div>

          <div className="text-right">

            <span className={`text-2xl font-black font-mono ${riskColor}`}>{riskScore}%</span>

            <span className={`ml-2 text-xs font-medium ${riskColor}`}>{riskLevel} Risk</span>

          </div>

        </div>

        <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">

          <div

            className={`h-full rounded-full transition-all duration-1000 ${riskBar}`}

            style={{ width: `${riskScore}%` }}

          />

        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">

          <Clock className="w-3 h-3" />

          <span>Analysis completed in {processingTime?.toFixed(1) || 'N/A'}s</span>

        </div>

      </div>



      {/* Detected Anomalies */}

      {analysisReport.detected_anomalies?.length > 0 && (

        <div className="panel rounded-2xl p-4 shadow-sm dark:shadow-none">

          <div className="flex items-center justify-between mb-3">

            <p className="section-label">Detected Anomalies</p>

            <span className="text-xs bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">

              {analysisReport.detected_anomalies.length} findings

            </span>

          </div>

          <div className="space-y-2">

            {analysisReport.detected_anomalies.map((anomaly, i) => (

              <div key={i} className={`flex items-center gap-2.5 border rounded-xl px-3 py-2 ${SEVERITY.warning.bg}`}>

                <AlertTriangle className="w-4 h-4 text-amber-500" />

                <span className={`text-[11px] font-medium ${SEVERITY.warning.text}`}>{anomaly}</span>

              </div>

            ))}

          </div>

        </div>

      )}



      {/* Clinical Recommendations */}

      {analysisReport.recommendations?.length > 0 && (

        <div className="panel rounded-2xl p-4 shadow-sm dark:shadow-none">

          <div className="flex items-center justify-between mb-3">

            <div className="flex items-center gap-2">

              <FileText className="w-4 h-4 text-blue-600 dark:text-cyan-400" />

              <p className="section-label">Clinical Recommendations</p>

            </div>

            <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">

              {analysisReport.recommendations.length} actions

            </span>

          </div>

          <div className="space-y-2">

            {analysisReport.recommendations.map((recommendation, i) => (

              <div key={i} className="flex items-start gap-2.5 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">

                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />

                <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 leading-relaxed">{recommendation}</span>

              </div>

            ))}

          </div>

        </div>

      )}



      {/* RAG Citations */}

      {ragCitations?.length > 0 && (

        <div className="panel rounded-2xl p-4 shadow-sm dark:shadow-none">

          <div className="flex items-center gap-2 mb-3">

            <BookOpen className="w-4 h-4 text-blue-600 dark:text-cyan-400" />

            <p className="section-label">Evidence-Based Guidelines</p>

            {ragStatus?.ragEnabled && (

              <span className="ml-auto text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full">

                RAG Active

              </span>

            )}

          </div>

          <div className="space-y-2">

            {ragCitations.map((citation, i) => (

              <div key={i} className="flex items-start gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">

                <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5" />

                <div>

                  <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 leading-tight">{citation}</p>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}



      {/* Agent Execution Summary */}

      {agentSummary && (

        <div className="panel rounded-2xl p-4 shadow-sm dark:shadow-none">

          <div className="flex items-center gap-2 mb-3">

            <Bot className="w-4 h-4 text-blue-600 dark:text-cyan-400" />

            <p className="section-label">Agent Pipeline Summary</p>

          </div>

          <div className="space-y-3">

            {Object.entries(agentSummary).map(([agentName, agentData]) => (

              <div key={agentName} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3">

                <div className="flex items-center justify-between mb-2">

                  <div className="flex items-center gap-2">

                    {AGENT_ICONS[agentData.status] || AGENT_ICONS.complete}

                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 capitalize">

                      {agentName.replace('Agent', '')}

                    </span>

                  </div>

                  <span className="text-xs text-slate-500">{agentData.processingTime}</span>

                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">

                  {agentData.symptomsExtracted && (

                    <div>

                      <span className="text-slate-500">Symptoms:</span>

                      <span className="ml-1 font-medium">{agentData.symptomsExtracted}</span>

                    </div>

                  )}

                  {agentData.labsAnalyzed && (

                    <div>

                      <span className="text-slate-500">Labs:</span>

                      <span className="ml-1 font-medium">{agentData.labsAnalyzed}</span>

                    </div>

                  )}

                  {agentData.vitalsAnalyzed && (

                    <div>

                      <span className="text-slate-500">Vitals:</span>

                      <span className="ml-1 font-medium">{agentData.vitalsAnalyzed}</span>

                    </div>

                  )}

                  {agentData.riskScore && (

                    <div>

                      <span className="text-slate-500">Risk:</span>

                      <span className="ml-1 font-medium">{Math.round(agentData.riskScore * 100)}%</span>

                    </div>

                  )}

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}

