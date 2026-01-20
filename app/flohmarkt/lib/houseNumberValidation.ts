/**
 * House number validation utilities for German address formats
 */

export interface HouseNumberValidation {
  isValid: boolean;
  errorMessage?: string;
  normalizedValue?: string;
}

/**
 * Validates German house number formats
 *
 * Accepts:
 * - Simple numbers: 42, 123
 * - Numbers with letter suffix: 42a, 42A, 123b
 * - Ranges: 42-44, 42-44a
 * - Fractions: 42/1, 42/2
 * - Combined: 42a-44, 42-44b
 *
 * Rejects:
 * - Special characters (except - and /)
 * - Only letters
 * - Leading/trailing special chars
 */
export function validateHouseNumber(value: string): HouseNumberValidation {
  // Empty values are allowed (field is optional)
  if (!value || value.trim() === '') {
    return {
      isValid: true,
      normalizedValue: '',
    };
  }

  const trimmed = value.trim();

  // Check for only whitespace
  if (trimmed.length === 0) {
    return {
      isValid: true,
      normalizedValue: '',
    };
  }

  // Must start with a number
  if (!/^\d/.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Hausnummer muss mit einer Zahl beginnen',
    };
  }

  // Valid German house number patterns:
  // - Simple number: 42
  // - Number with letter: 42a, 42A
  // - Range: 42-44, 42-44a
  // - Fraction: 42/1, 42/2
  // - Combined: 42a-44, 42-44b, 42a/1
  const validPatterns = [
    /^\d+$/,                           // Simple number: 42
    /^\d+\s*[a-zA-Z]$/,               // Number with letter: 42a, 42 a
    /^\d+[a-zA-Z]?-\d+[a-zA-Z]?$/,   // Range: 42-44, 42a-44, 42-44b, 42a-44b
    /^\d+[a-zA-Z]?\/\d+[a-zA-Z]?$/,  // Fraction: 42/1, 42a/1, 42/1a
  ];

  const isValidFormat = validPatterns.some(pattern => pattern.test(trimmed));

  if (!isValidFormat) {
    // Check if it contains invalid characters
    if (/[^0-9a-zA-Z\s\-\/]/.test(trimmed)) {
      return {
        isValid: false,
        errorMessage: 'Hausnummer enthält ungültige Zeichen',
      };
    }

    // Check if it's only letters
    if (/^[a-zA-Z\s]+$/.test(trimmed)) {
      return {
        isValid: false,
        errorMessage: 'Hausnummer muss mit einer Zahl beginnen',
      };
    }

    // Generic invalid format message
    return {
      isValid: false,
      errorMessage: 'Ungültiges Format (z.B. 42, 42a, 42-44)',
    };
  }

  return {
    isValid: true,
    normalizedValue: trimmed,
  };
}

/**
 * Checks if the house number is in a partial/incomplete state during typing
 * This allows for temporary invalid states while the user is still typing
 *
 * Examples of partial states:
 * - "42-" (typing a range)
 * - "42/" (typing a fraction)
 * - "42 " (space before letter)
 */
export function isPartialHouseNumber(value: string): boolean {
  if (!value || value.trim() === '') {
    return false;
  }

  const trimmed = value.trim();

  // Ends with a dash or slash (incomplete range/fraction)
  if (/[\-\/]$/.test(trimmed)) {
    return true;
  }

  // Number followed by space (might be adding a letter)
  if (/^\d+\s+$/.test(trimmed)) {
    return true;
  }

  return false;
}
