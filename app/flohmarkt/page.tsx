"use client";

import { Suspense } from "react";
import { FrontPage } from "./components/FrontPage";

export default function FlohmarktPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-[#003366] flex items-center justify-center">
        <p className="text-white font-semibold">Laden...</p>
      </div>
    }>
      <FrontPage />
    </Suspense>
  );
}
