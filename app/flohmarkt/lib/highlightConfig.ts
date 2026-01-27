import { HighlightTypeDefinition, CustomHighlightType } from '../types';

/**
 * Base highlight types predefined in the system
 * These are the standard infrastructure points available for all events
 */
export const BASE_HIGHLIGHT_TYPES: HighlightTypeDefinition[] = [
  { key: 'registration', label: 'Registration / Check-in', icon: '📋' },
  { key: 'toilets', label: 'Toilets', icon: '🚻' },
  { key: 'food_drinks', label: 'Food & Drinks', icon: '🍽️' },
  { key: 'start', label: 'Start', icon: '🚩' },
  { key: 'finish', label: 'Finish', icon: '🏁' },
  { key: 'awareness_team', label: 'Awareness Team', icon: '🛡️' },
  { key: 'info_point', label: 'Info Point', icon: 'ℹ️' },
  { key: 'parking', label: 'Parking', icon: '🅿️' },
];

/**
 * Available emoji icons for highlight types
 * Organizers can choose from these when creating custom highlight types
 */
export const AVAILABLE_HIGHLIGHT_ICONS = [
  '📋', // Registration
  '🚻', // Toilets
  '🍽️', // Food & Drinks
  '🚩', // Start
  '🏁', // Finish
  '🛡️', // Awareness Team
  'ℹ️', // Info Point
  '🅿️', // Parking
  '⚕️', // Medical
  '📍', // Custom/General
];

/**
 * Get the display label for a highlight type
 * Searches base types first, then custom types, falls back to the key itself
 *
 * @param typeKey - The highlight type key (e.g., 'registration', 'toilets')
 * @param customTypes - Array of custom highlight types for the current event
 * @returns The display label for the type
 */
export function getHighlightTypeLabel(
  typeKey: string,
  customTypes: CustomHighlightType[]
): string {
  // Check base types first (they take precedence)
  const baseType = BASE_HIGHLIGHT_TYPES.find(t => t.key === typeKey);
  if (baseType) return baseType.label;

  // Check custom types (CustomHighlightType has type_key instead of key)
  const customType = customTypes.find(t => t.type_key === typeKey);
  if (customType) return customType.label;

  // Fallback to the key itself if not found
  return typeKey;
}

/**
 * Get the emoji icon for a highlight type
 * Searches base types first, then custom types, falls back to default icon
 *
 * @param typeKey - The highlight type key (e.g., 'registration', 'toilets')
 * @param customTypes - Array of custom highlight types for the current event
 * @returns The emoji icon for the type
 */
export function getHighlightIcon(
  typeKey: string,
  customTypes: CustomHighlightType[]
): string {
  // Check base types first (they take precedence)
  const baseType = BASE_HIGHLIGHT_TYPES.find(t => t.key === typeKey);
  if (baseType) return baseType.icon;

  // Check custom types (CustomHighlightType has type_key instead of key)
  const customType = customTypes.find(t => t.type_key === typeKey);
  if (customType) return customType.icon;

  // Fallback to default icon if not found
  return '📍';
}

/**
 * Get all available highlight types (base + custom)
 *
 * @param customTypes - Array of custom highlight types for the current event
 * @returns Combined array of base and custom highlight types
 */
export function getAllHighlightTypes(
  customTypes: CustomHighlightType[]
): HighlightTypeDefinition[] {
  // Convert CustomHighlightType to HighlightTypeDefinition format
  const convertedCustomTypes: HighlightTypeDefinition[] = customTypes.map(ct => ({
    key: ct.type_key,
    label: ct.label,
    icon: ct.icon,
  }));

  return [...BASE_HIGHLIGHT_TYPES, ...convertedCustomTypes];
}
