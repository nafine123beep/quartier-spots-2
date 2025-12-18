"use client";

import { FlohmarktProvider, useFlohmarkt } from "./FlohmarktContext";
import { FrontPage } from "./components/FrontPage";
import { LoginView } from "./components/auth/LoginView";
import { RegisterView } from "./components/auth/RegisterView";
import { OrganizerDashboard } from "./components/dashboard/OrganizerDashboard";
import { AppView } from "./components/app/AppView";

function FlohmarktApp() {
  const { currentView } = useFlohmarkt();

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* Render current view */}
      {currentView === "frontpage" && <FrontPage />}
      {currentView === "login" && <LoginView />}
      {currentView === "register" && <RegisterView />}
      {currentView === "dashboard" && <OrganizerDashboard />}
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
