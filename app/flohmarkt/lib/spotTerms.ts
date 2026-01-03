/**
 * Generates all spot-related UI strings based on custom singular/plural terms.
 * This allows event organizers to customize "Spots" to terms like "Stände", "Teilnehmer", etc.
 */
export function getSpotTerms(singular = 'Spot', plural = 'Spots') {
  return {
    // Base terms
    singular,
    plural,

    // List/Overview
    allSpots: `Alle ${plural}`,
    noSpotsYet: `Noch keine ${plural} eingetragen.`,
    noSpotsRegistered: `Noch keine ${plural} angemeldet.`,

    // Registration/Creation
    registerSpot: `${singular} anmelden`,
    yourSpot: `Deinen ${singular} eintragen`,
    spotCreated: `${singular} erfolgreich angelegt!`,
    toSpotList: `Zur ${singular}-Liste`,
    spotRegistration: `${singular}-Anmeldung`,
    spotRegistrationRecommended: `${singular}-Anmeldung (Empfohlen)`,

    // Deletion
    deleteSpot: `${singular} löschen`,
    deleteOwnSpot: `Eigenen ${singular} löschen`,
    noSpotFound: `Fehler: Es wurde kein ${singular} mit diesen exakten Daten gefunden.`,

    // Map view
    spotsNearby: `${plural} in der Nähe`,

    // Admin/Dashboard
    registeredSpots: `Angemeldete ${plural}`,
    managementRegisteredSpots: `Verwaltung: Angemeldete ${plural}`,
    contactAllSpots: `Alle ${plural} kontaktieren`,
    allSpotsDeleted: `Alle ${plural} werden ebenfalls gelöscht!`,
    addressSlashSpot: `Adresse / ${singular}`,

    // Contact form
    questionAboutSpot: `Frage zu meinem ${singular}`,
  };
}

/**
 * Type for the spot terms object returned by getSpotTerms
 */
export type SpotTerms = ReturnType<typeof getSpotTerms>;

/**
 * Default spot terms using "Spot" / "Spots"
 */
export const DEFAULT_SPOT_TERMS = getSpotTerms();

/**
 * Preset options for spot terminology dropdown
 */
export const SPOT_TERM_PRESETS = [
  { singular: "Spot", plural: "Spots" },
  { singular: "Stand", plural: "Stände" },
  { singular: "Station", plural: "Stationen" },
  { singular: "Checkpoint", plural: "Checkpoints" },
  { singular: "Treffpunkt", plural: "Treffpunkte" },
  { singular: "Spielort", plural: "Spielorte" },
  { singular: "Bühne", plural: "Bühnen" },
] as const;

/**
 * Type for a single preset option
 */
export type SpotTermPreset = typeof SPOT_TERM_PRESETS[number];
