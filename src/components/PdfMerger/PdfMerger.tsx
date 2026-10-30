import React, { useState, useEffect } from 'react';
import {
  FilePlus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Layers,
  Download,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileText,
  Zap,
} from 'lucide-react';
import { Dropzone } from '../common/Dropzone';
import { ProgressBar } from '../common/ProgressBar';
import { PdfMergeItem } from '../../types';
import { getPdfInfoAndThumbnail, mergePdfs } from '../../services/pdfService';
import { formatBytes, getTimestamp } from '../../utils/formatters';
import {
  validatePdfFile,
  MAX_MERGE_CUMULATIVE_BYTES,
  revokeIfBlobUrl,
} from '../../utils/fileValidation';
import { triggerDownload } from '../../services/zipService';

interface PdfMergerProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
  onTransferToCompressor: (file: File) => void;
}

export const PdfMerger: React.FC<PdfMergerProps> = ({
  initialFile,
  onClearInitialFile,
  onTransferToCompressor,
}) => {
  const [items, setItems] = useState<PdfMergeItem[]>([]);
  const [customFilename, setCustomFilename] = useState<string>('dokumen-tergabung.pdf');
  const [status, setStatus] = useState<'idle' | 'loading-files' | 'merging' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  // Handle incoming file transferred from another tab
  useEffect(() => {
    if (initialFile) {
      handleFilesAdded([initialFile]);
      onClearInitialFile?.();
    }
  }, [initialFile]);

  // Clean up URL on unmount
  useEffect(() => {
    return () => {
      revokeIfBlobUrl(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFilesAdded = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    // Check pre-flight validation
    const validFiles: File[] = [];
    let err = '';

    for (const f of newFiles) {
      const v = validatePdfFile(f);
      if (!v.valid) {
        err = v.error || 'Ada berkas PDF yang tidak valid';
      } else {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage(err || 'Tidak ada berkas PDF yang valid.');
      return;
    }

    setStatus('loading-files');
    setStatusMessage(`Membaca informasi ${validFiles.length} dokumen PDF...`);
    setErrorMessage('');

    try {
      const newItems: PdfMergeItem[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setStatusMessage(`Membaca sampul & halaman: ${file.name}...`);
        const info = await getPdfInfoAndThumbnail(file);

        newItems.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount: info.pageCount,
          thumbnailUrl: info.thumbnailUrl,
        });
      }

      setItems((prev) => {
        const combined = [...prev, ...newItems];
        // Check cumulative size
        const totalBytes = combined.reduce((sum, item) => sum + item.size, 0);
        if (totalBytes > MAX_MERGE_CUMULATIVE_BYTES) {
          setErrorMessage(
            `Peringatan: Total kapasitas (${formatBytes(totalBytes)}) melebihi anjuran 200 MB untuk performa optimal memori.`
          );
        }
        return combined;
      });

      setStatus('idle');
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Gagal memuat beberapa dokumen.');
      setStatus('idle');
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (status === 'done') {
      setStatus('idle');
      setMergedBlob(null);
    }
  };

  const handleClearAll = () => {
    revokeIfBlobUrl(downloadUrl);
    setItems([]);
    setMergedBlob(null);
    setDownloadUrl('');
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
  };

  const handleStartMerge = async () => {
    if (items.length < 2) {
      setErrorMessage('Pilih minimal 2 dokumen PDF untuk digabungkan.');
      return;
    }

    setStatus('merging');
    setProgress(0);
    setErrorMessage('');

    try {
      const filesToMerge = items.map((item) => item.file);
      const blob = await mergePdfs(filesToMerge, (curr, total, msg) => {
        setProgress(Math.round((curr / total) * 100));
        setStatusMessage(msg);
      });

      const url = URL.createObjectURL(blob);
      setMergedBlob(blob);
      setDownloadUrl(url);
      setStatus('done');
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e?.message || 'Terjadi kesalahan saat menggabungkan berkas.');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (mergedBlob) {
      const filename = customFilename.trim().endsWith('.pdf')
        ? customFilename.trim()
        : `${customFilename.trim() || 'dokumen-gabungan'}.pdf`;
      triggerDownload(mergedBlob, filename);
    }
  };

  const totalPages = items.reduce((sum, item) => sum + item.pageCount, 0);
  const totalSizeBytes = items.reduce((sum, item) => sum + item.size, 0);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 space-y-6">
      {/* Upload Dropzone */}
      <Dropzone
        accept="application/pdf,.pdf"
        multiple={true}
        title="Pilih Beberapa Berkas PDF untuk Digabung"
        subtitle="Susun berkas lampiran (KTP, Ijazah, Transkrip, Sertifikat) menjadi satu dokumen utuh."
        icon={FilePlus}
        badge="Multi-Berkas PDF"
        onFilesSelected={handleFilesAdded}
        disabled={status === 'merging'}
      />

      {/* Loading state for file previews */}
      {status === 'loading-files' && (
        <div className="glass-card rounded-2xl p-6 text-center">
          <ProgressBar progress={50} statusMessage={statusMessage} />
        </div>
      )}

      {/* Error alert */}
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

      {/* Document List & Reorder Section */}
      {items.length > 0 && (
        <div className="space-y-4">
          {/* Header Summary Bar */}
          <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121218]">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Daftar Dokumen ({items.length} Berkas)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total <strong className="text-slate-200">{totalPages} Halaman</strong> • Kapasitas <strong className="text-slate-200">{formatBytes(totalSizeBytes)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleClearAll}
                disabled={status === 'merging'}
                className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                Hapus Semua
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-2.5">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 border border-white/5 hover:border-white/10 transition-colors group"
              >
                {/* Left: Index badge & thumbnail & details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-slate-300 flex-shrink-0">
                    {index + 1}
                  </div>

                  {item.thumbnailUrl ? (
                    <div className="w-10 h-14 rounded overflow-hidden border border-white/10 flex-shrink-0 bg-black/40">
                      <img
                        src={item.thumbnailUrl}
                        alt="Page preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-semibold text-white text-xs sm:text-sm truncate max-w-xs sm:max-w-md">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{item.pageCount} Halaman</span>
                      <span>•</span>
                      <span>{formatBytes(item.size)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Reorder and Remove buttons */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || status === 'merging'}
                    title="Pindahkan Ke Atas"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1 || status === 'merging'}
                    title="Pindahkan Ke Bawah"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleRemove(index)}
                    disabled={status === 'merging'}
                    title="Hapus Berkas"
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Configurations */}
          {status !== 'merging' && status !== 'done' && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Nama Berkas Luaran:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder="dokumen-tergabung.pdf"
                    className="flex-1 bg-[#181822] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleStartMerge}
                  disabled={items.length < 2}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Gabungkan {items.length} PDF Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {/* Progress while merging */}
          {status === 'merging' && (
            <div className="glass-card rounded-2xl p-6 sm:p-8 text-center space-y-4">
              <ProgressBar progress={progress} statusMessage={statusMessage} />
              <p className="text-xs text-slate-400">
                Menyalin dan menyusun seluruh indeks halaman tanpa upload peladen...
              </p>
            </div>
          )}

          {/* Result State */}
          {status === 'done' && mergedBlob && (
            <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border-emerald-500/30 bg-gradient-to-b from-[#121815]/90 to-[#101217]/90 shadow-2xl">
              <div className="flex items-center gap-3 text-emerald-400">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    Penggabungan PDF Berhasil!
                  </h3>
                  <p className="text-xs text-slate-400">
                    {items.length} berkas berhasil disatukan menjadi 1 file tunggal ({totalPages} halaman).
                  </p>
                </div>
              </div>

              {/* Metric Box */}
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-medium text-sky-400 block mb-1">Ukuran Berkas Akhir</span>
                  <span className="text-lg font-bold text-sky-300 font-mono">
                    {formatBytes(mergedBlob.size)}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Total {totalPages} Halaman tersusun urut
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen PDF Gabungan</span>
                </button>

                <button
                  onClick={() => setStatus('idle')}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                >
                  Ubah Urutan
                </button>

                <button
                  onClick={handleClearAll}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  Gabung Dokumen Baru
                </button>
              </div>

              {/* Chained Action: Direct Transfer to PDF Compressor! */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02] -mx-6 -mb-6 p-4 rounded-b-2xl">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Ukuran hasil gabungan melebihi batas upload portal?</span>
                </div>
                <button
                  onClick={() => {
                    const finalName = customFilename.trim().endsWith('.pdf')
                      ? customFilename.trim()
                      : `${customFilename.trim() || 'dokumen-gabungan'}.pdf`;
                    const fileForCompressor = new File([mergedBlob], finalName, {
                      type: 'application/pdf',
                    });
                    onTransferToCompressor(fileForCompressor);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lanjut Kompres Hasil Gabungan Ini</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

