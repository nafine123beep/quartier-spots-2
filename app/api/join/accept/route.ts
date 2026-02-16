import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, teamCode } = await request.json();

    if (!token && !teamCode) {
      return NextResponse.json({ error: 'token or teamCode is required' }, { status: 400 });
    }

    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role to look up tenant (bypasses RLS)
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = serviceClient
      .from('tenants')
      .select('id, name, slug');

    if (token) {
      query = query.eq('invite_token', token);
    } else {
      query = query.eq('join_password', teamCode);
    }

    const { data: tenant, error: tenantError } = await query.maybeSingle();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'invalid' }, { status: 404 });
    }

    // Check if already a member
    const { data: existingMembership } = await serviceClient
      .from('memberships')
      .select('tenant_id')
      .eq('tenant_id', tenant.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMembership) {
      return NextResponse.json({
        alreadyMember: true,
        orgSlug: tenant.slug,
        orgName: tenant.name,
      });
    }

    // Ensure user profile exists
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      await serviceClient
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          updated_at: new Date().toISOString(),
        });
    }

    // Create membership
    const { error: membershipError } = await serviceClient
      .from('memberships')
      .insert({
        tenant_id: tenant.id,
        user_id: user.id,
        role: 'member',
        status: 'active',
      });

    if (membershipError) {
      return NextResponse.json({ error: 'Failed to create membership' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orgSlug: tenant.slug,
      orgName: tenant.name,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
