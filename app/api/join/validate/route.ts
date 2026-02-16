import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, teamCode } = await request.json();

    if (!token && !teamCode) {
      return NextResponse.json({ error: 'token or teamCode is required' }, { status: 400 });
    }

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

    const { data: tenant, error } = await query.maybeSingle();

    if (error || !tenant) {
      return NextResponse.json({ error: 'invalid' }, { status: 404 });
    }

    return NextResponse.json({
      orgId: tenant.id,
      orgName: tenant.name,
      orgSlug: tenant.slug,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
