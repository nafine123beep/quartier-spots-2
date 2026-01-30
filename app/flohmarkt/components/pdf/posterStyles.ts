import { SHARED_PRINT_STYLES } from './sharedPrintStyles';

/**
 * PDF layout constants for the promotional event poster (A4 portrait).
 * All measurements in millimeters.
 *
 * Design principles:
 * - Large typography readable from 1–2 meters
 * - High contrast for print
 * - Generous whitespace for visual impact
 * - Single-page layout optimized for conversion (QR code + CTA)
 */
export const POSTER_STYLES = {
  // Inherit shared print styles
  ...SHARED_PRINT_STYLES,

  // Page settings (A4: 210mm x 297mm)
  pageWidth: 210,
  pageHeight: 297,
  marginTop: 15,
  marginBottom: 15,
  marginLeft: 15,
  marginRight: 15,

  // Typography (sizes in points) — large for poster readability
  fonts: {
    title: { size: 36, style: 'bold' as const },
    subtitle: { size: 16, style: 'bold' as const },
    body: { size: 12, style: 'normal' as const },
    cta: { size: 14, style: 'bold' as const },
    small: { size: 10, style: 'normal' as const },
  },

  // Spacing (mm)
  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 18,
  },

  // Cover image constraints
  image: {
    maxWidth: 180,
    maxHeight: 90,
  },

  // QR code size (mm) — large enough to scan from a printed poster
  qrCode: {
    size: 45,
  },
} as const;

/**
 * Default promotional text used when event has no description
 */
export const DEFAULT_POSTER_DESCRIPTION = `Hausanwohner*innen verkaufen in ihrem eigenen Hof, Garten oder ihrer Garage – und das ganze Quartier macht mit.

Ein Mitmach-Projekt für Nachbarschaft, Nachhaltigkeit und gelebte Quartierliebe.`;

/**
 * Minimum description length to avoid using fallback (in characters)
 */
export const MIN_DESCRIPTION_LENGTH = 30;

/**
 * Calculate content width based on margins
 */
export function getPosterContentWidth(): number {
  return POSTER_STYLES.pageWidth - POSTER_STYLES.marginLeft - POSTER_STYLES.marginRight;
}
