import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-white/5 bg-[#08080c]/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Logo and App Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src="/logo.png"
              alt="FJY Channel Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-full shadow-lg shadow-sky-500/15 border border-white/10 p-0.5 bg-[#0d0d14]"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-bold text-sm sm:text-base md:text-lg text-white tracking-tight truncate">
                FJY Channel <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500">Kompres</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                100% Klien
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate">
              Kompres PDF, Gabung PDF & Kompres Foto Tanpa Server
            </p>
          </div>
        </div>

        {/* Security & Privacy Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-300 flex-shrink-0">
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 sm:px-3 py-1 rounded-full font-medium text-[10px] sm:text-xs">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="hidden xs:inline">0 KB Ke Server</span>
            <span className="xs:hidden">Aman</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/50 text-slate-300 px-3 py-1 rounded-full font-medium text-xs">
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            <span>Memori Lokal</span>
          </div>
        </div>
      </div>
    </header>
  );
};
