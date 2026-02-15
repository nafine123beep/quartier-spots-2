/**
 * Static Map Preview Utilities
 * Generates static map image URLs for event previews using OpenStreetMap
 */

import { TenantEvent } from "../types";

/**
 * Generates a static map image URL centered on the given coordinates
 * Uses the free staticmap.openstreetmap.de service
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
  // Use staticmap.openstreetmap.de - a free static map service for OSM
  const baseUrl = "https://staticmap.openstreetmap.de/staticmap.php";

  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: zoom.toString(),
    size: `${width}x${height}`,
    maptype: "mapnik", // Standard OSM rendering
  });

  return `${baseUrl}?${params.toString()}`;
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
