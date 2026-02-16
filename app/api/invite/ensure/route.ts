import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tenant_id } = await request.json();

    if (!tenant_id) {
      return NextResponse.json({ error: 'tenant_id is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a member of this tenant
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if tenant already has an invite_token
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('invite_token')
      .eq('id', tenant_id)
      .single();

    if (tenantError) {
      return NextResponse.json(
        { error: 'Tenant lookup failed', details: tenantError.message },
        { status: 500 }
      );
    }

    if (tenant?.invite_token) {
      return NextResponse.json({ invite_token: tenant.invite_token });
    }

    // Generate a new token
    const invite_token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');

    const { error: updateError } = await supabase
      .from('tenants')
      .update({ invite_token })
      .eq('id', tenant_id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to generate invite token', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ invite_token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[invite/ensure] Unexpected error:', message);
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}
