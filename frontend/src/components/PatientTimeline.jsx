import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface p-3 text-[11px]" style={{ boxShadow: 'var(--shadow-lg)' }}>
      <p className="text-[var(--text-tertiary)] font-mono mb-1.5">T + {label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[var(--text-secondary)]">{entry.name}</span>
          <span className="font-semibold font-mono" style={{ color: entry.color }}>
            {entry.value}{entry.name === 'Lactate' ? ' mmol/L' : ' bpm'}
          </span>
        </div>
      ))}
    </div>
  );
};

const LactateDot = (props) => {
  const { cx, cy, payload } = props;
  if (payload.isOutlier) {
    return (
      <g key={`outlier-${cx}`}>
        <circle cx={cx} cy={cy} r={12} fill="rgba(255,149,0,0.08)" stroke="rgba(255,149,0,0.2)" strokeWidth={1} />
        <circle cx={cx} cy={cy} r={6} fill="rgba(255,149,0,0.15)" stroke="var(--warning)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={3} fill="var(--warning)" />
        <text x={cx} y={cy - 18} textAnchor="middle" fill="var(--warning)" fontSize="9" fontWeight="600">
          OUTLIER
        </text>
      </g>
    );
  }
  return <circle key={`dot-${cx}`} cx={cx} cy={cy} r={2.5} fill="var(--accent)" stroke="var(--accent)" strokeWidth={1} />;
};

export default function PatientTimeline({ data }) {
  const { isDark } = useTheme();
  if (!data) return null;

  const chartData = data.labels.map((label, i) => ({
    time: label,
    lactate: data.lactate[i],
    heartRate: data.heartRate[i],
    isOutlier: i === data.lactateOutlierIndex,
  }));

  const gridStroke = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const axisStroke = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const tickFill = isDark ? '#48484a' : '#aeaeb2';

  const sharedAxis = {
    tick: { fill: tickFill, fontSize: 10, fontFamily: '"JetBrains Mono", monospace' },
    axisLine: { stroke: axisStroke },
    tickLine: false,
  };

  return (
    <div className="space-y-5">
      {/* Outlier Warning */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--warning-bg)]">
        <AlertTriangle className="w-4 h-4 text-[var(--warning)] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-semibold text-[var(--warning)] mb-0.5">Lab Outlier Flagged</p>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Lactate <span className="font-semibold text-[var(--warning)]">15.0 mmol/L</span> at T+30h
            — probable hemolyzed sample. Repeat STAT lactate recommended.
          </p>
        </div>
      </div>

      {/* Lactate Chart */}
      <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-medium text-[var(--text-primary)]">Serum Lactate</p>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">mmol/L · 72h</span>
        </div>
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={chartData} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="time" {...sharedAxis} />
            <YAxis domain={[0, 18]} {...sharedAxis} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={2}
              stroke="var(--success)"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              label={{ value: 'Normal', fill: 'var(--success)', fontSize: 9, position: 'insideTopRight' }}
            />
            <Line
              type="monotone"
              dataKey="lactate"
              name="Lactate"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={<LactateDot />}
              activeDot={{ r: 4, fill: 'var(--accent)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heart Rate Chart */}
      <div className="rounded-xl bg-[var(--bg-secondary)] p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-medium text-[var(--text-primary)]">Heart Rate</p>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">bpm · 72h</span>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="time" {...sharedAxis} />
            <YAxis domain={[60, 145]} {...sharedAxis} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={100}
              stroke="var(--warning)"
              strokeDasharray="4 4"
              strokeOpacity={0.3}
              label={{ value: 'Tachycardia', fill: 'var(--warning)', fontSize: 9, position: 'insideTopRight' }}
            />
            <Line
              type="monotone"
              dataKey="heartRate"
              name="Heart Rate"
              stroke="var(--danger)"
              strokeWidth={2}
              dot={{ r: 2.5, fill: 'var(--danger)', stroke: 'var(--danger)', strokeWidth: 1 }}
              activeDot={{ r: 4, fill: 'var(--danger)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
