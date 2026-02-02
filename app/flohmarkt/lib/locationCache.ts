import { LocationCache } from '../types';

const LOCATION_CACHE_KEY = 'locationCache';
const CACHE_EXPIRATION_DAYS = 90;

/**
 * Check if we're running in a browser environment (SSR safety)
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if cache has expired based on lastUsed timestamp
 */
function isCacheExpired(lastUsed: string): boolean {
  const lastUsedDate = new Date(lastUsed);
  const daysSinceLastUse = (Date.now() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceLastUse > CACHE_EXPIRATION_DAYS;
}

/**
 * Save location data to localStorage cache
 */
export function saveLocationToCache(
  address: {
    street: string;
    houseNumber: string;
    zip: string;
    city: string;
    addressRaw: string;
  },
  coordinates: {
    lat: number;
    lng: number;
    geoPrecision: 'exact' | 'street' | 'city';
  },
  consent: boolean
): void {
  if (!isBrowser()) return;

  try {
    const now = new Date().toISOString();

    // Load existing cache to preserve consent settings
    const existingCache = loadLocationCache();

    const cache: LocationCache = {
      consentGiven: consent,
      consentTimestamp: existingCache?.consentTimestamp || now,
      consentVersion: '1.0',
      address: {
        street: address.street,
        houseNumber: address.houseNumber,
        zip: address.zip,
        city: address.city,
        addressRaw: address.addressRaw,
      },
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng,
        geoPrecision: coordinates.geoPrecision,
      },
      lastUsed: now,
      createdAt: existingCache?.createdAt || now,
    };

    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving location cache:', error);
  }
}

/**
 * Load location cache from localStorage with expiration check
 */
export function loadLocationCache(): LocationCache | null {
  if (!isBrowser()) return null;

  try {
    const cacheStr = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!cacheStr) return null;

    const cache: LocationCache = JSON.parse(cacheStr);

    // Check if cache has expired
    if (isCacheExpired(cache.lastUsed)) {
      return null; // Silently ignore expired cache
    }

    return cache;
  } catch (error) {
    console.error('Error loading location cache:', error);
    return null;
  }
}

/**
 * Type guard to check if cache has complete location data
 */
export function isCompleteCache(cache: LocationCache | null): cache is LocationCache & {
  address: NonNullable<LocationCache['address']>;
  coordinates: NonNullable<LocationCache['coordinates']>;
} {
  return (
    cache !== null &&
    cache.address !== undefined &&
    cache.coordinates !== undefined &&
    typeof cache.address.street === 'string' &&
    typeof cache.address.city === 'string' &&
    typeof cache.coordinates.lat === 'number' &&
    typeof cache.coordinates.lng === 'number'
  );
}

/**
 * Check if cache is partial (consent only)
 */
export function isPartialCache(cache: LocationCache | null): boolean {
  return cache !== null && (!cache.address || !cache.coordinates);
}

/**
 * Check if a valid cache exists
 */
export function hasValidCache(): boolean {
  const cache = loadLocationCache();
  return isCompleteCache(cache) && cache.consentGiven === true;
}
