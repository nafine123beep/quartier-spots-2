/**
 * Icon Resolver Utility
 *
 * Resolves icon identifiers (icon names or emojis) to Lucide React components.
 * Supports backward compatibility with emoji strings during migration.
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ClipboardList,
  DoorOpen,
  Utensils,
  Flag,
  FlagTriangleRight,
  ShieldCheck,
  Info,
  CircleParking,
  Star,
  Sparkles,
  Circle,
  MapPin,
} from '@/app/flohmarkt/components/icons';

/**
 * Map of icon names to Lucide components
 */
const ICON_MAP: Record<string, LucideIcon> = {
  // Base highlight types
  'clipboard-list': ClipboardList,
  'door-open': DoorOpen,
  'utensils': Utensils,
  'flag': Flag,
  'flag-triangle-right': FlagTriangleRight,
  'shield-check': ShieldCheck,
  'info': Info,
  'circle-parking': CircleParking,

  // Custom highlight variants
  'star': Star,
  'sparkles': Sparkles,
  'circle': Circle,
  'map-pin': MapPin,

  // Colored circle variants
  'circle-red': Circle,
  'circle-orange': Circle,
  'circle-yellow': Circle,
  'circle-green': Circle,
  'circle-blue': Circle,
};

/**
 * Map of emoji characters to icon names (backward compatibility)
 */
const EMOJI_TO_ICON_NAME: Record<string, string> = {
  '📋': 'clipboard-list',
  '🚻': 'door-open',
  '🍽️': 'utensils',
  '🚩': 'flag',
  '🏁': 'flag-triangle-right',
  '🛡️': 'shield-check',
  'ℹ️': 'info',
  '🅿️': 'circle-parking',
  '⭐': 'star',
  '🌟': 'sparkles',
  '✨': 'sparkles',
  '📍': 'map-pin',
  '🔴': 'circle',
  '🟠': 'circle',
  '🟡': 'circle',
  '🟢': 'circle',
  '🔵': 'circle',
};

/**
 * Resolve an icon value to a Lucide component
 *
 * @param iconValue - Icon name (e.g., 'clipboard-list') or emoji (e.g., '📋')
 * @returns The corresponding Lucide icon component, or MapPin as fallback
 */
export function resolveIcon(iconValue: string): LucideIcon {
  // Try direct icon name lookup
  if (ICON_MAP[iconValue]) {
    return ICON_MAP[iconValue];
  }

  // Try emoji to icon name conversion (backward compatibility)
  const iconName = EMOJI_TO_ICON_NAME[iconValue];
  if (iconName && ICON_MAP[iconName]) {
    return ICON_MAP[iconName];
  }

  // Fallback to MapPin
  return MapPin;
}

/**
 * Convert emoji to icon name for database storage
 *
 * @param emoji - Emoji character
 * @returns Icon name string, or the emoji itself if not mapped
 */
export function emojiToIconName(emoji: string): string {
  return EMOJI_TO_ICON_NAME[emoji] || emoji;
}

/**
 * Get the icon name for a given emoji or icon name
 * (useful for ensuring consistency in database storage)
 *
 * @param value - Emoji or icon name
 * @returns Normalized icon name
 */
export function normalizeIconValue(value: string): string {
  // If it's already an icon name, return it
  if (ICON_MAP[value]) {
    return value;
  }

  // If it's an emoji, convert to icon name
  return emojiToIconName(value);
}

/**
 * Get color class for colored circle variants
 *
 * @param iconValue - Icon value (emoji or icon name like 'circle-red')
 * @returns Tailwind color class
 */
export function getIconColorClass(iconValue: string): string {
  const colorMap: Record<string, string> = {
    // Emoji variants (backward compatibility)
    '🔴': 'text-red-500',
    '🟠': 'text-orange-500',
    '🟡': 'text-yellow-500',
    '🟢': 'text-green-500',
    '🔵': 'text-blue-500',
    // Icon name variants
    'circle-red': 'text-red-500',
    'circle-orange': 'text-orange-500',
    'circle-yellow': 'text-yellow-500',
    'circle-green': 'text-green-500',
    'circle-blue': 'text-blue-500',
  };

  return colorMap[iconValue] || '';
}

/**
 * Get inline color style for colored circle variants (for use in HTML strings)
 *
 * @param iconValue - Icon value (emoji or icon name like 'circle-red')
 * @returns CSS color value
 */
export function getIconColorStyle(iconValue: string): string {
  const colorMap: Record<string, string> = {
    // Emoji variants (backward compatibility)
    '🔴': '#ef4444',
    '🟠': '#f97316',
    '🟡': '#eab308',
    '🟢': '#22c55e',
    '🔵': '#3b82f6',
    // Icon name variants
    'circle-red': '#ef4444',
    'circle-orange': '#f97316',
    'circle-yellow': '#eab308',
    'circle-green': '#22c55e',
    'circle-blue': '#3b82f6',
  };

  return colorMap[iconValue] || '#6b7280';
}

/**
 * Convert a Lucide icon component to an SVG string for embedding in HTML
 *
 * @param iconValue - Icon name or emoji
 * @param size - Icon size in pixels (default: 24)
 * @param color - Optional color override (CSS color value)
 * @returns SVG string
 */
export function iconToSvgString(iconValue: string, size: number = 24, color?: string): string {
  try {
    const IconComponent = resolveIcon(iconValue);
    const iconColor = color || getIconColorStyle(iconValue) || 'currentColor';

    // Render the React component to static HTML
    const svgString = renderToStaticMarkup(
      React.createElement(IconComponent, {
        size,
        strokeWidth: 2,
        color: iconColor,
        'aria-label': iconValue,
      })
    );

    return svgString;
  } catch (error) {
    console.error('Error in iconToSvgString:', error, 'iconValue:', iconValue);
    // Return a fallback SVG circle
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/></svg>';
  }
}
