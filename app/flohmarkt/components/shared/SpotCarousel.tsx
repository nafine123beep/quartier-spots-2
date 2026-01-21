"use client";

import { useRef, useState, useEffect } from "react";
import { Spot } from "../../types";

interface SpotCarouselProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  spotTermSingular?: string;
}

export function SpotCarousel({ spots, onSpotClick, spotTermSingular }: SpotCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle scroll to update current index
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth * 0.85; // 85% of container width
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  if (spots.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] pb-4">
      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {spots.map((spot) => {
          const address = spot.street && spot.house_number
            ? `${spot.street} ${spot.house_number}`
            : spot.address_raw || "-";

          return (
            <div
              key={spot.id}
              className="flex-shrink-0 snap-start w-[85vw] bg-white rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => onSpotClick(spot)}
            >
              <div className="flex flex-col">
                <div className="font-bold text-[#003366] text-base mb-1">
                  {address}
                </div>
                {spot.public_note && (
                  <div className="text-gray-600 text-sm line-clamp-2">
                    {spot.public_note}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots Indicator */}
      {spots.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {spots.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-[#003366]"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* Hide scrollbar with CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
