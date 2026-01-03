"use client";

import { Spot } from "../../types";

interface SpotItemProps {
  spot: Spot;
  isCompact?: boolean;
  showDeleteButton?: boolean;
  isHighlighted?: boolean;
  deleteButtonTitle?: string;
  onDelete?: (addressRaw: string) => void;
  onClick?: () => void;
}

export function SpotItem({
  spot,
  isCompact = false,
  showDeleteButton = true,
  isHighlighted = false,
  deleteButtonTitle = "Eigenen Spot löschen",
  onDelete,
  onClick,
}: SpotItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(spot.address_raw || "");
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-lg shadow-sm cursor-pointer
        transition-all active:scale-[0.99]
        border-l-4
        ${isCompact ? "p-2.5 text-sm" : "p-5 mb-4"}
        ${
          isHighlighted
            ? "bg-yellow-50 border-l-[#FFCC00] shadow-lg ring-2 ring-[#FFCC00] ring-opacity-50"
            : "bg-white border-l-[#003366]"
        }
      `}
    >
      {showDeleteButton && !isCompact && onDelete && (
        <button
          onClick={handleDelete}
          title={deleteButtonTitle}
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
        {spot.street && spot.house_number
          ? `${spot.street} ${spot.house_number}`
          : spot.address_raw || "-"}
      </h3>
      <p className="m-0 text-gray-600">{spot.public_note || "-"}</p>
    </div>
  );
}
