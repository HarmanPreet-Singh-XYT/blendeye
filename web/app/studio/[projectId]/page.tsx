"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import type { Edge, Node } from "@xyflow/react";
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
import { ScreenplayDialog } from "@/components/cinema/screenplay-dialog";
import {
  ClickHouseInspector,
  type ClickHouseQueryLog,
} from "@/components/cinema/clickhouse-inspector";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Button } from "@/components/ui/button";
import {
  Film,
  Sparkles,
  Bot,
  UserCheck,
  FileText,
  Plus,
  ChevronRight,
  ArrowLeft,
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

ENGINEER RAY (20s, flight suit damp with sweat) clutches a manual seal kit, eyes fixed on the depressurizing inner hatch.

VANCE
Ray! The manual purge wasn't an electrical fault. Someone entered the primary override sequence from this console.

RAY
I just got here, Vance! I was in hydroponics when the alarms tripped.

VANCE
Hydroponics is locked behind Bulkhead C. That door has been sealed since 0600. Why were your override codes entered at 00:22:00?!

RAY
(swallowing hard, voice trembling)
Because if I didn't vent that compartment... whatever was growing inside would have reached life support.`,
    characters: [
      {
        name: "Vance",
        archetype: "Station commander, by-the-book, hyper-vigilant",
        speechStyle: "authoritative, sharp, commanding",
        subtextRatio: "low",
      },
      {
        name: "Ray",
        archetype: "Flight engineer, terrified, hiding an infection outbreak",
        speechStyle: "stammering, defensive, desperate",
        subtextRatio: "high",
      },
    ],
    initialEvents: [
      { atSeconds: 15 * 60, characterName: "Vance", eventType: "known_fact" as const },
      { atSeconds: 20 * 60, characterName: "Ray", eventType: "known_fact" as const },
      { atSeconds: 22 * 60, characterName: "Vance", eventType: "unaware_of" as const },
      { atSeconds: 45 * 60, characterName: "Vance", eventType: "known_fact" as const },
    ],
  },
];

type StudioTab = "screenplay" | "showrunner" | "hotseat";

export default function StudioProjectPage() {
  const router = useRouter();
  const params = useParams();
  const urlProjectId = typeof params.projectId === "string" ? params.projectId : "vault-heist-demo";

  // Find preset or default
  const matchedPreset = PRESET_SCENARIOS.find((p) => p.id === urlProjectId) || PRESET_SCENARIOS[0];

  // Project & Slate State
  const [projectId, setProjectId] = React.useState(urlProjectId);
  const [projectTitle, setProjectTitle] = React.useState(matchedPreset.title);
  const [premiseInput, setPremiseInput] = React.useState(matchedPreset.premise);

  // Script & Scene State
  const [sceneTitle, setSceneTitle] = React.useState(matchedPreset.sceneTitle);
  const [sceneSummary, setSceneSummary] = React.useState(matchedPreset.sceneSummary);
  const [screenplayText, setScreenplayText] = React.useState(matchedPreset.script);
  const [characters, setCharacters] = React.useState(matchedPreset.characters);
  const [activeCharacterName, setActiveCharacterName] = React.useState(matchedPreset.characters[0].name);

  // Timeline & Interrogation State
  const [timeSeconds, setTimeSeconds] = React.useState(34 * 60);
  const [events, setEvents] = React.useState<StoryEventMarker[]>(matchedPreset.initialEvents);
  const [knownFacts, setKnownFacts] = React.useState<KnowledgeFact[]>([]);
  const [hotSeatTurns, setHotSeatTurns] = React.useState<HotSeatTurn[]>([]);

  // Showrunner Central AI Chat State
  const [showrunnerMessages, setShowrunnerMessages] = React.useState<ShowrunnerMessage[]>([]);
  const [isShowrunnerThinking, setIsShowrunnerThinking] = React.useState(false);

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = React.useState<StudioTab>("hotseat");
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [scriptViewerOpen, setScriptViewerOpen] = React.useState(false);

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

  // Query ClickHouse Knowledge State for active character at current timestamp
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

  // Update knowledge state when scrubbing or switching characters
  React.useEffect(() => {
    fetchKnowledge(projectId, activeCharacterName, timeSeconds);
  }, [projectId, activeCharacterName, timeSeconds, fetchKnowledge]);

  // Load Preset Scenario
  const handleSelectPreset = (preset: (typeof PRESET_SCENARIOS)[0]) => {
    router.push(`/studio/${preset.id}`);
  };

  // Launch New Production from Modal
  const handleCreateNewProject = async (data: NewProjectFormData) => {
    const newPid = `project-${Date.now().toString(36)}`;
    setProjectId(newPid);
    setProjectTitle(data.title);
    setPremiseInput(`${data.logline} (Tone: ${data.genre}${data.characters ? `, Characters: ${data.characters}` : ""})`);
    setHotSeatTurns([]);
    setShowrunnerMessages([]);

    await runFullPipeline(newPid, data.logline);
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

  // Suggested Questions for Hot Seat
  const suggestedQuestions = React.useMemo(() => {
    if (activeCharacterName === "Marcus") {
      if (timeSeconds < 45 * 60) {
        return [
          "Do you know who has the vault keys?",
          "Did Elena mention the vault code to you?",
          "Are you nervous about the atmospheric vents?",
        ];
      }
      return [
        "Do you know who has the vault keys now?",
        "Did Elena betray the crew?",
        "What was inside the lockbox?",
      ];
    }
    if (activeCharacterName === "Elena") {
      return [
        "Why won't you tell Marcus where the keys are?",
        "What is your plan for the atmospheric vents?",
        "Do you trust Marcus with the bag?",
      ];
    }
    return [
      "What is your current objective?",
      "Who else is in the room with you?",
      "Do you know what happened outside?",
    ];
  }, [activeCharacterName, timeSeconds]);

  // Construct React Flow Graph Nodes
  const nodes: Node[] = React.useMemo(() => {
    const list: Node[] = [
      {
        id: "inspiration-node",
        type: "inspiration",
        position: { x: 0, y: 120 },
        data: {
          title: premiseInput.slice(0, 48) + "...",
          state: isGenerating ? "generating" : "ready",
        },
      },
      {
        id: "scene-node",
        type: "scene",
        position: { x: 340, y: 0 },
        data: {
          title: sceneTitle,
          state: isGenerating ? "generating" : "ready",
          summary: sceneSummary,
          characterCount: characters.length,
          onViewScript: () => setScriptViewerOpen(true),
        },
      },
      {
        id: "storyboard-node",
        type: "storyboard",
        position: { x: 340, y: 220 },
        data: {
          prompt:
            projectId === "vault-heist-demo"
              ? "Low-angle master shot of Marcus kneeling by open safety boxes under cyan auxiliary glow; Elena stands cold in foreground shadow."
              : "Zero-G perspective of Commander Vance floating towards the fogged airlock hatch as warning strobes pulse.",
          shotType: "2.39:1 Anamorphic Scope",
          lighting:
            projectId === "vault-heist-demo"
              ? "Cyan neon & deep shadows"
              : "Amber hazard strobe",
        },
      },
    ];

    characters.forEach((char, index) => {
      const yPos = -90 + index * 110;
      list.push({
        id: `char-${char.name.toLowerCase()}`,
        type: "character",
        position: { x: 720, y: yPos },
        data: {
          name: char.name,
          archetype: char.archetype,
          state: isGenerating ? "generating" : "ready",
          isSelected: activeCharacterName === char.name,
        },
      });
    });

    return list;
  }, [
    premiseInput,
    isGenerating,
    sceneTitle,
    sceneSummary,
    characters,
    activeCharacterName,
    projectId,
  ]);

  // Construct React Flow Edges
  const edges: Edge[] = React.useMemo(() => {
    const list: Edge[] = [
      {
        id: "e-insp-scene",
        source: "inspiration-node",
        target: "scene-node",
        className: isGenerating ? "generating" : "",
      },
      {
        id: "e-scene-storyboard",
        source: "scene-node",
        target: "storyboard-node",
        className: isGenerating ? "generating" : "",
      },
    ];

    characters.forEach((char) => {
      list.push({
        id: `e-scene-${char.name.toLowerCase()}`,
        source: "scene-node",
        target: `char-${char.name.toLowerCase()}`,
        className: isGenerating ? "generating" : "",
      });
    });

    return list;
  }, [characters, isGenerating]);

  // Handle clicking on character nodes in the graph
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    if (node.type === "character") {
      const charName = (node.data as { name: string }).name;
      setActiveCharacterName(charName);
      setActiveTab("hotseat");
    } else if (node.type === "scene") {
      setActiveTab("screenplay");
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
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Slate Hub
          </Button>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-accent" />
            <SlateLabel>{projectTitle}</SlateLabel>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">{sceneTitle}</span>
          </div>
        </div>

        {/* Center: Live Generation Stage Status */}
        {isGenerating && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent text-xs animate-pulse">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>{generationStage}</span>
          </div>
        )}

        {/* Right: Presets & New Project Launcher */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground px-2">
              Presets:
            </span>
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  projectId === preset.id
                    ? "bg-card text-foreground font-semibold shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setNewProjectOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            New Film Slate
          </Button>
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className="flex-1 grid grid-cols-1 overflow-hidden lg:grid-cols-[1fr_440px] p-3 gap-3">
        {/* Left: Interactive Story Canvas & Timeline Scrubber */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* React Flow Story Graph */}
          <div className="flex-1 min-h-0 relative">
            <StoryCanvas
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              onNodesChange={() => {}}
              onEdgesChange={() => {}}
              onConnect={() => {}}
            />

            {/* Quick Character Picker Overlay */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 backdrop-blur p-1.5 shadow-md">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold px-1">
                Active Actor:
              </span>
              {characters.map((char) => (
                <button
                  key={char.name}
                  type="button"
                  onClick={() => {
                    setActiveCharacterName(char.name);
                    setActiveTab("hotseat");
                  }}
                  className={`px-2 py-0.5 rounded text-xs transition-all ${
                    activeCharacterName === char.name
                      ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {char.name}
                </button>
              ))}
            </div>
          </div>

          {/* Persistent Timeline Scrubber */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm shrink-0">
            <TimelineScrubber
              durationSeconds={DURATION_SECONDS}
              value={timeSeconds}
              onChange={(s) => setTimeSeconds(s)}
              events={events}
            />

            {/* Story Beat Quick-Jumps */}
            <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Story Beats:
                </span>
                <button
                  type="button"
                  onClick={() => setTimeSeconds(28 * 60)}
                  className="rounded px-1.5 py-0.5 text-[11px] border border-border hover:border-accent hover:text-accent font-mono transition-colors"
                >
                  00:28:00 (Pre-Vault)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeSeconds(34 * 60)}
                  className={`rounded px-1.5 py-0.5 text-[11px] border font-mono transition-colors ${
                    timeSeconds === 34 * 60
                      ? "border-accent bg-accent/10 text-accent font-semibold"
                      : "border-border hover:border-accent hover:text-accent"
                  }`}
                >
                  00:34:00 (The Missing Keys)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeSeconds(52 * 60)}
                  className={`rounded px-1.5 py-0.5 text-[11px] border font-mono transition-colors ${
                    timeSeconds === 52 * 60
                      ? "border-accent bg-accent/10 text-accent font-semibold"
                      : "border-border hover:border-accent hover:text-accent"
                  }`}
                >
                  00:52:00 (The Betrayal)
                </button>
              </div>

              <span className="font-mono text-[11px] text-muted-foreground hidden sm:inline">
                ClickHouse filtered by `WHERE timestamp &lt;= {formatTimecode(timeSeconds)}`
              </span>
            </div>
          </div>
        </div>

        {/* Right: Unified Cinema Dock (Screenplay | Showrunner AI | Hot Seat) */}
        <div className="flex flex-col min-h-0 overflow-hidden rounded-xl border border-border bg-card">
          {/* Tab Navigation Header */}
          <div className="flex items-center justify-between border-b border-border p-2 bg-secondary/30">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("hotseat")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "hotseat"
                    ? "bg-card text-foreground font-semibold border border-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5 text-accent" />
                <span>Hot Seat ({activeCharacterName})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("showrunner")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "showrunner"
                    ? "bg-card text-foreground font-semibold border border-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bot className="h-3.5 w-3.5 text-accent" />
                <span>Showrunner AI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("screenplay")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "screenplay"
                    ? "bg-card text-foreground font-semibold border border-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-accent" />
                <span>Screenplay</span>
              </button>
            </div>
          </div>

          {/* Tab Content 1: Hot Seat Interrogation */}
          {activeTab === "hotseat" && (
            <div className="flex-1 min-h-0 flex flex-col">
              <HotSeatChat
                characterName={activeCharacterName}
                characterArchetype={activeCharacter?.archetype}
                currentTimecode={formatTimecode(timeSeconds)}
                knownFacts={knownFacts}
                turns={hotSeatTurns}
                onSend={handleAskHotSeat}
                isAsking={isAsking}
                suggestedQuestions={suggestedQuestions}
                className="h-full border-none rounded-none"
              />
            </div>
          )}

          {/* Tab Content 2: Showrunner Central AI Chat */}
          {activeTab === "showrunner" && (
            <div className="flex-1 min-h-0 flex flex-col">
              <ShowrunnerChat
                messages={showrunnerMessages}
                onSendMessage={handleSendShowrunner}
                isThinking={isShowrunnerThinking}
                className="h-full border-none rounded-none"
              />
            </div>
          )}

          {/* Tab Content 3: Screenplay Reader */}
          {activeTab === "screenplay" && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-secondary/20">
                <div>
                  <SlateLabel>Production Draft</SlateLabel>
                  <span className="text-xs font-medium block">{sceneTitle}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setScriptViewerOpen(true)}
                >
                  Full Screen
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-accent/30 selection:text-accent-foreground text-foreground/90 bg-background/50">
                {screenplayText}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: ClickHouse Query Inspector */}
      <div className="px-3 pb-2 shrink-0">
        <ClickHouseInspector logs={queryLogs} lastSql={lastSql} />
      </div>

      {/* New Project Setup Dialog */}
      <NewProjectDialog
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
        onSubmit={handleCreateNewProject}
        isSubmitting={isGenerating}
      />

      {/* Full-Screen Screenplay Dialog */}
      <ScreenplayDialog
        open={scriptViewerOpen}
        onOpenChange={setScriptViewerOpen}
        title={sceneTitle}
        summary={sceneSummary}
        screenplayText={screenplayText}
      />
    </div>
  );
}
