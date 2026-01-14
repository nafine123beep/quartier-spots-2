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
      // The button text is "+ Spot anmelden" in the UI (could be link or button)
      const registerButton = page.locator('text=/\\+?\\s*spot\\s*anmelden/i').first();
      await expect(registerButton).toBeVisible({ timeout: 10000 });
      await registerButton.click();

      // Wait for registration page
      await expect(page.locator('h1', { hasText: /teilnehmen/i })).toBeVisible({ timeout: 10000 });

      // Click continue to form
      const continueButton = page.getByRole('button', { name: /weiter zur spot anmeldung/i });
      await expect(continueButton).toBeVisible();
      await continueButton.click();

      // Wait for form tab to load
      await page.waitForURL(/tab=form/, { timeout: 5000 });

      // Step 5: Fill spot registration form
      // Address fields
      await page.getByPlaceholder(/hauptstraße/i).fill('Teststraße');
      await page.getByPlaceholder(/42/i).fill('123');
      await page.getByPlaceholder(/93051/i).fill('93051');
      await page.getByPlaceholder(/regensburg/i).fill('Regensburg');

      // Consent checkbox
      const consentCheckbox = page.locator('input[type="checkbox"]').first();
      await consentCheckbox.check();

      // Contact info (optional but filling for completeness)
      await page.getByPlaceholder(/name/i).fill('Test Participant');
      await page.getByPlaceholder(/e-mail/i).fill('participant@test.local');

      // Public note
      await page.getByPlaceholder(/was verkaufst du/i).fill('Testware und Spielzeug');

      // Submit form to geocode
      const submitButton = page.getByRole('button', { name: /adresse prüfen|weiter/i });
      await submitButton.click();

      // Step 6: Confirm location on map
      // Wait for map tab to load with geocoded location
      await page.waitForURL(/tab=map/, { timeout: 10000 });

      // Verify map is shown
      await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });

      // Confirm the pin location
      const confirmButton = page.getByRole('button', { name: /position bestätigen|spot anmelden/i });
      await expect(confirmButton).toBeVisible();
      await confirmButton.click();

      // Step 7: Verify success
      // Should show success message
      await expect(page.locator('text=/erfolg|erfolgreich|angemeldet/i')).toBeVisible({ timeout: 10000 });

      // Navigate back to event page
      const backButton = page.getByRole('link', { name: /zurück|event ansehen/i });
      if (await backButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await backButton.click();
      } else {
        await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);
      }

      // Wait for event page to load
      await page.waitForTimeout(2000);

      // Step 8: Verify spot appears in list view
      await expect(page.getByText('Teststraße 123')).toBeVisible({ timeout: 5000 });

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
