import React from 'react';
import { ShieldCheck, Lock, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  return (
    <header className="border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#08080c]/85 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Logo and App Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src="/logo.png"
              alt="FJY Channel Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-full shadow-lg shadow-sky-500/15 border border-black/10 dark:border-white/10 p-0.5 bg-slate-100 dark:bg-[#0d0d14]"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                FJY Channel <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-600 dark:from-sky-400 dark:via-cyan-300 dark:to-sky-500">Kompres</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                100% Klien
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              Kompres PDF, Gabung PDF, Kompres Foto & Restorasi Citra Tanpa Server
            </p>
          </div>
        </div>

        {/* Right Actions: Security Badge & Theme Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs flex-shrink-0">
          {/* Security Badge */}
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 sm:px-3 py-1 rounded-full font-medium text-[10px] sm:text-xs">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="hidden xs:inline">0 KB Ke Server</span>
            <span className="xs:hidden">Lokal</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full font-medium text-xs">
            <Lock className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Memori Lokal</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label="Ganti Tema Terang/Gelap"
            title={theme === 'dark' ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all active:scale-95 shadow-sm"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-pulse-subtle flex-shrink-0" />
                <span className="hidden sm:inline font-semibold text-xs text-amber-400">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span className="hidden sm:inline font-semibold text-xs text-sky-700">Gelap</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
