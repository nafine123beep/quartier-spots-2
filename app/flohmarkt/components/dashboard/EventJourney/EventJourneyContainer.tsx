"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFlohmarkt } from "../../../FlohmarktContext";
import { EventJourneyStepIndicator } from "./EventJourneyStepIndicator";
import { CreateStep } from "./steps/CreateStep";
import { PreviewStep } from "./steps/PreviewStep";
import { ShareStep } from "./steps/ShareStep";
import { ManageStep } from "./steps/ManageStep";
import { ArrowLeft } from "lucide-react";

export type JourneyStep = 1 | 2 | 3 | 4;

export interface StepConfig {
  id: JourneyStep;
  label: string;
  shortLabel: string;
}

export const JOURNEY_STEPS: StepConfig[] = [
  { id: 1, label: "Grunddaten", shortLabel: "Grunddaten" },
  { id: 2, label: "Vorschau", shortLabel: "Vorschau" },
  { id: 3, label: "Verbreiten", shortLabel: "Verbreiten" },
  { id: 4, label: "Verwalten", shortLabel: "Verwalten" },
];

function determineInitialStep(status: string | undefined): JourneyStep {
  switch (status) {
    case "active":
      return 2; // Jump to Preview for active events
    case "archived":
      return 4; // Jump to Manage for archived events
    default:
      return 1; // Start at Create
  }
}

function getMaxAccessibleStep(): JourneyStep {
  return 4; // All steps always accessible
}

export function EventJourneyContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentTenantEvent, currentTenant, user, logout, isAdmin } = useFlohmarkt();

  const [currentStep, setCurrentStep] = useState<JourneyStep>(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      const parsed = parseInt(stepParam, 10) as JourneyStep;
      if (parsed >= 1 && parsed <= 4) {
        return parsed;
      }
    }
    return determineInitialStep(currentTenantEvent?.status);
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const maxAccessibleStep = getMaxAccessibleStep();

  // Sync step with URL
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("step", String(currentStep));
    window.history.replaceState({}, "", url.toString());
  }, [currentStep]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const step = parseInt(params.get("step") || "1", 10);
      if (step >= 1 && step <= 4 && step <= maxAccessibleStep) {
        setCurrentStep(step as JourneyStep);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [maxAccessibleStep]);

  const canNavigateToStep = useCallback(
    (step: JourneyStep): boolean => {
      return step <= maxAccessibleStep;
    },
    [maxAccessibleStep]
  );

  const goToStep = useCallback(
    (step: JourneyStep) => {
      if (!canNavigateToStep(step)) return;

      if (hasUnsavedChanges && currentStep === 1) {
        if (!confirm("Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren?")) {
          return;
        }
      }

      setCurrentStep(step);
    },
    [canNavigateToStep, hasUnsavedChanges, currentStep]
  );

  const goToNextStep = useCallback(() => {
    if (currentStep < 4 && canNavigateToStep((currentStep + 1) as JourneyStep)) {
      goToStep((currentStep + 1) as JourneyStep);
    }
  }, [currentStep, canNavigateToStep, goToStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as JourneyStep);
    }
  }, [currentStep, goToStep]);

  const handleBackToOrganization = useCallback(() => {
    if (hasUnsavedChanges) {
      if (!confirm("Du hast ungespeicherte Änderungen. Möchtest du wirklich zurück?")) {
        return;
      }
    }
    router.push(`/flohmarkt/organizations/${currentTenant?.slug}`);
  }, [hasUnsavedChanges, router, currentTenant?.slug]);

  if (!currentTenantEvent || !currentTenant) {
    return null;
  }

  const statusConfig = {
    active: { bg: "bg-green-100", text: "text-green-700", label: "Aktiv" },
    archived: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Archiviert" },
  };

  const config = statusConfig[currentTenantEvent.status];

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-4 sm:p-5">
        <div className="flex justify-between items-center max-w-[1000px] mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleBackToOrganization}
              className="bg-transparent border-none text-white text-xl cursor-pointer hover:opacity-80 p-1"
              aria-label="Zurück zur Organisation"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0">
              <span className="font-bold text-base sm:text-lg block truncate">
                {currentTenantEvent.title}
              </span>
              <div className="text-sm text-gray-300 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="truncate">{currentTenant.name}</span>
                {isAdmin && (
                  <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-xs whitespace-nowrap">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${config.bg} ${config.text}`}>
              {config.label}
            </span>
            {user && (
              <span className="text-sm text-gray-300 hidden lg:inline truncate max-w-[150px]">
                {user.email}
              </span>
            )}
            <button
              onClick={logout}
              className="bg-transparent border border-white text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded cursor-pointer hover:bg-white/10 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <EventJourneyStepIndicator
        steps={JOURNEY_STEPS}
        currentStep={currentStep}
        maxAccessibleStep={maxAccessibleStep}
        onStepClick={goToStep}
      />

      {/* Content */}
      <div className="flex-grow overflow-y-auto">
        <div className="p-4 sm:p-5 w-full max-w-[800px] mx-auto">
          {currentStep === 1 && (
            <CreateStep
              onNext={goToNextStep}
              onUnsavedChanges={setHasUnsavedChanges}
            />
          )}
          {currentStep === 2 && (
            <PreviewStep
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}
          {currentStep === 3 && (
            <ShareStep
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}
          {currentStep === 4 && (
            <ManageStep
              onBack={goToPreviousStep}
            />
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-[800px] mx-auto flex justify-between items-center">
          <button
            onClick={currentStep === 1 ? handleBackToOrganization : goToPreviousStep}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Zurück</span>
          </button>

          <span className="text-sm text-gray-500">
            Schritt {currentStep} von 4
          </span>

          {currentStep < 4 && canNavigateToStep((currentStep + 1) as JourneyStep) && (
            <button
              onClick={goToNextStep}
              className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors font-medium"
            >
              <span>Weiter</span>
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
          )}

          {(currentStep === 4 || !canNavigateToStep((currentStep + 1) as JourneyStep)) && (
            <div className="w-[100px]" /> // Spacer for alignment
          )}
        </div>
      </div>
    </div>
  );
}
