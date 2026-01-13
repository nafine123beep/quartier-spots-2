/**
 * Smoke Tests: App Startup
 *
 * Verifies that the application starts successfully and core pages load without errors.
 * These are the fastest tests and should run first to catch critical failures early.
 */

import { test, expect } from '@playwright/test';

test.describe('App Startup Smoke Tests', () => {
  test('app starts successfully and homepage loads', async ({ page }) => {
    const response = await page.goto('/flohmarkt');

    // Verify HTTP 200 response
    expect(response?.status()).toBeLessThan(400);

    // Verify page has expected elements
    await expect(page.locator('body')).toBeVisible();

    // No 500 error text
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('no JavaScript errors on homepage', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/flohmarkt');
    await page.waitForLoadState('networkidle');

    // Expect no JavaScript errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('login page loads without errors', async ({ page }) => {
    const response = await page.goto('/auth/login');

    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toContainText('500');
  });
});
