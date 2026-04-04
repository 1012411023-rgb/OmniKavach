import { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { getPatientData, runAgentAnalysis, formatAnalysisForUI } from '../services/api';

import PatientNote from '../components/PatientNote';

import PatientTimeline from '../components/PatientTimeline';

import RiskReport from '../components/RiskReport';

import FamilyCommunication from '../components/FamilyCommunication';

import OutlierAlert from '../components/OutlierAlert';

import {

  ArrowLeft, User, Cpu, CheckCircle2, Loader2, AlertTriangle,

  FileText, TrendingUp, Brain, Activity, ShieldAlert, Users, Heart,

} from 'lucide-react';



const STATUS_COLOR = {

  critical: 'text-red-600 dark:text-red-400',

  warning: 'text-amber-600 dark:text-amber-400',

  stable: 'text-emerald-600 dark:text-emerald-400',

};



export default function PatientDetail() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [analysis, setAnalysis] = useState('idle');

  const [analysisData, setAnalysisData] = useState(null);

  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' or 'family'

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

      const result = await runAgentAnalysis(id, {

        includeTimeline: true,

        includeRAG: true

      });

      

      // Format analysis data for UI

      const formattedAnalysis = formatAnalysisForUI(result);

      setAnalysisData(formattedAnalysis);

      

      // Check for outlier alerts (Twist 2)

      if (result.status === 'WAITING FOR REDRAW' || 

          (result.detected_anomalies && result.detected_anomalies.some(a => 

            a.includes('PROBABLE MISLABELED RESULT') || a.includes('SENSOR ERROR')))) {

        setOutlierAlert({

          is_outlier: true,

          severity: 'critical',

          reason: 'PROBABLE MISLABELED RESULT / SENSOR ERROR',

          details: 'Lab result contradicts 3-day baseline. Waiting for redraw.',

          recommendation: 'WAITING FOR REDRAW'

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

    // Simulate lab redraw request

    setOutlierAlert({

      ...outlierAlert,

      is_outlier: false,

      reason: 'Lab redraw requested - waiting for new results'

    });

    

    // In a real system, this would trigger a lab redraw API call

    setTimeout(() => {

      setOutlierAlert(null);

      // Re-run analysis after redraw

      handleAnalysis();

    }, 3000);

  };



  if (loading) {

    return (

      <div className="flex items-center justify-center h-full px-6">

        <div className="glass-panel rounded-3xl px-8 py-10 text-center">

          <Loader2 className="w-8 h-8 text-blue-500 dark:text-cyan-400 animate-spin mx-auto mb-3" />

          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading patient data...</p>

        </div>

      </div>

    );

  }



  if (error || !patient) {

    return (

      <div className="flex items-center justify-center h-full px-6">

        <div className="glass-panel rounded-3xl px-8 py-10 text-center">

          <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto mb-3" />

          <p className="text-red-600 dark:text-red-400 font-semibold text-sm">Patient data unavailable</p>

          <button

            onClick={() => navigate('/')}

            className="mt-3 text-xs text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"

          >

            Return to Ward

          </button>

        </div>

      </div>

    );

  }



  const sc = STATUS_COLOR[patient.status];



  return (

    <div className="flex flex-col h-full overflow-hidden">

      <div className="flex-shrink-0 px-4 pt-4 pb-3 sm:px-6">

        <div className="glass-panel rounded-[24px] px-4 py-4 sm:px-5 sm:py-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex items-start gap-3 min-w-0">

            <button

              onClick={() => navigate('/')}

              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex-shrink-0"

            >

              <ArrowLeft className="w-4 h-4" />

            </button>

            <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">

              <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />

            </div>

            <div className="min-w-0">

              <p className="section-label mb-1">Patient Focus View</p>

              <div className="flex items-center gap-2 flex-wrap">

                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{patient.name}</h2>

                <span className={`text-[10px] font-mono font-bold ${sc}`}>Status {patient.status.toUpperCase()}</span>

              </div>

              <div className="flex items-center gap-x-2 gap-y-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono flex-wrap mt-1">

                <span>{patient.bed}</span>

                <span>|</span>

                <span>{patient.age} yrs</span>

                <span>|</span>

                <span>{patient.mrn}</span>

                <span>|</span>

                <span>Admitted {patient.admitDate}</span>

                <span>|</span>

                <span>{patient.physician}</span>

              </div>

            </div>

          </div>



          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 xl:flex-shrink-0">

            <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-200/60 dark:bg-slate-700/40 border border-slate-300/60 dark:border-slate-600/40">

              <span className="text-[10px] text-slate-500 dark:text-slate-400">Condition</span>

              <span className="text-[10px] font-semibold text-slate-800 dark:text-white">{patient.condition}</span>

              <span className="ml-2 text-[10px] text-slate-400 dark:text-slate-500">Risk</span>

              <span className={`text-sm font-black font-mono ${sc}`}>{patient.riskScore}%</span>

            </div>



            <button

              id="btn-run-analysis"

              onClick={handleAnalysis}

              disabled={analysis === 'running'}

              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all

                ${analysis === 'complete'

                  ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400'

                  : analysis === 'running'

                  ? 'bg-blue-50 dark:bg-cyan-500/10 border-blue-200 dark:border-cyan-500/30 text-blue-500 dark:text-cyan-400 cursor-not-allowed'

                  : 'bg-blue-50 dark:bg-cyan-500/15 border-blue-200 dark:border-cyan-500/40 text-blue-600 dark:text-cyan-400 hover:bg-blue-100 dark:hover:bg-cyan-500/25'

                }`}

            >

              {analysis === 'running' && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running Agents...</>}

              {analysis === 'complete' && <><CheckCircle2 className="w-3.5 h-3.5" /> Analysis Complete</>}

              {analysis === 'error' && <><AlertTriangle className="w-3.5 h-3.5" /> Retry Analysis</>}

              {analysis === 'idle' && <><Cpu className="w-3.5 h-3.5" /> Run Agent Analysis</>}

            </button>

          </div>

        </div>

      </div>



      {/* Outlier Alert - Twist 2 */}

      {outlierAlert && (

        <div className="px-4 sm:px-6">

          <OutlierAlert 

            outlierData={outlierAlert} 

            onRedrawRequest={handleRedrawRequest}

            isLoading={analysis === 'running'}

          />

        </div>

      )}



      {/* Tab Navigation */}

      <div className="px-4 sm:px-6">

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">

          <button

            onClick={() => setActiveTab('analysis')}

            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${

              activeTab === 'analysis'

                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'

                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'

            }`}

          >

            <Brain className="w-4 h-4" />

            AI Analysis

          </button>

          <button

            onClick={() => setActiveTab('family')}

            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${

              activeTab === 'family'

                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'

                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'

            }`}

          >

            <Heart className="w-4 h-4" />

            Family Communication

          </button>

        </div>

      </div>



      <div className="flex-1 min-h-0 px-4 pb-4 sm:px-6 sm:pb-6">

        {activeTab === 'analysis' ? (

          <div className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-3 gap-4">

            <div className="glass-panel rounded-[24px] min-h-[320px] overflow-hidden flex flex-col">

              <div className="col-header">

                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-cyan-400 flex-shrink-0" />

                <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />

                <span className="col-header-title">Raw Feed | Note Parser</span>

                <span className="ml-auto text-[9px] font-mono text-slate-400 dark:text-slate-600">{patient.notes.length} notes</span>

              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {patient.notes.map((note) => (

                  <PatientNote key={note.id} note={note} highlightedWords={patient.highlightedWords} />

                ))}

              </div>

            </div>



            <div className="glass-panel rounded-[24px] min-h-[320px] overflow-hidden flex flex-col">

              <div className="col-header">

                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 flex-shrink-0" />

                <TrendingUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />

                <span className="col-header-title">Temporal Trajectory | 72h</span>

              </div>

              <div className="flex-1 overflow-y-auto p-4">

                <PatientTimeline data={patient.timeline} />

              </div>

            </div>



            <div className="glass-panel rounded-[24px] min-h-[320px] overflow-hidden flex flex-col">

              <div className="col-header">

                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />

                <Brain className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />

                <span className="col-header-title">AI Diagnostic Analysis</span>

                <span className="ml-auto text-[9px] font-mono text-slate-400 dark:text-slate-600">

                  {analysis === 'complete' ? 'Complete' : analysis === 'running' ? 'Running...' : 'Ready'}

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

        ) : (

          /* Family Communication Tab - Twist 1 */

          <div className="h-full min-h-0">

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

