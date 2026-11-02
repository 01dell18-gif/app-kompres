import React, { useState, useEffect } from 'react';
import { Settings2, Zap, Sparkles, Printer, Palette, Target, Gauge, Sliders } from 'lucide-react';
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
      desc: 'Ukuran paling hemat (~97 DPI). Teks pindaian KTP & ijazah tetap terbaca jelas, ideal untuk batas <200 KB atau <500 KB.',
      tag: 'Hemat Maksimal',
      icon: Zap,
      scale: 1.35,
      quality: 0.52,
    },
    {
      id: 'balanced',
      title: 'Seimbang (Rekomendasi)',
      desc: 'Keseimbangan optimal (~126 DPI). Huruf, angka, stempel & tabel sangat tajam dengan penghematan 50%-75%.',
      tag: 'Kualitas Tajam',
      icon: Sparkles,
      scale: 1.75,
      quality: 0.68,
    },
    {
      id: 'light',
      title: 'Ringan (Kualitas Cetak)',
      desc: 'Resolusi tinggi studio (~158 DPI). Menjaga detail grafis halus, siap dicetak fisik tanpa blur.',
      tag: 'Siap Cetak',
      icon: Printer,
      scale: 2.2,
      quality: 0.85,
    },
  ];

  // Local state for custom typing of target size
  const [typedSizeValue, setTypedSizeValue] = useState<string>(() => {
    if (!options.targetSizeKB) return '';
    if (options.targetSizeKB >= 1024 && options.targetSizeKB % 1024 === 0) {
      return (options.targetSizeKB / 1024).toString();
    }
    return options.targetSizeKB.toString();
  });

  const [typedSizeUnit, setTypedSizeUnit] = useState<'KB' | 'MB'>(() => {
    if (options.targetSizeKB && options.targetSizeKB >= 1024 && options.targetSizeKB % 1024 === 0) {
      return 'MB';
    }
    return 'KB';
  });

  // Sync internal state if external options.targetSizeKB changes
  useEffect(() => {
    if (options.targetSizeKB === null || options.targetSizeKB === undefined) {
      setTypedSizeValue('');
    }
  }, [options.targetSizeKB]);

  const handlePresetSelect = (preset: typeof presets[0]) => {
    onChange({
      ...options,
      preset: preset.id,
      scale: preset.scale,
      quality: preset.quality,
      dpi: null, // Reset custom DPI to auto when selecting preset
    });
  };

  const handleApplyTypedSize = (valStr: string, unit: 'KB' | 'MB') => {
    setTypedSizeValue(valStr);
    setTypedSizeUnit(unit);

    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) {
      onChange({ ...options, targetSizeKB: null });
      return;
    }

    const sizeKB = unit === 'MB' ? Math.round(num * 1024) : Math.round(num);
    onChange({ ...options, targetSizeKB: sizeKB });
  };

  const handleQuickTargetClick = (valKB: number | null) => {
    if (valKB === null) {
      setTypedSizeValue('');
      onChange({ ...options, targetSizeKB: null });
    } else if (valKB >= 1024 && valKB % 1024 === 0) {
      const mbVal = valKB / 1024;
      setTypedSizeValue(mbVal.toString());
      setTypedSizeUnit('MB');
      onChange({ ...options, targetSizeKB: valKB });
    } else {
      setTypedSizeValue(valKB.toString());
      setTypedSizeUnit('KB');
      onChange({ ...options, targetSizeKB: valKB });
    }
  };

  const handleDpiSelect = (dpiVal: number | null) => {
    onChange({
      ...options,
      dpi: dpiVal,
      scale: dpiVal ? Math.round((dpiVal / 72) * 100) / 100 : options.scale,
    });
  };

  const handleGrayscaleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...options,
      grayscale: e.target.checked,
    });
  };

  const dpiPresets: { value: number | null; label: string; desc: string }[] = [
    { value: null, label: 'Otomatis', desc: 'Disesuaikan pintar' },
    { value: 72, label: '72 DPI', desc: 'Layar / Web Ringan' },
    { value: 96, label: '96 DPI', desc: 'Teks Kantor' },
    { value: 150, label: '150 DPI', desc: 'Standar CASN' },
    { value: 200, label: '200 DPI', desc: 'Sangat Tajam' },
    { value: 300, label: '300 DPI', desc: 'Kualitas Cetak' },
  ];

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-3 sm:pb-4 border-b border-slate-200 dark:border-white/10">
        <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500 dark:text-sky-400" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Pengaturan Kompresi Dokumen</h3>
      </div>

      {/* Preset Radio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {presets.map((p) => {
          const Icon = p.icon;
          const isSelected = options.preset === p.id && !options.dpi;
          return (
            <div
              key={p.id}
              onClick={() => !disabled && handlePresetSelect(p)}
              className={`relative cursor-pointer rounded-xl p-3.5 sm:p-4 border transition-all duration-200 flex flex-col justify-between active:scale-[0.99] ${
                isSelected
                  ? 'bg-sky-500/10 border-sky-500/50 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/30'
                  : 'bg-slate-50/80 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
              } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-sky-500 text-white' : 'bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {p.tag}
                  </span>
                </div>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-200 mb-1">{p.title}</h4>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
              </div>

              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                <span>Skala: {p.scale}x</span>
                <span>Kualitas: {Math.round(p.quality * 100)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row: Custom DPI Quality Settings */}
      <div className="bg-slate-50 dark:bg-[#151520] border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <span>Kualitas Resolusi DPI (Kerapatan Titik):</span>
          </label>
          <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 self-start sm:self-auto">
            {options.dpi ? `${options.dpi} DPI (~${Math.round((options.dpi / 72) * 100) / 100}x)` : 'Otomatis (Sesuai Preset)'}
          </span>
        </div>

        {/* DPI Preset Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {dpiPresets.map((d) => {
            const isSelected = options.dpi === d.value;
            return (
              <button
                key={d.label}
                type="button"
                onClick={() => !disabled && handleDpiSelect(d.value)}
                disabled={disabled}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20 ring-1 ring-sky-400/40'
                    : 'bg-white/80 dark:bg-[#1a1a28] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-sky-400/40 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="text-xs font-bold">{d.label}</div>
                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {d.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom DPI Slider */}
        <div className="pt-2 flex items-center gap-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">Geser DPI Bebas:</span>
          <input
            type="range"
            min="50"
            max="300"
            step="5"
            value={options.dpi || 126}
            onChange={(e) => handleDpiSelect(Number(e.target.value))}
            disabled={disabled}
            className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 w-16 text-right">
            {options.dpi || 126} DPI
          </span>
        </div>
      </div>

      {/* Row: Target Size (Typing Allowed) & Grayscale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-white/5">
        {/* Custom Target Size Input (Dapat Diketik Permintaan Size-nya) */}
        <div className="bg-slate-50 dark:bg-[#151520] border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Target Batas Ukuran (Bisa Diketik):</span>
            </label>
            {options.targetSizeKB && (
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                Target: &lt; {options.targetSizeKB >= 1024 ? `${(options.targetSizeKB / 1024).toFixed(1)} MB` : `${options.targetSizeKB} KB`}
              </span>
            )}
          </div>

          {/* Typing Input Box with Unit Selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="10"
                max="100000"
                step="any"
                placeholder="Ketik ukuran target, cth: 200, 350, 1.5..."
                value={typedSizeValue}
                onChange={(e) => handleApplyTypedSize(e.target.value, typedSizeUnit)}
                disabled={disabled}
                className="w-full bg-white dark:bg-[#1a1a28] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="flex items-center rounded-xl bg-slate-200 dark:bg-[#1a1a28] p-1 border border-slate-300 dark:border-white/10">
              <button
                type="button"
                onClick={() => handleApplyTypedSize(typedSizeValue, 'KB')}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  typedSizeUnit === 'KB'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                KB
              </button>
              <button
                type="button"
                onClick={() => handleApplyTypedSize(typedSizeValue, 'MB')}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  typedSizeUnit === 'MB'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                MB
              </button>
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Pilihan Cepat:</span>
            {[
              { label: 'Bebas (Otomatis)', value: null },
              { label: '200 KB (CASN)', value: 200 },
              { label: '500 KB (Instansi)', value: 500 },
              { label: '1 MB', value: 1024 },
              { label: '2 MB', value: 2048 },
            ].map((chip) => {
              const isSelected = options.targetSizeKB === chip.value;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => !disabled && handleQuickTargetClick(chip.value)}
                  disabled={disabled}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                      : 'bg-white/80 dark:bg-[#1a1a28] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-emerald-400/40 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
            Ketik permintaan ukuran berkas yang Anda butuhkan (contoh: portal hanya menerima maksimal 300 KB).
          </p>
        </div>

        {/* Grayscale Mode Checkbox */}
        <div className="bg-slate-50 dark:bg-[#151520] border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Mode Skala Abu-abu (Monokrom Dokumen)</span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Menghilangkan kanal warna untuk meningkatkan kontras teks hitam-putih dan memotong ukuran dokumen pindaian ijazah/KTP hingga 40% tambahan.
            </p>
          </div>

          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              options.grayscale
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200'
                : 'bg-white dark:bg-[#1a1a28] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
            } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              type="checkbox"
              checked={options.grayscale}
              onChange={handleGrayscaleToggle}
              disabled={disabled}
              className="rounded border-slate-300 dark:border-white/20 text-sky-500 focus:ring-0 bg-white dark:bg-black/40 w-4 h-4 flex-shrink-0"
            />
            <span className="text-xs font-semibold">Aktifkan Dokumen Skala Abu-Abu (Grayscale)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
