import React from 'react';
import { Bell, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatReadableDate, getTimeBasedGreeting, getTodayString } from '../../utils/dateUtils';

interface AppHeaderProps {
  title?: string;
  showDatePicker?: boolean;
  onAddClick?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showDatePicker = true,
  onAddClick,
}) => {
  const {
    profile,
    selectedDate,
    setSelectedDate,
    setIsCreateHabitOpen,
    setIsNotificationsOpen,
    setActiveTab,
    activeTab,
  } = useApp();

  const greeting = getTimeBasedGreeting();
  const isToday = selectedDate === getTodayString();

  return (
    <div className="shrink-0 px-5 pt-3 pb-3 border-b border-zinc-100 dark:border-[#262A33] bg-white/90 dark:bg-[#0F1115]/95 backdrop-blur-md z-20">
      <div className="flex items-center justify-between gap-3">
        {/* Left: User & Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setActiveTab('profile')}
            className="relative w-10 h-10 rounded-full ring-2 ring-emerald-500/30 overflow-hidden shrink-0 transition-transform active:scale-95"
            title="View Profile"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0F1115]" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
              {greeting}, {profile.name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
              {title || (isToday ? "Today's Focus" : formatReadableDate(selectedDate, 'full'))}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Button */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-[#1C1E24] border border-zinc-200/60 dark:border-[#262A33] flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors relative"
            title="Reminders & Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1C1E24]" />
          </button>

          {/* Quick Create Habit button */}
          <button
            onClick={() => {
              if (onAddClick) onAddClick();
              else setIsCreateHabitOpen(true);
            }}
            className="h-9 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New</span>
          </button>
        </div>
      </div>
    </div>
  );
};
