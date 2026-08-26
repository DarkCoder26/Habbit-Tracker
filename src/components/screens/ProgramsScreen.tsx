import React, { useState } from 'react';
import { Award, CheckCircle2, ChevronRight, Compass, Flame, Layers, Plus, Sparkles, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProgramCard } from '../programs/ProgramCard';
import { addDays, getTodayString } from '../../utils/dateUtils';

const PROGRAM_TEMPLATES = [
  {
    name: '30-Day Coding Challenge',
    category: 'Learning',
    icon: 'Code2',
    color: '#3B82F6',
    durationDays: 30,
    difficulty: 'intermediate' as const,
    description: 'Solve algorithmic challenges, build full-stack features, and practice clean code daily.',
    milestones: [
      { id: 't_m1', title: 'Day 7 Kickoff', targetDay: 7, description: '1 week unbroken coding momentum' },
      { id: 't_m2', title: 'Day 15 Architecture', targetDay: 15, description: 'Design complex modular systems' },
      { id: 't_m3', title: 'Day 30 Grand Finish', targetDay: 30, description: 'Ship production application' },
    ],
  },
  {
    name: '21-Day Mindful Balance',
    category: 'Mindfulness',
    icon: 'Sparkles',
    color: '#EC4899',
    durationDays: 21,
    difficulty: 'beginner' as const,
    description: 'Daily breathwork, gratitude journaling, and conscious screen-free morning routines.',
    milestones: [
      { id: 't_mb1', title: 'Day 7 Clarity', targetDay: 7, description: 'Establish quiet space & rhythm' },
      { id: 't_mb2', title: 'Day 14 Calm', targetDay: 14, description: '2 weeks of mindful presence' },
      { id: 't_mb3', title: 'Day 21 Master', targetDay: 21, description: 'Permanent mental wellness habit' },
    ],
  },
  {
    name: '75-Day Hard Discipline',
    category: 'Fitness',
    icon: 'Dumbbell',
    color: '#10B981',
    durationDays: 75,
    difficulty: 'advanced' as const,
    description: 'Two 45-minute daily workouts, 4L water, strict nutrition, and 10 pages of reading.',
    milestones: [
      { id: 't_h1', title: 'Phase 1: Week 2', targetDay: 14, description: 'Beat the initial resistance' },
      { id: 't_h2', title: 'Phase 2: Halfway', targetDay: 37, description: 'Peak physical conditioning' },
      { id: 't_h3', title: 'Phase 3: Final 10', targetDay: 65, description: 'Final stretch to finish line' },
      { id: 't_h4', title: 'Day 75 Legend', targetDay: 75, description: 'Unbreakable mental toughness' },
    ],
  },
  {
    name: '30-Day Deep Reading',
    category: 'Learning',
    icon: 'BookOpen',
    color: '#F59E0B',
    durationDays: 30,
    difficulty: 'easy' as const,
    description: 'Read 25+ pages of non-fiction literature and take structured notes each day.',
    milestones: [
      { id: 't_r1', title: 'Book 1 Finished', targetDay: 10, description: 'First 250 pages conquered' },
      { id: 't_r2', title: 'Book 2 Finished', targetDay: 20, description: '500 pages of knowledge absorbed' },
      { id: 't_r3', title: '30-Day Reader', targetDay: 30, description: '3 comprehensive books read' },
    ],
  },
];

export const ProgramsScreen: React.FC = () => {
  const { programs, setIsCreateProgramOpen, addProgram, habits } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'templates' | 'completed'>('active');

  const activePrograms = programs.filter(p => p.status === 'active');
  const completedPrograms = programs.filter(p => p.status === 'completed');

  const handleStartTemplate = (template: typeof PROGRAM_TEMPLATES[0]) => {
    const today = getTodayString();
    const endDate = addDays(today, template.durationDays);

    // Link relevant habits if existing
    const matchingHabits = habits.filter(h => h.category === template.category).map(h => h.id);

    addProgram({
      name: template.name,
      description: template.description,
      category: template.category,
      color: template.color,
      icon: template.icon,
      startDate: today,
      endDate,
      durationDays: template.durationDays,
      difficulty: template.difficulty,
      dailyTargetHabitIds: matchingHabits,
      milestones: template.milestones,
      status: 'active',
    });
    setActiveTab('active');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24">
      {/* Header Banner */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#1C1E24] via-[#161820] to-[#0F1115] text-white shadow-lg border border-[#262A33] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Compass className="w-3.5 h-3.5" />
              <span>Multi-Week Challenges</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Programs & Journeys
            </h2>
            <p className="text-xs text-zinc-400 max-w-xs">
              Structured multi-day roadmaps with milestones and achievement benchmarks.
            </p>
          </div>

          <button
            onClick={() => setIsCreateProgramOpen(true)}
            className="w-11 h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            title="Create Custom Program"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-zinc-100 dark:bg-[#1C1E24] p-1 border border-zinc-200/80 dark:border-[#262A33]">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'active'
              ? 'bg-white dark:bg-[#2A2E39] text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Active ({activePrograms.length})
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'templates'
              ? 'bg-white dark:bg-[#2A2E39] text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Explore ({PROGRAM_TEMPLATES.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-[#2A2E39] text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Completed ({completedPrograms.length})
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activePrograms.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                No active programs yet
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                Join a 30-day challenge or build your own custom roadmap with milestones!
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setActiveTab('templates')}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-[#262A33] font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                >
                  Explore Templates
                </button>
                <button
                  onClick={() => setIsCreateProgramOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold text-xs hover:bg-emerald-600 shadow-xs"
                >
                  Create Custom
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activePrograms.map(prog => (
                <ProgramCard key={prog.id} program={prog} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates Tab Content */}
      {activeTab === 'templates' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-1">
            Curated Blueprints
          </div>
          {PROGRAM_TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-4 bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: tmpl.color }}
                  >
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {tmpl.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#262A33] text-zinc-600 dark:text-zinc-400">
                        {tmpl.durationDays} Days
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {tmpl.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Milestones Preview */}
              <div className="bg-zinc-50 dark:bg-[#15171D] rounded-xl p-2.5 space-y-1.5 border border-transparent dark:border-[#262A33]">
                <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-blue-500" />
                  <span>Key Milestones ({tmpl.milestones.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tmpl.milestones.map((m, mIdx) => (
                    <span
                      key={mIdx}
                      className="text-[10px] bg-white dark:bg-[#262A33] border border-zinc-200 dark:border-[#353A47] px-2 py-0.5 rounded-md font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      {m.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleStartTemplate(tmpl)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start This Program</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Tab Content */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completedPrograms.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-[#1C1E24] border border-zinc-200/80 dark:border-[#262A33] space-y-2">
              <Award className="w-10 h-10 text-zinc-400 mx-auto" />
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                No completed programs yet
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                Stick with your active programs and reach day 30 to earn permanent badges!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedPrograms.map(prog => (
                <ProgramCard key={prog.id} program={prog} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button (Mobile-First Quick Action) */}
      <div className="fixed bottom-20 right-5 sm:absolute sm:bottom-20 sm:right-6 z-20 pointer-events-none">
        <button
          onClick={() => setIsCreateProgramOpen(true)}
          className="pointer-events-auto w-13 h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-90 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all duration-200"
          title="Create Custom Program"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
