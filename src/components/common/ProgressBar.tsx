import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  statusMessage?: string;
  subMessage?: string;
  color?: 'sky' | 'emerald' | 'amber';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  statusMessage = 'Memproses...',
  subMessage,
  color = 'sky',
}) => {
  const colorMap = {
    sky: 'from-sky-500 to-cyan-400',
    emerald: 'from-emerald-500 to-teal-400',
    amber: 'from-amber-500 to-yellow-400',
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          <span>{statusMessage}</span>
        </div>
        <span className="font-mono font-semibold text-sky-400">{Math.round(progress)}%</span>
      </div>

      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]} transition-all duration-300 ease-out`}
          style={{ width: `${Math.max(3, Math.min(100, progress))}%` }}
        />
      </div>

      {subMessage && (
        <p className="text-[11px] text-slate-400 text-right">{subMessage}</p>
      )}
    </div>
  );
};

