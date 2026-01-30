"use client";

import { useMemo } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { SpotItem } from "../shared/SpotItem";
import { getSpotTerms } from "../../lib/spotTerms";
import { getHighlightIcon, getHighlightTypeLabel } from "../../lib/highlightConfig";
import { resolveIcon, getIconColorClass } from "../../lib/iconResolver";

export function ListView() {
  const { spots, setCurrentTab, setDeletePreFill, highlightedSpotId, currentTenantEvent, setSelectedSpotId, customHighlightTypes } = useFlohmarkt();
  const terms = getSpotTerms(currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural);

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

  // Separate highlights from regular spots
  const regularSpots = useMemo(() => spots.filter(spot => !spot.is_highlight), [spots]);
  const highlights = useMemo(() => spots.filter(spot => spot.is_highlight), [spots]);

  // Sort spots alphabetically by street and house number
  const sortedSpots = [...regularSpots].sort((a, b) => {
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
        {/* Event Highlights Section */}
        {highlights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[#003366] mt-0 mb-4">Event Highlights</h2>
            <div className="space-y-3">
              {highlights.map((highlight) => {
                const iconValue = getHighlightIcon(highlight.highlight_type || '', customHighlightTypes);
                const label = highlight.title || getHighlightTypeLabel(highlight.highlight_type || '', customHighlightTypes);
                const IconComponent = resolveIcon(iconValue);
                const colorClass = getIconColorClass(iconValue);

                return (
                  <div
                    key={highlight.id}
                    onClick={() => handleSpotClick(highlight)}
                    className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <IconComponent
                          size={32}
                          className={colorClass || 'text-gray-700'}
                          aria-label={label}
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold text-gray-900 m-0">{label}</h4>
                        {highlight.public_note && (
                          <p className="text-sm text-gray-700 mt-1 mb-0">{highlight.public_note}</p>
                        )}
                        {highlight.address_public && highlight.address_raw && (
                          <p className="text-xs text-gray-600 mt-2 mb-0">📍 {highlight.address_raw}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Spots Section */}
        <h2 className="text-[#003366] mt-0">{terms.allSpots}</h2>

        {sortedSpots.length === 0 ? (
          <p className="text-gray-600">{terms.noSpotsYet}</p>
        ) : (
          sortedSpots.map((spot) => (
            <SpotItem
              key={spot.id}
              spot={spot}
              onDelete={handleDelete}
              onClick={() => handleSpotClick(spot)}
              isHighlighted={spot.id === highlightedSpotId}
              deleteButtonTitle={terms.deleteOwnSpot}
            />
          ))
        )}
      </div>
    </div>
  );
}
