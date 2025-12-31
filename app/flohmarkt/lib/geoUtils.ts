/**
 * Geographic utility functions for boundary validation
 */

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lng1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lng2 - Longitude of point 2
 * @returns Distance in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a point is within the boundary radius of the center
 * @param spotLat - Latitude of the spot
 * @param spotLng - Longitude of the spot
 * @param centerLat - Latitude of the event center
 * @param centerLng - Longitude of the event center
 * @param radiusMeters - Boundary radius in meters
 * @returns true if within boundary, false otherwise
 */
export function isWithinBoundary(
  spotLat: number,
  spotLng: number,
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistanceMeters(centerLat, centerLng, spotLat, spotLng);
  return distance <= radiusMeters;
}

/**
 * Format distance for display
 * @param meters - Distance in meters
 * @returns Formatted string (e.g., "500 m" or "1,2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  // Use German number format (comma as decimal separator)
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

/**
 * Radius presets for event creation (in meters)
 */
export const BOUNDARY_RADIUS_PRESETS = [
  { label: "500 m", value: 500 },
  { label: "1 km", value: 1000 },
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
];
