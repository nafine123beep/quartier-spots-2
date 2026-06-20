import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = [
  "/flohmarkt/organizations",
  "/flohmarkt/settings",
  "/flohmarkt/tutorials",
];

const PUBLIC_EXACT = ["/flohmarkt", "/flohmarkt/demo"];

const KNOWN_ADMIN_SEGMENTS = ["organizations", "settings", "tutorials", "demo"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicOrgEventRoute(pathname: string): boolean {
  // /flohmarkt/[orgSlug] and /flohmarkt/[orgSlug]/[eventSlug]/... are public
  // They match /flohmarkt/<something> where <something> is NOT an admin segment
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 2 && segments[0] === "flohmarkt") {
    return !KNOWN_ADMIN_SEGMENTS.includes(segments[1]);
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip exact public routes
  if (PUBLIC_EXACT.includes(pathname)) {
    return NextResponse.next();
  }

  // Skip public org/event routes (/flohmarkt/[orgSlug]/...)
  if (isPublicOrgEventRoute(pathname)) {
    return NextResponse.next();
  }

  // Only check auth for protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Create Supabase client with cookie access
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Use getUser() (not getSession()) in server-side code: it revalidates the
  // JWT against the Supabase Auth server, whereas getSession() trusts the
  // unverified cookie and can be spoofed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/flohmarkt/:path*"],
};
