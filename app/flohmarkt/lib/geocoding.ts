/**
 * Geocoding utilities using Nominatim (OpenStreetMap)
 * Free to use with proper attribution
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName?: string;
  street?: string;
  houseNumber?: string;
  zip?: string;
  city?: string;
}

/**
 * Geocode an address using Nominatim API
 * @param address - The address to geocode
 * @returns Coordinates {lat, lng} or null if not found
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!address || address.trim().length === 0) {
    console.log("Geocoding: Empty address provided");
    return null;
  }

  try {
    // Log the input address for debugging
    console.log("Geocoding address:", address);

    // Nominatim requires a User-Agent header
    // Add countrycode parameter to improve German address accuracy
    const params = new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
      addressdetails: "1",
      countrycodes: "de", // Restrict to Germany for better accuracy
    });

    const url = `https://nominatim.openstreetmap.org/search?${params}`;
    console.log("Geocoding URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Quartier-Spots-Flohmarkt-App",
        "Accept-Language": "de", // Prefer German results
      },
    });

    if (!response.ok) {
      console.error("Geocoding API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("Geocoding response:", data);

    if (!data || data.length === 0) {
      console.log("Geocoding: No results found for address:", address);
      return null;
    }

    const result = data[0];
    const addressData = result.address || {};

    console.log("Geocoding success:", {
      lat: result.lat,
      lon: result.lon,
      display_name: result.display_name,
      address: addressData
    });

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      street: addressData.road || addressData.street || addressData.pedestrian || addressData.footway,
      houseNumber: addressData.house_number,
      zip: addressData.postcode,
      city: addressData.city || addressData.town || addressData.village || addressData.municipality,
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
