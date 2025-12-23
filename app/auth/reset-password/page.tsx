"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkRecoverySession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      console.log("Recovery session:", session);

      if (!session) {
        setError("Ungültiger oder abgelaufener Link. Bitte fordere einen neuen Link an.");
      }
    };

    checkRecoverySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    console.log("Updating password...");
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error("Password update error:", error);
      setError(error.message);
      setLoading(false);
      return;
    }

    console.log("Password updated successfully");
    setSuccess(true);
    setLoading(false);

    // Redirect to organizations after 2 seconds
    setTimeout(() => {
      router.replace("/flohmarkt/organizations");
    }, 2000);
  };

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
          <h2 className="mt-0 text-[#003366]">Passwort erfolgreich geändert!</h2>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Dein Passwort wurde erfolgreich geändert.</p>
            <p>
              Du wirst automatisch weitergeleitet...
            </p>
          </div>
          <Link
            href="/flohmarkt/organizations"
            className="text-[#003366] no-underline cursor-pointer hover:underline"
          >
            Jetzt zur Dashboard gehen
          </Link>
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
        <h2 className="mt-0 text-[#003366]">Neues Passwort setzen</h2>
        <p className="text-gray-600 mb-5">
          Gib dein neues Passwort ein.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Neues Passwort
            </label>
            <input
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
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Passwort bestätigen
            </label>
            <input
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
