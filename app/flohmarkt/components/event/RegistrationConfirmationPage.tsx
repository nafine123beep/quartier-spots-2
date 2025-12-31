"use client";

import { useRouter } from "next/navigation";
import { useFlohmarkt } from "../../FlohmarktContext";
import { AccessMode } from "../../lib/loadEventData";

interface RegistrationConfirmationPageProps {
  accessMode?: AccessMode;
}

export function RegistrationConfirmationPage({ accessMode = 'public' }: RegistrationConfirmationPageProps) {
  const router = useRouter();
  const { currentTenantEvent, currentTenant } = useFlohmarkt();

  if (!currentTenantEvent || !currentTenant) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleContinue = () => {
    // Navigate to main event page with form tab selected
    router.push(`/flohmarkt/${currentTenant.slug}/${currentTenantEvent.slug}?tab=form`);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-y-auto">
      {/* Draft Banner - Only shown when event is in draft status */}
      {currentTenantEvent.status === 'draft' && (
        <div className={`${accessMode === 'preview' ? 'bg-purple-500 border-purple-600' : 'bg-yellow-500 border-yellow-600'} text-gray-900 px-4 py-3 shadow-md border-b-2`}>
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
            <span className="text-2xl">{accessMode === 'preview' ? '👁️' : '⚠️'}</span>
            <div className="flex-1 text-center sm:text-left">
              <p className={`font-bold text-sm sm:text-base m-0 ${accessMode === 'preview' ? 'text-white' : ''}`}>
                {accessMode === 'preview'
                  ? 'VORSCHAU-LINK: Du siehst eine Vorabversion dieses Events'
                  : 'VORSCHAU-MODUS: Dieses Event ist noch nicht veröffentlicht'
                }
              </p>
              <p className={`text-xs sm:text-sm m-0 mt-1 ${accessMode === 'preview' ? 'text-purple-100' : ''}`}>
                {accessMode === 'preview'
                  ? 'Diese Ansicht ist nur über den Vorschau-Link zugänglich.'
                  : 'Nur Organisatoren können diese Seite sehen.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#003366] m-0">
                Am {currentTenantEvent.title} teilnehmen
              </h1>
              {/* Draft Badge */}
              {currentTenantEvent.status === 'draft' && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  accessMode === 'preview'
                    ? 'bg-purple-500 text-white border-2 border-purple-600'
                    : 'bg-yellow-500 text-gray-900 border-2 border-yellow-600'
                }`}>
                  <span className="mr-1">{accessMode === 'preview' ? '👁️' : '📝'}</span>
                  {accessMode === 'preview' ? 'VORSCHAU' : 'ENTWURF'}
                </span>
              )}
            </div>
            <p className="text-lg text-gray-600">
              Trage deinen Spot ein und werde Teil des Flohmarkts!
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-6 mb-8">
            {/* Description */}
            {currentTenantEvent.description && (
              <div>
                <h2 className="text-lg font-bold text-[#003366] mb-2">Über das Event</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {currentTenantEvent.description}
                </p>
              </div>
            )}

            {/* Date and Time */}
            {(currentTenantEvent.starts_at || currentTenantEvent.ends_at) && (
              <div>
                <h2 className="text-lg font-bold text-[#003366] mb-2">Wann</h2>
                <div className="text-gray-700 space-y-1">
                  {currentTenantEvent.starts_at && (
                    <p className="flex items-center gap-2 m-0">
                      <span className="font-medium">Start:</span>
                      <span>{formatDate(currentTenantEvent.starts_at)}</span>
                    </p>
                  )}
                  {currentTenantEvent.ends_at && (
                    <p className="flex items-center gap-2 m-0">
                      <span className="font-medium">Ende:</span>
                      <span>{formatDate(currentTenantEvent.ends_at)}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {currentTenantEvent.map_center_address && (
              <div>
                <h2 className="text-lg font-bold text-[#003366] mb-2">Wo</h2>
                <div className="text-gray-700">
                  <p className="flex items-center gap-2 m-0">
                    <span>📍</span>
                    <span>{currentTenantEvent.map_center_address}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <button
              onClick={handleContinue}
              className="w-full bg-[#003366] text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-[#002244] transition-colors shadow-lg hover:shadow-xl"
            >
              Weiter zur Spot Anmeldung →
            </button>
            <p className="text-center text-sm text-gray-500 m-0">
              Keine Anmeldung erforderlich • Kostenlos
            </p>
          </div>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <a
              href={`/flohmarkt/${currentTenant.slug}/${currentTenantEvent.slug}`}
              className="text-[#003366] hover:underline text-sm"
            >
              ← Zurück zur Event-Übersicht
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
