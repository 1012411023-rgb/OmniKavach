import { AlertTriangle, RefreshCw, Clock, ShieldAlert, Activity } from 'lucide-react';

const OutlierAlert = ({ outlierData, onRedrawRequest, isLoading }) => {
  if (!outlierData || !outlierData.is_outlier) {
    return null;
  }

  const isCritical = outlierData.severity === 'critical';
  const isProbableError = outlierData.reason?.includes('PROBABLE MISLABELED RESULT');

  return (
    <div className={`${
      isCritical 
        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/40' 
        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/40'
    } border rounded-2xl p-4 mb-6 animate-pulse-once`}>
      <div className="flex items-start gap-4">
        {/* Alert Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCritical 
            ? 'bg-red-100 dark:bg-red-500/20' 
            : 'bg-amber-100 dark:bg-amber-500/20'
        }`}>
          {isCritical ? (
            <ShieldAlert className={`w-5 h-5 ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
          ) : (
            <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
          )}
        </div>

        {/* Alert Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-bold text-lg ${
              isCritical 
                ? 'text-red-800 dark:text-red-200' 
                : 'text-amber-800 dark:text-amber-200'
            }`}>
              {isProbableError ? 'PROBABLE MISLABELED RESULT' : 'LAB VALUE ANOMALY DETECTED'}
            </h3>
            {isCritical && (
              <span className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                CRITICAL
              </span>
            )}
          </div>

          <p className={`text-sm mb-3 ${
            isCritical 
              ? 'text-red-700 dark:text-red-300' 
              : 'text-amber-700 dark:text-amber-300'
          }`}>
            {outlierData.reason}
            {outlierData.details && `: ${outlierData.details}`}
          </p>

          {/* Action Required */}
          {isProbableError && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-red-200 dark:border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-800 dark:text-red-200 text-sm">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                This lab result contradicts the 3-day baseline and is likely a mislabeled sample or sensor error. 
                The diagnosis has been paused until a confirmed redraw is received.
              </p>
              
              {/* Redraw Request Button */}
              <button
                onClick={onRedrawRequest}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isLoading
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Requesting Redraw...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Request Lab Redraw
                  </>
                )}
              </button>
            </div>
          )}

          {/* Additional Details */}
          {outlierData.problematic_values && outlierData.problematic_values.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Problematic Values Detected:
              </p>
              <div className="space-y-1">
                {outlierData.problematic_values.map((value, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-400">
                      Value: {value.value} (Z-score: {value.z_score.toFixed(1)})
                    </span>
                    {value.timestamp && (
                      <span className="text-slate-500 dark:text-slate-500">
                        at {new Date(value.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Detected at {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Warning Banner for Critical Cases */}
      {isCritical && (
        <div className="mt-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span className="text-xs font-medium text-red-800 dark:text-red-200">
              CLINICAL ALERT: Do not use this value for medical decisions until redraw is confirmed.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutlierAlert;
