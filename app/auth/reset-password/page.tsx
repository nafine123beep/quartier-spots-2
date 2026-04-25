"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "valid" | "invalid" | "resent";

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Email used to request a new link from the fallback screen
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const code = searchParams.get("code");
      const errorCode = searchParams.get("error_code");
      const errorDescription = searchParams.get("error_description");

      // Supabase appended an error to the redirect (expired/invalid link)
      if (errorCode || errorDescription) {
        setError(
          errorDescription
            ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
            : "Der Link ist ungültig oder abgelaufen."
        );
        setStatus("invalid");
        return;
      }

      // PKCE flow: exchange the code for a session
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("Code exchange failed:", exchangeError);
          setError(
            "Der Link ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an."
          );
          setStatus("invalid");
          return;
        }
      }

      // Either the code was just exchanged, or the session is already there
      // (implicit flow auto-detected by the browser client).
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "Ungültiger oder abgelaufener Link. Bitte fordere einen neuen Link an."
        );
        setStatus("invalid");
        return;
      }

      setStatus("valid");
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("Password update error:", updateError);
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.replace("/flohmarkt/organizations");
    }, 2000);
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resendEmail) {
      setError("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }

    setResending(true);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resetPasswordForEmail(
      resendEmail,
      { redirectTo: `${window.location.origin}/auth/reset-password` }
    );

    if (resendError) {
      setError(resendError.message);
      setResending(false);
      return;
    }

    setStatus("resent");
    setResending(false);
  };

  // Header used across all states
  const Header = () => (
    <div className="p-5 flex items-center">
      <Link
        href="/flohmarkt"
        className="bg-transparent border-none text-[#003366] p-0 mr-4 cursor-pointer no-underline flex items-center"
        aria-label="Zurück zur Startseite"
      >
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <span className="text-gray-900">Startseite</span>
    </div>
  );

  if (status === "checking") {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[4000] flex items-center justify-center">
        <div className="text-[#003366] font-semibold">Link wird geprüft...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[4000] flex flex-col overflow-y-auto">
        <Header />
        <div className="max-w-[400px] w-full mx-auto p-5">
          <h2 className="mt-0 text-[#003366]">Passwort erfolgreich geändert!</h2>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Dein Passwort wurde erfolgreich geändert.</p>
            <p>Du wirst automatisch weitergeleitet...</p>
          </div>
          <Link
            href="/flohmarkt/organizations"
            className="text-[#003366] no-underline cursor-pointer hover:underline"
          >
            Jetzt zum Dashboard gehen
          </Link>
        </div>
      </div>
    );
  }

  if (status === "resent") {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[4000] flex flex-col overflow-y-auto">
        <Header />
        <div className="max-w-[400px] w-full mx-auto p-5">
          <h2 className="mt-0 text-[#003366]">Neuer Link gesendet</h2>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">E-Mail unterwegs!</p>
            <p>
              Wir haben einen neuen Link an <strong>{resendEmail}</strong> geschickt.
              Bitte prüfe dein Postfach (auch den Spam-Ordner).
            </p>
          </div>
          <Link
            href="/auth/login"
            className="text-[#003366] text-sm no-underline cursor-pointer hover:underline"
          >
            Zurück zum Login
          </Link>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[4000] flex flex-col overflow-y-auto">
        <Header />
        <div className="max-w-[400px] w-full mx-auto p-5">
          <h2 className="mt-0 text-[#003366]">Link ungültig oder abgelaufen</h2>

          <div className="bg-amber-50 border-2 border-amber-300 text-amber-900 px-4 py-3 rounded mb-5 flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold mb-1">Dieser Link funktioniert nicht mehr</p>
              <p className="text-sm">
                {error ??
                  "Reset-Links sind aus Sicherheitsgründen nur kurze Zeit gültig und können nur einmal verwendet werden."}
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-3">
            Gib deine E-Mail-Adresse ein, um einen neuen Link zu erhalten:
          </p>

          <form onSubmit={handleResend}>
            <div className="mb-4">
              <label htmlFor="resend-email" className="block mb-1 font-bold text-gray-700 text-sm">
                E-Mail
              </label>
              <input
                id="resend-email"
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
                disabled={resending}
                placeholder="max@beispiel.de"
                className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={resending}
              className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold cursor-pointer hover:bg-[#002244] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {resending ? "Wird gesendet..." : "Neuen Link anfordern"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              href="/auth/login"
              className="text-[#003366] text-sm no-underline cursor-pointer hover:underline"
            >
              Zurück zum Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // status === "valid" — show the password form
  return (
    <div className="fixed inset-0 bg-gray-100 z-[4000] flex flex-col overflow-y-auto">
      <Header />
      <div className="max-w-[400px] w-full mx-auto p-5">
        <h2 className="mt-0 text-[#003366]">Neues Passwort setzen</h2>
        <p className="text-gray-700 mb-5">Gib dein neues Passwort ein.</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="new-password" className="block mb-1 font-bold text-gray-700 text-sm">
              Neues Passwort
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Mindestens 6 Zeichen"
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirm-password" className="block mb-1 font-bold text-gray-700 text-sm">
              Passwort bestätigen
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Passwort wiederholen"
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold mt-2 cursor-pointer hover:bg-[#002244] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Wird gespeichert..." : "Passwort speichern"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            href="/auth/login"
            className="text-[#003366] text-sm no-underline cursor-pointer hover:underline"
          >
            Zurück zum Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-gray-100 z-[4000] flex items-center justify-center">
          <div className="text-[#003366] font-semibold">Laden...</div>
        </div>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  );
}
