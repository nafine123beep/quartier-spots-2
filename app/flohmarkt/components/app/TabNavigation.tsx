"use client";

import { useFlohmarkt } from "../../FlohmarktContext";
import { AppTabType } from "../../types";

const TABS: { id: AppTabType; label: string }[] = [
  { id: "list", label: "Liste" },
  { id: "map", label: "Karte" },
  { id: "form", label: "Hinzufügen" },
];

export function TabNavigation() {
  const { currentTab, setCurrentTab } = useFlohmarkt();

  return (
    <nav className="flex h-[50px] bg-white border-b border-gray-300 shrink-0 z-[1900]">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrentTab(tab.id)}
          className={`
            flex-1 border-none bg-transparent font-bold cursor-pointer text-base
            border-b-4 transition-colors
            ${
              currentTab === tab.id
                ? "text-[#003366] border-b-[#FFCC00] bg-gray-50"
                : "text-gray-600 border-b-transparent hover:text-gray-800"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
