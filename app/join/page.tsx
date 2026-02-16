"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Users, ArrowLeft, KeyRound } from "lucide-react";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [mode, setMode] = useState<"token" | "code">(token ? "token" : "code");
  const [teamCode, setTeamCode] = useState("");
  const [orgName, setOrgName] = useState<string | null>(null);
  const [orgSlug, setOrgSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Store current URL for redirect after login
        const currentUrl = window.location.pathname + window.location.search;
        localStorage.setItem("pending_join_redirect", currentUrl);
        router.replace("/auth/login");
        return;
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  // Validate token on mount if present
  useEffect(() => {
    if (!token || checkingAuth) return;

    const validateToken = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/join/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          const data = await res.json();
          setOrgName(data.orgName);
          setOrgSlug(data.orgSlug);
        } else {
          setError("Dieser Einladungslink ist ungültig oder abgelaufen.");
          setMode("code");
        }
      } catch {
        setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
        setMode("code");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, checkingAuth]);

  const handleJoinByToken = async () => {
    if (!token) return;
    setJoining(true);
    setError(null);

    try {
      const res = await fetch("/api/join/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.alreadyMember) {
        setSuccess("Du bist bereits Mitglied dieser Organisation.");
        setTimeout(() => {
          router.replace(`/flohmarkt/organizations/${data.orgSlug}`);
        }, 1500);
        return;
      }

      if (data.success) {
        setSuccess("Du bist beigetreten!");
        setTimeout(() => {
          router.replace(`/flohmarkt/organizations/${data.orgSlug}`);
        }, 1500);
        return;
      }

      setError("Beitritt fehlgeschlagen. Bitte versuche es erneut.");
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setJoining(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamCode.trim()) return;

    setJoining(true);
    setError(null);

    try {
      // Validate the code first
      const validateRes = await fetch("/api/join/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamCode: teamCode.trim() }),
      });

      if (!validateRes.ok) {
        setError("Team-Code ungültig");
        setJoining(false);
        return;
      }

      // Accept the join
      const acceptRes = await fetch("/api/join/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamCode: teamCode.trim() }),
      });

      const data = await acceptRes.json();

      if (data.alreadyMember) {
        setSuccess(`Du bist bereits Mitglied von ${data.orgName}.`);
        setTimeout(() => {
          router.replace(`/flohmarkt/organizations/${data.orgSlug}`);
        }, 1500);
        return;
      }

      if (data.success) {
        setSuccess(`Du bist ${data.orgName} beigetreten!`);
        setTimeout(() => {
          router.replace(`/flohmarkt/organizations/${data.orgSlug}`);
        }, 1500);
        return;
      }

      setError("Beitritt fehlgeschlagen. Bitte versuche es erneut.");
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setJoining(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
        <div className="text-[#003366] font-semibold">Laden...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-5 flex items-center">
        <Link
          href="/flohmarkt"
          className="flex items-center gap-2 text-[#003366] no-underline hover:underline"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Startseite</span>
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-[400px] w-full mx-auto p-5">
        {success ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          </div>
        ) : mode === "token" && orgName && !error ? (
          /* Token mode: show accept screen */
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[#003366]" />
              </div>
              <h1 className="text-2xl font-bold text-[#003366] mb-2">
                Einladung
              </h1>
              <p className="text-gray-700">
                Du wurdest zur Organisation{" "}
                <strong className="text-[#003366]">{orgName}</strong>{" "}
                eingeladen.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => router.replace("/flohmarkt")}
                className="flex-1 border-2 border-gray-400 text-gray-700 py-3 rounded-md font-bold hover:bg-gray-100 hover:border-gray-500 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleJoinByToken}
                disabled={joining || loading}
                className="flex-1 bg-[#003366] text-white py-3 rounded-md font-bold hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {joining ? "Wird beigetreten..." : "Beitreten"}
              </button>
            </div>
          </div>
        ) : (
          /* Code mode: show input form */
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="h-8 w-8 text-[#003366]" />
              </div>
              <h1 className="text-2xl font-bold text-[#003366] mb-2">
                Organisation beitreten
              </h1>
              <p className="text-gray-700">
                Gib den Team-Code ein, den du von deinem Organisator erhalten hast.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleJoinByCode}>
              <div className="mb-4">
                <label
                  htmlFor="team-code"
                  className="block mb-1 font-bold text-gray-700 text-sm"
                >
                  Team-Code eingeben
                </label>
                <input
                  id="team-code"
                  type="text"
                  value={teamCode}
                  onChange={(e) => {
                    setTeamCode(e.target.value);
                    setError(null);
                  }}
                  placeholder="z.B. NORD-4821"
                  required
                  disabled={joining}
                  className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 font-mono tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={joining || !teamCode.trim()}
                className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold cursor-pointer hover:bg-[#002244] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {joining ? "Wird beigetreten..." : "Beitreten"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-[#003366] font-semibold">Laden...</div>
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
