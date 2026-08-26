import React, { useMemo } from 'react';
import {
  X,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  Layers,
  Sparkles,
  Target,
  Trash2,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateProgramProgress } from '../../utils/analyticsUtils';
import { IconRenderer } from '../common/IconRenderer';
import { formatReadableDate } from '../../utils/dateUtils';
import { HabitCard } from '../habits/HabitCard';

export const ProgramDetailModal: React.FC = () => {
  const {
    isProgramDetailOpen,
    setIsProgramDetailOpen,
    selectedProgramId,
    programs,
    habits,
    logs,
    unlockMilestone,
    deleteProgram,
    updateProgram,
  } = useApp();

  const program = programs.find(p => p.id === selectedProgramId);

  const progress = useMemo(() => {
    if (!program) return null;
    return calculateProgramProgress(program, habits, logs);
  }, [program, habits, logs]);

  const linkedHabits = useMemo(() => {
    if (!program) return [];
    return habits.filter(h => program.dailyTargetHabitIds.includes(h.id) || h.programId === program.id);
  }, [program, habits]);

  if (!isProgramDetailOpen || !program || !progress) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-[#1C1E24] rounded-3xl shadow-2xl border border-zinc-200 dark:border-[#262A33] flex flex-col overflow-hidden">
        {/* Header Banner */}
        <div
          className="p-5 text-white relative overflow-hidden"
          style={{ backgroundColor: program.color || '#10B981' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-sm">
                <IconRenderer name={program.icon} className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black">{program.name}</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                    {program.difficulty}
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-0.5 line-clamp-1">
                  {program.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsProgramDetailOpen(false)}
              className="p-1 rounded-lg text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Dates */}
          <div className="mt-4 flex items-center justify-between text-xs text-white/90 font-semibold pt-3 border-t border-white/20">
            <span>Started: {formatReadableDate(program.startDate, 'short')}</span>
            <span>Ends: {formatReadableDate(program.endDate, 'short')}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200/80 dark:border-[#262A33] text-center">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">Progress</div>
              <div className="text-xl font-black text-emerald-500 dark:text-emerald-400 mt-0.5">
                {progress.overallCompletionRate}%
              </div>
              <div className="text-[9px] text-zinc-500">Day {progress.elapsedDays} of {program.durationDays}</div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 text-center">
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 fill-current" />
                <span>Streak</span>
              </div>
              <div className="text-xl font-black text-amber-500 mt-0.5">
                {progress.currentStreak}d
              </div>
              <div className="text-[9px] text-zinc-500">Best: {progress.longestStreak}d</div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200/80 dark:border-[#262A33] text-center">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">Remaining</div>
              <div className="text-xl font-black text-blue-500 mt-0.5">
                {progress.remainingDays}d
              </div>
              <div className="text-[9px] text-zinc-500">To finish line</div>
            </div>
          </div>

          {/* Program Roadmap & Milestones */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#15171D] border border-zinc-200/80 dark:border-[#262A33] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Milestone Checkpoints ({program.milestones.length})
                </h3>
              </div>
            </div>

            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-[#262A33]">
              {progress.milestoneProgress.map((m) => {
                return (
                  <div key={m.id} className="relative flex items-start gap-3 pl-1">
                    {/* Circle icon on roadmap */}
                    <button
                      onClick={() => !m.isAchieved && unlockMilestone(program.id, m.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                        m.isAchieved
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-[#262A33] text-zinc-400 border-2 border-zinc-300 dark:border-zinc-700 hover:border-emerald-500'
                      }`}
                      title={m.isAchieved ? 'Milestone achieved!' : 'Click to mark achieved'}
                    >
                      {m.isAchieved ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{m.targetDay}</span>}
                    </button>

                    <div className="flex-1 min-w-0 bg-zinc-50 dark:bg-[#1C1E24] p-2.5 rounded-xl border border-zinc-200/60 dark:border-[#262A33]">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {m.title}
                        </span>
                        <span className="text-[10px] font-semibold text-zinc-400">
                          Day {m.targetDay}
                        </span>
                      </div>
                      {m.description && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {m.description}
                        </p>
                      )}
                      {m.achievedDate && (
                        <span className="inline-block text-[9px] font-bold text-emerald-500 dark:text-emerald-400 mt-1">
                          ✓ Achieved on {formatReadableDate(m.achievedDate, 'short')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Linked Target Habits */}
          {linkedHabits.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 px-1">
                Linked Habits for this Program ({linkedHabits.length})
              </h3>
              <div className="space-y-2">
                {linkedHabits.map(h => (
                  <HabitCard key={h.id} habit={h} />
                ))}
              </div>
            </div>
          )}

          {/* Program Notes if any */}
          {program.notes && (
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#15171D] text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">Notes:</span> {program.notes}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-100 dark:border-[#262A33] flex items-center justify-between bg-zinc-50 dark:bg-[#15171D]">
          <button
            onClick={() => {
              deleteProgram(program.id);
              setIsProgramDetailOpen(false);
            }}
            className="flex items-center gap-1 text-rose-500 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-2 rounded-xl"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Program</span>
          </button>

          <div className="flex gap-2">
            {program.status === 'active' && (
              <button
                onClick={() => {
                  updateProgram(program.id, { status: 'completed' });
                  setIsProgramDetailOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-xs"
              >
                Mark as Completed
              </button>
            )}
            <button
              onClick={() => setIsProgramDetailOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
