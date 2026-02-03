"use client";

import { Check, Lock } from "lucide-react";
import { JourneyStep, StepConfig } from "./EventJourneyContainer";

interface EventJourneyStepIndicatorProps {
  steps: StepConfig[];
  currentStep: JourneyStep;
  maxAccessibleStep: JourneyStep;
  onStepClick: (step: JourneyStep) => void;
}

export function EventJourneyStepIndicator({
  steps,
  currentStep,
  maxAccessibleStep,
  onStepClick,
}: EventJourneyStepIndicatorProps) {
  const isCompleted = (stepId: JourneyStep): boolean => {
    return stepId < currentStep;
  };

  const isAccessible = (stepId: JourneyStep): boolean => {
    return stepId <= maxAccessibleStep;
  };

  const isCurrent = (stepId: JourneyStep): boolean => {
    return stepId === currentStep;
  };

  return (
    <div className="bg-white border-b border-gray-200 py-3 px-2 sm:px-4 overflow-x-auto">
      <nav
        className="flex items-center justify-center gap-1 sm:gap-2 min-w-fit mx-auto"
        role="tablist"
        aria-label="Event-Schritte"
      >
        {steps.map((step, index) => {
          const completed = isCompleted(step.id);
          const accessible = isAccessible(step.id);
          const current = isCurrent(step.id);
          const locked = !accessible;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => accessible && onStepClick(step.id)}
                disabled={!accessible}
                role="tab"
                aria-selected={current}
                aria-disabled={!accessible}
                className={`
                  flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all
                  min-w-[60px] sm:min-w-[80px]
                  ${current
                    ? "bg-[#003366] text-white"
                    : completed
                      ? "text-green-600 hover:bg-green-50"
                      : accessible
                        ? "text-gray-600 hover:bg-gray-100"
                        : "text-gray-400 cursor-not-allowed"
                  }
                  ${accessible && !current ? "cursor-pointer" : ""}
                  focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2
                `}
              >
                <span
                  className={`
                    w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                    text-xs sm:text-sm font-medium
                    ${current
                      ? "bg-white text-[#003366]"
                      : completed
                        ? "bg-green-100 text-green-600 border-2 border-green-500"
                        : accessible
                          ? "border-2 border-current"
                          : "border-2 border-gray-300 bg-gray-100"
                    }
                  `}
                >
                  {completed ? (
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : locked ? (
                    <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  ) : (
                    step.id
                  )}
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </span>
              </button>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-4 sm:w-8 h-0.5 mx-0.5 sm:mx-1
                    ${completed ? "bg-green-500" : "bg-gray-300"}
                  `}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Mobile: Show locked steps info */}
      {maxAccessibleStep < 5 && (
        <p className="text-center text-xs text-gray-500 mt-2 px-4">
          Schritte 4-5 werden nach der Veröffentlichung freigeschaltet
        </p>
      )}
    </div>
  );
}
