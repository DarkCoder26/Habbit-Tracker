import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
  Plus,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HabitCard } from '../habits/HabitCard';
import {
  addDays,
  formatReadableDate,
  getMonthCalendarMatrix,
  getTodayString,
  parseISODate,
} from '../../utils/dateUtils';
import { isHabitCompletedOnDate, isHabitScheduledOnDate } from '../../utils/streakUtils';

export const CalendarScreen: React.FC = () => {
  const { habits, logs, programs, selectedDate, setSelectedDate, setIsCreateHabitOpen } = useApp();

  const todayStr = getTodayString();
  const initialDate = parseISODate(selectedDate || todayStr);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Calendar weeks matrix
  const matrix = useMemo(() => {
    return getMonthCalendarMatrix(currentYear, currentMonth, 1); // Monday start
  }, [currentYear, currentMonth]);

  const monthLabel = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Selected date statistics
  const dayStats = useMemo(() => {
    const scheduled = habits.filter(h => isHabitScheduledOnDate(h, selectedDate));
    const completed = scheduled.filter(h => isHabitCompletedOnDate(h, logs, selectedDate).completed);
    const missed = scheduled.filter(h => !isHabitCompletedOnDate(h, logs, selectedDate).completed);
    const activeProgs = programs.filter(p => p.status === 'active' && p.startDate <= selectedDate && p.endDate >= selectedDate);
    const rate = scheduled.length > 0 ? Math.round((completed.length / scheduled.length) * 100) : 0;

    return {
      scheduled,
      completed,
      missed,
      activeProgs,
      rate,
    };
  }, [habits, logs, programs, selectedDate]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24">
      {/* Month Navigation Banner */}
      <div className="rounded-3xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#262A33] text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {monthLabel}
            </h2>
            {selectedDate !== todayStr && (
              <button
                onClick={() => {
                  const now = new Date();
                  setCurrentYear(now.getFullYear());
                  setCurrentMonth(now.getMonth());
                  setSelectedDate(todayStr);
                }}
                className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 transition-colors"
              >
                Today
              </button>
            )}
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#262A33] text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {matrix.flat().map((dateStr, idx) => {
            if (!dateStr) {
              return <div key={`empty-${idx}`} className="h-11 rounded-xl opacity-0 pointer-events-none" />;
            }

            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const dateObj = parseISODate(dateStr);
            const dayNum = dateObj.getDate();

            // Calculate day completion status
            const scheduled = habits.filter(h => isHabitScheduledOnDate(h, dateStr));
            const completed = scheduled.filter(h => isHabitCompletedOnDate(h, logs, dateStr).completed);
            const isFull = scheduled.length > 0 && completed.length === scheduled.length;
            const isPartial = completed.length > 0 && !isFull;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-12 rounded-xl flex flex-col items-center justify-between p-1 transition-all relative ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-400/40 font-bold z-10'
                    : isToday
                    ? 'bg-zinc-100 dark:bg-[#262A33] border-2 border-emerald-500 text-zinc-900 dark:text-zinc-100 font-bold'
                    : 'hover:bg-zinc-100 dark:hover:bg-[#262A33]/60 text-zinc-700 dark:text-zinc-300 font-semibold'
                }`}
              >
                <span className="text-xs">{dayNum}</span>

                {/* Status Dot / Indicator */}
                <div className="flex items-center gap-0.5 pb-0.5">
                  {isFull ? (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                  ) : isPartial ? (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-amber-400'}`} />
                  ) : scheduled.length > 0 ? (
                    <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/40' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                  ) : (
                    <div className="w-1 h-1 opacity-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Section */}
      <div className="space-y-4">
        {/* Day Summary Card */}
        <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {selectedDate === todayStr ? "Today's Status" : 'Selected Date'}
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {formatReadableDate(selectedDate, 'full')}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {dayStats.completed.length} of {dayStats.scheduled.length} habits completed
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-emerald-500 dark:text-emerald-400">
              {dayStats.rate}%
            </div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase">
              Score
            </div>
          </div>
        </div>

        {/* Active Programs on this date */}
        {dayStats.activeProgs.length > 0 && (
          <div className="rounded-2xl p-3.5 bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-blue-900 dark:text-blue-200">
                Active Program: {dayStats.activeProgs[0].name}
              </span>
            </div>
            <span className="font-bold text-blue-600 dark:text-blue-300">
              Day {parseISODate(selectedDate) >= parseISODate(dayStats.activeProgs[0].startDate) ? 
                Math.floor((parseISODate(selectedDate).getTime() - parseISODate(dayStats.activeProgs[0].startDate).getTime()) / (1000*60*60*24)) + 1 : 1}
            </span>
          </div>
        )}

        {/* Habits Due for selected day */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Scheduled Habits ({dayStats.scheduled.length})
            </h4>
            <button
              onClick={() => setIsCreateHabitOpen(true)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {dayStats.scheduled.length === 0 ? (
            <div className="text-center py-8 rounded-2xl bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] text-xs text-zinc-400">
              No habits scheduled on this date.
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayStats.scheduled.map(habit => (
                <HabitCard key={habit.id} habit={habit} date={selectedDate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
