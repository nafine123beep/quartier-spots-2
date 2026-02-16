/**
 * Static Map Preview Utilities
 * Generates static map-style SVG previews for event cards
 */

import { TenantEvent } from "../types";

/**
 * Generates a static map-style placeholder with location coordinates
 * Uses SVG data URI for immediate display without external dependencies
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param zoom - Zoom level (unused in SVG version but kept for API compatibility)
 * @returns SVG data URI showing location info
 */
export function getStaticMapUrl(
  lat: number,
  lng: number,
  width: number = 600,
  height: number = 400,
  zoom: number = 14
): string {
  const latFormatted = lat.toFixed(4);
  const lngFormatted = lng.toFixed(4);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background with subtle gradient -->
      <defs>
        <linearGradient id="bg-${latFormatted}-${lngFormatted}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8f4f8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d0e8f0;stop-opacity:1" />
        </linearGradient>
        <pattern id="grid-${latFormatted}-${lngFormatted}" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cce5ee" stroke-width="1"/>
        </pattern>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#bg-${latFormatted}-${lngFormatted})"/>
      <rect width="${width}" height="${height}" fill="url(#grid-${latFormatted}-${lngFormatted})" opacity="0.5"/>

      <!-- Location pin icon -->
      <g transform="translate(${width / 2}, ${height / 2 - 20})">
        <path d="M0-20 C-6-20 -10-16 -10-10 C-10-4 0,10 0,10 C0,10 10,-4 10,-10 C10,-16 6,-20 0,-20 Z" fill="#003366"/>
        <circle cx="0" cy="-10" r="3" fill="white"/>
      </g>

      <!-- Coordinates text -->
      <text x="${width / 2}" y="${height - 30}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#003366" font-weight="600">
        ${latFormatted}, ${lngFormatted}
      </text>
      <text x="${width / 2}" y="${height - 12}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#6b7280">
        Kartenvorschau
      </text>
    </svg>
  `.trim();

  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  return `data:image/svg+xml,${encoded}`;
}

/**
 * Gets the appropriate preview image for an event
 * Priority: uploaded image > static map > placeholder
 *
 * @param event - The event object
 * @param width - Desired image width (default 600)
 * @param height - Desired image height (default 400)
 * @returns Object with image URL and type
 */
export function getEventPreviewImage(
  event: TenantEvent,
  width: number = 600,
  height: number = 400
): {
  url: string | null;
  type: "uploaded" | "map" | "placeholder";
  alt: string;
} {
  // Priority 1: Use uploaded cover image
  if (event.images && event.images.length > 0) {
    return {
      url: null, // URL will be generated in component using getPublicImageUrl
      type: "uploaded",
      alt: `Bild für ${event.title}`,
    };
  }

  // Priority 2: Generate static map preview if coordinates exist
  if (event.map_center_lat != null && event.map_center_lng != null) {
    return {
      url: getStaticMapUrl(event.map_center_lat, event.map_center_lng, width, height),
      type: "map",
      alt: `Karten-Vorschau für ${event.title}`,
    };
  }

  // Priority 3: No image and no coordinates - use placeholder
  return {
    url: null,
    type: "placeholder",
    alt: "Kein Bild verfügbar",
  };
}

/**
 * Gets the appropriate preview image URL for an event
 * Simplified version that returns just the URL
 *
 * @param event - The event object
 * @param width - Desired image width (default 600)
 * @param height - Desired image height (default 400)
 * @returns Image URL or null for placeholder
 */
export function getEventPreviewImageUrl(
  event: TenantEvent,
  width: number = 600,
  height: number = 400
): string | null {
  return getEventPreviewImage(event, width, height).url;
}
