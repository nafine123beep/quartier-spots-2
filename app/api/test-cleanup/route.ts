import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Test Cleanup API
 *
 * This endpoint is used by E2E tests to clean up test data after test completion.
 * It deletes events, tenants, and memberships created during testing.
 *
 * IMPORTANT: This endpoint should only be accessible in test/development environments.
 */

export async function POST(request: NextRequest) {
  // Security: Only allow in test/development environments
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_TEST_CLEANUP) {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { tenantSlug, eventSlug, cleanupType } = body;

    if (!tenantSlug) {
      return NextResponse.json(
        { error: 'tenantSlug is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the tenant by slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('slug', tenantSlug)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found', details: tenantError?.message },
        { status: 404 }
      );
    }

    const results: any = {
      tenantId: tenant.id,
      tenantName: tenant.name,
      deletedEvents: 0,
      deletedMemberships: 0,
      deletedTenant: false
    };

    // Delete event if eventSlug is provided
    if (eventSlug && cleanupType === 'full') {
      const { data: event, error: eventFindError } = await supabase
        .from('events')
        .select('id')
        .eq('slug', eventSlug)
        .eq('tenant_id', tenant.id)
        .single();

      if (event && !eventFindError) {
        // Delete event registrations first (if any)
        await supabase
          .from('event_registrations')
          .delete()
          .eq('event_id', event.id);

        // Delete the event
        const { error: eventDeleteError } = await supabase
          .from('events')
          .delete()
          .eq('id', event.id);

        if (!eventDeleteError) {
          results.deletedEvents = 1;
          console.log(`Deleted event: ${eventSlug}`);
        }
      }
    }

    // Delete all memberships for this tenant
    if (cleanupType === 'full') {
      const { count: membershipCount, error: membershipError } = await supabase
        .from('memberships')
        .delete({ count: 'exact' })
        .eq('tenant_id', tenant.id);

      if (!membershipError) {
        results.deletedMemberships = membershipCount || 0;
        console.log(`Deleted ${membershipCount} memberships`);
      }
    }

    // Delete the tenant itself
    if (cleanupType === 'full') {
      const { error: tenantDeleteError } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenant.id);

      if (!tenantDeleteError) {
        results.deletedTenant = true;
        console.log(`Deleted tenant: ${tenant.name}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      results
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error.message },
      { status: 500 }
    );
  }
}
