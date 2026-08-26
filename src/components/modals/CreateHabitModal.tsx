import React, { useState } from 'react';
import { X, Check, Bell, Calendar, Target, Sparkles, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DifficultyLevel, FrequencyType, GoalType } from '../../types';
import { AVAILABLE_CATEGORIES, AVAILABLE_COLORS, AVAILABLE_ICONS, IconRenderer } from '../common/IconRenderer';
import { getTodayString } from '../../utils/dateUtils';

export const CreateHabitModal: React.FC = () => {
  const { isCreateHabitOpen, setIsCreateHabitOpen, addHabit, programs } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('CheckCircle2');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [goalType, setGoalType] = useState<GoalType>('boolean');
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState('times');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [programId, setProgramId] = useState<string>('');
  const [notes, setNotes] = useState('');

  if (!isCreateHabitOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit({
      name: name.trim(),
      description: description.trim(),
      category,
      color,
      icon,
      frequency,
      customDays: frequency === 'custom_days' ? customDays : undefined,
      goalType,
      targetValue: goalType === 'boolean' ? 1 : Math.max(1, Number(targetValue)),
      unit: goalType === 'boolean' ? 'times' : unit,
      difficulty,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      reminderEnabled,
      startDate: getTodayString(),
      programId: programId || undefined,
      notes: notes.trim(),
    });

    // Reset and close
    setName('');
    setDescription('');
    setIsCreateHabitOpen(false);
  };

  const toggleDay = (dayIndex: number) => {
    setCustomDays(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex].sort()
    );
  };

  const weekDayLabels = [
    { idx: 0, label: 'S' },
    { idx: 1, label: 'M' },
    { idx: 2, label: 'T' },
    { idx: 3, label: 'W' },
    { idx: 4, label: 'T' },
    { idx: 5, label: 'F' },
    { idx: 6, label: 'S' },
  ];

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
              Create New Habit
            </h2>
          </div>

          <button
            onClick={() => setIsCreateHabitOpen(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Name & Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300">Habit Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 30 Minutes Coding Practice"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33] text-zinc-900 dark:text-zinc-100 font-medium focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief motivation or context"
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33] text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Color & Icon Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Color</label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33]">
                {AVAILABLE_COLORS.map(c => (
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
                {AVAILABLE_ICONS.slice(0, 15).map(ic => (
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

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    category === cat
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-100 dark:bg-[#262A33] text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Type & Target */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#262A33]">
            <label className="font-bold text-zinc-700 dark:text-zinc-300">Goal Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'boolean', label: 'Done / Not Done' },
                { id: 'duration', label: 'Duration (Time)' },
                { id: 'numeric', label: 'Quantity Target' },
              ].map(gt => (
                <button
                  key={gt.id}
                  type="button"
                  onClick={() => {
                    setGoalType(gt.id as GoalType);
                    if (gt.id === 'duration') {
                      setTargetValue(30);
                      setUnit('mins');
                    } else if (gt.id === 'numeric') {
                      setTargetValue(10);
                      setUnit('pages');
                    }
                  }}
                  className={`p-2 rounded-xl font-bold text-[11px] text-center border ${
                    goalType === gt.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'bg-zinc-50 dark:bg-[#15171D] border-zinc-200 dark:border-[#262A33] text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {gt.label}
                </button>
              ))}
            </div>

            {goalType !== 'boolean' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-zinc-500">Target Value</label>
                  <input
                    type="number"
                    min="1"
                    value={targetValue}
                    onChange={e => setTargetValue(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33] text-zinc-900 dark:text-zinc-100 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-500">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="e.g. mins, ml, reps, pages"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33] text-zinc-900 dark:text-zinc-100 font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Frequency */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#262A33]">
            <label className="font-bold text-zinc-700 dark:text-zinc-300">Frequency</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'daily', label: 'Every Day' },
                { id: 'weekdays', label: 'Weekdays' },
                { id: 'custom_days', label: 'Specific Days' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequency(f.id as FrequencyType)}
                  className={`p-2 rounded-xl font-bold text-[11px] text-center border ${
                    frequency === f.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'bg-zinc-50 dark:bg-[#15171D] border-zinc-200 dark:border-[#262A33] text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {frequency === 'custom_days' && (
              <div className="flex gap-1 pt-1 justify-between">
                {weekDayLabels.map(d => {
                  const isChecked = customDays.includes(d.idx);
                  return (
                    <button
                      key={d.idx}
                      type="button"
                      onClick={() => toggleDay(d.idx)}
                      className={`w-9 h-9 rounded-xl font-bold ${
                        isChecked
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-100 dark:bg-[#262A33] text-zinc-400'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Link to Program (Optional) */}
          {programs.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-[#262A33]">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span>Link to Program (Optional)</span>
              </label>
              <select
                value={programId}
                onChange={e => setProgramId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#15171D] border border-zinc-200 dark:border-[#262A33] text-zinc-900 dark:text-zinc-100"
              >
                <option value="">None (Independent Habit)</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.durationDays} Days)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reminder & Time */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-[#262A33]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-zinc-400" />
              <span className="font-bold text-zinc-700 dark:text-zinc-300">Daily Reminder</span>
            </div>
            <div className="flex items-center gap-2">
              {reminderEnabled && (
                <input
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-[#262A33] text-xs font-bold text-zinc-900 dark:text-zinc-100"
                />
              )}
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={e => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-100 dark:border-[#262A33] flex items-center justify-end gap-2 bg-zinc-50 dark:bg-[#15171D]">
          <button
            type="button"
            onClick={() => setIsCreateHabitOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-[#262A33]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
          >
            Save Habit
          </button>
        </div>
      </div>
    </div>
  );
};
