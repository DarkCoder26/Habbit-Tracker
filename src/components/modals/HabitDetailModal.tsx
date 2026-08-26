import React, { useMemo, useState } from 'react';
import {
  X,
  Flame,
  Trophy,
  Calendar,
  Trash2,
  Edit3,
  CheckCircle2,
  TrendingUp,
  Activity,
  Archive,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateHabitStreak, isHabitCompletedOnDate, isHabitScheduledOnDate } from '../../utils/streakUtils';
import { LineChart } from '../charts/LineChart';
import { IconRenderer } from '../common/IconRenderer';
import { addDays, formatReadableDate, getMonthCalendarMatrix, getPastDates, getTodayString, parseISODate } from '../../utils/dateUtils';

export const HabitDetailModal: React.FC = () => {
  const {
    isHabitDetailOpen,
    setIsHabitDetailOpen,
    selectedHabitId,
    habits,
    logs,
    deleteHabit,
    updateHabit,
  } = useApp();

  const habit = habits.find(h => h.id === selectedHabitId);
  const [timeFilter, setTimeFilter] = useState<'30d' | '90d' | 'all'>('30d');

  const todayStr = getTodayString();
  const streakInfo = useMemo(() => {
    if (!habit) return { currentStreak: 0, longestStreak: 0, totalCompletions: 0, totalActiveDays: 0, completionRate: 0 };
    return calculateHabitStreak(habit, logs);
  }, [habit, logs]);

  // Generate chart time series data for this habit
  const habitTimeSeries = useMemo(() => {
    if (!habit) return [];
    const daysCount = timeFilter === '30d' ? 30 : timeFilter === '90d' ? 90 : 180;
    const dates = getPastDates(daysCount, todayStr);

    return dates.map(d => {
      const scheduled = isHabitScheduledOnDate(habit, d);
      const comp = isHabitCompletedOnDate(habit, logs, d);
      const rate = comp.completed ? 100 : comp.value > 0 ? Math.round((comp.value / habit.targetValue) * 100) : 0;

      return {
        date: d,
        label: parseISODate(d).getDate().toString(),
        completionRate: scheduled ? rate : 0,
        completedCount: comp.completed ? 1 : 0,
        scheduledCount: scheduled ? 1 : 0,
        valueSum: comp.value,
      };
    });
  }, [habit, logs, timeFilter]);

  // Mini-calendar month grid for this habit
  const currentMonthDate = new Date();
  const monthMatrix = useMemo(() => {
    return getMonthCalendarMatrix(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
  }, []);

  if (!isHabitDetailOpen || !habit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-[#1C1E24] rounded-3xl shadow-2xl border border-zinc-200 dark:border-[#262A33] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-[#262A33] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: habit.color }}
            >
              <IconRenderer name={habit.icon} className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {habit.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#262A33] text-zinc-600 dark:text-zinc-400">
                  {habit.category}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {habit.description || 'Dedicated habit analytics & history'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsHabitDetailOpen(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Key KPI Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/20 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                <Flame className="w-3 h-3 fill-current" />
                <span>Current</span>
              </div>
              <div className="text-xl font-black text-amber-500 mt-0.5">
                {streakInfo.currentStreak}d
              </div>
              <div className="text-[9px] text-zinc-500">Streak</div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200/80 dark:border-[#262A33] text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-400 uppercase">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span>Best Peak</span>
              </div>
              <div className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                {streakInfo.longestStreak}d
              </div>
              <div className="text-[9px] text-zinc-500">All-time record</div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                <Activity className="w-3 h-3" />
                <span>Adherence</span>
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {streakInfo.completionRate}%
              </div>
              <div className="text-[9px] text-zinc-500">{streakInfo.totalCompletions} / {streakInfo.totalActiveDays} days</div>
            </div>
          </div>

          {/* Goal & Frequency Specifications */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200/80 dark:border-[#262A33] space-y-2">
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Configuration & Targets
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-400">Target Goal:</span>{' '}
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {habit.goalType === 'boolean' ? 'Completion Checkbox' : `${habit.targetValue} ${habit.unit || ''}`}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Frequency:</span>{' '}
                <span className="font-bold text-zinc-800 dark:text-zinc-200 capitalize">
                  {habit.frequency.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Reminder:</span>{' '}
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {habit.reminderEnabled && habit.reminderTime ? `${habit.reminderTime} Daily` : 'Disabled'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Difficulty:</span>{' '}
                <span className="font-bold text-zinc-800 dark:text-zinc-200 capitalize">
                  {habit.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Value Progress Trend Line Chart */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#15171D] border border-zinc-200/80 dark:border-[#262A33] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Completion Trend
              </h3>
              <div className="flex gap-1">
                {(['30d', '90d', 'all'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      timeFilter === f
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-[#262A33] text-zinc-500'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <LineChart data={habitTimeSeries} height={140} strokeColor={habit.color} />
          </div>

          {/* Month Calendar Adherence Grid for This Habit */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#15171D] border border-zinc-200/80 dark:border-[#262A33] space-y-2.5 shadow-xs">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Current Month Consistency Grid
            </h3>

            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-zinc-400 uppercase">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthMatrix.flat().map((dateStr, idx) => {
                if (!dateStr) return <div key={idx} className="h-7 opacity-0" />;

                const scheduled = isHabitScheduledOnDate(habit, dateStr);
                const comp = isHabitCompletedOnDate(habit, logs, dateStr);
                const dateObj = parseISODate(dateStr);
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={dateStr}
                    className={`h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                      comp.completed
                        ? 'bg-emerald-500 text-white'
                        : scheduled
                        ? dateStr <= todayStr
                          ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          : 'bg-zinc-100 dark:bg-[#262A33] text-zinc-400'
                        : 'bg-zinc-50 dark:bg-[#1C1E24] text-zinc-300 dark:text-zinc-700'
                    } ${isToday ? 'ring-2 ring-zinc-900 dark:ring-white' : ''}`}
                    title={`${dateStr}: ${comp.completed ? 'Completed' : scheduled ? 'Missed' : 'Not Scheduled'}`}
                  >
                    {dateObj.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions: Archive / Delete */}
        <div className="p-4 border-t border-zinc-100 dark:border-[#262A33] flex items-center justify-between bg-zinc-50 dark:bg-[#15171D]">
          <button
            onClick={() => {
              deleteHabit(habit.id);
              setIsHabitDetailOpen(false);
            }}
            className="flex items-center gap-1 px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl font-bold text-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <button
            onClick={() => setIsHabitDetailOpen(false)}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
