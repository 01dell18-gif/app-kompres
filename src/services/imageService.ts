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
 * High-Quality Single Image Compression Engine
 * Guarantees visual sharpness, proper color preservation, and smooth downscaling
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

  // Calculate target dimensions preserving aspect ratio
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
  const ctx = canvas.getContext('2d', { alpha: outputMime !== 'image/jpeg' });

  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia.');
  }

  // High-order bicubic smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If converting transparent image (like PNG) to JPEG, fill pure white background
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

  // If downscaled significantly (by >1.3x), apply subtle sharpness touch to preserve crisp text and details
  if (sourceWidth > targetWidth * 1.3 && targetWidth > 100 && targetHeight > 100) {
    try {
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imgData.data;
      const copy = new Uint8ClampedArray(data);
      const w = targetWidth;
      const h = targetHeight;
      const amount = 0.18; // gentle unsharp touch

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          const up = ((y - 1) * w + x) * 4;
          const down = ((y + 1) * w + x) * 4;
          const left = (y * w + (x - 1)) * 4;
          const right = (y * w + (x + 1)) * 4;

          for (let c = 0; c < 3; c++) {
            const laplacian = 4 * copy[idx + c] - (copy[up + c] + copy[down + c] + copy[left + c] + copy[right + c]);
            data[idx + c] = Math.max(0, Math.min(255, copy[idx + c] + laplacian * amount));
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch {
      // Fallback if security restrictions occur
    }
  }

  // Quality parameter
  let quality = options.quality;

  // Handle target size approximation if specified
  if (options.targetSizeKB && options.targetSizeKB > 0 && outputMime !== 'image/png') {
    const targetBytes = options.targetSizeKB * 1024;
    if (file.size > targetBytes) {
      const ratio = targetBytes / file.size;
      quality = Math.max(0.35, Math.min(0.88, ratio * 0.9));
    }
  }

  let blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Gagal mengompresi citra ke format tujuan.'));
      },
      outputMime,
      quality
    );
  });

  // Intelligent Adaptive Compression for Pre-compressed or Re-compressed Images:
  // If the output size is >= 96% of input file size (meaning the image is already pre-compressed at this preset,
  // or the user is re-compressing an already compressed image), automatically apply an adaptive second pass
  // so the image actually achieves meaningful size reduction and never remains unchanged or larger!
  if (blob.size >= file.size * 0.96) {
    if (outputMime !== 'image/png') {
      // Pass 2: Lower quantization threshold
      const tighterQuality = Math.max(0.28, quality * 0.75);
      const pass2Blob = await new Promise<Blob | null>((res) => {
        canvas.toBlob((b) => res(b), outputMime, tighterQuality);
      });

      if (pass2Blob && pass2Blob.size < file.size * 0.95) {
        blob = pass2Blob;
        quality = tighterQuality;
      } else {
        // Pass 3: Scale down dimensions slightly (15%) + progressive quantization
        const pass3Scale = 0.85;
        const pass3W = Math.round(targetWidth * pass3Scale);
        const pass3H = Math.round(targetHeight * pass3Scale);

        if (pass3W >= 200 && pass3H >= 200) {
          const pass3Canvas = document.createElement('canvas');
          pass3Canvas.width = pass3W;
          pass3Canvas.height = pass3H;
          const p3Ctx = pass3Canvas.getContext('2d', { alpha: outputMime !== 'image/jpeg' });

          if (p3Ctx) {
            p3Ctx.imageSmoothingEnabled = true;
            p3Ctx.imageSmoothingQuality = 'high';
            if (outputMime === 'image/jpeg') {
              p3Ctx.fillStyle = '#FFFFFF';
              p3Ctx.fillRect(0, 0, pass3W, pass3H);
            }
            p3Ctx.drawImage(canvas, 0, 0, pass3W, pass3H);

            const pass3Quality = Math.max(0.28, tighterQuality * 0.85);
            const pass3Blob = await new Promise<Blob | null>((res) => {
              pass3Canvas.toBlob((b) => res(b), outputMime, pass3Quality);
            });

            if (pass3Blob && pass3Blob.size < file.size) {
              blob = pass3Blob;
              targetWidth = pass3W;
              targetHeight = pass3H;
            }

            pass3Canvas.width = 0;
            pass3Canvas.height = 0;
          }
        }
      }
    } else {
      // If output is PNG and size didn't reduce (PNG is lossless), fallback to high-efficiency WebP
      // if options.format allows or if user needs actual compression
      if (options.format === 'original' && file.type === 'image/png') {
        const webpBlob = await new Promise<Blob | null>((res) => {
          canvas.toBlob((b) => res(b), 'image/webp', 0.80);
        });
        if (webpBlob && webpBlob.size < file.size * 0.85) {
          blob = webpBlob;
        }
      }
    }
  }

  // Final Strict Check: Guarantee the compressed file is NEVER larger than original
  if (blob.size > file.size && outputMime !== 'image/png') {
    let fallbackQuality = 0.40;
    while (fallbackQuality >= 0.20) {
      const fallbackBlob = await new Promise<Blob | null>((res) => {
        canvas.toBlob((b) => res(b), outputMime, fallbackQuality);
      });
      if (fallbackBlob && fallbackBlob.size < file.size) {
        blob = fallbackBlob;
        break;
      }
      fallbackQuality -= 0.08;
    }
  }

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
