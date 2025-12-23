"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"magic" | "password">("magic");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        router.replace("/flohmarkt/organizations");
      } else {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  // Show nothing while checking session to avoid flash
  if (checkingSession) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[4000] flex items-center justify-center">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (loginMode === "password") {
      // Password-based login
      console.log("Attempting password login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Password login response:", { data, error });

      if (error) {
        console.error("Password login error:", error);

        // Provide more helpful error messages
        let errorMessage = error.message;
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Ungültige E-Mail oder Passwort. Hast du bereits ein Passwort gesetzt?";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Bitte bestätige zuerst deine E-Mail-Adresse.";
        }

        setError(errorMessage);
        setLoading(false);
        return;
      }

      console.log("Password login successful, redirecting...");
      // Redirect to organizations page on success
      router.replace("/flohmarkt/organizations");
    } else {
      // Magic link login
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setLoading(true);

    if (!email) {
      setError("Bitte gib deine E-Mail-Adresse ein.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setResetEmailSent(true);
    setLoading(false);
  };

  if (resetEmailSent) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[4000] flex flex-col overflow-y-auto">
        <div className="p-5 flex items-center">
          <Link
            href="/flohmarkt"
            className="bg-transparent border-none text-2xl text-[#003366] p-0 mr-4 cursor-pointer no-underline"
          >
            ←
          </Link>
          <span>Startseite</span>
        </div>

        <div className="max-w-[400px] w-full mx-auto p-5">
          <h2 className="mt-0 text-[#003366]">Passwort zurücksetzen</h2>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">E-Mail zum Zurücksetzen gesendet!</p>
            <p>
              Wir haben eine E-Mail an <strong>{email}</strong> geschickt.
              Klicke auf den Link in der E-Mail, um dein Passwort zurückzusetzen.
            </p>
          </div>
          <button
            onClick={() => {
              setResetEmailSent(false);
              setResetPasswordMode(false);
              setEmail("");
            }}
            className="text-[#003366] no-underline cursor-pointer hover:underline bg-transparent border-none text-base"
          >
            Zurück zum Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[4000] flex flex-col overflow-y-auto">
        <div className="p-5 flex items-center">
          <Link
            href="/flohmarkt"
            className="bg-transparent border-none text-2xl text-[#003366] p-0 mr-4 cursor-pointer no-underline"
          >
            ←
          </Link>
          <span>Startseite</span>
        </div>

        <div className="max-w-[400px] w-full mx-auto p-5">
          <h2 className="mt-0 text-[#003366]">E-Mail gesendet</h2>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Check dein E-Mail-Postfach!</p>
            <p>
              Wir haben einen Login-Link an <strong>{email}</strong> geschickt.
              Klicke auf den Link, um dich einzuloggen.
            </p>
          </div>
          <button
            onClick={() => {
              setSuccess(false);
              setEmail("");
            }}
            className="text-[#003366] no-underline cursor-pointer hover:underline bg-transparent border-none text-base"
          >
            Andere E-Mail verwenden
          </button>
        </div>
      </div>
    );
  }

  if (resetPasswordMode) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[4000] flex flex-col overflow-y-auto">
        <div className="p-5 flex items-center">
          <Link
            href="/flohmarkt"
            className="bg-transparent border-none text-2xl text-[#003366] p-0 mr-4 cursor-pointer no-underline"
          >
            ←
          </Link>
          <span>Startseite</span>
        </div>

        <div className="max-w-[400px] w-full mx-auto p-5">
          <h2 className="mt-0 text-[#003366]">Passwort zurücksetzen</h2>
          <p className="text-gray-600 mb-5">
            Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }}>
            <div className="mb-4">
              <label className="block mb-1 font-bold text-gray-700 text-sm">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="max@beispiel.de"
                className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold mt-2 cursor-pointer hover:bg-[#002244] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Wird gesendet..." : "Link zum Zurücksetzen senden"}
            </button>
          </form>

          <button
            onClick={() => {
              setResetPasswordMode(false);
              setError(null);
            }}
            className="w-full mt-4 text-[#003366] no-underline cursor-pointer hover:underline bg-transparent border-none text-base"
          >
            Zurück zum Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-[4000] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-5 flex items-center">
        <Link
          href="/flohmarkt"
          className="bg-transparent border-none text-2xl text-[#003366] p-0 mr-4 cursor-pointer no-underline"
        >
          ←
        </Link>
        <span>Startseite</span>
      </div>

      {/* Form Container */}
      <div className="max-w-[400px] w-full mx-auto p-5">
        <h2 className="mt-0 text-[#003366]">Login für Veranstalter:innen</h2>

        {/* Login Mode Toggle */}
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setLoginMode("magic")}
            className={`flex-1 py-2 px-4 rounded-md font-bold transition-colors ${
              loginMode === "magic"
                ? "bg-[#003366] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("password")}
            className={`flex-1 py-2 px-4 rounded-md font-bold transition-colors ${
              loginMode === "password"
                ? "bg-[#003366] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Passwort
          </button>
        </div>

        <p className="text-gray-600 mb-5">
          {loginMode === "magic"
            ? "Gib deine E-Mail-Adresse ein und wir senden dir einen Login-Link."
            : "Melde dich mit deiner E-Mail und deinem Passwort an."}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="max@beispiel.de"
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
            />
          </div>

          {loginMode === "password" && (
            <>
              <div className="mb-4">
                <label className="block mb-1 font-bold text-gray-700 text-sm">
                  Passwort
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Dein Passwort"
                  className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
                />
              </div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Hinweis:</strong> Passwort-Login funktioniert nur, wenn du bereits ein Passwort in deinen Profileinstellungen gesetzt hast.
                  Ansonsten nutze bitte den Magic Link.
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold mt-2 cursor-pointer hover:bg-[#002244] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading
              ? "Wird gesendet..."
              : loginMode === "magic"
              ? "Magic Link senden"
              : "Anmelden"}
          </button>

          {loginMode === "password" && (
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => {
                  setResetPasswordMode(true);
                  setError(null);
                }}
                className="text-[#003366] text-sm cursor-pointer hover:underline bg-transparent border-none"
              >
                Passwort vergessen?
              </button>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="text-center my-5 text-gray-500 text-sm relative">
          <span className="bg-gray-100 px-2 relative z-10">ODER</span>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 -z-0" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 flex items-center justify-center gap-2.5 p-3 rounded-md font-bold shadow-sm cursor-pointer hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <span className="font-bold font-serif text-[#DB4437] text-xl">G</span>
          Weiter mit Google
        </button>

        <div className="mt-5 text-center text-sm text-gray-600">
          Noch kein Account? Der Magic Link erstellt automatisch einen Account.
        </div>
      </div>
    </div>
  );
}
