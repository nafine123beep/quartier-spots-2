/**
 * Browser Geolocation API wrapper for detecting user's current GPS position
 */

export interface GeolocationResult {
  lat: number;
  lng: number;
  accuracy: number;
}

/**
 * Get the user's current GPS position using the browser's Geolocation API
 * Requires user permission (browser will prompt)
 * Returns null if unavailable, denied, or error occurs
 */
export async function getCurrentPosition(): Promise<GeolocationResult | null> {
  // Check if running in browser and geolocation is available
  if (typeof window === 'undefined' || !navigator.geolocation) {
    console.warn('Geolocation API not available');
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        // Handle errors gracefully - don't throw
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error('Geolocation permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            console.error('Geolocation position unavailable');
            break;
          case error.TIMEOUT:
            console.error('Geolocation request timeout');
            break;
          default:
            console.error('Geolocation error:', error.message);
        }
        resolve(null);
      },
      {
        enableHighAccuracy: true, // Use GPS if available (more accurate than WiFi/cell tower)
        timeout: 10000,           // 10 second timeout
        maximumAge: 0,            // Don't use cached position
      }
    );
  });
}
