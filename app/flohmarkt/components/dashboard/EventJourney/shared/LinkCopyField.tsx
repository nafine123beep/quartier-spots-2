"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface LinkCopyFieldProps {
  label: string;
  description?: string;
  url: string;
}

export function LinkCopyField({ label, description, url }: LinkCopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex-grow min-w-0">
        <p className="font-medium text-gray-700 text-sm">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={handleCopy}
        className={`
          flex items-center justify-center gap-2 min-w-[8rem] px-4 py-2 rounded-lg font-medium text-sm
          transition-all whitespace-nowrap
          ${copied
            ? "bg-green-100 text-green-700 border border-green-300"
            : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
          }
          focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2
        `}
        aria-label={`${label} kopieren`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span>Kopiert!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span>Kopieren</span>
          </>
        )}
      </button>
    </div>
  );
}
