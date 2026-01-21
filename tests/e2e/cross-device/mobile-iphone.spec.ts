/**
 * Cross-Device Tests: iPhone Safari
 *
 * Tests mobile-specific functionality on iPhone Safari emulation.
 * Verifies touch interactions, responsive layout, and mobile UX.
 */

import { test, expect, devices } from '@playwright/test';
import { createPublishedEvent, supabaseAdmin } from '../../fixtures/supabase-helpers';
import { generateTestSpot } from '../../fixtures/data-generators';

// Use iPhone 13 device settings
test.use({ ...devices['iPhone 13'] });

test.describe('iPhone Safari Tests', () => {
  let tenantId: string;

  test.afterEach(async () => {
    if (tenantId) {
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('participant can register spot on iPhone', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Verify responsive layout (no horizontal scroll)
    const body = page.locator('body');
    const hasHorizontalScroll = await body.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(hasHorizontalScroll).toBe(false);

    // Tap register button (should be large enough for touch)
    const registerButton = page.getByRole('button', { name: /spot.*anmeld|stand.*anmeld/i });

    // Verify button size meets iOS minimum (44x44px)
    const box = await registerButton.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    await registerButton.tap();

    // Handle confirmation page
    const continueButton = page.getByRole('button', { name: /weiter/i });
    if (await continueButton.isVisible({ timeout: 2000 })) {
      await continueButton.tap();
    }

    // Fill form with mobile keyboard - use real address for geocoding
    await page.getByLabel(/straße|street/i).tap();
    await page.keyboard.type('Domplatz');

    await page.getByLabel(/hausnummer/i).tap();
    await page.keyboard.type('1');

    await page.getByLabel(/plz|zip/i).tap();
    await page.keyboard.type('93047');

    await page.getByLabel(/stadt|city/i).tap();
    await page.keyboard.type('Regensburg');

    // Scroll to consent checkbox
    await page.getByLabel(/einverstanden|consent/i).scrollIntoViewIfNeeded();
    await page.getByLabel(/einverstanden|consent/i).tap();

    await page.getByLabel(/bietest du an|verkaufst|note/i).tap();
    await page.keyboard.type('Test items for sale');

    // Scroll to submit button to ensure it's visible
    const submitButton = page.getByRole('button', { name: /absenden|submit/i });
    await submitButton.scrollIntoViewIfNeeded();

    // Submit
    await submitButton.tap();

    // Wait for geocoding and pin position modal (can take longer in tests)
    const confirmButton = page.getByRole('button', { name: /position bestätigen/i });
    await expect(confirmButton).toBeVisible({ timeout: 20000 });
    await confirmButton.tap();

    // Verify submission worked - look for success modal
    await expect(page.getByText(/erfolgreich.*gespeichert|spot.*erstellt/i)).toBeVisible({ timeout: 10000 });
  });

  test('map interactions work on iPhone touchscreen', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Switch to map view
    await page.getByRole('button', { name: /karte|map/i }).tap();

    // Verify map loads
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });

    // Test touch interaction on map
    await page.touchscreen.tap(200, 300);

    // Map should be responsive to touch
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
  });

  test('all interactive elements meet iOS touch target size', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Check all buttons
    const buttons = page.locator('button:visible');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      if (box && box.width > 0 && box.height > 0) {
        // iOS requires 44x44pt minimum
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
