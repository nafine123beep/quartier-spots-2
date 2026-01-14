/**
 * Smoke Tests: Core Pages
 *
 * Verifies that core application pages load successfully.
 * Tests basic routing and page rendering without deep functionality testing.
 */

import { test, expect } from '@playwright/test';
import { createPublishedEvent } from '../../fixtures/supabase-helpers';

test.describe('Core Pages Smoke Tests', () => {
  test('login page renders login form', async ({ page }) => {
    await page.goto('/auth/login');

    // Wait for page to load (avoid flash of loading state)
    await page.waitForLoadState('networkidle');

    // Check for heading
    await expect(page.locator('h2', { hasText: /login für veranstalter/i })).toBeVisible();

    // Check for email input (by placeholder since label is not properly associated)
    await expect(page.getByPlaceholder('max@beispiel.de')).toBeVisible();

    // Check for submit button (default is Magic Link mode)
    await expect(page.getByRole('button', { name: /magic link senden/i })).toBeVisible();
  });

  test('public event page loads with event data', async ({ page }) => {
    // Setup: Create a published event
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();

    try {
      await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

      // Verify page loaded with event title
      await expect(page.locator('h1', { hasText: event.title })).toBeVisible({ timeout: 10000 });

      // Verify tabs are visible (using emojis from the actual UI)
      await expect(page.getByRole('button', { name: /📋.*liste/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /🗺️.*karte/i })).toBeVisible();
    } finally {
      // Cleanup
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('spot registration page loads form', async ({ page }) => {
    // Setup: Create a published event
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();

    try {
      await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}/register`);

      // Wait for registration confirmation page
      await expect(page.locator('h1', { hasText: /teilnehmen/i })).toBeVisible({ timeout: 10000 });

      // Check for continue button
      const continueButton = page.getByRole('button', { name: /weiter zur spot anmeldung/i });
      await expect(continueButton).toBeVisible();

      // Click to proceed to actual form
      await continueButton.click();

      // Wait for navigation to form tab
      await page.waitForURL(/tab=form/, { timeout: 5000 });

      // Now on spot form - check for address fields (using placeholders since labels may not be properly associated)
      await expect(page.getByPlaceholder(/hauptstraße/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByPlaceholder(/regensburg/i)).toBeVisible();
    } finally {
      // Cleanup
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('404 page renders for invalid route', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist-xyz');

    // Should return 404 status
    expect(response?.status()).toBe(404);

    // Should show 404 message
    await expect(page.locator('body')).toContainText('404');
  });
});
