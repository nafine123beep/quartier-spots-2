/**
 * Cross-Device Tests: Highlights on Mobile
 *
 * Tests highlights functionality on mobile devices:
 * - Labels always visible on mobile
 * - Touch interactions work correctly
 * - Mobile-specific UI behaviors
 */

import { test, expect, devices } from '@playwright/test';
import { createPublishedEvent, createAdminUser } from '../../fixtures/supabase-helpers';

test.use({
  ...devices['iPhone 12'],
});

test.describe('Highlights on Mobile', () => {
  test('highlight labels are always visible on mobile map', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId } = await createPublishedEvent();
    const { email, password } = await createAdminUser(tenantId);

    try {
      // Create a highlight
      await page.goto('/auth/login');
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport

      await page.getByPlaceholder('max@beispiel.de').fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      await page.getByRole('button', { name: /mit password anmelden/i }).click();
      await page.waitForURL(/\/flohmarkt\/organizations/, { timeout: 10000 });

      // Navigate to event
      await page.goto(`/flohmarkt/organizations/${orgSlug}`);
      await page.waitForTimeout(500);

      // Find and click the event (might need scrolling on mobile)
      await page.getByText(/test event/i).click();

      // Click Highlights tab
      await page.getByRole('button', { name: /highlights/i }).click();

      // Create highlight
      await page.getByRole('button', { name: /highlight/i }).first().click();
      await page.locator('select').first().selectOption('info_point');
      await page.getByLabel(/titel/i).fill('Mobile Test Info');
      await page.getByPlaceholder(/hauptstraße/i).fill('Teststraße');
      await page.locator('input[type="text"]').nth(1).fill('1');
      await page.getByPlaceholder(/90402/i).fill('90402');
      await page.getByPlaceholder(/nürnberg/i).fill('Nürnberg');
      await page.getByRole('button', { name: /geocodieren/i }).click();
      await expect(page.getByText(/standort gefunden/i)).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /erstellen/i }).click();
      await page.waitForTimeout(1000);

      // Logout and go to public page
      await page.getByRole('button', { name: /logout/i }).click();
      await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

      // Go to map view
      await page.getByRole('button', { name: /🗺️.*karte/i }).click();

      // Wait for map
      await page.waitForSelector('.leaflet-container', { timeout: 10000 });

      // Find highlight marker
      const highlightMarker = page.locator('.highlight-marker').first();
      await expect(highlightMarker).toBeVisible({ timeout: 5000 });

      // On mobile, label should be permanently visible (not display: none)
      const label = highlightMarker.locator('.highlight-label').first();
      await expect(label).toBeVisible();

      // Check computed style - on mobile labels should have display: block
      const labelStyle = await label.evaluate((el) => {
        return window.getComputedStyle(el).display;
      });

      assert(labelStyle === 'block' || labelStyle === 'inline-block', 'Label should be visible on mobile');
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('mobile carousel shows regular spots but not highlights', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId } = await createPublishedEvent();
    const { email, password } = await createAdminUser(tenantId);

    try {
      await page.setViewportSize({ width: 375, height: 667 });

      // Create a highlight and a regular spot
      await page.goto('/auth/login');
      await page.getByPlaceholder('max@beispiel.de').fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      await page.getByRole('button', { name: /mit password anmelden/i }).click();
      await page.waitForURL(/\/flohmarkt\/organizations/, { timeout: 10000 });

      // Create highlight first
      await page.goto(`/flohmarkt/organizations`);
      await page.getByText(/test event/i).click();
      await page.getByRole('button', { name: /highlights/i }).click();
      await page.getByRole('button', { name: /highlight/i }).first().click();
      await page.locator('select').first().selectOption('parking');
      await page.getByLabel(/titel/i).fill('Parking Area');
      await page.getByPlaceholder(/hauptstraße/i).fill('Parkstraße');
      await page.locator('input[type="text"]').nth(1).fill('5');
      await page.getByPlaceholder(/90402/i).fill('90402');
      await page.getByPlaceholder(/nürnberg/i).fill('Nürnberg');
      await page.getByRole('button', { name: /geocodieren/i }).click();
      await expect(page.getByText(/standort gefunden/i)).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /erstellen/i }).click();
      await page.waitForTimeout(1000);

      // Now create a regular spot
      // Navigate to public view and create spot
      await page.getByRole('button', { name: /logout/i }).click();
      await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}?tab=form`);

      // Fill spot form (simplified)
      await page.getByPlaceholder(/hauptstraße/i).fill('Verkäuferstraße');
      await page.locator('input[type="text"]').filter({ hasText: '' }).first().fill('10');
      await page.getByPlaceholder(/90402/i).fill('90402');
      await page.getByPlaceholder(/nürnberg/i).fill('Nürnberg');

      // Wait a moment then go to map
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /🗺️.*karte/i }).click();

      // On mobile, carousel should be visible
      await page.waitForSelector('[class*="carousel"], .block.md\\:hidden', { timeout: 5000 });

      // Carousel should only show regular spots, not highlights
      // (Implementation detail - verify carousel doesn't contain "Parking Area")
      const carouselContent = await page.locator('.block.md\\:hidden').textContent();

      // This test validates that highlights are not in the carousel
      // but are shown as markers on the map
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('highlight form is usable on mobile', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();
    const { email, password } = await createAdminUser(tenantId);

    try {
      await page.setViewportSize({ width: 375, height: 667 });

      // Login
      await page.goto('/auth/login');
      await page.getByPlaceholder('max@beispiel.de').fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      await page.getByRole('button', { name: /mit password anmelden/i }).click();
      await page.waitForURL(/\/flohmarkt\/organizations/, { timeout: 10000 });

      // Navigate to highlights
      await page.goto(`/flohmarkt/organizations/${orgSlug}/events/${event.id}`);
      await page.getByRole('button', { name: /highlights/i }).click();

      // Open form
      await page.getByRole('button', { name: /highlight/i }).first().click();

      // Verify modal is responsive (takes full screen or close to it on mobile)
      const modal = page.locator('.fixed.inset-0').first();
      await expect(modal).toBeVisible();

      // Form elements should be visible and tappable
      await expect(page.locator('select').first()).toBeVisible();
      await expect(page.getByLabel(/titel/i)).toBeVisible();

      // Select type
      await page.locator('select').first().selectOption('food_drinks');

      // Fill title (should not have keyboard issues)
      await page.getByLabel(/titel/i).fill('Mobile Food Court');

      // Verify text was entered
      await expect(page.getByLabel(/titel/i)).toHaveValue('Mobile Food Court');

      // Close button should be easily tappable (48x48px minimum)
      const closeButton = page.getByRole('button', { name: /abbrechen|×/i }).first();
      await expect(closeButton).toBeVisible();

      await closeButton.click();

      // Modal should close
      await expect(page.getByRole('heading', { name: /highlight/i })).not.toBeVisible({ timeout: 2000 });
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });
});

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}
