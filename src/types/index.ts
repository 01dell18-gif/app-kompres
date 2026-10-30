export type ActiveTab = 'compress-pdf' | 'merge-pdf' | 'compress-image';

export type PdfPreset = 'extreme' | 'balanced' | 'light' | 'custom';

export interface PdfCompressOptions {
  preset: PdfPreset;
  scale: number;
  quality: number;
  grayscale: boolean;
  targetSizeKB?: number | null;
}

export interface PdfProcessItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number;
  statusMessage: string;
  currentPage: number;
  totalPages: number;
  compressedBlob?: Blob;
  compressedSize?: number;
  reductionPercentage?: number;
  downloadUrl?: string;
  previewUrl?: string;
  originalPreviewUrl?: string;
  error?: string;
}

export interface PdfMergeItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  thumbnailUrl?: string;
}

export type ImageFormat = 'original' | 'image/jpeg' | 'image/webp' | 'image/png';

export interface ImageCompressOptions {
  quality: number; // 0.1 to 1.0
  format: ImageFormat;
  maxDimension: number; // 0 = original, or 1920, 1280, 800, etc.
  targetSizeKB?: number | null;
}

export interface ImageProcessItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  compressedBlob?: Blob;
  compressedSize?: number;
  compressedWidth?: number;
  compressedHeight?: number;
  compressedUrl?: string;
  reductionPercentage?: number;
  error?: string;
}

