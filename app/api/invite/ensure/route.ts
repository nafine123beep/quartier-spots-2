import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tenant_id } = await request.json();

    if (!tenant_id) {
      return NextResponse.json({ error: 'tenant_id is required' }, { status: 400 });
    }

    // Verify the user is authenticated and is a member of this tenant
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[invite/ensure] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (membershipError || !membership) {
      console.error('[invite/ensure] Membership check failed:', membershipError);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service role to bypass RLS for tenant update
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if tenant already has an invite_token
    const { data: tenant, error: tenantError } = await serviceClient
      .from('tenants')
      .select('invite_token')
      .eq('id', tenant_id)
      .single();

    if (tenantError) {
      console.error('[invite/ensure] Tenant lookup error:', tenantError);
      return NextResponse.json(
        { error: 'Tenant lookup failed', details: tenantError.message },
        { status: 500 }
      );
    }

    if (tenant?.invite_token) {
      return NextResponse.json({ invite_token: tenant.invite_token });
    }

    // Generate a new token using Web Crypto API (works in all runtimes)
    const invite_token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');

    const { error: updateError } = await serviceClient
      .from('tenants')
      .update({ invite_token })
      .eq('id', tenant_id);

    if (updateError) {
      console.error('[invite/ensure] Token update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to generate invite token', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ invite_token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('[invite/ensure] Unexpected error:', message, stack);
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}
