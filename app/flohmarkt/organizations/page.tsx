"use client";

import { Suspense } from "react";
import { TenantDashboard } from "../components/tenant/TenantDashboard";

function TenantDashboardWrapper() {
  return <TenantDashboard />;
}

export default function OrganizationsPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-gray-100 z-[3500] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-[#003366] font-semibold">Lade Dashboard...</p>
        </div>
      </div>
    }>
      <TenantDashboardWrapper />
    </Suspense>
  );
}
