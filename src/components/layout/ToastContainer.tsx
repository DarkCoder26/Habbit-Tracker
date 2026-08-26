import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none flex flex-col gap-2">
      {toasts.map(toast => {
        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-zinc-900/95 dark:bg-[#1C1E24]/95 text-white backdrop-blur-md rounded-xl p-3 shadow-xl border border-zinc-700/60 dark:border-[#262A33] flex items-start gap-2.5 transform transition-all duration-300 animate-in fade-in slide-in-from-top-4"
          >
            {toast.type === 'info' ? (
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-100">{toast.title}</p>
              {toast.message && (
                <p className="text-[11px] text-zinc-300 truncate mt-0.5">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-white p-0.5 -mr-1 -mt-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
