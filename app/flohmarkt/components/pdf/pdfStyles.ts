/**
 * PDF layout constants for A4 portrait format.
 * All measurements in millimeters.
 */
export const PDF_STYLES = {
  // Page settings (A4: 210mm x 297mm)
  pageWidth: 210,
  pageHeight: 297,
  marginTop: 15,
  marginBottom: 15,
  marginLeft: 15,
  marginRight: 15,

  // Typography (sizes in points)
  fonts: {
    title: { size: 16, style: 'bold' as const },
    sectionHeader: { size: 12, style: 'bold' as const },
    body: { size: 9, style: 'normal' as const },
    small: { size: 8, style: 'normal' as const },
    tiny: { size: 7, style: 'normal' as const },
  },

  // Colors (hex)
  colors: {
    primary: '#003366',
    text: '#1f2937',
    lightGray: '#6b7280',
    tableHeader: '#f3f4f6',
    tableBorder: '#d1d5db',
    highlight: '#FFC107',
  },

  // Layout spacing (mm)
  lineHeight: 1.3,
  sectionSpacing: 8,
  paragraphSpacing: 4,

  // Table dimensions (mm)
  table: {
    rowMinHeight: 14,
    headerHeight: 7,
    colWidths: {
      number: 8,
      address: 45,
      contact: 55,
      notes: 72,
    },
  },

  // Map dimensions (mm)
  map: {
    width: 180,
    height: 110,
  },
} as const;

/**
 * Calculate content width based on margins
 */
export function getContentWidth(): number {
  return PDF_STYLES.pageWidth - PDF_STYLES.marginLeft - PDF_STYLES.marginRight;
}

/**
 * Calculate usable page height (excluding margins)
 */
export function getUsableHeight(): number {
  return PDF_STYLES.pageHeight - PDF_STYLES.marginTop - PDF_STYLES.marginBottom;
}
