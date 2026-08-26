export type FrequencyType = 'daily' | 'weekdays' | 'custom_days' | 'times_per_week' | 'times_per_month';

export type GoalType = 'boolean' | 'numeric' | 'duration' | 'percentage';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  frequency: FrequencyType;
  customDays?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  timesPerPeriod?: number; // e.g. 3 times per week
  goalType: GoalType;
  targetValue: number; // e.g. 1 for boolean, 30 for 30 mins, 3000 for 3000ml
  unit?: string; // 'mins', 'ml', 'pages', 'reps', 'times', '%'
  reminderTime?: string; // '08:00'
  reminderDays?: number[];
  reminderEnabled?: boolean;
  startDate: string; // 'YYYY-MM-DD'
  endDate?: string; // 'YYYY-MM-DD'
  difficulty: DifficultyLevel;
  programId?: string; // link to a program if part of one
  archived?: boolean;
  notes?: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // 'YYYY-MM-DD'
  completed: boolean;
  value: number; // actual tracked value (1 for boolean, or 25 for 25 mins)
  note?: string;
  completedAt?: string;
  status?: 'completed' | 'skipped' | 'partial' | 'missed';
}

export interface Milestone {
  id: string;
  title: string;
  targetDay: number; // e.g. Day 7, Day 30, Day 50
  description?: string;
  reward?: string;
  achievedDate?: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  icon: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  dailyTargetHabitIds: string[];
  milestones: Milestone[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streaks' | 'habits' | 'programs' | 'mastery' | 'consistency';
  conditionType: 'streak' | 'total_completions' | 'perfect_week' | 'perfect_month' | 'programs_completed' | 'early_bird' | 'habits_created';
  threshold: number;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  avatar: string;
  joinedDate: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  reminderSound: boolean;
  dailyDigestTime: string;
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  hapticFeedback: boolean;
  deviceFrameMode: 'mobile' | 'responsive';
}

export type TimeRangeFilter = 'today' | '7d' | '30d' | '3m' | '6m' | '1y' | 'all' | 'custom';

export interface DayAnalyticsSummary {
  date: string;
  dayName: string;
  totalScheduled: number;
  totalCompleted: number;
  completionRate: number;
  habits: {
    habit: Habit;
    log?: HabitLog;
    isScheduled: boolean;
    isCompleted: boolean;
    value: number;
  }[];
}
