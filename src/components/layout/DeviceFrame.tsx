import React, { useState } from 'react';
import { Maximize2, Minimize2, Monitor, Moon, Smartphone, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBar } from './StatusBar';
import { BottomNav } from './BottomNav';
import { AppHeader } from './AppHeader';
import { ToastContainer } from './ToastContainer';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgramsScreen } from '../screens/ProgramsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CreateHabitModal } from '../modals/CreateHabitModal';
import { CreateProgramModal } from '../modals/CreateProgramModal';
import { HabitDetailModal } from '../modals/HabitDetailModal';
import { ProgramDetailModal } from '../modals/ProgramDetailModal';
import { HabitLogModal } from '../modals/HabitLogModal';
import { NotificationCenterModal } from '../modals/NotificationCenterModal';

export const DeviceFrame: React.FC = () => {
  const { activeTab, settings, updateSettings, activeTheme, setThemeMode } = useApp();
  const [deviceSkin, setDeviceSkin] = useState<'pixel' | 'fluid'>('pixel');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'programs':
        return <ProgramsScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0F] flex flex-col items-center justify-center relative font-sans text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Floating Viewport Control Bar */}
      <nav aria-label="Device Controls" className="w-full max-w-5xl px-4 py-2 flex items-center justify-between z-40 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-black tracking-tight text-white">HabitForge Mobile</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1C1E24] border border-[#262A33] text-zinc-400 font-semibold hidden sm:inline-block">
            Sleek Edition
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Quick Toggle */}
          <button
            onClick={() => setThemeMode(activeTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1E24] hover:bg-[#262A33] border border-[#262A33] text-zinc-300 font-semibold transition-colors"
            title="Toggle theme"
          >
            {activeTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="capitalize">{activeTheme}</span>
          </button>

          {/* Device Frame Mode Toggle */}
          <div className="flex bg-[#1C1E24] border border-[#262A33] rounded-xl p-0.5">
            <button
              onClick={() => setDeviceSkin('pixel')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                deviceSkin === 'pixel' ? 'bg-[#2A2E39] text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Mobile Device Shell"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile Frame</span>
            </button>

            <button
              onClick={() => setDeviceSkin('fluid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                deviceSkin === 'fluid' ? 'bg-[#2A2E39] text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Expanded Fluid Layout"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Expanded</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Application Container */}
      <main className="w-full flex-1 flex items-center justify-center p-0 sm:p-4">
        <div
          className={`transition-all duration-300 relative flex flex-col overflow-hidden ${
            deviceSkin === 'pixel'
              ? 'w-full max-w-[430px] h-[100dvh] sm:h-[880px] sm:rounded-[44px] shadow-2xl ring-1 sm:ring-8 ring-[#1A1C22] bg-white dark:bg-[#0F1115] border-0 sm:border border-[#262A33]'
              : 'w-full max-w-2xl h-[100dvh] sm:h-[920px] sm:rounded-3xl shadow-2xl bg-white dark:bg-[#0F1115] border border-[#262A33]'
          }`}
        >
          {/* 1. Android Status Bar (Fixed height, safe area, non-overlapping) */}
          <StatusBar />

          {/* 2. Top App Header */}
          <AppHeader />

          {/* 3. Screen Viewport Content (Scrollable) */}
          <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-zinc-50/70 dark:bg-[#0F1115]">
            {renderActiveScreen()}
          </div>

          {/* 4. Bottom Navigation Bar */}
          <BottomNav />

          {/* Modals & Dialogs */}
          <CreateHabitModal />
          <CreateProgramModal />
          <HabitDetailModal />
          <ProgramDetailModal />
          <HabitLogModal />
          <NotificationCenterModal />

          {/* Toast Container */}
          <ToastContainer />
        </div>
      </main>
    </div>
  );
};
