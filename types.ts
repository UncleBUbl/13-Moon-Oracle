
export interface MoonDate {
  gregorianDate: Date;
  moonIndex: number; // 0-12 (0 = Magnetic)
  moonName: string;
  dayOfMonth: number; // 1-28
  dayOfWeekIndex: number; // 0-6 (0 = Dali)
  dayName: string;
  dayColor: string; // For the chakra/week day
  plasmaBackground: string; // Dynamic background gradient
  yearStart: number; // The Gregorian year the cycle started (July 26 of X)
  isDayOutOfTime: boolean;
  isLeapDay: boolean; // Feb 29
  affirmation: string; // Daily mystical affirmation
}

export interface OracleReading {
  biomass: string;       // Formerly Physical (Body/Earth)
  noosphere: string;     // Formerly Energetic (Mind/Spirit)
  telepathicIndex: string; // Formerly Archetype
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
}

export interface GalacticSignature {
  kinNumber: number;
  solarSeal: string;
  galacticTone: string;
  fullTitle: string;
  colorClass: string;
  isLeapDay: boolean;
}
