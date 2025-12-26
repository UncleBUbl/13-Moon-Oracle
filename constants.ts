
export const MOON_NAMES = [
  "Magnetic",
  "Lunar",
  "Electric",
  "Self-Existing",
  "Overtone",
  "Rhythmic",
  "Resonant",
  "Galactic",
  "Solar",
  "Planetary",
  "Spectral",
  "Crystal",
  "Cosmic"
];

export const MOON_TOTEMS = [
  "Bat", "Scorpion", "Deer", "Owl", "Peacock", 
  "Lizard", "Monkey", "Hawk", "Jaguar", "Dog", 
  "Serpent", "Rabbit", "Turtle"
];

export const DAY_NAMES = [
  "Dali", "Seli", "Gamma", "Kali", "Alpha", "Limi", "Silio"
];

export const PLASMA_COLORS = [
  "bg-yellow-400 shadow-yellow-400/50", // Dali
  "bg-red-500 shadow-red-500/50",       // Seli
  "bg-white shadow-white/50",           // Gamma
  "bg-blue-500 shadow-blue-500/50",     // Kali
  "bg-green-500 shadow-green-500/50",   // Alpha
  "bg-black border border-white shadow-gray-500/50", // Limi (often Black/Jade)
  "bg-purple-500 shadow-purple-500/50"  // Silio
];

// Mapping for atmospheric background: Dali=Red, Seli=Orange, Gamma=Yellow, Kali=Blue, Alpha=Green, Limi=Violet, Silio=White
export const PLASMA_BG_GRADIENTS = [
  "from-red-900/40 via-slate-950 to-black",       // Dali (Deep Red)
  "from-orange-900/40 via-slate-950 to-black",    // Seli (Orange)
  "from-yellow-900/30 via-slate-950 to-black",    // Gamma (Yellow)
  "from-blue-900/40 via-slate-950 to-black",      // Kali (Blue)
  "from-emerald-900/40 via-slate-950 to-black",   // Alpha (Green)
  "from-violet-900/40 via-slate-950 to-black",    // Limi (Violet)
  "from-slate-100/20 via-slate-950 to-black"      // Silio (White/Crystal)
];

export const DAY_QUALITIES = [
  "Target", "Flow", "Pacify", "Establish", "Release", "Purify", "Discharge"
];

export const DAY_AFFIRMATIONS_SUFFIX = [
  "target my highest purpose",
  "flow with the universal rhythm",
  "pacify the mind and spirit",
  "establish clarity and power",
  "release what no longer serves",
  "purify my actions and intent",
  "discharge energy into the cosmos"
];

export const SOLAR_SEALS = [
  "Dragon", "Wind", "Night", "Seed", "Serpent", 
  "Worldbridger", "Hand", "Star", "Moon", "Dog", 
  "Monkey", "Human", "Skywalker", "Wizard", "Eagle", 
  "Warrior", "Earth", "Mirror", "Storm", "Sun"
];

export const GALACTIC_TONES = [
  "Magnetic", "Lunar", "Electric", "Self-Existing", "Overtone", 
  "Rhythmic", "Resonant", "Galactic", "Solar", "Planetary", 
  "Spectral", "Crystal", "Cosmic"
];

// 0=Dragon(Red), 1=Wind(White), 2=Night(Blue), 3=Seed(Yellow) ... repeating pattern
export const SEAL_COLORS = [
  "text-red-500",    // Dragon
  "text-white",      // Wind
  "text-blue-400",   // Night
  "text-yellow-400", // Seed
  "text-red-500",    // Serpent
  "text-white",      // Worldbridger
  "text-blue-400",   // Hand
  "text-yellow-400", // Star
  "text-red-500",    // Moon
  "text-white",      // Dog
  "text-blue-400",   // Monkey
  "text-yellow-400", // Human
  "text-red-500",    // Skywalker
  "text-white",      // Wizard
  "text-blue-400",   // Eagle
  "text-yellow-400", // Warrior
  "text-red-500",    // Earth
  "text-white",      // Mirror
  "text-blue-400",   // Storm
  "text-yellow-400"  // Sun
];

// 52 Galactic Activation Portals (GAP Days)
export const GAP_KIN_NUMBERS = [
  1, 20, 22, 39, 43, 50, 51, 58, 64, 69, 72, 77, 79, 85, 88, 93, 96, 
  106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 
  146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 
  165, 168, 173, 176, 182, 184, 189, 192, 197, 203, 210, 211, 218, 
  239, 241, 260
];

// Frequency Settings for the 7 Radial Plasmas
// Base frequencies chosen for chakra/elemental alignment
export const PLASMA_FREQUENCIES = [
  { base: 144, type: 'sine', detune: 2, label: "Target (Grounding)" },    // Dali
  { base: 174, type: 'sine', detune: 3, label: "Flow (Fluidity)" },       // Seli
  { base: 528, type: 'sine', detune: 4, label: "Pacify (Healing)" },      // Gamma
  { base: 256, type: 'triangle', detune: 2, label: "Establish (Foundation)" }, // Kali
  { base: 432, type: 'sine', detune: 3, label: "Release (Universal)" },   // Alpha
  { base: 639, type: 'sine', detune: 5, label: "Purify (Connection)" },   // Limi
  { base: 396, type: 'sawtooth', detune: 2, label: "Discharge (Liberation)" }  // Silio (Actually handled as chord in engine)
];
