import jsPDF from 'jspdf';
import { FlyerPDFInput } from './types';
import { FLYER_STYLES, getFlyerContentWidth } from './flyerStyles';
import { TenantEvent } from '../../types';
import {
  fetchImageAsDataUrl,
  generateQRCodeDataUrl,
  getImageDimensions,
  getPrintDescription,
} from './printContentPrep';

/**
 * Render the event title (24pt bold, very dominant, max 2 lines).
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

  // Each line at 24pt ≈ 8.5mm
  const lineHeight = 8.5;
  return y + limitedLines.length * lineHeight + spacing.xs;
}

/**
 * Render compact metadata (single line: date | time • location).
 */
function renderCompactMetadata(
  doc: jsPDF,
  event: TenantEvent,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, spacing } = FLYER_STYLES;
  const centerX = marginLeft + contentWidth / 2;

  // Build compact metadata string
  let metadataStr = '';

  if (event.starts_at) {
    const start = new Date(event.starts_at);
    const dayStr = start.toLocaleDateString('de-DE', {
      weekday: 'short',
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
      metadataStr = `${dayStr} | ${startTime}–${endTime} Uhr`;
    } else {
      metadataStr = `${dayStr} | ${startTime} Uhr`;
    }
  }

  // Add location with bullet separator
  if (event.map_center_address) {
    if (metadataStr) {
      metadataStr += ` • ${event.map_center_address}`;
    } else {
      metadataStr = event.map_center_address;
    }
  }

  if (metadataStr) {
    doc.setFontSize(fonts.subtitle.size);
    doc.setFont('helvetica', fonts.subtitle.style);
    doc.setTextColor(colors.muted);

    // If too long, split into two lines
    const lines: string[] = doc.splitTextToSize(metadataStr, contentWidth);
    doc.text(lines.slice(0, 2), centerX, y, { align: 'center' });

    const lineHeight = 4;
    return y + Math.min(lines.length, 2) * lineHeight + spacing.md;
  }

  return y + spacing.sm;
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
 * Render the description (full text, no truncation).
 */
function renderDescription(
  doc: jsPDF,
  description: string,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, spacing } = FLYER_STYLES;

  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', fonts.body.style);
  doc.setTextColor(colors.text);

  const lines: string[] = doc.splitTextToSize(description, contentWidth);
  const lineHeight = 4;

  // Render all lines (no truncation)
  const centerX = marginLeft + contentWidth / 2;
  doc.text(lines, centerX, y, { align: 'center' });

  return y + lines.length * lineHeight + spacing.md;
}

/**
 * Render the QR action block (visually boxed with background).
 * Contains: QR code + CTA text + "no login required" notice.
 */
function renderQRActionBlock(
  doc: jsPDF,
  qrCodeDataUrl: string,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, spacing, qrCode, qrBlock } = FLYER_STYLES;
  const centerX = marginLeft + contentWidth / 2;

  // Calculate block dimensions
  const blockPadding = qrBlock.padding;
  const qrSize = qrCode.size;
  const ctaText = 'Scanne den QR-Code und mach mit – keine Anmeldung erforderlich';

  // Measure CTA text height
  doc.setFontSize(fonts.cta.size);
  const ctaLines: string[] = doc.splitTextToSize(ctaText, contentWidth - blockPadding * 2);
  const ctaLineHeight = 4.5;
  const ctaHeight = ctaLines.length * ctaLineHeight;

  // Total block height
  const blockHeight = blockPadding + qrSize + spacing.sm + ctaHeight + blockPadding;
  const blockWidth = contentWidth;
  const blockX = marginLeft;

  // Draw background rectangle
  doc.setFillColor(colors.qrBlockBg);
  doc.roundedRect(blockX, y, blockWidth, blockHeight, qrBlock.borderRadius, qrBlock.borderRadius, 'F');

  // Draw QR code (centered in block)
  const qrX = centerX - qrSize / 2;
  const qrY = y + blockPadding;

  try {
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  } catch {
    // Fallback text if QR fails
    doc.setFontSize(fonts.body.size);
    doc.setTextColor(colors.muted);
    doc.text('QR-Code konnte nicht erstellt werden', centerX, qrY + qrSize / 2, {
      align: 'center',
    });
  }

  // Draw CTA text below QR
  const ctaY = qrY + qrSize + spacing.sm;
  doc.setFontSize(fonts.cta.size);
  doc.setFont('helvetica', fonts.cta.style);
  doc.setTextColor(colors.primary);
  doc.text(ctaLines, centerX, ctaY, { align: 'center' });

  return y + blockHeight + spacing.md;
}

/**
 * Render contact email footer with redesigned copy.
 * "Haben Sie noch Fragen zum Event? Schreib uns an {email}"
 * Email is rendered in bold.
 */
function renderContactFooter(
  doc: jsPDF,
  contactEmail: string,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors } = FLYER_STYLES;
  const centerX = marginLeft + contentWidth / 2;

  // First part: "Haben Sie noch Fragen zum Event? Schreib uns an "
  const prefix = 'Haben Sie noch Fragen zum Event? Schreib uns an ';

  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.muted);

  // Measure prefix width for positioning
  const prefixWidth = doc.getTextWidth(prefix);

  // Measure email width (bold)
  doc.setFont('helvetica', 'bold');
  const emailWidth = doc.getTextWidth(contactEmail);

  // Calculate total width and starting X for centering
  const totalWidth = prefixWidth + emailWidth;
  const startX = centerX - totalWidth / 2;

  // Draw prefix (normal weight)
  doc.setFont('helvetica', 'normal');
  doc.text(prefix, startX, y, { align: 'left' });

  // Draw email (bold)
  doc.setFont('helvetica', 'bold');
  doc.text(contactEmail, startX + prefixWidth, y, { align: 'left' });

  return y + 4;
}

/**
 * Generate a single-page A6 flyer PDF for an event.
 * Redesigned layout with strong visual hierarchy and boxed QR block.
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

  // 1. Banner Image (optional, top of page when available)
  let imageDataUrl: string | null = null;
  if (coverImageUrl) {
    imageDataUrl = await fetchImageAsDataUrl(coverImageUrl);
    if (imageDataUrl) {
      try {
        const dims = await getImageDimensions(imageDataUrl);
        y = renderBannerImage(doc, imageDataUrl, dims.width, dims.height, y, contentWidth);
      } catch {
        // Image loading failed, start with title directly
      }
    }
  }

  // 2. Event Title (very dominant, 24pt)
  y = renderFlyerTitle(doc, event.title, y, contentWidth);

  // 3. Compact Metadata (single line: date | time • location)
  y = renderCompactMetadata(doc, event, y, contentWidth);

  // 4. Description (full text, no truncation)
  const description = getPrintDescription(event, customDescription);
  y = renderDescription(doc, description, y, contentWidth);

  // 5. QR Action Block (boxed with background)
  const qrCodeDataUrl = await generateQRCodeDataUrl(registrationUrl);
  y = renderQRActionBlock(doc, qrCodeDataUrl, y, contentWidth);

  // 6. Contact Footer (optional, redesigned copy with bold email)
  if (contactEmail) {
    renderContactFooter(doc, contactEmail, y, contentWidth);
  }

  return doc.output('blob');
}
