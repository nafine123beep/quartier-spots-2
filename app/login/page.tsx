"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState<string | null>(null);

    async function sendLink(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: "http://localhost:3000/auth/callback",
                shouldCreateUser: true,
            },
        });

        if (error) setMsg(error.message);
        else setMsg("Check dein E-Mail-Postfach für den Login-Link.");
    }

    return (
        <main style={{ padding: 24, maxWidth: 480 }}>
            <h1>Login</h1>
            <form onSubmit={sendLink}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail" />
                <button type="submit">Magic Link senden</button>
            </form>
            {msg && <p>{msg}</p>}
        </main>
    );
}
