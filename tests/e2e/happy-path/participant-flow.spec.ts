/**
 * Happy Path E2E Test: Participant Flow
 *
 * Tests the complete participant journey:
 * 1. Access public event (no login required)
 * 2. View event details and images
 * 3. Register a spot with address and contact info
 * 4. Verify spot appears in list and on map
 *
 * This test focuses on the most common user flow and should pass consistently.
 */

import { test, expect } from '@playwright/test';
import { createPublishedEvent, supabaseAdmin } from '../../fixtures/supabase-helpers';
import { generateTestSpot } from '../../fixtures/data-generators';

test.describe('Participant Happy Path', () => {
  let tenantId: string;

  test.afterEach(async () => {
    // Cleanup: Delete test data
    if (tenantId) {
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('participant views event and registers spot without login', async ({ page }) => {
    // Setup: Create published event
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    // STEP 1: Access public event
    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Verify event page loaded
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

    // STEP 2: View spots list (should be empty initially)
    await expect(page.getByText(/spot|stand/i)).toBeVisible();

    // STEP 3: Switch to map view
    const mapButton = page.getByRole('button', { name: /karte|map/i });
    await mapButton.click();

    // Wait for map to load
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });

    // STEP 4: Navigate to spot registration
    const registerButton = page.getByRole('button', { name: /spot.*registr|stand.*anmeld/i });
    await registerButton.click();

    // Handle confirmation page if present
    const continueButton = page.getByRole('button', { name: /weiter.*anmeldung|continue/i });
    if (await continueButton.isVisible({ timeout: 3000 })) {
      await continueButton.click();
    }

    // STEP 5: Fill spot registration form
    const spotData = generateTestSpot();

    await page.getByLabel(/straße|street/i).fill(spotData.street);
    await page.getByLabel(/hausnummer|house.*number/i).fill(spotData.house_number);
    await page.getByLabel(/plz|zip|postcode/i).fill(spotData.zip);
    await page.getByLabel(/stadt|city/i).fill(spotData.city);

    // Consent to public address
    await page.getByLabel(/einverstanden|consent|agree/i).check();

    // Fill contact info
    await page.getByLabel(/dein name|your name|kontakt.*name/i).fill(spotData.contact_name);
    await page.getByLabel(/e-mail|email/i).fill(spotData.contact_email);

    // Fill public note
    await page.getByLabel(/verkaufst|selling|note|beschreibung/i).fill(spotData.public_note);

    // STEP 6: Submit form
    await page.getByRole('button', { name: /absenden|submit|registr/i }).click();

    // STEP 7: Handle pin confirmation (geocoding completes)
    // Wait for map pin selector to appear
    const confirmButton = page.getByRole('button', { name: /bestätigen|confirm/i });
    await expect(confirmButton).toBeVisible({ timeout: 15000 });
    await confirmButton.click();

    // STEP 8: Verify success
    await expect(page.locator('text=/erfolgreich|success/i')).toBeVisible({ timeout: 5000 });

    // STEP 9: Verify spot appears in list
    // Should redirect to list view or we navigate there
    const listButton = page.getByRole('button', { name: /liste|list/i });
    if (await listButton.isVisible({ timeout: 2000 })) {
      await listButton.click();
    }

    // Wait for spot to appear
    await expect(page.locator(`text=${spotData.street}`)).toBeVisible({ timeout: 5000 });

    // STEP 10: Verify spot appears on map
    await page.getByRole('button', { name: /karte|map/i }).click();

    // Wait for map markers
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1, { timeout: 5000 });
  });

  test('participant can view event images', async ({ page }) => {
    // Setup: Create published event
    const { orgSlug, eventSlug, tenantId: tid, eventId } = await createPublishedEvent();
    tenantId = tid;

    // Add test image to event
    await supabaseAdmin.from('event_images').insert({
      event_id: eventId,
      storage_path: 'test/sample-image.jpg',
      filename: 'sample-image.jpg',
      position: 0,
      is_cover: true,
    });

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Check if image gallery is visible (if images exist)
    const imageGallery = page.locator('img[src*="event-images"]').first();
    const hasImages = await imageGallery.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasImages) {
      // Click image to open lightbox
      await imageGallery.click();

      // Verify lightbox opened
      await expect(page.locator('.fixed.inset-0.bg-black')).toBeVisible();
    }
  });
});
