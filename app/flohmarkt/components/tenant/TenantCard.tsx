"use client";

import Link from "next/link";
import { Tenant } from "../../types";

interface TenantCardProps {
  tenant: Tenant;
}

export function TenantCard({ tenant }: TenantCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md flex justify-between items-center hover:shadow-lg transition-shadow">
      <div>
        <h3 className="m-0 text-[#003366] text-lg">{tenant.name}</h3>
        <p className="text-gray-600 text-sm m-0 mt-1">/{tenant.slug}</p>
      </div>
      <Link
        href={`/flohmarkt/organizations/${tenant.id}`}
        className="bg-[#003366] text-white px-5 py-2 rounded-md font-bold cursor-pointer hover:bg-[#002244] no-underline"
      >
        Auswählen
      </Link>
    </div>
  );
}
