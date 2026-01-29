/**
 * PDF layout constants for A4 portrait format.
 * All measurements in millimeters.
 *
 * Design principles:
 * - Consistent vertical rhythm with standardized spacing
 * - Clear visual hierarchy with distinct font sizes
 * - Black & white friendly for printing
 */
export const PDF_STYLES = {
  // Page settings (A4: 210mm x 297mm)
  pageWidth: 210,
  pageHeight: 297,
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,

  // Typography (sizes in points) - Clear hierarchy
  fonts: {
    title: { size: 22, style: 'bold' as const },        // Event title - prominent
    subtitle: { size: 12, style: 'normal' as const },   // Date, location
    sectionHeader: { size: 14, style: 'bold' as const }, // Section titles
    body: { size: 10, style: 'normal' as const },       // Main content
    small: { size: 9, style: 'normal' as const },       // Table content
    tiny: { size: 8, style: 'normal' as const },        // Footnotes, notes
  },

  // Colors (hex) - High contrast for print
  colors: {
    primary: '#003366',      // Dark blue - headers, emphasis
    secondary: '#1a5490',    // Lighter blue - subheaders
    text: '#000000',         // Pure black for body text
    muted: '#4b5563',        // Gray for secondary text
    lightGray: '#9ca3af',    // Light gray for hints
    tableHeader: '#e5e7eb',  // Table header background
    tableBorder: '#d1d5db',  // Table borders
    tableAlt: '#f9fafb',     // Alternating row background
    highlight: '#fbbf24',    // Yellow for highlights
  },

  // Standardized spacing (mm) - Consistent vertical rhythm
  spacing: {
    xs: 2,      // Minimal spacing
    sm: 4,      // Small gap
    md: 6,      // Medium gap
    lg: 10,     // Large gap (between sections)
    xl: 14,     // Extra large (major sections)
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Table dimensions (mm) - Optimized for A4
  table: {
    rowMinHeight: 16,
    headerHeight: 8,
    colWidths: {
      number: 10,
      address: 48,
      contact: 52,
      notes: 60,
    },
  },

  // Map dimensions (mm) - Larger for better visibility
  map: {
    width: 170,
    height: 120,
  },

  // Highlight type markers (simple text symbols for PDF compatibility)
  // jsPDF doesn't support emojis with default fonts
  highlightMarkers: {
    registration: '[R]',
    toilets: '[WC]',
    food_drinks: '[F&D]',
    start: '[START]',
    finish: '[FINISH]',
    awareness_team: '[HELP]',
    info_point: '[i]',
    parking: '[P]',
    default: '[*]',
  } as Record<string, string>,
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

/**
 * Get a simple text marker for highlight type (PDF-safe, no emojis)
 */
export function getHighlightMarker(typeKey: string): string {
  return PDF_STYLES.highlightMarkers[typeKey] || PDF_STYLES.highlightMarkers.default;
}
