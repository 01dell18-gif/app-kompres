import { ImageCompressOptions, ImageProcessItem } from '../types';
import { calculateSavings } from '../utils/formatters';

/**
 * Load image file to HTMLImageElement or ImageBitmap to inspect dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight, url });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Gagal memuat citra ${file.name}`));
    };
    img.src = url;
  });
}

/**
 * Compress a single image in-memory using Canvas
 */
export async function compressSingleImage(
  file: File,
  options: ImageCompressOptions
): Promise<{
  blob: Blob;
  width: number;
  height: number;
}> {
  // Determine output MIME type
  let outputMime = options.format;
  if (outputMime === 'original') {
    if (file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/jpeg') {
      outputMime = file.type;
    } else {
      outputMime = 'image/jpeg';
    }
  }

  // Use createImageBitmap if available, with fallback to HTMLImageElement
  let sourceWidth = 0;
  let sourceHeight = 0;
  let imgBitmap: ImageBitmap | null = null;
  let imgElement: HTMLImageElement | null = null;

  if (typeof createImageBitmap === 'function') {
    try {
      imgBitmap = await createImageBitmap(file);
      sourceWidth = imgBitmap.width;
      sourceHeight = imgBitmap.height;
    } catch {
      // Fallback
    }
  }

  if (!imgBitmap) {
    const objUrl = URL.createObjectURL(file);
    imgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Gagal mengurai file citra'));
      img.src = objUrl;
    });
    sourceWidth = imgElement.naturalWidth;
    sourceHeight = imgElement.naturalHeight;
    URL.revokeObjectURL(objUrl);
  }

  // Calculate target dimensions
  let targetWidth = sourceWidth;
  let targetHeight = sourceHeight;

  if (options.maxDimension > 0) {
    const maxDim = options.maxDimension;
    if (sourceWidth > maxDim || sourceHeight > maxDim) {
      if (sourceWidth >= sourceHeight) {
        targetWidth = maxDim;
        targetHeight = Math.round((sourceHeight / sourceWidth) * maxDim);
      } else {
        targetHeight = maxDim;
        targetWidth = Math.round((sourceWidth / sourceHeight) * maxDim);
      }
    }
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia.');
  }

  // Quality settings for smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If converting transparent image (like PNG) to JPEG, fill white background
  if (outputMime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw source image
  if (imgBitmap) {
    ctx.drawImage(imgBitmap, 0, 0, targetWidth, targetHeight);
    imgBitmap.close();
  } else if (imgElement) {
    ctx.drawImage(imgElement, 0, 0, targetWidth, targetHeight);
  }

  // Quality parameter (PNG ignores quality in canvas.toBlob)
  let quality = options.quality;

  // Handle target size approximation if specified
  if (options.targetSizeKB && options.targetSizeKB > 0 && outputMime !== 'image/png') {
    const targetBytes = options.targetSizeKB * 1024;
    if (file.size > targetBytes) {
      const ratio = targetBytes / file.size;
      quality = Math.max(0.2, Math.min(0.9, ratio * 0.85));
    }
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Gagal mengompresi citra ke format tujuan.'));
      },
      outputMime,
      quality
    );
  });

  // Cleanup
  canvas.width = 0;
  canvas.height = 0;

  return {
    blob,
    width: targetWidth,
    height: targetHeight,
  };
}

/**
 * Concurrency worker pool processor for batch images
 * Formula according to PRD: Math.max(1, (navigator.hardwareConcurrency || 4) - 1)
 */
export async function processBatchImages(
  items: ImageProcessItem[],
  options: ImageCompressOptions,
  onItemUpdate: (updatedItem: Partial<ImageProcessItem> & { id: string }) => void
): Promise<void> {
  const maxConcurrency = Math.max(
    1,
    Math.min((navigator.hardwareConcurrency || 4) - 1, 6)
  );

  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      const item = items[index];

      // Mark processing
      onItemUpdate({
        id: item.id,
        status: 'processing',
        progress: 30,
      });

      try {
        const { blob, width, height } = await compressSingleImage(item.file, options);
        const compressedUrl = URL.createObjectURL(blob);
        const { percentage } = calculateSavings(item.originalSize, blob.size);

        onItemUpdate({
          id: item.id,
          status: 'done',
          progress: 100,
          compressedBlob: blob,
          compressedSize: blob.size,
          compressedWidth: width,
          compressedHeight: height,
          compressedUrl,
          reductionPercentage: percentage,
        });
      } catch (err: any) {
        onItemUpdate({
          id: item.id,
          status: 'error',
          progress: 100,
          error: err?.message || 'Gagal memproses gambar ini.',
        });
      }

      // Small yield
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  // Spawn pool
  const workers = Array.from(
    { length: Math.min(maxConcurrency, items.length) },
    () => worker()
  );

  await Promise.all(workers);
}

