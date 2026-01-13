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

    // Should default to list view
    await expect(page.locator('body')).toBeVisible();

    // Scroll through list
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);

    // Verify scroll worked
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(400);
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
