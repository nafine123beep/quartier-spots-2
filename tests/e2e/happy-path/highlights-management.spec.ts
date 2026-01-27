/**
 * Happy Path Tests: Highlights Management
 *
 * Tests the complete workflow for event highlights:
 * - Creating highlights as admin
 * - Editing highlights
 * - Managing custom highlight types
 * - Deleting highlights
 * - Viewing highlights in public views
 */

import { test, expect } from '@playwright/test';
import { createPublishedEvent, createAdminUser } from '../../fixtures/supabase-helpers';

test.describe('Highlights Management Happy Path', () => {
  test('admin can create, edit, and delete highlights', async ({ page }) => {
    // Setup: Create published event and admin user
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();
    const { email, password, userId } = await createAdminUser(tenantId);

    try {
      // Login as admin
      await page.goto('/auth/login');
      await page.getByPlaceholder('max@beispiel.de').fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      await page.getByRole('button', { name: /mit password anmelden/i }).click();

      // Wait for redirect to organizations page
      await page.waitForURL(/\/flohmarkt\/organizations/, { timeout: 10000 });

      // Navigate to event detail
      await page.goto(`/flohmarkt/organizations/${orgSlug}/events/${event.id}`);

      // Click on Highlights tab
      await page.getByRole('button', { name: /highlights/i }).click();

      // Verify empty state
      await expect(page.getByText(/noch keine highlights vorhanden/i)).toBeVisible();

      // Click "Erstes Highlight erstellen" or "Highlight hinzufügen" button
      const addButton = page.getByRole('button', { name: /highlight/i }).first();
      await addButton.click();

      // Wait for modal to appear
      await expect(page.getByRole('heading', { name: /neues highlight erstellen/i })).toBeVisible();

      // Fill highlight form
      await page.locator('select[name="highlightType"], select').first().selectOption('registration');
      await page.getByLabel(/titel/i).fill('Haupteingang Registrierung');
      await page.getByLabel(/beschreibung/i).fill('Hier kannst du dich anmelden und dein Event-Badge abholen');

      // Fill address fields
      await page.getByPlaceholder(/hauptstraße/i).fill('Königstraße');
      await page.locator('input[placeholder*="15"], input[type="text"]').nth(1).fill('1');
      await page.getByPlaceholder(/90402/i).fill('90402');
      await page.getByPlaceholder(/nürnberg/i).fill('Nürnberg');

      // Click geocode button
      await page.getByRole('button', { name: /geocodieren/i }).click();

      // Wait for geocoding to complete
      await expect(page.getByText(/standort gefunden/i)).toBeVisible({ timeout: 10000 });

      // Save highlight
      await page.getByRole('button', { name: /erstellen|speichern/i }).click();

      // Verify highlight appears in table
      await expect(page.getByText('Haupteingang Registrierung')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('📋')).toBeVisible();

      // Edit the highlight
      await page.getByRole('button', { name: /bearbeiten/i }).click();

      // Wait for modal
      await expect(page.getByRole('heading', { name: /highlight bearbeiten/i })).toBeVisible();

      // Change title
      await page.getByLabel(/titel/i).clear();
      await page.getByLabel(/titel/i).fill('Haupteingang Check-In');

      // Save changes
      await page.getByRole('button', { name: /speichern/i }).click();

      // Verify updated title
      await expect(page.getByText('Haupteingang Check-In')).toBeVisible({ timeout: 5000 });

      // Delete the highlight
      await page.getByRole('button', { name: /löschen/i }).click();

      // Confirm deletion
      page.on('dialog', dialog => dialog.accept());
      await page.waitForTimeout(500);

      // Verify highlight is removed
      await expect(page.getByText('Haupteingang Check-In')).not.toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/noch keine highlights vorhanden/i)).toBeVisible();
    } finally {
      // Cleanup
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('admin can create and use custom highlight types', async ({ page }) => {
    // Setup
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();
    const { email, password } = await createAdminUser(tenantId);

    try {
      // Login as admin
      await page.goto('/auth/login');
      await page.getByPlaceholder('max@beispiel.de').fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      await page.getByRole('button', { name: /mit password anmelden/i }).click();
      await page.waitForURL(/\/flohmarkt\/organizations/, { timeout: 10000 });

      // Navigate to event highlights
      await page.goto(`/flohmarkt/organizations/${orgSlug}/events/${event.id}`);
      await page.getByRole('button', { name: /highlights/i }).click();

      // Open custom types manager
      await page.getByRole('button', { name: /typen verwalten/i }).click();

      // Wait for modal
      await expect(page.getByRole('heading', { name: /benutzerdefinierte.*typen/i })).toBeVisible();

      // Create custom type
      await page.getByLabel(/typ-key/i).fill('first_aid_station');
      await page.getByLabel(/bezeichnung|label/i).fill('Erste-Hilfe Station');

      // Select icon (⚕️ - Medical icon)
      const iconSelector = page.locator('button').filter({ hasText: '⚕️' }).first();
      await iconSelector.click();

      // Save custom type
      await page.getByRole('button', { name: /hinzufügen|typ erstellen/i }).click();

      // Verify custom type appears in list
      await expect(page.getByText('Erste-Hilfe Station')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('⚕️')).toBeVisible();

      // Close custom types modal
      await page.getByRole('button', { name: /schließen/i }).click();

      // Now create a highlight with the custom type
      await page.getByRole('button', { name: /highlight hinzufügen/i }).click();

      // Select custom type from dropdown
      await page.locator('select').first().selectOption('first_aid_station');

      // Verify icon is displayed
      await expect(page.getByText('⚕️')).toBeVisible();

      // Fill required fields
      await page.getByLabel(/titel/i).fill('Sanitätszelt Nord');
      await page.getByPlaceholder(/hauptstraße/i).fill('Äußere Bayreuther Straße');
      await page.locator('input[type="text"]').nth(1).fill('50');
      await page.getByPlaceholder(/90402/i).fill('90491');
      await page.getByPlaceholder(/nürnberg/i).fill('Nürnberg');

      // Geocode
      await page.getByRole('button', { name: /geocodieren/i }).click();
      await expect(page.getByText(/standort gefunden/i)).toBeVisible({ timeout: 10000 });

      // Save
      await page.getByRole('button', { name: /erstellen/i }).click();

      // Verify highlight with custom type appears
      await expect(page.getByText('Sanitätszelt Nord')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Erste-Hilfe Station')).toBeVisible();
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('highlights display correctly in public views', async ({ page }) => {
    // Setup: Create event with highlights
    const { orgSlug, eventSlug, tenantId, event } = await createPublishedEvent();
    const { email, password } = await createAdminUser(tenantId);

    try {
      // Login and create highlight
      await page.goto('/auth/login');
      await page.getByPlaceholder('max@beispiel.de').fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      await page.getByRole('button', { name: /mit password anmelden/i }).click();
      await page.waitForURL(/\/flohmarkt\/organizations/, { timeout: 10000 });

      await page.goto(`/flohmarkt/organizations/${orgSlug}/events/${event.id}`);
      await page.getByRole('button', { name: /highlights/i }).click();

      // Create a highlight
      await page.getByRole('button', { name: /highlight/i }).first().click();
      await page.locator('select').first().selectOption('toilets');
      await page.getByLabel(/titel/i).fill('Öffentliche Toiletten');
      await page.getByLabel(/beschreibung/i).fill('Sanitäranlagen für alle Teilnehmer');
      await page.getByPlaceholder(/hauptstraße/i).fill('Königstraße');
      await page.locator('input[type="text"]').nth(1).fill('10');
      await page.getByPlaceholder(/90402/i).fill('90402');
      await page.getByPlaceholder(/nürnberg/i).fill('Nürnberg');
      await page.getByRole('button', { name: /geocodieren/i }).click();
      await expect(page.getByText(/standort gefunden/i)).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /erstellen/i }).click();

      // Wait for save
      await page.waitForTimeout(1000);

      // Logout
      await page.getByRole('button', { name: /logout/i }).click();

      // Now visit public event page
      await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

      // Click on List view (📋 Liste)
      await page.getByRole('button', { name: /📋.*liste/i }).click();

      // Wait for list to load
      await page.waitForTimeout(500);

      // Verify highlights section exists and displays highlight
      await expect(page.getByText(/event highlights/i)).toBeVisible();
      await expect(page.getByText('Öffentliche Toiletten')).toBeVisible();
      await expect(page.getByText('🚻')).toBeVisible();
      await expect(page.getByText(/sanitäranlagen für alle teilnehmer/i)).toBeVisible();

      // Click on Map view (🗺️ Karte)
      await page.getByRole('button', { name: /🗺️.*karte/i }).click();

      // Wait for map to load
      await page.waitForSelector('.leaflet-container', { timeout: 10000 });

      // Verify highlight marker exists (yellow marker with emoji)
      const highlightMarker = page.locator('.highlight-marker').first();
      await expect(highlightMarker).toBeVisible({ timeout: 5000 });

      // Verify emoji is visible in marker
      await expect(highlightMarker.locator('text=🚻')).toBeVisible();

      // Click highlight marker to open popup
      await highlightMarker.click();

      // Verify popup shows highlight info
      await expect(page.locator('.leaflet-popup-content')).toContainText('Öffentliche Toiletten');
    } finally {
      const { supabaseAdmin } = await import('../../fixtures/supabase-helpers');
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });
});
