/**
 * Generate a URL-safe slug from a name.
 * Handles German umlauts: Ä->AE, Ö->OE, Ü->UE, ß->ss
 */
export function generateSlug(name: string): string {
  return name
    // Lowercase first
    .toLowerCase()
    // Then replace German umlauts (now all lowercase)
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    // Clean up non-alphanumeric characters
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
