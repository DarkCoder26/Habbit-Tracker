import React from 'react';
import { Award, Calendar, CheckCircle2, ChevronRight, Flame, Target } from 'lucide-react';
import { Program } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateProgramProgress } from '../../utils/analyticsUtils';
import { IconRenderer } from '../common/IconRenderer';
import { formatReadableDate } from '../../utils/dateUtils';

interface ProgramCardProps {
  program: Program;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  const { habits, logs, openProgramDetail } = useApp();
  const progress = calculateProgramProgress(program, habits, logs);

  const completedMilestones = progress.milestoneProgress.filter(m => m.isAchieved).length;
  const totalMilestones = program.milestones.length;

  return (
    <div
      onClick={() => openProgramDetail(program.id)}
      className="group relative rounded-2xl p-4.5 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs hover:border-zinc-300 dark:hover:border-[#353A47] transition-all cursor-pointer overflow-hidden"
    >
      {/* Decorative accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: program.color || '#3B82F6' }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Program Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform"
            style={{ backgroundColor: program.color || '#3B82F6' }}
          >
            <IconRenderer name={program.icon} className="w-6 h-6" />
          </div>

          {/* Titles & Category */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {program.name}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#262A33] text-zinc-600 dark:text-zinc-400">
                {program.difficulty}
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
              {program.description}
            </p>
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors shrink-0 mt-1" />
      </div>

      {/* Progress Bar & Key Stats */}
      <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-[#262A33]/80">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-zinc-700 dark:text-zinc-300">
            Day {progress.elapsedDays} of {program.durationDays}
          </span>
          <span className="text-emerald-500 dark:text-emerald-400 font-bold">
            {progress.overallCompletionRate}%
          </span>
        </div>

        {/* Bar */}
        <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-[#262A33] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress.overallCompletionRate}%`,
              backgroundColor: program.color || '#3B82F6',
            }}
          />
        </div>

        {/* Bottom meta stats */}
        <div className="flex items-center justify-between mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1 font-medium text-amber-500">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>{progress.currentStreak}d streak</span>
          </div>

          <div className="flex items-center gap-1 font-medium">
            <Target className="w-3.5 h-3.5 text-blue-500" />
            <span>{completedMilestones}/{totalMilestones} Milestones</span>
          </div>

          <div className="flex items-center gap-1 font-medium text-zinc-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{progress.remainingDays}d left</span>
          </div>
        </div>
      </div>
    </div>
  );
};
