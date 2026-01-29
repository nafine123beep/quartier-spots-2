import { Spot, TenantEvent } from '../types';

/**
 * Sort spots by address (street, then house number) then by contact name.
 * This sorting MUST be used for both the list and the map numbering
 * to ensure spot numbers match between the PDF list and map.
 */
export function sortSpotsForPrint(spots: Spot[]): Spot[] {
  return [...spots].sort((a, b) => {
    // Primary: Sort by street name (case-insensitive)
    const streetA = (a.street || '').toLowerCase();
    const streetB = (b.street || '').toLowerCase();
    const streetCompare = streetA.localeCompare(streetB, 'de');
    if (streetCompare !== 0) return streetCompare;

    // Secondary: Sort by house number (numeric extraction for proper ordering)
    const houseNumA = extractNumericHouseNumber(a.house_number);
    const houseNumB = extractNumericHouseNumber(b.house_number);
    if (houseNumA !== houseNumB) return houseNumA - houseNumB;

    // Tertiary: Sort by contact name (case-insensitive)
    const nameA = (a.contact_name || '').toLowerCase();
    const nameB = (b.contact_name || '').toLowerCase();
    return nameA.localeCompare(nameB, 'de');
  });
}

/**
 * Extract numeric part from house number for proper sorting.
 * E.g., "15a" -> 15, "3" -> 3, "12-14" -> 12
 */
function extractNumericHouseNumber(houseNumber: string | undefined): number {
  if (!houseNumber) return 0;
  const match = houseNumber.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Format address for display, handling missing components gracefully.
 */
export function formatAddressForPrint(spot: Spot): string {
  // If we have structured address components, use them
  if (spot.street && spot.house_number && spot.zip && spot.city) {
    return `${spot.street} ${spot.house_number}, ${spot.zip} ${spot.city}`;
  }

  // If we have street and house number but missing zip/city
  if (spot.street && spot.house_number) {
    const parts = [spot.street, spot.house_number];
    if (spot.zip || spot.city) {
      parts.push(',');
      if (spot.zip) parts.push(spot.zip);
      if (spot.city) parts.push(spot.city);
    }
    return parts.join(' ').replace(' ,', ',');
  }

  // Fall back to raw address
  if (spot.address_raw) {
    return spot.address_raw;
  }

  // If we only have partial data
  const parts = [];
  if (spot.street) parts.push(spot.street);
  if (spot.house_number) parts.push(spot.house_number);
  if (spot.zip) parts.push(spot.zip);
  if (spot.city) parts.push(spot.city);

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return 'Keine Adresse';
}

/**
 * Format event date range for display in German format.
 */
export function formatEventDateRange(event: TenantEvent): string {
  if (!event.starts_at) return '';

  const start = new Date(event.starts_at);

  // Format date
  const dateStr = start.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Format start time
  const startTime = start.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  let timeStr = startTime + ' Uhr';

  // Add end time if available
  if (event.ends_at) {
    const end = new Date(event.ends_at);
    const endTime = end.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
    timeStr = `${startTime} - ${endTime} Uhr`;
  }

  return `${dateStr}, ${timeStr}`;
}

/**
 * Truncate text with ellipsis if it exceeds the maximum length.
 */
export function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a filename-safe string from event title and date.
 */
export function generatePDFFilename(event: TenantEvent): string {
  const slug = event.slug || event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const date = new Date().toISOString().split('T')[0];
  return `${slug}-${date}.pdf`;
}
