"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Spot, FlohmarktEvent, ViewType, AppTabType } from "./types";

// Initial demo data
const INITIAL_SPOTS: Spot[] = [
  {
    id: "1",
    description: "Spielzeug & Bücher",
    address: "Rüsternweg 50, Nürnberg",
    lat: 49.417652,
    lng: 11.055152,
    name: "Max Mustermann",
    contact: "max@test.de",
    consent: true,
  },
  {
    id: "2",
    description: "Vintage Kleidung",
    address: "Heisterstraße 60, Nürnberg",
    lat: 49.423576,
    lng: 11.062553,
    name: "Anna Schmidt",
    contact: "0170-1234567",
    consent: true,
  },
  {
    id: "3",
    description: "Omas Geschirr",
    address: "Mustergasse 12, Nürnberg",
    lat: 49.42,
    lng: 11.06,
    name: "",
    contact: "",
    consent: true,
  },
];

interface FlohmarktContextType {
  // State
  spots: Spot[];
  currentEvent: FlohmarktEvent | null;
  currentView: ViewType;
  currentTab: AppTabType;
  isAuthenticated: boolean;
  deletePreFill: string;

  // Actions
  setCurrentView: (view: ViewType) => void;
  setCurrentTab: (tab: AppTabType) => void;
  addSpot: (spot: Omit<Spot, "id">) => void;
  deleteSpot: (id: string) => void;
  deleteSpotByVerification: (address: string, name: string, contact: string) => boolean;
  createEvent: (title: string, date: string, startTime: string, endTime: string) => void;
  login: () => void;
  logout: () => void;
  setDeletePreFill: (address: string) => void;
  getAllEmails: () => string[];
}

const FlohmarktContext = createContext<FlohmarktContextType | null>(null);

export function FlohmarktProvider({ children }: { children: ReactNode }) {
  const [spots, setSpots] = useState<Spot[]>(INITIAL_SPOTS);
  const [currentEvent, setCurrentEvent] = useState<FlohmarktEvent | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("frontpage");
  const [currentTab, setCurrentTab] = useState<AppTabType>("list");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deletePreFill, setDeletePreFill] = useState("");

  const addSpot = useCallback((spotData: Omit<Spot, "id">) => {
    const newSpot: Spot = {
      ...spotData,
      id: Date.now().toString(),
    };
    setSpots((prev) => [...prev, newSpot]);
  }, []);

  const deleteSpot = useCallback((id: string) => {
    setSpots((prev) => prev.filter((spot) => spot.id !== id));
  }, []);

  const deleteSpotByVerification = useCallback(
    (address: string, name: string, contact: string): boolean => {
      const index = spots.findIndex(
        (s) =>
          s.address.trim() === address.trim() &&
          s.name.trim() === name.trim() &&
          s.contact.trim() === contact.trim()
      );
      if (index > -1) {
        setSpots((prev) => prev.filter((_, i) => i !== index));
        return true;
      }
      return false;
    },
    [spots]
  );

  const createEvent = useCallback(
    (title: string, date: string, startTime: string, endTime: string) => {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      const publicLink = `${window.location.origin}${window.location.pathname}#event/${slug}`;

      setCurrentEvent({
        id: Date.now().toString(),
        title,
        date,
        startTime,
        endTime,
        link: publicLink,
      });
    },
    []
  );

  const login = useCallback(() => {
    setIsAuthenticated(true);
    setCurrentView("dashboard");
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentView("frontpage");
  }, []);

  const getAllEmails = useCallback(() => {
    return [...new Set(spots.map((s) => s.contact).filter((c) => c && c.includes("@")))];
  }, [spots]);

  return (
    <FlohmarktContext.Provider
      value={{
        spots,
        currentEvent,
        currentView,
        currentTab,
        isAuthenticated,
        deletePreFill,
        setCurrentView,
        setCurrentTab,
        addSpot,
        deleteSpot,
        deleteSpotByVerification,
        createEvent,
        login,
        logout,
        setDeletePreFill,
        getAllEmails,
      }}
    >
      {children}
    </FlohmarktContext.Provider>
  );
}

export function useFlohmarkt() {
  const context = useContext(FlohmarktContext);
  if (!context) {
    throw new Error("useFlohmarkt must be used within a FlohmarktProvider");
  }
  return context;
}
