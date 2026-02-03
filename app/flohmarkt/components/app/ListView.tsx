"use client";

import { useRef, useEffect } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { SpotItem } from "../shared/SpotItem";
import { getSpotTerms } from "../../lib/spotTerms";

export function ListView() {
  const { spots, setCurrentTab, setDeletePreFill, currentTenantEvent, setSelectedSpotId, highlightedSpotId } = useFlohmarkt();
  const terms = getSpotTerms(currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural);

  // Ref for auto-scrolling to highlighted spot
  const highlightedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to highlighted spot when it changes
  useEffect(() => {
    if (highlightedSpotId && highlightedRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [highlightedSpotId]);

  const handleDelete = (address: string) => {
    setDeletePreFill(address);
    setCurrentTab("delete");
  };

  const handleSpotClick = (spot: any) => {
    // Set the selected spot ID so MapView can navigate to it
    setSelectedSpotId(spot.id);
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
            <div
              key={spot.id}
              ref={spot.id === highlightedSpotId ? highlightedRef : null}
            >
              <SpotItem
                spot={spot}
                onDelete={handleDelete}
                onClick={() => handleSpotClick(spot)}
                isHighlighted={spot.id === highlightedSpotId}
                deleteButtonTitle={terms.deleteOwnSpot}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
