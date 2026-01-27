import { LocationCache, NotificationPreferences } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

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
 * Clear location cache from localStorage and optionally from database
 */
export async function clearLocationCache(
  userId?: string,
  supabase?: SupabaseClient
): Promise<void> {
  if (!isBrowser()) return;

  try {
    // Clear localStorage
    localStorage.removeItem(LOCATION_CACHE_KEY);
    localStorage.removeItem('locationCacheAsked');

    // Clear from database if authenticated
    if (userId && supabase) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', userId)
        .single();

      if (profile) {
        const preferences = profile.notification_preferences as NotificationPreferences || {};
        delete preferences.location_cache;

        await supabase
          .from('profiles')
          .update({ notification_preferences: preferences })
          .eq('id', userId);
      }
    }
  } catch (error) {
    console.error('Error clearing location cache:', error);
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
 * Update consent flag in cache
 * Note: This may create a partial cache (consent only, no address/coordinates)
 * when no existing cache exists. Use isCompleteCache() to check before accessing
 * address or coordinates fields.
 */
export function updateCacheConsent(consent: boolean, version: string): void {
  if (!isBrowser()) return;

  try {
    const cache = loadLocationCache();

    if (cache) {
      cache.consentGiven = consent;
      cache.consentVersion = version;
      cache.consentTimestamp = new Date().toISOString();
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cache));
    } else {
      // Create new cache with just consent info
      const now = new Date().toISOString();
      const newCache: Partial<LocationCache> = {
        consentGiven: consent,
        consentVersion: version,
        consentTimestamp: now,
        createdAt: now,
        lastUsed: now,
      };
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(newCache));
    }
  } catch (error) {
    console.error('Error updating cache consent:', error);
  }
}

/**
 * Sync location cache to database for authenticated users
 */
export async function syncCacheToDatabase(
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  if (!isBrowser()) return;

  try {
    const cache = loadLocationCache();

    // Only sync if we have consent AND complete location data
    if (!isCompleteCache(cache) || !cache.consentGiven) {
      console.log('Skipping sync: incomplete cache or no consent');
      return;
    }

    // Get existing notification preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', userId)
      .single();

    const preferences = (profile?.notification_preferences as NotificationPreferences) || {
      contact_form_emails: true,
    };

    // Add location cache to preferences
    preferences.location_cache = {
      consent_given: cache.consentGiven,
      consent_version: cache.consentVersion,
      street: cache.address.street,
      house_number: cache.address.houseNumber,
      zip: cache.address.zip,
      city: cache.address.city,
      lat: cache.coordinates.lat,
      lng: cache.coordinates.lng,
      last_used: cache.lastUsed,
    };

    // Update database
    await supabase
      .from('profiles')
      .update({ notification_preferences: preferences })
      .eq('id', userId);

  } catch (error) {
    console.error('Error syncing cache to database:', error);
    throw error;
  }
}

/**
 * Sync location cache from database for authenticated users
 */
export async function syncCacheFromDatabase(
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  if (!isBrowser()) return;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', userId)
      .single();

    const preferences = profile?.notification_preferences as NotificationPreferences;
    const locationCache = preferences?.location_cache;

    if (!locationCache) {
      return;
    }

    // Validate that all required location fields exist
    const hasCompleteData =
      locationCache.street &&
      locationCache.city &&
      typeof locationCache.lat === 'number' &&
      typeof locationCache.lng === 'number';

    if (!hasCompleteData) {
      console.warn('Database cache is incomplete, skipping sync');
      return;
    }

    // Safe addressRaw construction with defaults
    const street = locationCache.street || '';
    const houseNumber = locationCache.house_number || '';
    const zip = locationCache.zip || '';
    const city = locationCache.city || '';
    const addressRaw = `${street}${houseNumber ? ' ' + houseNumber : ''}, ${zip} ${city}`.trim();

    // Convert database format to localStorage format
    const cache: LocationCache = {
      consentGiven: locationCache.consent_given,
      consentTimestamp: new Date().toISOString(),
      consentVersion: locationCache.consent_version,
      address: {
        street: locationCache.street,
        houseNumber: locationCache.house_number || '',
        zip: locationCache.zip || '',
        city: locationCache.city,
        addressRaw,
      },
      coordinates: {
        lat: locationCache.lat,
        lng: locationCache.lng,
        geoPrecision: 'exact',
      },
      lastUsed: locationCache.last_used,
      createdAt: locationCache.last_used,
    };

    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error syncing cache from database:', error);
    throw error;
  }
}

/**
 * Check if a valid cache exists
 */
export function hasValidCache(): boolean {
  const cache = loadLocationCache();
  return isCompleteCache(cache) && cache.consentGiven === true;
}
