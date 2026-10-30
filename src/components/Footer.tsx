import React from 'react';
import { Shield, Cpu, CheckCircle2, Wand2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 sm:mt-20 border-t border-white/5 bg-[#07070a] text-slate-400 text-xs py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Features info grid updated with Restorasi Foto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-12">
          {/* Card 1: Privasi */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-1">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Privasi Mutlak Sejak Desain</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Berkas pendaftaran, pasfoto, SK, ijazah, dan KTP tidak pernah diunggah ke internet. Seluruh proses berjalan di peramban lokal perangkat Anda.
            </p>
          </div>

          {/* Card 2: Pemrosesan Multi-Utas */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-1">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Pemrosesan Multi-Utas Klien</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Memanfaatkan akselerasi Canvas, PDF.js, dan PDF-Lib secara paralel untuk kecepatan tinggi tanpa membebani antarmuka pengguna.
            </p>
          </div>

          {/* Card 3: Optimal CASN */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Optimal Syarat CASN & Instansi</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Mendukung preset target ketat (&lt;200 KB, &lt;500 KB, &lt;1000 KB) agar lolos validasi otomatis portal administrasi resmi.
            </p>
          </div>

          {/* Card 4: Restorasi & Super Resolution */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1">
              <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Restorasi & AI Image Upscaler</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              De-blur foto buram, denoise bintik noise malam hari, restorasi foto jadul/pudar, serta pembesaran resolusi 2x/4x tanpa pecah.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/5 text-slate-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} FJY Channel Kompres. Utilitas Berkas & Restorasi Citra 100% Lokal di Perangkat.</p>
          <div className="flex items-center gap-2 text-slate-400 justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Sistem Lokal Siap Digunakan
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
