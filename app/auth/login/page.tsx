"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, User, Users, ChevronDown, ChevronUp } from "lucide-react";

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
  const [showNewUserInfo, setShowNewUserInfo] = useState(true);

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
        <div className="text-[#003366] font-semibold">Laden...</div>
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

      console.log("Password login successful, checking user status...");

      // Check if user needs onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", data.user.id)
        .maybeSingle();

      // Only redirect to onboarding if user has no display_name (first-time user)
      if (!profile?.display_name) {
        router.replace("/onboarding");
      } else {
        // Existing user - redirect to organizations page (even if they have no memberships yet)
        router.replace("/flohmarkt/organizations");
      }
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
          <span className="text-gray-900">Startseite</span>
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
          <span className="text-gray-900">Startseite</span>
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
          <span className="text-gray-900">Startseite</span>
        </div>

        <div className="max-w-[400px] w-full mx-auto p-5">
          <h2 className="mt-0 text-[#003366]">Passwort zurücksetzen</h2>
          <p className="text-gray-700 mb-5">
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
        <span className="text-gray-900">Startseite</span>
      </div>

      {/* Form Container */}
      <div className="max-w-[400px] w-full mx-auto p-5">
        <h1 className="mt-0 mb-4 text-2xl md:text-3xl font-bold text-[#003366]">Willkommen bei QuartierSpots</h1>

        {/* New User Info Box */}
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowNewUserInfo(!showNewUserInfo)}
            className="w-full flex items-center justify-between p-3 bg-transparent border-none cursor-pointer text-left"
          >
            <span className="font-semibold text-blue-800">Neu hier? So funktioniert&apos;s:</span>
            {showNewUserInfo ? (
              <ChevronUp className="h-5 w-5 text-blue-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-blue-600" />
            )}
          </button>
          {showNewUserInfo && (
            <div className="px-3 pb-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-blue-800">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm">1. E-Mail eingeben</span>
                </div>
                <div className="flex items-center gap-3 text-blue-800">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm">2. Namen &amp; Passwort wählen</span>
                </div>
                <div className="flex items-center gap-3 text-blue-800">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-sm">3. Organisation erstellen oder beitreten</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-blue-700 font-medium">
                In unter 2 Minuten startklar!
              </p>
            </div>
          )}
        </div>

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
            E-Mail-Link
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

        <p className="text-gray-700 mb-5">
          {loginMode === "magic"
            ? "Wir senden dir einen Link per E-Mail. Damit kannst du dich anmelden oder einen neuen Account erstellen."
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
                  <strong>Hinweis:</strong> Du hast bei der Registrierung ein Passwort festgelegt? Dann kannst du dich hier damit anmelden. Für neue Accounts nutze bitte &quot;E-Mail-Link&quot;.
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
              ? "E-Mail-Link senden"
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
        <div className="text-center my-5 text-gray-600 text-sm relative">
          <span className="bg-gray-100 px-2 relative z-10">ODER</span>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 -z-0" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 flex items-center justify-center gap-2.5 p-3 rounded-md font-bold shadow-sm cursor-pointer hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Weiter mit Google
        </button>

              </div>
    </div>
  );
}
