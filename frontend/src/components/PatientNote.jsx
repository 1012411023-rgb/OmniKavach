import { Clock } from 'lucide-react';

const ROLE_STYLES = {
  Attending:    'text-[var(--accent)]',
  'ICU Nurse':  'text-purple-600 dark:text-purple-400',
  Nephrologist: 'text-[var(--warning)]',
  Resident:     'text-[var(--success)]',
};

/** Split text into plain/highlighted segments */
function buildSegments(text, words) {
  if (!words?.length) return [{ plain: true, content: text }];
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  return text.split(regex).map((part, i) => ({
    plain: !words.some((w) => w.toLowerCase() === part.toLowerCase()),
    content: part,
    key: i,
  }));
}

export default function PatientNote({ note, highlightedWords = [] }) {
  const segments = buildSegments(note.text, highlightedWords);
  const roleColor = ROLE_STYLES[note.role] ?? 'text-[var(--text-secondary)]';

  return (
    <div className="rounded-xl p-3.5 bg-[var(--bg-secondary)] transition-colors animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--bg)] flex items-center justify-center flex-shrink-0">
            <span className={`text-[9px] font-bold ${roleColor}`}>
              {note.author.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-[12px] font-medium text-[var(--text-primary)] leading-none">{note.author}</p>
            <span className={`text-[10px] font-medium ${roleColor}`}>{note.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
          <Clock className="w-3 h-3" />
          <span className="text-[11px] font-mono">{note.time}</span>
        </div>
      </div>

      {/* Body */}
      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        {segments.map((seg) =>
          seg.plain ? (
            <span key={seg.key}>{seg.content}</span>
          ) : (
            <mark
              key={seg.key}
              className="bg-[var(--accent-bg)] text-[var(--accent)] rounded px-0.5 font-medium"
              style={{ textDecoration: 'none' }}
            >
              {seg.content}
            </mark>
          )
        )}
      </p>
    </div>
  );
}
