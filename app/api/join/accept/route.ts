import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, teamCode } = await request.json();

    if (!token && !teamCode) {
      return NextResponse.json({ error: 'token or teamCode is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up tenant by token or team code
    let query = supabase
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
    const { data: existingMembership } = await supabase
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

    // Ensure user profile exists (same pattern as FlohmarktContext.joinTenant)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          updated_at: new Date().toISOString(),
        });
    }

    // Create membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        tenant_id: tenant.id,
        user_id: user.id,
        role: 'member',
        status: 'active',
      });

    if (membershipError) {
      return NextResponse.json(
        { error: 'Failed to create membership', details: membershipError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orgSlug: tenant.slug,
      orgName: tenant.name,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}
