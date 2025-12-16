"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const supabase = createClient();
    const router = useRouter();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [status, setStatus] = useState<string | null>(null);

    async function createTenant(e: React.FormEvent) {
        e.preventDefault();
        setStatus(null);

        const { error } = await supabase.rpc("create_tenant_with_owner", {
            p_name: name,
            p_slug: slug || null,
        });

        if (error) setStatus(`Fehler: ${error.message}`);
        else {
            setStatus("Tenant angelegt.");
            router.push("/app");
        }
    }

    return (
        <main style={{ padding: 24, maxWidth: 520 }}>
            <h1>Organisation anlegen</h1>

            <form onSubmit={createTenant}>
                <label>Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ display: "block", width: "100%", marginBottom: 12 }}
                />

                <label>Slug (optional)</label>
                <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={{ display: "block", width: "100%", marginBottom: 12 }}
                />

                <button type="submit">Anlegen</button>
            </form>

            {status && <p style={{ marginTop: 12 }}>{status}</p>}
        </main>
    );
}
