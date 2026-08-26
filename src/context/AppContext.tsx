import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Achievement,
  AppSettings,
  Habit,
  HabitLog,
  Program,
  ThemeMode,
  UserProfile,
} from '../types';
import { getTodayString } from '../utils/dateUtils';
import { triggerCelebration, triggerHaptic } from '../utils/feedback';
import {
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  deduplicateLogs,
  exportAllDataAsJSON,
  exportLogsAsCSV,
  generateInitialData,
  importAllDataFromJSON,
  loadAchievements,
  loadHabits,
  loadLogs,
  loadProfile,
  loadPrograms,
  loadSettings,
  resetAllDataToFresh,
  saveAchievements,
  saveHabits,
  saveLogs,
  saveProfile,
  savePrograms,
  saveSettings,
} from '../utils/storage';
import { calculateHabitStreak, calculateOverallStreaks, isHabitCompletedOnDate, isHabitScheduledOnDate } from '../utils/streakUtils';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning';
}

interface AppContextType {
  // Core Entities (Persisted)
  habits: Habit[];
  logs: HabitLog[];
  programs: Program[];
  achievements: Achievement[];
  profile: UserProfile;
  settings: AppSettings;
  activeTheme: 'light' | 'dark';

  // Navigation & UI State
  activeTab: 'home' | 'programs' | 'analytics' | 'calendar' | 'profile';
  setActiveTab: (tab: 'home' | 'programs' | 'analytics' | 'calendar' | 'profile') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Modals & Sheets
  isCreateHabitOpen: boolean;
  setIsCreateHabitOpen: (open: boolean) => void;
  isCreateProgramOpen: boolean;
  setIsCreateProgramOpen: (open: boolean) => void;
  isHabitDetailOpen: boolean;
  setIsHabitDetailOpen: (open: boolean) => void;
  selectedHabitId: string | null;
  setSelectedHabitId: (id: string | null) => void;
  isProgramDetailOpen: boolean;
  setIsProgramDetailOpen: (open: boolean) => void;
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string | null) => void;
  isLogModalOpen: boolean;
  setIsLogModalOpen: (open: boolean) => void;
  activeLogHabitId: string | null;
  setActiveLogHabitId: (id: string | null) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Automatic Persisting Actions
  toggleHabit: (habitId: string, date?: string) => void;
  logHabitValue: (habitId: string, value: number, note?: string, date?: string) => void;
  quickIncrementHabit: (habitId: string, delta: number, date?: string) => void;
  skipHabit: (habitId: string, date?: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  addProgram: (program: Omit<Program, 'id' | 'createdAt'>) => void;
  updateProgram: (id: string, updates: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  unlockMilestone: (programId: string, milestoneId: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setThemeMode: (mode: ThemeMode) => void;
  exportData: (format: 'json' | 'csv') => void;
  importData: (jsonStr: string) => boolean;
  resetToFresh: () => void;
  reloadSampleData: () => void;
  openHabitDetail: (habitId: string) => void;
  openProgramDetail: (programId: string) => void;
  openLogModal: (habitId: string) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Computed Overviews (Dynamically calculated from persistent store)
  todayProgress: {
    scheduledCount: number;
    completedCount: number;
    completionPercentage: number;
    currentStreak: number;
    bestStreak: number;
    overallConsistency: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state directly from automatic persistent local storage
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [logs, setLogs] = useState<HabitLog[]>(() => loadLogs());
  const [programs, setPrograms] = useState<Program[]>(() => loadPrograms());
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadAchievements());
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const [activeTab, setActiveTab] = useState<'home' | 'programs' | 'analytics' | 'calendar' | 'profile'>('home');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [isHabitDetailOpen, setIsHabitDetailOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isProgramDetailOpen, setIsProgramDetailOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeLogHabitId, setActiveLogHabitId] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Immediate Persistent Storage Synchronization Effects
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    savePrograms(programs);
  }, [programs]);

  useEffect(() => {
    saveAchievements(achievements);
  }, [achievements]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Window/Tab synchronization & lifecycle flush
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.includes('habits')) setHabits(loadHabits());
      if (e.key.includes('logs')) setLogs(loadLogs());
      if (e.key.includes('programs')) setPrograms(loadPrograms());
      if (e.key.includes('profile')) setProfile(loadProfile());
      if (e.key.includes('settings')) setSettings(loadSettings());
      if (e.key.includes('achievements')) setAchievements(loadAchievements());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveHabits(habits);
        saveLogs(logs);
        savePrograms(programs);
        saveAchievements(achievements);
        saveProfile(profile);
        saveSettings(settings);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [habits, logs, programs, achievements, profile, settings]);

  // Determine effective theme
  const activeTheme: 'light' | 'dark' = useMemo(() => {
    if (settings.theme === 'system') {
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    }
    return settings.theme;
  }, [settings.theme]);

  // Apply dark class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (activeTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [activeTheme]);

  // Automatic Achievement Evaluation & Unlocking from persisted records
  useEffect(() => {
    const totalCompletions = logs.filter(l => l.completed).length;
    const overall = calculateOverallStreaks(habits, logs, getTodayString());
    let anyUnlocked = false;

    const updated = achievements.map(ach => {
      if (ach.unlockedAt) return ach;
      let newProgress = ach.progress;
      let isUnlocked = false;

      if (ach.conditionType === 'streak') {
        newProgress = overall.longestStreak;
        if (newProgress >= ach.threshold) isUnlocked = true;
      } else if (ach.conditionType === 'total_completions') {
        newProgress = totalCompletions;
        if (newProgress >= ach.threshold) isUnlocked = true;
      } else if (ach.conditionType === 'habits_created') {
        newProgress = habits.length;
        if (newProgress >= ach.threshold) isUnlocked = true;
      }

      if (isUnlocked) {
        anyUnlocked = true;
        showToast(`🏆 Achievement Unlocked!`, ach.title, 'success');
        triggerCelebration('medium');
        return {
          ...ach,
          progress: Math.min(ach.maxProgress, newProgress),
          unlockedAt: getTodayString(),
        };
      }

      return {
        ...ach,
        progress: Math.min(ach.maxProgress, newProgress),
      };
    });

    if (anyUnlocked) {
      setAchievements(updated);
      saveAchievements(updated);
    }
  }, [logs.length, habits.length]);

  // Dynamically calculate today overview metrics from persistent state
  const todayProgress = useMemo(() => {
    const today = selectedDate || getTodayString();
    const scheduled = habits.filter(h => isHabitScheduledOnDate(h, today));
    const completed = scheduled.filter(h => isHabitCompletedOnDate(h, logs, today).completed);

    const overall = calculateOverallStreaks(habits, logs, today);
    const completionPercentage = scheduled.length > 0 ? Math.round((completed.length / scheduled.length) * 100) : 0;

    return {
      scheduledCount: scheduled.length,
      completedCount: completed.length,
      completionPercentage,
      currentStreak: overall.currentStreak,
      bestStreak: overall.longestStreak,
      overallConsistency: overall.overallConsistency,
    };
  }, [habits, logs, selectedDate]);

  // Habit Actions with Immediate Persistence
  const toggleHabit = (habitId: string, date: string = selectedDate) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    if (settings.hapticFeedback) triggerHaptic('light');

    const existingIndex = logs.findIndex(l => l.habitId === habitId && l.date === date);
    let newLogs: HabitLog[];
    let willBeCompleted = false;

    if (existingIndex >= 0) {
      const existing = logs[existingIndex];
      willBeCompleted = !existing.completed;
      const updatedLog: HabitLog = {
        ...existing,
        completed: willBeCompleted,
        value: willBeCompleted ? habit.targetValue : 0,
        completedAt: willBeCompleted ? new Date().toISOString() : undefined,
        status: willBeCompleted ? 'completed' : 'missed',
      };

      newLogs = [...logs];
      newLogs[existingIndex] = updatedLog;
    } else {
      willBeCompleted = true;
      const newLog: HabitLog = {
        id: `log_${habitId}_${date}_${Date.now()}`,
        habitId,
        date,
        completed: true,
        value: habit.targetValue,
        completedAt: new Date().toISOString(),
        status: 'completed',
      };
      newLogs = [...logs, newLog];
    }

    const cleanLogs = deduplicateLogs(newLogs);
    setLogs(cleanLogs);
    saveLogs(cleanLogs); // Immediate flush to persistent storage

    if (willBeCompleted) {
      triggerCelebration('subtle');
      const habitStreak = calculateHabitStreak(habit, cleanLogs, date);
      if (habitStreak.currentStreak > 1) {
        showToast(`Streak: ${habitStreak.currentStreak} Days! 🔥`, habit.name, 'success');
      } else {
        showToast('Habit Completed! ✨', habit.name, 'success');
      }
      // Add XP & immediately persist profile
      const updatedProfile = { ...profile, xp: profile.xp + 25 };
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
    }
  };

  const logHabitValue = (habitId: string, value: number, note?: string, date: string = selectedDate) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    if (settings.hapticFeedback) triggerHaptic('medium');

    const isCompleted = habit.goalType === 'boolean' ? value >= 1 : value >= habit.targetValue;
    const existingIndex = logs.findIndex(l => l.habitId === habitId && l.date === date);
    let newLogs: HabitLog[];

    if (existingIndex >= 0) {
      newLogs = [...logs];
      newLogs[existingIndex] = {
        ...newLogs[existingIndex],
        value,
        note: note !== undefined ? note : newLogs[existingIndex].note,
        completed: isCompleted,
        completedAt: isCompleted ? (newLogs[existingIndex].completedAt || new Date().toISOString()) : undefined,
        status: isCompleted ? 'completed' : value > 0 ? 'partial' : 'missed',
      };
    } else {
      const newLog: HabitLog = {
        id: `log_${habitId}_${date}_${Date.now()}`,
        habitId,
        date,
        completed: isCompleted,
        value,
        note,
        completedAt: isCompleted ? new Date().toISOString() : undefined,
        status: isCompleted ? 'completed' : value > 0 ? 'partial' : 'missed',
      };
      newLogs = [...logs, newLog];
    }

    const cleanLogs = deduplicateLogs(newLogs);
    setLogs(cleanLogs);
    saveLogs(cleanLogs); // Immediate flush to persistent storage

    if (isCompleted) {
      triggerCelebration('subtle');
      showToast('Target Reached! 🎯', `${habit.name}: ${value} ${habit.unit || ''}`, 'success');
      const updatedProfile = { ...profile, xp: profile.xp + 30 };
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
    } else {
      showToast('Progress Logged', `${habit.name}: ${value} ${habit.unit || ''}`, 'info');
    }
  };

  const quickIncrementHabit = (habitId: string, delta: number, date: string = selectedDate) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const existingLog = logs.find(l => l.habitId === habitId && l.date === date);
    const currentValue = existingLog ? existingLog.value : 0;
    const nextValue = Math.max(0, currentValue + delta);
    logHabitValue(habitId, nextValue, existingLog?.note, date);
  };

  const skipHabit = (habitId: string, date: string = selectedDate) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const existingIndex = logs.findIndex(l => l.habitId === habitId && l.date === date);
    let newLogs: HabitLog[];

    if (existingIndex >= 0) {
      newLogs = [...logs];
      newLogs[existingIndex] = {
        ...newLogs[existingIndex],
        completed: false,
        status: 'skipped',
      };
    } else {
      const newLog: HabitLog = {
        id: `log_${habitId}_${date}_${Date.now()}`,
        habitId,
        date,
        completed: false,
        value: 0,
        status: 'skipped',
      };
      newLogs = [...logs, newLog];
    }

    const cleanLogs = deduplicateLogs(newLogs);
    setLogs(cleanLogs);
    saveLogs(cleanLogs);
    showToast('Habit Skipped', `${habit.name} won't count against your streak today`, 'info');
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const id = `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newHabit: Habit = {
      ...habitData,
      id,
      createdAt: new Date().toISOString(),
    };
    const updated = [newHabit, ...habits];
    setHabits(updated);
    saveHabits(updated); // Immediate persistent save
    showToast('Habit Created ✨', newHabit.name, 'success');
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    const updated = habits.map(h => (h.id === id ? { ...h, ...updates } : h));
    setHabits(updated);
    saveHabits(updated); // Immediate persistent save
    showToast('Habit Updated', 'Changes saved successfully', 'success');
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter(h => h.id !== id);
    const updatedLogs = logs.filter(l => l.habitId !== id);
    setHabits(updatedHabits);
    setLogs(updatedLogs);
    saveHabits(updatedHabits);
    saveLogs(updatedLogs);
    showToast('Habit Removed', 'Habit and logs deleted', 'info');
  };

  const addProgram = (progData: Omit<Program, 'id' | 'createdAt'>) => {
    const id = `prog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProg: Program = {
      ...progData,
      id,
      createdAt: new Date().toISOString(),
    };
    const updated = [newProg, ...programs];
    setPrograms(updated);
    savePrograms(updated); // Immediate persistent save
    showToast('Program Started 🚀', newProg.name, 'success');
  };

  const updateProgram = (id: string, updates: Partial<Program>) => {
    const updated = programs.map(p => (p.id === id ? { ...p, ...updates } : p));
    setPrograms(updated);
    savePrograms(updated); // Immediate persistent save
    showToast('Program Updated', 'Program details saved', 'success');
  };

  const deleteProgram = (id: string) => {
    const updated = programs.filter(p => p.id !== id);
    setPrograms(updated);
    savePrograms(updated);
    showToast('Program Deleted', 'Program has been removed', 'info');
  };

  const unlockMilestone = (programId: string, milestoneId: string) => {
    const updated = programs.map(p => {
      if (p.id !== programId) return p;
      return {
        ...p,
        milestones: p.milestones.map(m => {
          if (m.id !== milestoneId) return m;
          return {
            ...m,
            achievedDate: getTodayString(),
          };
        }),
      };
    });
    setPrograms(updated);
    savePrograms(updated); // Immediate persistent save
    triggerCelebration('medium');
    showToast('Milestone Achieved! 🎉', 'Keep up the remarkable momentum!', 'success');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    saveProfile(updated); // Immediate persistent save
    showToast('Profile Saved', 'Personal settings updated', 'success');
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    saveSettings(updated); // Immediate persistent save
  };

  const setThemeMode = (mode: ThemeMode) => {
    updateSettings({ theme: mode });
  };

  const exportData = (format: 'json' | 'csv') => {
    let content = '';
    let fileName = '';
    let mimeType = '';

    if (format === 'json') {
      content = exportAllDataAsJSON();
      fileName = `habitforge_backup_${getTodayString()}.json`;
      mimeType = 'application/json';
    } else {
      content = exportLogsAsCSV();
      fileName = `habitforge_logs_${getTodayString()}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Data Exported (${format.toUpperCase()})`, fileName, 'success');
  };

  const importData = (jsonStr: string): boolean => {
    const success = importAllDataFromJSON(jsonStr);
    if (success) {
      setHabits(loadHabits());
      setLogs(loadLogs());
      setPrograms(loadPrograms());
      setProfile(loadProfile());
      setSettings(loadSettings());
      setAchievements(loadAchievements());
      showToast('Data Imported Successfully', 'All your records have been restored', 'success');
      return true;
    } else {
      showToast('Import Failed', 'Invalid JSON file format', 'warning');
      return false;
    }
  };

  const resetToFresh = () => {
    resetAllDataToFresh();
    setHabits([]);
    setLogs([]);
    setPrograms([]);
    setAchievements(DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, progress: 0, unlockedAt: undefined })));
    setProfile({ ...DEFAULT_PROFILE, xp: 0, level: 1 });
    showToast('App Reset', 'All custom data has been cleared', 'info');
  };

  const reloadSampleData = () => {
    const initial = generateInitialData();
    setHabits(initial.habits);
    setPrograms(initial.programs);
    setLogs(initial.logs);
    setAchievements(DEFAULT_ACHIEVEMENTS);
    setProfile(DEFAULT_PROFILE);
    saveHabits(initial.habits);
    savePrograms(initial.programs);
    saveLogs(initial.logs);
    saveAchievements(DEFAULT_ACHIEVEMENTS);
    saveProfile(DEFAULT_PROFILE);
    showToast('Demo Data Loaded', 'Sample habits, programs & 60 days of history restored', 'success');
  };

  const openHabitDetail = (habitId: string) => {
    setSelectedHabitId(habitId);
    setIsHabitDetailOpen(true);
  };

  const openProgramDetail = (programId: string) => {
    setSelectedProgramId(programId);
    setIsProgramDetailOpen(true);
  };

  const openLogModal = (habitId: string) => {
    setActiveLogHabitId(habitId);
    setIsLogModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        habits,
        logs,
        programs,
        achievements,
        profile,
        settings,
        activeTheme,
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isCreateHabitOpen,
        setIsCreateHabitOpen,
        isCreateProgramOpen,
        setIsCreateProgramOpen,
        isHabitDetailOpen,
        setIsHabitDetailOpen,
        selectedHabitId,
        setSelectedHabitId,
        isProgramDetailOpen,
        setIsProgramDetailOpen,
        selectedProgramId,
        setSelectedProgramId,
        isLogModalOpen,
        setIsLogModalOpen,
        activeLogHabitId,
        setActiveLogHabitId,
        isNotificationsOpen,
        setIsNotificationsOpen,
        toggleHabit,
        logHabitValue,
        quickIncrementHabit,
        skipHabit,
        addHabit,
        updateHabit,
        deleteHabit,
        addProgram,
        updateProgram,
        deleteProgram,
        unlockMilestone,
        updateProfile,
        updateSettings,
        setThemeMode,
        exportData,
        importData,
        resetToFresh,
        reloadSampleData,
        openHabitDetail,
        openProgramDetail,
        openLogModal,
        toasts,
        showToast,
        removeToast,
        todayProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
