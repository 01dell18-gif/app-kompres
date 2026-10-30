import React from 'react';
import { Settings2, Zap, Sparkles, Printer, Palette, Target } from 'lucide-react';
import { PdfCompressOptions, PdfPreset } from '../../types';

interface CompressionSettingsProps {
  options: PdfCompressOptions;
  onChange: (options: PdfCompressOptions) => void;
  disabled?: boolean;
}

export const CompressionSettings: React.FC<CompressionSettingsProps> = ({
  options,
  onChange,
  disabled = false,
}) => {
  const presets: {
    id: PdfPreset;
    title: string;
    desc: string;
    tag: string;
    icon: typeof Zap;
    scale: number;
    quality: number;
  }[] = [
    {
      id: 'extreme',
      title: 'Ekstrem (Screen / Web)',
      desc: 'Ukuran paling kecil, resolusi ~72 DPI. Ideal untuk syarat batas <200 KB atau <500 KB.',
      tag: 'Ukuran Terkecil',
      icon: Zap,
      scale: 0.95,
      quality: 0.42,
    },
    {
      id: 'balanced',
      title: 'Seimbang (Rekomendasi)',
      desc: 'Keseimbangan terbaik (~150 DPI). Teks dan tabel sangat jernih dengan penghematan 50%-80%.',
      tag: 'Bawaan Standar',
      icon: Sparkles,
      scale: 1.3,
      quality: 0.63,
    },
    {
      id: 'light',
      title: 'Ringan (Kualitas Cetak)',
      desc: 'Mempertahankan resolusi tinggi (~300 DPI). Penurunan ukuran moderat, siap cetak fisik.',
      tag: 'Kualitas Tinggi',
      icon: Printer,
      scale: 1.7,
      quality: 0.82,
    },
  ];

  const targetSizeOptions = [
    { label: 'Bebas (Sesuai Preset)', value: null },
    { label: '< 200 KB (CASN/BUMN)', value: 200 },
    { label: '< 500 KB (Portal Instansi)', value: 500 },
    { label: '< 1000 KB (1 MB)', value: 1000 },
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    onChange({
      ...options,
      preset: preset.id,
      scale: preset.scale,
      quality: preset.quality,
    });
  };

  const handleTargetChange = (val: number | null) => {
    onChange({
      ...options,
      targetSizeKB: val,
    });
  };

  const handleGrayscaleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...options,
      grayscale: e.target.checked,
    });
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-center gap-2.5 pb-3 sm:pb-4 border-b border-white/10 mb-4 sm:mb-5">
        <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
        <h3 className="font-semibold text-slate-100 text-sm sm:text-base">Pengaturan Kompresi Dokumen</h3>
      </div>

      {/* Preset Radio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 sm:mb-6">
        {presets.map((p) => {
          const Icon = p.icon;
          const isSelected = options.preset === p.id;
          return (
            <div
              key={p.id}
              onClick={() => !disabled && handlePresetSelect(p)}
              className={`relative cursor-pointer rounded-xl p-3.5 sm:p-4 border transition-all duration-200 flex flex-col justify-between active:scale-[0.99] ${
                isSelected
                  ? 'bg-sky-500/10 border-sky-500/50 shadow-md shadow-sky-500/10'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {p.tag}
                  </span>
                </div>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-200 mb-1">{p.title}</h4>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>

              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
                <span>Skala: {p.scale}x</span>
                <span>Kualitas: {Math.round(p.quality * 100)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Row: Target Size & Grayscale */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-white/5">
        {/* Target Size Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span>Target Batas Ukuran (Opsional)</span>
          </label>
          <select
            value={options.targetSizeKB === null ? '' : options.targetSizeKB}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              handleTargetChange(val);
            }}
            disabled={disabled}
            className="w-full bg-[#181822] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 min-h-[40px]"
          >
            {targetSizeOptions.map((opt, i) => (
              <option key={i} value={opt.value === null ? '' : opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] sm:text-[11px] text-slate-500">
            Algoritma otomatis menyesuaikan agar tepat di bawah batas target.
          </p>
        </div>

        {/* Grayscale Mode Checkbox */}
        <div className="space-y-1.5">
          <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>Mode Skala Abu-abu (Monokrom)</span>
          </label>
          <label
            className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors min-h-[40px] ${
              options.grayscale
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-[#181822] border-white/10 text-slate-300'
            } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              type="checkbox"
              checked={options.grayscale}
              onChange={handleGrayscaleToggle}
              disabled={disabled}
              className="rounded border-white/20 text-sky-500 focus:ring-0 bg-black/40 w-4 h-4 flex-shrink-0"
            />
            <span className="text-xs font-medium">Ubah dokumen menjadi Grayscale</span>
          </label>
          <p className="text-[10px] sm:text-[11px] text-slate-500">
            Memotong ukuran tambahan hingga 40% pada berkas pindaian berwarna.
          </p>
        </div>
      </div>
    </div>
  );
};
