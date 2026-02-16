/**
 * Static Map Preview Utilities
 * Generates static map image URLs for event previews using OpenStreetMap
 */

import { TenantEvent } from "../types";

/**
 * Generates a static map image URL using a tile-based approach
 * Uses OpenStreetMap tiles via a proxy service for static map generation
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param zoom - Zoom level (1-19, default 14)
 * @returns Static map image URL
 */
export function getStaticMapUrl(
  lat: number,
  lng: number,
  width: number = 600,
  height: number = 400,
  zoom: number = 14
): string {
  // Use OpenTopoMap's static map service - reliable and free
  // Alternative services in order of preference:
  // 1. OpenTopoMap (used here)
  // 2. For production: Consider getting a free MapTiler API key

  // Calculate tile coordinates for the center point
  const scale = Math.pow(2, zoom);
  const centerX = (lng + 180) / 360 * scale;
  const centerY = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * scale;

  // Construct URL using MapTiler Static Maps API
  // Using a demo/test key - for production, get your own free key at https://www.maptiler.com
  const baseUrl = "https://api.maptiler.com/maps/streets-v2/static";

  // Add a marker at the center point
  const marker = `pin-s-marker+003366(${lng},${lat})`;

  // Format: /lon,lat,zoom/widthxheight@2x.png
  // The @2x provides high DPI for better quality
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "get_your_own_OpIi9ZULNHzrESv6T2vL";

  return `${baseUrl}/${lng},${lat},${zoom}/${width}x${height}@2x.png?markers=${encodeURIComponent(marker)}&attribution=false&key=${apiKey}`;
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
