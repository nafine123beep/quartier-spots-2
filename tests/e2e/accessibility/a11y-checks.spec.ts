/**
 * Accessibility Tests
 *
 * Automated accessibility checks using axe-core.
 * Tests WCAG 2.1 AA compliance for key pages.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createPublishedEvent, supabaseAdmin } from '../../fixtures/supabase-helpers';

test.describe('Accessibility Tests (WCAG 2.1 AA)', () => {
  let tenantId: string;

  test.afterEach(async () => {
    if (tenantId) {
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/flohmarkt');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/auth/login');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('public event page is accessible', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('spot registration form is accessible', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}/register`);

    // Navigate past confirmation if present
    const continueButton = page.getByRole('button', { name: /weiter/i });
    if (await continueButton.isVisible({ timeout: 2000 })) {
      await continueButton.click();
    }

    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('keyboard navigation works on homepage', async ({ page }) => {
    await page.goto('/flohmarkt');

    // Tab through focusable elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);

    // Tab again
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  });

  test('focus indicators are visible', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    // Navigate directly to the form with tab parameter to skip confirmation page
    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}?tab=form`);
    await page.waitForLoadState('networkidle');

    // Get the focused element's outline - wait for field to be visible first
    const firstInput = page.getByLabel(/straße/i);
    await expect(firstInput).toBeVisible({ timeout: 15000 });
    await firstInput.focus();

    const outlineStyle = await firstInput.evaluate((el) => {
      return window.getComputedStyle(el).outline;
    });

    // Outline should exist (not be 'none' or empty)
    expect(outlineStyle).toBeTruthy();
    expect(outlineStyle).not.toBe('none');
  });

  test('buttons have minimum touch target size', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Check all visible buttons
    const buttons = page.locator('button:visible');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      if (box) {
        // WCAG 2.5.5: Minimum 44x44px for touch targets
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('page supports 200% zoom without content loss', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    // Simulate 200% zoom by increasing font size
    await page.addStyleTag({ content: 'html { font-size: 32px !important; }' });

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Verify no horizontal scroll
    const body = page.locator('body');
    const hasHorizontalScroll = await body.evaluate((el) => el.scrollWidth > el.clientWidth);

    expect(hasHorizontalScroll).toBe(false);
  });
});
