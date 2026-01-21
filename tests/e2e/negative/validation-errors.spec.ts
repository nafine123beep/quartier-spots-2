/**
 * Negative Tests: Validation Errors
 *
 * Tests form validation and error handling.
 * Verifies that invalid inputs are properly rejected with clear error messages.
 */

import { test, expect } from '@playwright/test';
import { createPublishedEvent, supabaseAdmin } from '../../fixtures/supabase-helpers';

test.describe('Validation Error Tests', () => {
  let tenantId: string;

  test.afterEach(async () => {
    if (tenantId) {
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('spot form blocks submission with empty required fields', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    // Navigate directly to event page with form tab
    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}?tab=form`);

    // Wait for form to load
    await page.getByLabel(/straße|street/i).waitFor({ timeout: 10000 });

    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: /absenden|submit/i });
    await submitButton.click();

    // HTML5 validation should block submit
    const streetInput = page.getByLabel(/straße|street/i);
    const isRequired = await streetInput.getAttribute('required');
    expect(isRequired).not.toBeNull();

    // Verify form did not submit (still on same page)
    await expect(streetInput).toBeVisible();
  });

  test('spot form shows error for invalid address', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    // Navigate directly to event page with form tab
    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}?tab=form`);

    // Wait for form to load
    await page.getByLabel(/straße|street/i).waitFor({ timeout: 10000 });

    // Fill with obviously invalid address
    await page.getByLabel(/straße|street/i).fill('XyzNonExistentStreet99999');
    await page.getByLabel(/stadt|city/i).fill('FakeCity12345ABC');

    // Fill other required fields
    await page.getByLabel(/einverstanden|consent/i).check();
    await page.getByLabel(/was bietest du an/i).fill('Test items');

    // Listen for the alert dialog that shows geocoding error
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.getByRole('button', { name: /absenden|submit/i }).click();

    // Wait for alert to be triggered and verify error message
    await page.waitForTimeout(2000); // Wait for geocoding request to complete
    expect(alertMessage).toMatch(/nicht gefunden|not found|adresse|address/i);
  });

  test('spot form requires consent checkbox to be checked', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    // Navigate directly to event page with form tab
    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}?tab=form`);

    // Wait for form to load
    await page.getByLabel(/straße|street/i).waitFor({ timeout: 10000 });

    // Fill all fields except consent
    await page.getByLabel(/straße|street/i).fill('Teststraße');
    await page.getByLabel(/stadt|city/i).fill('Regensburg');
    await page.getByLabel(/was bietest du an/i).fill('Test');

    // Do NOT check consent checkbox

    await page.getByRole('button', { name: /absenden|submit/i }).click();

    // Should be blocked by validation
    const consentCheckbox = page.getByLabel(/einverstanden|consent/i);
    const isRequired = await consentCheckbox.getAttribute('required');
    expect(isRequired).not.toBeNull();

    // Form should not submit
    await expect(consentCheckbox).toBeVisible();
  });

  test('draft event is not accessible to public without login', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent({
      status: 'draft'
    });
    tenantId = tid;

    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);

    // Should show error message - use heading to avoid strict mode violation
    await expect(page.getByRole('heading', { name: /nicht gefunden|not found/i })).toBeVisible({ timeout: 5000 });
  });

  test('invalid preview token is rejected', async ({ page }) => {
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent({
      status: 'draft'
    });
    tenantId = tid;

    // Try to access with invalid preview token
    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}?preview=invalid-token-xyz-123`);

    // Should show error message - currently shows generic "not found" error
    await expect(page.getByRole('heading', { name: /nicht gefunden|not found/i })).toBeVisible({ timeout: 5000 });
  });
});
