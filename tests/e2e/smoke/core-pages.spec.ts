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

    // Check for email input
    await expect(page.getByLabel(/e-mail|email/i)).toBeVisible();

    // Check for submit button
    await expect(page.getByRole('button', { name: /senden|login|anmelden/i })).toBeVisible();
  });

  test('public event page loads with event data', async ({ page }) => {
    // Setup: Create a published event
    const { orgSlug, eventSlug, tenantId } = await createPublishedEvent();

    try {
      await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

      // Verify page loaded
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

      // Verify tabs are visible
      await expect(page.getByRole('button', { name: /liste|list/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /karte|map/i })).toBeVisible();
    } finally {
      // Cleanup
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('spot registration page loads form', async ({ page }) => {
    // Setup: Create a published event
    const { orgSlug, eventSlug, tenantId } = await createPublishedEvent();

    try {
      await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}/register`);

      // Wait for registration confirmation page
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

      // Check for continue button
      const continueButton = page.getByRole('button', { name: /weiter|continue/i });
      if (await continueButton.isVisible({ timeout: 2000 })) {
        await continueButton.click();
      }

      // Now on spot form - check for address fields
      await expect(page.getByLabel(/straße|street/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByLabel(/stadt|city/i)).toBeVisible();
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
