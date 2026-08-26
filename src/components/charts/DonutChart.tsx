import React from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  subLabel?: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerTitle?: string;
  centerSubtitle?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 140,
  thickness = 18,
  centerTitle,
  centerSubtitle,
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-sm text-zinc-400">
        No distribution data
      </div>
    );
  }

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const renderedSegments = segments.map((seg) => {
    const percent = (seg.value / total) * 100;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percent;

    return {
      ...seg,
      percent: Math.round(percent),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      {/* SVG Ring */}
      <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            className="text-zinc-100 dark:text-[#262A33]"
            strokeWidth={thickness}
            fill="transparent"
          />

          {renderedSegments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.5s ease-out',
              }}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          {centerTitle && (
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {centerTitle}
            </span>
          )}
          {centerSubtitle && (
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              {centerSubtitle}
            </span>
          )}
        </div>
      </div>

      {/* Legend List */}
      <div className="flex flex-col gap-2 w-full max-w-[180px]">
        {renderedSegments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">
                {seg.label}
              </span>
            </div>
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold ml-2">
              {seg.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
