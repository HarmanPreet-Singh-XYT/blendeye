"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  type Edge,
  type Node,
  type Connection,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import { StoryCanvas } from "@/components/cinema/story-canvas";
import {
  TimelineScrubber,
  formatTimecode,
  type StoryEventMarker,
} from "@/components/cinema/timeline-scrubber";
import {
  HotSeatChat,
  type HotSeatTurn,
  type KnowledgeFact,
} from "@/components/cinema/hot-seat-chat";
import { ShowrunnerChat } from "@/components/cinema/showrunner-chat";
import {
  NewProjectDialog,
  type NewProjectFormData,
} from "@/components/cinema/new-project-dialog";
import { FilmFusionDialog } from "@/components/cinema/film-fusion-dialog";
import { ScreenplayDialog } from "@/components/cinema/screenplay-dialog";
import { FloorPlanView } from "@/components/cinema/floor-plan-view";
import { TensionCurveView } from "@/components/cinema/tension-curve-view";
import { TerritoryHeatmapView } from "@/components/cinema/territory-heatmap-view";
import { StripboardView } from "@/components/cinema/stripboard-view";
import { TableReadPlayer } from "@/components/cinema/table-read-player";
import {
  MultiverseTakesDialog,
  type MultiverseTake,
} from "@/components/cinema/multiverse-takes-dialog";
import {
  ClickHouseInspector,
  type ClickHouseQueryLog,
} from "@/components/cinema/clickhouse-inspector";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Film,
  Sparkles,
  Bot,
  UserCheck,
  FileText,
  Plus,
  ChevronRight,
  ArrowLeft,
  Shuffle,
  Clapperboard,
  Sliders,
  Activity,
  Globe2,
  Layers,
  Volume2,
  Users2,
  Flame,
  RotateCcw,
  Video,
} from "lucide-react";
import type { ShowrunnerMessage } from "@/lib/agent-service";

const DURATION_SECONDS = 90 * 60; // 90 min feature runtime

export const PRESET_SCENARIOS = [
  {
    id: "vault-heist-demo",
    title: "The Vault Heist",
    genre: "Heist / Crime Thriller",
    premise:
      "A heist crew breaches an underground vault, but Marcus realizes the exit keys are missing and Elena is hiding something.",
    sceneTitle: "The Vault — Scene 04",
    sceneSummary:
      "Marcus searches his vest for the sub-level keys. Elena refuses to make eye contact while Teo watches the perimeter corridor.",
    script: `INT. UNDERGROUND VAULT - NIGHT

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
      },
      {
        name: "Elena",
        archetype: "Mastermind, calculated, concealing a private syndicate deal",
        speechStyle: "measured, icy, dismissive",
        subtextRatio: "extreme",
      },
      {
        name: "Teo",
        archetype: "Perimeter muscle, stationed outside by the tunnel",
        speechStyle: "casual, street-smart, impatient",
        subtextRatio: "low",
      },
    ],
    initialEvents: [
      { atSeconds: 25 * 60, characterName: "Marcus", eventType: "known_fact" as const },
      { atSeconds: 28 * 60, characterName: "Marcus", eventType: "known_fact" as const },
      { atSeconds: 34 * 60, characterName: "Marcus", eventType: "unaware_of" as const },
      { atSeconds: 34 * 60, characterName: "Elena", eventType: "known_fact" as const },
      { atSeconds: 52 * 60, characterName: "Marcus", eventType: "known_fact" as const },
      { atSeconds: 61 * 60, characterName: "Teo", eventType: "location" as const },
    ],
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
    script: `INT. ORBITAL RESEARCH MODULE - ZERO GRAVITY

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
      },
      {
        name: "Ray",
        archetype: "Engineer, terrified, hiding an encounter with an unknown specimen",
        speechStyle: "stammering, evasive, desperate",
        subtextRatio: "extreme",
      },
    ],
    initialEvents: [
      { atSeconds: 12 * 60, characterName: "Vance", eventType: "known_fact" as const },
      { atSeconds: 22 * 60, characterName: "Ray", eventType: "known_fact" as const },
      { atSeconds: 35 * 60, characterName: "Vance", eventType: "unaware_of" as const },
      { atSeconds: 48 * 60, characterName: "Ray", eventType: "known_fact" as const },
      { atSeconds: 70 * 60, characterName: "Vance", eventType: "known_fact" as const },
    ],
  },
];

type StudioTab = "hotseat" | "showrunner" | "chemistry" | "screenplay" | "deck";
type DeckSubTab = "blocking" | "tension" | "territory" | "stripboard";

export default function StudioPage() {
  const params = useParams();
  const router = useRouter();
  const rawProjectId = (params?.projectId as string) || "vault-heist-demo";

  const matchedPreset =
    PRESET_SCENARIOS.find((p) => p.id === rawProjectId) || PRESET_SCENARIOS[0];

  // Core Production State
  const [projectId, setProjectId] = React.useState(rawProjectId);
  const [projectTitle, setProjectTitle] = React.useState(matchedPreset.title);
  const [premiseInput, setPremiseInput] = React.useState(matchedPreset.premise);
  const [sceneTitle, setSceneTitle] = React.useState(matchedPreset.sceneTitle);
  const [sceneSummary, setSceneSummary] = React.useState(matchedPreset.sceneSummary);
  const [screenplayText, setScreenplayText] = React.useState(matchedPreset.script);
  const [characters, setCharacters] = React.useState(matchedPreset.characters);
  const [activeCharacterName, setActiveCharacterName] = React.useState<string>(
    matchedPreset.characters[0]?.name || "Marcus"
  );

  // Timeline & Interrogation State
  const [timeSeconds, setTimeSeconds] = React.useState(34 * 60);
  const [events, setEvents] = React.useState<StoryEventMarker[]>(matchedPreset.initialEvents);
  const [knownFacts, setKnownFacts] = React.useState<KnowledgeFact[]>([]);
  const [hotSeatTurns, setHotSeatTurns] = React.useState<HotSeatTurn[]>([]);

  // Showrunner Chat State
  const [showrunnerMessages, setShowrunnerMessages] = React.useState<ShowrunnerMessage[]>([]);
  const [isShowrunnerThinking, setIsShowrunnerThinking] = React.useState(false);

  // Chemistry Bench State
  const [chemistryScenario, setChemistryScenario] = React.useState(
    "Stuck in a broken service elevator with a ticking 2-minute security countdown"
  );
  const [chemistrySceneOutput, setChemistrySceneOutput] = React.useState<string>("");
  const [isChemistryRunning, setIsChemistryRunning] = React.useState(false);

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = React.useState<StudioTab>("hotseat");
  const [deckSubTab, setDeckSubTab] = React.useState<DeckSubTab>("blocking");
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [fusionOpen, setFusionOpen] = React.useState(false);
  const [multiverseOpen, setMultiverseOpen] = React.useState(false);
  const [scriptViewerOpen, setScriptViewerOpen] = React.useState(false);
  const [showTableRead, setShowTableRead] = React.useState(false);

  // Pipeline Status & Logs
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStage, setGenerationStage] = React.useState<string>("");
  const [isAsking, setIsAsking] = React.useState(false);
  const [queryLogs, setQueryLogs] = React.useState<ClickHouseQueryLog[]>([]);
  const [lastSql, setLastSql] = React.useState<string>("");

  const activeCharacter = characters.find((c) => c.name === activeCharacterName) || characters[0];

  // Log ClickHouse Queries
  const logClickHouseQuery = React.useCallback(
    (sql: string, type: ClickHouseQueryLog["type"], durationMs?: number) => {
      setLastSql(sql);
      setQueryLogs((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          sql,
          durationMs,
          type,
        },
        ...prev.slice(0, 24),
      ]);
    },
    []
  );

  // Query ClickHouse Knowledge State
  const fetchKnowledge = React.useCallback(
    async (pid: string, charName: string, seconds: number) => {
      const timecode = formatTimecode(seconds);
      const start = performance.now();
      try {
        const res = await fetch(
          `/api/hot-seat/knowledge?projectId=${encodeURIComponent(pid)}&characterName=${encodeURIComponent(
            charName
          )}&currentTimestamp=${encodeURIComponent(timecode)}`
        );
        if (res.ok) {
          const data = await res.json();
          setKnownFacts(data.known_facts || []);
          if (data.query_sql) {
            const elapsed = Math.round(performance.now() - start);
            logClickHouseQuery(data.query_sql, "scrub", elapsed);
          }
        }
      } catch (err) {
        console.error("Knowledge query error:", err);
      }
    },
    [logClickHouseQuery]
  );

  // Fetch Event Markers from ClickHouse
  const fetchProjectEvents = React.useCallback(async (pid: string) => {
    try {
      const res = await fetch(`/api/events?projectId=${encodeURIComponent(pid)}`);
      if (res.ok) {
        const rawEvents = await res.json();
        if (Array.isArray(rawEvents) && rawEvents.length > 0) {
          const parsed: StoryEventMarker[] = rawEvents.map(
            (ev: {
              event_timestamp: string;
              character_name: string;
              event_type: StoryEventMarker["eventType"];
            }) => {
              const parts = ev.event_timestamp.split(":").map(Number);
              const totalSec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
              return {
                atSeconds: totalSec,
                characterName: ev.character_name,
                eventType: ev.event_type,
              };
            }
          );
          setEvents(parsed);
        }
      }
    } catch (err) {
      console.error("Events fetch error:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchKnowledge(projectId, activeCharacterName, timeSeconds);
  }, [projectId, activeCharacterName, timeSeconds, fetchKnowledge]);

  // Dialogue Insertion Micro-Interaction
  const handleInsertIntoScript = (characterName: string, dialogue: string) => {
    const formatted = `\n\n${characterName.toUpperCase()}\n(interrogation alternate)\n${dialogue}\n`;
    setScreenplayText((prev) => prev + formatted);
  };

  // Multiverse Take Application
  const handleApplyTake = (take: MultiverseTake) => {
    setScreenplayText(take.scriptSnippet);
    setSceneSummary(take.synopsis);
  };

  // Run Script Generation & Sharding Pipeline
  const runFullPipeline = async (pid: string, premise: string) => {
    setIsGenerating(true);
    try {
      setGenerationStage("Drafting Master Screenplay (Gemini 3.7)...");
      const scriptRes = await fetch("/api/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ premise }),
      });
      if (!scriptRes.ok) throw new Error("Script generation failed");
      const scriptData = await scriptRes.json();
      const generatedScript = scriptData.screenplay_text;
      setScreenplayText(generatedScript);

      setGenerationStage("Sharding Perspectives & Asymmetric Knowledge into ClickHouse...");
      const shardRes = await fetch("/api/sharding/shard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: pid,
          screenplayText: generatedScript,
        }),
      });
      if (!shardRes.ok) throw new Error("Perspective sharding failed");
      const shardData = await shardRes.json();

      if (shardData.scene_title) setSceneTitle(shardData.scene_title);
      if (shardData.scene_summary) setSceneSummary(shardData.scene_summary);
      if (Array.isArray(shardData.characters) && shardData.characters.length > 0) {
        setCharacters(shardData.characters);
        setActiveCharacterName(shardData.characters[0].name);
      }

      logClickHouseQuery(
        `INSERT INTO story_events VALUES (${shardData.events_written} events committed)`,
        "insert",
        15
      );

      setGenerationStage("Finalizing Timeline & Syncing Graph...");
      await fetchProjectEvents(pid);
      setActiveTab("hotseat");
    } catch (err) {
      console.error("Pipeline failed:", err);
    } finally {
      setIsGenerating(false);
      setGenerationStage("");
    }
  };

  // Interrogate Character in Hot Seat
  const handleAskHotSeat = async (question: string) => {
    if (!question.trim() || isAsking) return;
    setIsAsking(true);

    const userTurn: HotSeatTurn = { role: "interviewer", content: question };
    setHotSeatTurns((prev) => [...prev, userTurn]);

    const timecode = formatTimecode(timeSeconds);
    const start = performance.now();

    try {
      const res = await fetch("/api/hot-seat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          characterName: activeCharacterName,
          currentTimestamp: timecode,
          question,
          speechStyle: activeCharacter?.speechStyle,
          subtextRatio: activeCharacter?.subtextRatio,
          priorTurns: hotSeatTurns.slice(-6).map((t) => ({ role: t.role, content: t.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const characterTurn: HotSeatTurn = {
          role: "character",
          content: data.answer,
          isWithinFirewall: data.is_within_firewall,
        };
        setHotSeatTurns((prev) => [...prev, characterTurn]);
        if (data.known_facts) setKnownFacts(data.known_facts);
        if (data.query_sql) {
          const elapsed = Math.round(performance.now() - start);
          logClickHouseQuery(data.query_sql, "interrogate", elapsed);
        }
      }
    } catch (err) {
      console.error("Hot-seat error:", err);
    } finally {
      setIsAsking(false);
    }
  };

  // Showrunner Central AI Chat
  const handleSendShowrunner = async (message: string) => {
    if (!message.trim() || isShowrunnerThinking) return;
    setIsShowrunnerThinking(true);

    const userMsg: ShowrunnerMessage = { role: "user", content: message };
    setShowrunnerMessages((prev) => [...prev, userMsg]);

    const start = performance.now();
    try {
      const res = await fetch("/api/showrunner/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle,
          logline: premiseInput,
          screenplayText,
          characters: characters.map((c) => c.name),
          message,
          history: showrunnerMessages.slice(-6),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowrunnerMessages((prev) => [
          ...prev,
          { role: "showrunner", content: data.reply },
        ]);
        if (data.clickhouse_query_sql) {
          const elapsed = Math.round(performance.now() - start);
          logClickHouseQuery(data.clickhouse_query_sql, "precedents", elapsed);
        }
      }
    } catch (err) {
      console.error("Showrunner error:", err);
    } finally {
      setIsShowrunnerThinking(false);
    }
  };

  // Chemistry Test Execution
  const handleRunChemistry = async () => {
    setIsChemistryRunning(true);
    try {
      const res = await fetch("/api/character/chemistry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          char_a_name: "Marcus",
          char_a_dna: "Tense getaway driver, Willem Dafoe cadence, staccato, paranoid",
          char_b_name: "Elena",
          char_b_dna: "Mastermind syndicate broker, 70% Hans Landa, chilling calm",
          scenario: chemistryScenario,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChemistrySceneOutput(data.micro_scene);
        setActiveTab("chemistry");
      }
    } catch (err) {
      console.error("Chemistry test failed:", err);
    } finally {
      setIsChemistryRunning(false);
    }
  };

  // -------------------------------------------------------------
  // INITIAL BLUEPRINT NODE GRAPH SETUP (The True Virtual Backlot)
  // -------------------------------------------------------------
  const initialNodes: Node[] = React.useMemo(() => [
    // 1. YouTube Reference Clip
    {
      id: "node-clip-1",
      type: "clip",
      position: { x: -380, y: -40 },
      data: {
        title: "Michael Mann Lighting Study",
        url: "youtube.com/watch?v=heat-1995",
        timestampRange: "02:14 - 03:45",
        lightingStyle: "Low-key chiaroscuro, sodium-vapor halo, cyan night kick",
        palette: ["#0b132b", "#1c2541", "#3a506b", "#e09f3e", "#d62828"],
        pacing: "Deliberate slow-burn with sudden kinetic explosions",
      },
    },
    // 2. Plot Seed Idea Note
    {
      id: "node-note-1",
      type: "note",
      position: { x: -380, y: 220 },
      data: {
        noteType: "Plot Seed",
        content: "Marcus suspects Elena tampered with the sub-level exit locker before the vault sirens cycled.",
        audioDuration: "01:14",
      },
    },

    // 3. Modular Character Lab: Marcus Vance Sub-nodes
    {
      id: "node-actor-marcus",
      type: "actor",
      position: { x: -380, y: 440 },
      data: {
        actorName: "Willem Dafoe Comp",
        roleReference: "The Lighthouse (erratic, unblinking intensity)",
        vocalWeight: "Breathless, staccato, gravelly",
        energyProfile: "Cornered animal on edge",
      },
    },
    {
      id: "node-dial-marcus",
      type: "personality",
      position: { x: -380, y: 640 },
      data: {
        presetName: "Rust Cohle + Zuckerberg",
        confidence: 45,
        speed: 80,
        subtext: 70,
      },
    },
    {
      id: "node-quirks-marcus",
      type: "quirks",
      position: { x: -380, y: 860 },
      data: {
        tics: ["Fidgets with silver zippo", "Avoids direct eye contact when panicked"],
      },
    },
    // Marcus Core Node
    {
      id: "node-core-marcus",
      type: "characterCore",
      position: { x: 40, y: 460 },
      data: {
        name: "Marcus",
        archetype: "Getaway driver, loyal but rattles easily under pressure",
        objective: "Locate missing vault bypass keys before vents cycle",
        actorComp: "Willem Dafoe",
        dialsSummary: "Speed 80% · Subtext 70%",
        onOpenHotSeat: () => {
          setActiveCharacterName("Marcus");
          setActiveTab("hotseat");
        },
      },
    },

    // 4. Modular Character Lab: Elena Sub-nodes
    {
      id: "node-actor-elena",
      type: "actor",
      position: { x: -380, y: 1040 },
      data: {
        actorName: "Florence Pugh / Cate Blanchett",
        roleReference: "Tár (surgical, cold, predatory stillness)",
        vocalWeight: "Chillingly measured, whisper-sharp",
        energyProfile: "In control, withholding deadly secrets",
      },
    },
    {
      id: "node-dial-elena",
      type: "personality",
      position: { x: -380, y: 1240 },
      data: {
        presetName: "70% Hans Landa + 30% Kendall Roy",
        confidence: 95,
        speed: 30,
        subtext: 95,
      },
    },
    // Elena Core Node
    {
      id: "node-core-elena",
      type: "characterCore",
      position: { x: 40, y: 1060 },
      data: {
        name: "Elena",
        archetype: "Mastermind syndicate broker, calculated and unblinking",
        objective: "Hold Marcus in place until syndicate extraction window arrives",
        actorComp: "Florence Pugh",
        dialsSummary: "Confidence 95% · Subtext 95%",
        onOpenHotSeat: () => {
          setActiveCharacterName("Elena");
          setActiveTab("hotseat");
        },
      },
    },

    // 5. Chemistry Bench Sandbox Node
    {
      id: "node-chemistry-1",
      type: "chemistry",
      position: { x: 480, y: 800 },
      data: {
        scenario: chemistryScenario,
        onRunChemistry: handleRunChemistry,
      },
    },

    // 6. Narrative: Scene Master Node
    {
      id: "node-scene-1",
      type: "scene",
      position: { x: 480, y: 80 },
      data: {
        title: sceneTitle,
        slugline: "INT. UNDERGROUND VAULT - NIGHT",
        stakes: "Elena conceals bypass keys while Marcus tears through canvas bag in panic.",
        state: isGenerating ? "generating" : "ready",
        characterCount: 2,
        hasStyleRef: true,
        onGenerateDraft: () => runFullPipeline(projectId, premiseInput),
        onViewScript: () => setScriptViewerOpen(true),
      },
    },

    // 7. Narrative: Screenplay Draft Node
    {
      id: "node-script-1",
      type: "script",
      position: { x: 920, y: 80 },
      data: {
        title: "Master Screenplay Draft v2",
        previewText: screenplayText,
        wordCount: 384,
        onViewScript: () => setScriptViewerOpen(true),
      },
    },

    // 8. Visual & Production Suite Nodes
    {
      id: "node-storyboard-1",
      type: "storyboard",
      position: { x: 1360, y: -80 },
      data: {
        prompt: "2.39:1 low-angle anamorphic shot of Marcus kneeling over open canvas bag; Elena stands silhouette in foreground.",
        shotType: "2.39:1 Anamorphic Scope",
        lighting: "Cyan auxiliary neon & heavy shadows",
      },
    },
    {
      id: "node-floorplan-1",
      type: "floorplan",
      position: { x: 1360, y: 160 },
      data: {
        sceneTitle,
        cameraCount: 3,
        onOpenDeck: () => {
          setActiveTab("deck");
          setDeckSubTab("blocking");
        },
      },
    },
    {
      id: "node-tension-1",
      type: "tensionCurve",
      position: { x: 1360, y: 380 },
      data: {
        peakTension: 92,
        hasWarning: false,
        onOpenDeck: () => {
          setActiveTab("deck");
          setDeckSubTab("tension");
        },
      },
    },
    {
      id: "node-tableread-1",
      type: "tableRead",
      position: { x: 1360, y: 600 },
      data: {
        voiceCount: 3,
        onOpenPlayer: () => setShowTableRead(true),
      },
    },
    {
      id: "node-market-1",
      type: "market",
      position: { x: 1360, y: 820 },
      data: {
        globalScore: 79,
        topTerritory: "North America (86%) & South Korea (83%)",
        onOpenHeatmap: () => {
          setActiveTab("deck");
          setDeckSubTab("territory");
        },
      },
    },
  ], [
    sceneTitle,
    screenplayText,
    isGenerating,
    projectId,
    premiseInput,
    chemistryScenario,
  ]);

  const initialEdges: Edge[] = React.useMemo(() => [
    // Marcus trait wiring
    { id: "e-act-marcus", source: "node-actor-marcus", target: "node-core-marcus", targetHandle: "actor_ref" },
    { id: "e-dial-marcus", source: "node-dial-marcus", target: "node-core-marcus", targetHandle: "personality" },
    { id: "e-quirk-marcus", source: "node-quirks-marcus", target: "node-core-marcus", targetHandle: "quirks" },

    // Elena trait wiring
    { id: "e-act-elena", source: "node-actor-elena", target: "node-core-elena", targetHandle: "actor_ref" },
    { id: "e-dial-elena", source: "node-dial-elena", target: "node-core-elena", targetHandle: "personality" },

    // Chemistry bench wiring
    { id: "e-chem-a", source: "node-core-marcus", target: "node-chemistry-1", targetHandle: "char_a" },
    { id: "e-chem-b", source: "node-core-elena", target: "node-chemistry-1", targetHandle: "char_b" },

    // Scene master inputs
    { id: "e-clip-scene", source: "node-clip-1", target: "node-scene-1", targetHandle: "style_ref" },
    { id: "e-note-scene", source: "node-note-1", target: "node-scene-1", targetHandle: "plot_seed" },
    { id: "e-marcus-scene", source: "node-core-marcus", target: "node-scene-1", targetHandle: "character_in" },
    { id: "e-elena-scene", source: "node-core-elena", target: "node-scene-1", targetHandle: "character_in" },

    // Scene to Script
    { id: "e-scene-script", source: "node-scene-1", target: "node-script-1", targetHandle: "script_in" },

    // Script to Production outputs
    { id: "e-script-storyboard", source: "node-script-1", target: "node-storyboard-1", targetHandle: "script_in" },
    { id: "e-script-floorplan", source: "node-script-1", target: "node-floorplan-1", targetHandle: "script_in" },
    { id: "e-script-tension", source: "node-script-1", target: "node-tension-1", targetHandle: "script_in" },
    { id: "e-script-tableread", source: "node-script-1", target: "node-tableread-1", targetHandle: "script_in" },
    { id: "e-script-market", source: "node-script-1", target: "node-market-1", targetHandle: "script_in" },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Allow user to draw new connections between nodes
  const onConnect = React.useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // Spawner for new blueprint nodes on canvas
  const handleAddBlueprintNode = (type: string) => {
    const id = `node-${type}-${Date.now().toString(36)}`;
    const randomOffset = Math.floor(Math.random() * 80);
    const pos = { x: 200 + randomOffset, y: 200 + randomOffset };

    let newNode: Node;
    switch (type) {
      case "clip":
        newNode = {
          id,
          type: "clip",
          position: pos,
          data: {
            title: "Custom YouTube Reference",
            url: "youtube.com/watch?v=custom",
            timestampRange: "01:00 - 02:30",
            lightingStyle: "Extracted golden hour contrast",
            palette: ["#ffb703", "#fb8500", "#023047"],
            pacing: "Moderate",
          },
        };
        break;
      case "note":
        newNode = {
          id,
          type: "note",
          position: pos,
          data: {
            noteType: "Brainstorm Note",
            content: "Add a sudden power failure before the protagonist reaches the safe.",
          },
        };
        break;
      case "actor":
        newNode = {
          id,
          type: "actor",
          position: pos,
          data: {
            actorName: "New Actor Comp",
            roleReference: "Iconic Film Reference",
            vocalWeight: "Deep, gravelly",
            energyProfile: "Method actor intensity",
          },
        };
        break;
      case "personality":
        newNode = {
          id,
          type: "personality",
          position: pos,
          data: {
            presetName: "Custom Dial Set",
            confidence: 70,
            speed: 50,
            subtext: 65,
          },
        };
        break;
      case "quirks":
        newNode = {
          id,
          type: "quirks",
          position: pos,
          data: {
            tics: ["Constantly glances at wristwatch", "Taps fingers against holster"],
          },
        };
        break;
      case "characterCore":
        newNode = {
          id,
          type: "characterCore",
          position: pos,
          data: {
            name: "New Hero",
            archetype: "Reluctant protagonist",
            objective: "Survive the night",
            onOpenHotSeat: () => {
              setActiveCharacterName("New Hero");
              setActiveTab("hotseat");
            },
          },
        };
        break;
      case "scene":
        newNode = {
          id,
          type: "scene",
          position: pos,
          data: {
            title: "New Scene Master",
            slugline: "EXT. INDUSTRIAL COMPLEX - DAWN",
            stakes: "A standoff where negotiations break down.",
            state: "ready",
          },
        };
        break;
      case "script":
        newNode = {
          id,
          type: "script",
          position: pos,
          data: {
            title: "New Screenplay Draft",
            previewText: "INT. UNKNOWN LOCATION - CONTINUOUS\n\nA shadow moves across the doorway...",
            wordCount: 150,
            onViewScript: () => setScriptViewerOpen(true),
          },
        };
        break;
      case "chemistry":
        newNode = {
          id,
          type: "chemistry",
          position: pos,
          data: {
            scenario: "Two strangers trapped in an interrogation holding cell",
            onRunChemistry: handleRunChemistry,
          },
        };
        break;
      case "storyboard":
        newNode = {
          id,
          type: "storyboard",
          position: pos,
          data: {
            prompt: "Cinematic wide establishing shot under heavy rain and neon glow.",
            shotType: "2.39:1 Anamorphic Scope",
          },
        };
        break;
      case "floorplan":
        newNode = {
          id,
          type: "floorplan",
          position: pos,
          data: {
            sceneTitle: "Custom Blocking",
            cameraCount: 3,
            onOpenDeck: () => {
              setActiveTab("deck");
              setDeckSubTab("blocking");
            },
          },
        };
        break;
      case "tensionCurve":
        newNode = {
          id,
          type: "tensionCurve",
          position: pos,
          data: {
            peakTension: 85,
            onOpenDeck: () => {
              setActiveTab("deck");
              setDeckSubTab("tension");
            },
          },
        };
        break;
      case "tableRead":
        newNode = {
          id,
          type: "tableRead",
          position: pos,
          data: {
            voiceCount: 2,
            onOpenPlayer: () => setShowTableRead(true),
          },
        };
        break;
      case "market":
        newNode = {
          id,
          type: "market",
          position: pos,
          data: {
            globalScore: 82,
            topTerritory: "North America & East Asia",
            onOpenHeatmap: () => {
              setActiveTab("deck");
              setDeckSubTab("territory");
            },
          },
        };
        break;
      default:
        return;
    }

    setNodes((nds) => [...nds, newNode]);
  };

  // Node Clicking Handlers
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    if (node.type === "characterCore") {
      const charName = (node.data as { name: string }).name;
      setActiveCharacterName(charName);
      setActiveTab("hotseat");
    } else if (node.type === "scene" || node.type === "script") {
      setScriptViewerOpen(true);
    } else if (node.type === "floorplan") {
      setActiveTab("deck");
      setDeckSubTab("blocking");
    } else if (node.type === "tensionCurve") {
      setActiveTab("deck");
      setDeckSubTab("tension");
    } else if (node.type === "market") {
      setActiveTab("deck");
      setDeckSubTab("territory");
    } else if (node.type === "tableRead") {
      setShowTableRead(true);
    } else if (node.type === "chemistry") {
      setActiveTab("chemistry");
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground select-none">
      {/* Top Production Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 bg-card/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Slate Hub
          </Button>

          <div className="h-4 w-[1px] bg-border" />

          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-accent" />
            <span className="font-heading text-sm font-bold text-foreground">
              {projectTitle}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            {PRESET_SCENARIOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => router.push(`/studio/${p.id}`)}
                className={`rounded px-2 py-0.5 text-xs font-mono transition-colors ${
                  projectId === p.id
                    ? "bg-accent/20 text-accent border border-accent/40"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setScriptViewerOpen(true)}
            className="gap-1.5 text-xs border-border/80 hover:bg-secondary"
          >
            <FileText className="h-3.5 w-3.5 text-accent" />
            <span>Screenplay</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTableRead(true)}
            className="gap-1.5 text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Table Read</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setMultiverseOpen(true)}
            className="gap-1.5 text-xs border-border/80 hover:bg-secondary"
          >
            <Shuffle className="h-3.5 w-3.5 text-purple-400" />
            <span>Alternate Takes</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setFusionOpen(true)}
            className="gap-1.5 text-xs border-accent/30 text-accent hover:bg-accent/10"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Film Fusion</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setNewProjectOpen(true)}
            className="gap-1.5 text-xs bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Slate</span>
          </Button>
        </div>
      </header>

      {/* Main Canvas Workspace with Unreal Blueprint Node Network */}
      <div className="relative flex-1 overflow-hidden bg-background">
        <StoryCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onAddNode={handleAddBlueprintNode}
        />
      </div>

      {/* Unified Cinema Dock (Bottom Workspace) */}
      <div className="flex h-80 shrink-0 flex-col border-t border-border bg-card/95 backdrop-blur">
        {/* Navigation Strip */}
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4 bg-secondary/30">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("hotseat")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === "hotseat"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Interrogation Chamber ({activeCharacterName})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("showrunner")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === "showrunner"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Showrunner AI Co-Pilot</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chemistry")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === "chemistry"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Users2 className="h-3.5 w-3.5 text-rose-400" />
              <span>Dream Casting Bench</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("deck")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === "deck"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Director's Deck Suite</span>
            </button>
          </div>

          {/* ClickHouse Live Status Badge */}
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ClickHouse Sub-ms Time-Gate Active</span>
          </div>
        </div>

        {/* Tab 1: Timeline Scrubber & Hot Seat Interrogation */}
        {activeTab === "hotseat" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-border/50 px-4 py-2 bg-background/50">
              <TimelineScrubber
                durationSeconds={DURATION_SECONDS}
                value={timeSeconds}
                onChange={setTimeSeconds}
                events={events}
              />
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <HotSeatChat
                characterName={activeCharacterName}
                characterArchetype={activeCharacter?.archetype}
                currentTimecode={formatTimecode(timeSeconds)}
                turns={hotSeatTurns}
                knownFacts={knownFacts}
                onSend={handleAskHotSeat}
                isAsking={isAsking}
                onInsertIntoScript={handleInsertIntoScript}
                suggestedQuestions={[
                  "Do you know who has the vault bypass keys?",
                  "Why won't you turn around and look at me?",
                  "Where were you when the security alarms triggered?",
                ]}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Showrunner AI Co-Pilot */}
        {activeTab === "showrunner" && (
          <div className="flex-1 overflow-hidden p-3">
            <ShowrunnerChat
              messages={showrunnerMessages}
              isThinking={isShowrunnerThinking}
              onSendMessage={handleSendShowrunner}
              suggestedPrompts={[
                "Critique the dramatic irony at Minute 34",
                "Suggest subtext revisions for Elena's dialogue",
                "Query ClickHouse box-office precedents for heist twists",
              ]}
            />
          </div>
        )}

        {/* Tab 3: Dream Casting Chemistry Bench */}
        {activeTab === "chemistry" && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                  <Flame className="h-4 w-4 text-rose-500" />
                  Impromptu Dynamic Friction Sandbox (Marcus vs Elena)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Tests how two contrasting character DNAs and vocal cadences clash under pressure.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleRunChemistry}
                disabled={isChemistryRunning}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold"
              >
                {isChemistryRunning ? "Generating Micro-Scene..." : "Run Chemistry Test"}
              </Button>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={chemistryScenario}
                onChange={(e) => setChemistryScenario(e.target.value)}
                placeholder="Enter an environmental conflict scenario..."
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground font-mono"
              />
            </div>

            {chemistrySceneOutput ? (
              <div className="rounded-lg border border-border bg-background/80 p-3 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap max-h-48 overflow-y-auto shadow-inner">
                {chemistrySceneOutput}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
                Click &ldquo;Run Chemistry Test&rdquo; to simulate an impromptu 1-page friction scene between Marcus and Elena.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Director's Deck Suite */}
        {activeTab === "deck" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-1.5 bg-secondary/20">
              <button
                type="button"
                onClick={() => setDeckSubTab("blocking")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  deckSubTab === "blocking"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                2D Camera Blocking
              </button>
              <button
                type="button"
                onClick={() => setDeckSubTab("tension")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  deckSubTab === "tension"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                3-Act Tension Curve
              </button>
              <button
                type="button"
                onClick={() => setDeckSubTab("territory")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  deckSubTab === "territory"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                Territory Box Office
              </button>
              <button
                type="button"
                onClick={() => setDeckSubTab("stripboard")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  deckSubTab === "stripboard"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                Production Stripboard
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {deckSubTab === "blocking" && <FloorPlanView sceneTitle={sceneTitle} />}
              {deckSubTab === "tension" && (
                <TensionCurveView
                  currentTimeSeconds={timeSeconds}
                  onScrubTime={setTimeSeconds}
                  projectId={projectId}
                />
              )}
              {deckSubTab === "territory" && (
                <TerritoryHeatmapView
                  projectTitle={projectTitle}
                  genre={matchedPreset.genre}
                />
              )}
              {deckSubTab === "stripboard" && (
                <StripboardView
                  projectTitle={projectTitle}
                  characters={characters}
                  projectId={projectId}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating ClickHouse Live Inspector (Bottom Right) */}
      <ClickHouseInspector logs={queryLogs} lastSql={lastSql} />

      {/* Modals & Dialogs */}
      <ScreenplayDialog
        open={scriptViewerOpen}
        onOpenChange={setScriptViewerOpen}
        title={sceneTitle}
        screenplayText={screenplayText}
      />

      <Dialog open={showTableRead} onOpenChange={setShowTableRead}>
        <DialogContent className="max-w-2xl bg-card border-border p-6 text-foreground">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold">
              Audio Table Read — Multi-Speaker Rehearsal
            </DialogTitle>
          </DialogHeader>
          <TableReadPlayer screenplayText={screenplayText} />
        </DialogContent>
      </Dialog>

      <MultiverseTakesDialog
        open={multiverseOpen}
        onOpenChange={setMultiverseOpen}
        onApplyTake={handleApplyTake}
      />

      <FilmFusionDialog
        open={fusionOpen}
        onOpenChange={setFusionOpen}
      />

      <NewProjectDialog
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
        onSubmit={async (data) => {
          const newPid = `project-${Date.now().toString(36)}`;
          setProjectId(newPid);
          setProjectTitle(data.title);
          setPremiseInput(data.logline);
          await runFullPipeline(newPid, data.logline);
        }}
      />
    </div>
  );
}
