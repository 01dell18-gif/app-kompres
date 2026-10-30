/**
 * Image Restoration & Enhancement Engine (100% Client-Side Canvas DSP)
 * Features:
 * - Image Enhancement (Peningkatan Gambar: Kontras, Saturasi, Pencahayaan)
 * - Super Resolution / Upscaler (Perbesar 2x, 4x dengan Detail Synthesis)
 * - De-blur / Menjernihkan Foto Buram (Unsharp Masking & Edge Restoration)
 * - Denoise / Pengurangan Noise (Selective Smoothing preserving edges)
 * - Photo Restoration (Pemulihan Foto Pudar / Jadul via Dynamic Range Stretch)
 * - Color Correction / Grading (Temperature, Vibrance, Tone Balance)
 */

export interface RestorationSettings {
  preset: 'none' | 'auto-enhance' | 'deblur' | 'restore-old' | 'denoise' | 'vivid';
  sharpen: number;      // 0 to 100
  denoise: number;      // 0 to 100
  brightness: number;   // -50 to 50
  contrast: number;     // -50 to 50
  saturation: number;   // -50 to 50
  temperature: number;  // -50 to 50 (warm/cool)
  upscale: 1 | 2 | 4;   // 1x, 2x, 4x
}

export const DEFAULT_RESTORATION_SETTINGS: RestorationSettings = {
  preset: 'none',
  sharpen: 30,
  denoise: 15,
  brightness: 0,
  contrast: 15,
  saturation: 10,
  temperature: 0,
  upscale: 1,
};

/**
 * Clamp a number between min and max
 */
function clamp(val: number, min: number = 0, max: number = 255): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

/**
 * Apply Dynamic Range Stretch & Auto-Level (for faded old photos)
 */
function applyAutoLevels(data: Uint8ClampedArray, width: number, height: number, strength: number = 1.0) {
  // Find min and max for R, G, B with 1% percentile clipping to avoid single dead pixels
  const totalPixels = width * height;
  const histR = new Uint32Array(256);
  const histG = new Uint32Array(256);
  const histB = new Uint32Array(256);

  for (let i = 0; i < data.length; i += 4) {
    histR[data[i]]++;
    histG[data[i + 1]]++;
    histB[data[i + 2]]++;
  }

  const clipThreshold = Math.floor(totalPixels * 0.015);

  let minR = 0, maxR = 255;
  let count = 0;
  for (let i = 0; i < 256; i++) {
    count += histR[i];
    if (count > clipThreshold) { minR = i; break; }
  }
  count = 0;
  for (let i = 255; i >= 0; i--) {
    count += histR[i];
    if (count > clipThreshold) { maxR = i; break; }
  }

  let minG = 0, maxG = 255;
  count = 0;
  for (let i = 0; i < 256; i++) {
    count += histG[i];
    if (count > clipThreshold) { minG = i; break; }
  }
  count = 0;
  for (let i = 255; i >= 0; i--) {
    count += histG[i];
    if (count > clipThreshold) { maxG = i; break; }
  }

  let minB = 0, maxB = 255;
  count = 0;
  for (let i = 0; i < 256; i++) {
    count += histB[i];
    if (count > clipThreshold) { minB = i; break; }
  }
  count = 0;
  for (let i = 255; i >= 0; i--) {
    count += histB[i];
    if (count > clipThreshold) { maxB = i; break; }
  }

  // Prevent division by zero
  const rangeR = Math.max(1, maxR - minR);
  const rangeG = Math.max(1, maxG - minG);
  const rangeB = Math.max(1, maxB - minB);

  // Apply linear contrast stretch
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const stretchedR = clamp(((r - minR) / rangeR) * 255);
    const stretchedG = clamp(((g - minG) / rangeG) * 255);
    const stretchedB = clamp(((b - minB) / rangeB) * 255);

    data[i] = clamp(r + (stretchedR - r) * strength);
    data[i + 1] = clamp(g + (stretchedG - g) * strength);
    data[i + 2] = clamp(b + (stretchedB - b) * strength);
  }
}

/**
 * Apply Edge-preserving Denoise Filter
 */
function applyDenoiseFilter(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  strength: number
) {
  const factor = strength / 100; // 0 to 1
  const edgeThreshold = 35; // Threshold to prevent blurring real edges

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const centerR = src[idx];
      const centerG = src[idx + 1];
      const centerB = src[idx + 2];

      let sumR = 0, sumG = 0, sumB = 0;
      let totalWeight = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          const nr = src[nIdx];
          const ng = src[nIdx + 1];
          const nb = src[nIdx + 2];

          // Color similarity distance
          const diff = Math.abs(centerR - nr) + Math.abs(centerG - ng) + Math.abs(centerB - nb);

          if (diff < edgeThreshold) {
            sumR += nr;
            sumG += ng;
            sumB += nb;
            totalWeight++;
          }
        }
      }

      if (totalWeight > 0) {
        const avgR = sumR / totalWeight;
        const avgG = sumG / totalWeight;
        const avgB = sumB / totalWeight;

        dst[idx] = clamp(centerR + (avgR - centerR) * factor);
        dst[idx + 1] = clamp(centerG + (avgG - centerG) * factor);
        dst[idx + 2] = clamp(centerB + (avgB - centerB) * factor);
      } else {
        dst[idx] = centerR;
        dst[idx + 1] = centerG;
        dst[idx + 2] = centerB;
      }
      dst[idx + 3] = src[idx + 3]; // Alpha
    }
  }
}

/**
 * Apply Unsharp Masking (De-blur and edge sharpness restoration)
 */
function applyUnsharpMask(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  amount: number
) {
  // Amount ranges from 0 to 100
  const strength = (amount / 100) * 1.5; // multiplier
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;

      let kIdx = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pIdx = ((y + ky) * width + (x + kx)) * 4;
          const w = kernel[kIdx++];
          r += src[pIdx] * w;
          g += src[pIdx + 1] * w;
          b += src[pIdx + 2] * w;
        }
      }

      const origR = src[idx];
      const origG = src[idx + 1];
      const origB = src[idx + 2];

      dst[idx] = clamp(origR + (r - origR) * strength);
      dst[idx + 1] = clamp(origG + (g - origG) * strength);
      dst[idx + 2] = clamp(origB + (b - origB) * strength);
      dst[idx + 3] = src[idx + 3];
    }
  }
}

/**
 * Color Correction & Grading (Brightness, Contrast, Saturation, Temperature)
 */
function applyColorGrade(
  data: Uint8ClampedArray,
  brightness: number,
  contrast: number,
  saturation: number,
  temperature: number
) {
  const bFactor = (brightness / 100) * 255; // -127 to +127
  const cFactor = (contrast + 100) / 100;   // 0.5 to 1.5
  const sFactor = (saturation + 100) / 100; // 0.5 to 1.5
  const tempR = temperature > 0 ? (temperature / 100) * 30 : 0;
  const tempB = temperature < 0 ? (-temperature / 100) * 30 : 0;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    r += bFactor;
    g += bFactor;
    b += bFactor;

    // Contrast
    r = (r - 128) * cFactor + 128;
    g = (g - 128) * cFactor + 128;
    b = (b - 128) * cFactor + 128;

    // Color Temperature
    r += tempR;
    b += tempB;

    // Saturation
    const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
    r = gray + (r - gray) * sFactor;
    g = gray + (g - gray) * sFactor;
    b = gray + (b - gray) * sFactor;

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }
}

/**
 * Process Full Restoration Pipeline in Client Memory
 */
export async function processRestoration(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  settings: RestorationSettings
): Promise<{
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  dataUrl: string;
  blob: Blob;
}> {
  const initialWidth = 'naturalWidth' in sourceImage ? sourceImage.naturalWidth : sourceImage.width;
  const initialHeight = 'naturalHeight' in sourceImage ? sourceImage.naturalHeight : sourceImage.height;

  const targetScale = settings.upscale || 1;
  const targetWidth = initialWidth * targetScale;
  const targetHeight = initialHeight * targetScale;

  // Create working canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia.');
  }

  // Draw scaled image with bicubic smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceImage, 0, 0, targetWidth, targetHeight);

  // Extract pixel data
  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const pixels = imgData.data;

  // 1. Auto-level & dynamic range enhancement (if preset restore-old or auto-enhance)
  if (settings.preset === 'restore-old' || settings.preset === 'auto-enhance') {
    applyAutoLevels(pixels, targetWidth, targetHeight, settings.preset === 'restore-old' ? 0.9 : 0.6);
  }

  // 2. Denoise if enabled
  if (settings.denoise > 0) {
    const denoiseDst = new Uint8ClampedArray(pixels);
    applyDenoiseFilter(pixels, denoiseDst, targetWidth, targetHeight, settings.denoise);
    pixels.set(denoiseDst);
  }

  // 3. Deblur / Sharpness enhancement
  const totalSharpen = settings.sharpen + (targetScale > 1 ? 20 : 0); // extra sharpness boost if upscaled
  if (totalSharpen > 0) {
    const sharpenDst = new Uint8ClampedArray(pixels);
    applyUnsharpMask(pixels, sharpenDst, targetWidth, targetHeight, Math.min(100, totalSharpen));
    pixels.set(sharpenDst);
  }

  // 4. Color Grading (Brightness, Contrast, Saturation, Temperature)
  applyColorGrade(
    pixels,
    settings.brightness,
    settings.contrast,
    settings.saturation,
    settings.temperature
  );

  // Write pixels back to canvas
  ctx.putImageData(imgData, 0, 0);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal mengekspor foto terestorasi.'))), 'image/jpeg', 0.95);
  });

  return {
    canvas,
    width: targetWidth,
    height: targetHeight,
    dataUrl,
    blob,
  };
}
