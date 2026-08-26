import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, Target, Sparkles, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Milestone } from '../../types';
import { AVAILABLE_CATEGORIES, AVAILABLE_COLORS, AVAILABLE_ICONS, IconRenderer } from '../common/IconRenderer';
import { addDays, getTodayString } from '../../utils/dateUtils';

export const CreateProgramModal: React.FC = () => {
  const { isCreateProgramOpen, setIsCreateProgramOpen, addProgram, habits } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('Layers');
  const [durationDays, setDurationDays] = useState(30);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 'm1', title: 'Week 1 Foundation', targetDay: 7, description: 'Establish consistent daily routine' },
    { id: 'm2', title: 'Halfway Checkpoint', targetDay: 15, description: 'Solidify automatic habit loop' },
    { id: 'm3', title: 'Grand Finish', targetDay: 30, description: 'Complete full challenge with honors' },
  ]);

  if (!isCreateProgramOpen) return null;

  const handleAddMilestone = () => {
    const nextDay = Math.min(durationDays, (milestones[milestones.length - 1]?.targetDay || 0) + 7);
    const newM: Milestone = {
      id: `m_${Date.now()}`,
      title: `Milestone (Day ${nextDay})`,
      targetDay: nextDay,
      description: 'Key checkpoint',
    };
    setMilestones([...milestones, newM]);
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleUpdateMilestone = (id: string, updates: Partial<Milestone>) => {
    setMilestones(milestones.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const toggleHabitLink = (habitId: string) => {
    setSelectedHabitIds(prev =>
      prev.includes(habitId) ? prev.filter(id => id !== habitId) : [...prev, habitId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const today = getTodayString();
    const endDate = addDays(today, durationDays);

    addProgram({
      name: name.trim(),
      description: description.trim(),
      category,
      color,
      icon,
      startDate: today,
      endDate,
      durationDays,
      difficulty,
      dailyTargetHabitIds: selectedHabitIds,
      milestones,
      status: 'active',
    });

    setIsCreateProgramOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-[#1C1E24] rounded-3xl shadow-2xl border border-zinc-200 dark:border-[#262A33] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-[#262A33] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              <IconRenderer name={icon} className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Create Program Journey
            </h2>
          </div>

          <button
            onClick={() => setIsCreateProgramOpen(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300">Program Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 100 Days of Code Sprint"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33] text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What will you accomplish in this program?"
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33] text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Duration & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Duration (Days)</label>
              <div className="flex gap-1.5">
                {[14, 21, 30, 60, 100].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold ${
                      durationDays === d
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-[#262A33] text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33] text-zinc-900 dark:text-zinc-100 font-bold"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Color & Icon */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Theme Color</label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33]">
                {AVAILABLE_COLORS.slice(0, 8).map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c.value ? 'scale-110 ring-2 ring-zinc-900 dark:ring-white' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Icon</label>
              <div className="flex flex-wrap gap-1.5 p-2 max-h-24 overflow-y-auto rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33]">
                {AVAILABLE_ICONS.slice(0, 12).map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-1 rounded-lg ${
                      icon === ic ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <IconRenderer name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Link Core Habits */}
          {habits.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#262A33]">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Link Daily Target Habits
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {habits.map(h => {
                  const isChecked = selectedHabitIds.includes(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleHabitLink(h.id)}
                      className={`p-2 rounded-xl text-left flex items-center gap-2 border transition-all ${
                        isChecked
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33] text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                        style={{ backgroundColor: h.color }}
                      >
                        ✓
                      </div>
                      <span className="truncate">{h.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Milestones Builder */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#262A33]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-500" />
                <span>Program Milestones ({milestones.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="text-[11px] text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33]"
                >
                  <div className="w-16 shrink-0">
                    <span className="text-[10px] text-zinc-400 font-bold">Target Day</span>
                    <input
                      type="number"
                      min="1"
                      max={durationDays}
                      value={m.targetDay}
                      onChange={e => handleUpdateMilestone(m.id, { targetDay: Number(e.target.value) })}
                      className="w-full px-1.5 py-1 bg-white dark:bg-[#262A33] rounded font-bold text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-zinc-400 font-bold">Title</span>
                    <input
                      type="text"
                      value={m.title}
                      onChange={e => handleUpdateMilestone(m.id, { title: e.target.value })}
                      placeholder="Milestone Title"
                      className="w-full px-2 py-1 bg-white dark:bg-[#262A33] rounded text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(m.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 mt-3"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-[#262A33] flex items-center justify-end gap-2 bg-zinc-50 dark:bg-[#15171D]">
          <button
            type="button"
            onClick={() => setIsCreateProgramOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-[#262A33]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
          >
            Start Program
          </button>
        </div>
      </div>
    </div>
  );
};
