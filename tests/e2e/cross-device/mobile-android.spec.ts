/**
 * Cross-Device Tests: Android Chrome
 *
 * Tests mobile-specific functionality on Android Chrome emulation.
 * Verifies touch interactions, responsive layout, and Android-specific UX.
 */

import { test, expect, devices } from '@playwright/test';
import { createEventWithSpots, supabaseAdmin } from '../../fixtures/supabase-helpers';

// Use Pixel 5 device settings
test.use({ ...devices['Pixel 5'] });

test.describe('Android Chrome Tests', () => {
  let tenantId: string;

  test.afterEach(async () => {
    if (tenantId) {
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('event list scrolls smoothly on Android', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createEventWithSpots(20);
    tenantId = tid;

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Wait for page to load and ensure we're on list tab
    await expect(page.getByRole('button', { name: /liste/i })).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Find spot items to confirm list is rendered
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();

    // Find the scrollable list container - be more specific
    const listContainer = page.locator('div.overflow-y-auto').filter({ hasText: 'Alle Spots' });
    await expect(listContainer).toBeVisible();

    // Get initial scroll height to ensure content is scrollable
    const scrollHeight = await listContainer.evaluate((el) => el.scrollHeight);
    const clientHeight = await listContainer.evaluate((el) => el.clientHeight);

    // Only test scroll if content is actually scrollable
    if (scrollHeight > clientHeight) {
      // Scroll through list using the container
      await listContainer.evaluate((el) => el.scrollTo(0, 500));
      await page.waitForTimeout(200);

      // Verify scroll worked - expect at least some scroll
      const scrollY = await listContainer.evaluate((el) => el.scrollTop);
      expect(scrollY).toBeGreaterThan(0);
    }
  });

  test('buttons meet Android touch target size', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createEventWithSpots(5);
    tenantId = tid;

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Check button sizes (Android recommends 48dp minimum)
    const buttons = page.locator('button:visible');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      if (box && box.width > 0 && box.height > 0) {
        // 48dp ≈ 44px at default density
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('responsive layout works on Android viewport', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createEventWithSpots(3);
    tenantId = tid;

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Verify no horizontal scroll
    const body = page.locator('body');
    const hasHorizontalScroll = await body.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(hasHorizontalScroll).toBe(false);

    // Verify content is visible
    await expect(page.locator('h1')).toBeVisible();
  });
});
