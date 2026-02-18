"use client";

import { useFlohmarkt } from '../FlohmarktContext';
import { AppShell } from '../components/shared/AppShell';

export default function TutorialLayout({ children }: { children: React.ReactNode }) {
  const { currentTenant } = useFlohmarkt();
  const backHref = currentTenant
    ? `/flohmarkt/organizations/${currentTenant.slug}`
    : "/flohmarkt/organizations";

  return (
    <AppShell
      title="QuartierSpots Tutorials"
      backHref={backHref}
      backLabel="Zurück zum Dashboard"
      showLogout={false}
    >
      <div className="max-w-4xl mx-auto p-6 pb-12">
        {children}
      </div>
    </AppShell>
  );
}
