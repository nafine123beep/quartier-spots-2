/**
 * Geocoding utilities using Nominatim (OpenStreetMap)
 * Free to use with proper attribution
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName?: string;
}

/**
 * Geocode an address using Nominatim API
 * @param address - The address to geocode
 * @returns Coordinates {lat, lng} or null if not found
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  try {
    // Nominatim requires a User-Agent header
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: address,
          format: "json",
          limit: "1",
          addressdetails: "1",
        }),
      {
        headers: {
          "User-Agent": "Quartier-Spots-Flohmarkt-App",
        },
      }
    );

    if (!response.ok) {
      console.error("Geocoding API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get an address
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Address string or null if not found
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
        new URLSearchParams({
          lat: lat.toString(),
          lon: lng.toString(),
          format: "json",
        }),
      {
        headers: {
          "User-Agent": "Quartier-Spots-Flohmarkt-App",
        },
      }
    );

    if (!response.ok) {
      console.error("Reverse geocoding API error:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}
