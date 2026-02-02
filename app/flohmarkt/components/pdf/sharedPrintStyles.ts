/**
 * Shared print styles and constants for both A4 posters and A6 flyers.
 * These values ensure visual consistency across all print materials.
 *
 * All measurements in millimeters unless otherwise specified.
 */
export const SHARED_PRINT_STYLES = {
  // Color palette — high contrast for print clarity
  colors: {
    primary: '#003366',      // Dark blue for headings, QR codes
    text: '#000000',         // Black for body text
    muted: '#4b5563',        // Gray for secondary text
    lightGray: '#9ca3af',    // Light gray for borders/backgrounds
    accent: '#FFCC00',       // Yellow accent (reserved for highlights)
    background: '#f8fafc',   // Light background (used sparingly)
    qrBlockBg: '#f0f4f8',    // Light background for QR action block (A6 flyer)
  },

  // Base font family
  fontFamily: 'helvetica',   // Universal font available in jsPDF
} as const;
