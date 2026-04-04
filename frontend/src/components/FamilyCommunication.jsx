import { Heart, Users, Clock, AlertTriangle, CheckCircle2, Globe } from 'lucide-react';
import { useState } from 'react';

const FamilyCommunication = ({ familyData, isLoading, patientName }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  
  if (isLoading) {
    return (
      <div className="panel rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-blue-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Family Communication</h3>
        </div>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!familyData || !familyData.english || !familyData.regional) {
    return (
      <div className="panel rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Family Communication</h3>
        </div>
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">Family communication not available</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Run analysis to generate family summary</p>
        </div>
      </div>
    );
  }

  const currentText = familyData[selectedLanguage] || familyData.english;

  return (
    <div className="panel rounded-2xl p-6 shadow-sm dark:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Family Communication</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Compassionate update for {patientName || 'your loved one'}
            </p>
          </div>
        </div>
        
        {/* Language Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setSelectedLanguage('english')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedLanguage === 'english'
                ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-200 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-3 h-3 mr-1" />
            English
          </button>
          <button
            onClick={() => setSelectedLanguage('regional')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedLanguage === 'regional'
                ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-200 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/40 rounded-2xl p-4 mb-6">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 dark:text-amber-200 font-medium text-sm mb-1">
              Important Medical Information
            </p>
            <p className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
              This summary is for family communication only. All medical decisions should be made in consultation with the healthcare team.
            </p>
          </div>
        </div>
      </div>

      {/* Communication Content */}
      <div className="space-y-4">
        {/* Message Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Medical Team Update
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last 12 hours summary
            </p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            selectedLanguage === 'english' 
              ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
              : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'
          }`}>
            {selectedLanguage === 'english' ? 'English' : 'हिंदी'}
          </div>
        </div>

        {/* Message Content */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/5 dark:to-cyan-500/5 rounded-2xl p-5 border border-blue-200 dark:border-blue-500/20">
          <div className="prose prose-sm max-w-none">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
              {currentText}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              Team is monitoring closely
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
            <Heart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Compassionate care provided
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>Generated by OmniKavach AI Assistant</p>
          <p>Review with healthcare team for questions</p>
        </div>
      </div>
    </div>
  );
};

export default FamilyCommunication;
