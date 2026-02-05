"use client";

import { JourneyStep, StepConfig } from "./EventJourneyContainer";

interface EventJourneyStepIndicatorProps {
  steps: StepConfig[];
  currentStep: JourneyStep;
  onStepClick: (step: JourneyStep) => void;
}

export function EventJourneyStepIndicator({
  steps,
  currentStep,
  onStepClick,
}: EventJourneyStepIndicatorProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4">
      <nav
        className="flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Event-Bereiche"
      >
        {steps.map((step) => {
          const current = step.id === currentStep;
          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              role="tab"
              aria-selected={current}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2
                ${current
                  ? "bg-[#003366] text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
                }
              `}
            >
              {step.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
