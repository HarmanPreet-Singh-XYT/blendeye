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
}

export interface ProjectData {
  id: string;
  title: string;
  genre: string;
  premise: string;
  sceneTitle: string;
  sceneSummary: string;
  screenplayText: string;
  characters: ProjectCharacter[];
  initialEvents: StoryEventMarker[];
  nodes?: Node[];
  edges?: Edge[];
  createdAt: number;
  updatedAt: number;
  isCustom?: boolean;
  isStarred?: boolean;
  directorStyle?: string;
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
    createdAt: 1725400100000,
    updatedAt: 1725400100000,
    isCustom: false,
  },
];

const STORAGE_KEY = "agentic_cinema_projects_v1";

/**
 * Loads all projects from localStorage (merging with seed presets).
 */
export function getAllProjects(): ProjectData[] {
  if (typeof window === "undefined") return SEED_PROJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PROJECTS));
      return SEED_PROJECTS;
    }
    const parsed = JSON.parse(raw) as ProjectData[];
    // Ensure both seed projects are always available
    const existingIds = new Set(parsed.map((p) => p.id));
    let updated = false;
    for (const seed of SEED_PROJECTS) {
      if (!existingIds.has(seed.id)) {
        parsed.unshift(seed);
        updated = true;
      }
    }
    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error("Failed to load projects from localStorage:", err);
    return SEED_PROJECTS;
  }
}

/**
 * Gets a specific project by ID.
 */
export function getProjectById(id: string): ProjectData | null {
  const all = getAllProjects();
  const found = all.find((p) => p.id === id);
  if (found) return found;
  const seed = SEED_PROJECTS.find((p) => p.id === id);
  return seed || null;
}

/**
 * Saves or updates a project in localStorage.
 */
export function saveProject(project: ProjectData): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllProjects();
    const index = all.findIndex((p) => p.id === project.id);
    const updatedProject = { ...project, updatedAt: Date.now() };
    if (index >= 0) {
      all[index] = updatedProject;
    } else {
      all.unshift(updatedProject);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error("Failed to save project:", err);
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
 * Deletes a project from localStorage.
 */
export function deleteProject(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllProjects();
    const filtered = all.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
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

/**
 * Creates a new blank/pending project entry in localStorage.
 */
export function createNewProjectEntry(data: {
  id?: string;
  title: string;
  logline: string;
  genre?: string;
  characters?: string;
}): ProjectData {
  const newPid = data.id || `project-${Date.now().toString(36)}`;
  const parsedCharNames = data.characters
    ? data.characters
        .split(/[,;\n]+/)
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const initialChars: ProjectCharacter[] =
    parsedCharNames.length > 0
      ? parsedCharNames.map((name, i) => ({
          name: name.split(/\s+/)[0],
          role: i === 0 ? "Protagonist" : "Key Counterpart",
          archetype: name.includes("(") ? name.split("(")[1].replace(")", "") : `Character ${i + 1}`,
          speechStyle: "naturalistic, guarded",
          subtextRatio: "high",
          objective: "Resolve the central conflict before time expires",
          dialsSummary: "Confidence 85% · Subtext 80%",
        }))
      : synthesizeDynamicCharacters(data.genre, data.logline);

  const newProject: ProjectData = {
    id: newPid,
    title: data.title.trim(),
    genre: data.genre || "Drama / Thriller",
    premise: data.logline.trim(),
    sceneTitle: `${data.title.trim()} — Opening Scene`,
    sceneSummary: data.logline.trim(),
    screenplayText: "",
    characters: initialChars,
    initialEvents: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isCustom: true,
  };

  saveProject(newProject);
  return newProject;
}

export interface NodeCallbacks {
  onOpenHotSeat?: (charName: string) => void;
  onGenerateDraft?: () => void;
  onViewScript?: () => void;
  onOpenDeck?: (subTab: "blocking" | "tension" | "territory" | "stripboard") => void;
  onOpenTableRead?: () => void;
  onOpenHeatmap?: () => void;
  onRunChemistry?: () => void;
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
        confidence: idx === 0 ? 60 : 90,
        speed: 75,
        subtext: 85,
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
      peakTension: 94,
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
      globalScore: 82,
      topTerritory: "North America (88%) & Western Europe (84%)",
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
