"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Pencil } from "lucide-react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { LinkCopyField } from "../dashboard/EventJourney/shared/LinkCopyField";

export function MemberManagementSection() {
  const { currentTenant } = useFlohmarkt();
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const ensureInviteToken = useCallback(async () => {
    if (!currentTenant) return;

    // Use existing token from context if available
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

      <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
        <p className="text-gray-600 text-sm">
          Teile den Einladungslink, damit neue Mitglieder deiner Organisation beitreten können.
        </p>

        {tokenError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {tokenError}
          </div>
        )}

        {/* Invite Link */}
        {loadingToken ? (
          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex-grow min-w-0">
              <p className="font-medium text-gray-700 text-sm">Einladungslink</p>
              <p className="text-xs text-gray-400 mt-0.5">Wird generiert...</p>
            </div>
          </div>
        ) : inviteUrl ? (
          <LinkCopyField
            label="Einladungslink"
            description="Für WhatsApp, E-Mail oder zum direkten Teilen"
            url={inviteUrl}
          />
        ) : null}

        {/* Team Code */}
        <div className="border-t border-gray-200" />
        <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex-grow min-w-0">
            <p className="font-medium text-gray-700 text-sm">Team-Code</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {currentTenant.join_password || "Noch nicht festgelegt"}
            </p>
          </div>
          <Link
            href="/flohmarkt/settings/organization"
            className="flex items-center justify-center gap-2 min-w-[8rem] px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-all whitespace-nowrap no-underline focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2"
          >
            <Pencil className="h-4 w-4" />
            <span>Bearbeiten</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
