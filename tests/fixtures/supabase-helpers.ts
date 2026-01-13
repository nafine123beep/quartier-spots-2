/**
 * Supabase Test Helpers
 *
 * Utilities for setting up and cleaning up test data in Supabase test project.
 * Uses service role key for admin operations.
 */

import { createClient } from '@supabase/supabase-js';
import { generateTestOrganization, generateTestEvent, generateTestSpot } from './data-generators';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase test credentials. Check .env.test file.');
}

// Service role client for test setup/teardown (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Creates a test organization with admin user
 */
export async function createTestOrganization(userEmail: string) {
  const orgData = generateTestOrganization();

  // Create tenant
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert(orgData)
    .select()
    .single();

  if (tenantError) throw new Error(`Failed to create tenant: ${tenantError.message}`);

  // Get user ID
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const user = users.find(u => u.email === userEmail);

  if (!user) throw new Error(`User ${userEmail} not found in test project`);

  // Create admin membership
  const { error: membershipError } = await supabaseAdmin.from('memberships').insert({
    tenant_id: tenant.id,
    user_id: user.id,
    role: 'admin',
    status: 'active',
  });

  if (membershipError) throw new Error(`Failed to create membership: ${membershipError.message}`);

  return { tenant, userId: user.id };
}

/**
 * Creates a published event for testing participant flows
 */
export async function createPublishedEvent(overrides: Record<string, any> = {}) {
  const orgEmail = process.env.TEST_ORGANIZER_EMAIL!;
  const { tenant } = await createTestOrganization(orgEmail);

  const eventData = generateTestEvent({
    tenant_id: tenant.id,
    status: 'published',
    ...overrides,
  });

  const { data: event, error } = await supabaseAdmin
    .from('events')
    .insert(eventData)
    .select()
    .single();

  if (error) throw new Error(`Failed to create event: ${error.message}`);

  return {
    orgSlug: tenant.slug,
    eventSlug: event.slug,
    tenantId: tenant.id,
    eventId: event.id,
    event,
    tenant,
  };
}

/**
 * Creates event with multiple test spots
 */
export async function createEventWithSpots(spotCount: number = 10, eventOverrides: Record<string, any> = {}) {
  const { orgSlug, eventSlug, tenantId, eventId } = await createPublishedEvent(eventOverrides);

  const spots = Array.from({ length: spotCount }, () =>
    generateTestSpot({ tenant_id: tenantId, event_id: eventId })
  );

  const { error } = await supabaseAdmin.from('spots').insert(spots);
  if (error) throw new Error(`Failed to create spots: ${error.message}`);

  return { orgSlug, eventSlug, tenantId, eventId };
}

/**
 * Creates a draft event (not published)
 */
export async function createDraftEvent(overrides: Record<string, any> = {}) {
  return createPublishedEvent({ status: 'draft', ...overrides });
}

/**
 * Creates an event with a preview token
 */
export async function createPreviewEvent() {
  const previewToken = crypto.randomUUID();
  return createPublishedEvent({ status: 'draft', preview_token: previewToken });
}

/**
 * Deletes a tenant and all associated data (cascading delete)
 */
export async function deleteTenant(tenantId: string) {
  // Delete memberships first
  await supabaseAdmin.from('memberships').delete().eq('tenant_id', tenantId);

  // Delete spots (via events)
  const { data: events } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('tenant_id', tenantId);

  if (events) {
    for (const event of events) {
      await supabaseAdmin.from('spots').delete().eq('event_id', event.id);
      await supabaseAdmin.from('event_images').delete().eq('event_id', event.id);
    }
  }

  // Delete events
  await supabaseAdmin.from('events').delete().eq('tenant_id', tenantId);

  // Finally delete tenant
  const { error } = await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
  if (error) throw new Error(`Failed to delete tenant: ${error.message}`);
}

/**
 * Deletes an event and all associated data
 */
export async function deleteEvent(eventId: string) {
  await supabaseAdmin.from('spots').delete().eq('event_id', eventId);
  await supabaseAdmin.from('event_images').delete().eq('event_id', eventId);
  const { error } = await supabaseAdmin.from('events').delete().eq('id', eventId);
  if (error) throw new Error(`Failed to delete event: ${error.message}`);
}

/**
 * Cleans up all test data older than specified hours
 */
export async function cleanupOldTestData(hoursOld: number = 2) {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hoursOld);

  // Delete old test tenants (cascading will handle related data)
  const { data: oldTenants } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .like('name', 'Test Org test-%')
    .lt('created_at', cutoffDate.toISOString());

  if (oldTenants) {
    for (const tenant of oldTenants) {
      await deleteTenant(tenant.id);
    }
  }
}

/**
 * Resource tracker for automatic cleanup
 */
export class TestResourceTracker {
  private tenants: string[] = [];
  private events: string[] = [];
  private spots: string[] = [];

  trackTenant(id: string) {
    this.tenants.push(id);
  }

  trackEvent(id: string) {
    this.events.push(id);
  }

  trackSpot(id: string) {
    this.spots.push(id);
  }

  async cleanup() {
    console.log('Cleaning up test resources...');

    // Delete in reverse order of dependencies
    if (this.spots.length > 0) {
      await supabaseAdmin.from('spots').delete().in('id', this.spots);
    }

    if (this.events.length > 0) {
      await supabaseAdmin.from('events').delete().in('id', this.events);
    }

    if (this.tenants.length > 0) {
      for (const tenantId of this.tenants) {
        await deleteTenant(tenantId);
      }
    }

    // Clear tracking
    this.tenants = [];
    this.events = [];
    this.spots = [];
  }

  reset() {
    this.tenants = [];
    this.events = [];
    this.spots = [];
  }
}
