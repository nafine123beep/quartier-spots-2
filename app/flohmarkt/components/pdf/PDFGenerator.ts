import jsPDF from 'jspdf';
import { PDFGeneratorInput } from './types';
import { PDF_STYLES, getContentWidth, getHighlightMarker } from './pdfStyles';
import {
  sortSpotsForPrint,
  formatAddressForPrint,
  truncateText,
} from '../../lib/printUtils';
import { getHighlightTypeLabel } from '../../lib/highlightConfig';
import { Spot, TenantEvent, CustomHighlightType } from '../../types';

/**
 * Generate a PDF document for an event with all spots, highlights, and a map.
 */
export async function generateEventPDF(input: PDFGeneratorInput): Promise<Blob> {
  const { event, spots, highlights, customHighlightTypes, mapImageDataUrl } = input;
  const { marginTop } = PDF_STYLES;
  const contentWidth = getContentWidth();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let yPosition: number = marginTop;

  // ============ SECTION 0: Event Header ============
  yPosition = renderEventHeader(doc, event, yPosition, contentWidth);

  // ============ SECTION 1: Highlights ============
  if (highlights.length > 0) {
    yPosition = renderHighlightsSection(doc, highlights, customHighlightTypes, yPosition, contentWidth);
  }

  // ============ SECTION 2: Spots & Contact Persons ============
  const sortedSpots = sortSpotsForPrint(spots);
  if (sortedSpots.length > 0) {
    yPosition = renderSpotsSection(doc, sortedSpots, event, yPosition, contentWidth);
  } else {
    yPosition = renderEmptySpotsMessage(doc, event, yPosition, contentWidth);
  }

  // ============ SECTION 3: Map + Legend ============
  doc.addPage();
  yPosition = marginTop;
  renderMapSection(doc, mapImageDataUrl, sortedSpots, highlights, customHighlightTypes, yPosition, contentWidth);

  return doc.output('blob');
}

/**
 * Format date and time on a single line
 */
function formatDateTimeLine(event: TenantEvent): string {
  if (!event.starts_at) return '';

  const start = new Date(event.starts_at);

  // Format date: "Samstag, 15.03.2025"
  const dateStr = start.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Format time: "10:00 - 18:00 Uhr"
  const startTime = start.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (event.ends_at) {
    const end = new Date(event.ends_at);
    const endTime = end.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateStr} | ${startTime} - ${endTime} Uhr`;
  }

  return `${dateStr} | ${startTime} Uhr`;
}

/**
 * Section 0: Event Header - Clear visual block
 */
function renderEventHeader(
  doc: jsPDF,
  event: TenantEvent,
  startY: number,
  contentWidth: number
): number {
  let y = startY;
  const { marginLeft, fonts, colors, spacing } = PDF_STYLES;

  // Header box background
  doc.setFillColor('#f8fafc');
  doc.roundedRect(marginLeft, y - 5, contentWidth, 45, 3, 3, 'F');

  // Event title - Large and prominent
  doc.setFontSize(fonts.title.size);
  doc.setFont('helvetica', fonts.title.style);
  doc.setTextColor(colors.primary);
  doc.text(event.title, marginLeft + spacing.md, y + 5);
  y += 12;

  // Date and time - Single line
  const dateTimeLine = formatDateTimeLine(event);
  if (dateTimeLine) {
    doc.setFontSize(fonts.subtitle.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.text);
    doc.text(dateTimeLine, marginLeft + spacing.md, y + 5);
    y += 7;
  }

  // Location - Separate line with icon-like prefix
  if (event.map_center_address) {
    doc.setFontSize(fonts.subtitle.size);
    doc.setTextColor(colors.muted);
    doc.text(`Standort: ${event.map_center_address}`, marginLeft + spacing.md, y + 5);
    y += 7;
  }

  y += spacing.lg;

  // Description (if present) - Below the header box
  if (event.description) {
    y += spacing.sm;
    doc.setFontSize(fonts.body.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.text);
    const descLines = doc.splitTextToSize(event.description, contentWidth);
    // Limit to first 4 lines
    const limitedLines = descLines.slice(0, 4);
    doc.text(limitedLines, marginLeft, y);
    y += limitedLines.length * 5;
    if (descLines.length > 4) {
      doc.setTextColor(colors.lightGray);
      doc.text('...', marginLeft, y);
      y += spacing.sm;
    }
  }

  y += spacing.xl;

  return y;
}

/**
 * Section 1: Highlights - Using text markers for PDF compatibility
 */
function renderHighlightsSection(
  doc: jsPDF,
  highlights: Spot[],
  customHighlightTypes: CustomHighlightType[],
  startY: number,
  contentWidth: number
): number {
  let y = startY;
  const { marginLeft, fonts, colors, spacing, pageHeight, marginBottom } = PDF_STYLES;

  // Section header with underline
  doc.setFontSize(fonts.sectionHeader.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary);
  doc.text('Event Highlights', marginLeft, y);
  y += spacing.xs;
  doc.setDrawColor(colors.primary);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, marginLeft + 45, y);
  y += spacing.lg;

  // Highlights list
  for (const highlight of highlights) {
    // Check for page break
    if (y > pageHeight - marginBottom - 20) {
      doc.addPage();
      y = PDF_STYLES.marginTop;
    }

    // Get text marker and label
    const marker = getHighlightMarker(highlight.highlight_type || '');
    const label = highlight.title || getHighlightTypeLabel(highlight.highlight_type || '', customHighlightTypes);

    // Marker + Label line
    doc.setFontSize(fonts.body.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.secondary);
    doc.text(marker, marginLeft, y);
    doc.setTextColor(colors.text);
    doc.text(label, marginLeft + 20, y);
    y += spacing.md;

    // Address
    const address = formatAddressForPrint(highlight);
    if (address && address !== 'Keine Adresse') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fonts.small.size);
      doc.setTextColor(colors.muted);
      doc.text(address, marginLeft + 20, y);
      y += spacing.sm;
    }

    // Note
    if (highlight.public_note) {
      doc.setFontSize(fonts.small.size);
      doc.setTextColor(colors.lightGray);
      const noteText = truncateText(highlight.public_note, 100);
      const noteLines = doc.splitTextToSize(noteText, contentWidth - 25);
      doc.text(noteLines, marginLeft + 20, y);
      y += noteLines.length * 4;
    }

    y += spacing.md;
  }

  // Section separator
  y += spacing.sm;
  doc.setDrawColor(colors.tableBorder);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, y, marginLeft + contentWidth, y);
  y += spacing.lg;

  return y;
}

/**
 * Section 2: Spots & Contact Persons (Table)
 */
function renderSpotsSection(
  doc: jsPDF,
  sortedSpots: Spot[],
  event: TenantEvent,
  startY: number,
  contentWidth: number
): number {
  let y = startY;
  const { marginLeft, fonts, colors, spacing, pageHeight, marginBottom, table } = PDF_STYLES;

  // Get custom terminology
  const spotTermPlural = event.spot_term_plural || 'Spots';

  // Section header with underline
  doc.setFontSize(fonts.sectionHeader.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary);
  doc.text(`${spotTermPlural} & Verantwortliche`, marginLeft, y);
  y += spacing.xs;
  doc.setDrawColor(colors.primary);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, marginLeft + 60, y);
  y += spacing.md;

  // Render table header
  y = renderTableHeader(doc, y, contentWidth);

  // Table rows
  for (let i = 0; i < sortedSpots.length; i++) {
    const spot = sortedSpots[i];
    const spotNumber = i + 1;

    // Check for page break
    if (y > pageHeight - marginBottom - table.rowMinHeight) {
      doc.addPage();
      y = PDF_STYLES.marginTop;
      // Re-render section header and table header on new page
      doc.setFontSize(fonts.sectionHeader.size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.primary);
      doc.text(`${spotTermPlural} & Verantwortliche (Forts.)`, marginLeft, y);
      y += spacing.md;
      y = renderTableHeader(doc, y, contentWidth);
    }

    // Render row with alternating background
    y = renderSpotRow(doc, spot, spotNumber, y, contentWidth, i % 2 === 1);
  }

  return y + spacing.lg;
}

/**
 * Render the table header row
 */
function renderTableHeader(
  doc: jsPDF,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, spacing, table } = PDF_STYLES;
  const { colWidths } = table;

  // Header background
  doc.setFillColor(colors.tableHeader);
  doc.rect(marginLeft, y - 3, contentWidth, table.headerHeight, 'F');

  // Header text
  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text);

  let xPos = marginLeft + spacing.xs;
  doc.text('#', xPos, y + 1);
  xPos += colWidths.number;
  doc.text('Adresse', xPos, y + 1);
  xPos += colWidths.address;
  doc.text('Verantwortlich', xPos, y + 1);
  xPos += colWidths.contact;
  doc.text('Notizen', xPos, y + 1);

  // Header bottom border
  doc.setDrawColor(colors.tableBorder);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, y + spacing.sm, marginLeft + contentWidth, y + spacing.sm);

  return y + spacing.md + spacing.sm;
}

/**
 * Render a single spot row
 */
function renderSpotRow(
  doc: jsPDF,
  spot: Spot,
  number: number,
  y: number,
  contentWidth: number,
  isAlternate: boolean
): number {
  const { marginLeft, fonts, colors, spacing, table } = PDF_STYLES;
  const { colWidths } = table;

  // Alternating row background
  if (isAlternate) {
    doc.setFillColor(colors.tableAlt);
    doc.rect(marginLeft, y - 3, contentWidth, table.rowMinHeight, 'F');
  }

  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text);

  let xPos = marginLeft + spacing.xs;

  // Number - Bold and prominent
  doc.setFont('helvetica', 'bold');
  doc.text(`${number}`, xPos, y);
  doc.setFont('helvetica', 'normal');
  xPos += colWidths.number;

  // Address
  const addressText = truncateText(formatAddressForPrint(spot), 32);
  doc.text(addressText, xPos, y);
  xPos += colWidths.address;

  // Contact info - Stacked
  const contactName = truncateText(spot.contact_name || '-', 28);
  const contactPhone = spot.contact_phone || '-';
  const contactEmail = truncateText(spot.contact_email || '-', 28);

  doc.setFont('helvetica', 'bold');
  doc.text(contactName, xPos, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fonts.tiny.size);
  doc.setTextColor(colors.muted);
  doc.text(`Tel: ${contactPhone}`, xPos, y + 4);
  doc.text(contactEmail, xPos, y + 8);
  doc.setTextColor(colors.text);
  doc.setFontSize(fonts.small.size);
  xPos += colWidths.contact;

  // Notes
  if (spot.public_note || spot.internal_note) {
    doc.setFontSize(fonts.tiny.size);
    if (spot.public_note) {
      doc.text(truncateText(spot.public_note, 40), xPos, y);
    }
    if (spot.internal_note) {
      doc.setTextColor(colors.lightGray);
      doc.text(truncateText(`[i] ${spot.internal_note}`, 40), xPos, y + 4);
      doc.setTextColor(colors.text);
    }
    doc.setFontSize(fonts.small.size);
  }

  // Row separator
  doc.setDrawColor(colors.tableBorder);
  doc.setLineWidth(0.1);
  doc.line(marginLeft, y + table.rowMinHeight - 4, marginLeft + contentWidth, y + table.rowMinHeight - 4);

  return y + table.rowMinHeight;
}

/**
 * Render message when there are no spots
 */
function renderEmptySpotsMessage(
  doc: jsPDF,
  event: TenantEvent,
  startY: number,
  contentWidth: number
): number {
  let y = startY;
  const { marginLeft, fonts, colors, spacing } = PDF_STYLES;

  const spotTermPlural = event.spot_term_plural || 'Spots';

  doc.setFontSize(fonts.sectionHeader.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary);
  doc.text(`${spotTermPlural} & Verantwortliche`, marginLeft, y);
  y += spacing.lg;

  // Empty state box
  doc.setFillColor('#f9fafb');
  doc.roundedRect(marginLeft, y, contentWidth, 25, 2, 2, 'F');

  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.muted);
  doc.text(`Keine ${spotTermPlural} angemeldet.`, marginLeft + spacing.md, y + 10);
  doc.setFontSize(fonts.small.size);
  doc.text(`${spotTermPlural} werden hier aufgelistet, sobald sie registriert sind.`, marginLeft + spacing.md, y + 17);

  return y + 30 + spacing.lg;
}

/**
 * Section 3: Map + Legend
 */
function renderMapSection(
  doc: jsPDF,
  mapImageDataUrl: string,
  sortedSpots: Spot[],
  highlights: Spot[],
  customHighlightTypes: CustomHighlightType[],
  startY: number,
  contentWidth: number
): number {
  let y = startY;
  const { marginLeft, fonts, colors, spacing, map } = PDF_STYLES;

  // Section header with underline
  doc.setFontSize(fonts.sectionHeader.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary);
  doc.text('Kartenansicht', marginLeft, y);
  y += spacing.xs;
  doc.setDrawColor(colors.primary);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, marginLeft + 35, y);
  y += spacing.md;

  // Map image (centered)
  const mapX = marginLeft + (contentWidth - map.width) / 2;

  try {
    // Add border around map
    doc.setDrawColor(colors.tableBorder);
    doc.setLineWidth(0.5);
    doc.rect(mapX - 1, y - 1, map.width + 2, map.height + 2, 'S');
    doc.addImage(mapImageDataUrl, 'PNG', mapX, y, map.width, map.height);
  } catch {
    // If image fails to load, show placeholder
    doc.setFillColor('#f3f4f6');
    doc.rect(mapX, y, map.width, map.height, 'F');
    doc.setTextColor(colors.muted);
    doc.setFontSize(fonts.body.size);
    doc.text('Karte konnte nicht geladen werden', mapX + map.width / 2 - 35, y + map.height / 2);
  }

  y += map.height + spacing.lg;

  // Legend box
  doc.setFillColor('#f8fafc');
  doc.roundedRect(marginLeft, y, contentWidth, highlights.length > 0 ? 50 : 30, 2, 2, 'F');
  y += spacing.md;

  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary);
  doc.text('Legende', marginLeft + spacing.md, y);
  y += spacing.md;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fonts.small.size);
  doc.setTextColor(colors.text);

  // Spots legend
  const spotsWithCoords = sortedSpots.filter(s => s.lat != null && s.lng != null);
  if (spotsWithCoords.length > 0) {
    // Draw sample numbered marker
    doc.setFillColor(colors.primary);
    doc.circle(marginLeft + spacing.md + 4, y - 1, 3, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(7);
    doc.text('1', marginLeft + spacing.md + 2.5, y);
    doc.setTextColor(colors.text);
    doc.setFontSize(fonts.small.size);
    doc.text('Nummerierter Spot (entspricht der Liste oben)', marginLeft + spacing.md + 12, y);
    y += spacing.md;
  }

  // Spots without coordinates note
  const spotsWithoutCoords = sortedSpots.filter(s => s.lat == null || s.lng == null);
  if (spotsWithoutCoords.length > 0) {
    doc.setTextColor(colors.lightGray);
    doc.setFontSize(fonts.tiny.size);
    doc.text(`Hinweis: ${spotsWithoutCoords.length} Spot(s) ohne Koordinaten sind nicht auf der Karte.`, marginLeft + spacing.md, y);
    doc.setFontSize(fonts.small.size);
    y += spacing.sm;
  }

  // Highlights legend
  if (highlights.length > 0) {
    y += spacing.sm;
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Highlights:', marginLeft + spacing.md, y);
    doc.setFont('helvetica', 'normal');
    y += spacing.md;

    // Group highlights by type to avoid duplicates
    const uniqueTypes = new Map<string, { marker: string; label: string }>();
    for (const highlight of highlights) {
      const typeKey = highlight.highlight_type || 'unknown';
      if (!uniqueTypes.has(typeKey)) {
        const marker = getHighlightMarker(typeKey);
        const label = highlight.title || getHighlightTypeLabel(typeKey, customHighlightTypes);
        uniqueTypes.set(typeKey, { marker, label });
      }
    }

    // Render in columns if many types
    let col = 0;
    const colWidth = contentWidth / 2 - spacing.md;
    for (const [, { marker, label }] of uniqueTypes) {
      const xOffset = col * colWidth;
      doc.setTextColor(colors.secondary);
      doc.setFont('helvetica', 'bold');
      doc.text(marker, marginLeft + spacing.md + xOffset, y);
      doc.setTextColor(colors.text);
      doc.setFont('helvetica', 'normal');
      doc.text(label, marginLeft + spacing.md + xOffset + 18, y);

      col++;
      if (col >= 2) {
        col = 0;
        y += spacing.md;
      }
    }
    if (col !== 0) y += spacing.md;
  }

  // Footer with generation date
  y = PDF_STYLES.pageHeight - PDF_STYLES.marginBottom;
  doc.setFontSize(fonts.tiny.size);
  doc.setTextColor(colors.lightGray);
  const genDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Erstellt am ${genDate}`, marginLeft, y);

  // Page indicator
  doc.text('Seite 2/2', marginLeft + contentWidth - 15, y);

  return y;
}

/**
 * Trigger browser download of the PDF blob
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
