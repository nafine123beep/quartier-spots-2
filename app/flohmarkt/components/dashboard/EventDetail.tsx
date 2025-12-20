"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlohmarkt } from "../../FlohmarktContext";
import { EventControlPanel } from "./EventControlPanel";
import { AdminSpotTable } from "./AdminSpotTable";
import { EventEditForm } from "./EventEditForm";

export function EventDetail() {
  const router = useRouter();
  const {
    currentTenantEvent,
    currentTenant,
    user,
    logout,
    isAdmin,
    publishEvent,
    archiveEvent,
    deleteEvent,
  } = useFlohmarkt();

  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!currentTenantEvent || !currentTenant) {
    return null;
  }

  const handlePublish = async () => {
    if (!confirm("Event jetzt veröffentlichen? Es wird dann öffentlich sichtbar sein.")) return;

    setIsProcessing(true);
    const result = await publishEvent(currentTenantEvent.id);
    setIsProcessing(false);

    if (result.success) {
      alert("Event erfolgreich veröffentlicht!");
    } else {
      alert(`Fehler: ${result.error}`);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Event archivieren? Es wird dann nicht mehr öffentlich sichtbar sein.")) return;

    setIsProcessing(true);
    const result = await archiveEvent(currentTenantEvent.id);
    setIsProcessing(false);

    if (result.success) {
      alert("Event erfolgreich archiviert!");
    } else {
      alert(`Fehler: ${result.error}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Event wirklich unwiderruflich löschen? Alle Spots werden ebenfalls gelöscht!")) return;
    if (!confirm("Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden!")) return;

    setIsProcessing(true);
    const result = await deleteEvent(currentTenantEvent.id);
    setIsProcessing(false);

    if (result.success) {
      alert("Event erfolgreich gelöscht!");
      router.push(`/flohmarkt/organizations/${currentTenant.slug}`);
    } else {
      alert(`Fehler: ${result.error}`);
    }
  };

  const statusConfig = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Entwurf' },
    published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Veröffentlicht' },
    archived: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Archiviert' },
  };

  const config = statusConfig[currentTenantEvent.status];

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href={`/flohmarkt/organizations/${currentTenant.slug}`}
            className="bg-transparent border-none text-white text-2xl cursor-pointer hover:opacity-80 no-underline"
          >
            ←
          </Link>
          <div>
            <span className="font-bold text-lg">{currentTenantEvent.title}</span>
            <div className="text-sm text-gray-300 mt-1">
              {currentTenant.name}
              {isAdmin && <span className="ml-2 bg-yellow-500 text-black px-2 py-0.5 rounded text-xs">Admin</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-gray-300 hidden sm:inline">
              {user.email}
            </span>
          )}
          <button
            onClick={logout}
            className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto w-full max-w-[1000px] mx-auto flex-grow">
        {/* Event Info & Management */}
        {isEditing ? (
          <EventEditForm
            event={currentTenantEvent}
            onSave={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="bg-white p-5 rounded-lg shadow-md mb-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-grow">
                <h2 className="m-0 text-[#003366]">{currentTenantEvent.title}</h2>
                {currentTenantEvent.description && (
                  <p className="text-gray-600 mt-2">{currentTenantEvent.description}</p>
                )}
                <div className="text-sm text-gray-600 mt-2">
                  {currentTenantEvent.starts_at && (
                    <span>
                      Start: {new Date(currentTenantEvent.starts_at).toLocaleString("de-DE")}
                    </span>
                  )}
                  {currentTenantEvent.ends_at && (
                    <span className="ml-4">
                      Ende: {new Date(currentTenantEvent.ends_at).toLocaleString("de-DE")}
                    </span>
                  )}
                </div>
                {currentTenantEvent.map_center_address && (
                  <div className="text-sm text-gray-600 mt-2">
                    📍 Karten-Zentrum: {currentTenantEvent.map_center_address}
                  </div>
                )}
              </div>
              <span className={`px-3 py-1 rounded text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsEditing(true)}
                disabled={isProcessing}
                className="bg-[#003366] text-white px-4 py-2 rounded-md font-bold hover:bg-[#002244] disabled:opacity-50"
              >
                ✏️ Bearbeiten
              </button>

              {currentTenantEvent.status === 'draft' && (
                <button
                  onClick={handlePublish}
                  disabled={isProcessing}
                  className="bg-green-600 text-white px-4 py-2 rounded-md font-bold hover:bg-green-700 disabled:opacity-50"
                >
                  🚀 Veröffentlichen
                </button>
              )}

              {currentTenantEvent.status === 'published' && (
                <button
                  onClick={handleArchive}
                  disabled={isProcessing}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md font-bold hover:bg-yellow-700 disabled:opacity-50"
                >
                  📦 Archivieren
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-700 disabled:opacity-50 ml-auto"
              >
                🗑️ Löschen
              </button>
            </div>
          </div>
        )}

        {/* Existing components */}
        <div className="flex flex-col gap-5">
          <EventControlPanel />
          <AdminSpotTable />
        </div>
      </div>
    </div>
  );
}
