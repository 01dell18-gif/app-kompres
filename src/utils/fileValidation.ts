export const MAX_PDF_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_MERGE_CUMULATIVE_BYTES = 200 * 1024 * 1024; // 200 MB
export const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePdfFile(file: File): ValidationResult {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return { valid: false, error: `Berkas "${file.name}" bukan format PDF yang valid.` };
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    return { valid: false, error: `Ukuran berkas "${file.name}" melebihi batas 100 MB.` };
  }
  return { valid: true };
}

export function validateImageFile(file: File): ValidationResult {
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|bmp|tiff)$/i.test(file.name);
  if (!isImage) {
    return { valid: false, error: `Berkas "${file.name}" bukan citra/gambar yang didukung.` };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `Ukuran citra "${file.name}" melebihi batas 50 MB.` };
  }
  return { valid: true };
}

export function revokeIfBlobUrl(url?: string) {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
}

