"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Login wird abgeschlossen…");

  useEffect(() => {
    const supabase = createClient();

    async function handleAuthCallback(session: any) {
      if (!session) return;

      console.log("Auth callback - User ID:", session.user.id);

      // Check if this is a new user or existing user
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", session.user.id)
        .maybeSingle();

      console.log("Profile data:", profile);
      console.log("Profile error:", profileError);

      // Check if user has any memberships
      const { data: memberships, error: membershipError } = await supabase
        .from("memberships")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1);

      console.log("Memberships data:", memberships);
      console.log("Memberships error:", membershipError);

      // If user has memberships, they've completed onboarding - go to dashboard
      if (memberships && memberships.length > 0) {
        console.log("User has memberships - redirecting to organizations");
        setStatus("Erfolgreich eingeloggt! Weiterleitung...");
        window.location.replace("/flohmarkt/organizations");
        return;
      }

      // If user has no display_name, they need to complete onboarding
      if (!profile?.display_name) {
        console.log("User has no display_name - redirecting to onboarding");
        setStatus("Erfolgreich eingeloggt! Weiterleitung zum Onboarding...");
        window.location.replace("/onboarding");
      } else {
        // User has display_name but no memberships - might be mid-onboarding
        // Send them to onboarding to complete organization setup
        console.log("User has display_name but no memberships - redirecting to onboarding");
        setStatus("Erfolgreich eingeloggt! Weiterleitung zum Onboarding...");
        window.location.replace("/onboarding");
      }
    }

    // Listen for auth state changes - Supabase automatically handles the token from URL
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        handleAuthCallback(session);
      }
    });

    // Also check if already signed in (session might already be established)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error:", error);
        setStatus("Fehler beim Login. Weiterleitung...");
        setTimeout(() => window.location.replace("/auth/login"), 2000);
        return;
      }

      if (session) {
        handleAuthCallback(session);
      }
    });

    // Timeout fallback - if nothing happens after 5 seconds, redirect to login
    const timeout = setTimeout(() => {
      setStatus("Timeout - Weiterleitung zum Login...");
      window.location.replace("/auth/login");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-4"></div>
        <h1 className="text-xl text-[#003366]">{status}</h1>
      </div>
    </main>
  );
}
