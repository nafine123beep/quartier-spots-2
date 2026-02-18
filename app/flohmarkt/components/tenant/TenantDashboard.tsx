"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Settings } from "lucide-react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { AppShell } from "../shared/AppShell";
import { CreateTenantForm } from "./CreateTenantForm";
import { JoinTenantForm } from "./JoinTenantForm";
import { TenantCard } from "./TenantCard";
import { OrganizationHomeDashboard } from "./OrganizationHomeDashboard";

type Mode = "list" | "create" | "join";

export function TenantDashboard() {
  const { tenants, currentTenant, user, logout, loading, isAuthenticated } = useFlohmarkt();
  const searchParams = useSearchParams();
  const viewAll = searchParams.get('view') === 'all';
  const [mode, setMode] = useState<Mode>("list");
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Update page title
  useEffect(() => {
    document.title = "Meine Organisationen | Quartierspot";
  }, []);

  // Track when we've checked authentication status
  useEffect(() => {
    // Wait a bit to let the auth check complete
    const timer = setTimeout(() => {
      setHasCheckedAuth(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Add timeout for loading state - trigger if stuck loading for too long
  useEffect(() => {
    if (!hasCheckedAuth) return; // Wait for initial auth check

    const timer = setTimeout(() => {
      // If after 10 seconds we still have no user or no tenants, show error
      if (!user || !isAuthenticated) {
        setLoadingTimeout(true);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timer);
  }, [hasCheckedAuth, user, isAuthenticated]);

  // If user has selected org AND not explicitly viewing all → show dashboard
  if (currentTenant && !viewAll) {
    return <OrganizationHomeDashboard />;
  }

  // Otherwise show existing multi-tenant selector/create/join UI
  const subtitle = user
    ? (user.name !== user.email ? `${user.name} (${user.email})` : user.email)
    : undefined;

  return (
    <AppShell
      title="Meine Organisationen"
      subtitle={subtitle}
      backHref="/flohmarkt"
      backLabel="Zurück zur Startseite"
      actions={[
        { icon: <Settings className="h-5 w-5" />, label: "Einstellungen", href: "/flohmarkt/settings", showLabel: "never" },
      ]}
    >
      <div className="p-5 overflow-y-auto w-full max-w-[800px] mx-auto">
        {mode === "list" && (
          <>
            {loadingTimeout ? (
              <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
                <h2 className="text-red-600 mt-0">Laden fehlgeschlagen</h2>
                <p className="text-gray-600 mb-6">
                  Die Organisationen konnten nicht geladen werden. Möglicherweise bist du nicht mehr angemeldet.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-[#003366] text-white px-6 py-3 rounded-md font-bold cursor-pointer hover:bg-[#002244]"
                  >
                    Neu laden
                  </button>
                  <button
                    onClick={logout}
                    className="bg-white border-2 border-[#003366] text-[#003366] px-6 py-3 rounded-md font-bold cursor-pointer hover:bg-gray-50"
                  >
                    Zur Startseite
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-4"></div>
                <p className="text-[#003366] font-semibold">Lade Organisationen...</p>
              </div>
            ) : tenants.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h2 className="text-[#003366] mt-0">Willkommen!</h2>
                <p className="text-gray-600 mb-6">
                  Du bist noch keiner Organisation beigetreten. Erstelle eine neue Organisation oder tritt einer bestehenden bei.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={() => setMode("create")}
                    className="bg-[#003366] text-white px-6 py-3 rounded-md font-bold cursor-pointer hover:bg-[#002244]"
                  >
                    Organisation erstellen
                  </button>
                  <button
                    onClick={() => setMode("join")}
                    className="bg-white border-2 border-[#003366] text-[#003366] px-6 py-3 rounded-md font-bold cursor-pointer hover:bg-gray-50"
                  >
                    Organisation beitreten
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-[#003366] m-0">Deine Organisationen</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode("create")}
                      className="bg-[#003366] text-white px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-[#002244] text-sm"
                    >
                      + Neu
                    </button>
                    <button
                      onClick={() => setMode("join")}
                      className="bg-white border border-[#003366] text-[#003366] px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-gray-50 text-sm"
                    >
                      Beitreten
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {tenants.map((tenant) => (
                    <TenantCard key={tenant.id} tenant={tenant} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {mode === "create" && (
          <CreateTenantForm onBack={() => setMode("list")} />
        )}

        {mode === "join" && (
          <JoinTenantForm onBack={() => setMode("list")} />
        )}
      </div>
    </AppShell>
  );
}
