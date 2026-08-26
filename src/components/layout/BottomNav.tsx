import React from 'react';
import { BarChart3, Calendar, CheckSquare, Layers, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { triggerHaptic } from '../../utils/feedback';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, settings, habits, programs } = useApp();

  const tabs = [
    {
      id: 'home' as const,
      label: 'Today',
      icon: CheckSquare,
      badge: habits.filter(h => !h.archived).length,
    },
    {
      id: 'programs' as const,
      label: 'Programs',
      icon: Layers,
      badge: programs.filter(p => p.status === 'active').length,
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'calendar' as const,
      label: 'Calendar',
      icon: Calendar,
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
    },
  ];

  const handleTabClick = (tabId: typeof activeTab) => {
    if (settings.hapticFeedback) triggerHaptic('light');
    setActiveTab(tabId);
  };

  return (
    <div
      className="shrink-0 w-full bg-white/95 dark:bg-[#0F1115]/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-[#262A33] z-30 select-none transition-colors duration-200"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-500 dark:text-emerald-400 font-semibold'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
              }`}
            >
              {/* Icon Container with subtle background when active */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`p-1 rounded-xl transition-transform duration-200 ${
                    isActive ? 'scale-110 bg-emerald-500/10 dark:bg-emerald-400/15' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Badge if present */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white dark:ring-[#0F1115]">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Single line label */}
              <span className="text-[11px] mt-0.5 tracking-tight whitespace-nowrap">
                {tab.label}
              </span>

              {/* Active bar indicator */}
              {isActive && (
                <div className="w-4 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
