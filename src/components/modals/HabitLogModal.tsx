import React, { useState } from 'react';
import { X, Check, FastForward, FileText, Plus, Minus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IconRenderer } from '../common/IconRenderer';
import { isHabitCompletedOnDate } from '../../utils/streakUtils';

export const HabitLogModal: React.FC = () => {
  const {
    isLogModalOpen,
    setIsLogModalOpen,
    activeLogHabitId,
    habits,
    logs,
    selectedDate,
    logHabitValue,
    skipHabit,
  } = useApp();

  const habit = habits.find(h => h.id === activeLogHabitId);
  const currentStatus = habit ? isHabitCompletedOnDate(habit, logs, selectedDate) : null;

  const [value, setValue] = useState<number>(currentStatus?.value || habit?.targetValue || 1);
  const [note, setNote] = useState<string>(currentStatus?.log?.note || '');

  if (!isLogModalOpen || !habit) return null;

  const handleSave = () => {
    logHabitValue(habit.id, Number(value), note.trim(), selectedDate);
    setIsLogModalOpen(false);
  };

  const handleSkip = () => {
    skipHabit(habit.id, selectedDate);
    setIsLogModalOpen(false);
  };

  const stepDelta = habit.unit === 'ml' ? 250 : habit.unit === 'mins' ? 15 : habit.unit === 'pages' ? 5 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-[#1C1E24] rounded-3xl shadow-2xl border border-zinc-200 dark:border-[#262A33] p-5 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: habit.color }}
            >
              <IconRenderer name={habit.icon} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Log {habit.name}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Target: {habit.targetValue} {habit.unit || ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLogModalOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Value Stepper */}
        {habit.goalType !== 'boolean' && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200/80 dark:border-[#262A33] text-center space-y-3">
            <div className="text-[11px] font-bold text-zinc-500 uppercase">
              Actual Tracked Value
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setValue(v => Math.max(0, v - stepDelta))}
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#262A33] border border-zinc-200 dark:border-[#323642] flex items-center justify-center text-zinc-700 dark:text-zinc-200 shadow-xs hover:bg-zinc-100 dark:hover:bg-[#323642]"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={value}
                  onChange={e => setValue(Number(e.target.value))}
                  className="w-24 text-2xl font-black text-center bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <span className="text-xs font-bold text-zinc-400">{habit.unit}</span>
              </div>

              <button
                type="button"
                onClick={() => setValue(v => v + stepDelta)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#262A33] border border-zinc-200 dark:border-[#323642] flex items-center justify-center text-zinc-700 dark:text-zinc-200 shadow-xs hover:bg-zinc-100 dark:hover:bg-[#323642]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Note input */}
        <div className="space-y-1.5">
          <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>Reflection Note (Optional)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Read chapter 4 on system architecture, great insights..."
            rows={3}
            className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33] text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-500/40 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-[#262A33]">
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#262A33] font-semibold text-xs"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Skip Today</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#262A33]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
            >
              Save Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
