import React from 'react';
import { Shield, Cpu, Lock, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/5 bg-[#07070a] text-slate-400 text-xs py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Features info grid inspired by Tepilayar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-1">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Privasi Mutlak Sejak Desain</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Berkas pendaftaran, pasfoto, SK, ijazah, dan KTP tidak pernah diunggah ke internet. Seluruh proses berjalan di peramban lokal perangkat Anda.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-1">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Pemrosesan Multi-Utas Klien</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Memanfaatkan akselerasi Canvas, PDF.js, dan PDF-Lib secara paralel untuk kecepatan tinggi tanpa membebani antarmuka pengguna.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Optimal Syarat CASN & Instansi</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Mendukung preset target ketat (&lt;200 KB, &lt;500 KB, &lt;1000 KB) agar lolos validasi otomatis portal administrasi resmi.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5 text-slate-500">
          <p>© {new Date().getFullYear()} BerkasLokal. Solusi Utilitas Kompresi & Penggabungan Klien Berbasis Standar Web Modern.</p>
          <div className="flex items-center gap-4 text-slate-400">
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

