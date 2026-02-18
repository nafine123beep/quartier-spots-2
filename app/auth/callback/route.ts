import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    // No code in URL — redirect to login
    return NextResponse.redirect(new URL("/auth/login", origin));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // ignore — setAll can fail in edge cases
          }
        },
      },
    }
  );

  // Exchange the auth code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/auth/login", origin));
  }

  // Session established — check where to redirect
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", origin));
  }

  // Check if user needs onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!profile?.display_name) {
    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  // Check for memberships
  const { data: memberships } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", session.user.id)
    .limit(1);

  if (memberships && memberships.length > 0) {
    return NextResponse.redirect(new URL("/flohmarkt/organizations", origin));
  }

  // Has profile but no memberships — send to onboarding
  return NextResponse.redirect(new URL("/onboarding", origin));
}
