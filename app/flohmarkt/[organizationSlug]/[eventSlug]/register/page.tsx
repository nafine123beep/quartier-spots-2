"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const organizationSlug = params.organizationSlug as string;
  const eventSlug = params.eventSlug as string;

  // Redirect to main event page with form tab
  useEffect(() => {
    if (!organizationSlug || !eventSlug) return;

    // Redirect to event page with form tab
    const redirectUrl = `/flohmarkt/${organizationSlug}/${eventSlug}?tab=form`;
    router.replace(redirectUrl);
  }, [organizationSlug, eventSlug, router]);

  // Show loading state while redirecting
  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
        <p className="text-[#003366] font-medium">Weiterleitung...</p>
      </div>
    </div>
  );
}
