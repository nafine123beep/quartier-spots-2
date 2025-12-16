import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    // cookieStore kann getAll haben oder nicht, Next macht das gern inkonsistent.
                    if (typeof (cookieStore as any).getAll === "function") {
                        return (cookieStore as any).getAll();
                    }
                    return [];
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            (cookieStore as any).set?.(name, value, options);
                        });
                    } catch {
                        // ignore
                    }
                },
            },
        }
    );
}
