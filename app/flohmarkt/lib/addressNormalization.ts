/**
 * Address normalization utilities for consistent data storage
 */

/**
 * Normalize street name to standard format
 * - Converts "strasse"/"str."/"str" to "straße"
 * - Converts "Str."/"Str" to "Straße"
 * - Applies proper capitalization
 */
export function normalizeStreetName(street: string): string {
  if (!street) return street;

  let normalized = street.trim();

  // Replace common abbreviations and variations
  // Case-insensitive replacements for street suffixes
  normalized = normalized.replace(/\bstr\.?\s*$/i, 'straße');
  normalized = normalized.replace(/\bstrasse\b/gi, 'straße');

  // Capitalize first letter of each word
  normalized = normalized
    .split(' ')
    .map(word => {
      if (!word) return word;
      // Keep "straße" lowercase if it's not at the start
      if (word.toLowerCase() === 'straße') {
        return 'straße';
      }
      // Capitalize first letter, keep rest as-is to preserve "straße"
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  // Special case: if the whole street ends with "straße", capitalize it properly
  // E.g., "Hauptstraße" should have capital S
  if (normalized.toLowerCase().endsWith('straße')) {
    const parts = normalized.split(/\s+/);
    const lastPart = parts[parts.length - 1];
    if (lastPart.toLowerCase() === 'straße') {
      parts[parts.length - 1] = 'Straße';
      normalized = parts.join(' ');
    }
  }

  return normalized;
}

/**
 * Normalize city name
 * - Capitalizes first letter of each word
 * - Handles common German city name patterns
 */
export function normalizeCityName(city: string): string {
  if (!city) return city;

  let normalized = city.trim();

  // Capitalize first letter of each word
  normalized = normalized
    .split(' ')
    .map(word => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return normalized;
}

/**
 * Normalize ZIP code
 * - Removes spaces and non-numeric characters
 * - Ensures 5-digit format for German PLZ
 */
export function normalizeZip(zip: string): string {
  if (!zip) return zip;

  // Remove all non-numeric characters
  const cleaned = zip.replace(/\D/g, '');

  // German ZIP codes are 5 digits
  // Pad with leading zeros if needed (unlikely but safe)
  if (cleaned.length > 0 && cleaned.length <= 5) {
    return cleaned.padStart(5, '0');
  }

  return cleaned;
}

/**
 * Normalize house number
 * - Removes extra spaces
 * - Standardizes format (e.g., "42 a" -> "42a")
 * - Handles ranges and fractions (e.g., "42 - 44" -> "42-44", "42 / 1" -> "42/1")
 */
export function normalizeHouseNumber(houseNumber: string): string {
  if (!houseNumber) return houseNumber;

  let normalized = houseNumber.trim();

  // Remove spaces between number and letter (e.g., "42 a" -> "42a")
  normalized = normalized.replace(/(\d)\s+([a-zA-Z])/g, '$1$2');

  // Remove spaces around dashes in ranges (e.g., "42 - 44" -> "42-44")
  normalized = normalized.replace(/\s*-\s*/g, '-');

  // Remove spaces around slashes in fractions (e.g., "42 / 1" -> "42/1")
  normalized = normalized.replace(/\s*\/\s*/g, '/');

  // Capitalize letter suffixes
  // Handle single letter at end: 42a -> 42A
  normalized = normalized.replace(/([a-z])$/i, (match) => match.toUpperCase());
  // Handle letters before dash in ranges: 42a-44 -> 42A-44
  normalized = normalized.replace(/([a-z])(-)/gi, (match, letter, dash) => letter.toUpperCase() + dash);
  // Handle letters before slash in fractions: 42a/1 -> 42A/1
  normalized = normalized.replace(/([a-z])(\/)/gi, (match, letter, slash) => letter.toUpperCase() + slash);

  return normalized;
}

/**
 * Comprehensive address normalization
 * Returns normalized address components
 */
export interface NormalizedAddress {
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
}

export function normalizeAddress(
  street: string,
  houseNumber: string,
  zip: string,
  city: string
): NormalizedAddress {
  return {
    street: normalizeStreetName(street),
    houseNumber: normalizeHouseNumber(houseNumber),
    zip: normalizeZip(zip),
    city: normalizeCityName(city),
  };
}
