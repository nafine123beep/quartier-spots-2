"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, HelpCircle, LogOut } from "lucide-react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { UpcomingEventsSection } from "./UpcomingEventsSection";
import { MemberManagementSection } from "./MemberManagementSection";
import { TutorialsSection } from "./TutorialsSection";
import { SupportFormModal } from "../shared/SupportFormModal";

export function OrganizationHomeDashboard() {
  const { currentTenant, upcomingEvents, user, isAdmin, logout } = useFlohmarkt();
  const [showSupport, setShowSupport] = useState(false);

  if (!currentTenant) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <header className="bg-[#003366] text-white p-5 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Organization Switcher (shows org name or dropdown) */}
          <OrganizationSwitcher />

          {/* User Info */}
          <div className="text-sm opacity-90">
            {user?.name && user.name !== user.email ? user.name : user?.email}
            {isAdmin && (
              <span className="ml-2 bg-yellow-400 text-black px-2 py-0.5 rounded text-xs font-bold">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSupport(true)}
            className="flex items-center gap-2 bg-transparent border border-white text-white px-3 py-2 rounded hover:bg-white/10 transition-colors text-sm"
            aria-label="Hilfe & Support"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Hilfe</span>
          </button>

          <Link
            href="/flohmarkt/settings"
            className="flex items-center gap-2 bg-transparent border border-white text-white px-3 py-2 rounded hover:bg-white/10 transition-colors text-sm no-underline"
            aria-label="Einstellungen"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Einstellungen</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-transparent border border-white text-white px-3 py-2 rounded hover:bg-white/10 transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-5 overflow-y-auto flex-grow">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            {currentTenant.name}
          </h1>
          <p className="text-gray-600 mb-8">Übersicht & nächste Schritte</p>

          <UpcomingEventsSection events={upcomingEvents} />
          <MemberManagementSection />
          <TutorialsSection />
        </div>
      </main>

      {/* Support Modal */}
      <SupportFormModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
}
