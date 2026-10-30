import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { PdfCompressOptions } from '../types';

// Configure local worker to guarantee 100% offline support
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

/**
 * Get total page count and render a thumbnail of the first page
 */
export async function getPdfInfoAndThumbnail(file: File): Promise<{
  pageCount: number;
  thumbnailUrl: string;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    // Render page 1 thumbnail
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 0.45 });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context tidak tersedia.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Clean up
    canvas.width = 0;
    canvas.height = 0;

    return { pageCount, thumbnailUrl };
  } catch (err: any) {
    if (err?.name === 'PasswordException') {
      throw new Error(`PDF "${file.name}" terenkripsi/dilindungi sandi.`);
    }
    throw new Error(`Gagal membaca PDF "${file.name}": ${err?.message || 'Format tidak valid'}`);
  }
}

/**
 * Convert HTML canvas to JPEG binary ArrayBuffer with optimal encoding
 */
function canvasToJpegBuffer(canvas: HTMLCanvasElement, quality: number): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Konversi kanvas gagal.'));
          return;
        }
        try {
          const buffer = await blob.arrayBuffer();
          resolve(buffer);
        } catch (e) {
          reject(e);
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * High-Quality PDF Compression in Browser Memory
 * Preserves exact original page dimensions (A4, Letter, etc.) while rendering
 * high-resolution raster layers and recompressing with perceptual JPEG quantization.
 */
export async function compressPdf(
  file: File,
  options: PdfCompressOptions,
  onProgress?: (page: number, total: number, message: string) => void
): Promise<{
  blob: Blob;
  originalPreviewUrl?: string;
  compressedPreviewUrl?: string;
}> {
  try {
    onProgress?.(0, 0, 'Membaca dan memverifikasi berkas PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    });
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    // Base scale & quality tuned for exceptional readability
    let renderScale = options.scale;
    let jpegQuality = options.quality;

    // Dynamic adjustment if target file size is specified
    if (options.targetSizeKB && options.targetSizeKB > 0) {
      const targetBytes = options.targetSizeKB * 1024;
      const originalBytes = file.size;
      const targetRatio = targetBytes / originalBytes;

      if (targetRatio < 0.25) {
        // Strict limit (e.g. <200 KB for CASN): maintain at least 1.25x scale so text is sharp
        renderScale = 1.25;
        jpegQuality = 0.46;
      } else if (targetRatio < 0.5) {
        renderScale = 1.45;
        jpegQuality = 0.58;
      } else if (targetRatio < 0.8) {
        renderScale = 1.7;
        jpegQuality = 0.68;
      } else {
        renderScale = 2.0;
        jpegQuality = 0.80;
      }
    }

    const newPdf = await PDFDocument.create();
    let originalPreviewUrl: string | undefined;
    let compressedPreviewUrl: string | undefined;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      onProgress?.(
        pageNum,
        totalPages,
        `Merender & mengompresi halaman ${pageNum} dari ${totalPages}...`
      );

      const page = await pdfDoc.getPage(pageNum);

      // Preserve original PDF page dimensions in points (72pt/inch)
      const origViewport = page.getViewport({ scale: 1.0 });

      // Render at higher pixel resolution for crisp, legible text
      const renderViewport = page.getViewport({ scale: renderScale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(renderViewport.width);
      canvas.height = Math.round(renderViewport.height);
      const ctx = canvas.getContext('2d', { alpha: false });

      if (!ctx) {
        throw new Error('Gagal menginisialisasi Canvas Context untuk merender halaman.');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill white background to avoid transparent artifacts
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply grayscale filter if enabled
      if (options.grayscale) {
        ctx.filter = 'grayscale(100%) contrast(108%)';
      }

      await page.render({
        canvasContext: ctx,
        viewport: renderViewport,
      }).promise;

      // Reset filter
      if (options.grayscale) {
        ctx.filter = 'none';
      }

      // Capture original & compressed preview snapshots of page 1
      if (pageNum === 1) {
        compressedPreviewUrl = canvas.toDataURL('image/jpeg', jpegQuality);
      }

      const jpegBuffer = await canvasToJpegBuffer(canvas, jpegQuality);
      const embeddedImage = await newPdf.embedJpg(jpegBuffer);

      // Add page with EXACT original paper size (A4 / Letter / Legal)
      const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
      newPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: origViewport.width,
        height: origViewport.height,
      });

      // Cleanup canvas memory
      canvas.width = 0;
      canvas.height = 0;

      // Yield event loop briefly to ensure UI fluidity (60 FPS)
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    onProgress?.(totalPages, totalPages, 'Menyusun dan menyimpan dokumen terkompresi...');
    const outputBytes = await newPdf.save();
    let resultBlob = new Blob([outputBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

    // Adaptive secondary pass if strict target size was set and still exceeded
    if (options.targetSizeKB && options.targetSizeKB > 0) {
      const targetBytes = options.targetSizeKB * 1024;
      if (resultBlob.size > targetBytes && totalPages <= 8) {
        onProgress?.(totalPages, totalPages, 'Menyesuaikan kerapatan agar tepat di bawah target...');
        const retryNewPdf = await PDFDocument.create();
        const retryScale = Math.max(1.1, renderScale * 0.85);
        const retryQuality = Math.max(0.35, jpegQuality * 0.78);

        for (let p = 1; p <= totalPages; p++) {
          const pg = await pdfDoc.getPage(p);
          const origVp = pg.getViewport({ scale: 1.0 });
          const vp = pg.getViewport({ scale: retryScale });

          const cvs = document.createElement('canvas');
          cvs.width = Math.round(vp.width);
          cvs.height = Math.round(vp.height);
          const c = cvs.getContext('2d', { alpha: false })!;
          c.imageSmoothingEnabled = true;
          c.imageSmoothingQuality = 'high';
          c.fillStyle = '#FFFFFF';
          c.fillRect(0, 0, cvs.width, cvs.height);

          if (options.grayscale) c.filter = 'grayscale(100%) contrast(108%)';
          await pg.render({ canvasContext: c, viewport: vp }).promise;
          if (options.grayscale) c.filter = 'none';

          const buf = await canvasToJpegBuffer(cvs, retryQuality);
          const img = await retryNewPdf.embedJpg(buf);
          const nPg = retryNewPdf.addPage([origVp.width, origVp.height]);
          nPg.drawImage(img, { x: 0, y: 0, width: origVp.width, height: origVp.height });
          cvs.width = 0;
          cvs.height = 0;
        }
        const retryBytes = await retryNewPdf.save();
        resultBlob = new Blob([retryBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      }
    }

    onProgress?.(totalPages, totalPages, 'Kompresi selesai!');

    return {
      blob: resultBlob,
      originalPreviewUrl,
      compressedPreviewUrl,
    };
  } catch (err: any) {
    if (err?.name === 'PasswordException') {
      throw new Error('PDF ini dilindungi sandi (password-protected). Harap hapus sandi terlebih dahulu.');
    }
    throw new Error(err?.message || 'Terjadi kesalahan saat memproses kompresi PDF.');
  }
}

/**
 * Merge multiple PDF documents in given order into a single PDF
 */
export async function mergePdfs(
  files: File[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Blob> {
  if (files.length < 2) {
    throw new Error('Pilih minimal 2 berkas PDF untuk digabungkan.');
  }

  const mergedDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i + 1, files.length, `Menggabungkan berkas ${i + 1} dari ${files.length}: ${file.name}...`);

    try {
      const fileBytes = await file.arrayBuffer();
      const donorDoc = await PDFDocument.load(fileBytes);
      const donorPages = await mergedDoc.copyPages(donorDoc, donorDoc.getPageIndices());

      for (const page of donorPages) {
        mergedDoc.addPage(page);
      }
    } catch (err: any) {
      if (err?.message?.includes('password') || err?.name === 'PasswordException') {
        throw new Error(`Berkas "${file.name}" terenkripsi sandi. Harap buka kunci terlebih dahulu.`);
      }
      throw new Error(`Gagal memuat berkas "${file.name}": ${err?.message || 'Format tidak valid'}`);
    }

    // Brief yield for UI fluidity
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  onProgress?.(files.length, files.length, 'Menyimpan dokumen gabungan...');
  const mergedPdfBytes = await mergedDoc.save();

  return new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
