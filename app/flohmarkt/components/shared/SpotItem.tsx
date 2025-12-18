"use client";

import { Spot } from "../../types";

interface SpotItemProps {
  spot: Spot;
  isCompact?: boolean;
  showDeleteButton?: boolean;
  isHighlighted?: boolean;
  onDelete?: (address: string) => void;
  onClick?: () => void;
}

export function SpotItem({
  spot,
  isCompact = false,
  showDeleteButton = true,
  isHighlighted = false,
  onDelete,
  onClick,
}: SpotItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(spot.address);
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-white rounded-lg shadow-sm cursor-pointer
        transition-transform active:scale-[0.99]
        border-l-4 border-l-[#003366]
        ${isCompact ? "p-2.5 text-sm" : "p-5 mb-4"}
        ${isHighlighted ? "animate-pulse border-2 border-[#FFCC00]" : ""}
      `}
    >
      {showDeleteButton && !isCompact && onDelete && (
        <button
          onClick={handleDelete}
          title="Eigenen Spot löschen"
          className="
            absolute top-4 right-4 w-8 h-8
            bg-red-50 border border-red-200 text-red-500
            rounded-full flex items-center justify-center
            hover:bg-red-500 hover:text-white
            transition-colors z-10
          "
        >
          🗑️
        </button>
      )}

      <h3 className="m-0 mb-1 text-[#003366] text-lg font-semibold pr-10">
        {spot.address}
      </h3>
      <p className="m-0 text-gray-600">{spot.description}</p>
    </div>
  );
}
