import jsPDF from 'jspdf';
import { FlyerPDFInput } from './types';
import { FLYER_STYLES, getFlyerContentWidth } from './flyerStyles';
import { TenantEvent } from '../../types';
import {
  fetchImageAsDataUrl,
  generateQRCodeDataUrl,
  getImageDimensions,
  formatPosterDateTime,
  getPrintDescription,
  truncateForFlyer,
} from './printContentPrep';

/**
 * Render the event title (compact, centered, max 2 lines).
 */
function renderFlyerTitle(
  doc: jsPDF,
  title: string,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, spacing } = FLYER_STYLES;

  doc.setFontSize(fonts.title.size);
  doc.setFont('helvetica', fonts.title.style);
  doc.setTextColor(colors.primary);

  const lines: string[] = doc.splitTextToSize(title, contentWidth);
  const limitedLines = lines.slice(0, 2);
  if (lines.length > 2) {
    limitedLines[1] = limitedLines[1].replace(/\s+\S*$/, '') + '...';
  }

  const centerX = marginLeft + contentWidth / 2;
  doc.text(limitedLines, centerX, y, { align: 'center' });

  // Each line at 18pt ≈ 6.4mm
  const lineHeight = 6.5;
  return y + limitedLines.length * lineHeight + spacing.sm;
}

/**
 * Render date and location in compact inline format (centered).
 */
function renderCompactDateLocation(
  doc: jsPDF,
  event: TenantEvent,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, spacing } = FLYER_STYLES;
  const centerX = marginLeft + contentWidth / 2;

  // Date line
  const dateTime = formatPosterDateTime(event);
  if (dateTime) {
    doc.setFontSize(fonts.subtitle.size);
    doc.setFont('helvetica', fonts.subtitle.style);
    doc.setTextColor(colors.text);
    doc.text(dateTime, centerX, y, { align: 'center' });
    y += 5;
  }

  // Location line
  if (event.map_center_address) {
    doc.setFontSize(fonts.subtitle.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.muted);
    doc.text(event.map_center_address, centerX, y, { align: 'center' });
    y += 5;
  }

  // Spacing after date/location
  y += spacing.md;

  return y;
}

/**
 * Render the banner-style header image (full-width, compact height).
 */
function renderBannerImage(
  doc: jsPDF,
  imageDataUrl: string,
  naturalWidth: number,
  naturalHeight: number,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, spacing, image } = FLYER_STYLES;

  // Calculate dimensions preserving aspect ratio (banner style)
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

  return y + drawHeight + spacing.md;
}

/**
 * Render the compact description (truncated to max 120 chars, 2-3 lines).
 */
function renderCompactDescription(
  doc: jsPDF,
  description: string,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, spacing } = FLYER_STYLES;

  // Truncate description for compact layout
  const truncatedDesc = truncateForFlyer(description, 120);

  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', fonts.body.style);
  doc.setTextColor(colors.text);

  const lines: string[] = doc.splitTextToSize(truncatedDesc, contentWidth);
  const lineHeight = 4.5; // ~9pt body text line height in mm

  // Max 3 lines for compact layout
  const limitedLines = lines.slice(0, 3);

  doc.text(limitedLines, marginLeft, y);

  return y + limitedLines.length * lineHeight + spacing.lg;
}

/**
 * Render the QR code section (QR + CTA + notice, centered).
 */
function renderQRCodeSection(
  doc: jsPDF,
  qrCodeDataUrl: string,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, spacing, qrCode } = FLYER_STYLES;
  const centerX = marginLeft + contentWidth / 2;

  // QR code (centered)
  const qrX = centerX - qrCode.size / 2;
  try {
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, y, qrCode.size, qrCode.size);
  } catch {
    // Fallback text if QR fails
    doc.setFontSize(fonts.body.size);
    doc.setTextColor(colors.muted);
    doc.text('QR-Code konnte nicht erstellt werden', centerX, y + qrCode.size / 2, {
      align: 'center',
    });
  }

  const ctaY = y + qrCode.size + spacing.sm;

  // CTA text (combined with "no login required" notice)
  doc.setFontSize(fonts.cta.size);
  doc.setFont('helvetica', fonts.cta.style);
  doc.setTextColor(colors.primary);

  // Split CTA text into multiple lines for better fit on A6
  const ctaText = 'Scanne den QR-Code und mach mit – keine Anmeldung nötig';
  const ctaLines: string[] = doc.splitTextToSize(ctaText, contentWidth);
  doc.text(ctaLines, centerX, ctaY, { align: 'center' });

  const lineHeight = 4.5;
  return ctaY + ctaLines.length * lineHeight + spacing.sm;
}

/**
 * Render contact email as small footer text (optional).
 */
function renderEmailFooter(
  doc: jsPDF,
  contactEmail: string,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors } = FLYER_STYLES;
  const centerX = marginLeft + contentWidth / 2;

  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.muted);
  doc.text(`Fragen? ${contactEmail}`, centerX, y, { align: 'center' });

  return y + 4;
}

/**
 * Generate a single-page A6 compact flyer PDF for an event.
 */
export async function generateFlyerPDF(input: FlyerPDFInput): Promise<Blob> {
  const { event, coverImageUrl, registrationUrl, contactEmail, customDescription } = input;
  const contentWidth = getFlyerContentWidth();
  const { marginTop } = FLYER_STYLES;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 105], // A6 dimensions
  });

  let y: number = marginTop;

  // 1. Banner Image (optional, top of page)
  let imageDataUrl: string | null = null;
  if (coverImageUrl) {
    imageDataUrl = await fetchImageAsDataUrl(coverImageUrl);
    if (imageDataUrl) {
      try {
        const dims = await getImageDimensions(imageDataUrl);
        y = renderBannerImage(doc, imageDataUrl, dims.width, dims.height, y, contentWidth);
      } catch {
        // Image loading failed, skip
      }
    }
  }

  // 2. Event Title
  y = renderFlyerTitle(doc, event.title, y, contentWidth);

  // 3. Date + Location (compact, inline)
  y = renderCompactDateLocation(doc, event, y, contentWidth);

  // 4. Description (truncated to max 120 chars)
  const description = getPrintDescription(event, customDescription);
  y = renderCompactDescription(doc, description, y, contentWidth);

  // 5. QR Code + CTA
  const qrCodeDataUrl = await generateQRCodeDataUrl(registrationUrl);
  y = renderQRCodeSection(doc, qrCodeDataUrl, y, contentWidth);

  // 6. Email Footer (optional, if email provided)
  if (contactEmail) {
    renderEmailFooter(doc, contactEmail, y, contentWidth);
  }

  return doc.output('blob');
}
