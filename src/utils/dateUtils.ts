/**
 * Utility functions for date calculations, calendar matrices, and range formatting.
 */

export function getTodayString(): string {
  const now = new Date();
  return formatDateToISO(now);
}

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatReadableDate(dateStr: string, format: 'short' | 'medium' | 'full' | 'month-year' = 'medium'): string {
  if (!dateStr) return '';
  const date = parseISODate(dateStr);
  const today = getTodayString();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  if (format === 'medium' || format === 'short') {
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    if (dateStr === tomorrow) return 'Tomorrow';
  }

  if (format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (format === 'month-year') {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  if (format === 'full') {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
}

export function addDays(dateStr: string, days: number): string {
  const date = parseISODate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateToISO(date);
}

export function getDayOfWeek(dateStr: string): number {
  return parseISODate(dateStr).getDay(); // 0 = Sunday, 1 = Monday, ...
}

export function getDayName(dateStr: string, length: 'narrow' | 'short' | 'long' = 'short'): string {
  return parseISODate(dateStr).toLocaleDateString('en-US', { weekday: length });
}

export function getDaysDifference(startDateStr: string, endDateStr: string): number {
  const start = parseISODate(startDateStr).getTime();
  const end = parseISODate(endDateStr).getTime();
  const diffTime = end - start;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns an array of date strings for the past N days leading up to endDate (inclusive)
 */
export function getPastDates(daysCount: number, endDate: string = getTodayString()): string[] {
  const dates: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    dates.push(addDays(endDate, -i));
  }
  return dates;
}

/**
 * Returns array of date strings for a specific week (Sunday or Monday start)
 */
export function getWeekDates(referenceDate: string = getTodayString(), firstDayOfWeek: 0 | 1 = 1): string[] {
  const date = parseISODate(referenceDate);
  const currentDay = date.getDay();
  let diff = currentDay - firstDayOfWeek;
  if (diff < 0) diff += 7;

  const startOfWeek = addDays(referenceDate, -diff);
  const week: string[] = [];
  for (let i = 0; i < 7; i++) {
    week.push(addDays(startOfWeek, i));
  }
  return week;
}

/**
 * Generates month calendar matrix (array of weeks, each week is array of date strings or null for padding)
 */
export function getMonthCalendarMatrix(year: number, month: number, firstDayOfWeek: 0 | 1 = 1): (string | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  let startDayIndex = firstDay.getDay() - firstDayOfWeek;
  if (startDayIndex < 0) startDayIndex += 7;

  const matrix: (string | null)[][] = [];
  let currentWeek: (string | null)[] = [];

  // Pad beginning of month
  for (let i = 0; i < startDayIndex; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    currentWeek.push(formatDateToISO(d));

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad end of month
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    matrix.push(currentWeek);
  }

  return matrix;
}

/**
 * Get greeting based on current local hour
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Night owl';
}
