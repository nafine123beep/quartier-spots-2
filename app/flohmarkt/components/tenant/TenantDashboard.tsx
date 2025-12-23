"use client";

import { useState } from "react";
import Link from "next/link";
import { useFlohmarkt } from "../../FlohmarktContext";
import { CreateTenantForm } from "./CreateTenantForm";
import { JoinTenantForm } from "./JoinTenantForm";
import { TenantCard } from "./TenantCard";

type Mode = "list" | "create" | "join";

export function TenantDashboard() {
  const { tenants, user, logout, loading } = useFlohmarkt();
  const [mode, setMode] = useState<Mode>("list");

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/flohmarkt"
            className="bg-transparent border-none text-white text-2xl cursor-pointer hover:opacity-80 no-underline"
          >
            ←
          </Link>
          <div>
            <span className="font-bold text-lg">Meine Organisationen</span>
            {user && (
              <div className="text-sm text-gray-300 mt-1">
                {user.name !== user.email ? `${user.name} (${user.email})` : user.email}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/flohmarkt/settings/profile"
            className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 no-underline text-lg"
            title="Profil bearbeiten"
          >
            ⚙️
          </Link>
          <button
            onClick={logout}
            className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto w-full max-w-[800px] mx-auto flex-grow">
        {mode === "list" && (
          <>
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-4"></div>
                <p>Lade Organisationen...</p>
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
    </div>
  );
}
