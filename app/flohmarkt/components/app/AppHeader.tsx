"use client";

import Link from "next/link";
import { useFlohmarkt } from "../../FlohmarktContext";

export function AppHeader() {
  const { currentEvent } = useFlohmarkt();

  return (
    <header className="bg-[#003366] text-white h-[60px] flex justify-between items-center px-5 shrink-0 z-[2000] shadow-md">
      <div className="text-xl font-bold">
        {currentEvent?.title || "2. Hof-Flohmarkt Werderau"}
      </div>
      <Link
        href="/flohmarkt"
        className="text-[#FFCC00] font-bold cursor-pointer no-underline hover:underline"
      >
        🏠 Start
      </Link>
    </header>
  );
}
