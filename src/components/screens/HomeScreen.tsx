import React, { useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
  Plus,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HabitCard } from '../habits/HabitCard';
import { ProgramCard } from '../programs/ProgramCard';
import { ProgressRing } from '../charts/ProgressRing';
import { AVAILABLE_CATEGORIES } from '../common/IconRenderer';
import { addDays, formatReadableDate, getTodayString, getWeekDates } from '../../utils/dateUtils';
import { isHabitCompletedOnDate, isHabitScheduledOnDate } from '../../utils/streakUtils';

export const HomeScreen: React.FC = () => {
  const {
    habits,
    logs,
    programs,
    selectedDate,
    setSelectedDate,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setIsCreateHabitOpen,
    setIsCreateProgramOpen,
    todayProgress,
    setActiveTab,
  } = useApp();

  const todayStr = getTodayString();
  const isSelectedToday = selectedDate === todayStr;

  // Generate 7-day week scrubber around selectedDate
  const currentWeek = useMemo(() => {
    return getWeekDates(selectedDate, 1);
  }, [selectedDate]);

  // Filter habits scheduled for selected date
  const scheduledHabits = useMemo(() => {
    return habits.filter(h => {
      if (!isHabitScheduledOnDate(h, selectedDate)) return false;
      if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          h.name.toLowerCase().includes(query) ||
          h.description.toLowerCase().includes(query) ||
          h.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [habits, selectedDate, selectedCategory, searchQuery]);

  // Group into pending vs completed
  const { pendingHabits, completedHabits } = useMemo(() => {
    const pending: typeof scheduledHabits = [];
    const completed: typeof scheduledHabits = [];

    scheduledHabits.forEach(h => {
      const isDone = isHabitCompletedOnDate(h, logs, selectedDate).completed;
      if (isDone) completed.push(h);
      else pending.push(h);
    });

    return { pendingHabits: pending, completedHabits: completed };
  }, [scheduledHabits, logs, selectedDate]);

  // Active programs preview
  const activePrograms = useMemo(() => {
    return programs.filter(p => p.status === 'active');
  }, [programs]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24">
      {/* 7-Day Quick Date Scrubber */}
      <div className="bg-white dark:bg-[#1C1E24] rounded-2xl p-3 border border-zinc-200/80 dark:border-[#262A33] shadow-xs">
        <div className="flex items-center justify-between mb-2 px-1 text-xs">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#262A33] text-zinc-500 transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>{formatReadableDate(selectedDate, 'month-year')}</span>
            {!isSelectedToday && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-[10px] bg-emerald-500/10 text-emerald-500 font-semibold px-2 py-0.5 rounded-full ml-1 hover:bg-emerald-500/20 transition-colors"
              >
                Jump to Today
              </button>
            )}
          </div>

          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#262A33] text-zinc-500 transition-colors"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 7 Day Buttons */}
        <div className="grid grid-cols-7 gap-1">
          {currentWeek.map(dateStr => {
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const dayDate = new Date(dateStr);
            const dayNum = dayDate.getDate();
            const dayShort = dayDate.toLocaleDateString('en-US', { weekday: 'narrow' });

            // Check completion for that day
            const scheduledForDay = habits.filter(h => isHabitScheduledOnDate(h, dateStr));
            const completedForDay = scheduledForDay.filter(h => isHabitCompletedOnDate(h, logs, dateStr).completed);
            const isFullyDone = scheduledForDay.length > 0 && completedForDay.length === scheduledForDay.length;
            const isPartiallyDone = completedForDay.length > 0 && !isFullyDone;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all relative ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-400/40'
                    : isToday
                    ? 'bg-zinc-100 dark:bg-[#262A33] text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'hover:bg-zinc-100 dark:hover:bg-[#262A33]/60 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span className={`text-[10px] font-semibold uppercase ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>
                  {dayShort}
                </span>
                <span className="text-sm font-bold mt-0.5">{dayNum}</span>

                {/* Status Dot */}
                <div className="mt-1 h-1.5 flex items-center justify-center">
                  {isFullyDone ? (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                  ) : isPartiallyDone ? (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/60' : 'bg-amber-400'}`} />
                  ) : (
                    <div className="w-1.5 h-1.5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Overview Banner Card */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#1C1E24] via-[#181A20] to-[#121418] text-white shadow-lg border border-[#262A33] relative overflow-hidden">
        {/* Subtle background glow circle */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSelectedToday ? "Today's Performance" : `Overview for ${formatReadableDate(selectedDate, 'short')}`}</span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white">
              {todayProgress.completionPercentage}% Complete
            </h2>

            <p className="text-xs text-zinc-400 mt-1">
              {todayProgress.completedCount} of {todayProgress.scheduledCount} habits completed
            </p>

            {/* Quick Stat Pill Row */}
            <div className="flex items-center gap-2 mt-3.5 flex-wrap">
              <div className="flex items-center gap-1 text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs text-amber-300">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{todayProgress.currentStreak}d Streak</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs text-emerald-300">
                <Zap className="w-3.5 h-3.5" />
                <span>{todayProgress.overallConsistency}% Consistency</span>
              </div>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="shrink-0">
            <ProgressRing
              progress={todayProgress.completionPercentage}
              size={96}
              strokeWidth={9}
              color="#10B981"
              bgColor="rgba(255,255,255,0.12)"
              textClassName="text-lg font-black text-white"
              subText="DONE"
            />
          </div>
        </div>
      </div>

      {/* Category Pills Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedCategory === 'All'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
              : 'bg-zinc-100 dark:bg-[#1C1E24] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-[#262A33] border border-transparent dark:border-[#262A33]'
          }`}
        >
          All Habits
        </button>

        {AVAILABLE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === cat
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'bg-zinc-100 dark:bg-[#1C1E24] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-[#262A33] border border-transparent dark:border-[#262A33]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search habits or categories..."
          className="w-full pl-9.5 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Active Programs Section Preview */}
      {activePrograms.length > 0 && selectedCategory === 'All' && !searchQuery && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Active Programs
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('programs')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View all ({activePrograms.length})
            </button>
          </div>

          <div className="space-y-3">
            {activePrograms.slice(0, 2).map(program => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      )}

      {/* Habits List Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Today's Schedule ({scheduledHabits.length})
          </h3>
          <button
            onClick={() => setIsCreateHabitOpen(true)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Habit</span>
          </button>
        </div>

        {/* Empty State if no scheduled habits */}
        {scheduledHabits.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No habits scheduled
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              {searchQuery || selectedCategory !== 'All'
                ? 'No habits matched your filter criteria.'
                : 'You have no habits scheduled for this day. Build a new habit or start a challenge!'}
            </p>
            <button
              onClick={() => setIsCreateHabitOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold text-xs shadow-xs hover:bg-emerald-600 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Habit</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Habits */}
            {pendingHabits.length > 0 && (
              <div className="space-y-2.5">
                {pendingHabits.map(habit => (
                  <HabitCard key={habit.id} habit={habit} date={selectedDate} />
                ))}
              </div>
            )}

            {/* Completed Habits Section */}
            {completedHabits.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Completed ({completedHabits.length})
                  </span>
                </div>
                {completedHabits.map(habit => (
                  <HabitCard key={habit.id} habit={habit} date={selectedDate} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (Mobile-First Quick Action) */}
      <div className="fixed bottom-20 right-5 sm:absolute sm:bottom-20 sm:right-6 z-20 pointer-events-none">
        <button
          onClick={() => setIsCreateHabitOpen(true)}
          className="pointer-events-auto w-13 h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-90 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all duration-200"
          title="Create New Habit"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
