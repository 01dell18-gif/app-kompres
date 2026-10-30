import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Dropzone } from '../common/Dropzone';
import { CompressionSettings } from './CompressionSettings';
import { ProgressBar } from '../common/ProgressBar';
import { SplitViewer } from '../common/SplitViewer';
import { PdfCompressOptions } from '../../types';
import { compressPdf, getPdfInfoAndThumbnail } from '../../services/pdfService';
import { formatBytes, calculateSavings, getCompressedFilename } from '../../utils/formatters';
import { validatePdfFile, revokeIfBlobUrl } from '../../utils/fileValidation';
import { triggerDownload } from '../../services/zipService';

interface PdfCompressorProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
  onTransferToMerger?: (file: File) => void;
}

export const PdfCompressor: React.FC<PdfCompressorProps> = ({
  initialFile,
  onClearInitialFile,
  onTransferToMerger,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  const [options, setOptions] = useState<PdfCompressOptions>({
    preset: 'balanced',
    scale: 1.3,
    quality: 0.63,
    grayscale: false,
    targetSizeKB: null,
  });

  const [status, setStatus] = useState<'idle' | 'loading-info' | 'processing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string>('');
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<string>('');
  const [showSplitViewer, setShowSplitViewer] = useState<boolean>(false);

  // Handle incoming file from Chained action (e.g. from PDF Merger)
  useEffect(() => {
    if (initialFile) {
      handleFileSelected([initialFile]);
      onClearInitialFile?.();
    }
  }, [initialFile]);

  // Clean up object URLs on unmount or reset
  useEffect(() => {
    return () => {
      revokeIfBlobUrl(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];

    const validation = validatePdfFile(selected);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Berkas tidak valid');
      setStatus('error');
      return;
    }

    setFile(selected);
    setErrorMessage('');
    setResultBlob(null);
    revokeIfBlobUrl(downloadUrl);
    setDownloadUrl('');
    setStatus('loading-info');
    setStatusMessage('Membaca informasi dokumen...');

    try {
      const info = await getPdfInfoAndThumbnail(selected);
      setPageCount(info.pageCount);
      setThumbnailUrl(info.thumbnailUrl);
      setOriginalPreviewUrl(info.thumbnailUrl);
      setStatus('idle');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat dokumen PDF');
      setStatus('error');
    }
  };

  const handleStartCompression = async () => {
    if (!file) return;

    setStatus('processing');
    setProgress(0);
    setErrorMessage('');

    try {
      const result = await compressPdf(file, options, (page, total, msg) => {
        const percent = total > 0 ? Math.round((page / total) * 100) : 10;
        setProgress(percent);
        setStatusMessage(msg);
      });

      const url = URL.createObjectURL(result.blob);
      setResultBlob(result.blob);
      setDownloadUrl(url);
      if (result.compressedPreviewUrl) {
        setCompressedPreviewUrl(result.compressedPreviewUrl);
      }
      setStatus('done');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Terjadi kesalahan saat memproses kompresi.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    revokeIfBlobUrl(downloadUrl);
    setFile(null);
    setResultBlob(null);
    setDownloadUrl('');
    setPageCount(0);
    setThumbnailUrl('');
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
  };

  const handleDownload = () => {
    if (resultBlob && file) {
      const filename = getCompressedFilename(file.name, 'terkompresi', 'pdf');
      triggerDownload(resultBlob, filename);
    }
  };

  const savings = file && resultBlob ? calculateSavings(file.size, resultBlob.size) : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 py-2 sm:py-4">
      {/* Hero Dropzone when no file selected */}
      {!file && (
        <div>
          <Dropzone
            accept="application/pdf,.pdf"
            title="Pilih Berkas PDF untuk Dikompresi"
            subtitle="Perkecil ukuran dokumen PDF tanpa upload data ke server. 100% aman di peramban."
            badge="Maksimal 100 MB"
            onFilesSelected={handleFileSelected}
          />

          {errorMessage && status === 'error' && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Selected File Workspace */}
      {file && (
        <div className="space-y-4 sm:space-y-6">
          {/* File Card Header */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
              {thumbnailUrl ? (
                <div className="w-12 h-16 sm:w-14 sm:h-18 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black/40">
                  <img
                    src={thumbnailUrl}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-white text-xs sm:text-base truncate max-w-[220px] sm:max-w-md">
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-400 mt-1">
                  <span>Ukuran: <strong className="text-slate-200">{formatBytes(file.size)}</strong></span>
                  <span>•</span>
                  <span><strong className="text-slate-200">{pageCount > 0 ? `${pageCount} Halaman` : 'Menghitung...'}</strong></span>
                </div>
              </div>
            </div>

            {status !== 'processing' && (
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ganti Berkas</span>
              </button>
            )}
          </div>

          {/* Settings Section */}
          {status === 'idle' && (
            <>
              <CompressionSettings
                options={options}
                onChange={setOptions}
                disabled={false}
              />

              <div className="flex justify-end">
                <button
                  onClick={handleStartCompression}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-xl shadow-sky-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mulai Kompresi PDF Sekarang</span>
                </button>
              </div>
            </>
          )}

          {/* Processing State */}
          {status === 'processing' && (
            <div className="glass-card rounded-2xl p-5 sm:p-8 text-center space-y-4">
              <ProgressBar progress={progress} statusMessage={statusMessage} />
              <p className="text-[11px] sm:text-xs text-slate-400">
                Sedang merender & mengompresi setiap halaman secara lokal di memori...
              </p>
            </div>
          )}

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="font-semibold text-rose-200">Gagal Memproses Kompresi</p>
                <p className="text-xs leading-relaxed">{errorMessage}</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-2 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs rounded-lg transition-colors"
                >
                  Coba Pengaturan Lain
                </button>
              </div>
            </div>
          )}

          {/* Success / Result State */}
          {status === 'done' && resultBlob && savings && (
            <div className="glass-card rounded-2xl p-5 sm:p-8 space-y-5 sm:space-y-6 border-emerald-500/30 bg-gradient-to-b from-[#121815]/90 to-[#101217]/90 shadow-2xl">
              <div className="flex items-center gap-3 text-emerald-400">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">Kompresi PDF Berhasil!</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">Dokumen telah dioptimalkan secara lokal di peramban.</p>
                </div>
              </div>

              {/* Metric Comparison Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 sm:p-4">
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block mb-1">Ukuran Awal</span>
                  <span className="text-sm sm:text-lg font-bold text-slate-200 font-mono">
                    {formatBytes(file.size)}
                  </span>
                </div>

                <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 sm:p-4">
                  <span className="text-[10px] sm:text-[11px] font-medium text-sky-400 block mb-1">Ukuran Baru</span>
                  <span className="text-sm sm:text-lg font-bold text-sky-300 font-mono">
                    {formatBytes(resultBlob.size)}
                  </span>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 sm:p-4">
                  <span className="text-[10px] sm:text-[11px] font-medium text-emerald-400 block mb-1">Total Penghematan</span>
                  <span className="text-sm sm:text-lg font-bold text-emerald-300 font-mono">
                    Hemat {savings.percentage}% ({formatBytes(savings.savedBytes)})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF Hasil Kompresi</span>
                </button>

                {originalPreviewUrl && compressedPreviewUrl && (
                  <button
                    onClick={() => setShowSplitViewer(true)}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                    <span>Bandingkan Kualitas</span>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  Kompres Lain
                </button>
              </div>

              {/* Chained Action: Merge with other files */}
              {onTransferToMerger && (
                <div className="pt-3 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white/[0.02] -mx-5 sm:-mx-8 -mb-5 sm:-mb-8 p-3 sm:p-4 rounded-b-2xl">
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-300">
                    <Layers className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Satukan hasil kompresi ini dengan lampiran lain?</span>
                  </div>
                  <button
                    onClick={() => {
                      if (resultBlob && file) {
                        const mergedReadyFile = new File([resultBlob], getCompressedFilename(file.name, 'min', 'pdf'), {
                          type: 'application/pdf',
                        });
                        onTransferToMerger(mergedReadyFile);
                      }
                    }}
                    className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors self-end sm:self-auto"
                  >
                    <span>Lanjut ke Gabung PDF</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Split Viewer Modal */}
      {showSplitViewer && originalPreviewUrl && compressedPreviewUrl && (
        <SplitViewer
          isOpen={showSplitViewer}
          onClose={() => setShowSplitViewer(false)}
          originalUrl={originalPreviewUrl}
          compressedUrl={compressedPreviewUrl}
          originalLabel="Halaman 1 Asli"
          compressedLabel="Halaman 1 Terkompresi"
          title={`Bandingkan Kualitas: ${file?.name}`}
        />
      )}
    </div>
  );
};
