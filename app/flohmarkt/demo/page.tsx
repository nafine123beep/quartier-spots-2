"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFlohmarkt } from "../FlohmarktContext";
import { AppView } from "../components/app/AppView";
import { AppTabType } from "../types";

export default function DemoPage() {
  const searchParams = useSearchParams();
  const { setCurrentTab } = useFlohmarkt();

  // Set initial tab from query param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["list", "map", "form", "delete"].includes(tab)) {
      setCurrentTab(tab as AppTabType);
    }
  }, [searchParams, setCurrentTab]);

  return <AppView />;
}
