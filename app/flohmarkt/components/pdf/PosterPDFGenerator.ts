import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { PosterPDFInput } from './types';
import { POSTER_STYLES, getPosterContentWidth } from './posterStyles';
import { TenantEvent } from '../../types';

/**
 * Fetch an image URL and convert it to a base64 data URL for PDF embedding.
 */
async function fetchImageAsDataUrl(url: string): Promise<string | null> {
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
 */
async function generateQRCodeDataUrl(url: string): Promise<string> {
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
 */
function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Format event date and time in German locale.
 */
function formatPosterDateTime(event: TenantEvent): string {
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
 * Render the event title (large, centered, multi-line).
 */
function renderPosterTitle(
  doc: jsPDF,
  title: string,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, spacing } = POSTER_STYLES;

  doc.setFontSize(fonts.title.size);
  doc.setFont('helvetica', fonts.title.style);
  doc.setTextColor(colors.primary);

  const lines: string[] = doc.splitTextToSize(title, contentWidth);
  const limitedLines = lines.slice(0, 3);
  if (lines.length > 3) {
    limitedLines[2] = limitedLines[2].replace(/\s+\S*$/, '') + '...';
  }

  const centerX = marginLeft + contentWidth / 2;
  doc.text(limitedLines, centerX, y, { align: 'center' });

  // Each line at 36pt ≈ 12.7mm
  const lineHeight = 13;
  return y + limitedLines.length * lineHeight + spacing.md;
}

/**
 * Render date and location lines (centered).
 */
function renderDateAndLocation(
  doc: jsPDF,
  event: TenantEvent,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, spacing } = POSTER_STYLES;
  const centerX = marginLeft + contentWidth / 2;

  // Date line
  const dateTime = formatPosterDateTime(event);
  if (dateTime) {
    doc.setFontSize(fonts.subtitle.size);
    doc.setFont('helvetica', fonts.subtitle.style);
    doc.setTextColor(colors.text);
    doc.text(dateTime, centerX, y, { align: 'center' });
    y += 8;
  }

  // Location line
  if (event.map_center_address) {
    doc.setFontSize(fonts.subtitle.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.muted);
    doc.text(event.map_center_address, centerX, y, { align: 'center' });
    y += 8;
  }

  y += spacing.lg;

  // Separator line
  doc.setDrawColor(colors.primary);
  doc.setLineWidth(0.8);
  const lineHalfWidth = 30;
  doc.line(centerX - lineHalfWidth, y, centerX + lineHalfWidth, y);
  y += spacing.lg;

  return y;
}

/**
 * Render the cover image (centered, aspect-ratio preserved).
 */
function renderCoverImage(
  doc: jsPDF,
  imageDataUrl: string,
  naturalWidth: number,
  naturalHeight: number,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, spacing, image } = POSTER_STYLES;

  // Calculate dimensions preserving aspect ratio
  const aspectRatio = naturalWidth / naturalHeight;
  let drawWidth = Math.min(image.maxWidth, contentWidth);
  let drawHeight = drawWidth / aspectRatio;

  if (drawHeight > image.maxHeight) {
    drawHeight = image.maxHeight;
    drawWidth = drawHeight * aspectRatio;
  }

  // Center horizontally
  const imageX = marginLeft + (contentWidth - drawWidth) / 2;

  try {
    doc.addImage(imageDataUrl, 'JPEG', imageX, y, drawWidth, drawHeight);
  } catch {
    // If image fails, skip silently
    return y;
  }

  return y + drawHeight + spacing.lg;
}

/**
 * Render the event description (left-aligned, word-wrapped).
 */
function renderDescription(
  doc: jsPDF,
  description: string,
  y: number,
  contentWidth: number,
  maxY: number
): number {
  const { marginLeft, fonts, colors, spacing } = POSTER_STYLES;

  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', fonts.body.style);
  doc.setTextColor(colors.text);

  const lines: string[] = doc.splitTextToSize(description, contentWidth);
  const lineHeight = 5.5; // ~12pt body text line height in mm

  // Calculate max lines that fit before the QR section
  const availableHeight = maxY - y;
  const maxLines = Math.floor(availableHeight / lineHeight);
  const limitedLines = lines.slice(0, Math.max(maxLines, 3));

  if (lines.length > limitedLines.length) {
    limitedLines[limitedLines.length - 1] =
      limitedLines[limitedLines.length - 1].replace(/\s+\S*$/, '') + '...';
  }

  doc.text(limitedLines, marginLeft, y);

  return y + limitedLines.length * lineHeight + spacing.lg;
}

/**
 * Render the QR code and call-to-action text (centered, anchored near bottom).
 */
function renderQRCodeSection(
  doc: jsPDF,
  qrCodeDataUrl: string,
  registrationUrl: string,
  y: number,
  contentWidth: number
): void {
  const { marginLeft, fonts, colors, spacing, qrCode, pageHeight, marginBottom } = POSTER_STYLES;
  const centerX = marginLeft + contentWidth / 2;

  // Position QR section: use provided y or anchor near bottom, whichever is lower
  const qrSectionHeight = qrCode.size + 8 + 8 + 6 + spacing.md; // QR + CTA + URL + spacing
  const minQRY = pageHeight - marginBottom - qrSectionHeight;
  const qrY = Math.max(y, minQRY);

  // QR code (centered)
  const qrX = centerX - qrCode.size / 2;
  try {
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrCode.size, qrCode.size);
  } catch {
    // Fallback text if QR fails
    doc.setFontSize(fonts.body.size);
    doc.setTextColor(colors.muted);
    doc.text('QR-Code konnte nicht erstellt werden', centerX, qrY + qrCode.size / 2, {
      align: 'center',
    });
  }

  let ctaY = qrY + qrCode.size + spacing.md;

  // CTA text
  doc.setFontSize(fonts.cta.size);
  doc.setFont('helvetica', fonts.cta.style);
  doc.setTextColor(colors.primary);
  doc.text('Scanne den QR-Code und mach mit – keine Anmeldung nötig', centerX, ctaY, {
    align: 'center',
  });
  ctaY += 8;

  // URL as fallback
  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.lightGray);
  doc.text(registrationUrl, centerX, ctaY, { align: 'center' });
}

/**
 * Generate a single-page A4 promotional poster PDF for an event.
 */
export async function generatePosterPDF(input: PosterPDFInput): Promise<Blob> {
  const { event, coverImageUrl, registrationUrl } = input;
  const contentWidth = getPosterContentWidth();
  const { marginTop, marginLeft, pageHeight, marginBottom, spacing, qrCode } = POSTER_STYLES;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y: number = marginTop;

  // 1. Title
  y = renderPosterTitle(doc, event.title, y, contentWidth);

  // 2. Date & Location
  y = renderDateAndLocation(doc, event, y, contentWidth);

  // 3. Cover Image (optional)
  let imageDataUrl: string | null = null;
  if (coverImageUrl) {
    imageDataUrl = await fetchImageAsDataUrl(coverImageUrl);
    if (imageDataUrl) {
      try {
        const dims = await getImageDimensions(imageDataUrl);
        y = renderCoverImage(doc, imageDataUrl, dims.width, dims.height, y, contentWidth);
      } catch {
        // Image loading failed, skip
      }
    }
  }

  // 4. Description
  // Calculate where QR section starts to cap description
  const qrSectionHeight = qrCode.size + 8 + 8 + 6 + spacing.md + spacing.xl;
  const maxDescriptionY = pageHeight - marginBottom - qrSectionHeight;

  if (event.description) {
    y = renderDescription(doc, event.description, y, contentWidth, maxDescriptionY);
  }

  // 5. QR Code + CTA
  const qrCodeDataUrl = await generateQRCodeDataUrl(registrationUrl);
  renderQRCodeSection(doc, qrCodeDataUrl, registrationUrl, y, contentWidth);

  // Footer
  const footerY = pageHeight - marginBottom + 2;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(POSTER_STYLES.colors.lightGray);
  const genDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  doc.text(`Erstellt am ${genDate}`, marginLeft, footerY);

  return doc.output('blob');
}
