import React from 'react';
import { X, Bell, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IconRenderer } from '../common/IconRenderer';

export const NotificationCenterModal: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, habits, showToast } = useApp();

  if (!isNotificationsOpen) return null;

  const reminderHabits = habits.filter(h => h.reminderEnabled && h.reminderTime);

  const handleTestReminder = (habitName: string) => {
    showToast(`⏰ Habit Reminder!`, `Time for: ${habitName}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-[#1C1E24] rounded-3xl shadow-2xl border border-zinc-200 dark:border-[#262A33] p-5 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Reminders & Schedule
              </h3>
              <p className="text-[11px] text-zinc-400">
                {reminderHabits.length} active habit triggers
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reminders list */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {reminderHabits.length === 0 ? (
            <div className="text-center py-6 text-zinc-400">
              No habit reminders enabled. Edit any habit to set reminder times.
            </div>
          ) : (
            reminderHabits.map(h => (
              <div
                key={h.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200/80 dark:border-[#262A33]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: h.color }}
                  >
                    <IconRenderer name={h.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {h.name}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{h.reminderTime} Daily</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleTestReminder(h.name)}
                  className="text-[10px] bg-zinc-200 dark:bg-[#262A33] hover:bg-zinc-300 dark:hover:bg-[#323642] text-zinc-800 dark:text-zinc-200 font-bold px-2 py-1 rounded-lg"
                >
                  Test
                </button>
              </div>
            ))
          )}
        </div>

        {/* Daily Digest Summary */}
        <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="text-[11px] text-emerald-950 dark:text-emerald-200">
            <span className="font-bold">Evening Digest:</span> Daily summary alert scheduled for 20:30.
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
