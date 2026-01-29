/**
 * Smoke Tests: PDF Export
 *
 * Basic smoke tests to verify PDF export feature is functional:
 * - PDF button is accessible to admin users
 * - PDF modal opens and shows map preview
 * - PDF generation completes successfully
 *
 * Note: These tests require a configured test environment with Supabase.
 * Tests that require authentication may fail if the test user is not set up.
 */

import { test, expect } from '@playwright/test';
import { createPublishedEvent, createEventWithSpots, supabaseAdmin } from '../../fixtures/supabase-helpers';
import { generateUniqueId } from '../../fixtures/data-generators';

// Helper function for robust login
async function loginAsAdmin(page: any) {
  const email = process.env.TEST_ORGANIZER_EMAIL!;
  const password = process.env.TEST_PASSWORD!;

  await page.goto('/auth/login');
  // Switch to password tab
  await page.getByRole('button', { name: /passwort/i }).click();
  await page.waitForTimeout(500);
  await page.getByPlaceholder('max@beispiel.de').fill(email);
  await page.getByPlaceholder(/passwort/i).fill(password);
  await page.getByRole('button', { name: /anmelden/i }).click();

  // Wait for redirect with longer timeout
  await page.waitForURL(/\/flohmarkt/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

test.describe('PDF Export Smoke Tests', () => {
  test('PDF button is visible on event detail page for admin', async ({ page }) => {
    test.setTimeout(45000);

    let tenantId: string | null = null;

    try {
      const result = await createPublishedEvent();
      tenantId = result.tenantId;

      await loginAsAdmin(page);

      // Navigate to event detail page
      await page.goto(`/flohmarkt/organizations/${result.orgSlug}/events/${result.event.id}`);
      await page.waitForLoadState('networkidle');

      // Verify "PDF erstellen" button is visible in the overview tab
      await expect(page.getByRole('button', { name: /pdf erstellen/i })).toBeVisible({ timeout: 5000 });

      console.log('PDF button is visible on event detail page');
    } finally {
      if (tenantId) {
        await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
      }
    }
  });

  test('PDF modal opens and shows map preview', async ({ page }) => {
    test.setTimeout(45000);

    let tenantId: string | null = null;

    try {
      const result = await createPublishedEvent();
      tenantId = result.tenantId;

      await loginAsAdmin(page);

      await page.goto(`/flohmarkt/organizations/${result.orgSlug}/events/${result.event.id}`);
      await page.waitForLoadState('networkidle');

      // Click PDF button
      await page.getByRole('button', { name: /pdf erstellen/i }).click();

      // Verify modal opened
      await expect(page.getByRole('heading', { name: /pdf erstellen/i })).toBeVisible({ timeout: 5000 });

      // Verify instructions are shown
      await expect(page.getByText(/schritt 1/i)).toBeVisible();
      await expect(page.getByText(/schritt 2/i)).toBeVisible();

      // Verify map is loading or loaded
      const mapContainer = page.locator('.leaflet-container');
      await expect(mapContainer).toBeVisible({ timeout: 10000 });

      // Verify the generate button is visible
      await expect(page.getByRole('button', { name: /pdf erstellen/i }).last()).toBeVisible();

      // Close modal
      await page.getByRole('button', { name: /abbrechen/i }).click();

      // Verify modal closed
      await expect(page.getByRole('heading', { name: /pdf erstellen/i })).not.toBeVisible({ timeout: 2000 });

      console.log('PDF modal opens and closes correctly');
    } finally {
      if (tenantId) {
        await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
      }
    }
  });

  test('PDF modal shows spot and highlight counts', async ({ page }) => {
    test.setTimeout(60000);

    let tenantId: string | null = null;

    try {
      // Create event with some spots
      const result = await createEventWithSpots(3);
      tenantId = result.tenantId;

      // Add a highlight
      const uniqueId = generateUniqueId();
      await supabaseAdmin.from('spots').insert({
        tenant_id: result.tenantId,
        event_id: result.eventId,
        street: 'Highlight Street',
        house_number: '1',
        zip: '93051',
        city: 'Regensburg',
        address_raw: 'Highlight Street 1, 93051 Regensburg',
        address_public: true,
        lat: 49.015,
        lng: 12.102,
        geo_precision: 'exact',
        is_highlight: true,
        highlight_type: 'registration',
        highlight_icon: '📋',
        title: `Test Highlight ${uniqueId}`,
      });

      await loginAsAdmin(page);

      await page.goto(`/flohmarkt/organizations/${result.orgSlug}/events/${result.eventId}`);
      await page.waitForLoadState('networkidle');

      // Open PDF modal
      await page.getByRole('button', { name: /pdf erstellen/i }).click();
      await expect(page.getByRole('heading', { name: /pdf erstellen/i })).toBeVisible({ timeout: 5000 });

      // Verify stats overlay shows correct counts
      await expect(page.getByText(/pdf-inhalt/i)).toBeVisible();
      await expect(page.getByText(/3 spots/i)).toBeVisible();
      await expect(page.getByText(/1 highlight/i)).toBeVisible();

      console.log('PDF modal shows correct spot and highlight counts');
    } finally {
      if (tenantId) {
        await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
      }
    }
  });

  test('PDF download triggers on generate', async ({ page }) => {
    test.setTimeout(90000); // Allow more time for PDF generation

    let tenantId: string | null = null;

    try {
      const result = await createEventWithSpots(2);
      tenantId = result.tenantId;

      await loginAsAdmin(page);

      await page.goto(`/flohmarkt/organizations/${result.orgSlug}/events/${result.eventId}`);
      await page.waitForLoadState('networkidle');

      // Open PDF modal
      await page.getByRole('button', { name: /pdf erstellen/i }).click();

      // Wait for map to load
      await page.waitForSelector('.leaflet-container', { timeout: 15000 });
      await page.waitForTimeout(3000); // Wait for tiles to load

      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 45000 });

      // Click generate PDF button (the one inside the modal)
      const generateButton = page.locator('button').filter({ hasText: /pdf erstellen/i }).last();
      await generateButton.click();

      // Wait for download to start
      const download = await downloadPromise;

      // Verify download filename contains .pdf
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);

      console.log(`PDF downloaded: ${download.suggestedFilename()}`);
    } finally {
      if (tenantId) {
        await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
      }
    }
  });

  test('PDF button is NOT visible to non-authenticated users', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId } = await createPublishedEvent();

    try {
      // Navigate to public event page WITHOUT login
      await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);
      await page.waitForLoadState('networkidle');

      // Verify the page loaded (public view)
      await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 5000 });

      // Verify there's no PDF button visible
      const pdfButton = page.getByRole('button', { name: /pdf erstellen/i });
      await expect(pdfButton).not.toBeVisible();

      console.log('PDF button is correctly hidden from public users');
    } finally {
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });
});
