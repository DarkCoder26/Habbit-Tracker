import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showText?: boolean;
  textClassName?: string;
  subText?: string;
  icon?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 110,
  strokeWidth = 10,
  color = '#10B981',
  bgColor,
  showText = true,
  textClassName = 'text-xl font-bold',
  subText,
  icon,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor || 'currentColor'}
          className={bgColor ? '' : 'text-zinc-200 dark:text-[#262A33]'}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress track with rounded ends */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        {icon && <div className="mb-0.5">{icon}</div>}
        {showText && (
          <span className={`text-zinc-900 dark:text-zinc-100 ${textClassName}`}>
            {clampedProgress}%
          </span>
        )}
        {subText && (
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 -mt-0.5">
            {subText}
          </span>
        )}
      </div>
    </div>
  );
};
