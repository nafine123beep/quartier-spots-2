/**
 * Shared content preparation utilities for print materials (A4 posters and A6 flyers).
 * These functions ensure consistent content processing across all print formats.
 */

import QRCode from 'qrcode';
import { TenantEvent } from '../../types';
import { DEFAULT_POSTER_DESCRIPTION, MIN_DESCRIPTION_LENGTH } from './posterStyles';

/**
 * Fetch an image URL and convert it to a base64 data URL for PDF embedding.
 * Returns null if the image cannot be fetched.
 */
export async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Generate a high-resolution QR code as a base64 data URL.
 * Uses custom branding colors (dark blue + white) and error correction level M.
 */
export async function generateQRCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 1,
    color: {
      dark: '#003366',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
}

/**
 * Get image dimensions from a data URL by loading it into an Image element.
 * Rejects if the image cannot be loaded.
 */
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Format event date and time in German locale for print materials.
 * Returns empty string if no start date is provided.
 */
export function formatPosterDateTime(event: TenantEvent): string {
  if (!event.starts_at) return '';

  const start = new Date(event.starts_at);
  const dateStr = start.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const startTime = start.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (event.ends_at) {
    const end = new Date(event.ends_at);
    const endTime = end.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} | ${startTime} – ${endTime} Uhr`;
  }

  return `${dateStr} | ${startTime} Uhr`;
}

/**
 * Get the description to use for print materials (poster/flyer).
 * Prioritizes custom description, then event description, then default promotional text.
 */
export function getPrintDescription(event: TenantEvent, customDescription?: string): string {
  // 1. Use custom description if provided (from modal)
  if (customDescription && customDescription.trim().length >= MIN_DESCRIPTION_LENGTH) {
    return customDescription.trim();
  }

  // 2. Use event description if it's long enough
  if (event.description && event.description.trim().length >= MIN_DESCRIPTION_LENGTH) {
    return event.description.trim();
  }

  // 3. Fall back to default promotional text
  return DEFAULT_POSTER_DESCRIPTION;
}

/**
 * Calculate scaled image dimensions for a specific print format (A4 or A6).
 * Preserves aspect ratio while respecting format-specific max dimensions.
 */
export function scaleImageForFormat(
  naturalWidth: number,
  naturalHeight: number,
  format: 'a4' | 'a6'
): { width: number; height: number } {
  // Format-specific max dimensions (in mm)
  const constraints =
    format === 'a4'
      ? { maxWidth: 180, maxHeight: 90 } // A4: square/landscape image
      : { maxWidth: 132, maxHeight: 30 }; // A6: banner-style header (updated)

  const aspectRatio = naturalWidth / naturalHeight;
  let width = Math.min(constraints.maxWidth, naturalWidth);
  let height = width / aspectRatio;

  if (height > constraints.maxHeight) {
    height = constraints.maxHeight;
    width = height * aspectRatio;
  }

  return { width, height };
}
