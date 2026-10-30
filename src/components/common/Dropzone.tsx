import React, { useRef, useState } from 'react';
import { UploadCloud, LucideIcon } from 'lucide-react';

interface DropzoneProps {
  accept: string;
  multiple?: boolean;
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  badge?: string;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  accept,
  multiple = false,
  title,
  subtitle,
  icon: Icon = UploadCloud,
  badge,
  onFilesSelected,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = '';
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative cursor-pointer transition-all duration-300 rounded-3xl p-6 sm:p-10 text-center border-2 border-dashed flex flex-col items-center justify-center ${
        isDragOver
          ? 'border-sky-500 bg-sky-500/10 scale-[1.01] shadow-2xl shadow-sky-500/20'
          : 'border-slate-300/80 dark:border-white/15 bg-white/70 dark:bg-[#121218]/60 hover:bg-white dark:hover:bg-[#16161f]/80 hover:border-sky-500/50 shadow-sm dark:shadow-none'
      } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {badge && (
        <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[10px] sm:text-[11px] font-medium tracking-wide px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
          {badge}
        </span>
      )}

      {/* Hero Icon */}
      <div
        className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-300 ${
          isDragOver
            ? 'scale-110 bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-xl shadow-sky-500/30'
            : 'bg-sky-50 dark:bg-white/[0.04] text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-white/10 group-hover:scale-105'
        }`}
      >
        <Icon className="w-7 h-7 sm:w-10 sm:h-10" />
      </div>

      {/* Typography */}
      <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2 tracking-tight px-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-5 sm:mb-6 leading-relaxed px-2">
        {subtitle}
      </p>

      {/* CTA Button */}
      <button
        type="button"
        className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-lg shadow-sky-500/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
      >
        Pilih Berkas Dari Perangkat
      </button>

      <p className="mt-3 sm:mt-4 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-500 hidden sm:block">
        Atau seret dan lepaskan berkas langsung ke area ini
      </p>
    </div>
  );
};
