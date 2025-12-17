import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    // cookieStore kann getAll haben oder nicht, Next macht das gern inkonsistent.
                    if (typeof (cookieStore as CookieStore & { getAll?: () => unknown }).getAll === "function") {
                        return (cookieStore as CookieStore & { getAll: () => Array<{ name: string; value: string }> }).getAll();
                    }
                    return [];
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            (cookieStore as CookieStore & { set?: (name: string, value: string, options?: unknown) => void }).set?.(name, value, options);
                        });
                    } catch {
                        // ignore
                    }
                },
            },
        }
    );
}
