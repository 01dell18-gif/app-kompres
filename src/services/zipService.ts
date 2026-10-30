import JSZip from 'jszip';
import { ImageProcessItem } from '../types';
import { getCompressedFilename, getTimestamp } from '../utils/formatters';

/**
 * Pack all successfully processed images into a ZIP archive and return a downloadable Blob URL
 */
export async function createImagesZip(
  items: ImageProcessItem[],
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; filename: string }> {
  const zip = new JSZip();
  const folder = zip.folder('foto-terkompresi') || zip;

  const validItems = items.filter((item) => item.status === 'done' && item.compressedBlob);

  if (validItems.length === 0) {
    throw new Error('Tidak ada foto yang berhasil dikompresi untuk diunduh.');
  }

  // Determine file extensions based on mime type
  for (const item of validItems) {
    if (!item.compressedBlob) continue;
    let ext = 'jpg';
    if (item.compressedBlob.type === 'image/webp') ext = 'webp';
    else if (item.compressedBlob.type === 'image/png') ext = 'png';

    const filename = getCompressedFilename(item.name, 'min', ext);
    folder.file(filename, item.compressedBlob);
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.(Math.round(metadata.percent));
    }
  );

  const filename = `kumpulan-foto-terkompresi_${getTimestamp()}.zip`;
  return { blob: zipBlob, filename };
}

/**
 * Trigger browser file download from Blob
 */
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

