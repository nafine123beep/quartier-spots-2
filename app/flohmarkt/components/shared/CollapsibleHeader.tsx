"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface CollapsibleHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CollapsibleHeader({ children, className = "" }: CollapsibleHeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;

    const swipeDistance = touchStartY.current - touchEndY.current;
    const threshold = 50; // minimum swipe distance

    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0) {
        // Swiped up - collapse header
        setIsCollapsed(true);
      } else {
        // Swiped down - expand header
        setIsCollapsed(false);
      }
    }
  };

  const toggleCollapse = () => {
    if (isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="relative">
      <div
        ref={headerRef}
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isCollapsed && isMobile ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"}
          ${className}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Mobile-only collapse toggle indicator */}
      {isMobile && (
        <button
          onClick={toggleCollapse}
          className={`
            absolute left-1/2 -translate-x-1/2 z-10
            bg-[#003366] text-white px-4 py-1 rounded-b-lg shadow-lg
            text-xs font-medium transition-all duration-300
            hover:bg-[#002244] active:scale-95
            flex items-center gap-1
            ${isCollapsed ? "top-0" : "-bottom-6"}
          `}
          aria-label={isCollapsed ? "Header einblenden" : "Header ausblenden"}
        >
          <span>{isCollapsed ? "▼" : "▲"}</span>
          <span>{isCollapsed ? "Einblenden" : "Ausblenden"}</span>
        </button>
      )}
    </div>
  );
}
