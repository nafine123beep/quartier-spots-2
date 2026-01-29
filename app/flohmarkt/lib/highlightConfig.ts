import { HighlightTypeDefinition, CustomHighlightType } from '../types';

/**
 * Base highlight types predefined in the system
 * These are the standard infrastructure points available for all events
 *
 * NOTE: Icon values are now icon names (e.g., 'clipboard-list') instead of emojis.
 * The iconResolver utility handles conversion to Lucide components.
 */
export const BASE_HIGHLIGHT_TYPES: HighlightTypeDefinition[] = [
  { key: 'registration', label: 'Registration / Check-in', icon: 'clipboard-list' },
  { key: 'toilets', label: 'Toilets', icon: 'door-open' },
  { key: 'food_drinks', label: 'Food & Drinks', icon: 'utensils' },
  { key: 'start', label: 'Start', icon: 'flag' },
  { key: 'finish', label: 'Finish', icon: 'flag-triangle-right' },
  { key: 'awareness_team', label: 'Awareness Team', icon: 'shield-check' },
  { key: 'info_point', label: 'Info Point', icon: 'info' },
  { key: 'parking', label: 'Parking', icon: 'circle-parking' },
];

/**
 * Available icons for custom highlight types
 * Organized by category: Info, Star, and Pin variants with color options
 *
 * NOTE: Values are now icon names instead of emojis for better compatibility.
 */
export const AVAILABLE_HIGHLIGHT_ICONS = [
  // Info variant
  'info',       // Info (blue)
  // Star variants
  'star',       // Star
  'sparkles',   // Sparkles/glowing
  // Pin/Location variants with colors
  'map-pin',    // Map pin (red)
  'circle-red',     // Red circle
  'circle-orange',  // Orange circle
  'circle-yellow',  // Yellow circle
  'circle-green',   // Green circle
  'circle-blue',    // Blue circle
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
 * Get the icon value for a highlight type
 * Searches base types first, then custom types, falls back to default icon
 *
 * NOTE: Returns icon name (e.g., 'clipboard-list') or emoji for backward compatibility.
 * Use iconResolver.resolveIcon() to convert to Lucide component.
 *
 * @param typeKey - The highlight type key (e.g., 'registration', 'toilets')
 * @param customTypes - Array of custom highlight types for the current event
 * @returns The icon value (icon name or emoji) for the type
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
  return 'map-pin';
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
