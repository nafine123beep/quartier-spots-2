"use client";

import { useFlohmarkt } from "../../FlohmarktContext";
import { SpotItem } from "../shared/SpotItem";

export function ListView() {
  const { spots, setCurrentTab, setDeletePreFill } = useFlohmarkt();

  const handleDelete = (address: string) => {
    setDeletePreFill(address);
    setCurrentTab("delete");
  };

  const handleSpotClick = (lat: number, lng: number) => {
    // Switch to map view - map will center on this spot
    setCurrentTab("map");
  };

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-[800px] mx-auto pb-20">
        <h2 className="text-[#003366] mt-0">Alle Spots</h2>

        {spots.length === 0 ? (
          <p className="text-gray-600">Noch keine Spots eingetragen.</p>
        ) : (
          spots.map((spot) => (
            <SpotItem
              key={spot.id}
              spot={spot}
              onDelete={handleDelete}
              onClick={() => handleSpotClick(spot.lat, spot.lng)}
            />
          ))
        )}
      </div>
    </div>
  );
}
