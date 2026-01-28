/**
 * Happy Path E2E Test: Participant Flow
 *
 * Tests the complete journey of a participant:
 * 1. Access a public event URL (no login required)
 * 2. View event details
 * 3. Navigate to spot registration
 * 4. Fill and submit the registration form
 * 5. Confirm spot location on map
 * 6. Verify success message
 * 7. Confirm spot appears in list and on map
 */

import { test, expect } from '@playwright/test';
import { createPublishedEvent } from '../../fixtures/supabase-helpers';

test.describe('Participant Happy Path', () => {
  test('participant can register a spot for a public event', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(60000); // 60 seconds

    // Setup: Create a published event using test helper
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();

    console.log(`Testing participant flow for event: /flohmarkt/${orgSlug}/${eventSlug}`);

    try {
      // Step 1: Access public event URL (no login)
      await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

      // Step 2: Verify event details are visible
      await expect(page.locator('h1', { hasText: event.title })).toBeVisible({ timeout: 10000 });

      // Step 3: View tabs (List and Map)
      const listTab = page.getByRole('button', { name: /📋.*liste/i });
      const mapTab = page.getByRole('button', { name: /🗺️.*karte/i });

      await expect(listTab).toBeVisible();
      await expect(mapTab).toBeVisible();

      // Click map tab to verify it works
      await mapTab.click();
      await page.waitForTimeout(1000);

      // Switch back to list tab
      await listTab.click();
      await page.waitForTimeout(500);

      // Step 4: Navigate to spot registration
      // Click the "+ Spot anmelden" tab
      const registerTab = page.getByRole('button', { name: /spot anmelden/i });
      await expect(registerTab).toBeVisible({ timeout: 10000 });
      await registerTab.click();

      // Wait for registration form to appear - check for the street field
      await page.waitForTimeout(1000);
      await expect(page.getByPlaceholder(/hauptstraße/i)).toBeVisible({ timeout: 5000 });

      // Step 5: Fill spot registration form
      // Use a real address in Regensburg that can be geocoded
      await page.getByPlaceholder(/hauptstraße/i).fill('Domplatz');
      await page.getByPlaceholder(/42/i).fill('1');
      await page.getByPlaceholder(/93051/i).fill('93047');
      await page.getByPlaceholder(/regensburg/i).fill('Regensburg');

      // Address consent checkbox (required)
      const consentCheckbox = page.locator('label:has-text("Ich bin damit einverstanden")').locator('..').locator('input[type="checkbox"]');
      await consentCheckbox.check();

      // Public note - fill the textarea
      await page.locator('textarea').fill('Testware und Spielzeug');

      // Check the "Meinen Kontakt hinzufügen" checkbox to reveal contact fields
      const contactCheckbox = page.locator('label:has-text("Meinen Kontakt hinzufügen")').locator('..').locator('input[type="checkbox"]');
      await contactCheckbox.check();

      // Wait for contact fields to appear
      await page.waitForTimeout(500);

      // Contact info (optional but filling for completeness)
      await page.getByPlaceholder('Name').fill('Test Participant');
      await page.getByPlaceholder(/e-mail-adresse/i).fill('participant@test.local');

      // Wait a moment for form to process
      await page.waitForTimeout(1000);

      // Scroll to submit button to ensure it's in view
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Submit form - try clicking with Promise.all to wait for navigation
      const submitButton = page.getByRole('button', { name: 'Absenden' });
      await expect(submitButton).toBeVisible();

      // Click and wait for navigation simultaneously
      await Promise.all([
        page.waitForLoadState('networkidle', { timeout: 15000 }),
        submitButton.click()
      ]);

      // Step 6: Confirm position on "Position bestätigen" page
      // Wait for redirect to position confirmation page
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.waitForTimeout(2000);

      // Check for the "Position bestätigen" heading or page
      const positionHeading = page.locator('h1, h2, h3').filter({ hasText: /position bestätigen/i });
      await expect(positionHeading).toBeVisible({ timeout: 10000 });
      console.log('✓ Redirected to position confirmation page');

      // Verify map is shown with the geocoded location
      await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });
      console.log('✓ Map is visible');

      // Wait for geocoding to complete and marker to appear
      await page.waitForTimeout(2000);

      // Confirm the pin location
      const confirmButton = page.getByRole('button', { name: 'Position bestätigen' });
      await expect(confirmButton).toBeVisible({ timeout: 5000 });
      await confirmButton.click();
      console.log('✓ Clicked position confirmation button');

      // Step 7: Verify success
      // Should show success message heading
      await expect(page.getByRole('heading', { name: /spot erfolgreich/i })).toBeVisible({ timeout: 10000 });
      console.log('✅ Spot registration successful!');

      // Navigate back to event page
      const backButton = page.getByRole('link', { name: /zurück|event ansehen/i });
      if (await backButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await backButton.click();
      } else {
        await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);
      }

      // Wait for event page to load
      await page.waitForTimeout(2000);

      // Step 8: Verify spot appears in list view (map is now default, so switch to list)
      await listTab.click();
      await page.waitForTimeout(500);
      await expect(page.getByText('Domplatz 1')).toBeVisible({ timeout: 5000 });
      console.log('✓ Spot appears in list view');

      // Step 9: Verify spot appears on map
      await mapTab.click();
      await page.waitForTimeout(1000);

      // Check for marker on map (leaflet marker)
      const marker = page.locator('.leaflet-marker-icon').first();
      await expect(marker).toBeVisible({ timeout: 5000 });

      console.log('✅ Participant flow completed successfully!');
      console.log('Spot registered at: Teststraße 123, 93051 Regensburg');

    } finally {
      // Cleanup: Delete test data
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
      console.log('Test data cleaned up');
    }
  });
});
