import React, { useState } from 'react';
import { formatReadableDate, getDayOfWeek, parseISODate } from '../../utils/dateUtils';

interface HeatmapDay {
  date: string;
  intensity: number; // 0, 1, 2, 3, 4
  rate: number; // 0 to 100
  completed: number;
  scheduled: number;
}

interface CalendarHeatmapProps {
  days: HeatmapDay[];
  onSelectDate?: (date: string) => void;
  selectedDate?: string;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  days,
  onSelectDate,
  selectedDate,
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  if (!days || days.length === 0) return null;

  // Group days into 7-day columns (weeks)
  const columns: HeatmapDay[][] = [];
  let currentColumn: HeatmapDay[] = [];

  // Pad the first column if first day is not Sunday (or Monday)
  const firstDay = days[0];
  const startDayOfWeek = getDayOfWeek(firstDay.date);

  for (let i = 0; i < startDayOfWeek; i++) {
    currentColumn.push({ date: '', intensity: -1, rate: 0, completed: 0, scheduled: 0 });
  }

  days.forEach((day) => {
    currentColumn.push(day);
    if (currentColumn.length === 7) {
      columns.push(currentColumn);
      currentColumn = [];
    }
  });

  if (currentColumn.length > 0) {
    while (currentColumn.length < 7) {
      currentColumn.push({ date: '', intensity: -1, rate: 0, completed: 0, scheduled: 0 });
    }
    columns.push(currentColumn);
  }

  const getIntensityColor = (intensity: number, isSelected: boolean) => {
    if (intensity === -1) return 'opacity-0 pointer-events-none';
    if (isSelected) return 'ring-2 ring-emerald-400 dark:ring-emerald-300 bg-emerald-500 text-white';

    switch (intensity) {
      case 0:
        return 'bg-zinc-100 dark:bg-[#15171D] hover:bg-zinc-200 dark:hover:bg-[#262A33] border border-transparent dark:border-[#262A33]/40';
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300';
      case 2:
        return 'bg-emerald-300 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100';
      case 3:
        return 'bg-emerald-400 dark:bg-emerald-600 text-white';
      case 4:
        return 'bg-emerald-500 dark:bg-emerald-500 text-white';
      default:
        return 'bg-zinc-100 dark:bg-[#15171D]';
    }
  };

  return (
    <div className="w-full relative select-none">
      {/* Floating tooltip */}
      {hoveredDay && hoveredDay.date && (
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-medium px-2.5 py-1 rounded shadow-md border border-zinc-700/50 z-30 pointer-events-none whitespace-nowrap flex items-center gap-1.5">
          <span>{formatReadableDate(hoveredDay.date, 'short')}:</span>
          <span className="font-bold text-emerald-400">{hoveredDay.rate}%</span>
          <span className="text-zinc-400 text-[10px]">({hoveredDay.completed}/{hoveredDay.scheduled} habits)</span>
        </div>
      )}

      {/* Grid Container with horizontal scroll if needed on very small devices */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex gap-1.5 min-w-max p-1">
          {/* Day of week labels */}
          <div className="flex flex-col justify-between py-0.5 text-[9px] font-semibold text-zinc-400 pr-1.5 select-none">
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>

          {/* Week columns */}
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-1.5">
              {col.map((d, rowIdx) => {
                if (d.intensity === -1) {
                  return <div key={rowIdx} className="w-3.5 h-3.5 opacity-0" />;
                }
                const isSelected = selectedDate === d.date;

                return (
                  <button
                    key={rowIdx}
                    type="button"
                    onClick={() => d.date && onSelectDate?.(d.date)}
                    onMouseEnter={() => setHoveredDay(d)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onTouchStart={() => setHoveredDay(d)}
                    className={`w-3.5 h-3.5 rounded-xs transition-all duration-150 transform hover:scale-125 focus:outline-none ${getIntensityColor(
                      d.intensity,
                      isSelected
                    )}`}
                    title={d.date ? `${d.date}: ${d.rate}% (${d.completed}/${d.scheduled})` : ''}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Intensity Legend */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-[#262A33] text-[10px] text-zinc-500 dark:text-zinc-400">
        <span>Consistency Heatmap</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-xs bg-zinc-100 dark:bg-[#15171D] border border-transparent dark:border-[#262A33]" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-950" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-800" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-600" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
