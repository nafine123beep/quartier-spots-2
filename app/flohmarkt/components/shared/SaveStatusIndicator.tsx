"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Circle, XCircle } from "lucide-react";
import type { SaveStatus } from "@/app/flohmarkt/hooks/useEventAutosave";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  error?: string | null;
  className?: string;
}

export function SaveStatusIndicator({
  status,
  error,
  className = "",
}: SaveStatusIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // Auto-hide after 3 seconds when saved
  useEffect(() => {
    // Clear any existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    if (status === "saved") {
      // Show for 3 seconds, then hide
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      setHideTimeout(timeout);
      setIsVisible(true);
    } else {
      // Always visible for other statuses
      setIsVisible(true);
    }

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [status]);

  // Don't render if hidden
  if (!isVisible && status === "saved") {
    return null;
  }

  // Status configuration
  const statusConfig = {
    saved: {
      icon: Check,
      text: "Gespeichert",
      className: "text-green-700 bg-green-50 border-green-200",
      iconClassName: "text-green-600",
    },
    saving: {
      icon: Loader2,
      text: "Speichert …",
      className: "text-gray-700 bg-gray-50 border-gray-200",
      iconClassName: "text-gray-600 animate-spin",
    },
    unsaved: {
      icon: Circle,
      text: "Nicht gespeichert",
      className: "text-gray-700 bg-gray-50 border-gray-200",
      iconClassName: "text-gray-600",
    },
    error: {
      icon: XCircle,
      text: error || "Fehler beim Speichern",
      className: "text-red-700 bg-red-50 border-red-200",
      iconClassName: "text-red-600",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-20 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${config.className} ${className}`}
    >
      <Icon className={`h-4 w-4 ${config.iconClassName}`} aria-hidden="true" />
      <span>{config.text}</span>
    </div>
  );
}
