import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Calendar,
  Flame,
  PieChart,
  Sparkles,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TimeRangeFilter } from '../../types';
import { calculateAnalytics, getHeatmapGrid } from '../../utils/analyticsUtils';
import { BarChart } from '../charts/BarChart';
import { CalendarHeatmap } from '../charts/CalendarHeatmap';
import { DonutChart } from '../charts/DonutChart';
import { LineChart } from '../charts/LineChart';
import { ProgressRing } from '../charts/ProgressRing';
import { StreakCard } from '../charts/StreakCard';
import { calculateHabitStreak, calculateOverallStreaks } from '../../utils/streakUtils';

export const AnalyticsScreen: React.FC = () => {
  const { habits, logs, programs, setSelectedDate, setActiveTab, openHabitDetail } = useApp();
  const [timeFilter, setTimeFilter] = useState<TimeRangeFilter>('30d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const analytics = useMemo(() => {
    return calculateAnalytics(habits, logs, programs, timeFilter, customStart, customEnd);
  }, [habits, logs, programs, timeFilter, customStart, customEnd]);

  const overallStreaks = useMemo(() => {
    return calculateOverallStreaks(habits, logs);
  }, [habits, logs]);

  const heatmapDays = useMemo(() => {
    return getHeatmapGrid(habits, logs, 120);
  }, [habits, logs]);

  // Day of week bar chart items
  const dayOfWeekBarItems = useMemo(() => {
    return analytics.dayOfWeekStats.map(d => ({
      label: d.dayName,
      value: d.completionRate,
      subLabel: `${d.totalCompleted}/${d.totalScheduled}`,
      highlight: d.dayName === analytics.bestDayOfWeek,
      color: d.dayName === analytics.bestDayOfWeek ? '#10B981' : d.dayName === analytics.worstDayOfWeek ? '#F59E0B' : '#3B82F6',
    }));
  }, [analytics]);

  // Category donut segments
  const categorySegments = useMemo(() => {
    return analytics.categoryStats.map(c => ({
      label: c.category,
      value: c.completedCount || 1,
      color: c.color,
      subLabel: `${c.completionRate}% rate`,
    }));
  }, [analytics]);

  // Habit performance ranking
  const habitRankings = useMemo(() => {
    return habits
      .filter(h => !h.archived)
      .map(h => {
        const streak = calculateHabitStreak(h, logs);
        return {
          habit: h,
          ...streak,
        };
      })
      .sort((a, b) => b.completionRate - a.completionRate);
  }, [habits, logs]);

  const filterButtons: { id: TimeRangeFilter; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '3m', label: '3M' },
    { id: '6m', label: '6M' },
    { id: '1y', label: '1Y' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24">
      {/* Header Banner */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#1C1E24] via-[#161820] to-[#0F1115] text-white shadow-lg border border-[#262A33] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-Time Performance Engine</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Analytics & Insights
            </h2>
            <p className="text-xs text-zinc-400 max-w-xs">
              Deep statistical breakdown calculated directly from your habit records.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Time Range Filter Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setTimeFilter(btn.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              timeFilter === btn.id
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#262A33]'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Streak Hero Card */}
      <StreakCard
        currentStreak={overallStreaks.currentStreak}
        longestStreak={overallStreaks.longestStreak}
        overallConsistency={overallStreaks.overallConsistency}
      />

      {/* Core KPI Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Consistency Score Card */}
        <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>Consistency Score</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {analytics.consistencyScore}
            </span>
            <span className="text-xs font-bold text-zinc-400">/ 100</span>
          </div>
          <div className="text-[11px] font-semibold text-emerald-500 dark:text-emerald-400">
            {analytics.consistencyScore >= 80 ? 'Mastery Tier ⚡' : analytics.consistencyScore >= 60 ? 'Strong Flow ✨' : 'Building Rhythm 🌱'}
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>Completion Rate</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {analytics.overallCompletionRate}%
            </span>
          </div>
          {analytics.comparisonWithPreviousPeriod ? (
            <div className={`flex items-center text-[11px] font-semibold ${
              analytics.comparisonWithPreviousPeriod.isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500'
            }`}>
              {analytics.comparisonWithPreviousPeriod.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>{Math.abs(analytics.comparisonWithPreviousPeriod.rateDifference)}% vs prev period</span>
            </div>
          ) : (
            <div className="text-[11px] font-medium text-zinc-400">
              {analytics.totalCompletions} / {analytics.totalScheduled} habits
            </div>
          )}
        </div>

        {/* Total Active Days */}
        <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>Completed Days</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {overallStreaks.totalCompletedDays}
          </div>
          <p className="text-[10px] text-zinc-400">Days with ≥60% completion</p>
        </div>

        {/* Best Day of Week */}
        <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>Peak Day</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-emerald-500 dark:text-emerald-400">
            {analytics.bestDayOfWeek}
          </div>
          <p className="text-[10px] text-zinc-400">Your most productive day</p>
        </div>
      </div>

      {/* Line Chart: Completion Trend Over Time */}
      <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Completion Trend ({analytics.timeSeries.length} points)
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Orange dashed line indicates period average
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
            {analytics.overallCompletionRate}% Avg
          </span>
        </div>

        <LineChart data={analytics.timeSeries} height={170} />
      </div>

      {/* Bar Chart: Day of the Week Performance */}
      <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Weekday Adherence
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Best: <span className="font-bold text-emerald-500 dark:text-emerald-400">{analytics.bestDayOfWeek}</span> • Weakest: <span className="font-semibold text-zinc-500">{analytics.worstDayOfWeek}</span>
            </p>
          </div>
        </div>

        <BarChart items={dayOfWeekBarItems} height={150} targetLine={80} />
      </div>

      {/* Calendar Heatmap */}
      <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Activity Heatmap (Past 120 Days)
          </h3>
        </div>

        <CalendarHeatmap
          days={heatmapDays}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setActiveTab('calendar');
          }}
        />
      </div>

      {/* Category Distribution Donut */}
      {categorySegments.length > 0 && (
        <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Category Distribution
            </h3>
            <span className="text-xs font-semibold text-zinc-500">
              {analytics.categoryStats.length} Categories
            </span>
          </div>

          <DonutChart
            segments={categorySegments}
            centerTitle={`${analytics.totalCompletions}`}
            centerSubtitle="Completed"
          />
        </div>
      )}

      {/* Habit Leaderboard */}
      <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Habit Consistency Leaderboard
          </h3>
        </div>

        <div className="space-y-2.5">
          {habitRankings.map((item, idx) => (
            <div
              key={item.habit.id}
              onClick={() => openHabitDetail(item.habit.id)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-[#15171D] hover:bg-zinc-100 dark:hover:bg-[#262A33] transition-colors cursor-pointer border border-transparent dark:border-[#262A33]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-5 text-center text-xs font-black ${
                  idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-zinc-400' : idx === 2 ? 'text-amber-700' : 'text-zinc-400'
                }`}>
                  #{idx + 1}
                </span>

                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 text-xs"
                  style={{ backgroundColor: item.habit.color }}
                >
                  {item.habit.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {item.habit.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{item.currentStreak}d streak</span>
                    <span>•</span>
                    <span>{item.totalCompletions} total</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-500 dark:text-emerald-400">
                    {item.completionRate}%
                  </div>
                  <div className="text-[9px] text-zinc-400">rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
