import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { tenant_id } = await request.json();

    if (!tenant_id) {
      return NextResponse.json({ error: 'tenant_id is required' }, { status: 400 });
    }

    // Verify the user is authenticated and is an admin of this tenant
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service role to bypass RLS for tenant update
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if tenant already has an invite_token
    const { data: tenant } = await serviceClient
      .from('tenants')
      .select('invite_token')
      .eq('id', tenant_id)
      .single();

    if (tenant?.invite_token) {
      return NextResponse.json({ invite_token: tenant.invite_token });
    }

    // Generate a new token
    const invite_token = randomBytes(24).toString('hex');

    const { error: updateError } = await serviceClient
      .from('tenants')
      .update({ invite_token })
      .eq('id', tenant_id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to generate invite token' }, { status: 500 });
    }

    return NextResponse.json({ invite_token });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
