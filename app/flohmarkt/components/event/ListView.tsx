"use client";

import { useFlohmarkt } from "../../FlohmarktContext";
import { SpotItem } from "../shared/SpotItem";

export function ListView() {
  const { spots, setCurrentTab, setDeletePreFill, highlightedSpotId } = useFlohmarkt();

  const handleDelete = (address: string) => {
    setDeletePreFill(address);
    setCurrentTab("delete");
  };

  const handleSpotClick = () => {
    // Switch to map view - map will center on this spot
    setCurrentTab("map");
  };

  // Sort spots alphabetically by street and house number
  const sortedSpots = [...spots].sort((a, b) => {
    const addressA = a.street && a.house_number
      ? `${a.street} ${a.house_number}`.toLowerCase()
      : (a.address_raw || '').toLowerCase();
    const addressB = b.street && b.house_number
      ? `${b.street} ${b.house_number}`.toLowerCase()
      : (b.address_raw || '').toLowerCase();
    return addressA.localeCompare(addressB);
  });

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-[800px] mx-auto pb-20">
        <h2 className="text-[#003366] mt-0">Alle Spots</h2>

        {sortedSpots.length === 0 ? (
          <p className="text-gray-600">Noch keine Spots eingetragen.</p>
        ) : (
          sortedSpots.map((spot) => (
            <SpotItem
              key={spot.id}
              spot={spot}
              onDelete={handleDelete}
              onClick={handleSpotClick}
              isHighlighted={spot.id === highlightedSpotId}
            />
          ))
        )}
      </div>
    </div>
  );
}
