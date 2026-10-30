import React from 'react';
import { ShieldCheck, Zap, Lock, FileSpreadsheet } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-white/5 bg-[#08080c]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-[1px] shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#0d0d12] rounded-[11px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg sm:text-xl text-white tracking-tight flex items-center gap-1.5">
                Berkas<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">Lokal</span>
              </h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">
                100% Klien
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Kompres PDF, Gabung Dokumen & Kompres Foto Tanpa Server
            </p>
          </div>
        </div>

        {/* Security & Privacy Badges */}
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>0 KB Terkirim Keluar</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/50 text-slate-300 px-3 py-1 rounded-full font-medium hidden md:flex">
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            <span>Sandbox Memori Lokal</span>
          </div>
        </div>
      </div>
    </header>
  );
};

