"use client";

import { useFlohmarkt } from "../../FlohmarktContext";
import { AppHeader } from "./AppHeader";
import { TabNavigation } from "./TabNavigation";
import { ListView } from "./ListView";
import { MapView } from "./MapView";
import { SpotForm } from "./SpotForm";
import { DeleteSpotForm } from "./DeleteSpotForm";

export function AppView() {
  const { currentTab } = useFlohmarkt();

  return (
    <div className="fixed inset-0 flex flex-col z-[3000]">
      <AppHeader />
      <TabNavigation />

      <div className="relative flex-grow overflow-hidden bg-gray-200">
        {currentTab === "list" && <ListView />}
        {currentTab === "map" && <MapView />}
        {currentTab === "form" && <SpotForm />}
        {currentTab === "delete" && <DeleteSpotForm />}
      </div>
    </div>
  );
}
