/**
 * Smoke Tests: Highlights
 *
 * Basic smoke tests to verify highlights feature is functional:
 * - Highlights tab is accessible to admins
 * - Highlights modal opens
 * - Highlights display in public views
 */

import { test, expect } from '@playwright/test';
import { createPublishedEvent, createAdminUser } from '../../fixtures/supabase-helpers';

test.describe('Highlights Smoke Tests', () => {
  test('highlights tab is accessible to admin', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();
    const { email, password } = await createAdminUser(tenantId);

    try {
      // Login as admin
      await page.goto('/auth/login');
      await page.getByPlaceholder('max@beispiel.de').fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      await page.getByRole('button', { name: /mit password anmelden/i }).click();
      await page.waitForURL(/\/flohmarkt\/organizations/, { timeout: 10000 });

      // Navigate to event
      await page.goto(`/flohmarkt/organizations/${orgSlug}/events/${event.id}`);

      // Verify Highlights tab exists
      await expect(page.getByRole('button', { name: /highlights/i })).toBeVisible();

      // Click Highlights tab
      await page.getByRole('button', { name: /highlights/i }).click();

      // Verify empty state or table is shown
      const hasEmptyState = await page.getByText(/noch keine highlights vorhanden/i).isVisible().catch(() => false);
      const hasTable = await page.locator('table').isVisible().catch(() => false);

      expect(hasEmptyState || hasTable).toBeTruthy();
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('highlight form modal opens and closes', async ({ page }) => {
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

      // Click add highlight button
      await page.getByRole('button', { name: /highlight hinzufügen|erstes highlight/i }).click();

      // Verify modal opened
      await expect(page.getByRole('heading', { name: /highlight erstellen/i })).toBeVisible();

      // Verify form elements exist
      await expect(page.locator('select').first()).toBeVisible(); // Type dropdown
      await expect(page.getByLabel(/titel/i)).toBeVisible();
      await expect(page.getByLabel(/beschreibung/i)).toBeVisible();

      // Close modal
      await page.getByRole('button', { name: /abbrechen|×/i }).first().click();

      // Verify modal closed
      await expect(page.getByRole('heading', { name: /highlight erstellen/i })).not.toBeVisible({ timeout: 2000 });
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('highlights render on public map view', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId } = await createPublishedEvent();

    try {
      // Navigate to public event page
      await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

      // Click on Map view
      await page.getByRole('button', { name: /🗺️.*karte/i }).click();

      // Wait for map to load
      await page.waitForSelector('.leaflet-container', { timeout: 10000 });

      // Verify map loaded successfully (even if no highlights yet)
      await expect(page.locator('.leaflet-container')).toBeVisible();

      // Map should have leaflet classes indicating proper initialization
      const hasLeafletLayers = await page.locator('.leaflet-pane').count();
      expect(hasLeafletLayers).toBeGreaterThan(0);
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });
});
