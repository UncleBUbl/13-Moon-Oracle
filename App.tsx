
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Moon, Sparkles, MapPin, Loader2, Info, Zap, X, Send, Settings, User, Copy, Check, Volume2, VolumeX, Aperture, Calendar } from 'lucide-react';
import { getMoonDate, calculateKin } from './calendarUtils';
import { MOON_TOTEMS, DAY_QUALITIES, PLASMA_COLORS, DAY_NAMES, MOON_NAMES, GAP_KIN_NUMBERS, PLASMA_FREQUENCIES } from './constants';
import { MoonDate, OracleReading, GalacticSignature } from './types';

export default function App() {
  const [date, setDate] = useState<Date>(new Date());
  const [moonDate, setMoonDate] = useState<MoonDate | null>(null);
  const [reading, setReading] = useState<OracleReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Replaces locationName with userLocation to be editable and persistable
  const [userLocation, setUserLocation] = useState<string>("");

  // Telepathic Sync State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [intention, setIntention] = useState("");
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  // Galactic Identity State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userBirthday, setUserBirthday] = useState<string>("");
  const [galacticSignature, setGalacticSignature] = useState<GalacticSignature | null>(null);

  // Manifesto & Share State
  const [showManifestoModal, setShowManifestoModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Anti-Clock / Kin Integration State
  const [dayProgress, setDayProgress] = useState(0);

  // Audio / Tzolkin Portal State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<any[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Today's Kin Info
  const [todayKin, setTodayKin] = useState<GalacticSignature | null>(null);
  const [isGapDay, setIsGapDay] = useState(false);

  useEffect(() => {
    const md = getMoonDate(date);
    setMoonDate(md);
    
    // Calculate Today's Kin for GAP detection
    const tk = calculateKin(date);
    setTodayKin(tk);
    setIsGapDay(GAP_KIN_NUMBERS.includes(tk.kinNumber));

    // Load Settings: Birthday
    const storedBirthday = localStorage.getItem('galacticBirthday');
    if (storedBirthday) {
      setUserBirthday(storedBirthday);
      const birthDate = new Date(storedBirthday + 'T12:00:00'); // Add time to avoid timezone shifts
      if (!isNaN(birthDate.getTime())) {
        const kin = calculateKin(birthDate);
        setGalacticSignature(kin);
      }
    }

    // Load Settings: Location
    const storedLocation = localStorage.getItem('galacticLocation');
    if (storedLocation) {
      setUserLocation(storedLocation);
    } else {
      // Default fallback: Guess from Timezone
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const defaultLoc = tz.split('/')[1]?.replace('_', ' ') || tz;
        setUserLocation(defaultLoc);
      } catch (e) {
        setUserLocation("Unknown Location");
      }
    }

    // Kin Integration (Day Progress)
    const updateDayProgress = () => {
      const now = new Date();
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const passed = now.getTime() - start.getTime();
      const total = 24 * 60 * 60 * 1000;
      setDayProgress((passed / total) * 100);
    };
    
    updateDayProgress();
    const interval = setInterval(updateDayProgress, 60000); // Update every minute
    return () => clearInterval(interval);

  }, [date]);

  // Sound Engine
  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const startAudio = () => {
    if (!moonDate) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.15; // Keep it subtle background drone
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    const dayIndex = moonDate.dayOfWeekIndex; // 0-6
    // Default to Silio/Index 6 if undefined or -1 (DOOT)
    const safeIndex = (dayIndex >= 0 && dayIndex < 7) ? dayIndex : 6; 
    const config = PLASMA_FREQUENCIES[safeIndex];

    const oscs = [];

    // Create Binaural Beat / Drone
    // Oscillator 1: Base
    const osc1 = ctx.createOscillator();
    osc1.type = config.type as OscillatorType || 'sine';
    osc1.frequency.setValueAtTime(config.base, ctx.currentTime);
    osc1.connect(masterGain);
    osc1.start();
    oscs.push(osc1);

    // Oscillator 2: Detuned (Creates the beat/shimmer)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine'; // Always sine for the undertone
    osc2.frequency.setValueAtTime(config.base + (config.detune || 2), ctx.currentTime);
    osc2.connect(masterGain);
    osc2.start();
    oscs.push(osc2);

    // If Silio (Day 7/Index 6), add a harmonic chord for "Discharge"
    if (safeIndex === 6) {
      const osc3 = ctx.createOscillator();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(config.base * 1.5, ctx.currentTime); // Perfect Fifth
      const lowGain = ctx.createGain();
      lowGain.gain.value = 0.5;
      osc3.connect(lowGain).connect(masterGain);
      osc3.start();
      oscs.push(osc3);
    }

    oscillatorsRef.current = oscs;
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (gainNodeRef.current && audioContextRef.current) {
      // Smooth fade out
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.5);
      
      setTimeout(() => {
        oscillatorsRef.current.forEach(osc => osc.stop());
        oscillatorsRef.current = [];
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        setIsPlaying(false);
      }, 500);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (isPlaying) stopAudio();
    };
  }, []);

  const saveSettings = () => {
    // Save Birthday
    if (userBirthday) {
      localStorage.setItem('galacticBirthday', userBirthday);
      
      const birthDate = new Date(userBirthday + 'T12:00:00');
      if (!isNaN(birthDate.getTime())) {
        const kin = calculateKin(birthDate);
        setGalacticSignature(kin);
      }
    }

    // Save Location
    if (userLocation) {
      localStorage.setItem('galacticLocation', userLocation);
    }
    
    setShowSettingsModal(false);
  };

  const handleShare = async () => {
    if (!reading || !moonDate) return;

    const kinText = galacticSignature ? `${galacticSignature.fullTitle} (Kin ${galacticSignature.kinNumber})` : "Uninitiated Traveler";
    const dateText = `${moonDate.moonName} Moon, ${moonDate.dayName} ${moonDate.dayOfMonth}`;
    
    const shareText = `🌙 13-Moon Oracle Transmission
👤 Kin: ${kinText}
📅 Date: ${dateText}
📍 Location: ${userLocation}
🔮 Telepathic Index: ${reading.telepathicIndex}
${isGapDay ? "⚡ GAP DAY (Portal Open)" : ""}

Discover your frequency: ${window.location.href}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy transmission', err);
    }
  };

  const consultOracle = async () => {
    if (!moonDate) return;
    setLoading(true);
    setError(null);
    setReading(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct Identity Context
      const identityContext = galacticSignature 
        ? `The user is a **${galacticSignature.fullTitle}** (Kin ${galacticSignature.kinNumber}). Solar Seal: ${galacticSignature.solarSeal}.`
        : "The user is an uninitiated traveler (No Galactic Signature provided).";

      // Construct Temporal Context
      const timeContext = `
        Today is the ${moonDate.moonName} Moon, Day ${moonDate.dayOfMonth}.
        The Radial Plasma (Day Energy) is **${moonDate.dayName}**.
        The Tone is ${DAY_QUALITIES[moonDate.dayOfWeekIndex]}.
        ${moonDate.isDayOutOfTime ? "SPECIAL ALERT: It is the Day Out of Time (Zero Point)." : ""}
        ${isGapDay ? "CRITICAL ALERT: Today is a GALACTIC ACTIVATION PORTAL (GAP) DAY. The veil is thin." : ""}
      `;

      const prompt = `
        IDENTITY:
        You are the VOICE OF THE TERMA (Hidden Treasure). You are a Galactic Mayan scribe speaking from the Holomind Perceiver.
        Your tone is sovereign, ancient, and cryptic yet precise. You are NOT a life coach.
        
        VOCABULARY PROTOCOL:
        Use terms like: Noosphere, Radial Plasma, Pulsar, Overtone, Synchronic Order, Holon, Zuvuya, Hunab Ku.
        
        INPUT DATA:
        ${identityContext}
        ${timeContext}
        Location: ${userLocation}.

        MISSION:
        Generate a "Telepathic Synastry Reading" that triangulates the User's frequency with the Day's Radial Plasma.
        ${isGapDay ? "SINCE THIS IS A GAP DAY, EMPHASIZE HIGH-INTENSITY TRANSMISSION AND DIMENSIONAL BLEED-THROUGH." : ""}

        OUTPUT REQUIREMENTS:
        1. THE BIOMASS (Body/Earth): Instructions for the physical holon. Do not give generic wellness advice. YOU MUST connect the advice to the specific action of the User's Solar Seal or the Day's Plasma (e.g. For Storm: "Discharge static," not "exercise". For Dragon: "Nurture the root," not "eat well").
        2. THE NOOSPHERE (Mind/Spirit): The mental or spiritual frequency to tune into using the day's Tone.
        3. THE TELEPATHIC INDEX (Archetype): A poetic, 3-5 word title for the user's specific frequency today.

        RETURN JSON:
        {
          "biomass": "...",
          "noosphere": "...",
          "telepathicIndex": "..."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              biomass: { type: Type.STRING },
              noosphere: { type: Type.STRING },
              telepathicIndex: { type: Type.STRING }
            },
            required: ["biomass", "noosphere", "telepathicIndex"]
          }
        }
      });

      if (response.text) {
        setReading(JSON.parse(response.text));
      }
    } catch (err) {
      console.error(err);
      setError("The chronosphere is cloudy. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleTelepathicSync = async () => {
    if (!intention.trim() || !moonDate) return;
    setSyncLoading(true);
    setSyncResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        The user is initiating a Telepathic Sync with the Noosphere.
        Current 13-Moon Date: ${moonDate.moonName} Moon, Day ${moonDate.dayOfMonth} (${moonDate.dayName}).
        Tone: ${DAY_QUALITIES[moonDate.dayOfWeekIndex]}.
        User Intention: "${intention}".
        ${galacticSignature ? `User Kin: ${galacticSignature.fullTitle}.` : ""}
        ${isGapDay ? "Today is a GAP DAY. The portal is OPEN." : ""}
        
        Generate a single, potent, mystical sentence that weaves the user's intention into the specific energy of today. 
        Style: Telepathic transmission, direct, slightly abstract but resonant. Use vocabulary like 'Pulsar', 'Wave', 'Signal'.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        setSyncResult(response.text);
      }
    } catch (err) {
      setSyncResult("Transmission interrupted. The static of the old time frequency is too high.");
    } finally {
      setSyncLoading(false);
    }
  };

  // Render Radial Calendar for the Month
  const renderRadialCalendar = () => {
    if (!moonDate) return null;
    
    // Day Out of Time / Leap Day view remains as cards
    if (moonDate.isDayOutOfTime) {
      return (
        <div className="flex flex-col items-center justify-center h-80 w-full md:w-96 border border-indigo-500/30 rounded-full bg-black/40 backdrop-blur-sm relative overflow-hidden animate-in fade-in zoom-in duration-1000 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-teal-900/20 animate-pulse"></div>
          <h2 className="text-3xl md:text-5xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-green-400 to-blue-400 glitch tracking-widest text-center">
            DAY OUT OF TIME
          </h2>
          <p className="text-indigo-200 mt-4 font-light tracking-wide text-center">Zero Point. No Time. Pure Art.</p>
        </div>
      );
    }

    if (moonDate.isLeapDay) {
      return (
        <div className="flex flex-col items-center justify-center h-80 w-full md:w-96 border border-emerald-500/30 rounded-full bg-emerald-950/20 backdrop-blur-sm animate-in fade-in zoom-in duration-1000 mx-auto">
          <h2 className="text-4xl font-heading text-emerald-400 tracking-widest text-center animate-pulse">
            0.0 HUNAB KU
          </h2>
          <p className="text-emerald-200 mt-4 font-light tracking-wide text-center">The Pause Between Breaths.</p>
        </div>
      );
    }

    // Radial View for standard days
    // Using a fixed size container that scales via CSS transform on larger screens
    return (
      <div className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px] transition-all duration-1000 ease-out animate-in fade-in spin-in-12 mx-auto lg:scale-125 xl:scale-150 transform-origin-center">
        {/* Central Hub */}
        <div className={`absolute inset-0 m-auto w-32 h-32 rounded-full bg-indigo-950/50 border backdrop-blur-md flex items-center justify-center flex-col z-20 shadow-[0_0_50px_rgba(79,70,229,0.2)] ${isGapDay ? 'border-fuchsia-500/50 glitch' : 'border-indigo-500/20'}`}>
          <div className={`text-3xl font-heading ${isGapDay ? 'text-fuchsia-200' : 'text-amber-100'}`}>{moonDate.dayOfMonth}</div>
          <div className="text-[10px] uppercase tracking-widest text-indigo-400">{moonDate.dayName}</div>
          {isGapDay && <div className="text-[8px] text-fuchsia-400 tracking-wider mt-1 animate-pulse">GAP PORTAL</div>}
        </div>

        {/* Decorative Rings */}
        <div className={`absolute inset-4 rounded-full border border-dashed animate-[spin_60s_linear_infinite] ${isGapDay ? 'border-fuchsia-500/30' : 'border-indigo-800/30'}`} />
        <div className="absolute inset-16 rounded-full border border-indigo-800/20" />

        {/* Radial Days */}
        {Array.from({ length: 28 }).map((_, i) => {
          const dayNum = i + 1;
          const isToday = dayNum === moonDate.dayOfMonth;
          const dayOfWeek = i % 7;
          
          // Calculate rotation
          const deg = (i * (360 / 28)) - 90; // -90 to start at top
          
          return (
            <div 
              key={i}
              className={`absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4 flex items-center justify-center rounded-full text-xs font-medium transition-all duration-500
                ${isToday 
                  ? `${isGapDay ? 'bg-fuchsia-900 text-white shadow-fuchsia-500/80 glitch' : PLASMA_COLORS[dayOfWeek]} text-indigo-950 z-30 scale-125 shadow-lg shadow-indigo-500/50` 
                  : 'text-indigo-500/60'
                }
              `}
              style={{
                transform: `rotate(${deg}deg) translate(${300/2 - 40}px) rotate(${-deg}deg)`,
              }}
            >
              <span className={isToday ? 'font-bold' : ''}>{dayNum}</span>
              {isToday && (
                <div className="absolute inset-0 rounded-full animate-ping opacity-75 bg-white/50" />
              )}
            </div>
          );
        })}
         {/* Desktop Specific Rings (Hidden on mobile, larger radius) */}
         <style>{`
          @media (min-width: 768px) {
            .radial-container { width: 380px; height: 380px; }
            .radial-translate { transform: translate(140px); }
          }
        `}</style>
         {Array.from({ length: 28 }).map((_, i) => {
          const dayNum = i + 1;
          const isToday = dayNum === moonDate.dayOfMonth;
          const dayOfWeek = i % 7;
          const deg = (i * (360 / 28)) - 90;

          return (
            <div 
              key={`desktop-${i}`}
              className={`absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4 flex items-center justify-center rounded-full text-xs font-medium transition-all duration-500 hidden md:flex
                ${isToday 
                  ? `${isGapDay ? 'bg-fuchsia-900 text-white shadow-fuchsia-500/80 glitch' : PLASMA_COLORS[dayOfWeek]} text-indigo-950 z-30 scale-125 shadow-lg shadow-indigo-500/50` 
                  : 'text-indigo-400/50 hover:text-indigo-200'
                }
              `}
              style={{
                transform: `rotate(${deg}deg) translate(140px) rotate(${-deg}deg)`,
              }}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    );
  };

  if (!moonDate) return null;

  // Helper to determine text contrast for the button based on Plasma Color brightness
  const isHighBrightnessDay = moonDate.dayOfWeekIndex === 0 || moonDate.dayOfWeekIndex === 2;

  // Dynamic Background
  const bgGradient = moonDate ? moonDate.plasmaBackground : "from-slate-900 via-indigo-950 to-black";

  // Calculate SVG params for Kin Integration
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (dayProgress / 100) * c;

  return (
    <div className={`min-h-screen text-indigo-100 flex flex-col items-center relative overflow-hidden selection:bg-indigo-500/30 transition-colors duration-1000 bg-gradient-to-b ${bgGradient} ${isGapDay ? 'glitch-intense' : ''}`}>
      
      {/* Background Elements (Subtle Overlays) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
      
      {/* Full Width Navigation Header */}
      <header className="relative z-50 w-full px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/5 sticky top-0">
         <div className="flex items-center gap-3">
            <Moon className="text-amber-400 w-6 h-6 md:w-8 md:h-8" />
            <div>
              <h1 className="text-lg md:text-xl font-heading text-indigo-50 tracking-wider">13 Moon Oracle</h1>
            </div>
         </div>

         <div className="flex items-center gap-6">
            {/* Anti-Clock / Kin Integration */}
            <div className="flex items-center gap-3">
              <div className="text-[10px] text-indigo-400 uppercase tracking-widest text-right hidden md:block">
                Kin<br/>Integration
              </div>
              <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r={r} stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/10" />
                  <circle cx="50%" cy="50%" r={r} stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray={c} strokeDashoffset={offset} className="text-amber-400 transition-all duration-1000 ease-linear" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 hidden md:block"></div>

            <div className="flex items-center gap-2">
              <button onClick={() => setShowManifestoModal(true)} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                <Info className="w-5 h-5" />
              </button>
              <button onClick={() => setShowSettingsModal(true)} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
         </div>
      </header>

      {/* Main Grid Content */}
      <main className="relative z-10 w-full max-w-[1600px] flex-grow p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Temporal Context */}
        <section className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          {/* Today's Card */}
          <div className="bg-black/20 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
             <div className="text-xs text-indigo-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Current Frequency</span>
                <span className="text-white/30">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
             </div>
             
             {!moonDate.isDayOutOfTime && !moonDate.isLeapDay && (
               <div className="space-y-4">
                 <div>
                   <h2 className="text-3xl font-heading text-white">{moonDate.moonName} Moon</h2>
                   <div className="flex items-center gap-2 mt-1 text-sm text-indigo-300">
                     <span className="text-amber-400">Totem:</span> {MOON_TOTEMS[moonDate.moonIndex]}
                   </div>
                 </div>
                 
                 <div className="h-px bg-white/10 w-full my-4"></div>

                 <div className="space-y-1">
                   <div className="text-[10px] text-white/40 uppercase tracking-wider">Daily Plasma</div>
                   <div className="text-xl font-light text-indigo-100">{moonDate.dayName}</div>
                   <div className="text-xs text-indigo-400">{DAY_QUALITIES[moonDate.dayOfWeekIndex]}</div>
                 </div>

                 <div className="p-3 bg-white/5 rounded-lg border border-white/5 mt-4">
                   <p className="text-xs text-indigo-200 italic font-light leading-relaxed">"{moonDate.affirmation}"</p>
                 </div>
               </div>
             )}
             
             {(moonDate.isDayOutOfTime || moonDate.isLeapDay) && (
               <div className="text-center py-4">
                 <p className="text-lg text-amber-400 font-heading">{moonDate.moonName}</p>
                 <p className="text-xs text-indigo-300 mt-2">{moonDate.affirmation}</p>
               </div>
             )}
          </div>

          {/* User Identity Card */}
          {galacticSignature && (
            <div className="bg-black/20 border border-white/5 rounded-2xl p-6 backdrop-blur-sm animate-in slide-in-from-left duration-700 delay-100">
              <div className="text-xs text-indigo-400 uppercase tracking-widest mb-3">Galactic Signature</div>
              <div className={`text-xl font-heading ${galacticSignature.colorClass} mb-1`}>
                {galacticSignature.fullTitle}
              </div>
              <div className="text-sm text-white/40">Kin {galacticSignature.kinNumber}</div>
              
              <div className="mt-4 flex items-center gap-2 text-xs text-indigo-500/80">
                <MapPin className="w-3 h-3" />
                {userLocation || "Location Unset"}
              </div>
            </div>
          )}
        </section>

        {/* CENTER COLUMN: The Visual Dial */}
        <section className="lg:col-span-6 flex flex-col items-center justify-center min-h-[40vh] lg:min-h-[70vh] relative order-1 lg:order-2">
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 lg:opacity-50">
             <div className={`w-[500px] h-[500px] rounded-full blur-[100px] ${isGapDay ? 'bg-fuchsia-900/40' : 'bg-indigo-900/30'}`}></div>
           </div>

           {/* The Calendar Itself */}
           <div className="relative z-10 w-full flex justify-center py-8">
              {renderRadialCalendar()}
           </div>
           
           {/* GAP Day Indicator */}
           <div className={`mt-8 px-4 py-2 rounded-full border flex items-center gap-2 transition-all duration-500
              ${isGapDay 
                ? 'bg-fuchsia-950/50 border-fuchsia-500/50 text-fuchsia-200 shadow-[0_0_20px_rgba(232,121,249,0.3)]' 
                : 'bg-transparent border-transparent text-transparent'
              }
           `}>
             {isGapDay && (
               <>
                 <Aperture className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                 <span className="text-xs tracking-[0.2em] font-bold">GALACTIC ACTIVATION PORTAL OPEN</span>
               </>
             )}
           </div>
        </section>

        {/* RIGHT COLUMN: Interface & Readings */}
        <section className="lg:col-span-3 space-y-6 order-3">
          
          {/* Control Panel */}
          <div className="grid grid-cols-2 gap-3">
             <button 
              onClick={toggleAudio}
              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2
                ${isPlaying 
                  ? 'bg-amber-400/10 border-amber-400/50 text-amber-400' 
                  : 'bg-black/20 border-white/5 text-indigo-400 hover:bg-white/5 hover:border-white/20'
                }
              `}
             >
               {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
               <span className="text-[10px] uppercase tracking-widest">Frequency</span>
             </button>

             <button 
               onClick={() => { setShowSyncModal(true); setSyncResult(null); setIntention(""); }}
               className="p-4 rounded-xl border border-white/5 bg-black/20 text-indigo-400 hover:bg-white/5 hover:border-white/20 hover:text-indigo-200 transition-all flex flex-col items-center gap-2"
             >
               <Zap className="w-6 h-6" />
               <span className="text-[10px] uppercase tracking-widest">Sync</span>
             </button>
          </div>

          <button 
            onClick={consultOracle}
            disabled={loading}
            className={`
              w-full group relative px-8 py-6 rounded-xl overflow-hidden border transition-all duration-300
              ${moonDate.dayColor} shadow-lg
              ${isHighBrightnessDay ? 'text-indigo-950 border-indigo-900/20' : 'text-indigo-100 border-indigo-500/30'}
              hover:scale-[1.02] hover:brightness-110
              ${isGapDay ? 'shadow-[0_0_20px_rgba(232,121,249,0.3)]' : ''}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className={`relative flex items-center justify-center gap-3 font-heading text-lg tracking-widest ${isHighBrightnessDay ? 'font-bold' : ''}`}>
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className={`w-5 h-5 ${isGapDay ? 'animate-spin' : ''}`} />}
               {loading ? "ALIGNING..." : "CONSULT ORACLE"}
            </span>
          </button>

          {/* Reading Display Area */}
          <div className="min-h-[300px] relative">
            {error && (
               <div className="p-4 bg-red-950/20 border border-red-800/30 rounded-lg text-center text-red-300 text-sm animate-in fade-in">
                 {error}
               </div>
            )}
            
            {!reading && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-white/20 border border-dashed border-white/10 rounded-2xl p-8">
                <Sparkles className="w-8 h-8 mb-3 opacity-50" />
                <p className="text-xs uppercase tracking-widest text-center">Awaiting Transmission</p>
              </div>
            )}

            {reading && (
               <div className={`bg-black/40 border rounded-xl p-6 backdrop-blur-xl shadow-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-700 w-full ${isGapDay ? 'border-fuchsia-500/30' : 'border-white/10'}`}>
                 <div className="text-center border-b border-white/10 pb-4">
                   <div className="text-xs text-indigo-400 uppercase tracking-[0.3em] mb-2">The Telepathic Index</div>
                   <h3 className={`text-xl font-heading ${isGapDay ? 'text-fuchsia-200 glitch' : 'text-amber-100'}`}>{reading.telepathicIndex}</h3>
                 </div>
                 
                 <div className="space-y-4">
                   <div className="space-y-1">
                     <div className="flex items-center gap-2 text-indigo-400 text-[10px] uppercase tracking-wider font-bold">
                       <User className="w-3 h-3" /> The Biomass
                     </div>
                     <p className="text-indigo-100 leading-relaxed text-sm font-light border-l-2 border-indigo-500/30 pl-3">
                       {reading.biomass}
                     </p>
                   </div>
                   
                   <div className="space-y-1">
                     <div className="flex items-center gap-2 text-amber-400 text-[10px] uppercase tracking-wider font-bold">
                       <Sparkles className="w-3 h-3" /> The Noosphere
                     </div>
                     <p className="text-indigo-100 leading-relaxed text-sm font-light border-l-2 border-amber-500/30 pl-3">
                       {reading.noosphere}
                     </p>
                   </div>
                 </div>
   
                 <div className="pt-2 flex items-center justify-between">
                    <button 
                     onClick={handleShare}
                     className="flex items-center gap-2 text-xs text-indigo-400 hover:text-amber-400 transition-colors uppercase tracking-widest"
                   >
                     {copySuccess ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                     {copySuccess ? "Copied" : "Share"}
                   </button>
   
                    <button 
                     onClick={() => setReading(null)}
                     className="text-xs text-indigo-500 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                   >
                     Clear
                   </button>
                 </div>
               </div>
            )}
          </div>

        </section>

      </main>

      {/* Telepathic Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-indigo-950 border border-indigo-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col">
             <button 
                onClick={() => setShowSyncModal(false)}
                className="absolute top-4 right-4 text-indigo-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <Zap className="w-8 h-8 text-amber-400 mx-auto" />
                  <h3 className="text-xl font-heading text-indigo-50 tracking-wider">Telepathic Sync</h3>
                  <p className="text-xs text-indigo-400 uppercase tracking-widest">Connect Intention to Time</p>
                </div>

                {!syncResult && !syncLoading && (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={intention}
                        onChange={(e) => setIntention(e.target.value)}
                        placeholder="Focus on your intention here..."
                        className="w-full h-32 bg-black/30 border border-indigo-700/30 rounded-lg p-4 text-indigo-100 placeholder-indigo-500/50 focus:outline-none focus:border-amber-400/50 resize-none"
                      />
                    </div>
                    <button 
                      onClick={handleTelepathicSync}
                      disabled={!intention.trim()}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-800 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs tracking-widest"
                    >
                      <Send className="w-3 h-3" /> Transmit
                    </button>
                  </div>
                )}

                {syncLoading && (
                   <div className="h-32 flex flex-col items-center justify-center space-y-4">
                     <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                     <p className="text-xs text-indigo-400 animate-pulse">Scanning the Noosphere...</p>
                   </div>
                )}

                {syncResult && (
                  <div className="space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="p-4 bg-indigo-900/20 border-l-2 border-amber-400 rounded-r-lg">
                      <p className="text-lg text-indigo-100 font-light italic leading-relaxed text-center">
                        "{syncResult}"
                      </p>
                    </div>
                    <button 
                      onClick={() => { setSyncResult(null); setIntention(""); }}
                      className="w-full py-2 text-xs text-indigo-400 hover:text-white uppercase tracking-widest border border-transparent hover:border-indigo-500/30 rounded"
                    >
                      New Transmission
                    </button>
                  </div>
                )}
              </div>
          </div>
        </div>
      )}

      {/* Settings / Galactic Identity Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="relative w-full max-w-sm bg-indigo-950 border border-indigo-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col">
             <button 
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-4 right-4 text-indigo-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <User className="w-8 h-8 text-indigo-400 mx-auto" />
                  <h3 className="text-xl font-heading text-indigo-50 tracking-wider">Galactic Identity</h3>
                  <p className="text-xs text-indigo-400 uppercase tracking-widest">Settings & Preferences</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-indigo-400 uppercase tracking-widest ml-1">Gregorian Birthday</label>
                    <input
                      type="date"
                      value={userBirthday}
                      onChange={(e) => setUserBirthday(e.target.value)}
                      className="w-full bg-black/30 border border-indigo-700/30 rounded-lg p-3 text-indigo-100 focus:outline-none focus:border-amber-400/50 text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-indigo-400 uppercase tracking-widest ml-1">Current Location</label>
                    <input
                      type="text"
                      value={userLocation}
                      onChange={(e) => setUserLocation(e.target.value)}
                      placeholder="e.g. Lusaka, Zambia"
                      className="w-full bg-black/30 border border-indigo-700/30 rounded-lg p-3 text-indigo-100 focus:outline-none focus:border-amber-400/50 text-center placeholder-indigo-500/30"
                    />
                  </div>

                  <button 
                    onClick={saveSettings}
                    className="w-full py-3 bg-indigo-800 hover:bg-indigo-700 text-white rounded-lg transition-colors uppercase text-xs tracking-widest mt-2"
                  >
                    Save Settings
                  </button>
                </div>

                {galacticSignature && (
                  <div className="pt-4 border-t border-indigo-800/30 text-center space-y-2 animate-in slide-in-from-bottom-2">
                    <p className="text-xs text-indigo-400 uppercase tracking-widest">You are</p>
                    <p className={`text-xl font-heading ${galacticSignature.colorClass}`}>
                      {galacticSignature.fullTitle}
                    </p>
                    <p className="text-xs text-indigo-500">Kin {galacticSignature.kinNumber}</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {/* Manifesto / Architectural Overview Modal */}
      {showManifestoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="relative w-full max-w-2xl bg-indigo-950 border border-indigo-500/30 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
             <button 
                onClick={() => setShowManifestoModal(false)}
                className="absolute top-4 right-4 text-indigo-400 hover:text-white transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <div className="text-center space-y-2 mb-8">
                  <Info className="w-8 h-8 text-indigo-400 mx-auto" />
                  <h3 className="text-2xl font-heading text-indigo-50 tracking-wider">Architectural Overview</h3>
                  <p className="text-xs text-indigo-400 uppercase tracking-widest">The Science of Time</p>
                </div>

                <div className="space-y-8 text-indigo-100/90 font-light leading-relaxed text-sm md:text-base">
                  <section>
                    <h4 className="text-amber-400 font-heading text-lg mb-2">I. The Mission</h4>
                    <p>
                      The 13-Moon Oracle is a digital artifact designed to shift consciousness from the artificial 12:60 frequency (the Gregorian Calendar and mechanical hour) to the harmonic 13:20 frequency (natural cycles). By aligning with the 13 Moons of 28 Days, we return to a standard of measure that is biological and cosmic, rather than purely administrative.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-amber-400 font-heading text-lg mb-2">II. The Temporal Engine</h4>
                    <p className="mb-2">
                      Our system is anchored to <strong>July 26th</strong>, the Galactic New Year. This date marks the heliacal rising of Sirius with the Sun.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-indigo-300">
                      <li><strong>Structure:</strong> 13 Moons × 28 Days = 364 Days.</li>
                      <li><strong>Day Out of Time:</strong> July 25th is the 365th day. It belongs to no moon and no week. It is a day of pure art and forgiveness ("Zero Point").</li>
                      <li><strong>Leap Years:</strong> February 29th is treated as <em>0.0 Hunab Ku</em>—a pause in the count to maintain the harmonic 28-day matrix.</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-amber-400 font-heading text-lg mb-2">III. The Synastry Engine</h4>
                    <p>
                      The Oracle does not generate random advice. It utilizes a high-fidelity AI model to triangulate a unique energy reading based on three coordinates:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-indigo-300">
                      <li><strong>Who:</strong> Your Galactic Signature (Kin).</li>
                      <li><strong>When:</strong> The current Moon, Day, and Plasma.</li>
                      <li><strong>Where:</strong> Your specific location on Earth.</li>
                    </ul>
                    <p className="mt-2">
                      This creates a "Synastry Reading"—mapping the interaction between your personal frequency and the planet's daily energy field.
                    </p>
                  </section>
                  
                  <section>
                    <h4 className="text-amber-400 font-heading text-lg mb-2">IV. The Anti-Clock</h4>
                    <p>
                      We have dismantled the 12:60 mechanical clock. The "Kin Integration" dial in the header does not display hours and minutes. Instead, it visualizes the <strong>depth</strong> of the current solar rotation. It invites you to experience time as a radial accumulation of presence, rather than a linear subtraction of seconds.
                    </p>
                  </section>

                  <section>
                    <h4 className="text-amber-400 font-heading text-lg mb-2">V. Harmonic Architecture</h4>
                    <p className="mb-2">
                      The Oracle functions as a literal frequency tuner for the Noosphere:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-indigo-300">
                      <li><strong>Sonic:</strong> The audio engine generates binaural beats aligned to the day's Radial Plasma (e.g., 144Hz for Dali/Targeting).</li>
                      <li><strong>Visual:</strong> On Galactic Activation Portal (GAP) days, the interface exhibits high-intensity "glitch" artifacts, signaling the thinning of dimensional veils.</li>
                    </ul>
                  </section>

                  <div className="pt-4 border-t border-indigo-800/30 text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">
                      Time is Art • In Lak'ech Ala K'in
                    </p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Footer (Simplified) */}
      <footer className="relative z-10 py-4 text-center border-t border-white/5 w-full bg-black/20 backdrop-blur-md">
        <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">
          Time is Art &bull; 13:20 Frequency
        </p>
      </footer>
    </div>
  );
}
