"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  useEffect(() => {
    (async () => {
      const supabase = createClient();

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      // Kein Code = kein Login
      if (!code) {
        window.location.replace("/login");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error);
        window.location.replace("/login");
        return;
      }

      // Mini-Delay, damit Session sicher persistiert ist (Dev-Mode!)
      await new Promise((r) => setTimeout(r, 100));

      window.location.replace("/app");
    })();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Login wird abgeschlossen…</h1>
    </main>
  );
}
