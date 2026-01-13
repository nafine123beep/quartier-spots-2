/**
 * Authentication Test Fixtures
 *
 * Helpers for logging in as different user types in tests.
 * Provides reusable authentication state for faster test execution.
 */

import { Page } from '@playwright/test';

/**
 * Logs in as an organizer (admin) user using password authentication
 */
export async function loginAsOrganizer(page: Page) {
  const email = process.env.TEST_ORGANIZER_EMAIL!;
  const password = process.env.TEST_PASSWORD!;

  if (!email || !password) {
    throw new Error('TEST_ORGANIZER_EMAIL or TEST_PASSWORD not set in .env.test');
  }

  await page.goto('/auth/login');

  // Fill email
  await page.getByLabel('E-Mail').fill(email);

  // Switch to password mode if not already
  const passwordButton = page.getByRole('button', { name: /passwort/i });
  const isPasswordMode = await passwordButton.isVisible().catch(() => false);

  if (isPasswordMode) {
    await passwordButton.click();
  }

  // Fill password
  await page.getByLabel('Passwort', { exact: false }).fill(password);

  // Click login button
  await page.getByRole('button', { name: /anmelden|login/i }).click();

  // Wait for successful login (redirect to organizations or onboarding)
  await page.waitForURL(/\/flohmarkt\/(organizations|onboarding)/, { timeout: 10000 });
}

/**
 * Logs in as a regular member (non-admin) user
 */
export async function loginAsMember(page: Page) {
  const email = process.env.TEST_MEMBER_EMAIL!;
  const password = process.env.TEST_PASSWORD!;

  if (!email || !password) {
    throw new Error('TEST_MEMBER_EMAIL or TEST_PASSWORD not set in .env.test');
  }

  await page.goto('/auth/login');

  await page.getByLabel('E-Mail').fill(email);

  const passwordButton = page.getByRole('button', { name: /passwort/i });
  const isPasswordMode = await passwordButton.isVisible().catch(() => false);

  if (isPasswordMode) {
    await passwordButton.click();
  }

  await page.getByLabel('Passwort', { exact: false }).fill(password);
  await page.getByRole('button', { name: /anmelden|login/i }).click();

  await page.waitForURL(/\/flohmarkt\/(organizations|onboarding)/, { timeout: 10000 });
}

/**
 * Checks if user is currently logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Check for user-specific elements
    const userElement = await page.locator('[data-testid="user-menu"]').isVisible({ timeout: 1000 });
    return userElement;
  } catch {
    return false;
  }
}

/**
 * Logs out the current user
 */
export async function logout(page: Page) {
  // Navigate to a page with logout option
  await page.goto('/flohmarkt/settings/profile');

  // Click logout button
  await page.getByRole('button', { name: /abmelden|logout/i }).click();

  // Wait for redirect to login
  await page.waitForURL('/auth/login', { timeout: 5000 });
}

/**
 * Completes onboarding for a new user
 */
export async function completeOnboarding(page: Page, displayName: string, organizationName?: string) {
  // Should be on onboarding page
  await page.waitForURL('/onboarding', { timeout: 5000 });

  // Step 1: Set display name
  await page.getByLabel(/dein name|name/i).fill(displayName);
  await page.getByRole('button', { name: /weiter|next/i }).click();

  // Step 2: Set password (optional)
  const passwordInput = page.getByLabel(/passwort|password/i);
  const hasPasswordStep = await passwordInput.isVisible({ timeout: 2000 }).catch(() => false);

  if (hasPasswordStep) {
    // Skip password setup
    const skipButton = page.getByRole('button', { name: /überspringen|skip/i });
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
  }

  // Step 3: Create or join organization
  if (organizationName) {
    await page.getByLabel(/organisation|organization/i).fill(organizationName);
    await page.getByLabel(/passwort|password/i).fill('test-org-password');
    await page.getByRole('button', { name: /erstellen|create/i }).click();
  }

  // Wait for completion
  await page.waitForURL('/flohmarkt/organizations', { timeout: 10000 });
}
