import React, { useRef, useState } from 'react';
import {
  Award,
  Bell,
  CheckCircle2,
  ChevronRight,
  Download,
  Flame,
  Globe,
  HelpCircle,
  Lock,
  Moon,
  RotateCcw,
  Shield,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Trophy,
  Upload,
  User,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeMode } from '../../types';
import { IconRenderer } from '../common/IconRenderer';
import { calculateOverallStreaks } from '../../utils/streakUtils';

export const ProfileScreen: React.FC = () => {
  const {
    profile,
    updateProfile,
    settings,
    updateSettings,
    setThemeMode,
    achievements,
    habits,
    programs,
    logs,
    exportData,
    importData,
    resetToFresh,
    reloadSampleData,
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempTitle, setTempTitle] = useState(profile.title);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const overallStreaks = calculateOverallStreaks(habits, logs);
  const totalCompletedHabits = logs.filter(l => l.completed).length;
  const completedProgramsCount = programs.filter(p => p.status === 'completed').length;

  const unlockedAchievementsCount = achievements.filter(a => !!a.unlockedAt).length;

  const handleSaveProfile = () => {
    updateProfile({ name: tempName, title: tempTitle });
    setIsEditingName(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        importData(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-24">
      {/* Profile Header Card */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#1C1E24] via-[#161820] to-[#0F1115] text-white shadow-lg border border-[#262A33] relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-16 h-16 rounded-2xl ring-2 ring-emerald-500/50 overflow-hidden shadow-md shrink-0">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              {isEditingName ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    className="text-sm font-bold bg-[#15171D] border border-[#262A33] text-white px-2 py-1 rounded-md"
                    placeholder="Your Name"
                  />
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={e => setTempTitle(e.target.value)}
                    className="text-xs bg-[#15171D] border border-[#262A33] text-zinc-300 px-2 py-0.5 rounded-md"
                    placeholder="Title / Motto"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveProfile}
                      className="text-[10px] bg-emerald-500 font-bold px-2 py-0.5 rounded text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="text-[10px] text-zinc-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    {profile.name}
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      ✎
                    </button>
                  </h2>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    {profile.title}
                  </p>
                  <span className="text-[10px] text-zinc-500">
                    Member since {profile.joinedDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Level Badge */}
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Level
            </span>
            <div className="text-2xl font-black text-amber-400">
              {profile.level}
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4 pt-3.5 border-t border-[#262A33]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Experience (XP)</span>
            </span>
            <span className="text-zinc-200">
              {profile.xp} / {profile.xpToNextLevel} XP
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#15171D] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
              style={{ width: `${Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cumulative Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] text-center shadow-xs">
          <div className="text-[10px] font-bold text-zinc-400 uppercase">Streaks</div>
          <div className="text-xl font-black text-amber-500 mt-0.5">
            {overallStreaks.currentStreak}d
          </div>
          <div className="text-[9px] text-zinc-500">Best: {overallStreaks.longestStreak}d</div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] text-center shadow-xs">
          <div className="text-[10px] font-bold text-zinc-400 uppercase">Habits Done</div>
          <div className="text-xl font-black text-emerald-500 dark:text-emerald-400 mt-0.5">
            {totalCompletedHabits}
          </div>
          <div className="text-[9px] text-zinc-500">All-time logs</div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] text-center shadow-xs">
          <div className="text-[10px] font-bold text-zinc-400 uppercase">Consistency</div>
          <div className="text-xl font-black text-blue-500 mt-0.5">
            {overallStreaks.overallConsistency}%
          </div>
          <div className="text-[9px] text-zinc-500">Adherence</div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Badges & Achievements
            </h3>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            {unlockedAchievementsCount} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {achievements.map(ach => {
            const isUnlocked = !!ach.unlockedAt;
            const progressPercent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/30'
                    : 'bg-white dark:bg-[#1C1E24] border-zinc-200/80 dark:border-[#262A33] opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-[#262A33] text-zinc-400'
                    }`}
                  >
                    {isUnlocked ? (
                      <IconRenderer name={ach.icon} className="w-5 h-5" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {ach.title}
                      </h4>
                      {isUnlocked && (
                        <span className="text-[9px] font-bold text-emerald-500 dark:text-emerald-400">
                          UNLOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                      {ach.description}
                    </p>

                    {/* Progress */}
                    {!isUnlocked && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-semibold mb-1">
                          <span>Progress</span>
                          <span>{ach.progress} / {ach.maxProgress}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-[#262A33] overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appearance & Theme Settings */}
      <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Appearance & Theme
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => {
            const isSelected = settings.theme === mode;
            const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Globe;

            return (
              <button
                key={mode}
                onClick={() => setThemeMode(mode)}
                className={`py-2.5 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold capitalize ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-400/30'
                    : 'bg-zinc-100 dark:bg-[#262A33] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-[#323642]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{mode}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferences & Notifications */}
      <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Preferences
        </h3>

        <div className="space-y-3 text-xs">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-zinc-500" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Daily Habit Reminders
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={e => updateSettings({ notificationsEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
          </div>

          {/* Haptic feedback */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-zinc-500" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Haptic Vibration Feedback
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.hapticFeedback}
              onChange={e => updateSettings({ hapticFeedback: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Data Management & Export
          </h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Auto-Save Active</span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          All habits, logs, streaks, and program completions automatically persist locally in real-time. No manual saving needed.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => exportData('json')}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-100 dark:bg-[#262A33] hover:bg-zinc-200 dark:hover:bg-[#323642] text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => exportData('csv')}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-100 dark:bg-[#262A33] hover:bg-zinc-200 dark:hover:bg-[#323642] text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-[#262A33] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Restore from Backup
            </div>
            <div className="text-[10px] text-zinc-400">Import a previously saved JSON file</div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-500/20"
          >
            Import JSON
          </button>
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-[#262A33] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Reload Demo Pack
            </div>
            <div className="text-[10px] text-zinc-400">Load sample habits, programs & 60-day history</div>
          </div>
          <button
            onClick={reloadSampleData}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20"
          >
            Load Sample
          </button>
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-[#262A33] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-rose-500">
              Reset Application Data
            </div>
            <div className="text-[10px] text-zinc-400">Clear all habits and start completely fresh</div>
          </div>
          <button
            onClick={resetToFresh}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-semibold hover:bg-rose-500/20"
          >
            Clear Data
          </button>
        </div>
      </div>

      {/* App Info Footer */}
      <div className="text-center py-4 text-xs text-zinc-400 space-y-1">
        <p className="font-bold text-zinc-500 dark:text-zinc-400">HabitForge Mobile v2.5.0</p>
        <p className="text-[10px]">Production-Grade Habit Tracking & Program Platform</p>
      </div>
    </div>
  );
};
