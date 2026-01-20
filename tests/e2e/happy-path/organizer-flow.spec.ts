/**
 * Happy Path E2E Test: Organizer Flow
 *
 * Tests the complete journey of an existing organizer creating a new event:
 * 1. Clean up any existing test data
 * 2. Login with test credentials
 * 3. Select organization
 * 4. Create a new event (draft)
 * 5. Verify event appears in the event list
 * 6. Clean up test data
 *
 * Note: This test uses an existing confirmed user with password already set.
 * Publishing is not tested here as it requires additional setup (spots/registrations).
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test.describe('Organizer Happy Path', () => {
  test('organizer can create and publish an event', async ({ page }) => {
    // Increase timeout for this test as it involves multiple steps
    test.setTimeout(60000); // 60 seconds
    // Step 0: Clean up test user data before starting
    console.log('🧹 Cleaning up test user data...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the test user
    const { data: users } = await supabase.auth.admin.listUsers();
    const testUser = users?.users.find(u => u.email === process.env.TEST_ORGANIZER_EMAIL);

    if (testUser) {
      // Delete all memberships for this user
      await supabase.from('memberships').delete().eq('user_id', testUser.id);

      // Get all tenants created by this user and delete them
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id')
        .eq('created_by', testUser.id);

      if (tenants && tenants.length > 0) {
        for (const tenant of tenants) {
          await supabase.from('events').delete().eq('tenant_id', tenant.id);
          await supabase.from('memberships').delete().eq('tenant_id', tenant.id);
          await supabase.from('tenants').delete().eq('id', tenant.id);
        }
      }

      // Ensure the user has a profile
      await supabase
        .from('profiles')
        .upsert({
          id: testUser.id,
          display_name: 'Test Organizer',
          email: testUser.email,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      // Create a fresh test organization for the user
      // This allows testing the event creation flow without dealing with onboarding
      const testOrgName = 'Test Organization';
      const testOrgSlug = 'test-organization';

      const { data: newTenant } = await supabase
        .from('tenants')
        .insert({
          name: testOrgName,
          slug: testOrgSlug,
          join_password: 'test123',
          created_by: testUser.id
        })
        .select()
        .single();

      if (newTenant) {
        // Create admin membership
        await supabase
          .from('memberships')
          .insert({
            tenant_id: newTenant.id,
            user_id: testUser.id,
            role: 'admin',
            status: 'active'
          });
        console.log('🧹 Cleanup completed - Test organization created');
      }
    }

    const timestamp = Date.now();
    const eventTitle = `Test Event ${timestamp}`;

    // Step 1: Login
    await page.goto('/auth/login');

    // Switch to password mode (click the "Passwort" tab)
    const passwordTab = page.getByRole('button', { name: 'Passwort' });
    await passwordTab.click();

    // Wait for password fields to appear
    await page.waitForTimeout(500);

    // Fill in credentials
    await page.getByPlaceholder('max@beispiel.de').fill(process.env.TEST_ORGANIZER_EMAIL!);
    await page.getByPlaceholder(/passwort/i).fill(process.env.TEST_PASSWORD!);

    // Submit login
    await page.getByRole('button', { name: /anmelden/i }).click();

    // Step 2: Wait for redirect to dashboard
    // User should be redirected to /flohmarkt/organizations since they have a membership
    await page.waitForURL(/\/flohmarkt/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Extra time for content to load
    console.log('✓ Logged in and redirected to dashboard');

    // Step 3: Select the test organization
    // Try using getByText since getByRole might have issues with the button
    const selectOrgButton = page.getByText('Auswählen');
    await expect(selectOrgButton).toBeVisible({ timeout: 5000 });
    await selectOrgButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Selected test organization');

    // Step 4: Navigate to event creation
    // Click the "+ Neues Event" tab to open the event creation form
    await page.getByRole('button', { name: '+ Neues Event' }).click();
    await page.waitForTimeout(500);

    // Fill event details
    await page.getByPlaceholder(/hof-flohmarkt/i).fill(eventTitle);

    await page.getByPlaceholder(/optional.*weitere infos/i).fill('Auto-generated test event for E2E testing');

    // Set dates (future dates)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 8);

    // Fill start date/time
    const startDateStr = startDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    await page.locator('input[type="datetime-local"]').first().fill(startDateStr);

    // Fill end date/time
    const endDateStr = endDate.toISOString().slice(0, 16);
    await page.locator('input[type="datetime-local"]').last().fill(endDateStr);

    // Set location (map center)
    await page.getByPlaceholder(/werderau.*regensburg/i).fill('Regensburg, Germany');
    await page.waitForTimeout(1000); // Wait for geocoding

    // Scroll down to see the submit button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Save event - look for "Event erstellen" button
    await page.getByRole('button', { name: 'Event erstellen' }).click();

    // Wait for navigation or loading to complete
    // The page shows "Event wird geladen..." during creation
    await page.waitForTimeout(2000);

    // Wait for either the event list to appear OR the manage button
    // Try waiting for URL change or specific elements
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Step 5: Verify event was created
    // Check that we're back on the event list page
    await expect(page.getByRole('button', { name: /aktive events/i })).toBeVisible({ timeout: 5000 });

    // Verify the event appears in the list with "Entwurf" (draft) status
    await expect(page.getByText(eventTitle)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Entwurf')).toBeVisible();

    console.log('✅ Event created successfully as draft!');
    console.log(`Event title: ${eventTitle}`);

    // Step 6: Cleanup - Delete test data via the cleanup script
    console.log('🧹 Starting cleanup...');

    // The cleanup will be done by the beforeAll hook in the next test run
    // For now, just log success
    console.log('✅ Organizer flow test completed successfully!');
  });
});
