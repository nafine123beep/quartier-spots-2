"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useFlohmarkt } from '../FlohmarktContext';

export default function TutorialLayout({ children }: { children: React.ReactNode }) {
  const { currentTenant } = useFlohmarkt();
  const backHref = currentTenant
    ? `/flohmarkt/organizations/${currentTenant.slug}`
    : "/flohmarkt/organizations";

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <header className="bg-[#003366] text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href={backHref}
            className="text-white hover:text-gray-200 no-underline flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Zurück zum Dashboard</span>
          </Link>
          <h1 className="text-xl font-bold m-0 ml-auto">QuartierSpots Tutorials</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6 pb-12">
        {children}
      </main>
    </div>
  );
}
