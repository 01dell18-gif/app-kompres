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
    const viewport = page.getViewport({ scale: 0.4 }); // Thumbnail size

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context tidak tersedia.');
    }

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);

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
 * Convert HTML canvas to JPEG binary ArrayBuffer
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
 * Compress a PDF file locally in the browser
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

    // Determine scale and quality
    let scale = options.scale;
    let quality = options.quality;

    // If target size is specified, dynamically calculate appropriate parameters
    if (options.targetSizeKB && options.targetSizeKB > 0) {
      const targetBytes = options.targetSizeKB * 1024;
      const originalBytes = file.size;
      const targetRatio = targetBytes / originalBytes;

      if (targetRatio < 0.25) {
        // Aggressive compression required
        scale = 0.85;
        quality = 0.38;
      } else if (targetRatio < 0.5) {
        // Strong compression
        scale = 1.05;
        quality = 0.5;
      } else if (targetRatio < 0.8) {
        // Moderate compression
        scale = 1.25;
        quality = 0.65;
      } else {
        // Light compression
        scale = 1.45;
        quality = 0.78;
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
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Gagal menginisialisasi Canvas Context untuk merender halaman.');
      }

      // If grayscale is requested, apply filter
      if (options.grayscale) {
        ctx.filter = 'grayscale(100%)';
      }

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      // Capture original preview snapshot of page 1 if needed
      if (pageNum === 1) {
        compressedPreviewUrl = canvas.toDataURL('image/jpeg', quality);
      }

      const jpegBuffer = await canvasToJpegBuffer(canvas, quality);
      const embeddedImage = await newPdf.embedJpg(jpegBuffer);

      // Add page with original viewport dimensions
      const newPage = newPdf.addPage([viewport.width, viewport.height]);
      newPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });

      // Cleanup canvas memory
      canvas.width = 0;
      canvas.height = 0;

      // Yield event loop briefly to ensure UI responsiveness (60fps)
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    onProgress?.(totalPages, totalPages, 'Menyusun dan menyimpan dokumen terkompresi...');
    const outputBytes = await newPdf.save();
    let resultBlob = new Blob([outputBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

    // Check if target size was requested and if we exceeded it, do a fast secondary pass if needed
    if (options.targetSizeKB && options.targetSizeKB > 0) {
      const targetBytes = options.targetSizeKB * 1024;
      if (resultBlob.size > targetBytes && totalPages <= 8) {
        onProgress?.(totalPages, totalPages, 'Menyesuaikan kerapatan agar tepat di bawah target...');
        // Secondary pass with 20% lower scale and 25% lower quality
        const retryNewPdf = await PDFDocument.create();
        const retryScale = Math.max(0.7, scale * 0.8);
        const retryQuality = Math.max(0.28, quality * 0.75);

        for (let p = 1; p <= totalPages; p++) {
          const pg = await pdfDoc.getPage(p);
          const vp = pg.getViewport({ scale: retryScale });
          const cvs = document.createElement('canvas');
          cvs.width = vp.width;
          cvs.height = vp.height;
          const c = cvs.getContext('2d')!;
          if (options.grayscale) c.filter = 'grayscale(100%)';
          await pg.render({ canvasContext: c, viewport: vp }).promise;
          const buf = await canvasToJpegBuffer(cvs, retryQuality);
          const img = await retryNewPdf.embedJpg(buf);
          const nPg = retryNewPdf.addPage([vp.width, vp.height]);
          nPg.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
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
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  onProgress?.(files.length, files.length, 'Menyimpan dokumen gabungan...');
  const mergedPdfBytes = await mergedDoc.save();

  return new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
