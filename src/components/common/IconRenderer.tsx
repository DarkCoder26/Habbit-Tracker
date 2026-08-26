import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5', size }) => {
  // Try to find the icon in lucide-react
  const IconComponent = (Icons as any)[name] || Icons.CheckCircle2;
  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_ICONS = [
  'Activity', 'Award', 'BookOpen', 'Brain', 'CheckCircle2', 'Code', 'Code2',
  'Coffee', 'Compass', 'Dumbbell', 'Droplets', 'Feather', 'Flame', 'Footprints',
  'Heart', 'Layers', 'Lightbulb', 'Moon', 'Music', 'Pencil', 'Rocket', 'Running',
  'Shield', 'Smile', 'Sparkles', 'Sun', 'Target', 'Timer', 'Trophy', 'Zap'
];

export const AVAILABLE_COLORS = [
  { name: 'Emerald', value: '#10B981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
  { name: 'Blue', value: '#3B82F6', bgClass: 'bg-blue-500', textClass: 'text-blue-500' },
  { name: 'Indigo', value: '#6366F1', bgClass: 'bg-indigo-500', textClass: 'text-indigo-500' },
  { name: 'Purple', value: '#8B5CF6', bgClass: 'bg-purple-500', textClass: 'text-purple-500' },
  { name: 'Pink', value: '#EC4899', bgClass: 'bg-pink-500', textClass: 'text-pink-500' },
  { name: 'Rose', value: '#F43F5E', bgClass: 'bg-rose-500', textClass: 'text-rose-500' },
  { name: 'Amber', value: '#F59E0B', bgClass: 'bg-amber-500', textClass: 'text-amber-500' },
  { name: 'Orange', value: '#F97316', bgClass: 'bg-orange-500', textClass: 'text-orange-500' },
  { name: 'Teal', value: '#14B8A6', bgClass: 'bg-teal-500', textClass: 'text-teal-500' },
  { name: 'Cyan', value: '#06B6D4', bgClass: 'bg-cyan-500', textClass: 'text-cyan-500' },
];

export const AVAILABLE_CATEGORIES = [
  'Health',
  'Fitness',
  'Productivity',
  'Learning',
  'Mindfulness',
  'Finance',
  'Creativity',
  'Social',
  'Personal',
];
