"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Pencil, Link2, KeyRound, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { LinkCopyField } from "../dashboard/EventJourney/shared/LinkCopyField";

export function MemberManagementSection() {
  const { currentTenant, isAdmin } = useFlohmarkt();
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showRawLink, setShowRawLink] = useState(false);

  const ensureInviteToken = useCallback(async () => {
    if (!currentTenant) return;

    if (currentTenant.invite_token) {
      setInviteToken(currentTenant.invite_token);
      return;
    }

    setLoadingToken(true);
    try {
      const res = await fetch("/api/invite/ensure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: currentTenant.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setInviteToken(data.invite_token);
        setTokenError(null);
      } else {
        console.error("[MemberManagement] Token ensure failed:", data);
        setTokenError(data.details || data.error || "Fehler beim Generieren des Einladungslinks");
      }
    } catch (err) {
      console.error("[MemberManagement] Network error:", err);
      setTokenError("Netzwerkfehler beim Generieren des Einladungslinks");
    } finally {
      setLoadingToken(false);
    }
  }, [currentTenant]);

  useEffect(() => {
    ensureInviteToken();
  }, [ensureInviteToken]);

  const inviteUrl = inviteToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join?token=${inviteToken}`
    : "";

  if (!currentTenant) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-6 w-6 text-gray-800" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-gray-800 m-0">
          Mitgliederverwaltung
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5">
        <p className="text-lg font-semibold text-gray-700 mb-5">
          Lade neue Organisationsmitglieder ein
        </p>

        {tokenError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm mb-5">
            {tokenError}
          </div>
        )}

        {/* Option 1: Invite Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="h-4 w-4 text-[#003366]" aria-hidden="true" />
            <h3 className="font-bold text-[#003366] text-sm m-0">Einladungslink</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Für WhatsApp, E-Mail oder zum direkten Teilen. Kein Team-Code erforderlich.
          </p>

          {loadingToken ? (
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex-grow min-w-0">
                <p className="font-medium text-gray-400 text-sm">Wird generiert...</p>
              </div>
            </div>
          ) : inviteUrl ? (
            <>
              <LinkCopyField
                label="Einladungslink"
                url={inviteUrl}
              />
              <button
                type="button"
                onClick={() => setShowRawLink(!showRawLink)}
                className="flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer transition-colors"
              >
                {showRawLink ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                Einladungs-Link anzeigen
              </button>
              {showRawLink && (
                <p className="mt-1 p-2 bg-white border border-blue-200 rounded text-xs text-gray-600 font-mono break-all select-all">
                  {inviteUrl}
                </p>
              )}
            </>
          ) : null}
        </div>

        {/* "oder" divider */}
        <div className="text-center my-5 text-gray-500 text-sm relative">
          <span className="bg-white px-3 relative z-10">oder</span>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 -z-0" />
        </div>

        {/* Option 2: Team Code */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="h-4 w-4 text-gray-700" aria-hidden="true" />
            <h3 className="font-bold text-gray-700 text-sm m-0">Team-Code</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Alternativ können Mitglieder deine Organisation suchen und via Team-Code beitreten.
          </p>

          <div className="bg-white border border-gray-300 rounded-lg px-6 py-3 text-center mb-3">
            <span className="text-2xl font-bold font-mono tracking-widest text-[#003366]">
              {currentTenant.join_password || "—"}
            </span>
          </div>

          {currentTenant.join_password && (
            <div className="mb-3">
              <LinkCopyField
                label="Team-Code"
                url={currentTenant.join_password}
              />
            </div>
          )}

          {isAdmin && (
            <div className="flex justify-end">
              <Link
                href="/flohmarkt/settings/organization"
                className="flex items-center justify-center gap-2 min-w-[8rem] px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-all whitespace-nowrap no-underline focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2"
              >
                <Pencil className="h-4 w-4" />
                <span>Bearbeiten</span>
              </Link>
            </div>
          )}
        </div>

        {/* Link to members list */}
        <Link
          href="/flohmarkt/settings/members"
          className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200 text-sm text-gray-600 hover:text-[#003366] transition-colors no-underline group"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" aria-hidden="true" />
            <span>Alle Mitglieder anzeigen</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#003366] transition-colors" />
        </Link>
      </div>
    </section>
  );
}
