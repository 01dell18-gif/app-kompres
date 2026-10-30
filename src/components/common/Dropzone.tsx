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
      // Reset input value so same file can be re-selected if needed
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
      className={`relative cursor-pointer transition-all duration-300 rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed flex flex-col items-center justify-center ${
        isDragOver
          ? 'border-sky-400 bg-sky-500/10 scale-[1.01] shadow-2xl shadow-sky-500/20'
          : 'border-white/15 bg-[#121218]/60 hover:bg-[#16161f]/80 hover:border-sky-500/40'
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
        <span className="absolute top-4 right-4 text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
          {badge}
        </span>
      )}

      {/* Hero Icon */}
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 ${
          isDragOver
            ? 'scale-110 bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-xl shadow-sky-500/30'
            : 'bg-white/[0.04] text-sky-400 border border-white/10 group-hover:scale-105'
        }`}
      >
        <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>

      {/* Typography */}
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
        {subtitle}
      </p>

      {/* CTA Button styled */}
      <button
        type="button"
        className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-lg shadow-sky-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Pilih Berkas Dari Perangkat
      </button>

      <p className="mt-4 text-[11px] text-slate-500">
        Atau seret dan lepaskan berkas langsung ke area ini
      </p>
    </div>
  );
};

