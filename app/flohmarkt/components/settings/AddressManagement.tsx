"use client";

import { useState, useEffect } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { createClient } from "@/lib/supabase/client";
import {
  loadLocationCache,
  clearLocationCache,
  syncCacheToDatabase,
  syncCacheFromDatabase,
  saveLocationToCache,
  isCompleteCache,
} from "../../lib/locationCache";
import { LocationCache } from "../../types";

export function AddressManagement() {
  const { user } = useFlohmarkt();
  const [cache, setCache] = useState<LocationCache | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Edit form state
  const [editStreet, setEditStreet] = useState("");
  const [editHouseNumber, setEditHouseNumber] = useState("");
  const [editZip, setEditZip] = useState("");
  const [editCity, setEditCity] = useState("");

  // Load cache on mount
  useEffect(() => {
    loadCache();
  }, []);

  const loadCache = () => {
    const loadedCache = loadLocationCache();
    setCache(loadedCache);
  };

  const handleClear = async () => {
    if (!confirm("Möchtest du die gespeicherte Adresse wirklich löschen?")) {
      return;
    }

    try {
      const supabase = createClient();
      await clearLocationCache(user?.id, supabase);
      setCache(null);
      setMessage({ type: "success", text: "Adresse wurde gelöscht" });
    } catch (error) {
      console.error("Error clearing cache:", error);
      setMessage({
        type: "error",
        text: "Fehler beim Löschen der Adresse",
      });
    }
  };

  const handleEdit = () => {
    if (isCompleteCache(cache)) {
      setEditStreet(cache.address.street);
      setEditHouseNumber(cache.address.houseNumber);
      setEditZip(cache.address.zip);
      setEditCity(cache.address.city);
      setIsEditing(true);
    } else {
      setMessage({
        type: 'error',
        text: 'Keine vollständige Adresse zum Bearbeiten verfügbar',
      });
    }
  };

  const handleSaveEdit = () => {
    if (!editStreet || !editCity) {
      setMessage({
        type: "error",
        text: "Straße und Stadt sind Pflichtfelder",
      });
      return;
    }

    try {
      const addressRaw = `${editStreet}${editHouseNumber ? " " + editHouseNumber : ""}, ${editZip} ${editCity}`;

      // Preserve existing coordinates if available, otherwise use city-level precision
      const coordinates = cache?.coordinates || {
        lat: 0,
        lng: 0,
        geoPrecision: "city" as const
      };

      saveLocationToCache(
        {
          street: editStreet,
          houseNumber: editHouseNumber,
          zip: editZip,
          city: editCity,
          addressRaw,
        },
        coordinates,
        true
      );

      loadCache();
      setIsEditing(false);
      setMessage({ type: "success", text: "Adresse wurde aktualisiert" });
    } catch (error) {
      console.error("Error saving edited address:", error);
      setMessage({
        type: "error",
        text: "Fehler beim Speichern der Adresse",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditStreet("");
    setEditHouseNumber("");
    setEditZip("");
    setEditCity("");
  };

  const handleSyncToDatabase = async () => {
    if (!user) {
      setMessage({
        type: "error",
        text: "Du musst angemeldet sein, um zu synchronisieren",
      });
      return;
    }

    setIsSyncing(true);
    setMessage(null);

    try {
      const supabase = createClient();
      await syncCacheToDatabase(user.id, supabase);
      setMessage({
        type: "success",
        text: "Adresse wurde mit der Datenbank synchronisiert",
      });
    } catch (error) {
      console.error("Error syncing to database:", error);
      setMessage({
        type: "error",
        text: "Fehler bei der Synchronisierung",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncFromDatabase = async () => {
    if (!user) {
      setMessage({
        type: "error",
        text: "Du musst angemeldet sein, um zu synchronisieren",
      });
      return;
    }

    setIsSyncing(true);
    setMessage(null);

    try {
      const supabase = createClient();
      await syncCacheFromDatabase(user.id, supabase);
      loadCache();
      setMessage({
        type: "success",
        text: "Adresse wurde von der Datenbank geladen",
      });
    } catch (error) {
      console.error("Error syncing from database:", error);
      setMessage({
        type: "error",
        text: "Fehler beim Laden von der Datenbank",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!isCompleteCache(cache) || !cache.consentGiven) {
    return (
      <div className="text-sm text-gray-600">
        <p>Keine gespeicherte Adresse vorhanden.</p>
        <p className="mt-2 text-xs">
          Beim nächsten Spot kannst du wählen, ob die Adresse gespeichert werden
          soll.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Current address or edit form */}
      {isEditing ? (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Adresse bearbeiten</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Straße *
              </label>
              <input
                type="text"
                value={editStreet}
                onChange={(e) => setEditStreet(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="Hauptstraße"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hausnummer
              </label>
              <input
                type="text"
                value={editHouseNumber}
                onChange={(e) => setEditHouseNumber(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="42"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PLZ
                </label>
                <input
                  type="text"
                  value={editZip}
                  onChange={(e) => setEditZip(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="93051"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stadt *
                </label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Regensburg"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#003366] text-white rounded-md hover:bg-[#004477] transition-colors text-sm font-medium"
              >
                Speichern
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Gespeicherte Adresse</h4>
          </div>
          <div className="space-y-1 text-sm text-gray-700">
            <p className="font-medium">{cache.address.addressRaw}</p>
            <p className="text-xs text-gray-500">
              Zuletzt verwendet: {formatDate(cache.lastUsed)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Adresse ändern
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 bg-white border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Adresse löschen
            </button>
          </div>
        </div>
      )}

      {/* Database sync section (authenticated users only) */}
      {user && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            Geräteübergreifende Synchronisierung
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Synchronisiere deine gespeicherte Adresse mit anderen Geräten über
            dein Konto.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSyncToDatabase}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? "Synchronisiere..." : "Auf Server speichern"}
            </button>
            <button
              onClick={handleSyncFromDatabase}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? "Synchronisiere..." : "Vom Server laden"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
