import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Wand2,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  ZoomIn,
  Eye,
  SlidersHorizontal,
  FileImage,
  ArrowRight,
  Maximize2,
  CheckCircle2,
  Loader2,
  Sun,
  Contrast,
  Palette,
  Thermometer,
} from 'lucide-react';
import { Dropzone } from '../common/Dropzone';
import {
  RestorationSettings,
  DEFAULT_RESTORATION_SETTINGS,
  processRestoration,
} from '../../services/restorationService';
import { formatBytes, getCompressedFilename } from '../../utils/formatters';
import { validateImageFile, revokeIfBlobUrl } from '../../utils/fileValidation';
import { triggerDownload } from '../../services/zipService';

interface PhotoRestorationProps {
  onTransferToCompressor?: (file: File) => void;
}

export const PhotoRestoration: React.FC<PhotoRestorationProps> = ({
  onTransferToCompressor,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);

  const [settings, setSettings] = useState<RestorationSettings>(DEFAULT_RESTORATION_SETTINGS);
  const [restoredUrl, setRestoredUrl] = useState<string>('');
  const [restoredBlob, setRestoredBlob] = useState<Blob | null>(null);
  const [restoredWidth, setRestoredWidth] = useState<number>(0);
  const [restoredHeight, setRestoredHeight] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      revokeIfBlobUrl(originalUrl);
      revokeIfBlobUrl(restoredUrl);
    };
  }, []);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    const validation = validateImageFile(selected);
    if (!validation.valid) {
      alert(validation.error || 'Format citra tidak valid');
      return;
    }

    revokeIfBlobUrl(originalUrl);
    revokeIfBlobUrl(restoredUrl);
    setRestoredUrl('');
    setRestoredBlob(null);

    const url = URL.createObjectURL(selected);
    setFile(selected);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      sourceImageRef.current = img;
      runRestoration(img, DEFAULT_RESTORATION_SETTINGS);
    };
    img.src = url;
  };

  const runRestoration = async (imgElement: HTMLImageElement, currentSettings: RestorationSettings) => {
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 20));
      const res = await processRestoration(imgElement, currentSettings);

      revokeIfBlobUrl(restoredUrl);
      setRestoredUrl(res.dataUrl);
      setRestoredBlob(res.blob);
      setRestoredWidth(res.width);
      setRestoredHeight(res.height);
    } catch (err: any) {
      console.error('Restoration failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Debounced auto-update on settings change
  useEffect(() => {
    if (!sourceImageRef.current) return;
    const timer = setTimeout(() => {
      if (sourceImageRef.current) {
        runRestoration(sourceImageRef.current, settings);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [settings]);

  // Presets handler
  const handleApplyPreset = (presetType: RestorationSettings['preset']) => {
    let newSettings: RestorationSettings = { ...DEFAULT_RESTORATION_SETTINGS, preset: presetType };

    if (presetType === 'auto-enhance') {
      newSettings = {
        ...newSettings,
        sharpen: 35,
        contrast: 15,
        saturation: 15,
        brightness: 5,
        denoise: 15,
      };
    } else if (presetType === 'deblur') {
      newSettings = {
        ...newSettings,
        sharpen: 70,
        contrast: 10,
        denoise: 10,
        saturation: 5,
      };
    } else if (presetType === 'restore-old') {
      newSettings = {
        ...newSettings,
        sharpen: 40,
        contrast: 25,
        brightness: 5,
        saturation: 15,
        temperature: -5,
        denoise: 25,
      };
    } else if (presetType === 'denoise') {
      newSettings = {
        ...newSettings,
        denoise: 60,
        sharpen: 20,
        contrast: 5,
      };
    } else if (presetType === 'vivid') {
      newSettings = {
        ...newSettings,
        saturation: 35,
        contrast: 20,
        sharpen: 25,
        brightness: 5,
      };
    }

    setSettings(newSettings);
  };

  // Slider Drag Interactions
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingSlider && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      handleMove(e.clientX);
    }
  };

  useEffect(() => {
    const handleUp = () => setIsDraggingSlider(false);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  const handleReset = () => {
    revokeIfBlobUrl(originalUrl);
    revokeIfBlobUrl(restoredUrl);
    setFile(null);
    setOriginalUrl('');
    setRestoredUrl('');
    setRestoredBlob(null);
    sourceImageRef.current = null;
    setSettings(DEFAULT_RESTORATION_SETTINGS);
  };

  const handleDownload = () => {
    if (restoredBlob && file) {
      const suffix = settings.upscale > 1 ? `restorasi_${settings.upscale}x` : 'restorasi';
      const filename = getCompressedFilename(file.name, suffix, 'jpg');
      triggerDownload(restoredBlob, filename);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-1 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6">
      {/* Upload Dropzone when no file selected */}
      {!file && (
        <Dropzone
          accept="image/*"
          title="Pilih Foto untuk Direstorasi & Ditingkatkan"
          subtitle="Tingkatkan ketajaman (de-blur), hilangkan noise, pulihkan foto pudar, dan perbesar resolusi (upscale 2x/4x) 100% lokal."
          icon={Wand2}
          badge="Restorasi & Super Resolution"
          onFilesSelected={handleFileSelected}
        />
      )}

      {/* Workspace when file is loaded */}
      {file && (
        <div className="space-y-4 sm:space-y-6">
          {/* Header Bar */}
          <div className="glass-card rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#121218]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Wand2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-[220px] sm:max-w-md">
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>Asli: <strong className="text-slate-800 dark:text-slate-200">{originalWidth}×{originalHeight} px</strong> ({formatBytes(file.size)})</span>
                  {restoredWidth > 0 && settings.upscale > 1 && (
                    <>
                      <span>•</span>
                      <span className="text-sky-600 dark:text-sky-400 font-semibold">Hasil: {restoredWidth}×{restoredHeight} px ({settings.upscale}x)</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ganti Foto</span>
            </button>
          </div>

          {/* Interactive Split-View Comparison Screen */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-[#14141c] border-b border-slate-200 dark:border-white/10 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                <span>Pratinjau Interaktif: Geser Pembagi (Before / After)</span>
              </span>
              {isProcessing && (
                <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-[11px] font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Memproses...
                </span>
              )}
            </div>

            <div
              ref={containerRef}
              onMouseDown={() => setIsDraggingSlider(true)}
              onTouchStart={() => setIsDraggingSlider(true)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative w-full h-[320px] sm:h-[450px] bg-slate-950 select-none overflow-hidden cursor-ew-resize flex items-center justify-center p-2 sm:p-4"
            >
              {restoredUrl ? (
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  {/* Restored Image */}
                  <img
                    src={restoredUrl}
                    alt="Hasil Restorasi"
                    className="max-w-full max-h-[300px] sm:max-h-[420px] object-contain pointer-events-none rounded-lg"
                  />
                  <div className="absolute bottom-3 right-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg pointer-events-none">
                    ✨ Hasil Restorasi
                  </div>

                  {/* Original Image (Left/Clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  >
                    <img
                      src={originalUrl}
                      alt="Asli"
                      className="max-w-full max-h-[300px] sm:max-h-[420px] object-contain rounded-lg"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/80 border border-white/20 text-slate-200 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
                      Asli (Sebelum)
                    </div>
                  </div>

                  {/* Draggable Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-sky-500 text-white border-2 border-white shadow-xl flex items-center justify-center cursor-ew-resize pointer-events-auto">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
                  <span className="text-xs">Menyiapkan pemrosesan restorasi...</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Presets Row */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Preset Cepat:</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'auto-enhance', label: 'Auto Enhance', icon: Sparkles, desc: 'Kontras & Kejernihan' },
                { id: 'deblur', label: 'De-Blur & Pertajam', icon: ZoomIn, desc: 'Fokus & Tepi Objek' },
                { id: 'restore-old', label: 'Restorasi Jadul', icon: Wand2, desc: 'Foto Pudar / Sobek' },
                { id: 'denoise', label: 'Denoise Malam', icon: Eye, desc: 'Hilangkan Bintik' },
                { id: 'vivid', label: 'Warna Tajam', icon: Palette, desc: 'Color Correction' },
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = settings.preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPreset(p.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/40 text-sky-700 dark:text-sky-300 shadow-sm'
                        : 'bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                      <span className="font-semibold text-xs truncate">{p.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine Tuning Sliders & AI Upscaler */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                <span>Pengaturan Penyesuaian Kualitas & Resolusi</span>
              </h4>
              <button
                onClick={() => setSettings(DEFAULT_RESTORATION_SETTINGS)}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Reset Nilai
              </button>
            </div>

            {/* AI Image Upscaler / Super Resolution Row */}
            <div className="bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                  <span>AI Super Resolution / Image Upscaler</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Perbesar resolusi foto dan tambah kerapatan piksel agar tidak pecah saat dicetak.
                </p>
              </div>

              {/* Upscale Radio Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-[#0e0e14] p-1 rounded-xl border border-slate-300 dark:border-white/10 w-full sm:w-auto justify-center">
                {[
                  { value: 1, label: '1x (Asli)' },
                  { value: 2, label: '2x (Super HD)' },
                  { value: 4, label: '4x (Ultra Cetak)' },
                ].map((u) => (
                  <button
                    key={u.value}
                    onClick={() => setSettings({ ...settings, upscale: u.value as any })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      settings.upscale === u.value
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Sharpen / Deblur */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                    <span>De-blur / Ketajaman:</span>
                  </span>
                  <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{settings.sharpen}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sharpen}
                  onChange={(e) => setSettings({ ...settings, sharpen: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Denoise */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>Denoise (Bintik Noise):</span>
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{settings.denoise}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.denoise}
                  onChange={(e) => setSettings({ ...settings, denoise: Number(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Contrast className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Kontras Visual:</span>
                  </span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={settings.contrast}
                  onChange={(e) => setSettings({ ...settings, contrast: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
                    <span>Kecerahan / Exposure:</span>
                  </span>
                  <span className="font-mono text-yellow-600 dark:text-yellow-400 font-bold">
                    {settings.brightness > 0 ? `+${settings.brightness}` : settings.brightness}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={settings.brightness}
                  onChange={(e) => setSettings({ ...settings, brightness: Number(e.target.value) })}
                  className="w-full accent-yellow-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-fuchsia-500 dark:text-fuchsia-400" />
                    <span>Saturasi Warna:</span>
                  </span>
                  <span className="font-mono text-fuchsia-600 dark:text-fuchsia-400 font-bold">
                    {settings.saturation > 0 ? `+${settings.saturation}` : settings.saturation}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={settings.saturation}
                  onChange={(e) => setSettings({ ...settings, saturation: Number(e.target.value) })}
                  className="w-full accent-fuchsia-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                    <span>Suhu (Hangat / Dingin):</span>
                  </span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                    {settings.temperature > 0 ? `+${settings.temperature}` : settings.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: Number(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-emerald-500/30 bg-gradient-to-b from-emerald-50/50 to-white/90 dark:from-[#121815]/80 dark:to-[#101217]/80">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Restorasi Siap Diunduh</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Resolusi luaran: <strong className="text-slate-800 dark:text-slate-200">{restoredWidth}×{restoredHeight} px</strong>
                  {restoredBlob && ` • ${formatBytes(restoredBlob.size)}`}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Hasil Restorasi</span>
              </button>

              {onTransferToCompressor && restoredBlob && (
                <button
                  onClick={() => {
                    const restoredFile = new File([restoredBlob], getCompressedFilename(file.name, 'restorasi', 'jpg'), {
                      type: 'image/jpeg',
                    });
                    onTransferToCompressor(restoredFile);
                  }}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-semibold bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileImage className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                  <span>Kompres Hasil Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
