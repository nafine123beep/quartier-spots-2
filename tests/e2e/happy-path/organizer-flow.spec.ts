/**
 * Happy Path E2E Test: Organizer Flow
 *
 * Tests the complete journey of an organizer:
 * 1. Login with test credentials
 * 2. Complete onboarding (create organization)
 * 3. Create a new event
 * 4. Publish the event
 * 5. Verify event is accessible via public URL
 */

import { test, expect } from '@playwright/test';

test.describe('Organizer Happy Path', () => {
  test('organizer can create and publish an event', async ({ page }) => {
    const timestamp = Date.now();
    const orgName = `Test Org ${timestamp}`;
    const eventTitle = `Test Event ${timestamp}`;

    // Step 1: Login
    await page.goto('/auth/login');

    // Switch to password mode (click the "Passwort" tab)
    const passwordTab = page.getByRole('button', { name: 'Passwort' });
    await passwordTab.click();

    // Wait for password fields to appear
    await page.waitForTimeout(500);

    // Fill in credentials
    await page.getByPlaceholder('max@beispiel.de').fill(process.env.TEST_ORGANIZER_EMAIL!);
    await page.getByPlaceholder(/passwort/i).fill(process.env.TEST_PASSWORD!);

    // Submit login
    await page.getByRole('button', { name: /anmelden/i }).click();

    // Step 2: Handle onboarding if needed
    // After login, user may be redirected to /onboarding or /flohmarkt
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    if (currentUrl.includes('/onboarding')) {
      console.log('Onboarding required, completing setup...');

      // Wait for onboarding page to load
      await expect(page.locator('h1', { hasText: /willkommen|einrichten/i })).toBeVisible({ timeout: 5000 });

      // Fill organization name (look for input field)
      const orgNameInput = page.getByLabel(/organisation|name/i).first();
      await orgNameInput.fill(orgName);

      // Submit
      await page.getByRole('button', { name: /weiter|erstellen|speichern/i }).click();

      // Wait for redirect to main app
      await page.waitForURL(/\/flohmarkt/, { timeout: 10000 });
      console.log('Onboarding completed');
    } else {
      console.log('User already has organization, skipping onboarding');
    }

    // Step 3: Create a new event
    // Click "Neues Event" or similar button
    await page.getByRole('button', { name: /neues event/i }).click();

    // Fill event details
    await page.getByLabel(/titel/i).fill(eventTitle);
    await page.getByLabel(/beschreibung/i).fill('Auto-generated test event for E2E testing');

    // Set dates (future dates)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 8);

    await page.getByLabel(/startdatum/i).fill(startDate.toISOString().split('T')[0]);
    await page.getByLabel(/enddatum/i).fill(endDate.toISOString().split('T')[0]);

    // Set location (map center)
    await page.getByLabel(/adresse/i).fill('Regensburg, Germany');

    // Set boundary radius
    await page.getByLabel(/radius/i).fill('1000');

    // Save event
    await page.getByRole('button', { name: /speichern/i }).click();

    // Wait for event to be created
    await page.waitForTimeout(2000);

    // Step 4: Publish the event
    const publishButton = page.getByRole('button', { name: /veröffentlichen/i });
    await expect(publishButton).toBeVisible({ timeout: 5000 });
    await publishButton.click();

    // Confirm publish if there's a confirmation dialog
    const confirmButton = page.getByRole('button', { name: /bestätigen|ja/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // Wait for publish to complete
    await page.waitForTimeout(2000);

    // Step 5: Verify event is accessible via public URL
    // Get the public link (should be displayed after publishing)
    const publicLinkElement = page.locator('text=/flohmarkt\\//').first();
    await expect(publicLinkElement).toBeVisible({ timeout: 5000 });

    const publicUrl = await publicLinkElement.textContent();
    expect(publicUrl).toContain('/flohmarkt/');

    // Navigate to the public URL
    await page.goto(publicUrl!);

    // Verify the event page loads with correct title
    await expect(page.locator('h1', { hasText: eventTitle })).toBeVisible({ timeout: 10000 });

    // Verify tabs are visible (confirming full page render)
    await expect(page.getByRole('button', { name: /📋.*liste/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /🗺️.*karte/i })).toBeVisible();

    console.log('✅ Organizer flow completed successfully!');
    console.log(`Event published at: ${publicUrl}`);
  });
});
