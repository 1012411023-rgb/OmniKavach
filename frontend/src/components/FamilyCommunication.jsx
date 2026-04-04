import { Heart, Users, Clock, AlertTriangle, CheckCircle2, Globe, Stethoscope, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const SEVERITY_THEME = {
  critical: { color: 'var(--danger)', bg: 'var(--danger-bg)' },
  warning: { color: 'var(--warning)', bg: 'var(--warning-bg)' },
  stable: { color: 'var(--success)', bg: 'var(--success-bg)' },
};

const FamilyCommunication = ({ familyData, isLoading, patientName }) => {
  const [lang, setLang] = useState('english');

  if (isLoading) {
    return (
      <div className="surface p-6 h-full">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-5 h-5 text-[var(--accent)] animate-pulse" />
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Family Communication</h3>
            <p className="text-[12px] text-[var(--text-tertiary)]">Generating summary...</p>
          </div>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4" />
          <div className="h-3 bg-[var(--bg-secondary)] rounded w-full" />
          <div className="h-3 bg-[var(--bg-secondary)] rounded w-5/6" />
          <div className="h-16 bg-[var(--bg-secondary)] rounded-xl mt-4" />
        </div>
      </div>
    );
  }

  if (!familyData || (!familyData.english && !familyData.regional)) {
    return (
      <div className="surface p-6 h-full flex flex-col items-center justify-center">
        <Users className="w-10 h-10 text-[var(--text-tertiary)] opacity-30 mb-4" />
        <p className="text-[14px] text-[var(--text-secondary)]">Family update not yet available</p>
        <p className="text-[12px] text-[var(--text-tertiary)] mt-1 text-center max-w-xs">
          Run AI analysis to generate a compassionate summary for the family
        </p>
      </div>
    );
  }

  const severity = familyData.severity || 'warning';
  const theme = SEVERITY_THEME[severity] || SEVERITY_THEME.warning;
  const name = familyData.patientName || patientName || 'your loved one';
  const engData = familyData.english || {};
  const regData = familyData.regional || {};
  const summary = lang === 'english' ? engData.summary : regData.summary;
  const careMsg = lang === 'english' ? engData.careTeamMessage : regData.careTeamMessage;
  const timeline = engData.timeline || [];

  return (
    <div className="surface h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
              <Heart className="w-4 h-4" style={{ color: theme.color }} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Family Communication</h3>
              <p className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                <Clock className="w-3 h-3" /> 12-hour update for {name}'s family
              </p>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center bg-[var(--bg-secondary)] rounded-full p-0.5">
            <button
              onClick={() => setLang('english')}
              className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium rounded-full transition-all
                ${lang === 'english'
                  ? 'bg-[var(--bg)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)]'
                }`}
            >
              <Globe className="w-3 h-3" /> EN
            </button>
            <button
              onClick={() => setLang('regional')}
              className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium rounded-full transition-all
                ${lang === 'regional'
                  ? 'bg-[var(--bg)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)]'
                }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        <span className={`badge-${severity}`}>
          {severity === 'critical' ? 'Serious' : severity === 'warning' ? 'Needs Attention' : 'Recovering'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--warning-bg)]">
          <AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--warning)]">For family information only.</strong> All medical decisions should be made with the care team.
          </p>
        </div>

        {/* Summary */}
        {summary && (
          <div className="rounded-xl bg-[var(--accent-bg)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-[11px] font-semibold text-[var(--accent)]">
                {lang === 'english' ? 'Summary' : 'सारांश'}
              </span>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <span className="section-label">
                {lang === 'english' ? '12-Hour Timeline' : '12 घंटे की समयरेखा'}
              </span>
            </div>
            <div className="relative ml-2">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--border)]" />
              <div className="space-y-3">
                {timeline.map((entry, i) => (
                  <div key={i} className="relative flex gap-3">
                    <div className="flex-shrink-0 w-4 pt-1.5 z-10">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--bg)] bg-[var(--text-tertiary)]" />
                    </div>
                    <div className="flex-1 rounded-xl bg-[var(--bg-secondary)] p-3">
                      <span className="text-[10px] font-mono font-semibold text-[var(--text-tertiary)] block mb-1">
                        {entry.time}
                      </span>
                      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                        {lang === 'english' ? entry.event : (entry.eventHindi || entry.event)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Care Team Message */}
        {careMsg && (
          <div className="rounded-xl bg-[var(--success-bg)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-[var(--success)]" />
              <span className="text-[11px] font-semibold text-[var(--success)]">
                {lang === 'english' ? 'Care Team' : 'देखभाल टीम'}
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{careMsg}</p>
          </div>
        )}

        {/* Quick Status */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--success-bg)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
            <span className="text-[11px] text-[var(--text-secondary)]">
              {lang === 'english' ? 'Monitoring 24/7' : '24/7 निगरानी'}
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--accent-bg)]">
            <Heart className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-[11px] text-[var(--text-secondary)]">
              {lang === 'english' ? 'Compassionate care' : 'सहानुभूतिपूर्ण देखभाल'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-[var(--border)]">
        <p className="text-[10px] text-[var(--text-tertiary)] text-center">
          Please speak with the care team for questions
        </p>
      </div>
    </div>
  );
};

export default FamilyCommunication;
