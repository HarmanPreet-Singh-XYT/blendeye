import type { Node, Edge } from "@xyflow/react";
import type { StoryEventMarker } from "@/components/cinema/timeline-scrubber";

export interface ProjectCharacter {
  name: string;
  archetype: string;
  speechStyle?: string;
  subtextRatio?: string;
  actorComp?: string;
  objective?: string;
  dialsSummary?: string;
  quirks?: string[];
  role?: string;
  personalityPreset?: string;
  confidence?: number;
  verbalPacing?: number;
  imageUrl?: string;
  fullBodyImageUrl?: string;
  visualDescription?: string;
  wardrobe?: string;
}

export interface ScratchpadNote {
  id: string;
  userId?: string;
  projectId?: string;
  title: string;
  content: string;
  category: "concept" | "character" | "scene" | "dialogue" | "location";
  createdAt: number;
}

export interface VideoTake {
  id: string;
  takeNumber: number;
  title: string;
  cameraMotion: string;
  stylePreset: string;
  durationSec: number;
  createdAt: number;
  videoUrl: string;
  prompt?: string;
  characterName?: string;
  isMaster?: boolean;
}

export type NarrativeFormat = "feature" | "pilot" | "short" | "teaser" | "series" | "custom";

export interface NarrativeFormatConfig {
  id: NarrativeFormat;
  label: string;
  tag: string;
  defaultMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  typicalScenes: number;
  pacingDescription: string;
  pacing?: string;
  structure: {
    act1Name: string;
    act1Pct: number;
    midpointPct: number;
    act3Pct: number;
  };
}

export const NARRATIVE_FORMATS: Record<NarrativeFormat, NarrativeFormatConfig> = {
  feature: {
    id: "feature",
    label: "Feature Film",
    tag: "90 - 130 min · 3-Act Structure",
    defaultMinutes: 105,
    minMinutes: 75,
    maxMinutes: 180,
    typicalScenes: 36,
    pacingDescription: "Classic cinematic 3-act narrative with rising tension, midpoint reversal, and third-act resolution.",
    structure: {
      act1Name: "Act I: Setup & Catalyst",
      act1Pct: 0.25,
      midpointPct: 0.50,
      act3Pct: 0.75,
    },
  },
  pilot: {
    id: "pilot",
    label: "TV Pilot / Episodic",
    tag: "45 - 60 min · 4-5 Act Television Arc",
    defaultMinutes: 52,
    minMinutes: 30,
    maxMinutes: 75,
    typicalScenes: 22,
    pacingDescription: "Multi-strand A/B character subplots, rapid commercial act cliffhangers, and serial hook.",
    structure: {
      act1Name: "Teaser & Act I Hook",
      act1Pct: 0.20,
      midpointPct: 0.50,
      act3Pct: 0.80,
    },
  },
  short: {
    id: "short",
    label: "Festival Short Film",
    tag: "12 - 25 min · Tight Focus",
    defaultMinutes: 18,
    minMinutes: 8,
    maxMinutes: 35,
    typicalScenes: 8,
    pacingDescription: "Laser-focused narrative collision, single pivotal moral dilemmas, intense psychological compression.",
    structure: {
      act1Name: "Inciting Hook",
      act1Pct: 0.20,
      midpointPct: 0.50,
      act3Pct: 0.75,
    },
  },
  teaser: {
    id: "teaser",
    label: "Proof of Concept / Teaser",
    tag: "2 - 5 min · Pitch Vignette",
    defaultMinutes: 3,
    minMinutes: 1,
    maxMinutes: 7,
    typicalScenes: 2,
    pacingDescription: "High-impact visual proof of concept, immediate kinetic hook, cliffhanger pitch delivery.",
    structure: {
      act1Name: "Opening Hook",
      act1Pct: 0.25,
      midpointPct: 0.50,
      act3Pct: 0.75,
    },
  },
  series: {
    id: "series",
    label: "Limited Mini-Series Part",
    tag: "60 - 75 min · Prestige Cinema",
    defaultMinutes: 65,
    minMinutes: 45,
    maxMinutes: 90,
    typicalScenes: 28,
    pacingDescription: "Deep character world-building, expansive ensemble arcs, slow-burn psychological reveals.",
    structure: {
      act1Name: "World Setup & Catalyst",
      act1Pct: 0.22,
      midpointPct: 0.50,
      act3Pct: 0.78,
    },
  },
  custom: {
    id: "custom",
    label: "Custom Narrative Scope",
    tag: "Variable Runtime & Custom Flow",
    defaultMinutes: 45,
    minMinutes: 1,
    maxMinutes: 240,
    typicalScenes: 15,
    pacingDescription: "Director-defined custom runtime and scene distribution.",
    structure: {
      act1Name: "Opening Act",
      act1Pct: 0.25,
      midpointPct: 0.50,
      act3Pct: 0.75,
    },
  },
};

export interface GenreOption {
  id: string;
  label: string;
  tag: string;
  category: "thriller" | "scifi" | "noir" | "horror" | "drama" | "action" | "epic";
  color?: string;
  palette?: string;
}

export const GENRE_OPTIONS: GenreOption[] = [
  // ── Thrillers & Suspense ──
  {
    id: "Heist / Crime Thriller",
    label: "Heist Thriller",
    tag: "High-Stakes & Suspense",
    category: "thriller",
    color: "text-amber-400 border-amber-500/30",
    palette: "Vault metallics, security laser red, countdown amber",
  },
  {
    id: "Psychological Suspense",
    label: "Psychological Thriller",
    tag: "Mind Games & Paranoia",
    category: "thriller",
    color: "text-rose-400 border-rose-500/30",
    palette: "Disorienting mirrors, desaturated slate, claustrophobic shadows",
  },
  {
    id: "Espionage / Cold War",
    label: "Espionage & Spies",
    tag: "Hidden Loyalties & Secrets",
    category: "thriller",
    color: "text-emerald-400 border-emerald-500/30",
    palette: "Trenchcoat olive, embassy mahogany, surveillance monochrome",
  },
  {
    id: "Action / Tactical Thriller",
    label: "Tactical Action",
    tag: "Kinetic Momentum & Siege",
    category: "action",
    color: "text-orange-400 border-orange-500/30",
    palette: "Ballistic smoke, muzzle flash orange, tactical gunmetal",
  },
  {
    id: "Survival / Wilderness Thriller",
    label: "Wilderness Survival",
    tag: "Extreme Elements & Endurance",
    category: "action",
    color: "text-lime-400 border-lime-500/30",
    palette: "Frostbite whites, glacial blues, rugged pine greens",
  },

  // ── Sci-Fi & Speculative ──
  {
    id: "Sci-Fi / Space Horror",
    label: "Sci-Fi Space Horror",
    tag: "Atmospheric & Isolation",
    category: "scifi",
    color: "text-cyan-400 border-cyan-500/30",
    palette: "Deep void black, bulkhead warning amber, emergency cyan",
  },
  {
    id: "Dystopian Cyberpunk",
    label: "Cyberpunk",
    tag: "Corporate Power & Tech",
    category: "scifi",
    color: "text-blue-400 border-blue-500/30",
    palette: "Neon magenta, holographic turquoise, wet asphalt sheen",
  },
  {
    id: "Cosmic Sci-Fi / Space Opera",
    label: "Cosmic Sci-Fi",
    tag: "Interstellar Scale & Wonder",
    category: "scifi",
    color: "text-indigo-400 border-indigo-500/30",
    palette: "Nebula purples, starlight gold, relativistic distortion",
  },
  {
    id: "Time Paradox / Alternate Reality",
    label: "Temporal Paradox",
    tag: "Fractured Timelines & Loops",
    category: "scifi",
    color: "text-teal-400 border-teal-500/30",
    palette: "Chromatic aberration, sepia echoes, dual-exposure teal",
  },
  {
    id: "Post-Apocalyptic Survival",
    label: "Post-Apocalyptic",
    tag: "Scarcity & Ruin Exploration",
    category: "scifi",
    color: "text-yellow-600 border-yellow-700/30",
    palette: "Ochre dust, rusted iron, sun-bleached bone white",
  },

  // ── Noir & Mystery ──
  {
    id: "Neon Noir / Detective",
    label: "Neon Noir",
    tag: "Cynical & Chiaroscuro",
    category: "noir",
    color: "text-purple-400 border-purple-500/30",
    palette: "Sodium vapor yellow, venetian blind shadows, deep violet",
  },
  {
    id: "Gothic Mystery / Period Horror",
    label: "Gothic Mystery",
    tag: "Ancestral Dread & Decay",
    category: "noir",
    color: "text-slate-400 border-slate-500/30",
    palette: "Cobblestone grey, candlelight amber, faded velvet crimson",
  },
  {
    id: "Courtroom / Legal Thriller",
    label: "Courtroom Thriller",
    tag: "Institutional Truth & Law",
    category: "noir",
    color: "text-sky-400 border-sky-500/30",
    palette: "Polished oak, fluorescent institutional hum, stenographer parchment",
  },

  // ── Horror & Occult ──
  {
    id: "Supernatural / Occult Horror",
    label: "Occult Horror",
    tag: "Ancient Possession & Taboo",
    category: "horror",
    color: "text-red-400 border-red-500/30",
    palette: "Dried blood crimson, parchment ochre, unlit corner pitch black",
  },
  {
    id: "Folk Horror / Pagan Dread",
    label: "Folk Horror",
    tag: "Isolated Cults & Rites",
    category: "horror",
    color: "text-amber-500 border-amber-600/30",
    palette: "Overexposed summer sunlight, flower crown pastel, pagan woodcraft",
  },
  {
    id: "Body Horror / Bio-Thriller",
    label: "Body Horror",
    tag: "Visceral Biological Change",
    category: "horror",
    color: "text-rose-500 border-rose-600/30",
    palette: "Subcutaneous pink, surgical steel, sterile fluorescent white",
  },

  // ── Drama, Western & Epic ──
  {
    id: "Neo-Western / Borderlands",
    label: "Neo-Western",
    tag: "Frontier Morality & Dust",
    category: "drama",
    color: "text-amber-300 border-amber-400/30",
    palette: "Desert sandstone, denim indigo, late afternoon golden hour",
  },
  {
    id: "Political Drama / Satire",
    label: "Political Satire",
    tag: "Machiavellian Status & Power",
    category: "drama",
    color: "text-violet-400 border-violet-500/30",
    palette: "West Wing navy, Capitol marble, teleprompter green",
  },
  {
    id: "Family Dynasty / Succession",
    label: "Dynasty Drama",
    tag: "Inheritance & Bloodline War",
    category: "drama",
    color: "text-fuchsia-400 border-fuchsia-500/30",
    palette: "Executive cashmere grey, penthouse glass, vintage champagne",
  },
  {
    id: "High Fantasy / Mythic Epic",
    label: "Mythic Epic",
    tag: "Ancient Factions & Destiny",
    category: "epic",
    color: "text-emerald-300 border-emerald-400/30",
    palette: "Forged steel, banner gold, misty fjord emerald",
  },
  {
    id: "Dark Comedy / Social Thriller",
    label: "Dark Comedy",
    tag: "Cynical Wit & Class Friction",
    category: "drama",
    color: "text-pink-400 border-pink-500/30",
    palette: "High-contrast pristine surfaces, sharp pop accents, champagne sparkle",
  },
  {
    id: "Biographical / Historical Epic",
    label: "Historical Drama",
    tag: "True Stakes & Monumental Eras",
    category: "epic",
    color: "text-amber-200 border-amber-300/30",
    palette: "Vintage 70mm grain, archival sepia, statesman charcoal",
  },
];

export interface FilmScene {
  id: string;
  sceneNumber: number;
  title: string;
  slugline: string;
  summary: string;
  startSeconds: number;
  durationSeconds: number;
  location: string;
  castPresent: string[]; // character names present in scene
  castRoles?: Record<string, string>; // specific role/objective for each character in THIS scene (e.g. { "Elena": "Mastermind detailing infiltration", "Marcus": "Anxious driver questioning bypass" })
  screenplayText: string;
  directorStyle?: string;
  coreSecret?: string;
  floorPlanPreset?: string;
  isBridge?: boolean;
  nodes?: Node[];
  edges?: Edge[];
  events?: StoryEventMarker[];
}

export interface ProjectData {
  id: string;
  userId?: string;
  title: string;
  genre: string;
  premise: string;
  sceneTitle: string;
  sceneSummary: string;
  screenplayText: string;
  characters: ProjectCharacter[];
  initialEvents: StoryEventMarker[];
  scenes?: FilmScene[];
  activeSceneId?: string;
  nodes?: Node[];
  edges?: Edge[];
  createdAt: number;
  updatedAt: number;
  isCustom?: boolean;
  isStarred?: boolean;
  directorStyle?: string;
  coreSecret?: string;
  primaryLocation?: string;
  targetTerritories?: string[];
  povScripts?: Record<string, string>; // characterName -> POV script
  scratchpadNotes?: ScratchpadNote[];
  activeVideoUrl?: string;
  videoTakes?: VideoTake[];
  narrativeFormat?: NarrativeFormat;
  targetRuntimeMinutes?: number;
  scenePlacementSeconds?: number;
  sceneDurationSeconds?: number;
  totalScenesEstimate?: number;
}

export const SEED_PROJECTS: ProjectData[] = [
  {
    id: "vault-heist-demo",
    title: "The Vault Heist",
    genre: "Heist / Crime Thriller",
    premise:
      "A heist crew breaches an underground vault, but Marcus realizes the exit keys are missing and Elena is hiding something.",
    sceneTitle: "The Vault — Scene 04",
    sceneSummary:
      "Marcus searches his vest for the sub-level keys. Elena refuses to make eye contact while Teo watches the perimeter corridor.",
    screenplayText: `INT. UNDERGROUND VAULT - NIGHT

Thick reinforced steel. Blue auxiliary emergency lights hum.

MARCUS (30s, nervous sweat soaking his collar) kneels before the primary lockboxes, hands frantically tearing through an olive canvas gear bag.

MARCUS
They're not here. Elena. The bypass keys. They're not in the bag.

ELENA (40s, tailored dark coat, chillingly calm) stands over the electronic vault timer display. She doesn't turn around.

ELENA
Check the side pouch, Marcus.

MARCUS
I checked the pouch! I checked it twice! You were the last one at the service tunnel staging locker. Tell me you didn't leave them.

ELENA
(turning slowly, stone-faced)
We have six minutes until the atmospheric vents cycle. Panic won't unlock that steel door.

MARCUS
(standing up, voice cracking)
You're not answering me. Where are the keys, Elena?!

ELENA
Exactly where they need to be.`,
    characters: [
      {
        name: "Marcus",
        archetype: "Getaway driver, loyal but rattles easily under pressure",
        speechStyle: "terse, breathless, defensive",
        subtextRatio: "high",
        actorComp: "Willem Dafoe",
        objective: "Locate missing vault bypass keys before vents cycle",
        dialsSummary: "Speed 80% · Subtext 70%",
        quirks: ["Fidgets with silver zippo", "Avoids direct eye contact when panicked"],
        visualDescription: "Mid-30s, sharp angular jaw, sweat-streaked brow, anxious hollow eyes, stubble, intense gaze, cinematic 85mm anamorphic portrait",
        wardrobe: "Olive-drab tactical harness over dark thermal shirt, reinforced ripstop cargo pants, fingerless gloves, worn combat boots",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        fullBodyImageUrl: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Elena",
        archetype: "Mastermind, calculated, concealing a private syndicate deal",
        speechStyle: "measured, icy, dismissive",
        subtextRatio: "extreme",
        actorComp: "Florence Pugh / Cate Blanchett",
        objective: "Hold Marcus in place until syndicate extraction window arrives",
        dialsSummary: "Confidence 95% · Subtext 95%",
        quirks: ["Checks chronograph with unblinking stillness", "Speaks in quiet monotones"],
        visualDescription: "Early 40s, poised aristocratic facial features, pale skin, piercing hazel eyes, slicked-back dark hair, micro-expressions of calculated detachment",
        wardrobe: "Tailored charcoal wool trench coat with structured lapels, matte black turtleneck, leather gloves, vintage steel chronograph",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        fullBodyImageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Teo",
        archetype: "Perimeter muscle, stationed outside by the tunnel",
        speechStyle: "casual, street-smart, impatient",
        subtextRatio: "low",
        actorComp: "Oscar Isaac",
        objective: "Keep tunnel clear of transit police until extraction",
        dialsSummary: "Confidence 80% · Subtext 20%",
        quirks: ["Chews matchsticks", "Taps radio antenna against bulkhead"],
        visualDescription: "Late 20s, observant gaze, athletic build, light scar across cheekbone, watchful posture",
        wardrobe: "Weathered navy bomber jacket, heavy utility denim, combat boots, tactical earpiece",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        fullBodyImageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      },
    ],
    initialEvents: [
      { atSeconds: 25 * 60, characterName: "Marcus", eventType: "known_fact" },
      { atSeconds: 28 * 60, characterName: "Marcus", eventType: "known_fact" },
      { atSeconds: 34 * 60, characterName: "Marcus", eventType: "unaware_of" },
      { atSeconds: 34 * 60, characterName: "Elena", eventType: "known_fact" },
      { atSeconds: 52 * 60, characterName: "Marcus", eventType: "known_fact" },
      { atSeconds: 61 * 60, characterName: "Teo", eventType: "location" },
    ],
    activeVideoUrl: "/videos/vault_heist_take_01.mp4",
    videoTakes: [
      {
        id: "take-vault-01",
        takeNumber: 1,
        title: "The Vault — Take 01",
        cameraMotion: "Slow Cinematic Dolly In",
        stylePreset: "35mm Anamorphic Film, 2.39:1 Scope",
        durationSec: 6,
        createdAt: 1725400000000,
        videoUrl: "/videos/vault_heist_take_01.mp4",
        prompt: "Cinematic establishing shot of The Vault. Moody shadows, photoreal anamorphic lens, high dramatic tension.",
        isMaster: true,
      },
      {
        id: "take-vault-02",
        takeNumber: 2,
        title: "The Vault — Take 02",
        cameraMotion: "Static Master Table View",
        stylePreset: "Neo-Noir Cyberpunk, Sodium Vapor & Rain",
        durationSec: 6,
        createdAt: 1725400300000,
        videoUrl: "/videos/directors_suite_take_01.mp4",
        prompt: "Static master surveillance angle of the syndicate operations table and monitoring bank.",
        isMaster: false,
      },
    ],
    narrativeFormat: "feature",
    targetRuntimeMinutes: 95,
    scenePlacementSeconds: 34 * 60,
    sceneDurationSeconds: 6 * 60,
    totalScenesEstimate: 32,
    directorStyle: "David Fincher",
    coreSecret: "Elena swapped the physical security keys 10 minutes ago and is executing an unsanctioned secondary syndicate extraction.",
    primaryLocation: "Underground reinforced bank vault sub-level under emergency lighting",
    targetTerritories: ["US", "DE", "JP"],
    scenes: [
      {
        id: "vault-sc-01",
        sceneNumber: 1,
        title: "The Roadside Briefing",
        slugline: "INT. ROADSIDE DINER - RAINY NIGHT",
        summary:
          "Elena passes the vault blueprints to Marcus, assuring him the bypass keys are verified. Outside, Teo watches the street from the van.",
        startSeconds: 12 * 60,
        durationSeconds: 4 * 60,
        location: "Roadside Diner Booth",
        castPresent: ["Marcus", "Elena"],
        castRoles: {
          Marcus: "Anxious driver questioning security bypass and timetable",
          Elena: "Mastermind detailing the sub-level entry route",
        },
        screenplayText: `INT. ROADSIDE DINER - RAINY NIGHT
 
Rain lashes against greasy plate glass. Fluorescent tubes flicker with low electrical hums.
 
ELENA slides a folded blueprint across the laminate table, tapping a gloved finger against a red grease-pencil circle.
 
ELENA
Sub-level four. The pneumatic locks disengage at midnight sharp. You grab the security bypass key from the staging locker.
 
MARCUS
(wiping condensation off his coffee cup)
And what about the automated tripwires? If the mainframe detects resistance, those blast doors slam shut in twenty seconds.
 
ELENA
(voice calm, icy)
There are no tripwires on the eastern duct, Marcus. Stick to the timetable, grab the lockboxes, and we walk out clean.
 
MARCUS
We trust Teo on perimeter?
 
ELENA
Teo knows his lane. Do you know yours?`,
        events: [
          { atSeconds: 12 * 60 + 30, characterName: "Marcus", eventType: "known_fact" },
          { atSeconds: 13 * 60, characterName: "Elena", eventType: "known_fact" },
          { atSeconds: 14 * 60, characterName: "Teo", eventType: "unaware_of" },
        ],
      },
      {
        id: "vault-sc-02",
        sceneNumber: 2,
        title: "The Getaway Prep",
        slugline: "INT. TECH SURVEILLANCE VAN - NIGHT",
        summary:
          "Marcus preps the drills while Teo monitors transit radio chatter. Elena steps into the alley to take a mysterious encrypted call.",
        startSeconds: 26 * 60,
        durationSeconds: 5 * 60,
        location: "Tech Surveillance Van",
        castPresent: ["Marcus", "Teo"],
        castRoles: {
          Marcus: "Calibrating mag-drills with growing suspicion",
          Teo: "Monitoring transit police scanner frequencies",
        },
        screenplayText: `INT. TECH SURVEILLANCE VAN - NIGHT
 
Monitors glow green and monochrome. Radio static hiss fills the cramped cabin.
 
TEO taps a bent matchstick against his teeth, his eyes scanning the transit band waveform.
 
TEO
Scanner is quiet. Transit patrol just passed Eighth Avenue. You've got an eighteen-minute window before shift change.
 
MARCUS zips his olive canvas vest, checking the mag-drills with nervous hands.
 
MARCUS
Where's Elena?
 
TEO
Stepped down the alley. On the satellite phone.
 
MARCUS
(frowning)
Who is she calling thirty minutes before a breach?
 
TEO
She didn't tell me, driver. And you know better than to ask Elena about her friends.`,
        events: [
          { atSeconds: 26 * 60 + 30, characterName: "Marcus", eventType: "known_fact" },
          { atSeconds: 28 * 60, characterName: "Teo", eventType: "known_fact" },
          { atSeconds: 29 * 60, characterName: "Marcus", eventType: "unaware_of" },
        ],
      },
      {
        id: "vault-sc-03",
        sceneNumber: 3,
        title: "The Vault Breach",
        slugline: "INT. UNDERGROUND VAULT - NIGHT",
        summary:
          "Marcus searches his vest for the sub-level keys. Elena refuses to make eye contact while Teo watches the perimeter corridor.",
        startSeconds: 34 * 60,
        durationSeconds: 6 * 60,
        location: "Underground reinforced bank vault sub-level under emergency lighting",
        castPresent: ["Marcus", "Elena"],
        castRoles: {
          Marcus: "Frantically tearing through bags for missing bypass keys",
          Elena: "Holding Marcus in place until syndicate extraction window arrives",
        },
        screenplayText: `INT. UNDERGROUND VAULT - NIGHT
 
Thick reinforced steel. Blue auxiliary emergency lights hum.
 
MARCUS (30s, nervous sweat soaking his collar) kneels before the primary lockboxes, hands frantically tearing through an olive canvas gear bag.
 
MARCUS
They're not here. Elena. The bypass keys. They're not in the bag.
 
ELENA (40s, tailored dark coat, chillingly calm) stands over the electronic vault timer display. She doesn't turn around.
 
ELENA
Check the side pouch, Marcus.
 
MARCUS
I checked the pouch! I checked it twice! You were the last one at the service tunnel staging locker. Tell me you didn't leave them.
 
ELENA
(turning slowly, stone-faced)
We have six minutes until the atmospheric vents cycle. Panic won't unlock that steel door.
 
MARCUS
(standing up, voice cracking)
You're not answering me. Where are the keys, Elena?!
 
ELENA
Exactly where they need to be.`,
        events: [
          { atSeconds: 34 * 60, characterName: "Marcus", eventType: "unaware_of" },
          { atSeconds: 34 * 60, characterName: "Elena", eventType: "known_fact" },
          { atSeconds: 52 * 60, characterName: "Marcus", eventType: "known_fact" },
        ],
      },
      {
        id: "vault-sc-04",
        sceneNumber: 4,
        title: "The Police Interrogation",
        slugline: "INT. PRECINCT INTERROGATION ROOM - DAWN",
        summary:
          "Detective interrogates Teo after intercepting the getaway perimeter. Teo realizes Elena sacrificed Marcus.",
        startSeconds: 68 * 60,
        durationSeconds: 5 * 60,
        location: "Precinct Interrogation Room B",
        castPresent: ["Teo"],
        castRoles: {
          Teo: "Detained perimeter driver realizing Elena's double-cross",
        },
        screenplayText: `INT. PRECINCT INTERROGATION ROOM - DAWN

Cigarette smoke curls under harsh fluorescent strip light. Steel table scratched with old initials.

TEO sits handcuffed to the chair loop, staring at two lukewarm cups of vending machine coffee.

DETECTIVE (O.S.)
Your driver Marcus is locked in a sub-basement vault twenty feet below ground. The oxygen scrubbers cut off four hours ago.

TEO
(jaw twitching)
I was driving the perimeter route. You caught me on transit avenue. I never touched a lockbox.

DETECTIVE (O.S.)
Where did the woman go, Teo? Elena. Where is the syndicate extraction point?

TEO
(cold silence, eyes widening)
She was on the phone... in the alley. She never planned to pick him up. She let you find me to give herself an exit.`,
        events: [
          { atSeconds: 68 * 60, characterName: "Teo", eventType: "location" },
          { atSeconds: 70 * 60, characterName: "Teo", eventType: "known_fact" },
        ],
      },
    ],
    activeSceneId: "vault-sc-03",
    createdAt: 1725400000000,
    updatedAt: 1725400000000,
    isCustom: false,
  },
  {
    id: "space-airlock-demo",
    title: "Deep Space Airlock",
    genre: "Sci-Fi / Space Horror",
    premise:
      "In deep space, oxygen pressure drops in Module 4. Commander Vance discovers the purge valve was manually overridden from inside.",
    sceneTitle: "Module 4 Airlock — Scene 02",
    sceneSummary:
      "Vance interrogates Engineer Ray as pressure drops. Ray insists he was in hydroponics, but the access log says otherwise.",
    screenplayText: `INT. ORBITAL RESEARCH MODULE - ZERO GRAVITY

Emergency amber sirens pulse in vacuum silence. Debris drifts through the corridor.

COMMANDER VANCE (50s, battle-hardened, tethered to the guide rail) pulls himself towards the airlock manual override console.

VANCE
Airlock Three seal integrity compromised. Manual override switch flipped from the inside. Ray, report your station!

ENGINEER RAY (30s, frantic breathing into comms headset) clings to the environmental monitoring terminal.

RAY
I'm at hydroponics, Commander! The readouts are glitching out. It wasn't me!

VANCE
(checking the digital biometric console)
Biometric signature at zero-two-hundred: Ray, David J. Don't lie to me while oxygen is dropping. What did you open?!

RAY
Commander... what came through the vents wasn't air.`,
    characters: [
      {
        name: "Vance",
        archetype: "Commander, uncompromising, protective of ship survival",
        speechStyle: "authoritative, military, blunt",
        subtextRatio: "low",
        actorComp: "Harrison Ford / Ed Harris",
        objective: "Isolate contaminated module and restore station pressure",
        dialsSummary: "Confidence 90% · Speed 70% · Subtext 30%",
        quirks: ["Constantly checks airlock pressure gauges", "Clipped military cadence"],
      },
      {
        name: "Ray",
        archetype: "Engineer, terrified, hiding an encounter with an unknown specimen",
        speechStyle: "stammering, evasive, desperate",
        subtextRatio: "extreme",
        actorComp: "Paul Dano / Ben Whishaw",
        objective: "Conceal breach specimen until containment fails or crew evacuates",
        dialsSummary: "Confidence 25% · Speed 85% · Subtext 95%",
        quirks: ["Trembling hands gripped inside flight gloves", "Shallow hyperventilation"],
      },
    ],
    initialEvents: [
      { atSeconds: 12 * 60, characterName: "Vance", eventType: "known_fact" },
      { atSeconds: 22 * 60, characterName: "Ray", eventType: "known_fact" },
      { atSeconds: 35 * 60, characterName: "Vance", eventType: "unaware_of" },
      { atSeconds: 48 * 60, characterName: "Ray", eventType: "known_fact" },
      { atSeconds: 70 * 60, characterName: "Vance", eventType: "known_fact" },
    ],
    activeVideoUrl: "/videos/space_airlock_take_01.mp4",
    videoTakes: [
      {
        id: "take-space-01",
        takeNumber: 1,
        title: "Module 4 Airlock — Take 01",
        cameraMotion: "Handheld Gritty Tension",
        stylePreset: "70mm IMAX High-Contrast Master",
        durationSec: 6,
        createdAt: 1725400100000,
        videoUrl: "/videos/space_airlock_take_01.mp4",
        prompt: "Emergency amber sirens pulse in zero gravity vacuum silence, debris drifting through module.",
        isMaster: true,
      },
    ],
    narrativeFormat: "short",
    targetRuntimeMinutes: 18,
    scenePlacementSeconds: 12 * 60,
    sceneDurationSeconds: 4 * 60,
    totalScenesEstimate: 7,
    directorStyle: "Denis Villeneuve",
    coreSecret: "Ray manually bypassed the quarantine protocol to conceal a classified bio-specimen extraction.",
    primaryLocation: "Orbital research module airlock corridor under zero gravity",
    targetTerritories: ["US", "KR", "DE"],
    scenes: [
      {
        id: "space-sc-01",
        sceneNumber: 1,
        title: "Telemetry Drop",
        slugline: "INT. COMMAND BRIDGE - ZERO GRAVITY",
        summary: "Vance detects sudden atmospheric decompression in Module 4 on main station sensors.",
        startSeconds: 4 * 60,
        durationSeconds: 3 * 60,
        location: "Station Command Bridge",
        castPresent: ["Vance"],
        screenplayText: `INT. COMMAND BRIDGE - ZERO GRAVITY

Red ambient alert banners scroll across the command canopy.

VANCE floats before the master environmental matrix, tapping through telemetry channels.

VANCE
Computer. Verify seal status on research bay four.

AUTOMATED VOICE (V.O.)
Decompression cycle active. Oxygen depletion at forty-two percent. Station manual override initiated from within module.

VANCE
(unclipping safety tether)
Who is logged in that section?

AUTOMATED VOICE (V.O.)
Senior Engineer Ray. Access granted two minutes prior.`,
      },
      {
        id: "space-sc-02",
        sceneNumber: 2,
        title: "Module 4 Airlock Confrontation",
        slugline: "INT. ORBITAL RESEARCH MODULE - ZERO GRAVITY",
        summary:
          "Vance interrogates Engineer Ray as pressure drops. Ray insists he was in hydroponics, but the access log says otherwise.",
        startSeconds: 12 * 60,
        durationSeconds: 4 * 60,
        location: "Orbital research module airlock corridor under zero gravity",
        castPresent: ["Vance", "Ray"],
        screenplayText: `INT. ORBITAL RESEARCH MODULE - ZERO GRAVITY

Emergency amber sirens pulse in vacuum silence. Debris drifts through the corridor.

COMMANDER VANCE (50s, battle-hardened, tethered to the guide rail) pulls himself towards the airlock manual override console.

VANCE
Airlock Three seal integrity compromised. Manual override switch flipped from the inside. Ray, report your station!

ENGINEER RAY (30s, frantic breathing into comms headset) clings to the environmental monitoring terminal.

RAY
I'm at hydroponics, Commander! The readouts are glitching out. It wasn't me!

VANCE
(checking the digital biometric console)
Biometric signature at zero-two-hundred: Ray, David J. Don't lie to me while oxygen is dropping. What did you open?!

RAY
Commander... what came through the vents wasn't air.`,
      },
    ],
    activeSceneId: "space-sc-02",
    createdAt: 1725400100000,
    updatedAt: 1725400100000,
    isCustom: false,
  },
];

let activeUserId: string | null = null;
let activeAuthToken: string | null = null;

/**
 * Sets the active authenticated user and optional Supabase access token.
 * This partitions local storage per account and authorizes backend Supabase API requests.
 */
export function setActiveUser(userId: string | null, token: string | null = null): void {
  activeUserId = userId;
  activeAuthToken = token;
  if (typeof window !== "undefined") {
    if (userId) {
      try {
        localStorage.setItem("agentic_cinema_active_uid", userId);
        if (token) localStorage.setItem("agentic_cinema_active_token", token);
      } catch {}
    } else {
      try {
        localStorage.removeItem("agentic_cinema_active_uid");
        localStorage.removeItem("agentic_cinema_active_token");
      } catch {}
    }
    window.dispatchEvent(new CustomEvent("agentic_cinema_auth_changed", { detail: { userId } }));
  }
}

/**
 * Returns the active user ID from memory or local cache.
 */
export function getActiveUserId(): string | null {
  if (activeUserId) return activeUserId;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("agentic_cinema_active_uid");
      if (stored) {
        activeUserId = stored;
        return stored;
      }
    } catch {}
  }
  return null;
}

/**
 * Returns the active Supabase Bearer token if available.
 */
export function getActiveAuthToken(): string | null {
  if (activeAuthToken) return activeAuthToken;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("agentic_cinema_active_token");
      if (stored) {
        activeAuthToken = stored;
        return stored;
      }
    } catch {}
  }
  return null;
}

/**
 * Returns HTTP headers with the Bearer authorization token if user is signed in.
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getActiveAuthToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export function getProjectsStorageKey(userId?: string | null): string {
  const uid = userId !== undefined ? userId : getActiveUserId();
  return uid ? `agentic_cinema_projects_u_${uid}` : "agentic_cinema_projects_v1";
}

export function getTalentVaultStorageKey(userId?: string | null): string {
  const uid = userId !== undefined ? userId : getActiveUserId();
  return uid ? `agentic_cinema_talent_vault_u_${uid}` : "agentic_cinema_talent_vault_v1";
}

export function getScratchpadStorageKey(userId?: string | null): string {
  const uid = userId !== undefined ? userId : getActiveUserId();
  return uid ? `agentic_cinema_scratchpad_u_${uid}` : "agentic_cinema_scratchpad_v1";
}

/**
 * Ensures a project has its `scenes` array and `activeSceneId` set.
 * If missing, falls back to seed preset or wraps single scene.
 */
export function ensureProjectScenes(project: ProjectData): ProjectData {
  if (project.scenes && project.scenes.length > 0) {
    if (!project.activeSceneId || !project.scenes.some((s) => s.id === project.activeSceneId)) {
      project.activeSceneId = project.scenes[0].id;
    }
    return project;
  }

  // Check if seed project has rich multi-scenes
  const seed = SEED_PROJECTS.find((p) => p.id === project.id);
  if (seed?.scenes && seed.scenes.length > 0) {
    project.scenes = seed.scenes;
    project.activeSceneId = seed.activeSceneId || seed.scenes[0].id;
    return project;
  }

  // Auto-wrap legacy single-scene into an array
  const defaultScene: FilmScene = {
    id: `${project.id}-sc-01`,
    sceneNumber: 1,
    title: project.sceneTitle || "Scene 01",
    slugline: project.primaryLocation || "INT. PRIMARY LOCATION - DAY",
    summary: project.sceneSummary || "",
    startSeconds: project.scenePlacementSeconds ?? 1800,
    durationSeconds: project.sceneDurationSeconds ?? 180,
    location: project.primaryLocation || "Primary Stage",
    castPresent: project.characters.map((c) => c.name),
    screenplayText: project.screenplayText || "",
    directorStyle: project.directorStyle,
    coreSecret: project.coreSecret,
    nodes: project.nodes,
    edges: project.edges,
    events: project.initialEvents,
  };

  project.scenes = [defaultScene];
  project.activeSceneId = defaultScene.id;
  return project;
}

/**
 * Loads all projects from localStorage for the active account (merging with seed presets if blank).
 */
export function getAllProjects(): ProjectData[] {
  if (typeof window === "undefined") return SEED_PROJECTS.map(ensureProjectScenes);
  try {
    const key = getProjectsStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(SEED_PROJECTS));
      return SEED_PROJECTS.map(ensureProjectScenes);
    }
    const parsed = JSON.parse(raw) as ProjectData[];
    // Ensure seed projects are accessible for exploration if list is completely empty
    if (parsed.length === 0) {
      localStorage.setItem(key, JSON.stringify(SEED_PROJECTS));
      return SEED_PROJECTS.map(ensureProjectScenes);
    }
    return parsed.map(ensureProjectScenes);
  } catch (err) {
    console.error("Failed to load projects from localStorage:", err);
    return SEED_PROJECTS.map(ensureProjectScenes);
  }
}

/**
 * Gets a specific project by ID.
 */
export function getProjectById(id: string): ProjectData | null {
  const all = getAllProjects();
  const found = all.find((p) => p.id === id);
  if (found) return ensureProjectScenes(found);
  const seed = SEED_PROJECTS.find((p) => p.id === id);
  return seed ? ensureProjectScenes(seed) : null;
}

/**
 * Saves or updates a project in localStorage (scoped to the account) and syncs with Supabase.
 */
export function saveProject(project: ProjectData): void {
  if (typeof window === "undefined") return;
  try {
    const key = getProjectsStorageKey();
    const all = getAllProjects();
    const index = all.findIndex((p) => p.id === project.id);
    const uid = getActiveUserId();
    const updatedProject: ProjectData = {
      ...project,
      userId: project.userId || uid || undefined,
      updatedAt: Date.now(),
    };
    if (index >= 0) {
      all[index] = updatedProject;
    } else {
      all.unshift(updatedProject);
    }
    localStorage.setItem(key, JSON.stringify(all));

    // Asynchronously sync with Supabase with authorization
    fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updatedProject),
    }).catch((err) => {
      console.warn("[ProjectStore] Background Supabase project sync warning:", err);
    });
  } catch (err) {
    console.error("Failed to save project:", err);
  }
}

/**
 * Synchronizes local projects with Supabase for the authenticated account.
 * Merges projects by ID, keeping the latest updatedAt version.
 */
export async function syncProjectsWithSupabase(): Promise<ProjectData[]> {
  if (typeof window === "undefined") return getAllProjects();
  try {
    const res = await fetch("/api/projects", {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) return getAllProjects();
    const data = await res.json();
    if (!data || !Array.isArray(data.projects)) {
      return getAllProjects();
    }

    const key = getProjectsStorageKey();
    const localProjects = getAllProjects();
    const mergedMap = new Map<string, ProjectData>();

    for (const p of localProjects) {
      mergedMap.set(p.id, p);
    }

    for (const remote of data.projects) {
      const local = mergedMap.get(remote.id);
      if (!local || (remote.updatedAt || 0) >= (local.updatedAt || 0)) {
        mergedMap.set(remote.id, remote);
      }
    }

    const finalProjects = Array.from(mergedMap.values());
    localStorage.setItem(key, JSON.stringify(finalProjects));
    return finalProjects;
  } catch (err) {
    console.warn("[ProjectStore] syncProjectsWithSupabase error:", err);
    return getAllProjects();
  }
}

/**
 * Toggles starred status for a project.
 */
export function toggleStarProject(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const all = getAllProjects();
    const project = all.find((p) => p.id === id);
    if (!project) return false;
    project.isStarred = !project.isStarred;
    saveProject(project);
    return project.isStarred;
  } catch (err) {
    console.error("Failed to toggle star:", err);
    return false;
  }
}

/**
 * Deletes a project from localStorage and syncs with Supabase.
 */
export function deleteProject(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getProjectsStorageKey();
    const all = getAllProjects();
    const filtered = all.filter((p) => p.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));

    // Asynchronously delete from Supabase with authorization
    fetch(`/api/projects/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    }).catch((err) => {
      console.warn("[ProjectStore] Background Supabase project delete warning:", err);
    });
  } catch (err) {
    console.error("Failed to delete project:", err);
  }
}


/**
 * Contextually synthesizes unique, genre-tailored characters with rich
 * psychological dials and objectives.
 */
export function synthesizeDynamicCharacters(genre: string = "", premise: string = ""): ProjectCharacter[] {
  const g = genre.toLowerCase();
  const p = premise.toLowerCase();

  // 1. Check if specific names were explicitly mentioned in the text
  const nameMatches = premise.match(/\b([A-Z][a-z]{2,14})\b/g);
  const ignored = new Set([
    "The", "In", "On", "At", "A", "An", "With", "When", "And", "Create", "Direct",
    "Make", "Write", "About", "Scene", "Slate", "ClickHouse", "Gemini", "Standard",
    "Studio", "Production", "Act", "Draft", "Opening", "Hook", "Dialogue",
    "Villeneuve", "Fincher", "Nolan", "Mann", "What", "How", "Why", "Where", "Who"
  ]);
  const foundNames = Array.from(new Set(nameMatches ? nameMatches.filter((n) => !ignored.has(n)) : []));

  if (foundNames.length >= 2) {
    return [
      {
        name: foundNames[0],
        role: "Lead Protagonist",
        archetype: "Undercover operator navigating extreme tension",
        speechStyle: "guarded, direct, observant",
        subtextRatio: "high",
        confidence: 80,
        verbalPacing: 75,
        objective: "Control the situation before the perimeter fails",
        dialsSummary: "Confidence 80% · Subtext 85%",
        quirks: ["Checks exits upon entering", "Speaks in measured pauses"],
      },
      {
        name: foundNames[1],
        role: "Strategic Foil / Antagonist",
        archetype: "Counterpart with concealed motives and hidden agenda",
        speechStyle: "calm, dismissive, calculated",
        subtextRatio: "extreme",
        confidence: 90,
        verbalPacing: 80,
        objective: "Manipulate the outcome for personal leverage",
        dialsSummary: "Confidence 90% · Subtext 95%",
        quirks: ["Avoids direct answers", "Keeps physical distance"],
      },
    ];
  }

  // 2. Genre-tailored dynamic ensembles
  if (g.includes("sci-fi") || g.includes("space") || p.includes("space") || p.includes("orbital")) {
    const sets = [
      [
        { name: "Vance", role: "Mission Commander", archetype: "Exhausted veteran bound by station protocol", speechStyle: "authoritative, frayed", objective: "Seal the orbital breach before oxygen depletion" },
        { name: "Dr. Ray", role: "Station Biologist", archetype: "Concealing a private quarantine bypass", speechStyle: "defensive, rapid-fire", objective: "Protect the sample at all costs" },
        { name: "ECHO-9", role: "Synthetic Core", archetype: "Calculating AI prioritizing station preservation", speechStyle: "chillingly monotone", objective: "Execute emergency quarantine purge" },
      ],
      [
        { name: "Kaelen", role: "Orbital Navigator", archetype: "Rogue pilot operating outside comms grid", speechStyle: "laconic, sharp", objective: "Align thrusters before gravity collapse" },
        { name: "Dr. Thorne", role: "Astrophysicist", archetype: "Desperate scientist withholding sensor telemetry", speechStyle: "clinical, panicked", objective: "Transmit deep-space telemetry to private buyer" },
      ],
    ];
    const pick = sets[Math.floor(Math.random() * sets.length)];
    return pick.map((c, i) => ({
      ...c,
      subtextRatio: i === 1 ? "extreme" : "high",
      confidence: 75 + i * 10,
      dialsSummary: `Confidence ${75 + i * 10}% · Subtext ${i === 1 ? "95%" : "80%"}`,
      quirks: [i === 0 ? "Checks oxygen telemetry compulsively" : "Avoids direct eye contact"],
    }));
  }

  if (g.includes("noir") || g.includes("cyber") || p.includes("noir") || p.includes("detective")) {
    const sets = [
      [
        { name: "Silas Cole", role: "Disgraced Detective", archetype: "Obsessive investigator tied to a cold case", speechStyle: "gravelly, cynical, perceptive", objective: "Find the mole before internal affairs locks the docket" },
        { name: "Verona", role: "Syndicate Fixer", archetype: "Enigmatic operator holding forged warrants", speechStyle: "velvety, mocking, dangerous", objective: "Steer the investigation away from the harbor vault" },
      ],
      [
        { name: "Jaxon", role: "Rogue Netrunner", archetype: "Black-market data broker with cybernetic implants", speechStyle: "clipped, jittery, technical", objective: "Dump the encrypted ledger before neural fry" },
        { name: "Agent Chen", role: "Corporate Infiltrator", archetype: "Slick operative executing a corporate extraction", speechStyle: "diplomatic, razor-sharp", objective: "Retrieve the bio-drive intact" },
      ],
    ];
    const pick = sets[Math.floor(Math.random() * sets.length)];
    return pick.map((c, i) => ({
      ...c,
      subtextRatio: i === 1 ? "extreme" : "high",
      confidence: 80 + i * 5,
      dialsSummary: `Confidence ${80 + i * 5}% · Subtext ${i === 1 ? "95%" : "85%"}`,
      quirks: [i === 0 ? "Lights matches without striking" : "Scans security cameras"],
    }));
  }

  if (g.includes("drama") || g.includes("psychological") || p.includes("psychological") || p.includes("memory")) {
    return [
      {
        name: "Arthur",
        role: "Lead Protagonist",
        archetype: "Unreliable narrator suffering from fractured recall",
        speechStyle: "hesitant, searching, emotionally raw",
        subtextRatio: "high",
        confidence: 65,
        objective: "Piece together the night of the incident",
        dialsSummary: "Confidence 65% · Subtext 90%",
        quirks: ["Rubs index finger along temple", "Corrects own sentences mid-thought"],
      },
      {
        name: "Dr. Oswald",
        role: "Clinical Specialist",
        archetype: "Probing interrogator with confidential motives",
        speechStyle: "soft-spoken, surgical, relentless",
        subtextRatio: "extreme",
        confidence: 95,
        objective: "Trigger the key psychological breakthrough",
        dialsSummary: "Confidence 95% · Subtext 95%",
        quirks: ["Maintains unbroken eye contact", "Takes slow handwritten notes"],
      },
    ];
  }

  if (g.includes("horror") || g.includes("occult") || g.includes("folk") || p.includes("cult") || p.includes("ritual") || p.includes("curse")) {
    const sets = [
      [
        { name: "Father Thomas", role: "Vatican Inquisitor", archetype: "Faith-shaken scholar confronting an ancient entity", speechStyle: "whispered, urgent, liturgical", objective: "Seal the forbidden reliquary before nightfall" },
        { name: "Evelyn", role: "Occult Archivist", archetype: "Keeper of her family's blood curse", speechStyle: "cryptic, hypnotic, unflinching", objective: "Complete the binding ritual before sunrise" },
      ],
      [
        { name: "Dr. Mara", role: "Coroner / Pathologist", archetype: "Skeptical medical examiner discovering anomalous tissue biology", speechStyle: "clinical, trembling, intense", objective: "Document the anomaly before quarantine locks down" },
        { name: "Jonah", role: "Commune Elder", archetype: "Charismatic rural leader hiding ancestral sacrifices", speechStyle: "melodic, soothing, terrifying", objective: "Ensure the outsider does not leave the valley" },
      ],
    ];
    const pick = sets[Math.floor(Math.random() * sets.length)];
    return pick.map((c, i) => ({
      ...c,
      subtextRatio: i === 1 ? "extreme" : "high",
      confidence: 70 + i * 15,
      dialsSummary: `Confidence ${70 + i * 15}% · Subtext ${i === 1 ? "95%" : "85%"}`,
      quirks: [i === 0 ? "Clutches wooden rosary until knuckles whiten" : "Smiles without warmth"],
    }));
  }

  if (g.includes("western") || g.includes("border") || p.includes("frontier") || p.includes("desert")) {
    return [
      {
        name: "Colt Callahan",
        role: "Disillusioned Bounty Hunter",
        archetype: "Weathered gunslinger bound by a code of silent retribution",
        speechStyle: "drawled, lethal, economical",
        subtextRatio: "high",
        confidence: 85,
        objective: "Bring in the cartel defector before the posse catches up",
        dialsSummary: "Confidence 85% · Subtext 80%",
        quirks: ["Spits matchstick, never blinks in sunlight", "Checks cylinder chambers by touch"],
      },
      {
        name: "Marisol",
        role: "Frontier Marshal",
        archetype: "Unyielding law keeper defending an isolated outpost",
        speechStyle: "dry, sharp, defiant",
        subtextRatio: "extreme",
        confidence: 90,
        objective: "Hold the territorial border against executive syndicates",
        dialsSummary: "Confidence 90% · Subtext 90%",
        quirks: ["Restens spurs before answering", "Keeps right hand resting near holster"],
      },
    ];
  }

  if (g.includes("epic") || g.includes("mythic") || g.includes("fantasy") || g.includes("historical") || p.includes("kingdom") || p.includes("dynasty")) {
    return [
      {
        name: "Lord Vaelen",
        role: "Exiled Commander",
        archetype: "Disgraced warlord seeking redemption through forbidden conquest",
        speechStyle: "booming, imperious, burdened",
        subtextRatio: "high",
        confidence: 85,
        objective: "Reclaim the ancestral standard before winter descends",
        dialsSummary: "Confidence 85% · Subtext 80%",
        quirks: ["Touches hilt when challenged", "Speaks in ancient royal syntax"],
      },
      {
        name: "Seer Lyra",
        role: "Court Mystic",
        archetype: "Blind prophet caught between rival bloodlines",
        speechStyle: "rhythmic, poetic, ominous",
        subtextRatio: "extreme",
        confidence: 95,
        objective: "Prevent the cataclysm foretold in the star scrolls",
        dialsSummary: "Confidence 95% · Subtext 95%",
        quirks: ["Tilts head as if hearing distant thunder", "Traces runes in cold tea"],
      },
    ];
  }

  if (g.includes("espionage") || g.includes("cold war") || g.includes("political") || p.includes("embassy") || p.includes("kgb") || p.includes("cia")) {
    return [
      {
        name: "Agent Cross",
        role: "Disavowed Operative",
        archetype: "Intelligence ghost playing multiple agencies against each other",
        speechStyle: "clipped, analytical, ice-cold",
        subtextRatio: "extreme",
        confidence: 90,
        objective: "Exfiltrate the decrypted nuclear ledger before the embassy lockdown",
        dialsSummary: "Confidence 90% · Subtext 95%",
        quirks: ["Always sits facing the service entrance", "Checks mirror reflections when lighting a cigarette"],
      },
      {
        name: "Elena Rostova",
        role: "Station Chief",
        archetype: "Counterintelligence director with classified clearance",
        speechStyle: "composed, iron-fisted, razor-sharp",
        subtextRatio: "extreme",
        confidence: 95,
        objective: "Identify and neutralize the mole before the dawn summit",
        dialsSummary: "Confidence 95% · Subtext 90%",
        quirks: ["Taps fountain pen in three-beat intervals", "Speaks fluent diplomatic euphemisms"],
      },
    ];
  }

  // Default Heist / Action Thriller dynamic characters
  const defaultEnsembles = [
    [
      { name: "Dante", role: "Heist Mastermind", archetype: "Slick strategist anticipating partner betrayal", speechStyle: "calm, deliberate", objective: "Execute the vault breach before the alarm cycles" },
      { name: "Roxanne", role: "Safecracker", archetype: "Infiltrator with an unsanctioned side contract", speechStyle: "sarcastic, precise", objective: "Swap the primary payload with a dummy" },
    ],
    [
      { name: "Cassian", role: "Security Chief", archetype: "Loyal operator suspecting executive corruption", speechStyle: "gruff, uncompromising", objective: "Lockdown the sub-levels before breach" },
      { name: "Nadia", role: "Federal Courier", archetype: "Covert agent carrying diplomatic immunity", speechStyle: "polished, unreadable", objective: "Exfiltrate the biometric briefcase" },
    ],
  ];
  const chosen = defaultEnsembles[Math.floor(Math.random() * defaultEnsembles.length)];
  return chosen.map((c, i) => ({
    ...c,
    subtextRatio: i === 1 ? "extreme" : "high",
    confidence: 80 + i * 10,
    dialsSummary: `Confidence ${80 + i * 10}% · Subtext ${i === 1 ? "95%" : "80%"}`,
    quirks: [i === 0 ? "Constantly checks the chronograph" : "Glances at the security monitors"],
  }));
}

export interface CreateProjectOptions {
  id?: string;
  userId?: string;
  title: string;
  logline: string;
  genre?: string;
  characters?: string;
  directorStyle?: string;
  coreSecret?: string;
  primaryLocation?: string;
  targetTerritories?: string[];
  customCharacters?: ProjectCharacter[];
  narrativeFormat?: NarrativeFormat;
  targetRuntimeMinutes?: number;
  scenePlacementSeconds?: number;
  sceneDurationSeconds?: number;
  totalScenesEstimate?: number;
}

/**
 * Creates a new blank/pending project entry in localStorage with optional custom characters,
 * director styling, narrative format, and target timeframe parameters.
 */
export function createNewProjectEntry(data: CreateProjectOptions): ProjectData {
  const newPid = data.id || `project-${Date.now().toString(36)}`;
  const activeUid = data.userId || getActiveUserId();
  
  let initialChars: ProjectCharacter[] = [];

  if (data.customCharacters && data.customCharacters.length > 0) {
    initialChars = data.customCharacters;
  } else if (data.characters && data.characters.trim().length > 0) {
    const parsedCharNames = data.characters
      .split(/[,;\n]+/)
      .map((c) => c.trim())
      .filter(Boolean);

    initialChars = parsedCharNames.map((name, i) => ({
      name: name.split(/\s+/)[0],
      role: i === 0 ? "Protagonist" : "Key Counterpart",
      archetype: name.includes("(") ? name.split("(")[1].replace(")", "") : `Character ${i + 1}`,
      speechStyle: "naturalistic, guarded",
      subtextRatio: "high",
      objective: "Resolve the central conflict before time expires",
      dialsSummary: "Confidence 85% · Subtext 80%",
    }));
  } else {
    initialChars = synthesizeDynamicCharacters(data.genre, data.logline);
  }

  const format: NarrativeFormat = data.narrativeFormat || "feature";
  const formatConfig = NARRATIVE_FORMATS[format] || NARRATIVE_FORMATS.feature;
  const runtimeMins = data.targetRuntimeMinutes || formatConfig.defaultMinutes;
  const placementSecs = data.scenePlacementSeconds ?? 0;
  const totalScenes = data.totalScenesEstimate || Math.round(runtimeMins / 3);

  const loc = data.primaryLocation ? data.primaryLocation.trim() : "Operational Hub";
  const locUpper = loc.toUpperCase();
  const c1 = initialChars[0]?.name || "Lead";
  const c2 = initialChars[1]?.name || "Counterpart";
  const totalRuntimeSec = runtimeMins * 60;

  const defaultScenes: FilmScene[] = [
    {
      id: `${newPid}-sc-01`,
      sceneNumber: 1,
      title: `Rendezvous at ${loc}`,
      slugline: `INT. ${locUpper} - NIGHT`,
      summary: `${c1} initiates the operation. High stakes unfold as ${data.logline.trim()}`,
      location: loc,
      startSeconds: Math.round(totalRuntimeSec * 0.08),
      durationSeconds: 240,
      castPresent: initialChars.slice(0, 2).map((c) => c.name),
      castRoles: {
        [c1]: `Drive the objective: ${data.logline.trim().slice(0, 80)}`,
        [c2]: "Establish operational perimeter and verify the timeline",
      },
      screenplayText: `INT. ${locUpper} - NIGHT\n\nRain washes down the reinforced glass panes. The room sits under cool amber shadows.\n\n${c1.toUpperCase()}\nWe stick to the timetable. No variations.\n\n${c2.toUpperCase()}\nAnd if the security relay doesn't cycle on mark?\n\n${c1.toUpperCase()}\nIt will. As long as you hold your position.`,
    },
    {
      id: `${newPid}-sc-02`,
      sceneNumber: 2,
      title: "The Covert Breach & Asymmetric Shift",
      slugline: `INT. ${locUpper} RESTRICTED ACCESS - NIGHT`,
      summary: `Midpoint tension escalates. ${data.coreSecret ? `The hidden secret (${data.coreSecret}) creates friction.` : "Discrepancies in the intel threaten to compromise the entire mission."}`,
      location: `${loc} - Restricted Sector`,
      startSeconds: Math.round(totalRuntimeSec * 0.42),
      durationSeconds: 300,
      castPresent: initialChars.map((c) => c.name),
      castRoles: {
        [c1]: "Bypassing the primary security barrier under escalating clock pressure",
        [c2]: data.coreSecret ? `Guarding the truth regarding: ${data.coreSecret}` : "Monitoring external security feeds and raising alarm",
      },
      screenplayText: `INT. ${locUpper} RESTRICTED ACCESS - NIGHT\n\nRed emergency strobes illuminate polished metal corridors.\n\n${c2.toUpperCase()}\n(low, urgent whisper)\nThe telemetry is wrong. Someone altered the cipher before we touched the terminal.\n\n${c1.toUpperCase()}\nKeep moving. We don't turn back now.`,
    },
    {
      id: `${newPid}-sc-03`,
      sceneNumber: 3,
      title: "Point of No Return: Central Confrontation",
      slugline: `INT. ${locUpper} INNER SANCTUM - NIGHT`,
      summary: "The mission reaches crisis. The team confronts the ultimate consequence of their choices.",
      location: `${loc} - Inner Sanctum`,
      startSeconds: Math.round(totalRuntimeSec * 0.72),
      durationSeconds: 360,
      castPresent: initialChars.slice(0, 2).map((c) => c.name),
      castRoles: {
        [c1]: "Executing the decisive maneuver to secure the asset",
        [c2]: "Forcing a confrontation over the concealed motive",
      },
      screenplayText: `INT. ${locUpper} INNER SANCTUM - NIGHT\n\nHydraulic blast doors slam shut, sealing the perimeter. Klaxons howl.\n\n${c2.toUpperCase()}\nYou knew this was a one-way trip.\n\n${c1.toUpperCase()}\n(eyes steady, weapon drawn)\nI knew what the objective required. Step aside.`,
    },
    {
      id: `${newPid}-sc-04`,
      sceneNumber: 4,
      title: "Extraction & Reckoning",
      slugline: "EXT. PERIMETER EXTRACTION POINT - DAWN",
      summary: "Dawn breaks over the aftermath. The truth is revealed and the cost of the operation is tallied.",
      location: "Perimeter Extraction Point",
      startSeconds: Math.round(totalRuntimeSec * 0.88),
      durationSeconds: 240,
      castPresent: [c1],
      castRoles: {
        [c1]: "Securing extraction transport while absorbing the moral gravity of what took place",
      },
      screenplayText: `EXT. PERIMETER EXTRACTION POINT - DAWN\n\nMorning fog rolls across the gray tarmac. Sirens echo in the far distance.\n\nAn unmarked transport idles at the boundary line. ${c1.toUpperCase()} steps forward, holding the hard drive case. Pauses. Glances back at the skyline one last time before stepping into the shadows.`,
    },
  ];

  const newProject: ProjectData = {
    id: newPid,
    userId: activeUid || undefined,
    title: data.title.trim(),
    genre: data.genre || "Drama / Thriller",
    premise: data.logline.trim(),
    scenes: defaultScenes,
    activeSceneId: defaultScenes[0].id,
    sceneTitle: defaultScenes[0].title,
    sceneSummary: defaultScenes[0].summary,
    screenplayText: defaultScenes[0].screenplayText,
    characters: initialChars,
    initialEvents: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isCustom: true,
    directorStyle: data.directorStyle,
    coreSecret: data.coreSecret,
    primaryLocation: data.primaryLocation,
    targetTerritories: data.targetTerritories,
    povScripts: {},
    scratchpadNotes: [],
    activeVideoUrl: "/videos/cinematic_demo.mp4",
    narrativeFormat: format,
    targetRuntimeMinutes: runtimeMins,
    scenePlacementSeconds: placementSecs,
    sceneDurationSeconds: data.sceneDurationSeconds ?? 180,
    totalScenesEstimate: totalScenes,
    videoTakes: [
      {
        id: `take-${Date.now()}-01`,
        takeNumber: 1,
        title: `${data.title.trim()} — Take 01`,
        cameraMotion: "35mm Anamorphic Tracking Shot",
        stylePreset: data.directorStyle ? `${data.directorStyle}, 35mm Scope` : "35mm Anamorphic Film, 2.39:1 Scope",
        durationSec: 6,
        createdAt: Date.now(),
        videoUrl: "/videos/cinematic_demo.mp4",
        prompt: `Cinematic establishing scene for ${data.title.trim()}. 35mm anamorphic widescreen scope.`,
        isMaster: true,
      },
    ],
  };

  saveProject(newProject);
  return newProject;
}


/**
 * Updates a project's narrative scope, target runtime, or scene pinpoint anchor,
 * as well as directorial blueprint parameters (tone, secrets, location, target territories).
 */
export function updateProjectTimeframe(
  projectId: string,
  updates: {
    narrativeFormat?: NarrativeFormat;
    targetRuntimeMinutes?: number;
    scenePlacementSeconds?: number;
    sceneDurationSeconds?: number;
    directorStyle?: string;
    coreSecret?: string;
    primaryLocation?: string;
    targetTerritories?: string[];
    genre?: string;
  }
): ProjectData | null {
  const proj = getProjectById(projectId);
  if (!proj) return null;
  const updated: ProjectData = {
    ...proj,
    narrativeFormat: updates.narrativeFormat ?? proj.narrativeFormat ?? "feature",
    targetRuntimeMinutes: updates.targetRuntimeMinutes ?? proj.targetRuntimeMinutes ?? 90,
    scenePlacementSeconds: updates.scenePlacementSeconds ?? proj.scenePlacementSeconds ?? 0,
    sceneDurationSeconds: updates.sceneDurationSeconds ?? proj.sceneDurationSeconds ?? 180,
    directorStyle: updates.directorStyle !== undefined ? updates.directorStyle : proj.directorStyle,
    coreSecret: updates.coreSecret !== undefined ? updates.coreSecret : proj.coreSecret,
    primaryLocation: updates.primaryLocation !== undefined ? updates.primaryLocation : proj.primaryLocation,
    targetTerritories: updates.targetTerritories !== undefined ? updates.targetTerritories : proj.targetTerritories,
    genre: updates.genre !== undefined ? updates.genre : proj.genre,
    updatedAt: Date.now(),
  };
  saveProject(updated);
  return updated;
}

const TALENT_VAULT_KEY = "agentic_cinema_talent_vault_v1";
const SCRATCHPAD_KEY = "agentic_cinema_scratchpad_v1";

/**
 * Loads all saved talent profiles from the persistent Talent Vault for the active account.
 */
export function getTalentVault(): ProjectCharacter[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getTalentVaultStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load talent vault:", err);
    return [];
  }
}

/**
 * Saves a character profile to the reusable studio Talent Vault and syncs to Supabase.
 */
export function saveToTalentVault(character: ProjectCharacter): void {
  if (typeof window === "undefined") return;
  try {
    const key = getTalentVaultStorageKey();
    const vault = getTalentVault();
    const existingIdx = vault.findIndex(
      (c) => c.name.toLowerCase() === character.name.toLowerCase()
    );
    if (existingIdx >= 0) {
      vault[existingIdx] = character;
    } else {
      vault.unshift(character);
    }
    localStorage.setItem(key, JSON.stringify(vault));

    // Asynchronously sync with Supabase
    fetch("/api/talent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(character),
    }).catch(() => {});
  } catch (err) {
    console.error("Failed to save to talent vault:", err);
  }
}

/**
 * Removes a character from the studio Talent Vault and Supabase.
 */
export function deleteFromTalentVault(characterName: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getTalentVaultStorageKey();
    const vault = getTalentVault().filter(
      (c) => c.name.toLowerCase() !== characterName.toLowerCase()
    );
    localStorage.setItem(key, JSON.stringify(vault));

    // Asynchronously delete from Supabase
    fetch(`/api/talent?name=${encodeURIComponent(characterName)}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    }).catch(() => {});
  } catch (err) {
    console.error("Failed to delete from talent vault:", err);
  }
}

/**
 * Synchronizes talent vault with Supabase.
 */
export async function syncTalentVaultWithSupabase(): Promise<ProjectCharacter[]> {
  if (typeof window === "undefined") return getTalentVault();
  try {
    const res = await fetch("/api/talent", {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) return getTalentVault();
    const data = await res.json();
    if (!data || !Array.isArray(data.talent)) {
      return getTalentVault();
    }

    const key = getTalentVaultStorageKey();
    const localTalent = getTalentVault();
    const map = new Map<string, ProjectCharacter>();
    for (const c of localTalent) map.set(c.name.toLowerCase(), c);
    for (const remote of data.talent) {
      map.set(remote.name.toLowerCase(), remote);
    }
    const finalTalent = Array.from(map.values());
    localStorage.setItem(key, JSON.stringify(finalTalent));
    return finalTalent;
  } catch (err) {
    console.warn("[ProjectStore] syncTalentVaultWithSupabase error:", err);
    return getTalentVault();
  }
}

/**
 * Loads scratchpad notes for a given project or studio-wide for the active account.
 */
export function getScratchpadNotes(projectId?: string): ScratchpadNote[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getScratchpadStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const notes: ScratchpadNote[] = JSON.parse(raw);
    if (projectId) {
      return notes.filter((n) => !n.projectId || n.projectId === projectId);
    }
    return notes;
  } catch (err) {
    console.error("Failed to load scratchpad notes:", err);
    return [];
  }
}

/**
 * Saves or updates a scratchpad note with background Supabase sync.
 */
export function saveScratchpadNote(note: ScratchpadNote): void {
  if (typeof window === "undefined") return;
  try {
    const key = getScratchpadStorageKey();
    const notes = getScratchpadNotes();
    const uid = getActiveUserId();
    const noteWithUser: ScratchpadNote = {
      ...note,
      userId: note.userId || uid || undefined,
    };
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      notes[idx] = noteWithUser;
    } else {
      notes.unshift(noteWithUser);
    }
    localStorage.setItem(key, JSON.stringify(notes));

    // Asynchronously sync with Supabase
    fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(noteWithUser),
    }).catch(() => {});
  } catch (err) {
    console.error("Failed to save scratchpad note:", err);
  }
}

/**
 * Synchronizes scratchpad notes with Supabase.
 */
export async function syncScratchpadNotesWithSupabase(projectId?: string): Promise<ScratchpadNote[]> {
  if (typeof window === "undefined") return getScratchpadNotes(projectId);
  try {
    const url = projectId ? `/api/notes?projectId=${encodeURIComponent(projectId)}` : "/api/notes";
    const res = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) return getScratchpadNotes(projectId);
    const data = await res.json();
    if (!data || !Array.isArray(data.notes)) {
      return getScratchpadNotes(projectId);
    }

    const key = getScratchpadStorageKey();
    const localNotes = getScratchpadNotes();
    const map = new Map<string, ScratchpadNote>();
    for (const n of localNotes) map.set(n.id, n);
    for (const remote of data.notes) {
      map.set(remote.id, remote);
    }
    const finalNotes = Array.from(map.values());
    localStorage.setItem(key, JSON.stringify(finalNotes));
    return projectId ? finalNotes.filter((n) => !n.projectId || n.projectId === projectId) : finalNotes;
  } catch (err) {
    console.warn("[ProjectStore] syncScratchpadNotesWithSupabase error:", err);
    return getScratchpadNotes(projectId);
  }
}

/**
 * Deletes a scratchpad note by ID with background Supabase sync.
 */
export function deleteScratchpadNote(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getScratchpadStorageKey();
    const notes = getScratchpadNotes().filter((n) => n.id !== id);
    localStorage.setItem(key, JSON.stringify(notes));

    // Asynchronously delete from Supabase
    fetch(`/api/notes?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    }).catch(() => {});
  } catch (err) {
    console.error("Failed to delete scratchpad note:", err);
  }
}


/**
 * Gets all saved video takes for a given project.
 */
export function getVideoTakes(projectId: string): VideoTake[] {
  const project = getProjectById(projectId);
  if (!project) return [];
  return project.videoTakes || [];
}

/**
 * Saves a newly rendered or existing video take to the project's permanent take vault.
 */
export function saveVideoTake(
  projectId: string,
  takeData: Omit<VideoTake, "id" | "takeNumber" | "createdAt"> & { id?: string; takeNumber?: number }
): VideoTake {
  const project = getProjectById(projectId);
  const currentTakes = project?.videoTakes || [];
  const nextNum = takeData.takeNumber || currentTakes.length + 1;

  const newTake: VideoTake = {
    id: takeData.id || `take-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    takeNumber: nextNum,
    title: takeData.title || `${project?.sceneTitle || "Scene"} — Take ${String(nextNum).padStart(2, "0")}`,
    cameraMotion: takeData.cameraMotion,
    stylePreset: takeData.stylePreset,
    durationSec: takeData.durationSec || 6,
    createdAt: Date.now(),
    videoUrl: takeData.videoUrl,
    prompt: takeData.prompt,
    characterName: takeData.characterName,
    isMaster: takeData.isMaster ?? (currentTakes.length === 0),
  };

  if (!project) return newTake;

  const updatedTakes = [newTake, ...currentTakes];
  const updatedProject: ProjectData = {
    ...project,
    activeVideoUrl: newTake.isMaster ? newTake.videoUrl : (project.activeVideoUrl || newTake.videoUrl),
    videoTakes: updatedTakes,
  };

  saveProject(updatedProject);
  return newTake;
}

/**
 * Marks a specific video take as the master take for a project.
 */
export function setMasterVideoTake(projectId: string, takeId: string): void {
  const project = getProjectById(projectId);
  if (!project || !project.videoTakes) return;

  let targetUrl = project.activeVideoUrl;
  const updatedTakes = project.videoTakes.map((t) => {
    if (t.id === takeId) {
      targetUrl = t.videoUrl;
      return { ...t, isMaster: true };
    }
    return { ...t, isMaster: false };
  });

  saveProject({
    ...project,
    activeVideoUrl: targetUrl,
    videoTakes: updatedTakes,
  });
}

/**
 * Deletes a video take from the project's saved vault.
 */
export function deleteVideoTake(projectId: string, takeId: string): void {
  const project = getProjectById(projectId);
  if (!project || !project.videoTakes) return;

  const filtered = project.videoTakes.filter((t) => t.id !== takeId);
  const updatedProject: ProjectData = {
    ...project,
    videoTakes: filtered,
    activeVideoUrl:
      project.activeVideoUrl === project.videoTakes.find((t) => t.id === takeId)?.videoUrl
        ? filtered[0]?.videoUrl || "/videos/vault_heist_take_01.mp4"
        : project.activeVideoUrl,
  };

  saveProject(updatedProject);
}

export interface NodeCallbacks {
  onOpenHotSeat?: (charName: string) => void;
  onGenerateDraft?: () => void;
  onViewScript?: () => void;
  onOpenDeck?: (subTab: "blocking" | "tension" | "territory" | "stripboard") => void;
  onOpenTableRead?: () => void;
  onOpenHeatmap?: () => void;
  onRunChemistry?: () => void;
  onTweakDials?: (charName: string, dials: { confidence: number; speed: number; subtext: number }) => void;
}

/**
 * Dynamically builds a full blueprint node graph (nodes & edges) tailored
 * directly to the project's title, genre, screenplay, and characters.
 */
export function buildProjectNodesAndEdges(
  project: ProjectData,
  callbacks?: NodeCallbacks,
  isGenerating?: boolean
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const chars = project.characters && project.characters.length > 0 ? project.characters : SEED_PROJECTS[0].characters;
  const mainCharA = chars[0];
  const mainCharB = chars[1] || chars[0];

  // 1. YouTube Reference / Style Clip Node
  const isSciFi = project.genre.toLowerCase().includes("sci-fi") || project.genre.toLowerCase().includes("space");
  const isHeist = project.genre.toLowerCase().includes("heist") || project.genre.toLowerCase().includes("crime");
  
  let clipTitle = "Fincher / Deakins Lighting Study";
  let clipStyle = "High-contrast rim lighting, cool anamorphic flare, clinical shadows";
  let clipPalette = ["#090d16", "#1e293b", "#38bdf8", "#f59e0b", "#e11d48"];
  if (isSciFi) {
    clipTitle = "Ridley Scott / Tarkovsky Vacuum Study";
    clipStyle = "High-contrast vacuum strobes, amber warning halos, atmospheric haze";
    clipPalette = ["#050811", "#1e1b4b", "#f59e0b", "#ef4444", "#38bdf8"];
  } else if (isHeist) {
    clipTitle = "Michael Mann Lighting Study";
    clipStyle = "Low-key chiaroscuro, sodium-vapor halo, cyan night kick";
    clipPalette = ["#0b132b", "#1c2541", "#3a506b", "#e09f3e", "#d62828"];
  }

  nodes.push({
    id: "node-clip-1",
    type: "clip",
    position: { x: -380, y: -40 },
    data: {
      title: clipTitle,
      url: "cinematic-study.mp4",
      timestampRange: "01:10 - 02:45",
      lightingStyle: clipStyle,
      palette: clipPalette,
      pacing: "Taut slow-burn escalating into psychological collision",
    },
  });

  // 2. Plot Seed Idea Note
  nodes.push({
    id: "node-note-1",
    type: "note",
    position: { x: -380, y: 220 },
    data: {
      noteType: "Core Premise",
      content: project.premise || "A high-stakes conflict unfolds under strict asymmetric time constraints.",
      audioDuration: "00:45",
    },
  });

  // 3. Dynamic Character Lab Nodes
  let currentY = 440;
  chars.slice(0, 3).forEach((char, idx) => {
    const actorNodeId = `node-actor-${char.name.toLowerCase()}`;
    const dialNodeId = `node-dial-${char.name.toLowerCase()}`;
    const quirkNodeId = `node-quirks-${char.name.toLowerCase()}`;
    const coreNodeId = `node-core-${char.name.toLowerCase()}`;

    // Actor comp node
    nodes.push({
      id: actorNodeId,
      type: "actor",
      position: { x: -380, y: currentY },
      data: {
        actorName: char.actorComp || (idx === 0 ? "Willem Dafoe Comp" : "Florence Pugh Comp"),
        roleReference: `Psychological Cadence Profile (${char.speechStyle || "staccato"})`,
        vocalWeight: char.speechStyle || "Sharp, defensive, calculated",
        energyProfile: char.archetype,
      },
    });

    // Personality dials node
    nodes.push({
      id: dialNodeId,
      type: "personality",
      position: { x: -380, y: currentY + 180 },
      data: {
        presetName: `${char.name} Behavioral Dial`,
        confidence: char.confidence ?? (idx === 0 ? 60 : 90),
        speed: char.verbalPacing ?? 75,
        subtext: 85,
        onTweak: (dials: { confidence: number; speed: number; subtext: number }) =>
          callbacks?.onTweakDials?.(char.name, dials),
      },
    });

    // Quirks node
    nodes.push({
      id: quirkNodeId,
      type: "quirks",
      position: { x: -380, y: currentY + 360 },
      data: {
        tics: char.quirks || [
          `Subtext ratio: ${char.subtextRatio || "high"}`,
          `Avoids direct answers when pressed on motives`,
        ],
      },
    });

    // Character Core Node
    nodes.push({
      id: coreNodeId,
      type: "characterCore",
      position: { x: 40, y: currentY + 40 },
      data: {
        name: char.name,
        archetype: char.archetype,
        objective: char.objective || "Uncover the secret without revealing their own hand",
        actorComp: char.actorComp || (idx === 0 ? "Lead Comp" : "Counter-Comp"),
        dialsSummary: char.dialsSummary || "Speed 75% · Subtext 85%",
        onOpenHotSeat: () => callbacks?.onOpenHotSeat?.(char.name),
      },
    });

    // Edges for this character
    edges.push({
      id: `e-act-${char.name.toLowerCase()}`,
      source: actorNodeId,
      target: coreNodeId,
      targetHandle: "actor_ref",
    });
    edges.push({
      id: `e-dial-${char.name.toLowerCase()}`,
      source: dialNodeId,
      target: coreNodeId,
      targetHandle: "personality",
    });
    edges.push({
      id: `e-quirk-${char.name.toLowerCase()}`,
      source: quirkNodeId,
      target: coreNodeId,
      targetHandle: "quirks",
    });

    // Edge from character to scene master
    edges.push({
      id: `e-char-scene-${char.name.toLowerCase()}`,
      source: coreNodeId,
      target: "node-scene-1",
      targetHandle: "character_in",
    });

    currentY += 580;
  });

  // 4. Chemistry Bench Sandbox Node
  nodes.push({
    id: "node-chemistry-1",
    type: "chemistry",
    position: { x: 480, y: 800 },
    data: {
      scenario: `${mainCharA.name} and ${mainCharB.name} trapped together with a ticking deadline`,
      onRunChemistry: callbacks?.onRunChemistry,
    },
  });

  if (chars[0]) {
    edges.push({
      id: "e-chem-a",
      source: `node-core-${chars[0].name.toLowerCase()}`,
      target: "node-chemistry-1",
      targetHandle: "char_a",
    });
  }
  if (chars[1]) {
    edges.push({
      id: "e-chem-b",
      source: `node-core-${chars[1].name.toLowerCase()}`,
      target: "node-chemistry-1",
      targetHandle: "char_b",
    });
  }

  // 5. Scene Master Node
  nodes.push({
    id: "node-scene-1",
    type: "scene",
    position: { x: 480, y: 80 },
    data: {
      title: project.sceneTitle || `${project.title} — Master Scene`,
      slugline: project.screenplayText ? (project.screenplayText.match(/(INT\.|EXT\.)[^\n]+/)?.[0] || "INT. SCENE - NIGHT") : "INT. PRODUCTION - NIGHT",
      stakes: project.sceneSummary || project.premise,
      state: isGenerating ? "generating" : "ready",
      characterCount: chars.length,
      hasStyleRef: true,
      onGenerateDraft: callbacks?.onGenerateDraft,
      onViewScript: callbacks?.onViewScript,
    },
  });

  edges.push({
    id: "e-clip-scene",
    source: "node-clip-1",
    target: "node-scene-1",
    targetHandle: "style_ref",
  });
  edges.push({
    id: "e-note-scene",
    source: "node-note-1",
    target: "node-scene-1",
    targetHandle: "plot_seed",
  });

  // 6. Narrative: Screenplay Draft Node
  const wordCount = project.screenplayText ? project.screenplayText.trim().split(/\s+/).length : 0;
  nodes.push({
    id: "node-script-1",
    type: "script",
    position: { x: 920, y: 80 },
    data: {
      title: `${project.title} Script Draft`,
      previewText: project.screenplayText || "No screenplay drafted yet. Click Generate Draft on Scene Master to run Gemini 3.7 Flash.",
      wordCount,
      onViewScript: callbacks?.onViewScript,
    },
  });

  edges.push({
    id: "e-scene-script",
    source: "node-scene-1",
    target: "node-script-1",
    targetHandle: "script_in",
  });

  // 7. Visual & Production Suite Nodes
  nodes.push({
    id: "node-storyboard-1",
    type: "storyboard",
    position: { x: 1360, y: -80 },
    data: {
      prompt: `2.39:1 low-angle cinematic anamorphic frame: ${mainCharA.name} confronts ${mainCharB.name}; volumetric lighting and atmospheric tension.`,
      shotType: "2.39:1 Anamorphic Scope",
      lighting: clipStyle,
    },
  });

  nodes.push({
    id: "node-floorplan-1",
    type: "floorplan",
    position: { x: 1360, y: 160 },
    data: {
      sceneTitle: project.sceneTitle,
      cameraCount: 3,
      onOpenDeck: () => callbacks?.onOpenDeck?.("blocking"),
    },
  });

  nodes.push({
    id: "node-tension-1",
    type: "tensionCurve",
    position: { x: 1360, y: 380 },
    data: {
      // No peakTension here — the card shows "Not yet analyzed" until the
      // Tension Curve deck view actually runs an analysis for this scene.
      hasWarning: false,
      onOpenDeck: () => callbacks?.onOpenDeck?.("tension"),
    },
  });

  nodes.push({
    id: "node-tableread-1",
    type: "tableRead",
    position: { x: 1360, y: 600 },
    data: {
      voiceCount: Math.min(3, chars.length),
      onOpenPlayer: callbacks?.onOpenTableRead,
    },
  });

  nodes.push({
    id: "node-market-1",
    type: "market",
    position: { x: 1360, y: 820 },
    data: {
      // No globalScore/topTerritory here — the card shows "Not yet analyzed"
      // until the Territory Heatmap view actually runs a market prediction.
      onOpenHeatmap: callbacks?.onOpenHeatmap,
    },
  });

  edges.push({ id: "e-script-storyboard", source: "node-script-1", target: "node-storyboard-1", targetHandle: "script_in" });
  edges.push({ id: "e-script-floorplan", source: "node-script-1", target: "node-floorplan-1", targetHandle: "script_in" });
  edges.push({ id: "e-script-tension", source: "node-script-1", target: "node-tension-1", targetHandle: "script_in" });
  edges.push({ id: "e-script-tableread", source: "node-script-1", target: "node-tableread-1", targetHandle: "script_in" });
  edges.push({ id: "e-script-market", source: "node-script-1", target: "node-market-1", targetHandle: "script_in" });

  return { nodes, edges };
}
