import jsPDF from 'jspdf';
import { PDFGeneratorInput } from './types';
import { PDF_STYLES, getContentWidth } from './pdfStyles';
import {
  sortSpotsForPrint,
  formatAddressForPrint,
  formatEventDateRange,
  truncateText,
} from '../../lib/printUtils';
import { getHighlightIcon, getHighlightTypeLabel } from '../../lib/highlightConfig';
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
 * Section 0: Event Header
 */
function renderEventHeader(
  doc: jsPDF,
  event: TenantEvent,
  startY: number,
  contentWidth: number
): number {
  let y = startY;
  const { marginLeft, fonts, colors } = PDF_STYLES;

  // Event title
  doc.setFontSize(fonts.title.size);
  doc.setFont('helvetica', fonts.title.style);
  doc.setTextColor(colors.primary);
  doc.text(event.title, marginLeft, y);
  y += 7;

  // Date and time
  const dateStr = formatEventDateRange(event);
  if (dateStr) {
    doc.setFontSize(fonts.body.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.text);
    doc.text(dateStr, marginLeft, y);
    y += 5;
  }

  // Location (map center address)
  if (event.map_center_address) {
    doc.setFontSize(fonts.body.size);
    doc.setTextColor(colors.lightGray);
    doc.text(`Standort: ${event.map_center_address}`, marginLeft, y);
    doc.setTextColor(colors.text);
    y += 5;
  }

  // Description
  if (event.description) {
    y += 2;
    doc.setFontSize(fonts.body.size);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(event.description, contentWidth);
    // Limit to first 5 lines to avoid taking too much space
    const limitedLines = descLines.slice(0, 5);
    doc.text(limitedLines, marginLeft, y);
    y += limitedLines.length * 4;
    if (descLines.length > 5) {
      doc.setTextColor(colors.lightGray);
      doc.text('...', marginLeft, y);
      doc.setTextColor(colors.text);
      y += 3;
    }
  }

  // Separator line
  y += 3;
  doc.setDrawColor(colors.tableBorder);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, y, marginLeft + contentWidth, y);
  y += PDF_STYLES.sectionSpacing;

  return y;
}

/**
 * Section 1: Highlights
 */
function renderHighlightsSection(
  doc: jsPDF,
  highlights: Spot[],
  customHighlightTypes: CustomHighlightType[],
  startY: number,
  contentWidth: number
): number {
  let y = startY;
  const { marginLeft, fonts, colors, pageHeight, marginBottom } = PDF_STYLES;

  // Section header
  doc.setFontSize(fonts.sectionHeader.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary);
  doc.text('Event Highlights', marginLeft, y);
  y += 6;

  // Highlights list
  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text);

  for (const highlight of highlights) {
    // Check for page break
    if (y > pageHeight - marginBottom - 15) {
      doc.addPage();
      y = PDF_STYLES.marginTop;
    }

    const icon = highlight.highlight_icon || getHighlightIcon(highlight.highlight_type || '', customHighlightTypes);
    const label = highlight.title || getHighlightTypeLabel(highlight.highlight_type || '', customHighlightTypes);

    // Icon + Label (bold)
    doc.setFont('helvetica', 'bold');
    doc.text(`${icon}  ${label}`, marginLeft, y);
    doc.setFont('helvetica', 'normal');
    y += 4;

    // Address
    const address = formatAddressForPrint(highlight);
    if (address && address !== 'Keine Adresse') {
      doc.setFontSize(fonts.small.size);
      doc.setTextColor(colors.lightGray);
      doc.text(`    ${address}`, marginLeft, y);
      doc.setTextColor(colors.text);
      doc.setFontSize(fonts.body.size);
      y += 3.5;
    }

    // Note
    if (highlight.public_note) {
      doc.setFontSize(fonts.small.size);
      doc.setTextColor(colors.lightGray);
      const noteText = truncateText(highlight.public_note, 120);
      const noteLines = doc.splitTextToSize(`    ${noteText}`, contentWidth - 10);
      doc.text(noteLines, marginLeft, y);
      doc.setTextColor(colors.text);
      doc.setFontSize(fonts.body.size);
      y += noteLines.length * 3;
    }

    y += 2;
  }

  // Separator line
  y += 2;
  doc.setDrawColor(colors.tableBorder);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, y, marginLeft + contentWidth, y);
  y += PDF_STYLES.sectionSpacing;

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
  const { marginLeft, fonts, colors, pageHeight, marginBottom, table } = PDF_STYLES;

  // Get custom terminology
  const spotTermPlural = event.spot_term_plural || 'Spots';

  // Section header
  doc.setFontSize(fonts.sectionHeader.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary);
  doc.text(`${spotTermPlural} & Verantwortliche`, marginLeft, y);
  y += 6;

  // Render table header
  y = renderTableHeader(doc, y, contentWidth);

  // Table rows
  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text);

  for (let i = 0; i < sortedSpots.length; i++) {
    const spot = sortedSpots[i];
    const spotNumber = i + 1;

    // Check for page break (need enough space for at least one row)
    if (y > pageHeight - marginBottom - table.rowMinHeight) {
      doc.addPage();
      y = PDF_STYLES.marginTop;
      // Re-render table header on new page
      doc.setFontSize(fonts.sectionHeader.size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.primary);
      doc.text(`${spotTermPlural} & Verantwortliche (Fortsetzung)`, marginLeft, y);
      y += 6;
      y = renderTableHeader(doc, y, contentWidth);
      doc.setFontSize(fonts.small.size);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text);
    }

    // Render row
    y = renderSpotRow(doc, spot, spotNumber, y, contentWidth);
  }

  return y + PDF_STYLES.sectionSpacing;
}

/**
 * Render the table header row
 */
function renderTableHeader(
  doc: jsPDF,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, table } = PDF_STYLES;
  const { colWidths } = table;

  // Header background
  doc.setFillColor(colors.tableHeader);
  doc.rect(marginLeft, y - 4, contentWidth, table.headerHeight, 'F');

  // Header text
  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text);

  let xPos = marginLeft + 2;
  doc.text('#', xPos, y);
  xPos += colWidths.number;
  doc.text('Adresse', xPos, y);
  xPos += colWidths.address;
  doc.text('Verantwortlich', xPos, y);
  xPos += colWidths.contact;
  doc.text('Notizen', xPos, y);

  // Header bottom border
  doc.setDrawColor(colors.tableBorder);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, y + 2, marginLeft + contentWidth, y + 2);

  return y + 5;
}

/**
 * Render a single spot row
 */
function renderSpotRow(
  doc: jsPDF,
  spot: Spot,
  number: number,
  y: number,
  contentWidth: number
): number {
  const { marginLeft, fonts, colors, table } = PDF_STYLES;
  const { colWidths } = table;

  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'normal');

  let xPos = marginLeft + 2;

  // Number
  doc.setFont('helvetica', 'bold');
  doc.text(`${number}`, xPos, y);
  doc.setFont('helvetica', 'normal');
  xPos += colWidths.number;

  // Address
  const addressText = truncateText(formatAddressForPrint(spot), 35);
  doc.text(addressText, xPos, y);
  xPos += colWidths.address;

  // Contact info
  const contactName = spot.contact_name || '-';
  const contactPhone = spot.contact_phone || '-';
  const contactEmail = truncateText(spot.contact_email || '-', 30);

  doc.text(truncateText(contactName, 30), xPos, y);
  doc.setTextColor(colors.lightGray);
  doc.text(`Tel: ${contactPhone}`, xPos, y + 3.5);
  doc.text(contactEmail, xPos, y + 7);
  doc.setTextColor(colors.text);
  xPos += colWidths.contact;

  // Notes (public + internal)
  const noteY = y;
  if (spot.public_note) {
    doc.setFontSize(fonts.tiny.size);
    const publicNote = truncateText(spot.public_note, 45);
    doc.text(publicNote, xPos, noteY);
  }
  if (spot.internal_note) {
    doc.setFontSize(fonts.tiny.size);
    doc.setTextColor(colors.lightGray);
    const internalNote = truncateText(`[Intern] ${spot.internal_note}`, 45);
    doc.text(internalNote, xPos, noteY + 3.5);
    doc.setTextColor(colors.text);
  }
  doc.setFontSize(fonts.small.size);

  // Row separator
  const rowHeight = table.rowMinHeight;
  doc.setDrawColor(colors.tableBorder);
  doc.setLineWidth(0.1);
  doc.line(marginLeft, y + rowHeight - 3, marginLeft + contentWidth, y + rowHeight - 3);

  return y + rowHeight;
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
  const { marginLeft, fonts, colors } = PDF_STYLES;

  const spotTermPlural = event.spot_term_plural || 'Spots';

  doc.setFontSize(fonts.sectionHeader.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary);
  doc.text(`${spotTermPlural} & Verantwortliche`, marginLeft, y);
  y += 8;

  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.lightGray);
  doc.text(`Dieses Event hat noch keine angemeldeten ${spotTermPlural}.`, marginLeft, y);
  y += 5;
  doc.text(`Sobald ${spotTermPlural} angemeldet werden, werden sie hier aufgelistet.`, marginLeft, y);
  doc.setTextColor(colors.text);

  return y + PDF_STYLES.sectionSpacing;
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
  const { marginLeft, fonts, colors, map } = PDF_STYLES;

  // Section header
  doc.setFontSize(fonts.sectionHeader.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary);
  doc.text('Karte', marginLeft, y);
  y += 6;

  // Map image (centered)
  const mapX = marginLeft + (contentWidth - map.width) / 2;

  try {
    doc.addImage(mapImageDataUrl, 'PNG', mapX, y, map.width, map.height);
  } catch (error) {
    // If image fails to load, show placeholder
    doc.setFillColor('#f3f4f6');
    doc.rect(mapX, y, map.width, map.height, 'F');
    doc.setTextColor(colors.lightGray);
    doc.setFontSize(fonts.body.size);
    doc.text('Karte konnte nicht geladen werden', mapX + map.width / 2 - 30, y + map.height / 2);
    doc.setTextColor(colors.text);
  }

  y += map.height + 8;

  // Legend
  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary);
  doc.text('Legende:', marginLeft, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fonts.small.size);
  doc.setTextColor(colors.text);

  // Spots legend
  const spotsWithCoords = sortedSpots.filter(s => s.lat != null && s.lng != null);
  if (spotsWithCoords.length > 0) {
    // Draw sample numbered marker
    doc.setFillColor(colors.primary);
    doc.circle(marginLeft + 3, y - 1, 2.5, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(6);
    doc.text('1', marginLeft + 2, y);
    doc.setTextColor(colors.text);
    doc.setFontSize(fonts.small.size);
    doc.text('= Spot (Nummer entspricht der Liste)', marginLeft + 8, y);
    y += 5;
  }

  // Spots without coordinates note
  const spotsWithoutCoords = sortedSpots.filter(s => s.lat == null || s.lng == null);
  if (spotsWithoutCoords.length > 0) {
    doc.setTextColor(colors.lightGray);
    doc.text(`(${spotsWithoutCoords.length} Spot(s) ohne Koordinaten - nicht auf Karte)`, marginLeft + 8, y);
    doc.setTextColor(colors.text);
    y += 5;
  }

  // Highlights legend
  if (highlights.length > 0) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Highlights:', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    y += 4;

    // Group highlights by type to avoid duplicates in legend
    const uniqueTypes = new Map<string, { icon: string; label: string }>();
    for (const highlight of highlights) {
      const typeKey = highlight.highlight_type || 'unknown';
      if (!uniqueTypes.has(typeKey)) {
        const icon = highlight.highlight_icon || getHighlightIcon(typeKey, customHighlightTypes);
        const label = highlight.title || getHighlightTypeLabel(typeKey, customHighlightTypes);
        uniqueTypes.set(typeKey, { icon, label });
      }
    }

    for (const [, { icon, label }] of uniqueTypes) {
      doc.text(`${icon} = ${label}`, marginLeft + 5, y);
      y += 4;
    }
  }

  // Footer with generation date
  y = PDF_STYLES.pageHeight - PDF_STYLES.marginBottom - 5;
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
