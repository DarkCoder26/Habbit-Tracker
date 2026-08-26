import { Habit, HabitLog, Program, TimeRangeFilter } from '../types';
import { addDays, formatDateToISO, getDayName, getDayOfWeek, getPastDates, getTodayString, parseISODate } from './dateUtils';
import { isHabitCompletedOnDate, isHabitScheduledOnDate } from './streakUtils';

export interface TimeSeriesPoint {
  date: string;
  label: string;
  completionRate: number;
  completedCount: number;
  scheduledCount: number;
  valueSum?: number;
}

export interface CategoryStat {
  category: string;
  totalHabits: number;
  completedCount: number;
  scheduledCount: number;
  completionRate: number;
  color: string;
}

export interface DayOfWeekStat {
  dayName: string;
  dayIndex: number;
  completionRate: number;
  totalCompleted: number;
  totalScheduled: number;
}

export interface AnalyticsSummary {
  timeRange: TimeRangeFilter;
  startDate: string;
  endDate: string;
  totalActiveHabits: number;
  totalCompletions: number;
  totalScheduled: number;
  overallCompletionRate: number;
  activeProgramsCount: number;
  bestDayOfWeek: string;
  worstDayOfWeek: string;
  consistencyScore: number;
  timeSeries: TimeSeriesPoint[];
  categoryStats: CategoryStat[];
  dayOfWeekStats: DayOfWeekStat[];
  comparisonWithPreviousPeriod?: {
    rateDifference: number; // e.g. +14%
    isPositive: boolean;
    previousRate: number;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  Health: '#10B981', // Emerald
  Fitness: '#3B82F6', // Blue
  Productivity: '#8B5CF6', // Purple
  Learning: '#F59E0B', // Amber
  Mindfulness: '#EC4899', // Pink
  Finance: '#14B8A6', // Teal
  Creativity: '#F97316', // Orange
  Social: '#06B6D4', // Cyan
  Default: '#6366F1', // Indigo
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;
}

/**
 * Returns date range strings based on selected filter
 */
export function getDatesForFilter(
  filter: TimeRangeFilter,
  customStart?: string,
  customEnd?: string,
  todayStr: string = getTodayString()
): { startDate: string; endDate: string; dates: string[] } {
  let days = 7;
  let endDate = todayStr;

  switch (filter) {
    case 'today':
      return { startDate: todayStr, endDate: todayStr, dates: [todayStr] };
    case '7d':
      days = 7;
      break;
    case '30d':
      days = 30;
      break;
    case '3m':
      days = 90;
      break;
    case '6m':
      days = 180;
      break;
    case '1y':
      days = 365;
      break;
    case 'all':
      days = 365; // up to 1 year for smooth charts
      break;
    case 'custom':
      if (customStart && customEnd) {
        const start = customStart < customEnd ? customStart : customEnd;
        const end = customStart < customEnd ? customEnd : customStart;
        const dates: string[] = [];
        let curr = start;
        while (curr <= end) {
          dates.push(curr);
          curr = addDays(curr, 1);
        }
        return { startDate: start, endDate: end, dates };
      }
      days = 30;
      break;
  }

  const startDate = addDays(endDate, -(days - 1));
  const dates = getPastDates(days, endDate);
  return { startDate, endDate, dates };
}

/**
 * Calculates complete analytics for a specified time range.
 */
export function calculateAnalytics(
  habits: Habit[],
  logs: HabitLog[],
  programs: Program[],
  filter: TimeRangeFilter,
  customStart?: string,
  customEnd?: string,
  todayStr: string = getTodayString()
): AnalyticsSummary {
  const { startDate, endDate, dates } = getDatesForFilter(filter, customStart, customEnd, todayStr);
  const activeHabits = habits.filter(h => !h.archived);

  let totalScheduled = 0;
  let totalCompletions = 0;

  // Day of week accumulators (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const dowScheduled = [0, 0, 0, 0, 0, 0, 0];
  const dowCompleted = [0, 0, 0, 0, 0, 0, 0];

  // Category accumulators
  const categoryMap = new Map<string, { scheduled: number; completed: number; habitIds: Set<string> }>();

  // Time series points
  const timeSeries: TimeSeriesPoint[] = [];

  dates.forEach(d => {
    const dow = getDayOfWeek(d);
    let dayScheduled = 0;
    let dayCompleted = 0;

    activeHabits.forEach(h => {
      const scheduled = isHabitScheduledOnDate(h, d);
      if (scheduled) {
        dayScheduled++;
        dowScheduled[dow]++;
        totalScheduled++;

        const cat = h.category || 'General';
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { scheduled: 0, completed: 0, habitIds: new Set() });
        }
        const catData = categoryMap.get(cat)!;
        catData.scheduled++;
        catData.habitIds.add(h.id);

        const comp = isHabitCompletedOnDate(h, logs, d);
        if (comp.completed) {
          dayCompleted++;
          dowCompleted[dow]++;
          totalCompletions++;
          catData.completed++;
        }
      }
    });

    const dayRate = dayScheduled > 0 ? Math.round((dayCompleted / dayScheduled) * 100) : 0;
    const label = dates.length <= 7 
      ? getDayName(d, 'short') 
      : dates.length <= 31 
        ? parseISODate(d).getDate().toString() 
        : parseISODate(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    timeSeries.push({
      date: d,
      label,
      completionRate: dayRate,
      completedCount: dayCompleted,
      scheduledCount: dayScheduled,
    });
  });

  const overallCompletionRate = totalScheduled > 0 ? Math.round((totalCompletions / totalScheduled) * 100) : 0;

  // Day of week stats
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeekStats: DayOfWeekStat[] = dayNames.map((name, idx) => {
    const sched = dowScheduled[idx];
    const comp = dowCompleted[idx];
    return {
      dayName: name,
      dayIndex: idx,
      completionRate: sched > 0 ? Math.round((comp / sched) * 100) : 0,
      totalCompleted: comp,
      totalScheduled: sched,
    };
  });

  // Calculate best and worst day of week
  const validDays = dayOfWeekStats.filter(d => d.totalScheduled > 0);
  let bestDayOfWeek = 'Monday';
  let worstDayOfWeek = 'Sunday';

  if (validDays.length > 0) {
    const sorted = [...validDays].sort((a, b) => b.completionRate - a.completionRate);
    bestDayOfWeek = sorted[0].dayName;
    worstDayOfWeek = sorted[sorted.length - 1].dayName;
  }

  // Category stats
  const categoryStats: CategoryStat[] = Array.from(categoryMap.entries()).map(([cat, data]) => ({
    category: cat,
    totalHabits: data.habitIds.size,
    completedCount: data.completed,
    scheduledCount: data.scheduled,
    completionRate: data.scheduled > 0 ? Math.round((data.completed / data.scheduled) * 100) : 0,
    color: getCategoryColor(cat),
  })).sort((a, b) => b.completionRate - a.completionRate);

  // Calculate comparison with previous period
  let comparisonWithPreviousPeriod: AnalyticsSummary['comparisonWithPreviousPeriod'] | undefined = undefined;
  if (dates.length >= 7 && dates.length <= 90) {
    const periodLength = dates.length;
    const prevEndDate = addDays(startDate, -1);
    const prevDates = getPastDates(periodLength, prevEndDate);

    let prevScheduled = 0;
    let prevCompleted = 0;

    prevDates.forEach(d => {
      activeHabits.forEach(h => {
        if (isHabitScheduledOnDate(h, d)) {
          prevScheduled++;
          if (isHabitCompletedOnDate(h, logs, d).completed) {
            prevCompleted++;
          }
        }
      });
    });

    if (prevScheduled > 0) {
      const prevRate = Math.round((prevCompleted / prevScheduled) * 100);
      const diff = overallCompletionRate - prevRate;
      comparisonWithPreviousPeriod = {
        rateDifference: diff,
        isPositive: diff >= 0,
        previousRate: prevRate,
      };
    }
  }

  // Consistency Score formula (0-100):
  // 60% weight on completion rate + 40% weight on standard deviation stability / active days
  let consistencyScore = 0;
  if (totalScheduled > 0) {
    const activeDaysWithHabits = timeSeries.filter(p => p.scheduledCount > 0);
    const daysOverThreshold = activeDaysWithHabits.filter(p => p.completionRate >= 70).length;
    const stabilityRatio = activeDaysWithHabits.length > 0 ? daysOverThreshold / activeDaysWithHabits.length : 0;
    consistencyScore = Math.min(100, Math.round(overallCompletionRate * 0.6 + stabilityRatio * 100 * 0.4));
  }

  return {
    timeRange: filter,
    startDate,
    endDate,
    totalActiveHabits: activeHabits.length,
    totalCompletions,
    totalScheduled,
    overallCompletionRate,
    activeProgramsCount: programs.filter(p => p.status === 'active').length,
    bestDayOfWeek,
    worstDayOfWeek,
    consistencyScore,
    timeSeries,
    categoryStats,
    dayOfWeekStats,
    comparisonWithPreviousPeriod,
  };
}

/**
 * Calculates program progress metrics.
 */
export function calculateProgramProgress(program: Program, habits: Habit[], logs: HabitLog[], todayStr: string = getTodayString()) {
  const linkedHabits = habits.filter(h => program.dailyTargetHabitIds.includes(h.id) || h.programId === program.id);
  const totalDays = program.durationDays || 30;
  const start = program.startDate;
  const end = program.endDate;

  // Calculate elapsed days
  const elapsedDays = Math.max(0, Math.min(totalDays, Math.floor((parseISODate(todayStr).getTime() - parseISODate(start).getTime()) / (1000 * 60 * 60 * 24)) + 1));
  const remainingDays = Math.max(0, totalDays - elapsedDays);

  // Calculate completion days
  let daysCompleted = 0;
  let missedDays = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  const milestoneProgress = program.milestones.map(m => {
    const isAchieved = elapsedDays >= m.targetDay;
    return {
      ...m,
      isAchieved: !!m.achievedDate || isAchieved,
      progressPercent: Math.min(100, Math.round((elapsedDays / m.targetDay) * 100)),
    };
  });

  const dailyHistory: { date: string; dayNumber: number; isCompleted: boolean; rate: number }[] = [];

  for (let i = 0; i < elapsedDays; i++) {
    const d = addDays(start, i);
    if (d > todayStr) break;

    const scheduled = linkedHabits.filter(h => isHabitScheduledOnDate(h, d));
    let compCount = 0;
    if (scheduled.length > 0) {
      scheduled.forEach(h => {
        if (isHabitCompletedOnDate(h, logs, d).completed) compCount++;
      });
      const rate = compCount / scheduled.length;
      const isDaySuccess = rate >= 0.6; // 60%+ success
      if (isDaySuccess) {
        daysCompleted++;
        runningStreak++;
        if (runningStreak > longestStreak) longestStreak = runningStreak;
      } else {
        if (d !== todayStr) missedDays++;
        runningStreak = 0;
      }
      dailyHistory.push({
        date: d,
        dayNumber: i + 1,
        isCompleted: isDaySuccess,
        rate: Math.round(rate * 100),
      });
    } else {
      // Default to 1 completion check
      dailyHistory.push({ date: d, dayNumber: i + 1, isCompleted: true, rate: 100 });
      daysCompleted++;
      runningStreak++;
    }
  }

  currentStreak = runningStreak;
  const overallCompletionRate = totalDays > 0 ? Math.min(100, Math.round((daysCompleted / totalDays) * 100)) : 0;

  return {
    elapsedDays,
    remainingDays,
    daysCompleted,
    missedDays,
    currentStreak,
    longestStreak,
    overallCompletionRate,
    milestoneProgress,
    dailyHistory,
    isFinished: elapsedDays >= totalDays,
  };
}

/**
 * Generates calendar heatmap intensity (0 = empty, 1 = 1-25%, 2 = 26-50%, 3 = 51-75%, 4 = 76-100%)
 */
export function getHeatmapGrid(habits: Habit[], logs: HabitLog[], daysCount: number = 180, todayStr: string = getTodayString()) {
  const dates = getPastDates(daysCount, todayStr);
  const activeHabits = habits.filter(h => !h.archived);

  return dates.map(dateStr => {
    const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, dateStr));
    if (scheduled.length === 0) {
      return { date: dateStr, intensity: 0, rate: 0, completed: 0, scheduled: 0 };
    }

    let completed = 0;
    scheduled.forEach(h => {
      if (isHabitCompletedOnDate(h, logs, dateStr).completed) completed++;
    });

    const rate = Math.round((completed / scheduled.length) * 100);
    let intensity = 0;
    if (rate > 0 && rate <= 25) intensity = 1;
    else if (rate > 25 && rate <= 50) intensity = 2;
    else if (rate > 50 && rate <= 75) intensity = 3;
    else if (rate > 75) intensity = 4;

    return {
      date: dateStr,
      intensity,
      rate,
      completed,
      scheduled: scheduled.length,
    };
  });
}
