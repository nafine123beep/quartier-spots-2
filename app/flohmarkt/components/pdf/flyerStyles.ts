import { SHARED_PRINT_STYLES } from './sharedPrintStyles';

/**
 * PDF layout constants for the A6 flyer (compact format).
 * All measurements in millimeters.
 *
 * Design principles:
 * - Compact layout for handouts (cafés, counters, doors)
 * - High information density without clutter
 * - Quick scan, minimal reading
 * - Banner-style header image
 * - Smaller fonts but still readable
 */
export const FLYER_STYLES = {
  // Inherit shared print styles
  ...SHARED_PRINT_STYLES,

  // Page settings (A6 portrait: 148mm x 105mm)
  pageWidth: 148,
  pageHeight: 105,
  marginTop: 8,
  marginBottom: 8,
  marginLeft: 8,
  marginRight: 8,

  // Typography (sizes in points) — smaller than A4 for compact layout
  fonts: {
    title: { size: 18, style: 'bold' as const },      // Half of A4 (36pt → 18pt)
    subtitle: { size: 10, style: 'bold' as const },   // Smaller than A4 (16pt → 10pt)
    body: { size: 9, style: 'normal' as const },      // Smaller than A4 (12pt → 9pt)
    cta: { size: 10, style: 'bold' as const },        // Smaller than A4 (14pt → 10pt)
    small: { size: 8, style: 'normal' as const },     // Smaller than A4 (10pt → 8pt)
  },

  // Spacing (mm) — tighter than A4
  spacing: {
    xs: 1,   // A4: 2mm
    sm: 2,   // A4: 4mm
    md: 4,   // A4: 8mm
    lg: 6,   // A4: 12mm
    xl: 8,   // A4: 18mm
  },

  // Cover image constraints — banner style for compact header
  image: {
    maxWidth: 140,   // Almost full width (148mm - 8mm margins)
    maxHeight: 35,   // Banner aspect ratio (4:1)
  },

  // QR code size (mm) — slightly smaller than A4 but still scannable
  qrCode: {
    size: 40,   // A4: 45mm
  },
} as const;

/**
 * Calculate content width based on margins
 */
export function getFlyerContentWidth(): number {
  return FLYER_STYLES.pageWidth - FLYER_STYLES.marginLeft - FLYER_STYLES.marginRight;
}
