"use client";

import { ReactNode } from "react";

interface MapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function MapDrawer({ isOpen, onClose, title, children }: MapDrawerProps) {
  return (
    <div
      className={`
        absolute top-0 left-0 h-full w-[300px] max-w-[85%]
        bg-white z-[1001] flex flex-col
        shadow-[4px_0_15px_rgba(0,0,0,0.2)]
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="p-4 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
        <strong className="text-[#003366] font-bold">{title}</strong>
        <button
          onClick={onClose}
          className="bg-transparent border-none text-2xl cursor-pointer text-[#003366] hover:text-[#002244]"
        >
          ×
        </button>
      </div>
      <div className="overflow-y-auto p-2.5 flex-grow flex flex-col gap-3">{children}</div>
    </div>
  );
}
