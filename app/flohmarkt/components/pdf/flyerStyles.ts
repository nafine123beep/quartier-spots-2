import { SHARED_PRINT_STYLES } from './sharedPrintStyles';

/**
 * PDF layout constants for the A6 flyer (redesigned distinct layout).
 * All measurements in millimeters.
 *
 * Design principles:
 * - Distinct A6 layout (NOT a scaled A4)
 * - Strong visual hierarchy with dominant title
 * - Boxed QR action block for clear CTA
 * - No text truncation - full description displayed
 * - Compact but readable
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

  // Typography (sizes in points) — strong hierarchy for A6
  fonts: {
    title: { size: 24, style: 'bold' as const },      // INCREASED: dominant title (was 18pt)
    subtitle: { size: 9, style: 'normal' as const },  // Compact metadata
    body: { size: 9, style: 'normal' as const },      // Description text
    cta: { size: 10, style: 'bold' as const },        // CTA text
    small: { size: 8, style: 'normal' as const },     // Footer text
  },

  // Spacing (mm) — tighter than A4
  spacing: {
    xs: 1,
    sm: 2,
    md: 4,
    lg: 6,
    xl: 8,
  },

  // Cover image constraints — banner style header
  image: {
    maxWidth: 132,   // Full content width
    maxHeight: 30,   // Reduced height for banner style
  },

  // QR code size (mm) — REDUCED for better proportions
  qrCode: {
    size: 28,   // Was 40mm, now more proportional to A6
  },

  // QR action block settings (boxed unit)
  qrBlock: {
    padding: 4,        // 4mm padding all sides
    borderRadius: 2,   // Slight rounding
  },
} as const;

/**
 * Calculate content width based on margins
 */
export function getFlyerContentWidth(): number {
  return FLYER_STYLES.pageWidth - FLYER_STYLES.marginLeft - FLYER_STYLES.marginRight;
}
