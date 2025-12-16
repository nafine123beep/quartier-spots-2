"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AppHome() {
  const router = useRouter();
  const supabase = createClient();
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: memberships, error } = await supabase
        .from("memberships")
        .select("tenant_id, role, status")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) {
        console.error(error);
        router.replace("/login");
        return;
      }

      if (!memberships || memberships.length === 0) {
        router.replace("/onboarding");
        return;
      }

      setTenantId(memberships[0].tenant_id);
    })();
  }, [router, supabase]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Tenant: {tenantId ?? "lädt…"}</p>
    </main>
  );
}
