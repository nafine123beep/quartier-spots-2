"use client";

import { useFlohmarkt } from "../../FlohmarktContext";

export function AppHeader() {
  const { currentEvent, setCurrentView } = useFlohmarkt();

  return (
    <header className="bg-[#003366] text-white h-[60px] flex justify-between items-center px-5 shrink-0 z-[2000] shadow-md">
      <div className="text-xl font-bold">
        {currentEvent?.title || "2. Hof-Flohmarkt Werderau"}
      </div>
      <a
        onClick={() => setCurrentView("frontpage")}
        className="text-[#FFCC00] font-bold cursor-pointer no-underline hover:underline"
      >
        🏠 Start
      </a>
    </header>
  );
}
