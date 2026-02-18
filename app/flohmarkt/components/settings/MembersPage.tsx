"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";
import { useFlohmarkt } from "../../FlohmarktContext";

export function MembersPage() {
  const { currentTenant, members, loadMembers, user } = useFlohmarkt();

  useEffect(() => {
    if (currentTenant && members.length === 0) {
      loadMembers();
    }
  }, [currentTenant, members.length, loadMembers]);

  if (!currentTenant) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
        <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
          <span className="font-bold text-lg">Mitglieder</span>
          <Link
            href="/flohmarkt/settings"
            className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 no-underline flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Link>
        </div>
        <div className="p-5 overflow-y-auto w-full max-w-[600px] mx-auto flex-grow">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Keine Organisation ausgewählt.</p>
            <Link
              href="/flohmarkt/organizations"
              className="mt-4 inline-block bg-[#003366] text-white px-4 py-2 rounded-md font-bold hover:bg-[#002244] no-underline"
            >
              Zur Organisationsauswahl
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (a.role !== "admin" && b.role === "admin") return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" aria-hidden="true" />
          <span className="font-bold text-lg">Mitglieder</span>
        </div>
        <Link
          href="/flohmarkt"
          className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 no-underline flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto w-full max-w-[600px] mx-auto flex-grow">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[#003366] m-0 font-bold">{currentTenant.name}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-0">
              {members.length} {members.length === 1 ? "Mitglied" : "Mitglieder"}
            </p>
          </div>

          {members.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Mitglieder werden geladen...
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sortedMembers.map((member) => {
                const displayName = member.display_name || member.email || "Unbekannt";
                const isCurrentUser = member.user_id === user?.id;

                return (
                  <li
                    key={member.user_id}
                    className="px-6 py-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 m-0 truncate">
                        {displayName}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-gray-400">(Du)</span>
                        )}
                      </p>
                      {member.display_name && member.email && (
                        <p className="text-sm text-gray-500 m-0 truncate">{member.email}</p>
                      )}
                    </div>
                    <span
                      className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold ${
                        member.role === "admin"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {member.role === "admin" ? "Admin" : "Mitglied"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
