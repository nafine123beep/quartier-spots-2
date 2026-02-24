"use client";

import { Check, type LucideIcon } from "lucide-react";

export interface TutorialStep {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TutorialStepperProps {
  steps: TutorialStep[];
  activeIndex: number;
  onStepClick: (index: number) => void;
}

export function TutorialStepper({
  steps,
  activeIndex,
  onStepClick,
}: TutorialStepperProps) {
  return (
    <nav aria-label="Tutorial-Fortschritt" className="w-full">
      <ol className="flex items-center justify-between list-none m-0 p-0">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const Icon = step.icon;

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <button
                onClick={() => onStepClick(index)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Schritt ${index + 1}: ${step.label}${isCompleted ? " (abgeschlossen)" : ""}`}
                className={`
                  flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer p-0
                  focus:outline-none group
                `}
              >
                {/* Circle */}
                <span
                  className={`
                    w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center
                    text-sm font-semibold transition-all shrink-0
                    group-focus-visible:ring-2 group-focus-visible:ring-[#003366] group-focus-visible:ring-offset-2
                    ${isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-[#003366] text-white ring-4 ring-[#003366]/20"
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span className="hidden md:inline">{index + 1}</span>
                  )}
                  {/* Mobile: show icon instead of number */}
                  {!isCompleted && (
                    <Icon className="h-4 w-4 md:hidden" aria-hidden="true" />
                  )}
                </span>

                {/* Label — hidden on mobile */}
                <span
                  className={`
                    hidden md:block text-xs font-medium text-center leading-tight max-w-[80px]
                    ${isActive ? "text-gray-900" : isCompleted ? "text-green-700" : "text-gray-500"}
                  `}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line (not after last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 md:mx-3 rounded-full transition-colors
                    ${index < activeIndex ? "bg-green-500" : "bg-gray-200"}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
