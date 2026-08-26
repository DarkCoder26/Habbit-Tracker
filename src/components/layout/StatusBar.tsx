import React, { useEffect, useState } from 'react';
import { Battery, BatteryCharging, Signal, Wifi } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StatusBar: React.FC = () => {
  const { activeTheme } = useApp();
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      // 12-hour or 24-hour clean mobile format
      const formatted = `${hours % 12 || 12}:${minutes}`;
      setTimeStr(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`w-full shrink-0 select-none z-40 transition-colors duration-200 ${
        activeTheme === 'dark'
          ? 'bg-[#0F1115] text-zinc-100'
          : 'bg-white text-zinc-900'
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="h-10 px-5 flex items-center justify-between text-xs font-semibold tracking-tight">
        {/* Left: Clock */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold tabular-nums text-[13px]">{timeStr}</span>
        </div>

        {/* Center: Subtle Android camera hole punch simulation */}
        <div className="w-3.5 h-3.5 rounded-full bg-[#1C1E24] border border-[#262A33] shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0F1115]" />
        </div>

        {/* Right: Network & Battery Indicators */}
        <div className="flex items-center gap-2">
          <Signal className="w-3.5 h-3.5 stroke-[2.2]" />
          <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-bold tabular-nums">98%</span>
            <Battery className="w-4 h-4 fill-current stroke-[2]" />
          </div>
        </div>
      </div>
    </header>
  );
};
