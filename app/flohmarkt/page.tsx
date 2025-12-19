"use client";

import { FlohmarktProvider, useFlohmarkt } from "./FlohmarktContext";
import { FrontPage } from "./components/FrontPage";
import { TenantDashboard } from "./components/tenant/TenantDashboard";
import { EventOverview } from "./components/tenant/EventOverview";
import { EventDetail } from "./components/dashboard/EventDetail";
import { SettingsPage } from "./components/settings/SettingsPage";
import { AppView } from "./components/app/AppView";

function FlohmarktApp() {
  const { currentView } = useFlohmarkt();

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* Render current view */}
      {currentView === "frontpage" && <FrontPage />}
      {currentView === "tenantDashboard" && <TenantDashboard />}
      {currentView === "eventOverview" && <EventOverview />}
      {currentView === "eventDetail" && <EventDetail />}
      {currentView === "settings" && <SettingsPage />}
      {currentView === "app" && <AppView />}
    </div>
  );
}

export default function FlohmarktPage() {
  return (
    <FlohmarktProvider>
      <FlohmarktApp />
    </FlohmarktProvider>
  );
}
