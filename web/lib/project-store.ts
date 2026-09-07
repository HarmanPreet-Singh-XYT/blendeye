import type { Node, Edge } from "@xyflow/react";
import type { StoryEventMarker } from "@/components/cinema/timeline-scrubber";

export interface ProjectCharacter {
  name: string;
  archetype: string;
  speechStyle?: string;
  subtextRatio?: string;
  actorComp?: string;
  castingReasoning?: string;
  alternateCastingComp?: string;
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

export interface ShotContinuityBible {
  characterAppearance?: string;
  wardrobe?: string;
  location?: string;
  lighting?: string;
  timeOfDay?: string;
  blockingStart?: string;
  blockingEnd?: string;
}

export interface Shot {
  id: string;
  sceneId: string;
  sequenceIndex: number;
  shotNumber: number;
  shotType: string;
  cameraMovement: string;
  prompt: string;
  estimatedDurationSec: number;
  continuityBible?: ShotContinuityBible;
  status: "planned" | "generating" | "completed" | "error";
  videoUrl?: string;
  lastFrameUrl?: string;
  errorMessage?: string;
  createdAt: number;
}

export interface ShotSequenceJob {
  jobId: string;
  sceneId: string;
  status: "queued" | "running" | "completed" | "error";
  currentShotIndex: number;
  totalShots: number;
  shots: Shot[];
  createdAt: number;
  updatedAt: number;
  errorMessage?: string;
}

export interface ScoreTake {
  id: string;
  sceneId?: string;
  takeNumber: number;
  title: string;
  prompt: string;
  durationMode: "clip" | "pro";
  durationSec: number;
  createdAt: number;
  audioUrl: string;
  lyricsText?: string;
  isMaster?: boolean;
  scoreType?: "score" | "source" | "vocal";
  conditioningImageUrl?: string | null;
  conditioningImageUrls?: string[];
  responseModalities?: string[];
  instruments?: string[];
  dynamicArc?: string;
  model?: string;
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

export type SupportedCurrency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY";
export type BudgetCapPolicy = "advisory" | "hard_block";

export interface FilmPrecedent {
  film: string;
  director: string;
  why: string;
}

export interface ScoreBreakdown {
  budget_fit: number;
  creative_fit: number;
  shootability: number;
  consolidation_bonus: number;
}

export interface EstimatedCost {
  day_rate: number;
  permit_fee: number;
  currency: SupportedCurrency;
  notes?: string;
}

export interface LocationSource {
  title: string;
  url: string;
}

export interface DetailedCostItem {
  day_rate: number;
  permit_fee: number;
  fire_or_police_monitor?: number;
  security_or_site_rep?: number;
  basecamp_parking?: number;
  cleaning_deposit?: number;
  crew_travel_zone?: string;
  total_comprehensive?: number;
}

export interface FilmmakerReview {
  author: string;
  role: string;
  rating: number;
  date?: string;
  quote: string;
  project_type?: string;
}

export interface LocalProductionEconomy {
  studio_zone_status: string;
  tax_incentive?: string;
  nearby_vendors?: string[];
  accommodations_and_crew_hub?: string;
}

export type StageType =
  | "practical"
  | "soundstage"
  | "greenscreen_cyc"
  | "bluescreen_cyc"
  | "virtual_production"
  | "custom_build";

export interface StageSpecs {
  stage_type: StageType;
  grid_height?: string; // e.g. "24 ft clearance to lighting perms"
  square_footage?: number; // e.g. 4500
  dimensions?: string; // e.g. "60' x 45' x 24'H"
  cyc_type?: "none" | "green_screen" | "blue_screen" | "white_cyc" | "blackout" | "led_volume";
  cyc_dimensions?: string; // e.g. "3-wall infinite green cyc (45'W x 35'D x 20'H)"
  lighting_grid?: string; // e.g. "Motorized DMX truss with pre-hung Arri SkyPanel space lights"
  power_capacity?: string; // e.g. "1200A 3-Phase Camlock distribution"
  sound_rating?: string; // e.g. "NC-25 Sound Isolated (Certified Soundstage)"
  load_in_access?: string; // e.g. "14' x 16' Elephant Door with drive-in vehicle ramp"
  paint_or_restoration_fee?: number; // e.g. 500 (chroma green fresh coat / restoration fee)
  virtual_production_engine?: string; // e.g. "Unreal Engine 5.4 / Brompton SX40 / Disguise vx4"
  custom_set_notes?: string;
}

export interface LocationCandidate {
  candidate_id: string;
  name: string;
  region: string;
  category: string;
  rank_score: number;
  score_breakdown: ScoreBreakdown;
  estimated_cost: EstimatedCost;
  shared_with_scenes: string[];
  film_precedents: FilmPrecedent[];
  practical_notes: string;
  sources: LocationSource[];
  search_grounded: boolean;

  // In-depth production parameters
  pros?: string[];
  cons?: string[];
  reviews?: FilmmakerReview[];
  detailed_costs?: DetailedCostItem;
  local_economy?: LocalProductionEconomy;
  sound_and_acoustics?: string;
  power_specs?: string;

  // Studio & Green Screen Stage Specifications
  stage_specs?: StageSpecs;
  environment_type?: "practical" | "studio_stage" | "green_screen" | "virtual_production" | "custom_build";

  // Cinematic Scene Visual Preview Keyframe
  preview_image_url?: string;
  preview_image_prompt?: string;
  preview_style_preset?: string;
  preview_camera_framing?: string;
  gallery_images?: Array<{
    id: string;
    url: string;
    prompt?: string;
    style_preset?: string;
    camera_framing?: string;
    createdAt?: number;
    title?: string;
  }>;
}

export interface LocationCluster {
  cluster_id: string;
  name: string;
  region: string;
  category: string;
  scene_ids: string[];
  candidate_id: string;
  notes: string;
  estimated_savings?: string;
}

export interface ProjectBudgetAllocation {
  locationsPct: number;
  locationsAmount?: number;
  [key: string]: unknown;
}

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
};

export function formatCurrency(amount: number, currency: SupportedCurrency = "USD"): string {
  const sym = CURRENCY_SYMBOLS[currency] || "$";
  if (amount >= 1_000_000) {
    return `${sym}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${sym}${(amount / 1_000).toFixed(0)}K`;
  }
  return `${sym}${Math.round(amount).toLocaleString()}`;
}

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
  shootRegion?: string; // per-scene regional/location override
  locationBudget?: number; // per-scene budget override
  selectedLocationCandidateId?: string;
  locationCandidates?: LocationCandidate[];
  preview_image_url?: string;
  sceneImages?: Array<{
    id: string;
    url: string;
    prompt: string;
    createdAt: number;
    title?: string;
    source?: "location" | "custom" | "veo_ref";
  }>;
  nodes?: Node[];
  edges?: Edge[];
  events?: StoryEventMarker[];
  activeScoreUrl?: string;
  scoreTakes?: ScoreTake[];
  shots?: Shot[];
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
  shootRegion?: string; // production base city / region (e.g. "Los Angeles, CA")
  currency?: SupportedCurrency;
  budget?: number; // total production budget
  budgetPerShootDayUsd?: number; // day rate in project currency
  budgetAllocation?: ProjectBudgetAllocation;
  budgetCapPolicy?: BudgetCapPolicy; // "advisory" | "hard_block"
  locationClusters?: LocationCluster[];
  targetTerritories?: string[];
  povScripts?: Record<string, string>; // characterName -> POV script
  scratchpadNotes?: ScratchpadNote[];
  activeSequenceJob?: ShotSequenceJob;
  activeVideoUrl?: string;
  videoTakes?: VideoTake[];
  activeScoreUrl?: string;
  scoreTakes?: ScoreTake[];
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
    currency: "USD",
    budget: 850_000,
    budgetPerShootDayUsd: 85_000,
    shootRegion: "Los Angeles, CA",
    budgetCapPolicy: "advisory",
    budgetAllocation: {
      locationsPct: 15,
      locationsAmount: 127_500,
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
    characters: [
      {
        name: "Marcus",
        archetype: "Getaway driver, loyal but rattles easily under pressure",
        speechStyle: "terse, breathless, defensive",
        subtextRatio: "high",
        actorComp: "Willem Dafoe",
        castingReasoning: "Raw nervous intensity and kinetic vulnerability under pressure",
        objective: "Locate missing vault bypass keys before vents cycle",
        dialsSummary: "Speed 80% · Subtext 70%",
        quirks: ["Fidgets with silver zippo", "Avoids direct eye contact when panicked"],
        confidence: 0.6,
        verbalPacing: 0.85,
        visualDescription: "Mid-30s, sharp angular jaw, sweat-streaked brow, anxious hollow eyes, stubble, intense gaze, cinematic 85mm anamorphic portrait",
        wardrobe: "Olive-drab tactical harness over charcoal waffle-knit thermal, reinforced ripstop cargo trousers, fingerless tactical gloves, worn combat boots",
        imageUrl: "/cinema/characters/marcus_portrait.jpg",
        fullBodyImageUrl: "/cinema/characters/marcus_portrait.jpg",
      },
      {
        name: "Elena",
        archetype: "Mastermind, calculated, concealing a private syndicate deal",
        speechStyle: "measured, icy, dismissive",
        subtextRatio: "extreme",
        actorComp: "Florence Pugh / Cate Blanchett",
        castingReasoning: "Aristocratic poise, razor-sharp stillness, chilling emotional detachment",
        objective: "Hold Marcus in place until syndicate extraction window arrives",
        dialsSummary: "Confidence 95% · Subtext 95%",
        quirks: ["Checks chronograph with unblinking stillness", "Speaks in quiet monotones"],
        confidence: 0.95,
        verbalPacing: 0.65,
        visualDescription: "Early 40s, poised aristocratic facial features, pale skin, piercing icy hazel eyes, slicked-back dark hair, micro-expressions of calculated detachment",
        wardrobe: "Tailored charcoal wool trench coat with high structured lapels, matte black cashmere turtleneck, dark leather gloves, vintage Omega chronograph",
        imageUrl: "/cinema/characters/elena_portrait.jpg",
        fullBodyImageUrl: "/cinema/characters/elena_portrait.jpg",
      },
      {
        name: "Teo",
        archetype: "Perimeter muscle, stationed outside by the tunnel",
        speechStyle: "casual, street-smart, impatient",
        subtextRatio: "low",
        actorComp: "Oscar Isaac",
        castingReasoning: "Grounded street charisma with sudden physical presence and watchful eyes",
        objective: "Keep tunnel clear of transit police until extraction",
        dialsSummary: "Confidence 80% · Subtext 20%",
        quirks: ["Chews matchsticks", "Taps radio antenna against bulkhead"],
        confidence: 0.8,
        verbalPacing: 0.7,
        visualDescription: "Late 20s, observant gaze, athletic build, light scar across cheekbone, watchful posture",
        wardrobe: "Weathered navy bomber jacket with utility sleeve pocket, heavy utility denim, combat boots, tactical spiral acoustic earpiece",
        imageUrl: "/cinema/characters/teo_portrait.jpg",
        fullBodyImageUrl: "/cinema/characters/teo_portrait.jpg",
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
        title: "The Vault — Take 01 (Master)",
        cameraMotion: "Slow Cinematic Dolly In",
        stylePreset: "35mm Anamorphic Film, 2.39:1 Scope",
        durationSec: 6,
        createdAt: 1725400000000,
        videoUrl: "/videos/vault_heist_take_01.mp4",
        prompt: "Cinematic 2.39:1 anamorphic establishing push on Marcus kneeling over canvas gear bag before reinforced safe deposit boxes while Elena monitors glowing countdown timer.",
        characterName: "Marcus & Elena",
        isMaster: true,
      },
      {
        id: "take-vault-02",
        takeNumber: 2,
        title: "The Van Perimeter — Take 02",
        cameraMotion: "Handheld Surveillance Medium",
        stylePreset: "Neo-Noir CRT Phosphor Glow",
        durationSec: 6,
        createdAt: 1725400300000,
        videoUrl: "/videos/vault_heist_take_02.mp4",
        prompt: "Teo monitoring transit police scanner waveforms inside cramped tactical surveillance van with green CRT glow.",
        characterName: "Teo",
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
    locationClusters: [
      {
        cluster_id: "cluster-vault-core",
        name: "Downtown Financial District & Sub-Level Hub",
        region: "Los Angeles, CA",
        category: "vault / commercial / tunnel",
        scene_ids: ["vault-sc-01", "vault-sc-02", "vault-sc-03"],
        candidate_id: "loc-vault-650-spring",
        notes: "Consolidating Roadside Briefing, Van Staging, and Vault Breach within DTLA Historic Core saves 3 company moves and shared heavy generator rentals.",
        estimated_savings: "$18,500 in transit, secondary basecamp parking, and multi-permit filing fees",
      },
      {
        cluster_id: "cluster-occidental-precinct",
        name: "Hollywood Soundstage Interrogation Hub",
        region: "Hollywood, CA",
        category: "soundstage / precinct",
        scene_ids: ["vault-sc-04"],
        candidate_id: "loc-occidental-soundstage",
        notes: "Turnkey precinct interrogation standing set with two-way mirror eliminates custom construction costs.",
        estimated_savings: "$12,000 in set construction and practical lighting rigging",
      },
    ],
    scratchpadNotes: [
      {
        id: "note-vh-01",
        title: "Fincher / Deakins Lighting Bible for Sub-Level Vault",
        content: "Key visual references: Panic Room (2002) and The Social Network. Maintain a cold cyan emergency baseline (#0b132b) with sodium amber highlights (#e09f3e). Key Marcus with high-contrast rim lighting to exaggerate sweat and exhaustion on his brow. Keep Elena silhouetted against the glowing vault electronic timer.",
        category: "concept",
        createdAt: 1725400010000,
      },
      {
        id: "note-vh-02",
        title: "Elena's Micro-Tells: Chronograph Tap & Gaze Avoidance",
        content: "Elena never looks directly at Marcus once the timer starts. She taps the casing of her Omega chronograph every 45 seconds—a calculated behavioral anchor keeping her calm while executing the syndicate extraction timetable. Instruct Florence Pugh comp to keep vocal volume at a whisper.",
        category: "character",
        createdAt: 1725400020000,
      },
      {
        id: "note-vh-03",
        title: "Marcus Breakdown Cadence at 00:34:00",
        content: "At minute 34, Marcus transitions from kinetic burglar rhythm to sheer panic. He must physically dump the canvas gear bag onto the vault floor—letting tools, tension picks, and zip-ties spill with loud metallic impact. His breath should be audible between sentences.",
        category: "dialogue",
        createdAt: 1725400030000,
      },
      {
        id: "note-vh-04",
        title: "Pacing Shift: Roadside Diner to Vault Decompression",
        content: "Scene 1 is slow, steady, 50mm locked-off conversational master. Scene 2 accelerates inside the surveillance van with vibrating handheld camera motion. Scene 3 inside the vault should feel like a vice tightening—every minute lost reduces breathing room.",
        category: "scene",
        createdAt: 1725400040000,
      },
    ],
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
        preview_image_url: "/cinema/scenes/vault_sc_01.jpg",
        selectedLocationCandidateId: "loc-lacy-street-stage3",
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
        sceneImages: [
          {
            id: "img-vsc01-1",
            url: "/cinema/scenes/vault_sc_01.jpg",
            prompt: "2.39:1 anamorphic still: Elena in dark wool trench coat sliding blueprint across laminate diner booth table to Marcus, neon rain-streaked window behind.",
            createdAt: 1725400010000,
            title: "Elena Blueprint Reveal",
            source: "location",
          },
        ],
        locationCandidates: [
          {
            candidate_id: "loc-lacy-street-stage3",
            name: "Lacy Street Production Center — Stage 3 Standing Diner & Tunnels",
            region: "Los Angeles, CA (DTLA / Chinatown)",
            category: "soundstage / standing-set",
            environment_type: "studio_stage",
            preview_image_url: "/cinema/locations/loc_lacy_street.jpg",
            rank_score: 93,
            score_breakdown: { budget_fit: 0.94, creative_fit: 0.91, shootability: 0.97, consolidation_bonus: 0.9 },
            estimated_cost: { day_rate: 5200, permit_fee: 750, currency: "USD", notes: "Includes stage manager and private staging parking lot" },
            detailed_costs: { day_rate: 5200, permit_fee: 750, fire_or_police_monitor: 450, security_or_site_rep: 350, basecamp_parking: 300, cleaning_deposit: 500, crew_travel_zone: "Inside 30-Mile Studio Zone", total_comprehensive: 7550 },
            stage_specs: { stage_type: "soundstage", grid_height: "22 ft clear to perms", square_footage: 6800, dimensions: "85' x 80' x 22'H", lighting_grid: "Pre-hung pipe grid on 4ft centers with distributed DMX", power_capacity: "1200A 3-Phase Camlock distribution panel", sound_rating: "NC-25 Sound Stage Certified", load_in_access: "12' x 14' Roll-up elephant door" },
            local_economy: { studio_zone_status: "In-Zone (30-Mile TMZ)", tax_incentive: "California 25% qualified spend credit", nearby_vendors: ["Hollywood Rentals (3.1 mi)", "Wooden Nickel Lighting (4.5 mi)"], accommodations_and_crew_hub: "Direct access to I-5 and 110 freeway corridor; secure 50-vehicle basecamp" },
            practical_notes: "Includes standing brick corridor and concrete service tunnel set pieces that can double for getaway escape route.",
            reviews: [{ author: "Rachel Chen", role: "Production Designer", rating: 4.8, quote: "The roll-up door allows driving a real cargo van directly onto the stage floor for seamless van surveillance shots." }],
            film_precedents: [{ film: "Drive (2011)", director: "Nicolas Winding Refn", why: "Low sodium-vapor lighting and gritty downtown warehouse texture" }],
            pros: ["Drive-in vehicle access directly to stage", "Wild walls on tunnel sections allow optimal camera dolly tracks", "Ample 1200A power reduces generator expense"],
            cons: ["Diner interior requires practical rain rig outside faux window", "Slight ambient train noise on track schedule"],
            sources: [{ title: "Lacy Street Studio Specs", url: "https://www.lacystreet.com" }],
            search_grounded: true,
            shared_with_scenes: ["vault-sc-01", "vault-sc-02"],
          },
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
        preview_image_url: "/cinema/scenes/vault_sc_02.jpg",
        selectedLocationCandidateId: "loc-lacy-street-stage3",
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
        sceneImages: [
          {
            id: "img-vsc02-1",
            url: "/cinema/scenes/vault_sc_02.jpg",
            prompt: "2.39:1 anamorphic still: Teo chewing matchstick in driver seat of tactical surveillance van surrounded by green CRT monitors and police scanners.",
            createdAt: 1725400020000,
            title: "Teo Radio Surveillance",
            source: "location",
          },
        ],
        locationCandidates: [
          {
            candidate_id: "loc-lacy-street-stage3",
            name: "Lacy Street Production Center — Stage 3 & Sub-Tunnels",
            region: "Los Angeles, CA (DTLA / Chinatown)",
            category: "soundstage / standing-set",
            environment_type: "studio_stage",
            preview_image_url: "/cinema/locations/loc_lacy_street.jpg",
            rank_score: 93,
            score_breakdown: { budget_fit: 0.94, creative_fit: 0.91, shootability: 0.97, consolidation_bonus: 0.9 },
            estimated_cost: { day_rate: 5200, permit_fee: 750, currency: "USD", notes: "Includes stage manager and private staging parking lot" },
            detailed_costs: { day_rate: 5200, permit_fee: 750, fire_or_police_monitor: 450, security_or_site_rep: 350, basecamp_parking: 300, cleaning_deposit: 500, crew_travel_zone: "Inside 30-Mile Studio Zone", total_comprehensive: 7550 },
            stage_specs: { stage_type: "soundstage", grid_height: "22 ft clear to perms", square_footage: 6800, dimensions: "85' x 80' x 22'H", lighting_grid: "Pre-hung pipe grid on 4ft centers with distributed DMX", power_capacity: "1200A 3-Phase Camlock distribution panel", sound_rating: "NC-25 Sound Stage Certified", load_in_access: "12' x 14' Roll-up elephant door" },
            local_economy: { studio_zone_status: "In-Zone (30-Mile TMZ)", tax_incentive: "California 25% qualified spend credit", nearby_vendors: ["Hollywood Rentals (3.1 mi)", "Wooden Nickel Lighting (4.5 mi)"], accommodations_and_crew_hub: "Direct access to I-5 and 110 freeway corridor; secure 50-vehicle basecamp" },
            practical_notes: "Includes standing brick corridor and concrete service tunnel set pieces that double for getaway escape route.",
            reviews: [{ author: "Rachel Chen", role: "Production Designer", rating: 4.8, quote: "The roll-up door allows driving a real cargo van directly onto the stage floor for seamless van surveillance shots." }],
            film_precedents: [{ film: "Drive (2011)", director: "Nicolas Winding Refn", why: "Low sodium-vapor lighting and gritty downtown warehouse texture" }],
            pros: ["Drive-in vehicle access directly to stage", "Wild walls on tunnel sections allow optimal camera dolly tracks", "Ample 1200A power reduces generator expense"],
            cons: ["Requires set dressing and prop lockboxes", "Slight ambient train noise on track schedule"],
            sources: [{ title: "Lacy Street Studio Specs", url: "https://www.lacystreet.com" }],
            search_grounded: true,
            shared_with_scenes: ["vault-sc-01", "vault-sc-02"],
          },
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
        preview_image_url: "/cinema/scenes/vault_sc_03.jpg",
        selectedLocationCandidateId: "loc-vault-650-spring",
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
        sceneImages: [
          {
            id: "img-vsc03-1",
            url: "/cinema/scenes/vault_sc_03.jpg",
            prompt: "2.39:1 anamorphic still: Marcus kneeling before safety deposit boxes with bag dumped on concrete floor, Elena standing cold over red electronic countdown timer.",
            createdAt: 1725400030000,
            title: "Vault Key Confrontation",
            source: "location",
          },
        ],
        locationCandidates: [
          {
            candidate_id: "loc-vault-650-spring",
            name: "The Los Angeles Vault at 650 S Spring",
            region: "Los Angeles, CA (Historic Core DTLA)",
            category: "vault / commercial",
            environment_type: "practical",
            preview_image_url: "/cinema/locations/loc_la_vault.jpg",
            rank_score: 96,
            score_breakdown: { budget_fit: 0.92, creative_fit: 0.99, shootability: 0.95, consolidation_bonus: 0.98 },
            estimated_cost: { day_rate: 6500, permit_fee: 850, currency: "USD", notes: "Standard 12-hour day rate including site representative" },
            detailed_costs: { day_rate: 6500, permit_fee: 850, fire_or_police_monitor: 650, security_or_site_rep: 400, basecamp_parking: 600, cleaning_deposit: 750, crew_travel_zone: "Inside 30-Mile Studio Zone (Zero crew per diem)", total_comprehensive: 9750 },
            stage_specs: { stage_type: "practical", grid_height: "16 ft subterranean vault ceiling", square_footage: 4200, power_capacity: "400A 3-Phase Camlock tie-in in utility room", sound_rating: "NC-20 Natural Subterranean Isolation (Zero street rumble)", load_in_access: "Freight elevator from alley loading dock (6,000 lb capacity)" },
            local_economy: { studio_zone_status: "In-Zone (30-Mile TMZ)", tax_incentive: "California Film Commission 20-25% Independent Film Tax Credit", nearby_vendors: ["Panavision Hollywood (5.8 mi)", "Quixote Grip & Lighting (3.2 mi)", "Cinelease LA (2.4 mi)"], accommodations_and_crew_hub: "Ace Hotel DTLA and Proper Hotel within 4 blocks with dedicated production rates" },
            practical_notes: "Original 1920s reinforced concrete and 18-ton steel vault door intact. Working emergency dial indicators and dual-combination lock mechanisms. Night filming allowed with standard FilmLA downtown rider.",
            reviews: [{ author: "Marcus Vance", role: "Supervising Location Manager (Heat / The Town)", rating: 4.9, quote: "The heavy vault door is 100% authentic and balances on precision hinges. Perfect acoustics for dialogue; we recorded zero sound bleed from Spring Street." }],
            film_precedents: [{ film: "Heat (1995)", director: "Michael Mann", why: "Contained architectural tension, cold metallic blue bounce, high procedural realism" }, { film: "Inside Man (2006)", director: "Spike Lee", why: "Heavy security geometry and confined psychological pressure" }],
            pros: ["Original 18-ton circular bank vault blast door", "Acoustically soundproof subterranean basement", "Existing industrial conduit and emergency battery lighting", "Zero studio zone travel fees for IATSE crew"],
            cons: ["Freight elevator only for heavy lighting gear", "Strict 65-person basement occupancy cap"],
            sources: [{ title: "FilmLA Historic Financial District Registry", url: "https://www.filmla.com" }],
            search_grounded: true,
            shared_with_scenes: ["vault-sc-03"],
          },
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
        preview_image_url: "/cinema/scenes/vault_sc_04.jpg",
        selectedLocationCandidateId: "loc-occidental-soundstage",
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
        sceneImages: [
          {
            id: "img-vsc04-1",
            url: "/cinema/scenes/vault_sc_04.jpg",
            prompt: "2.39:1 anamorphic still: Handcuffed suspect under harsh interrogation lights staring down at scratched steel table as truth of the double-cross dawns on his face.",
            createdAt: 1725400040000,
            title: "Precinct Interrogation Revelation",
            source: "location",
          },
        ],
        locationCandidates: [
          {
            candidate_id: "loc-occidental-soundstage",
            name: "Occidental Studios — Stage A Standing Bank & Interrogation Set",
            region: "Hollywood, CA",
            category: "soundstage / built-set",
            environment_type: "studio_stage",
            preview_image_url: "/cinema/locations/loc_occidental.jpg",
            rank_score: 90,
            score_breakdown: { budget_fit: 0.88, creative_fit: 0.95, shootability: 0.94, consolidation_bonus: 0.85 },
            estimated_cost: { day_rate: 7200, permit_fee: 650, currency: "USD", notes: "Full standing precinct interrogation room and bank lobby package" },
            detailed_costs: { day_rate: 7200, permit_fee: 650, fire_or_police_monitor: 500, security_or_site_rep: 400, basecamp_parking: 450, cleaning_deposit: 600, crew_travel_zone: "Inside Hollywood Core (Zero travel fee)", total_comprehensive: 9800 },
            stage_specs: { stage_type: "soundstage", grid_height: "26 ft grid with catwalks", square_footage: 8500, dimensions: "100' x 85' x 26'H", cyc_type: "blackout", lighting_grid: "Motorized chain hoists and pre-rigged space lights", power_capacity: "2400A 3-Phase master studio supply", sound_rating: "NC-20 Premier Soundstage Certified", load_in_access: "Double drive-in elephant doors (16' x 18')" },
            local_economy: { studio_zone_status: "In-Zone Hollywood Core", tax_incentive: "California Film Credit Qualified Facility", nearby_vendors: ["ARRI Rental Burbank (7 mi)", "Mole-Richardson Hollywood (2 mi)"], accommodations_and_crew_hub: "Hollywood hotel district within 1.5 miles" },
            practical_notes: "Permanent two-way mirror glass with observation room pre-rigged for precinct interrogation scene (Scene 04). Pre-lit overhead fluorescent fixtures on dimmer boards.",
            reviews: [{ author: "David E. Miller", role: "Gaffer", rating: 4.9, quote: "The dimmer board is tied directly into every practical fixture on the interrogation room set, saving 2 hours of pre-lighting." }],
            film_precedents: [{ film: "Se7en (1995)", director: "David Fincher", why: "Oppressive fluorescent interrogation atmosphere and claustrophobic green-tinted shadows" }],
            pros: ["Turnkey interrogation room with authentic two-way mirror", "2400A studio power eliminates exterior generator permitting", "Dedicated hair/makeup suites and talent dressing rooms"],
            cons: ["Higher base day rate than raw industrial warehouse"],
            sources: [{ title: "Occidental Studios Catalog", url: "https://www.occidentalstudios.com" }],
            search_grounded: true,
            shared_with_scenes: ["vault-sc-04"],
          },
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
    currency: "USD",
    budget: 1_200_000,
    budgetPerShootDayUsd: 120_000,
    shootRegion: "Los Angeles, CA",
    budgetCapPolicy: "advisory",
    budgetAllocation: {
      locationsPct: 18,
      locationsAmount: 216_000,
    },
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
        castingReasoning: "Grounded gravitas and steely authority under catastrophic decompression",
        objective: "Isolate contaminated module and restore station pressure",
        dialsSummary: "Confidence 90% · Speed 70% · Subtext 30%",
        quirks: ["Constantly checks airlock pressure gauges", "Clipped military cadence"],
        confidence: 0.9,
        verbalPacing: 0.7,
        visualDescription: "Early 50s, battle-hardened mission commander, piercing eyes, NASA/ESA deep space jumpsuit with mission insignia patch, intense authoritative presence",
        wardrobe: "Charcoal pressurized astronaut jumpsuit with gold mission patch, tactical utility harness, magnetic boots, worn communications headset",
        imageUrl: "/cinema/characters/vance_portrait.jpg",
        fullBodyImageUrl: "/cinema/characters/vance_portrait.jpg",
      },
      {
        name: "Ray",
        archetype: "Engineer, terrified, hiding an encounter with an unknown specimen",
        speechStyle: "stammering, evasive, desperate",
        subtextRatio: "extreme",
        actorComp: "Paul Dano / Ben Whishaw",
        castingReasoning: "Trembling vulnerability, high intellectual neurosis, hidden guilt",
        objective: "Conceal breach specimen until containment fails or crew evacuates",
        dialsSummary: "Confidence 25% · Speed 85% · Subtext 95%",
        quirks: ["Trembling hands gripped inside flight gloves", "Shallow hyperventilation"],
        confidence: 0.25,
        verbalPacing: 0.85,
        visualDescription: "Mid-30s, terrified orbital engineer, sweat glistening on brow, wide dilated pupils, trembling fingers hovering over life-support console",
        wardrobe: "Standard orbital engineer flight suit with thermal undershirt, unzipped collar, bio-monitor wristband with flashing red telemetry",
        imageUrl: "/cinema/characters/ray_portrait.jpg",
        fullBodyImageUrl: "/cinema/characters/ray_portrait.jpg",
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
        title: "Module 4 Airlock — Take 01 (Veo Zero-G Confrontation Master)",
        cameraMotion: "Handheld Zero-G Drift",
        stylePreset: "70mm IMAX High-Contrast Master",
        durationSec: 6,
        createdAt: 1725400100000,
        videoUrl: "/videos/space_airlock_take_01.mp4",
        prompt: "Cinematic medium two-shot in orbital research module under emergency decompression. Commander Vance in heavy tactical flight suit floats in zero gravity, grabbing a maintenance bulkhead as Specialist Ray stands rigid at the control terminal. Warning consoles pulse emergency amber. Deep space debris and venting ice crystals drift outside the reinforced viewing port.",
        characterName: "Commander Vance & Specialist Ray",
        isMaster: true,
      },
      {
        id: "take-space-02",
        takeNumber: 2,
        title: "Module 4 Airlock — Take 02 (Veo Native Generation)",
        cameraMotion: "Slow Forward Dolly Push",
        stylePreset: "Anamorphic Sci-Fi Noir",
        durationSec: 6,
        createdAt: 1725400150000,
        videoUrl: "/videos/veo_1296a5b186b2.mp4",
        prompt: "Emergency amber sirens pulse in zero gravity vacuum silence, debris drifting through module as Commander Vance confronts Specialist Ray.",
        characterName: "Commander Vance & Specialist Ray",
        isMaster: false,
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
    locationClusters: [
      {
        cluster_id: "cluster-space-volume",
        name: "Virtual Production & Standing Sci-Fi Stage Hub",
        region: "Los Angeles, CA",
        category: "virtual_production / soundstage",
        scene_ids: ["space-sc-01", "space-sc-02", "space-sc-03", "space-sc-04", "space-sc-05"],
        candidate_id: "loc-barstow-volume",
        notes: "Filming all orbital interiors on an LED Volume stage with pre-rendered Unreal Engine 5.4 backgrounds eliminates green-screen spill and reduces zero-g wire rig adjustments.",
        estimated_savings: "$28,000 in compositing VFX and wire rig recalibration",
      },
    ],
    scratchpadNotes: [
      {
        id: "note-space-01",
        title: "Villeneuve Acoustic Vacuum Rules: Zero Sound in Exterior Space",
        content: "Outside the orbital hull, absolute silence reigns. Inside Module 4, all sound is conducted mechanically through the metal bulkhead and the actors' magnetic boots. Sub-bass vibrations at 30Hz should pulse with the amber emergency beacon.",
        category: "concept",
        createdAt: 1725400110000,
      },
      {
        id: "note-space-02",
        title: "Ray's Contamination Progression (Subtext 95%)",
        content: "Ray's left wrist is swollen beneath his glove from the specimen puncture. He never removes his left glove and keeps his left arm tucked tight against his chest. Vance notices the asymmetry at minute 14.",
        category: "character",
        createdAt: 1725400120000,
      },
      {
        id: "note-space-03",
        title: "The Biometric Override Discovery",
        content: "Vance doesn't scream when he uncovers the access logs. He reads the alphanumeric timestamp with chilling military restraint: 'Zero-two-hundred hours. Ray, David J.' The horror comes from procedural certainty, not anger.",
        category: "dialogue",
        createdAt: 1725400130000,
      },
    ],
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
        preview_image_url: "/cinema/scenes/space_sc_01.jpg",
        selectedLocationCandidateId: "loc-barstow-volume",
        castPresent: ["Vance"],
        castRoles: {
          Vance: "Commanding officer verifying sudden catastrophic telemetry anomaly",
        },
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
        events: [
          { atSeconds: 4 * 60, characterName: "Vance", eventType: "known_fact" },
          { atSeconds: 6 * 60, characterName: "Vance", eventType: "known_fact" },
        ],
        sceneImages: [
          {
            id: "img-ssc01-1",
            url: "/cinema/scenes/space_sc_01.jpg",
            prompt: "2.39:1 anamorphic still: Commander Vance floating before glowing red telemetry canopy looking out into deep space starfield.",
            createdAt: 1725400110000,
            title: "Command Bridge Telemetry Alert",
            source: "location",
          },
        ],
        locationCandidates: [
          {
            candidate_id: "loc-barstow-volume",
            name: "Barstow Aerospace Volume — LED Virtual Production Stage",
            region: "Los Angeles County, CA",
            category: "virtual_production / led_volume",
            environment_type: "virtual_production",
            preview_image_url: "/cinema/locations/loc_barstow_volume.jpg",
            rank_score: 97,
            score_breakdown: { budget_fit: 0.91, creative_fit: 0.99, shootability: 0.98, consolidation_bonus: 0.98 },
            estimated_cost: { day_rate: 9500, permit_fee: 550, currency: "USD", notes: "Includes volume engineer and Brompton SX40 LED processor operator" },
            detailed_costs: { day_rate: 9500, permit_fee: 550, fire_or_police_monitor: 450, security_or_site_rep: 350, basecamp_parking: 400, cleaning_deposit: 600, crew_travel_zone: "Inside LA County Zone", total_comprehensive: 11850 },
            stage_specs: { stage_type: "virtual_production", grid_height: "28 ft ceiling with motorized wire-flying rigs", square_footage: 7500, dimensions: "80' diameter horseshoe LED curve (22'H)", cyc_type: "led_volume", cyc_dimensions: "270-degree wraparound LED wall (ROE Visual Black Pearl 2.8mm)", lighting_grid: "DMX-controlled ambient LED ceiling panels", power_capacity: "1600A 3-Phase Camlock", sound_rating: "NC-22 Certified Soundstage", virtual_production_engine: "Unreal Engine 5.4 / Brompton SX40 / Disguise vx4" },
            local_economy: { studio_zone_status: "In-Zone LA County", tax_incentive: "California 25% Film Tax Credit", nearby_vendors: ["Quixote Studios", "JL Fisher Dolly Rentals"], accommodations_and_crew_hub: "Valencia hotel corridor with crew parking" },
            practical_notes: "Pre-loaded with photorealistic orbital low-Earth orbit and zero-gravity research station virtual assets.",
            reviews: [{ author: "Kenji Sato", role: "VFX Supervisor (The Creator)", rating: 5.0, quote: "The in-camera lighting from the LED volume completely eliminates green reflections on astronaut visors." }],
            film_precedents: [{ film: "First Man (2018)", director: "Damien Chazelle", why: "In-camera LED projection providing authentic cockpit reflections and claustrophobia" }],
            pros: ["Zero green spill on shiny astronaut suits and glass visors", "Real-time parallax camera tracking with Mo-Sys StarTracker", "Integrated zero-g wire fly rigs pre-installed on perms"],
            cons: ["Requires high-end technical stage operator on daily rate"],
            sources: [{ title: "Barstow Volume Technical Specs", url: "https://www.barstowvirtual.com" }],
            search_grounded: true,
            shared_with_scenes: ["space-sc-01", "space-sc-02", "space-sc-03", "space-sc-04", "space-sc-05"],
          },
        ],
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
        preview_image_url: "/cinema/scenes/space_sc_02.jpg",
        selectedLocationCandidateId: "loc-barstow-volume",
        castPresent: ["Vance", "Ray"],
        castRoles: {
          Vance: "Interrogator cornering engineer while breathable atmosphere drops",
          Ray: "Panicked engineer hiding specimen breach behind life-support readout",
        },
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
        events: [
          { atSeconds: 12 * 60, characterName: "Vance", eventType: "known_fact" },
          { atSeconds: 14 * 60, characterName: "Ray", eventType: "known_fact" },
          { atSeconds: 15 * 60, characterName: "Vance", eventType: "unaware_of" },
        ],
        sceneImages: [
          {
            id: "img-ssc02-1",
            url: "/cinema/scenes/space_sc_02.jpg",
            prompt: "2.39:1 anamorphic still: Commander Vance gripping yellow emergency bar screaming at Engineer Ray seated in life-support seat with floating sparks and orange warning HUD.",
            createdAt: 1725400120000,
            title: "Airlock Zero-G Confrontation",
            source: "location",
          },
        ],
        locationCandidates: [
          {
            candidate_id: "loc-barstow-volume",
            name: "Barstow Aerospace Volume — LED Virtual Production Stage",
            region: "Los Angeles County, CA",
            category: "virtual_production / led_volume",
            environment_type: "virtual_production",
            preview_image_url: "/cinema/locations/loc_barstow_volume.jpg",
            rank_score: 97,
            score_breakdown: { budget_fit: 0.91, creative_fit: 0.99, shootability: 0.98, consolidation_bonus: 0.98 },
            estimated_cost: { day_rate: 9500, permit_fee: 550, currency: "USD", notes: "Includes volume engineer and Brompton SX40 LED processor operator" },
            detailed_costs: { day_rate: 9500, permit_fee: 550, fire_or_police_monitor: 450, security_or_site_rep: 350, basecamp_parking: 400, cleaning_deposit: 600, crew_travel_zone: "Inside LA County Zone", total_comprehensive: 11850 },
            stage_specs: { stage_type: "virtual_production", grid_height: "28 ft ceiling with motorized wire-flying rigs", square_footage: 7500, dimensions: "80' diameter horseshoe LED curve (22'H)", cyc_type: "led_volume", cyc_dimensions: "270-degree wraparound LED wall", lighting_grid: "DMX-controlled ambient LED ceiling panels", power_capacity: "1600A 3-Phase Camlock", sound_rating: "NC-22 Certified Soundstage" },
            local_economy: { studio_zone_status: "In-Zone LA County", tax_incentive: "California 25% Film Tax Credit", nearby_vendors: ["Quixote Studios", "JL Fisher Dolly Rentals"], accommodations_and_crew_hub: "Valencia hotel corridor with crew parking" },
            practical_notes: "Physical airlock door mockup placed directly inside LED Volume curve.",
            reviews: [{ author: "Kenji Sato", role: "VFX Supervisor", rating: 5.0, quote: "The interactive lighting from the amber strobe alerts reflected accurately across both suits." }],
            film_precedents: [{ film: "Alien (1979)", director: "Ridley Scott", why: "Chamber horror in claustrophobic engineering corridors" }],
            pros: ["Flawless interactive amber strobe lighting", "Physical airlock frame blends into digital background"],
            cons: ["Stage booking requires 3-week lead time"],
            sources: [{ title: "Barstow Volume Specs", url: "https://www.barstowvirtual.com" }],
            search_grounded: true,
            shared_with_scenes: ["space-sc-01", "space-sc-02"],
          },
        ],
      },
      {
        id: "space-sc-03",
        sceneNumber: 3,
        title: "The Specimen Chamber",
        slugline: "INT. HYDROPONICS & BIO-CONTAINMENT BAY - ZERO GRAVITY",
        summary: "Vance forces Ray to open the containment chamber; they find the primary culture vessel shattered from the inside.",
        startSeconds: 19 * 60,
        durationSeconds: 4 * 60,
        location: "Hydroponics Bio-Bay",
        preview_image_url: "/cinema/scenes/space_sc_03.jpg",
        selectedLocationCandidateId: "loc-barstow-volume",
        castPresent: ["Vance", "Ray"],
        castRoles: {
          Vance: "Demanding inspection of bio-specimen seals",
          Ray: "Shielding infected left arm while revealing broken container",
        },
        screenplayText: `INT. HYDROPONICS & BIO-CONTAINMENT BAY - ZERO GRAVITY

Green ultraviolet growth lamps flicker erratically. Condensation spheres float through the humid air.

Vance thrusts Ray forward toward the reinforced specimen vault.

VANCE
Key code, Ray. Punch it in.

Ray enters a five-digit cipher with trembling fingers. The vault pneumatic hiss releases.

Inside: the thick borosilicate containment flask is fractured. Amber fluid coats the rubber seal.

VANCE
Where is the sample?

RAY
(whispering, tears floating from his eyes)
It didn't escape, Commander. It nested.`,
        events: [
          { atSeconds: 19 * 60, characterName: "Vance", eventType: "known_fact" },
          { atSeconds: 21 * 60, characterName: "Ray", eventType: "known_fact" },
        ],
        sceneImages: [
          {
            id: "img-ssc03-1",
            url: "/cinema/scenes/space_sc_03.jpg",
            prompt: "2.39:1 anamorphic still: Shattered glass containment cylinder drifting in zero gravity amidst fluorescent green bioluminescence.",
            createdAt: 1725400130000,
            title: "Shattered Bio-Flask",
            source: "location",
          },
        ],
      },
      {
        id: "space-sc-04",
        sceneNumber: 4,
        title: "Quarantine Protocol Override",
        slugline: "INT. STATION SERVICE SPINE - ZERO GRAVITY",
        summary: "Vance races to seal the central bulkhead as station AI initiates automated containment lockdown.",
        startSeconds: 28 * 60,
        durationSeconds: 4 * 60,
        location: "Station Service Spine",
        preview_image_url: "/cinema/scenes/space_sc_04.jpg",
        selectedLocationCandidateId: "loc-barstow-volume",
        castPresent: ["Vance", "Ray"],
        castRoles: {
          Vance: "Fighting hydraulic door manual lever to quarantine module",
          Ray: "Begging not to be sealed inside the dying sector",
        },
        screenplayText: `INT. STATION SERVICE SPINE - ZERO GRAVITY

A massive steel bulkhead begins descending with hydraulic groans.

Vance grabs the manual override lever, pulling with both hands.

RAY
(screaming through comms)
Vance! You can't seal Module 4! The life support pumps will shut off!

VANCE
(teeth clenched, looking through reinforced glass port)
The life support pumps are already venting organic compound into the main scrubber, Ray. You made your choice when you broke that seal.`,
        events: [
          { atSeconds: 28 * 60, characterName: "Vance", eventType: "known_fact" },
          { atSeconds: 31 * 60, characterName: "Ray", eventType: "known_fact" },
        ],
        sceneImages: [
          {
            id: "img-ssc04-1",
            url: "/cinema/scenes/space_sc_04.jpg",
            prompt: "2.39:1 anamorphic still: Massive circular orbital station bulkhead slamming shut as emergency amber beacons flash.",
            createdAt: 1725400140000,
            title: "Bulkhead Quarantine Lockdown",
            source: "location",
          },
        ],
      },
      {
        id: "space-sc-05",
        sceneNumber: 5,
        title: "Atmospheric Purge",
        slugline: "EXT. ORBITAL RESEARCH STATION - SPACE",
        summary: "From outside, Module 4 vents crystalline frozen air into the void as Vance restores command bridge vacuum integrity.",
        startSeconds: 36 * 60,
        durationSeconds: 3 * 60,
        location: "Station Exterior Orbit",
        preview_image_url: "/cinema/scenes/space_sc_05.jpg",
        selectedLocationCandidateId: "loc-barstow-volume",
        castPresent: ["Vance"],
        castRoles: {
          Vance: "Watching module purge from bridge observation dome",
        },
        screenplayText: `EXT. ORBITAL RESEARCH STATION - SPACE

Absolute, dead vacuum silence.

Earth curves beneath the station, blue and razor-sharp against the black starfield.

A plume of crystalline white oxygen blasts from the vents of Module 4, sparkling like frozen diamond dust before dissipating into infinite dark.

Inside the observation cupola, Vance's helmet reflection stares out into the silence.

VANCE (V.O.)
Telemetry log entry: 0400. Module 4 purged. Quarantine maintained. Alone.`,
        events: [
          { atSeconds: 36 * 60, characterName: "Vance", eventType: "known_fact" },
        ],
        sceneImages: [
          {
            id: "img-ssc05-1",
            url: "/cinema/scenes/space_sc_05.jpg",
            prompt: "2.39:1 anamorphic IMAX still: Deep space orbital station venting crystalline frozen gas into the void of space over Earth horizon.",
            createdAt: 1725400150000,
            title: "Exterior Module 4 Purge",
            source: "location",
          },
        ],
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

        // Migrate guest custom projects to this user account if first time signing in
        const migrationKey = `agentic_cinema_migrated_u_${userId}`;
        if (!localStorage.getItem(migrationKey)) {
          const guestProjectsRaw = localStorage.getItem("agentic_cinema_projects_v1");
          if (guestProjectsRaw) {
            try {
              const guestProjects = JSON.parse(guestProjectsRaw);
              if (Array.isArray(guestProjects)) {
                const customGuestProjects = guestProjects
                  .filter((p: ProjectData) => p.isCustom)
                  .map((p: ProjectData) => ({ ...p, userId }));

                if (customGuestProjects.length > 0) {
                  const userKey = `agentic_cinema_projects_u_${userId}`;
                  const existingUserRaw = localStorage.getItem(userKey);
                  const existingUserProjects = existingUserRaw ? JSON.parse(existingUserRaw) : [];
                  const existingIds = new Set((existingUserProjects || []).map((p: any) => p.id));
                  const merged = [
                    ...(existingUserProjects || []),
                    ...customGuestProjects.filter((p) => !existingIds.has(p.id)),
                  ];
                  localStorage.setItem(userKey, JSON.stringify(merged));
                }
              }
            } catch (e) {
              console.warn("[ProjectStore] Error migrating guest projects:", e);
            }
          }
          localStorage.setItem(migrationKey, "true");
        }
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
 * Explicitly populates the demo productions (SEED_PROJECTS) into the active account.
 * Used when a user explicitly requests to explore demo productions.
 */
export function seedDemoProjects(): ProjectData[] {
  if (typeof window === "undefined") return SEED_PROJECTS.map(ensureProjectScenes);
  const key = getProjectsStorageKey();
  const all = getAllProjects();
  const existingIds = new Set(all.map((p) => p.id));
  const newSeeds = SEED_PROJECTS.filter((s) => !existingIds.has(s.id));
  const merged = [...all, ...newSeeds];
  try {
    localStorage.setItem(key, JSON.stringify(merged));
  } catch (err) {
    console.error("Failed to seed demo projects:", err);
  }
  return merged.map(ensureProjectScenes);
}

/**
 * Loads all projects from localStorage for the active account.
 * For authenticated accounts, does not auto-seed demo projects so the real empty state is reachable.
 * For first-time anonymous visitors, seeds the demo projects once to permit exploratory preview.
 */
export function getAllProjects(): ProjectData[] {
  if (typeof window === "undefined") return [];
  try {
    const uid = getActiveUserId();
    const key = getProjectsStorageKey(uid);
    const raw = localStorage.getItem(key);

    // If key hasn't been initialized yet
    if (raw === null) {
      if (!uid) {
        // First-time guest visitor: seed once for exploratory demo
        const hasInitializedGuest = localStorage.getItem("agentic_cinema_guest_seeded_v1");
        if (!hasInitializedGuest) {
          localStorage.setItem("agentic_cinema_guest_seeded_v1", "true");
          localStorage.setItem(key, JSON.stringify(SEED_PROJECTS));
          return SEED_PROJECTS.map(ensureProjectScenes);
        }
      }
      // For authenticated users or returning guests who cleared projects, return empty list
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }

    const parsed = JSON.parse(raw) as ProjectData[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }

    // Auto-update non-custom seed projects with enriched seed data if present
    let needsResave = false;
    const updated = parsed.map((p) => {
      if (!p.isCustom) {
        const seed = SEED_PROJECTS.find((s) => s.id === p.id);
        if (
          seed &&
          (!p.locationClusters ||
            p.locationClusters.length === 0 ||
            !p.scenes?.[0]?.locationCandidates?.length ||
            p.characters?.[0]?.imageUrl?.includes("unsplash") ||
            (p.id === "deep-space-airlock" && (!p.videoTakes || p.videoTakes.length < 2)))
        ) {
          needsResave = true;
          return seed;
        }
      }
      return p;
    });
    if (needsResave) {
      try {
        localStorage.setItem(key, JSON.stringify(updated));
      } catch {}
    }
    return updated.map(ensureProjectScenes);
  } catch (err) {
    console.error("Failed to load projects from localStorage:", err);
    return [];
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
 * Warns if localStorage quota is exceeded so data is not silently lost.
 */
export function saveProject(project: ProjectData): boolean {
  if (typeof window === "undefined") return false;
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

    try {
      localStorage.setItem(key, JSON.stringify(all));
    } catch (storageErr: any) {
      if (
        storageErr?.name === "QuotaExceededError" ||
        storageErr?.code === 22 ||
        storageErr?.name === "NS_ERROR_DOM_QUOTA_REACHED"
      ) {
        console.warn("[ProjectStore] LocalStorage quota exceeded. Dispatching storage quota event.");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("agentic_cinema_quota_exceeded", {
              detail: {
                message: "Local browser storage is full. Sign in or export takes to sync with cloud storage.",
              },
            })
          );
        }
      }
      return false;
    }

    // Asynchronously sync with Supabase only if user is authenticated
    if (uid && getActiveAuthToken()) {
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
    }
    return true;
  } catch (err) {
    console.error("Failed to save project:", err);
    return false;
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
  shootRegion?: string;
  currency?: SupportedCurrency;
  budget?: number;
  budgetPerShootDayUsd?: number;
  budgetAllocation?: ProjectBudgetAllocation;
  budgetCapPolicy?: BudgetCapPolicy;
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

  const totalBudget = data.budget ?? 850_000;
  const locPct = data.budgetAllocation?.locationsPct ?? 15;
  const locBudget = data.budgetAllocation?.locationsAmount ?? Math.round(totalBudget * (locPct / 100));

  const starterSceneSummary = data.logline
    ? `Opening sequence establishing "${data.title}": ${data.logline.trim()}`
    : `Opening sequence introducing ${c1} and establishing the production world.`;

  const starterScreenplayText = `INT. ${locUpper} - DAY\n\n[ESTABLISHING SEQUENCE]\n\nThe world of "${data.title}" opens at ${loc}.\n\n${starterSceneSummary}\n\n${c1.toUpperCase()}\n[Scene dialogue to be developed in the Screenplay editor]`;

  const defaultScenes: FilmScene[] = [
    {
      id: `${newPid}-scene-01`,
      sceneNumber: 1,
      title: "Scene 1: Establishing Beat",
      slugline: `INT. ${locUpper} - DAY`,
      summary: starterSceneSummary,
      startSeconds: 0,
      durationSeconds: Math.round(totalRuntimeSec / Math.max(1, totalScenes)),
      location: loc,
      shootRegion: data.shootRegion || "Los Angeles, CA",
      locationBudget: locBudget,
      castPresent: [c1, ...(c2 !== c1 ? [c2] : [])],
      castRoles: {
        [c1]: "Protagonist",
        ...(c2 !== c1 ? { [c2]: "Counterpart" } : {}),
      },
      screenplayText: starterScreenplayText,
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
    shootRegion: data.shootRegion || "Los Angeles, CA",
    currency: data.currency || "USD",
    budget: totalBudget,
    budgetPerShootDayUsd: data.budgetPerShootDayUsd ?? 85_000,
    budgetAllocation: data.budgetAllocation || {
      locationsPct: locPct,
      locationsAmount: locBudget,
    },
    budgetCapPolicy: data.budgetCapPolicy || "advisory",
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
    shootRegion?: string;
    currency?: SupportedCurrency;
    budget?: number;
    budgetPerShootDayUsd?: number;
    budgetAllocation?: ProjectBudgetAllocation;
    budgetCapPolicy?: BudgetCapPolicy;
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
    shootRegion: updates.shootRegion !== undefined ? updates.shootRegion : proj.shootRegion,
    currency: updates.currency !== undefined ? updates.currency : proj.currency,
    budget: updates.budget !== undefined ? updates.budget : proj.budget,
    budgetPerShootDayUsd: updates.budgetPerShootDayUsd !== undefined ? updates.budgetPerShootDayUsd : proj.budgetPerShootDayUsd,
    budgetAllocation: updates.budgetAllocation !== undefined ? updates.budgetAllocation : proj.budgetAllocation,
    budgetCapPolicy: updates.budgetCapPolicy !== undefined ? updates.budgetCapPolicy : proj.budgetCapPolicy,
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

/**
 * Gets all saved score/music takes for a given project (and optionally scene).
 */
export function getScoreTakes(projectId: string, sceneId?: string): ScoreTake[] {
  const project = getProjectById(projectId);
  if (!project) return [];
  if (sceneId && project.scenes) {
    const scene = project.scenes.find((s) => s.id === sceneId);
    if (scene && scene.scoreTakes && scene.scoreTakes.length > 0) {
      return scene.scoreTakes;
    }
  }
  return project.scoreTakes || [];
}

/**
 * Saves a newly generated score take to the project/scene score vault.
 */
export function saveScoreTake(
  projectId: string,
  takeData: Omit<ScoreTake, "id" | "takeNumber" | "createdAt"> & { id?: string; takeNumber?: number; sceneId?: string }
): ScoreTake {
  const project = getProjectById(projectId);
  const currentTakes = getScoreTakes(projectId, takeData.sceneId);
  const nextNum = takeData.takeNumber || currentTakes.length + 1;

  const newTake: ScoreTake = {
    id: takeData.id || `score-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sceneId: takeData.sceneId,
    takeNumber: nextNum,
    title: takeData.title || `Score Cue ${String(nextNum).padStart(2, "0")}`,
    prompt: takeData.prompt,
    durationMode: takeData.durationMode || "clip",
    durationSec: takeData.durationSec || (takeData.durationMode === "pro" ? 180 : 30),
    createdAt: Date.now(),
    audioUrl: takeData.audioUrl,
    lyricsText: takeData.lyricsText,
    isMaster: takeData.isMaster ?? (currentTakes.length === 0),
    scoreType: takeData.scoreType || "score",
    conditioningImageUrl: takeData.conditioningImageUrl,
    conditioningImageUrls: takeData.conditioningImageUrls,
    responseModalities: takeData.responseModalities,
    instruments: takeData.instruments,
    dynamicArc: takeData.dynamicArc,
    model: takeData.model,
  };

  if (!project) return newTake;

  const updatedTakes = [newTake, ...currentTakes];
  let updatedScenes = project.scenes;

  if (takeData.sceneId && project.scenes) {
    updatedScenes = project.scenes.map((s) => {
      if (s.id === takeData.sceneId) {
        return {
          ...s,
          activeScoreUrl: newTake.isMaster ? newTake.audioUrl : (s.activeScoreUrl || newTake.audioUrl),
          scoreTakes: updatedTakes,
        };
      }
      return s;
    });
  }

  const updatedProject: ProjectData = {
    ...project,
    scenes: updatedScenes,
    activeScoreUrl: newTake.isMaster ? newTake.audioUrl : (project.activeScoreUrl || newTake.audioUrl),
    scoreTakes: updatedTakes,
  };

  saveProject(updatedProject);
  return newTake;
}

/**
 * Sets a specific score take as master for the project/scene.
 */
export function setMasterScoreTake(projectId: string, takeId: string, sceneId?: string): void {
  const project = getProjectById(projectId);
  if (!project) return;

  const updateTakesList = (takes: ScoreTake[]) => {
    let activeUrl: string | undefined;
    const nextList = takes.map((t) => {
      if (t.id === takeId) {
        activeUrl = t.audioUrl;
        return { ...t, isMaster: true };
      }
      return { ...t, isMaster: false };
    });
    return { nextList, activeUrl };
  };

  let updatedScenes = project.scenes;
  let newActiveUrl = project.activeScoreUrl;

  if (sceneId && project.scenes) {
    updatedScenes = project.scenes.map((s) => {
      if (s.id === sceneId && s.scoreTakes) {
        const { nextList, activeUrl } = updateTakesList(s.scoreTakes);
        return {
          ...s,
          scoreTakes: nextList,
          activeScoreUrl: activeUrl || s.activeScoreUrl,
        };
      }
      return s;
    });
  }

  if (project.scoreTakes) {
    const { nextList, activeUrl } = updateTakesList(project.scoreTakes);
    newActiveUrl = activeUrl || newActiveUrl;
    project.scoreTakes = nextList;
  }

  saveProject({
    ...project,
    scenes: updatedScenes,
    activeScoreUrl: newActiveUrl,
  });
}

/**
 * Deletes a specific score take from the project/scene score vault.
 */
export function deleteScoreTake(projectId: string, takeId: string, sceneId?: string): void {
  const project = getProjectById(projectId);
  if (!project) return;

  const filterTakes = (takes: ScoreTake[]) => takes.filter((t) => t.id !== takeId);

  let updatedScenes = project.scenes;
  let newActiveUrl = project.activeScoreUrl;

  if (sceneId && project.scenes) {
    updatedScenes = project.scenes.map((s) => {
      if (s.id === sceneId && s.scoreTakes) {
        const remaining = filterTakes(s.scoreTakes);
        const wasActive = s.activeScoreUrl && s.scoreTakes.find((t) => t.id === takeId)?.audioUrl === s.activeScoreUrl;
        return {
          ...s,
          scoreTakes: remaining,
          activeScoreUrl: wasActive ? remaining[0]?.audioUrl : s.activeScoreUrl,
        };
      }
      return s;
    });
  }

  const remainingProjectTakes = filterTakes(project.scoreTakes || []);
  if (newActiveUrl && !remainingProjectTakes.some((t) => t.audioUrl === newActiveUrl)) {
    newActiveUrl = remainingProjectTakes[0]?.audioUrl;
  }

  saveProject({
    ...project,
    scenes: updatedScenes,
    activeScoreUrl: newActiveUrl,
    scoreTakes: remainingProjectTakes,
  });
}

/**
 * Gets all shots (chained-generation sub-clips) for a given scene.
 */
export function getShots(projectId: string, sceneId: string): Shot[] {
  const project = getProjectById(projectId);
  if (!project || !project.scenes) return [];
  const scene = project.scenes.find((s) => s.id === sceneId);
  return scene?.shots || [];
}

/**
 * Replaces the full shot list for a scene (used when a shot plan is approved,
 * and as each shot in a sequence job transitions status/videoUrl).
 */
export function saveShots(projectId: string, sceneId: string, shots: Shot[]): void {
  const project = getProjectById(projectId);
  if (!project || !project.scenes) return;

  const updatedScenes = project.scenes.map((s) =>
    s.id === sceneId ? { ...s, shots } : s
  );

  saveProject({
    ...project,
    scenes: updatedScenes,
  });
}

/**
 * Updates a single shot within a scene's shot list (e.g. status transitions
 * during sequential generation).
 */
export function updateShot(
  projectId: string,
  sceneId: string,
  shotId: string,
  patch: Partial<Shot>
): void {
  const shots = getShots(projectId, sceneId);
  const updated = shots.map((sh) => (sh.id === shotId ? { ...sh, ...patch } : sh));
  saveShots(projectId, sceneId, updated);
}

/**
 * Persists the active/most recent chained-generation job so progress can
 * survive a page reload while the server-side job keeps running.
 */
export function saveActiveSequenceJob(projectId: string, job: ShotSequenceJob | undefined): void {
  const project = getProjectById(projectId);
  if (!project) return;
  saveProject({
    ...project,
    activeSequenceJob: job,
  });
}

export interface NodeCallbacks {
  onOpenHotSeat?: (charName: string) => void;
  onTuneVoice?: (charName: string) => void;
  onGenerateDraft?: () => void;
  onViewScript?: () => void;
  onOpenDeck?: (subTab: "blocking" | "tension" | "territory" | "stripboard") => void;
  onOpenTableRead?: () => void;
  onOpenHeatmap?: () => void;
  onRunChemistry?: () => void;
  onTweakDials?: (charName: string, dials: { confidence: number; speed: number; subtext: number }) => void;
  onOpenDossier?: (candidateId?: string) => void;
}

/**
 * Re-attaches interactive callbacks to nodes deserialized from JSON storage.
 * JSON serialization discards JS functions, so this restores all button actions.
 */
export function rehydrateNodeCallbacks(
  nodes: Node[],
  callbacks?: NodeCallbacks
): Node[] {
  if (!nodes || !Array.isArray(nodes) || !callbacks) return nodes || [];

  return nodes.map((node) => {
    const data = { ...(node.data || {}) } as Record<string, unknown>;

    switch (node.type) {
      case "characterCore": {
        const charName = (data.name as string) || "Lead";
        data.onOpenHotSeat = () => callbacks.onOpenHotSeat?.(charName);
        data.onTuneVoice = () => callbacks.onTuneVoice?.(charName);
        break;
      }
      case "scene": {
        data.onGenerateDraft = callbacks.onGenerateDraft;
        data.onViewScript = callbacks.onViewScript;
        break;
      }
      case "script": {
        data.onViewScript = callbacks.onViewScript;
        break;
      }
      case "floorplan": {
        data.onOpenDeck = () => callbacks.onOpenDeck?.("blocking");
        break;
      }
      case "tensionCurve": {
        data.onOpenDeck = () => callbacks.onOpenDeck?.("tension");
        break;
      }
      case "tableRead": {
        data.onOpenPlayer = callbacks.onOpenTableRead;
        break;
      }
      case "market": {
        data.onOpenHeatmap = callbacks.onOpenHeatmap;
        break;
      }
      case "chemistry": {
        data.onRunChemistry = callbacks.onRunChemistry;
        break;
      }
      case "location": {
        data.onOpenDossier = (candId?: string) => callbacks.onOpenDossier?.(candId);
        break;
      }
      default:
        break;
    }

    return { ...node, data };
  });
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
        onTuneVoice: () => callbacks?.onTuneVoice?.(char.name),
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
      peakTension: 88,
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
