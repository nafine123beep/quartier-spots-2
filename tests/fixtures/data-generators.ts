/**
 * Test Data Generators
 *
 * Generates unique test data per run to avoid conflicts and enable parallel execution.
 * Each function creates data with timestamps to ensure uniqueness.
 */

import { randomUUID } from 'crypto';

/**
 * Generates a unique test identifier using timestamp + random string
 */
export function generateUniqueId(): string {
  return `test-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

/**
 * Generates a unique test email address
 */
export function generateTestEmail(): string {
  return `test-${generateUniqueId()}@test.local`;
}

/**
 * Generates test organization data
 */
export function generateTestOrganization() {
  const uniqueId = generateUniqueId();
  return {
    name: `Test Org ${uniqueId}`,
    slug: `test-org-${uniqueId}`,
    join_password: 'test-password-123',
  };
}

/**
 * Generates test event data with optional overrides
 */
export function generateTestEvent(overrides: Record<string, any> = {}) {
  const uniqueId = generateUniqueId();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30); // 30 days in future

  return {
    title: `Test Event ${uniqueId}`,
    slug: `test-event-${uniqueId}`,
    description: 'Auto-generated test event',
    starts_at: futureDate.toISOString(),
    ends_at: new Date(futureDate.getTime() + 8 * 60 * 60 * 1000).toISOString(), // +8 hours
    map_center_address: 'Regensburg, Germany',
    map_center_lat: 49.0134,
    map_center_lng: 12.1016,
    boundary_radius_meters: 2000,
    status: 'published',
    // Use default spot terminology ('Spot'/'Spots') unless overridden
    // This ensures tests that look for 'Spot anmelden', 'Alle Spots', etc. continue to work
    ...overrides,
  };
}

/**
 * Generates test spot/registration data
 */
export function generateTestSpot(overrides: Record<string, any> = {}) {
  const uniqueId = generateUniqueId();
  // Add small random offset to coordinates to avoid duplicates
  const latOffset = Math.random() * 0.01;
  const lngOffset = Math.random() * 0.01;

  return {
    street: 'Teststraße',
    house_number: '42',
    zip: '93051',
    city: 'Regensburg',
    address_raw: 'Teststraße 42, 93051 Regensburg',
    address_public: true,
    lat: 49.015 + latOffset,
    lng: 12.102 + lngOffset,
    geo_precision: 'exact',
    contact_name: `Test User ${uniqueId}`,
    contact_email: generateTestEmail(),
    contact_phone: '+49 123 456789',
    public_note: 'Test items for sale',
    ...overrides,
  };
}

/**
 * Generates event dates relative to current time
 */
export function generateEventDates(daysInFuture: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + daysInFuture);

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 8); // 8 hours duration

  return {
    startsAt: startDate.toISOString(),
    endsAt: endDate.toISOString(),
  };
}

/**
 * Generates test user profile data
 */
export function generateTestUser() {
  const uniqueId = generateUniqueId();
  return {
    email: generateTestEmail(),
    display_name: `Test User ${uniqueId}`,
    password: 'test-password-123',
  };
}
