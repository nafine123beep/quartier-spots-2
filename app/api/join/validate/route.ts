import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, teamCode } = await request.json();

    if (!token && !teamCode) {
      return NextResponse.json({ error: 'token or teamCode is required' }, { status: 400 });
    }

    const supabase = await createClient();

    let query = supabase
      .from('tenants')
      .select('id, name, slug');

    if (token) {
      query = query.eq('invite_token', token);
    } else {
      query = query.eq('join_password', teamCode);
    }

    const { data: tenant, error } = await query.maybeSingle();

    if (error || !tenant) {
      return NextResponse.json({ error: 'invalid' }, { status: 404 });
    }

    return NextResponse.json({
      orgId: tenant.id,
      orgName: tenant.name,
      orgSlug: tenant.slug,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}
