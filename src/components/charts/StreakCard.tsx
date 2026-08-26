import React from 'react';
import { Flame, Trophy, Zap } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  overallConsistency: number;
}

const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365];

export const StreakCard: React.FC<StreakCardProps> = ({
  currentStreak,
  longestStreak,
  overallConsistency,
}) => {
  // Find next milestone
  const nextMilestone = STREAK_MILESTONES.find(m => m > currentStreak) || (currentStreak + 10);
  const prevMilestone = [...STREAK_MILESTONES].reverse().find(m => m <= currentStreak) || 0;
  
  const progressInSegment = nextMilestone > prevMilestone
    ? Math.min(100, Math.max(0, Math.round(((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)))
    : 100;

  const daysToNext = Math.max(1, nextMilestone - currentStreak);

  return (
    <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 shadow-xs">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Flame Icon with subtle pulse */}
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="w-7 h-7 animate-pulse" />
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {currentStreak}
              </span>
              <span className="text-sm font-semibold text-amber-500">
                Days Streak
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {currentStreak > 0
                ? `${daysToNext} more days to reach ${nextMilestone}-day milestone!`
                : 'Complete today’s habits to ignite your streak!'}
            </p>
          </div>
        </div>

        {/* Longest Streak Badge */}
        <div className="flex flex-col items-end text-right">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Best Peak
          </span>
          <div className="flex items-center gap-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>{longestStreak}d</span>
          </div>
        </div>
      </div>

      {/* Progress towards next milestone */}
      <div className="mt-3.5 pt-3 border-t border-amber-500/10">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            Next Milestone: {nextMilestone} Days
          </span>
          <span>{progressInSegment}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700 ease-out"
            style={{ width: `${progressInSegment}%` }}
          />
        </div>
      </div>
    </div>
  );
};
