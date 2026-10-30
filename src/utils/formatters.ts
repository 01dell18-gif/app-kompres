/**
 * Format bytes into human-readable format (Bytes, KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  if (isNaN(bytes) || bytes < 0) return '-';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${val} ${sizes[i]}`;
}

/**
 * Calculate reduction percentage and saved bytes
 */
export function calculateSavings(original: number, compressed: number): {
  savedBytes: number;
  percentage: number;
} {
  if (original <= 0) return { savedBytes: 0, percentage: 0 };
  const savedBytes = Math.max(0, original - compressed);
  const percentage = parseFloat(((savedBytes / original) * 100).toFixed(1));
  return { savedBytes, percentage };
}

/**
 * Generate formatted timestamp string for filenames
 */
export function getTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

/**
 * Clean and format filename with suffix
 */
export function getCompressedFilename(originalName: string, suffix: string = 'compressed', newExt?: string): string {
  const lastDot = originalName.lastIndexOf('.');
  const baseName = lastDot !== -1 ? originalName.slice(0, lastDot) : originalName;
  const ext = newExt || (lastDot !== -1 ? originalName.slice(lastDot + 1) : '');

  const safeBase = baseName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  return ext ? `${safeBase}_${suffix}.${ext}` : `${safeBase}_${suffix}`;
}

