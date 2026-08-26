import React, { useState } from 'react';
import { TimeSeriesPoint } from '../../utils/analyticsUtils';

interface LineChartProps {
  data: TimeSeriesPoint[];
  height?: number;
  strokeColor?: string;
  gradientId?: string;
  unit?: string;
  showAverage?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 180,
  strokeColor = '#10B981',
  gradientId = 'line-grad',
  unit = '%',
  showAverage = true,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-zinc-400">
        No tracking data for this period
      </div>
    );
  }

  const padding = { top: 20, right: 15, bottom: 25, left: 25 };
  const width = 340; // Internal SVG viewport coordinate width
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Compute values
  const points = data.map((d, index) => {
    const x = padding.left + (index / Math.max(1, data.length - 1)) * plotWidth;
    const y = padding.top + plotHeight - (d.completionRate / 100) * plotHeight;
    return { ...d, x, y };
  });

  // Calculate average
  const totalSum = data.reduce((acc, curr) => acc + curr.completionRate, 0);
  const average = Math.round(totalSum / data.length);
  const averageY = padding.top + plotHeight - (average / 100) * plotHeight;

  // Generate SVG Path
  const pathD = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    // Bezier curve approximation
    const prev = points[index - 1];
    const cx1 = prev.x + (point.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (point.x - prev.x) / 2;
    const cy2 = point.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  return (
    <div className="relative w-full select-none">
      {/* Tooltip Overlay */}
      {hoveredPoint && (
        <div
          className="absolute -top-3 pointer-events-none transform -translate-x-1/2 bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg border border-zinc-700/50 z-20 transition-all duration-150"
          style={{ left: `${(hoverX! / width) * 100}%` }}
        >
          <div className="text-[10px] text-zinc-400 font-normal">{hoveredPoint.date}</div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{hoveredPoint.completionRate}{unit}</span>
            <span className="text-[10px] text-zinc-400">({hoveredPoint.completedCount}/{hoveredPoint.scheduledCount})</span>
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        onMouseLeave={() => {
          setHoveredPoint(null);
          setHoverX(null);
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 50, 100].map(val => {
          const y = padding.top + plotHeight - (val / 100) * plotHeight;
          return (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-zinc-200 dark:text-[#262A33]"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                fontSize="9"
                textAnchor="end"
                className="fill-zinc-400 dark:fill-zinc-500 font-medium"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* Average line */}
        {showAverage && (
          <line
            x1={padding.left}
            y1={averageY}
            x2={width - padding.right}
            y2={averageY}
            stroke="#F59E0B"
            strokeDasharray="4 4"
            strokeWidth="1.2"
            opacity="0.8"
          />
        )}

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Line stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Points */}
        {points.map((pt, idx) => {
          const isSelected = hoveredPoint?.date === pt.date;
          // Show point circles only on key steps or when points are fewer than 15
          const showDot = points.length <= 14 || idx === 0 || idx === points.length - 1 || isSelected;

          return (
            <g key={pt.date}>
              {showDot && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 5 : 3.5}
                  fill={strokeColor}
                  className="transition-all duration-150"
                  stroke={isSelected ? '#ffffff' : 'none'}
                  strokeWidth={isSelected ? 2 : 0}
                />
              )}
              {/* Invisible wide hit area for smooth touch/hover */}
              <rect
                x={pt.x - 12}
                y={padding.top}
                width={24}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHoveredPoint(pt);
                  setHoverX(pt.x);
                }}
                onTouchStart={() => {
                  setHoveredPoint(pt);
                  setHoverX(pt.x);
                }}
              />
            </g>
          );
        })}

        {/* X Axis Labels */}
        {points.map((pt, idx) => {
          // Label interval logic
          let shouldLabel = false;
          if (points.length <= 7) shouldLabel = true;
          else if (points.length <= 15) shouldLabel = idx % 2 === 0;
          else if (points.length <= 31) shouldLabel = idx % 5 === 0;
          else shouldLabel = idx % Math.ceil(points.length / 6) === 0;

          if (!shouldLabel && idx !== points.length - 1) return null;

          return (
            <text
              key={`lbl-${pt.date}`}
              x={pt.x}
              y={height - 6}
              fontSize="9"
              textAnchor="middle"
              className="fill-zinc-400 dark:fill-zinc-500 font-medium"
            >
              {pt.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
