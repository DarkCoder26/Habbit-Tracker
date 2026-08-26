import React from 'react';
import { Check, Flame, MoreVertical, Plus, Minus, Edit3, Eye, FastForward } from 'lucide-react';
import { Habit } from '../../types';
import { useApp } from '../../context/AppContext';
import { isHabitCompletedOnDate, calculateHabitStreak } from '../../utils/streakUtils';
import { IconRenderer } from '../common/IconRenderer';

interface HabitCardProps {
  habit: Habit;
  date?: string;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, date }) => {
  const {
    logs,
    selectedDate,
    toggleHabit,
    quickIncrementHabit,
    skipHabit,
    openHabitDetail,
    openLogModal,
  } = useApp();

  const targetDate = date || selectedDate;
  const { completed, value, log } = isHabitCompletedOnDate(habit, logs, targetDate);
  const streakInfo = calculateHabitStreak(habit, logs, targetDate);
  const isSkipped = log?.status === 'skipped';

  // Incremental step calculation
  const getStepDelta = () => {
    if (habit.unit === 'ml') return 250;
    if (habit.unit === 'mins') return 15;
    if (habit.unit === 'pages') return 5;
    if (habit.goalType === 'percentage') return 10;
    return 1;
  };

  const stepDelta = getStepDelta();
  const progressPercent = habit.goalType === 'boolean'
    ? (completed ? 100 : 0)
    : Math.min(100, Math.round((value / habit.targetValue) * 100));

  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all duration-200 border ${
        completed
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 dark:border-emerald-500/25 shadow-xs'
          : isSkipped
          ? 'bg-zinc-50/60 dark:bg-[#1C1E24]/60 border-zinc-200/60 dark:border-[#262A33]/60 opacity-60'
          : 'bg-white dark:bg-[#1C1E24] border-zinc-200/70 dark:border-[#262A33] shadow-xs hover:border-zinc-300 dark:hover:border-[#353A47]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon and Basic Info */}
        <div
          onClick={() => openHabitDetail(habit.id)}
          className="flex items-start gap-3.5 flex-1 min-w-0 cursor-pointer"
        >
          {/* Icon Badge */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs transition-transform group-hover:scale-105"
            style={{ backgroundColor: habit.color || '#10B981' }}
          >
            <IconRenderer name={habit.icon} className="w-5 h-5" />
          </div>

          {/* Texts */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {habit.name}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#262A33] text-zinc-600 dark:text-zinc-400">
                {habit.category}
              </span>
            </div>

            {/* Sub details: Streak & Target */}
            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1 font-semibold text-amber-500 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{streakInfo.currentStreak}d streak</span>
              </div>

              <span>•</span>

              <span className="font-medium">
                {habit.goalType === 'boolean' ? (
                  completed ? 'Done' : 'Target: 1x'
                ) : (
                  `${value} / ${habit.targetValue} ${habit.unit || ''}`
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Detailed Log Value Button (for duration / numeric goals) */}
          {habit.goalType !== 'boolean' && (
            <button
              onClick={() => openLogModal(habit.id)}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-[#262A33] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#323642] transition-colors"
              title="Log exact amount or add notes"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Primary Quick Checkbox Button */}
          <button
            onClick={() => toggleHabit(habit.id, targetDate)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
              completed
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/30'
                : 'bg-zinc-100 dark:bg-[#262A33] border border-zinc-200 dark:border-[#353A47] text-zinc-400 hover:text-emerald-500 hover:border-emerald-500'
            }`}
            title={completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <Check className={`w-5 h-5 stroke-[2.8] ${completed ? 'scale-100' : 'scale-75 opacity-0 group-hover:opacity-60'}`} />
          </button>
        </div>
      </div>

      {/* Progress Bar & Quick Steppers for Numeric/Duration Habits */}
      {habit.goalType !== 'boolean' && (
        <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-[#262A33]/80">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              {progressPercent}% completed
            </span>

            {/* Steppers */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  quickIncrementHabit(habit.id, -stepDelta, targetDate);
                }}
                disabled={value <= 0}
                className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-[#262A33] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#323642] disabled:opacity-30 flex items-center justify-center transition-colors"
                title={`-${stepDelta} ${habit.unit || ''}`}
              >
                <Minus className="w-3 h-3" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  quickIncrementHabit(habit.id, stepDelta, targetDate);
                }}
                className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-[#262A33] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#323642] flex items-center justify-center transition-colors font-bold"
                title={`+${stepDelta} ${habit.unit || ''}`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Bar track */}
          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-[#262A33] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: completed ? '#10B981' : habit.color || '#6366f1',
              }}
            />
          </div>
        </div>
      )}

      {/* Note preview if logged */}
      {log?.note && (
        <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-[#262A33]/70 text-xs text-zinc-600 dark:text-zinc-400 italic">
          "{log.note}"
        </div>
      )}
    </div>
  );
};
