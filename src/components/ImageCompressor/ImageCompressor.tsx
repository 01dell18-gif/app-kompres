import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Download,
  Trash2,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Archive,
  AlertCircle,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { Dropzone } from '../common/Dropzone';
import { ImageSettings } from './ImageSettings';
import { SplitViewer } from '../common/SplitViewer';
import { ProgressBar } from '../common/ProgressBar';
import { ImageProcessItem, ImageCompressOptions } from '../../types';
import {
  getImageDimensions,
  processBatchImages,
} from '../../services/imageService';
import { createImagesZip, triggerDownload } from '../../services/zipService';
import { formatBytes, calculateSavings, getCompressedFilename } from '../../utils/formatters';
import { validateImageFile, revokeIfBlobUrl } from '../../utils/fileValidation';

export const ImageCompressor: React.FC = () => {
  const [items, setItems] = useState<ImageProcessItem[]>([]);
  const [options, setOptions] = useState<ImageCompressOptions>({
    quality: 0.75,
    format: 'original',
    maxDimension: 0,
    targetSizeKB: null,
  });

  const [status, setStatus] = useState<'idle' | 'loading-previews' | 'processing' | 'done'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);

  // Split-view comparison modal state
  const [inspectItem, setInspectItem] = useState<ImageProcessItem | null>(null);

  // Clean up blob URLs when items change/unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        revokeIfBlobUrl(item.originalUrl);
        revokeIfBlobUrl(item.compressedUrl);
      });
    };
  }, []);

  const handleFilesAdded = async (files: File[]) => {
    if (files.length === 0) return;

    const validFiles: File[] = [];
    let err = '';

    for (const f of files) {
      const v = validateImageFile(f);
      if (v.valid) {
        validFiles.push(f);
      } else {
        err = v.error || 'Format citra tidak valid';
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage(err || 'Tidak ada citra valid yang dipilih.');
      return;
    }

    setStatus('loading-previews');
    setErrorMessage('');

    try {
      const newItems: ImageProcessItem[] = [];

      for (const f of validFiles) {
        const { width, height, url } = await getImageDimensions(f);
        newItems.push({
          id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file: f,
          name: f.name,
          originalSize: f.size,
          originalWidth: width,
          originalHeight: height,
          originalUrl: url,
          status: 'pending',
          progress: 0,
        });
      }

      setItems((prev) => [...prev, ...newItems]);
      setStatus('idle');
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e?.message || 'Gagal membaca beberapa citra.');
      setStatus('idle');
    }
  };

  const handleStartBatchCompression = async () => {
    if (items.length === 0) return;

    setStatus('processing');
    setErrorMessage('');

    await processBatchImages(items, options, (updated) => {
      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
      );
    });

    setStatus('done');
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        revokeIfBlobUrl(target.originalUrl);
        revokeIfBlobUrl(target.compressedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      revokeIfBlobUrl(item.originalUrl);
      revokeIfBlobUrl(item.compressedUrl);
    });
    setItems([]);
    setStatus('idle');
    setErrorMessage('');
  };

  const handleDownloadSingle = (item: ImageProcessItem) => {
    if (item.compressedBlob) {
      let ext = 'jpg';
      if (item.compressedBlob.type === 'image/webp') ext = 'webp';
      else if (item.compressedBlob.type === 'image/png') ext = 'png';

      const filename = getCompressedFilename(item.name, 'terkompresi', ext);
      triggerDownload(item.compressedBlob, filename);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    setZipProgress(0);
    try {
      const { blob, filename } = await createImagesZip(items, (p) => setZipProgress(p));
      triggerDownload(blob, filename);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Gagal membuat berkas ZIP.');
    } finally {
      setIsZipping(false);
    }
  };

  // Aggregated Stats
  const completedItems = items.filter((i) => i.status === 'done' && i.compressedBlob);
  const totalOriginalBytes = completedItems.reduce((sum, i) => sum + i.originalSize, 0);
  const totalCompressedBytes = completedItems.reduce((sum, i) => sum + (i.compressedSize || 0), 0);
  const aggregateSavings = calculateSavings(totalOriginalBytes, totalCompressedBytes);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Upload Dropzone */}
      <Dropzone
        accept="image/*"
        multiple={true}
        title="Pilih Beberapa Foto untuk Dikompresi Massal"
        subtitle="Mendukung JPG, PNG, WebP, AVIF, BMP. Pemrosesan paralel multi-utas cepat & aman."
        icon={ImageIcon}
        badge="Multi-Foto / Batch"
        onFilesSelected={handleFilesAdded}
        disabled={status === 'processing'}
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Workspace when items are selected */}
      {items.length > 0 && (
        <div className="space-y-6 pb-24">
          {/* Settings Section */}
          <ImageSettings
            options={options}
            onChange={setOptions}
            disabled={status === 'processing'}
          />

          {/* Action Header */}
          <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121218]">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span>Antrean Citra ({items.length} Foto)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {status === 'done'
                  ? `${completedItems.length} dari ${items.length} foto berhasil dioptimalkan`
                  : 'Siap dikompresi menggunakan prosesor perangkat lokal'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {status !== 'processing' && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                >
                  Hapus Semua
                </button>
              )}

              {status !== 'processing' && status !== 'done' && (
                <button
                  onClick={handleStartBatchCompression}
                  className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Kompres {items.length} Foto Sekarang</span>
                </button>
              )}

              {status === 'done' && (
                <button
                  onClick={handleStartBatchCompression}
                  className="px-4 py-2 rounded-xl font-medium text-xs bg-white/10 hover:bg-white/15 text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kompres Ulang</span>
                </button>
              )}
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between group"
              >
                {/* Image Preview & status overlay */}
                <div className="relative aspect-video bg-black/40 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.compressedUrl || item.originalUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    {item.status === 'done' && item.reductionPercentage !== undefined && (
                      <span className="bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md">
                        -{item.reductionPercentage}%
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <span className="bg-sky-500 text-white font-medium text-[10px] px-2 py-0.5 rounded-full shadow-md animate-pulse">
                        Memproses...
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  {status !== 'processing' && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-slate-300 hover:text-rose-400 hover:bg-black/80 transition-colors"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-semibold text-white text-xs truncate" title={item.name}>
                      {item.name}
                    </h5>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>Asli: <strong className="text-slate-300">{formatBytes(item.originalSize)}</strong></span>
                      {item.compressedSize ? (
                        <span className="text-emerald-400 font-semibold font-mono">
                          {formatBytes(item.compressedSize)}
                        </span>
                      ) : (
                        <span>{item.originalWidth}×{item.originalHeight}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions per card */}
                  {item.status === 'done' && item.compressedUrl && (
                    <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadSingle(item)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh</span>
                      </button>

                      <button
                        onClick={() => setInspectItem(item)}
                        title="Bandingkan Before/After"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Batch Action Bar (Sticky at bottom when items are done) */}
      {status === 'done' && completedItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-30">
          <div className="bg-[#101016]/95 backdrop-blur-xl border border-sky-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  {completedItems.length} Foto Siap Diunduh
                </h4>
                <p className="text-xs text-slate-300">
                  Total hemat <strong className="text-emerald-400 font-mono">{formatBytes(aggregateSavings.savedBytes)}</strong> ({aggregateSavings.percentage}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Archive className="w-4 h-4" />
                <span>{isZipping ? `Mengemas ZIP (${zipProgress}%)...` : 'Unduh Semua Foto (.ZIP)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Viewer Modal */}
      {inspectItem && inspectItem.compressedUrl && (
        <SplitViewer
          isOpen={!!inspectItem}
          onClose={() => setInspectItem(null)}
          originalUrl={inspectItem.originalUrl}
          compressedUrl={inspectItem.compressedUrl}
          originalLabel={`Asli (${formatBytes(inspectItem.originalSize)})`}
          compressedLabel={`Kompresi (${formatBytes(inspectItem.compressedSize || 0)})`}
          title={`Bandingkan Kualitas: ${inspectItem.name}`}
        />
      )}
    </div>
  );
};

