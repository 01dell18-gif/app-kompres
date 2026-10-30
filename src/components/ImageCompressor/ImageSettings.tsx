import React from 'react';
import { Sliders, Image as ImageIcon, Maximize2, Target } from 'lucide-react';
import { ImageCompressOptions, ImageFormat } from '../../types';

interface ImageSettingsProps {
  options: ImageCompressOptions;
  onChange: (options: ImageCompressOptions) => void;
  disabled?: boolean;
}

export const ImageSettings: React.FC<ImageSettingsProps> = ({
  options,
  onChange,
  disabled = false,
}) => {
  const formats: { id: ImageFormat; label: string; desc: string }[] = [
    { id: 'original', label: 'Asli', desc: 'Pertahankan format masukan' },
    { id: 'image/webp', label: 'WebP (Rekomendasi)', desc: 'Ukuran terkecil untuk web & medsos' },
    { id: 'image/jpeg', label: 'JPEG / JPG', desc: 'Standar dokumen & portal pendaftaran' },
    { id: 'image/png', label: 'PNG', desc: 'Lossless & transparansi' },
  ];

  const dimensions = [
    { label: 'Asli (Tanpa Ubah Dimensi)', value: 0 },
    { label: 'Full HD (Maks. 1920 px)', value: 1920 },
    { label: 'HD (Maks. 1280 px)', value: 1280 },
    { label: 'Pasfoto / Web (Maks. 800 px)', value: 800 },
    { label: 'Kecil / Ikon (Maks. 400 px)', value: 400 },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 mb-6 space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
        <Sliders className="w-5 h-5 text-sky-400" />
        <h3 className="font-semibold text-slate-100 text-base">Pengaturan Kompresi Citra Massal</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quality Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Kualitas Gambar:
            </label>
            <span className="font-mono text-xs font-bold text-sky-400 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20">
              {Math.round(options.quality * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={Math.round(options.quality * 100)}
            onChange={(e) =>
              onChange({
                ...options,
                quality: Number(e.target.value) / 100,
              })
            }
            disabled={disabled}
            className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <p className="text-[11px] text-slate-500">
            Nilai 70%–80% adalah standar optimal (hemat 40%–75% tanpa penurunan kasat mata).
          </p>
        </div>

        {/* Output Format */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Format Luaran:</span>
          </label>
          <select
            value={options.format}
            onChange={(e) =>
              onChange({
                ...options,
                format: e.target.value as ImageFormat,
              })
            }
            disabled={disabled}
            className="w-full bg-[#181822] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {formats.map((fmt) => (
              <option key={fmt.id} value={fmt.id}>
                {fmt.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            WebP menghasilkan file paling efisien; JPEG cocok untuk portal resmi CASN/BUMN.
          </p>
        </div>

        {/* Dimension Clamping */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-emerald-400" />
            <span>Batasi Dimensi Maksimal:</span>
          </label>
          <select
            value={options.maxDimension}
            onChange={(e) =>
              onChange({
                ...options,
                maxDimension: Number(e.target.value),
              })
            }
            disabled={disabled}
            className="w-full bg-[#181822] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {dimensions.map((dim, i) => (
              <option key={i} value={dim.value}>
                {dim.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Menjaga aspek rasio tanpa pembesaran artifisial (upscaling).
          </p>
        </div>
      </div>
    </div>
  );
};

