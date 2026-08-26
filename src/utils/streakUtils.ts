import { Habit, HabitLog } from '../types';
import { addDays, getDayOfWeek, getTodayString, parseISODate } from './dateUtils';

/**
 * Checks if a habit is scheduled on a given date based on its frequency configuration.
 */
export function isHabitScheduledOnDate(habit: Habit, dateStr: string): boolean {
  if (habit.archived) return false;
  if (habit.startDate && dateStr < habit.startDate) return false;
  if (habit.endDate && dateStr > habit.endDate) return false;

  const dayOfWeek = getDayOfWeek(dateStr); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'custom_days':
      return !!habit.customDays && habit.customDays.includes(dayOfWeek);
    case 'times_per_week':
    case 'times_per_month':
      // For quota habits, any active day can be an opportunity
      return true;
    default:
      return true;
  }
}

/**
 * Checks if a habit is completed on a specific date given the logs array.
 */
export function isHabitCompletedOnDate(habit: Habit, logs: HabitLog[], dateStr: string): { completed: boolean; value: number; log?: HabitLog } {
  const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
  if (!log) {
    return { completed: false, value: 0 };
  }

  if (log.status === 'skipped') {
    return { completed: false, value: 0, log };
  }

  let isComplete = log.completed;
  if (habit.goalType === 'numeric' || habit.goalType === 'duration' || habit.goalType === 'percentage') {
    isComplete = log.value >= habit.targetValue;
  }

  return {
    completed: isComplete,
    value: log.value || 0,
    log
  };
}

/**
 * Calculates current streak and longest historical streak for a single habit.
 * Correctly accounts for non-scheduled days so streaks are NOT broken incorrectly!
 */
export function calculateHabitStreak(
  habit: Habit,
  logs: HabitLog[],
  todayStr: string = getTodayString()
): { currentStreak: number; longestStreak: number; totalCompletions: number; totalActiveDays: number; completionRate: number } {
  const habitLogs = logs.filter(l => l.habitId === habit.id);
  const logMap = new Map<string, HabitLog>();
  habitLogs.forEach(l => logMap.set(l.date, l));

  // Determine earliest tracking date (either habit start date or first log date or 365 days ago)
  let earliestDate = habit.startDate || addDays(todayStr, -90);
  if (habitLogs.length > 0) {
    const minLogDate = habitLogs.reduce((min, l) => l.date < min ? l.date : min, habitLogs[0].date);
    if (minLogDate < earliestDate) earliestDate = minLogDate;
  }

  // Generate sequence of dates from earliest to today
  let curr = earliestDate;
  const dateList: string[] = [];
  while (curr <= todayStr) {
    dateList.push(curr);
    curr = addDays(curr, 1);
  }

  let totalScheduled = 0;
  let totalCompletions = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  for (const d of dateList) {
    const isScheduled = isHabitScheduledOnDate(habit, d);
    const log = logMap.get(d);
    const isComplete = log ? (habit.goalType === 'boolean' ? log.completed : log.value >= habit.targetValue) : false;

    if (isComplete) {
      totalCompletions++;
    }

    if (isScheduled) {
      totalScheduled++;
      if (isComplete) {
        runningStreak++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else {
        // If it's today and not yet completed, we don't necessarily break streak if yesterday was completed
        if (d !== todayStr) {
          runningStreak = 0;
        }
      }
    } else {
      // If it's not scheduled, it does not break the streak!
    }
  }

  // Calculate current active streak backwards from today
  let currentStreak = 0;
  let checkDate = todayStr;
  const todayComplete = isHabitCompletedOnDate(habit, logs, todayStr).completed;
  const todayScheduled = isHabitScheduledOnDate(habit, todayStr);

  if (todayComplete) {
    currentStreak = 1;
    checkDate = addDays(todayStr, -1);
  } else if (!todayScheduled) {
    // If today is not scheduled, start checking from yesterday
    checkDate = addDays(todayStr, -1);
  } else {
    // Today was scheduled but not completed yet: check if streak was active as of yesterday
    checkDate = addDays(todayStr, -1);
  }

  while (checkDate >= earliestDate) {
    const scheduled = isHabitScheduledOnDate(habit, checkDate);
    if (scheduled) {
      const comp = isHabitCompletedOnDate(habit, logs, checkDate).completed;
      if (comp) {
        currentStreak++;
        checkDate = addDays(checkDate, -1);
      } else {
        break;
      }
    } else {
      // Skip non-scheduled day without breaking streak
      checkDate = addDays(checkDate, -1);
    }
  }

  const completionRate = totalScheduled > 0 ? Math.min(100, Math.round((totalCompletions / totalScheduled) * 100)) : 0;

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalCompletions,
    totalActiveDays: totalScheduled,
    completionRate
  };
}

/**
 * Calculates overall streak across all active habits for a user.
 * A day is considered "streaked" if the user completed ≥ 75% of scheduled habits.
 */
export function calculateOverallStreaks(habits: Habit[], logs: HabitLog[], todayStr: string = getTodayString()): {
  currentStreak: number;
  longestStreak: number;
  totalCompletedDays: number;
  overallConsistency: number;
} {
  const activeHabits = habits.filter(h => !h.archived);
  if (activeHabits.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletedDays: 0, overallConsistency: 0 };
  }

  const pastDates = [];
  for (let i = 180; i >= 0; i--) {
    pastDates.push(addDays(todayStr, -i));
  }

  let longestStreak = 0;
  let runningStreak = 0;
  let totalCompletedDays = 0;
  let totalScheduledDays = 0;

  const daySuccessMap = new Map<string, boolean>();

  for (const d of pastDates) {
    const scheduledHabits = activeHabits.filter(h => isHabitScheduledOnDate(h, d));
    if (scheduledHabits.length === 0) {
      continue;
    }
    totalScheduledDays++;

    let completedCount = 0;
    for (const h of scheduledHabits) {
      if (isHabitCompletedOnDate(h, logs, d).completed) {
        completedCount++;
      }
    }

    const rate = completedCount / scheduledHabits.length;
    const isDaySuccessful = rate >= 0.6; // 60% threshold for streak day

    daySuccessMap.set(d, isDaySuccessful);

    if (isDaySuccessful) {
      totalCompletedDays++;
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      if (d !== todayStr) {
        runningStreak = 0;
      }
    }
  }

  // Calculate current streak backwards
  let currentStreak = 0;
  let checkDate = todayStr;
  const todaySuccess = daySuccessMap.get(todayStr);

  if (todaySuccess) {
    currentStreak = 1;
    checkDate = addDays(todayStr, -1);
  } else {
    checkDate = addDays(todayStr, -1);
  }

  while (daySuccessMap.has(checkDate)) {
    if (daySuccessMap.get(checkDate)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }
  }

  const overallConsistency = totalScheduledDays > 0 ? Math.round((totalCompletedDays / totalScheduledDays) * 100) : 0;

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalCompletedDays,
    overallConsistency
  };
}
