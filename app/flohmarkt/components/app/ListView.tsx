"use client";

import { useFlohmarkt } from "../../FlohmarktContext";
import { SpotItem } from "../shared/SpotItem";
import { getSpotTerms } from "../../lib/spotTerms";

export function ListView() {
  const { spots, setCurrentTab, setDeletePreFill, currentTenantEvent } = useFlohmarkt();
  const terms = getSpotTerms(currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural);

  const handleDelete = (address: string) => {
    setDeletePreFill(address);
    setCurrentTab("delete");
  };

  const handleSpotClick = () => {
    // Switch to map view - map will center on this spot
    setCurrentTab("map");
  };

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-[800px] mx-auto pb-20">
        <h2 className="text-[#003366] mt-0">{terms.allSpots}</h2>

        {spots.length === 0 ? (
          <p className="text-gray-600">{terms.noSpotsYet}</p>
        ) : (
          spots.map((spot) => (
            <SpotItem
              key={spot.id}
              spot={spot}
              onDelete={handleDelete}
              onClick={handleSpotClick}
              deleteButtonTitle={terms.deleteOwnSpot}
            />
          ))
        )}
      </div>
    </div>
  );
}
