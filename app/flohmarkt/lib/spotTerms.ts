/**
 * Generates all spot-related UI strings based on custom singular/plural terms.
 * This allows event organizers to customize "Spots" to terms like "Stände", "Teilnehmer", etc.
 */
export function getSpotTerms(singular?: string | null, plural?: string | null) {
  // Use defaults if values are null, undefined, or empty strings
  const singularTerm = singular || 'Spot';
  const pluralTerm = plural || 'Spots';

  return {
    // Base terms
    singular: singularTerm,
    plural: pluralTerm,

    // List/Overview
    allSpots: `Alle ${pluralTerm}`,
    noSpotsYet: `Noch keine ${pluralTerm} eingetragen.`,
    noSpotsRegistered: `Noch keine ${pluralTerm} angemeldet.`,

    // Registration/Creation
    registerSpot: `${singularTerm} anmelden`,
    yourSpot: `Deinen ${singularTerm} eintragen`,
    spotCreated: `${singularTerm} erfolgreich angelegt!`,
    toSpotList: `Zur ${singularTerm}-Liste`,
    spotRegistration: `${singularTerm}-Anmeldung`,
    spotRegistrationRecommended: `${singularTerm}-Anmeldung (Empfohlen)`,
    continueToSpotRegistration: `Weiter zur ${singularTerm}-Anmeldung`,
    enterYourSpot: `Trage deinen ${singularTerm} ein und werde Teil des Flohmarkts!`,

    // Deletion
    deleteSpot: `${singularTerm} löschen`,
    deleteOwnSpot: `Eigenen ${singularTerm} löschen`,
    noSpotFound: `Fehler: Es wurde kein ${singularTerm} mit diesen exakten Daten gefunden.`,
    deleteThisSpotConfirm: `Diesen ${singularTerm} wirklich unwiderruflich löschen?`,
    spotWillBeDeleted: `Der ${singularTerm} wird ENDGÜLTIG gelöscht und kann nicht wiederhergestellt werden.`,

    // Map view
    spotsNearby: `${pluralTerm} in der Nähe`,

    // Admin/Dashboard
    registeredSpots: `Angemeldete ${pluralTerm}`,
    managementRegisteredSpots: `Verwaltung: Angemeldete ${pluralTerm}`,
    contactAllSpots: `Alle ${pluralTerm} kontaktieren`,
    allSpotsDeleted: `Alle ${pluralTerm} werden ebenfalls gelöscht!`,
    addressSlashSpot: `Adresse / ${singularTerm}`,
    spotsAwaitingDeletion: `Folgende ${pluralTerm} haben eine Löschanfrage von Besucher:innen erhalten`,
    spotInformation: `${singularTerm}-Informationen`,
    errorCreatingSpot: `Fehler beim Anlegen des ${pluralTerm}.`,

    // Contact form
    questionAboutSpot: `Frage zu meinem ${singularTerm}`,
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
