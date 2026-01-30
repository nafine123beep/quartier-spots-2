import jsPDF from 'jspdf';
import { PosterPDFInput } from './types';
import {
  POSTER_STYLES,
  getPosterContentWidth,
} from './posterStyles';
import { TenantEvent } from '../../types';
import {
  fetchImageAsDataUrl,
  generateQRCodeDataUrl,
  getImageDimensions,
  formatPosterDateTime,
  getPrintDescription,
} from './printContentPrep';

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

  // More generous spacing (no separator bar)
  y += spacing.xl;

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
 * Render contact block (if contact email is provided).
 */
function renderContactBlock(
  doc: jsPDF,
  contactEmail: string,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, spacing } = POSTER_STYLES;
  const centerX = marginLeft + contentWidth / 2;

  // "Questions about the event?" heading
  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text);
  doc.text('Fragen zur Veranstaltung?', centerX, y, { align: 'center' });
  y += 6;

  // Contact email
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.muted);
  doc.text(`Gerne an ${contactEmail}`, centerX, y, { align: 'center' });

  return y + spacing.lg;
}

/**
 * Render the QR code and call-to-action text (centered, anchored near bottom).
 * This section is treated as an inseparable layout unit: QR + CTA + notice.
 */
function renderQRCodeSection(
  doc: jsPDF,
  qrCodeDataUrl: string,
  y: number,
  contentWidth: number
): void {
  const { marginLeft, fonts, colors, spacing, qrCode, pageHeight, marginBottom } = POSTER_STYLES;
  const centerX = marginLeft + contentWidth / 2;

  // Position QR section: use provided y or anchor near bottom, whichever is lower
  // QR + CTA text (no URL display)
  const qrSectionHeight = qrCode.size + spacing.md + 8; // QR + spacing + CTA
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

  // CTA text (combined with "no login required" notice)
  doc.setFontSize(fonts.cta.size);
  doc.setFont('helvetica', fonts.cta.style);
  doc.setTextColor(colors.primary);
  doc.text('Scanne den QR-Code und mach mit – keine Anmeldung nötig', centerX, ctaY, {
    align: 'center',
  });
}

/**
 * Generate a single-page A4 promotional poster PDF for an event.
 */
export async function generatePosterPDF(input: PosterPDFInput): Promise<Blob> {
  const { event, coverImageUrl, registrationUrl, contactEmail, customDescription } = input;
  const contentWidth = getPosterContentWidth();
  const { marginTop, pageHeight, marginBottom, spacing, qrCode } = POSTER_STYLES;

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

  // 4. Description (use custom, event, or fallback)
  // Calculate where contact/QR section starts to cap description
  const contactBlockHeight = contactEmail ? 12 + spacing.lg : 0;
  const qrSectionHeight = qrCode.size + spacing.md + 8 + spacing.xl;
  const maxDescriptionY = pageHeight - marginBottom - qrSectionHeight - contactBlockHeight;

  const description = getPrintDescription(event, customDescription);
  y = renderDescription(doc, description, y, contentWidth, maxDescriptionY);

  // 5. Contact Block (optional, if email provided)
  if (contactEmail) {
    y = renderContactBlock(doc, contactEmail, y, contentWidth);
  }

  // 6. QR Code + CTA (inseparable unit: QR + text + notice)
  const qrCodeDataUrl = await generateQRCodeDataUrl(registrationUrl);
  renderQRCodeSection(doc, qrCodeDataUrl, y, contentWidth);

  return doc.output('blob');
}
