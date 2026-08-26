import { Achievement, AppSettings, Habit, HabitLog, Program, UserProfile } from '../types';
import { addDays, getTodayString } from './dateUtils';

export const STORAGE_KEYS = {
  HABITS: 'habitforge_habits_v2',
  LOGS: 'habitforge_logs_v2',
  PROGRAMS: 'habitforge_programs_v2',
  ACHIEVEMENTS: 'habitforge_achievements_v2',
  PROFILE: 'habitforge_profile_v2',
  SETTINGS: 'habitforge_settings_v2',
  // Legacy v1 keys for automatic migration
  LEGACY_HABITS: 'habitforge_habits_v1',
  LEGACY_LOGS: 'habitforge_logs_v1',
  LEGACY_PROGRAMS: 'habitforge_programs_v1',
  LEGACY_ACHIEVEMENTS: 'habitforge_achievements_v1',
  LEGACY_PROFILE: 'habitforge_profile_v1',
  LEGACY_SETTINGS: 'habitforge_settings_v1',
};

// In-memory fallback in case localStorage is blocked or restricted
const memoryStorage: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch (e) {
    console.warn(`[HabitForge Storage] Unable to read ${key} from localStorage, using memory fallback`, e);
  }
  return memoryStorage[key] || null;
}

function safeSetItem(key: string, value: string): void {
  try {
    memoryStorage[key] = value;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(`[HabitForge Storage] Unable to save ${key} to localStorage, kept in memory fallback`, e);
  }
}

function safeRemoveItem(key: string): void {
  try {
    delete memoryStorage[key];
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn(`[HabitForge Storage] Unable to remove ${key} from localStorage`, e);
  }
}

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Mercer',
  title: 'Focus Pioneer',
  email: 'alex.mercer@build.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  joinedDate: addDays(getTodayString(), -60),
  level: 8,
  xp: 3450,
  xpToNextLevel: 4000,
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  notificationsEnabled: true,
  reminderSound: true,
  dailyDigestTime: '20:30',
  firstDayOfWeek: 1, // Monday
  hapticFeedback: true,
  deviceFrameMode: 'mobile',
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_habit',
    title: 'First Step',
    description: 'Create your first daily or weekly habit.',
    icon: 'Sparkles',
    category: 'habits',
    conditionType: 'habits_created',
    threshold: 1,
    unlockedAt: addDays(getTodayString(), -55),
    progress: 5,
    maxProgress: 1,
  },
  {
    id: 'ach_streak_7',
    title: '7-Day Momentum',
    description: 'Maintain a 7-day uninterrupted streak.',
    icon: 'Flame',
    category: 'streaks',
    conditionType: 'streak',
    threshold: 7,
    unlockedAt: addDays(getTodayString(), -42),
    progress: 14,
    maxProgress: 7,
  },
  {
    id: 'ach_streak_30',
    title: 'Habit Mastery',
    description: 'Maintain a 30-day streak on any core habit.',
    icon: 'Zap',
    category: 'streaks',
    conditionType: 'streak',
    threshold: 30,
    progress: 18,
    maxProgress: 30,
  },
  {
    id: 'ach_completions_100',
    title: 'Century Club',
    description: 'Log 100 successful habit completions.',
    icon: 'Trophy',
    category: 'mastery',
    conditionType: 'total_completions',
    threshold: 100,
    unlockedAt: addDays(getTodayString(), -10),
    progress: 142,
    maxProgress: 100,
  },
  {
    id: 'ach_perfect_week',
    title: 'Unstoppable Week',
    description: 'Achieve 100% completion across all habits for 7 full days.',
    icon: 'Award',
    category: 'consistency',
    conditionType: 'perfect_week',
    threshold: 1,
    unlockedAt: addDays(getTodayString(), -14),
    progress: 1,
    maxProgress: 1,
  },
  {
    id: 'ach_program_finish',
    title: 'Program Finisher',
    description: 'Complete a full structured multi-week program.',
    icon: 'Flag',
    category: 'programs',
    conditionType: 'programs_completed',
    threshold: 1,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'ach_early_bird',
    title: 'Early Bird',
    description: 'Complete all morning habits before 9:00 AM 5 times.',
    icon: 'Sun',
    category: 'consistency',
    conditionType: 'early_bird',
    threshold: 5,
    unlockedAt: addDays(getTodayString(), -20),
    progress: 8,
    maxProgress: 5,
  },
];

export function generateInitialData(): {
  habits: Habit[];
  programs: Program[];
  logs: HabitLog[];
} {
  const today = getTodayString();
  const sixtyDaysAgo = addDays(today, -60);
  const thirtyDaysAgo = addDays(today, -30);

  const programs: Program[] = [
    {
      id: 'prog_30d_code',
      name: '30-Day Full-Stack Sprint',
      description: 'Daily algorithmic problem solving, code reviews, and architecture building.',
      category: 'Learning',
      color: '#3B82F6',
      icon: 'Code2',
      startDate: thirtyDaysAgo,
      endDate: today,
      durationDays: 30,
      dailyTargetHabitIds: ['habit_code'],
      milestones: [
        { id: 'm1', title: 'Week 1 Foundations', targetDay: 7, description: 'Complete 7 consecutive daily coding sessions', achievedDate: addDays(thirtyDaysAgo, 7) },
        { id: 'm2', title: 'Halfway Milestone', targetDay: 15, description: '15 sessions complete - build a mini-project', achievedDate: addDays(thirtyDaysAgo, 15) },
        { id: 'm3', title: 'Advanced Concepts', targetDay: 25, description: 'Master complex asynchronous workflows', achievedDate: addDays(thirtyDaysAgo, 25) },
        { id: 'm4', title: 'Grand Sprint Finish', targetDay: 30, description: 'Deploy capstone app & celebrate!', achievedDate: today },
      ],
      difficulty: 'intermediate',
      notes: 'Focus on clean TypeScript design patterns and responsive UI principles.',
      status: 'active',
      createdAt: thirtyDaysAgo,
    },
    {
      id: 'prog_21d_mindfulness',
      name: '21-Day Mindful Balance',
      description: 'Morning meditation, daily reflections, and digital detox habits for mental clarity.',
      category: 'Mindfulness',
      color: '#EC4899',
      icon: 'Sparkles',
      startDate: addDays(today, -12),
      endDate: addDays(today, 9),
      durationDays: 21,
      dailyTargetHabitIds: ['habit_meditate', 'habit_reading'],
      milestones: [
        { id: 'm_mb1', title: 'Mindful Routine Set', targetDay: 7, description: 'Establish consistent morning posture & breath', achievedDate: addDays(today, -5) },
        { id: 'm_mb2', title: 'Deep Presence', targetDay: 14, description: 'Double meditation duration on weekends' },
        { id: 'm_mb3', title: 'Mental Mastery', targetDay: 21, description: '3 weeks of unbroken mental wellness' },
      ],
      difficulty: 'beginner',
      notes: 'Practice in a quiet space with noise-canceling headphones before checking email.',
      status: 'active',
      createdAt: addDays(today, -12),
    },
  ];

  const habits: Habit[] = [
    {
      id: 'habit_water',
      name: 'Hydration Goal (3L)',
      description: 'Drink at least 3,000 ml of pure water throughout the day.',
      icon: 'Droplets',
      color: '#06B6D4',
      category: 'Health',
      frequency: 'daily',
      goalType: 'numeric',
      targetValue: 3000,
      unit: 'ml',
      reminderTime: '09:00',
      reminderDays: [0, 1, 2, 3, 4, 5, 6],
      reminderEnabled: true,
      startDate: sixtyDaysAgo,
      difficulty: 'easy',
      createdAt: sixtyDaysAgo,
      notes: 'Keep a 1L water bottle on the desk at all times.',
    },
    {
      id: 'habit_code',
      name: 'Deep Coding Practice',
      description: 'Focused coding and architectural problem solving without distractions.',
      icon: 'Code',
      color: '#3B82F6',
      category: 'Learning',
      frequency: 'daily',
      goalType: 'duration',
      targetValue: 45,
      unit: 'mins',
      reminderTime: '19:00',
      reminderDays: [1, 2, 3, 4, 5],
      reminderEnabled: true,
      startDate: thirtyDaysAgo,
      difficulty: 'hard',
      programId: 'prog_30d_code',
      createdAt: thirtyDaysAgo,
      notes: 'Turn off Slack and notifications for Pomodoro blocks.',
    },
    {
      id: 'habit_meditate',
      name: 'Morning Mindfulness',
      description: 'Breathwork and unguided mindful observation.',
      icon: 'Brain',
      color: '#EC4899',
      category: 'Mindfulness',
      frequency: 'daily',
      goalType: 'duration',
      targetValue: 15,
      unit: 'mins',
      reminderTime: '07:30',
      reminderDays: [0, 1, 2, 3, 4, 5, 6],
      reminderEnabled: true,
      startDate: sixtyDaysAgo,
      difficulty: 'easy',
      programId: 'prog_21d_mindfulness',
      createdAt: sixtyDaysAgo,
    },
    {
      id: 'habit_reading',
      name: 'Read Non-Fiction',
      description: 'Read high-impact books on engineering, psychology, or design.',
      icon: 'BookOpen',
      color: '#F59E0B',
      category: 'Learning',
      frequency: 'daily',
      goalType: 'numeric',
      targetValue: 20,
      unit: 'pages',
      reminderTime: '21:30',
      reminderDays: [0, 1, 2, 3, 4, 5, 6],
      reminderEnabled: true,
      startDate: sixtyDaysAgo,
      difficulty: 'medium',
      createdAt: sixtyDaysAgo,
    },
    {
      id: 'habit_workout',
      name: 'Strength / Cardio Workout',
      description: 'Gym session, 5k run, or high-intensity bodyweight circuit.',
      icon: 'Dumbbell',
      color: '#10B981',
      category: 'Fitness',
      frequency: 'custom_days',
      customDays: [1, 3, 5, 6], // Mon, Wed, Fri, Sat
      goalType: 'duration',
      targetValue: 45,
      unit: 'mins',
      reminderTime: '17:30',
      reminderDays: [1, 3, 5, 6],
      reminderEnabled: true,
      startDate: sixtyDaysAgo,
      difficulty: 'hard',
      createdAt: sixtyDaysAgo,
    },
  ];

  // Generate realistic past logs for 60 days
  const logs: HabitLog[] = [];
  for (let i = 60; i >= 0; i--) {
    const dateStr = addDays(today, -i);
    const dayOfWeek = (new Date(dateStr).getDay());

    // Hydration log (completed ~88% of days)
    const waterCompleted = Math.random() > 0.12 || i <= 5;
    logs.push({
      id: `log_water_${dateStr}`,
      habitId: 'habit_water',
      date: dateStr,
      completed: waterCompleted,
      value: waterCompleted ? 3000 : 1500,
      completedAt: `${dateStr}T18:30:00Z`,
    });

    // Meditate log (~82% completion)
    const medCompleted = Math.random() > 0.18 || (i <= 10 && i !== 2);
    logs.push({
      id: `log_med_${dateStr}`,
      habitId: 'habit_meditate',
      date: dateStr,
      completed: medCompleted,
      value: medCompleted ? 15 : 0,
      completedAt: `${dateStr}T07:45:00Z`,
    });

    // Reading log (~80% completion)
    const readCompleted = Math.random() > 0.20 || i <= 4;
    logs.push({
      id: `log_read_${dateStr}`,
      habitId: 'habit_reading',
      date: dateStr,
      completed: readCompleted,
      value: readCompleted ? (20 + (i % 5) * 5) : 10,
      completedAt: `${dateStr}T22:15:00Z`,
    });

    // Workout log (Mon, Wed, Fri, Sat)
    if ([1, 3, 5, 6].includes(dayOfWeek)) {
      const workoutCompleted = Math.random() > 0.15 || i <= 3;
      logs.push({
        id: `log_workout_${dateStr}`,
        habitId: 'habit_workout',
        date: dateStr,
        completed: workoutCompleted,
        value: workoutCompleted ? 50 : 0,
        completedAt: `${dateStr}T18:45:00Z`,
      });
    }

    // Coding practice (past 30 days)
    if (i <= 30) {
      const codeCompleted = Math.random() > 0.12 || i <= 6;
      logs.push({
        id: `log_code_${dateStr}`,
        habitId: 'habit_code',
        date: dateStr,
        completed: codeCompleted,
        value: codeCompleted ? 60 : 20,
        completedAt: `${dateStr}T20:30:00Z`,
      });
    }
  }

  return { habits, programs, logs };
}

/**
 * Deduplicate logs by unique (habitId + date) pair, preserving the most complete/latest record.
 */
export function deduplicateLogs(logsList: HabitLog[]): HabitLog[] {
  const map = new Map<string, HabitLog>();
  for (const log of logsList) {
    if (!log || !log.habitId || !log.date) continue;
    const key = `${log.habitId}_${log.date}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, log);
    } else {
      // Keep completed or higher value
      if (log.completed && !existing.completed) {
        map.set(key, log);
      } else if (log.value > existing.value) {
        map.set(key, log);
      }
    }
  }
  return Array.from(map.values());
}

export function loadHabits(): Habit[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.HABITS) || safeGetItem(STORAGE_KEYS.LEGACY_HABITS);
    if (!raw) {
      const initial = generateInitialData();
      saveHabits(initial.habits);
      savePrograms(initial.programs);
      saveLogs(initial.logs);
      return initial.habits;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((h: any) => ({
        ...h,
        id: h.id || `habit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: h.name || 'Untitled Habit',
        category: h.category || 'General',
        frequency: h.frequency || 'daily',
        goalType: h.goalType || 'boolean',
        targetValue: typeof h.targetValue === 'number' ? h.targetValue : 1,
        color: h.color || '#10B981',
        icon: h.icon || 'Sparkles',
        createdAt: h.createdAt || new Date().toISOString(),
      }));
    }
    return [];
  } catch (e) {
    console.error('Error loading habits', e);
    return [];
  }
}

export function saveHabits(habits: Habit[]) {
  try {
    safeSetItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits', e);
  }
}

export function loadLogs(): HabitLog[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.LOGS) || safeGetItem(STORAGE_KEYS.LEGACY_LOGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return deduplicateLogs(parsed);
    }
    return [];
  } catch (e) {
    console.error('Error loading logs', e);
    return [];
  }
}

export function saveLogs(logs: HabitLog[]) {
  try {
    const deduplicated = deduplicateLogs(logs);
    safeSetItem(STORAGE_KEYS.LOGS, JSON.stringify(deduplicated));
  } catch (e) {
    console.error('Error saving logs', e);
  }
}

export function loadPrograms(): Program[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.PROGRAMS) || safeGetItem(STORAGE_KEYS.LEGACY_PROGRAMS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((p: any) => ({
        ...p,
        id: p.id || `prog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: p.name || 'Untitled Program',
        category: p.category || 'General',
        durationDays: typeof p.durationDays === 'number' ? p.durationDays : 30,
        milestones: Array.isArray(p.milestones) ? p.milestones : [],
        dailyTargetHabitIds: Array.isArray(p.dailyTargetHabitIds) ? p.dailyTargetHabitIds : [],
        status: p.status || 'active',
        createdAt: p.createdAt || new Date().toISOString(),
      }));
    }
    return [];
  } catch (e) {
    console.error('Error loading programs', e);
    return [];
  }
}

export function savePrograms(programs: Program[]) {
  try {
    safeSetItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
  } catch (e) {
    console.error('Error saving programs', e);
  }
}

export function loadAchievements(): Achievement[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.ACHIEVEMENTS) || safeGetItem(STORAGE_KEYS.LEGACY_ACHIEVEMENTS);
    if (!raw) {
      saveAchievements(DEFAULT_ACHIEVEMENTS);
      return DEFAULT_ACHIEVEMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Merge with default list to ensure all built-in achievement IDs are present
      const map = new Map(DEFAULT_ACHIEVEMENTS.map(a => [a.id, a]));
      for (const item of parsed) {
        if (item && item.id) {
          const def = map.get(item.id);
          map.set(item.id, { ...(def || {}), ...item });
        }
      }
      return Array.from(map.values());
    }
    return DEFAULT_ACHIEVEMENTS;
  } catch (e) {
    return DEFAULT_ACHIEVEMENTS;
  }
}

export function saveAchievements(achievements: Achievement[]) {
  try {
    safeSetItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (e) {
    console.error('Error saving achievements', e);
  }
}

export function loadProfile(): UserProfile {
  try {
    const raw = safeGetItem(STORAGE_KEYS.PROFILE) || safeGetItem(STORAGE_KEYS.LEGACY_PROFILE);
    if (!raw) {
      saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch (e) {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile) {
  try {
    safeSetItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = safeGetItem(STORAGE_KEYS.SETTINGS) || safeGetItem(STORAGE_KEYS.LEGACY_SETTINGS);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function exportAllDataAsJSON(): string {
  const data = {
    exportedAt: new Date().toISOString(),
    schemaVersion: '2.0',
    profile: loadProfile(),
    settings: loadSettings(),
    habits: loadHabits(),
    programs: loadPrograms(),
    logs: loadLogs(),
    achievements: loadAchievements(),
  };
  return JSON.stringify(data, null, 2);
}

export function exportLogsAsCSV(): string {
  const habits = loadHabits();
  const logs = loadLogs();
  const habitMap = new Map(habits.map(h => [h.id, h]));

  const headers = ['Log ID', 'Date', 'Habit ID', 'Habit Name', 'Category', 'Target Value', 'Unit', 'Logged Value', 'Completed', 'Completed At', 'Notes'];
  const rows = logs.map(log => {
    const habit = habitMap.get(log.habitId);
    return [
      `"${log.id}"`,
      `"${log.date}"`,
      `"${log.habitId}"`,
      `"${habit ? habit.name.replace(/"/g, '""') : 'Deleted Habit'}"`,
      `"${habit?.category || ''}"`,
      habit?.targetValue || 1,
      `"${habit?.unit || ''}"`,
      log.value,
      log.completed ? 'YES' : 'NO',
      `"${log.completedAt || ''}"`,
      `"${(log.note || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function importAllDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') return false;

    if (data.habits && Array.isArray(data.habits)) {
      saveHabits(data.habits);
    }
    if (data.programs && Array.isArray(data.programs)) {
      savePrograms(data.programs);
    }
    if (data.logs && Array.isArray(data.logs)) {
      saveLogs(deduplicateLogs(data.logs));
    }
    if (data.profile && typeof data.profile === 'object') {
      saveProfile({ ...DEFAULT_PROFILE, ...data.profile });
    }
    if (data.settings && typeof data.settings === 'object') {
      saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    if (data.achievements && Array.isArray(data.achievements)) {
      saveAchievements(data.achievements);
    }
    return true;
  } catch (e) {
    console.error('Import failed with parsing error:', e);
    return false;
  }
}

export function resetAllDataToFresh() {
  Object.values(STORAGE_KEYS).forEach(k => {
    safeRemoveItem(k);
  });
}
