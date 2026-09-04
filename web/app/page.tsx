"use client";

import * as React from "react";
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
import { ScreenplayDialog } from "@/components/cinema/screenplay-dialog";
import {
  ClickHouseInspector,
  type ClickHouseQueryLog,
} from "@/components/cinema/clickhouse-inspector";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Film, Play, RotateCcw } from "lucide-react";

const DURATION_SECONDS = 90 * 60; // 90 min feature runtime

const INITIAL_PROJECT_ID = "vault-heist-demo";

const PRESET_SCENARIOS = [
  {
    id: "vault-heist-demo",
    title: "The Vault Heist",
    premise:
      "A heist crew breaches an underground vault, but Marcus realizes the exit keys are missing and Elena is hiding something.",
    sceneTitle: "The Vault — Scene 04",
    sceneSummary:
      "Marcus searches his vest for the sub-level keys. Elena refuses to make eye contact while Teo watches the perimeter corridor.",
    script: `INT. UNDERGROUND VAULT - NIGHT

Thick steel walls. Blue auxiliary lights buzz. 

MARCUS (30s, nervous sweat) kneels by the deposit boxes, rummaging through an olive canvas bag. His breathing is ragged.

MARCUS
They're not here. Elena. The bypass keys. They're not in the bag.

ELENA (40s, calm, immaculate tailored dark coat) stands by the electronic timer display. She doesn't turn around.

ELENA
Check the side pouch, Marcus.

MARCUS
I checked the pouch! I checked twice! You were the last one at the service tunnel staging locker. Tell me you didn't leave them.

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
        archetype: "Getaway driver, loyal but rattles easily",
        speechStyle: "terse, breathless, defensive",
        subtextRatio: "high",
      },
      {
        name: "Elena",
        archetype: "Mastermind, calculated, concealing a private deal",
        speechStyle: "measured, icy, dismissive",
        subtextRatio: "extreme",
      },
      {
        name: "Teo",
        archetype: "Muscle & look-out outside vault door",
        speechStyle: "casual, street-smart, impatient",
        subtextRatio: "low",
      },
    ],
    initialEvents: [
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
    premise:
      "In deep space, oxygen pressure drops in Module 4. Commander Vance discovers the purge valve was manually overridden from inside.",
    sceneTitle: "Module 4 Airlock — Scene 02",
    sceneSummary:
      "Vance interrogates Engineer Ray as pressure drops. Ray insists he was in hydroponics, but the access log says otherwise.",
    script: `INT. ORBITAL RESEARCH MODULE - ZERO GRAVITY

Emergency amber sirens pulse. Debris drifts past fractured conduits.

COMMANDER VANCE (50s, battle-hardened) pulls himself along the handrail towards the airlock terminal. 

ENGINEER RAY (20s, disheveled flight suit) clutches a manual seal kit, eyes darting to the depressurizing hatch.

VANCE
Ray! The manual purge wasn't an electrical fault. Someone entered the primary override sequence from this console.

RAY
I just got here, Vance! I was in hydroponics when the alarms tripped.

VANCE
Hydroponics is locked behind bulkhead C. That door has been sealed since 0600. Why were your override codes entered at 00:22:00?!

RAY
(swallowing hard)
Because if I didn't vent that compartment... whatever was growing inside would have reached life support.`,
    characters: [
      {
        name: "Vance",
        archetype: "Station commander, by-the-book, suspicious",
        speechStyle: "authoritative, sharp",
        subtextRatio: "low",
      },
      {
        name: "Ray",
        archetype: "Flight engineer, terrified, hiding an infection",
        speechStyle: "stammering, defensive",
        subtextRatio: "high",
      },
    ],
    initialEvents: [
      { atSeconds: 20 * 60, characterName: "Ray", eventType: "known_fact" as const },
      { atSeconds: 22 * 60, characterName: "Vance", eventType: "unaware_of" as const },
      { atSeconds: 45 * 60, characterName: "Vance", eventType: "known_fact" as const },
    ],
  },
];

export default function CinemaStudioPage() {
  const [activeScenario, setActiveScenario] = React.useState(PRESET_SCENARIOS[0]);
  const [projectId, setProjectId] = React.useState(INITIAL_PROJECT_ID);
  const [premiseInput, setPremiseInput] = React.useState(PRESET_SCENARIOS[0].premise);

  const [sceneTitle, setSceneTitle] = React.useState(PRESET_SCENARIOS[0].sceneTitle);
  const [sceneSummary, setSceneSummary] = React.useState(PRESET_SCENARIOS[0].sceneSummary);
  const [screenplayText, setScreenplayText] = React.useState(PRESET_SCENARIOS[0].script);
  const [characters, setCharacters] = React.useState(PRESET_SCENARIOS[0].characters);
  const [activeCharacterName, setActiveCharacterName] = React.useState("Marcus");

  const [timeSeconds, setTimeSeconds] = React.useState(34 * 60);
  const [events, setEvents] = React.useState<StoryEventMarker[]>(PRESET_SCENARIOS[0].initialEvents);
  const [knownFacts, setKnownFacts] = React.useState<KnowledgeFact[]>([]);
  const [turns, setTurns] = React.useState<HotSeatTurn[]>([]);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isAsking, setIsAsking] = React.useState(false);
  const [scriptOpen, setScriptOpen] = React.useState(false);
  const [queryLogs, setQueryLogs] = React.useState<ClickHouseQueryLog[]>([]);
  const [lastSql, setLastSql] = React.useState<string>("");

  const activeCharacter = characters.find((c) => c.name === activeCharacterName) || characters[0];

  // Helper to append a ClickHouse query log
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
        ...prev.slice(0, 19),
      ]);
    },
    []
  );

  // Fetch ClickHouse knowledge state for the selected character and timestamp
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

  // Fetch events when project changes
  const fetchProjectEvents = React.useCallback(
    async (pid: string) => {
      try {
        const res = await fetch(`/api/events?projectId=${encodeURIComponent(pid)}`);
        if (res.ok) {
          const rawEvents = await res.json();
          if (Array.isArray(rawEvents) && rawEvents.length > 0) {
            const parsed: StoryEventMarker[] = rawEvents.map((ev: { event_timestamp: string; character_name: string; event_type: StoryEventMarker["eventType"] }) => {
              const parts = ev.event_timestamp.split(":").map(Number);
              const totalSec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
              return {
                atSeconds: totalSec,
                characterName: ev.character_name,
                eventType: ev.event_type,
              };
            });
            setEvents(parsed);
          }
        }
      } catch (err) {
        console.error("Events fetch error:", err);
      }
    },
    []
  );

  // Trigger knowledge update whenever character or timecode changes
  React.useEffect(() => {
    fetchKnowledge(projectId, activeCharacterName, timeSeconds);
  }, [projectId, activeCharacterName, timeSeconds, fetchKnowledge]);

  // Load a preset scenario
  const handleSelectPreset = (preset: (typeof PRESET_SCENARIOS)[0]) => {
    setActiveScenario(preset);
    setProjectId(preset.id);
    setPremiseInput(preset.premise);
    setSceneTitle(preset.sceneTitle);
    setSceneSummary(preset.sceneSummary);
    setScreenplayText(preset.script);
    setCharacters(preset.characters);
    setActiveCharacterName(preset.characters[0].name);
    setEvents(preset.initialEvents);
    setTimeSeconds(34 * 60);
    setTurns([]);
  };

  // Run full generation + sharding pipeline with Gemini 3.7 & ClickHouse
  const handleGenerateAndShard = async () => {
    if (!premiseInput.trim() || isGenerating) return;
    setIsGenerating(true);
    const newPid = `project-${Date.now().toString(36)}`;
    setProjectId(newPid);
    setTurns([]);

    try {
      // Step 1: Generate Master Script
      const scriptRes = await fetch("/api/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ premise: premiseInput }),
      });
      if (!scriptRes.ok) throw new Error("Script generation failed");
      const scriptData = await scriptRes.json();
      const generatedScript = scriptData.screenplay_text;
      setScreenplayText(generatedScript);

      // Step 2: Perspective Sharding into ClickHouse
      const shardRes = await fetch("/api/sharding/shard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: newPid,
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

      // Log ClickHouse insertions
      logClickHouseQuery(
        `INSERT INTO story_events VALUES (${shardData.events_written} events committed)`,
        "insert",
        12
      );

      // Refresh events from ClickHouse
      await fetchProjectEvents(newPid);
    } catch (err) {
      console.error("Pipeline failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Interrogate character
  const handleAskHotSeat = async (question: string) => {
    if (!question.trim() || isAsking) return;
    setIsAsking(true);

    const userTurn: HotSeatTurn = { role: "interviewer", content: question };
    setTurns((prev) => [...prev, userTurn]);

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
          priorTurns: turns.slice(-6).map((t) => ({ role: t.role, content: t.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const characterTurn: HotSeatTurn = {
          role: "character",
          content: data.answer,
          isWithinFirewall: data.is_within_firewall,
        };
        setTurns((prev) => [...prev, characterTurn]);
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

  // Suggested questions based on timecode and scenario
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

  // Construct React Flow graph nodes
  const nodes: Node[] = React.useMemo(() => {
    const list: Node[] = [
      {
        id: "inspiration-node",
        type: "inspiration",
        position: { x: 0, y: 120 },
        data: {
          title: premiseInput.slice(0, 50) + "...",
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
          onViewScript: () => setScriptOpen(true),
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

    // Layer 3: Visual Payoff Storyboard Frame
    list.push({
      id: "storyboard-node",
      type: "storyboard",
      position: { x: 340, y: 220 },
      data: {
        prompt:
          activeScenario.id === "vault-heist-demo"
            ? "Low-angle master shot of Marcus kneeling by open safety boxes under cyan auxiliary glow; Elena stands cold in foreground shadow."
            : "Zero-G perspective of Commander Vance floating towards the fogged airlock hatch as warning strobes pulse.",
        shotType: "2.39:1 Anamorphic Scope",
        lighting: activeScenario.id === "vault-heist-demo" ? "Cyan neon & deep shadows" : "Amber hazard strobe",
      },
    });

    return list;
  }, [premiseInput, isGenerating, sceneTitle, sceneSummary, characters, activeCharacterName, activeScenario.id]);

  // Construct React Flow edges
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground select-none">
      {/* Top Header Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 bg-card/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Film className="h-5 w-5 text-accent" />
            <span className="font-heading font-semibold tracking-tight text-sm md:text-base">
              Agentic Cinema
            </span>
          </div>
          <span className="text-border">/</span>
          <SlateLabel>Live Writers&apos; Room</SlateLabel>
          <Badge
            variant="outline"
            className="hidden sm:inline-flex border-accent/40 bg-accent/10 text-accent text-[10px]"
          >
            Gemini 3.7 + ClickHouse
          </Badge>
        </div>

        {/* Preset Selectors & Actions */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-xs text-muted-foreground">Demo Presets:</span>
          {PRESET_SCENARIOS.map((preset) => (
            <Button
              key={preset.id}
              variant={activeScenario.id === preset.id ? "secondary" : "ghost"}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleSelectPreset(preset)}
            >
              {preset.title}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setScriptOpen(true)}
          >
            <Play className="h-3.5 w-3.5" />
            Script
          </Button>
        </div>
      </header>

      {/* Quick Prompt Input Bar */}
      <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-2">
        <div className="relative flex-1">
          <Input
            value={premiseInput}
            onChange={(e) => setPremiseInput(e.target.value)}
            disabled={isGenerating}
            placeholder="Describe a scene premise for the writers' room..."
            className="h-8 text-xs bg-background/80 border-border"
          />
        </div>
        <Button
          size="sm"
          className="h-8 text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
          onClick={handleGenerateAndShard}
          disabled={isGenerating || !premiseInput.trim()}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {isGenerating ? "Sharding Perspective..." : "Generate & Shard"}
        </Button>
      </div>

      {/* Main Studio Body: Canvas + Hot Seat */}
      <div className="flex-1 grid grid-cols-1 overflow-hidden lg:grid-cols-[1fr_420px] p-3 gap-3">
        {/* Left: Canvas & Timeline Scrubber */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* React Flow Story Graph */}
          <div className="flex-1 min-h-0 relative">
            <StoryCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={() => {}}
              onEdgesChange={() => {}}
              onConnect={() => {}}
            />
            {/* Quick Character Picker overlay inside canvas */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 backdrop-blur p-1.5 shadow-md">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold px-1">
                Interrogate:
              </span>
              {characters.map((char) => (
                <button
                  key={char.name}
                  type="button"
                  onClick={() => setActiveCharacterName(char.name)}
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

          {/* Timeline Scrubber Card */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm shrink-0">
            <TimelineScrubber
              durationSeconds={DURATION_SECONDS}
              value={timeSeconds}
              onChange={(s) => setTimeSeconds(s)}
              events={events}
            />

            {/* Timeline Bookmark Quick-Jumps */}
            <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Key Story Beats:
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
                  00:52:00 (The Reveal)
                </button>
              </div>

              <span className="font-mono text-[11px] text-muted-foreground">
                ClickHouse filtered by `timestamp &lt;= {formatTimecode(timeSeconds)}`
              </span>
            </div>
          </div>
        </div>

        {/* Right: Hot-Seat Interrogation Chamber */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          <HotSeatChat
            characterName={activeCharacterName}
            characterArchetype={activeCharacter?.archetype}
            currentTimecode={formatTimecode(timeSeconds)}
            knownFacts={knownFacts}
            turns={turns}
            onSend={handleAskHotSeat}
            isAsking={isAsking}
            suggestedQuestions={suggestedQuestions}
            className="h-full"
          />
        </div>
      </div>

      {/* Bottom: ClickHouse Query Inspector */}
      <div className="px-3 pb-2 shrink-0">
        <ClickHouseInspector logs={queryLogs} lastSql={lastSql} />
      </div>

      {/* Screenplay Viewer Dialog */}
      <ScreenplayDialog
        open={scriptOpen}
        onOpenChange={setScriptOpen}
        title={sceneTitle}
        summary={sceneSummary}
        screenplayText={screenplayText}
      />
    </div>
  );
}
