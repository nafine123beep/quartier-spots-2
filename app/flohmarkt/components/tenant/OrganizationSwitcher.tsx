"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Settings } from "lucide-react";
import { useFlohmarkt } from "../../FlohmarktContext";

export function OrganizationSwitcher() {
  const { currentTenant, tenants, selectTenant, user, setLastSelectedTenantSlug } = useFlohmarkt();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Only show if user has multiple orgs
  if (!currentTenant || tenants.length <= 1) {
    return <h2 className="text-xl font-bold m-0 text-white">{currentTenant?.name}</h2>;
  }

  const handleSwitch = async (tenantSlug: string) => {
    const tenant = tenants.find(t => t.slug === tenantSlug);
    if (!tenant) return;

    selectTenant(tenant);
    setLastSelectedTenantSlug(tenantSlug);
    router.push(`/flohmarkt/organizations/${tenantSlug}`);
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 bg-[#002244] px-4 py-2 rounded hover:bg-[#003366] focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#003366] transition-colors"
      >
        <span className="font-semibold text-lg text-white">{currentTenant.name}</span>
        <ChevronDown className={`h-5 w-5 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 text-xs text-gray-500 font-semibold uppercase">
            Organisation wechseln
          </div>
          {tenants.map(tenant => (
            <button
              key={tenant.id}
              onClick={() => handleSwitch(tenant.slug)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-100 flex items-center gap-3 transition-colors"
            >
              {tenant.id === currentTenant.id && (
                <Check className="h-5 w-5 text-[#003366] flex-shrink-0" />
              )}
              <span className={`flex-grow ${tenant.id === currentTenant.id ? 'font-semibold text-[#003366]' : 'text-gray-700'}`}>
                {tenant.name}
              </span>
            </button>
          ))}

          <div className="border-t border-gray-200 mt-2 pt-2">
            <Link
              href="/flohmarkt/organizations?view=all"
              className="w-full text-left px-4 py-2.5 hover:bg-gray-100 flex items-center gap-3 text-gray-600 hover:text-gray-900 no-underline block"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm">Organisationen verwalten</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
