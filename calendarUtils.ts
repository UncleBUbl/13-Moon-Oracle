
import { MoonDate, GalacticSignature } from './types';
import { MOON_NAMES, DAY_NAMES, PLASMA_COLORS, PLASMA_BG_GRADIENTS, DAY_AFFIRMATIONS_SUFFIX, SOLAR_SEALS, GALACTIC_TONES, SEAL_COLORS } from './constants';

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Dreamspell Anchor: July 26, 1987 was Kin 34 (White Galactic Wizard).
// This is the "Ground Zero" for the 13-Moon Dreamspell count.
const ANCHOR_YEAR = 1987;
const ANCHOR_MONTH = 6; // July (0-indexed)
const ANCHOR_DAY = 26;
const ANCHOR_KIN = 34; 

export function calculateKin(birthDate: Date): GalacticSignature {
  // Use UTC components to strictly avoid timezone/DST drift
  const bYear = birthDate.getFullYear();
  const bMonth = birthDate.getMonth();
  const bDay = birthDate.getDate();

  // Handle Leap Day Birthdays (Feb 29) - They have no Kin in Dreamspell (0.0 Hunab Ku)
  if (bMonth === 1 && bDay === 29) {
    return {
      kinNumber: 0,
      solarSeal: "Hunab Ku",
      galacticTone: "0.0",
      fullTitle: "Galactic Pure Potential",
      colorClass: "text-emerald-400",
      isLeapDay: true
    };
  }

  // Create UTC dates for calculation (Midnight UTC)
  const d1 = Date.UTC(bYear, bMonth, bDay);
  const d2 = Date.UTC(ANCHOR_YEAR, ANCHOR_MONTH, ANCHOR_DAY);
  
  // Raw difference in milliseconds
  const diffTime = d1 - d2;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  let leapDaysFound = 0;

  // Determine range direction
  const startYear = Math.min(bYear, ANCHOR_YEAR);
  const endYear = Math.max(bYear, ANCHOR_YEAR);

  for (let y = startYear; y <= endYear; y++) {
    if (isLeapYear(y)) {
      const leapDay = Date.UTC(y, 1, 29); // Feb 29 UTC
      
      // Check if Feb 29 is strictly BETWEEN the two dates
      const minDate = Math.min(d1, d2);
      const maxDate = Math.max(d1, d2);
      
      if (leapDay > minDate && leapDay < maxDate) {
        leapDaysFound++;
      }
    }
  }

  // Adjust difference
  // Dreamspell Count pauses on Feb 29. 
  // If moving forward (diffDays > 0), we passed leap days that shouldn't count towards Kin. Subtract them.
  // If moving backward (diffDays < 0), we passed leap days backwards. Add them to reduce the magnitude of the negative shift.
  
  let kinDiff = 0;
  if (diffDays > 0) {
    kinDiff = diffDays - leapDaysFound;
  } else {
    kinDiff = diffDays + leapDaysFound;
  }

  // Calculate final Kin
  // javascript % operator can return negative.
  let rawKin = (ANCHOR_KIN + kinDiff) % 260;
  
  // Normalize negative modulo result
  if (rawKin <= 0) {
    rawKin += 260;
  }

  const kinNumber = rawKin;
  
  // Solar Seal: (Kin - 1) % 20. Index 0-19.
  const sealIndex = (kinNumber - 1) % 20;
  const solarSeal = SOLAR_SEALS[sealIndex];
  
  // Galactic Tone: (Kin - 1) % 13. Index 0-12 maps to 1-13.
  const toneIndex = (kinNumber - 1) % 13;
  const galacticTone = GALACTIC_TONES[toneIndex];
  
  const colorClass = SEAL_COLORS[sealIndex];

  return {
    kinNumber,
    solarSeal,
    galacticTone,
    fullTitle: `${colorClass.replace('text-', '').split('-')[0].charAt(0).toUpperCase() + colorClass.replace('text-', '').split('-')[0].slice(1)} ${galacticTone} ${solarSeal}`,
    colorClass,
    isLeapDay: false
  };
}

export function getMoonDate(date: Date): MoonDate {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth(); // 0-11
  const currentDay = date.getDate(); // 1-31

  // Handle Leap Day Exception (Feb 29)
  if (currentMonth === 1 && currentDay === 29) {
    return {
      gregorianDate: date,
      moonIndex: -1,
      moonName: "Hunab Ku",
      dayOfMonth: 0,
      dayOfWeekIndex: -1,
      dayName: "Hunab Ku",
      dayColor: "bg-emerald-500 animate-pulse",
      plasmaBackground: "from-emerald-900/50 via-black to-emerald-950",
      yearStart: currentYear, // Techincally belongs to previous July 26 cycle
      isDayOutOfTime: false,
      isLeapDay: true,
      affirmation: "I exist in the pause between breaths."
    };
  }

  // Determine the start of the 13-Moon Year
  // If we are before July 26, the year started the previous calendar year.
  let startYear = currentYear;
  if (currentMonth < 6 || (currentMonth === 6 && currentDay < 26)) {
    startYear = currentYear - 1;
  }

  const cycleStartDate = new Date(startYear, 6, 26); // July 26th
  
  // Calculate difference in time using UTC to stay robust
  const nowUTC = Date.UTC(currentYear, currentMonth, currentDay);
  const startUTC = Date.UTC(startYear, 6, 26);
  
  const diffTime = nowUTC - startUTC;
  let dayDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // LEAP YEAR CORRECTION:
  // If the current cycle (started July 26) passes through a Feb 29, 
  // we must subtract 1 day from the count because Feb 29 is "0.0" and doesn't advance the moon count.
  const nextYear = startYear + 1;
  if (isLeapYear(nextYear)) {
    const leapDay = Date.UTC(nextYear, 1, 29);
    if (nowUTC > leapDay) {
      dayDiff -= 1;
    }
  }

  // Day Out of Time Check (July 25)
  // In a standard year, July 25 is day 364 (0-indexed). 13*28 = 364.
  if (dayDiff === 364) {
    return {
      gregorianDate: date,
      moonIndex: -1,
      moonName: "Day Out of Time",
      dayOfMonth: 0,
      dayOfWeekIndex: -1,
      dayName: "Green Day",
      dayColor: "bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-pulse",
      plasmaBackground: "from-fuchsia-900/50 via-black to-indigo-950",
      yearStart: startYear,
      isDayOutOfTime: true,
      isLeapDay: false,
      affirmation: "I am one with the eternal now. Time is Art."
    };
  }

  // Calculate Moon and Day
  // dayDiff is 0-indexed count of days into the year.
  // 0 = Moon 1, Day 1
  const moonIndex = Math.floor(dayDiff / 28);
  const dayOfMonth = (dayDiff % 28) + 1; // 1-28
  const dayOfWeekIndex = (dayOfMonth - 1) % 7; // 0-6

  const moonName = MOON_NAMES[moonIndex] || "Unknown";
  const suffix = DAY_AFFIRMATIONS_SUFFIX[dayOfWeekIndex] || "align with the cosmos";
  const affirmation = `I align with the ${moonName} Moon to ${suffix}.`;

  return {
    gregorianDate: date,
    moonIndex,
    moonName,
    dayOfMonth,
    dayOfWeekIndex,
    dayName: DAY_NAMES[dayOfWeekIndex],
    dayColor: PLASMA_COLORS[dayOfWeekIndex],
    plasmaBackground: PLASMA_BG_GRADIENTS[dayOfWeekIndex],
    yearStart: startYear,
    isDayOutOfTime: false,
    isLeapDay: false,
    affirmation
  };
}
