"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";

export function MemberManagement() {
  const { members, isAdmin, user, removeMember, updateMemberRole, currentTenant } = useFlohmarkt();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRemove = async (userId: string) => {
    if (!confirm("Mitglied wirklich entfernen?")) return;

    setLoading(userId);
    await removeMember(userId);
    setLoading(null);
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'member') => {
    setLoading(userId);
    await updateMemberRole(userId, newRole);
    setLoading(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-5">
        <h3 className="m-0 text-[#003366]">Mitglieder ({members.length})</h3>
      </div>

      {isAdmin && currentTenant?.join_password && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-5">
          <p className="text-sm text-blue-800 m-0">
            <strong>Beitritts-Passwort:</strong> {currentTenant.join_password}
          </p>
          <p className="text-xs text-blue-600 m-0 mt-1">
            Teile dieses Passwort mit Personen, die deiner Organisation beitreten sollen.
          </p>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {members.map((member) => {
          const isCurrentUser = member.user_id === user?.id;
          const displayName = member.display_name || member.email || "Unbekannt";

          return (
            <div key={member.user_id} className="py-4 flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">
                  {displayName}
                  {isCurrentUser && <span className="text-gray-500 ml-2">(Du)</span>}
                </div>
                {member.email && member.email !== displayName && (
                  <div className="text-sm text-gray-500">{member.email}</div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isAdmin && !isCurrentUser ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.user_id, e.target.value as 'admin' | 'member')}
                    disabled={loading === member.user_id}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="member">Mitglied</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    member.role === 'admin'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {member.role === 'admin' ? 'Admin' : 'Mitglied'}
                  </span>
                )}

                {isAdmin && !isCurrentUser && (
                  <button
                    onClick={() => handleRemove(member.user_id)}
                    disabled={loading === member.user_id}
                    className="text-red-600 hover:text-red-800 bg-transparent border-none cursor-pointer disabled:opacity-50"
                    title="Entfernen"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <p className="text-gray-500 text-center py-4">Keine Mitglieder gefunden.</p>
      )}
    </div>
  );
}
