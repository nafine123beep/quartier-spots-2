"use client";

import { useState, useEffect, useCallback } from "react";
import { Link2, Copy, Check, Users } from "lucide-react";
import { useFlohmarkt } from "../../FlohmarktContext";

export function MemberManagementSection() {
  const { currentTenant } = useFlohmarkt();
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

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

      if (res.ok) {
        const data = await res.json();
        setInviteToken(data.invite_token);
      }
    } catch {
      // Silently fail — invite link won't be shown
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

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const handleCopyCode = async () => {
    if (!currentTenant?.join_password) return;
    try {
      await navigator.clipboard.writeText(currentTenant.join_password);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  if (!currentTenant) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-6 w-6 text-gray-800" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-gray-800 m-0">
          Mitgliederverwaltung
        </h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Block A: Invite Link */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            <Link2 className="inline h-4 w-4 mr-1 -mt-0.5" aria-hidden="true" />
            Einladungslink
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={loadingToken ? "Wird generiert..." : inviteUrl}
              className="flex-1 p-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-gray-50"
              aria-label="Einladungslink"
            />
            <button
              onClick={handleCopyLink}
              disabled={!inviteToken || loadingToken}
              className="flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {linkCopied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Link kopieren
                </>
              )}
            </button>
          </div>
          {linkCopied && (
            <p className="text-green-600 text-sm mt-1">Link kopiert</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6" />

        {/* Block B: Team Code */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Team-Code (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={currentTenant.join_password ?? ""}
              className="flex-1 p-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-gray-50 font-mono tracking-wider"
              aria-label="Team-Code"
            />
            <button
              onClick={handleCopyCode}
              disabled={!currentTenant.join_password}
              className="flex items-center gap-2 border-2 border-gray-400 text-gray-700 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-100 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {codeCopied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Code kopieren
                </>
              )}
            </button>
          </div>
          {codeCopied && (
            <p className="text-green-600 text-sm mt-1">Code kopiert</p>
          )}
          <p className="text-gray-500 text-sm mt-2">
            Alternativ kannst du den Team-Code teilen, falls jemand den Link nicht öffnen kann.
          </p>
        </div>
      </div>
    </section>
  );
}
