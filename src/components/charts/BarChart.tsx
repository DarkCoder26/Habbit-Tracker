import React from 'react';

interface BarItem {
  label: string;
  value: number; // 0 to 100 or raw quantity
  subLabel?: string;
  color?: string;
  highlight?: boolean;
}

interface BarChartProps {
  items: BarItem[];
  height?: number;
  maxValue?: number;
  unit?: string;
  targetLine?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  items,
  height = 160,
  maxValue = 100,
  unit = '%',
  targetLine = 80,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-zinc-400">
        No comparison data available
      </div>
    );
  }

  return (
    <div className="w-full select-none">
      <div className="relative flex items-end justify-between gap-2 pt-6 px-1" style={{ height }}>
        {/* Optional Target Line */}
        {targetLine !== undefined && (
          <div
            className="absolute left-0 right-0 border-b border-dashed border-emerald-500/40 z-0 flex items-center justify-end pr-1 pointer-events-none"
            style={{ bottom: `${(targetLine / maxValue) * 100}%` }}
          >
            <span className="text-[9px] font-semibold text-emerald-500 bg-zinc-100 dark:bg-[#1C1E24] px-1 rounded -translate-y-2">
              Goal {targetLine}{unit}
            </span>
          </div>
        )}

        {items.map((item, idx) => {
          const heightPercent = Math.min(100, Math.max(4, (item.value / maxValue) * 100));
          const barColor = item.color || (item.highlight ? '#10B981' : '#6366f1');

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group z-10">
              {/* Value floating pill on hover / active */}
              <div className="opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 whitespace-nowrap">
                {item.value}{unit}
              </div>

              {/* Bar track and fill */}
              <div className="w-full max-w-[28px] h-full flex items-end rounded-t-lg bg-zinc-100 dark:bg-[#15171D] p-0.5 relative overflow-hidden border-t border-x border-transparent dark:border-[#262A33]/50">
                <div
                  className="w-full rounded-t-md transition-all duration-500 ease-out shadow-xs"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>

              {/* Label below bar */}
              <div className="mt-2 text-center">
                <div className={`text-xs font-semibold ${item.highlight ? 'text-emerald-500' : 'text-zinc-600 dark:text-zinc-400'}`}>
                  {item.label}
                </div>
                {item.subLabel && (
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500">
                    {item.subLabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
