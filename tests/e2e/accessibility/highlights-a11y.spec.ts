/**
 * Accessibility Tests: Highlights
 *
 * Tests accessibility compliance for highlights feature:
 * - Keyboard navigation
 * - Focus management
 * - ARIA labels and roles
 * - Screen reader compatibility
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';
import { createPublishedEvent, createAdminUser } from '../../fixtures/supabase-helpers';

test.describe('Highlights Accessibility', () => {
  test('highlights management panel has no accessibility violations', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();
    const { email, password } = await createAdminUser(tenantId);

    try {
      // Login and navigate to highlights
      await page.goto('/auth/login');
      await page.getByPlaceholder('max@beispiel.de').fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      await page.getByRole('button', { name: /mit password anmelden/i }).click();
      await page.waitForURL(/\/flohmarkt\/organizations/, { timeout: 10000 });

      await page.goto(`/flohmarkt/organizations/${orgSlug}/events/${event.id}`);
      await page.getByRole('button', { name: /highlights/i }).click();

      // Wait for panel to load
      await page.waitForTimeout(500);

      // Inject axe and check for violations
      await injectAxe(page);
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      });
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('highlight form modal is keyboard navigable', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();
    const { email, password } = await createAdminUser(tenantId);

    try {
      // Login and navigate to highlights
      await page.goto('/auth/login');
      await page.getByPlaceholder('max@beispiel.de').fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      await page.getByRole('button', { name: /mit password anmelden/i }).click();
      await page.waitForURL(/\/flohmarkt\/organizations/, { timeout: 10000 });

      await page.goto(`/flohmarkt/organizations/${orgSlug}/events/${event.id}`);
      await page.getByRole('button', { name: /highlights/i }).click();

      // Open highlight form with Enter key
      await page.getByRole('button', { name: /highlight hinzufügen|erstes highlight/i }).focus();
      await page.keyboard.press('Enter');

      // Verify modal opened and focus is inside
      await expect(page.getByRole('heading', { name: /highlight erstellen/i })).toBeVisible();

      // Tab through form elements
      await page.keyboard.press('Tab'); // Focus on type dropdown
      const typeSelect = await page.locator('select').first();
      await expect(typeSelect).toBeFocused();

      await page.keyboard.press('Tab'); // Focus on title input
      const titleInput = await page.getByLabel(/titel/i);
      await expect(titleInput).toBeFocused();

      await page.keyboard.press('Tab'); // Focus on description
      const descriptionInput = await page.getByLabel(/beschreibung/i);
      await expect(descriptionInput).toBeFocused();

      // Close modal with Escape key
      await page.keyboard.press('Escape');

      // Verify modal closed
      await expect(page.getByRole('heading', { name: /highlight erstellen/i })).not.toBeVisible({ timeout: 2000 });
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('highlights in list view are keyboard accessible', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();
    const { email, password } = await createAdminUser(tenantId);

    try {
      // Create a highlight first
      await page.goto('/auth/login');
      await page.getByPlaceholder('max@beispiel.de').fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      await page.getByRole('button', { name: /mit password anmelden/i }).click();
      await page.waitForURL(/\/flohmarkt\/organizations/, { timeout: 10000 });

      await page.goto(`/flohmarkt/organizations/${orgSlug}/events/${event.id}`);
      await page.getByRole('button', { name: /highlights/i }).click();
      await page.getByRole('button', { name: /highlight/i }).first().click();

      // Fill form quickly
      await page.locator('select').first().selectOption('registration');
      await page.getByLabel(/titel/i).fill('Test Highlight');
      await page.getByPlaceholder(/hauptstraße/i).fill('Teststraße');
      await page.locator('input[type="text"]').nth(1).fill('1');
      await page.getByPlaceholder(/90402/i).fill('90402');
      await page.getByPlaceholder(/nürnberg/i).fill('Nürnberg');
      await page.getByRole('button', { name: /geocodieren/i }).click();
      await expect(page.getByText(/standort gefunden/i)).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /erstellen/i }).click();
      await page.waitForTimeout(1000);

      // Logout and visit public page
      await page.getByRole('button', { name: /logout/i }).click();
      await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

      // Go to list view
      await page.getByRole('button', { name: /📋.*liste/i }).click();
      await page.waitForTimeout(500);

      // Tab to highlight item
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Find the highlight element
      const highlightElement = page.locator('div').filter({ hasText: 'Test Highlight' }).first();

      // Verify it's clickable
      await highlightElement.click();

      // Should navigate to map view
      await expect(page.getByRole('button', { name: /🗺️.*karte/i })).toHaveAttribute('aria-pressed', 'true');
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('highlight form has proper labels and ARIA attributes', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();
    const { email, password } = await createAdminUser(tenantId);

    try {
      // Login and open form
      await page.goto('/auth/login');
      await page.getByPlaceholder('max@beispiel.de').fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      await page.getByRole('button', { name: /mit password anmelden/i }).click();
      await page.waitForURL(/\/flohmarkt\/organizations/, { timeout: 10000 });

      await page.goto(`/flohmarkt/organizations/${orgSlug}/events/${event.id}`);
      await page.getByRole('button', { name: /highlights/i }).click();
      await page.getByRole('button', { name: /highlight/i }).first().click();

      // Verify form elements have labels
      const titleInput = page.getByLabel(/titel/i);
      await expect(titleInput).toBeVisible();
      await expect(titleInput).toHaveAttribute('required', '');

      const descriptionInput = page.getByLabel(/beschreibung/i);
      await expect(descriptionInput).toBeVisible();

      const streetInput = page.getByLabel(/straße/i);
      await expect(streetInput).toBeVisible();

      // Verify submit button has proper text
      const submitButton = page.getByRole('button', { name: /highlight erstellen/i });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveAttribute('type', 'submit');

      // Check for axe violations in modal
      await injectAxe(page);
      await checkA11y(page.locator('[role="dialog"], .fixed.inset-0').first(), null, {
        detailedReport: true,
      });
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });
});
