"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { MarkdownRenderer } from "@/components/cinema/markdown-renderer";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { usePanelRef } from "react-resizable-panels";
import { StudioInspector } from "@/components/cinema/studio-inspector";
import { cn } from "@/lib/utils";
import {
  Film,
  Sparkles,
  Bot,
  UserCheck,
  FileText,
  Plus,
  ArrowLeft,
  Shuffle,
  Sliders,
  Layers,
  Volume2,
  Users2,
  Flame,
  Square,
  Rows,
  PanelBottom,
  PanelBottomClose,
  PanelBottomOpen,
  Maximize2,
  Minimize2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { ShowrunnerMessage } from "@/lib/agent-service";
import {
  getAllProjects,
  getProjectById,
  saveProject,
  createNewProjectEntry,
  buildProjectNodesAndEdges,
  type ProjectData,
  type ProjectCharacter,
  type NodeCallbacks,
  SEED_PROJECTS,
} from "@/lib/project-store";

const DURATION_SECONDS = 90 * 60; // 90 min feature runtime

export const PRESET_SCENARIOS = SEED_PROJECTS;

type StudioTab = "hotseat" | "showrunner" | "chemistry" | "screenplay" | "deck";
type DeckSubTab = "blocking" | "tension" | "territory" | "stripboard";

export default function StudioPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawProjectId = (params?.projectId as string) || "vault-heist-demo";
  const shouldAutoRunPipeline = searchParams?.get("pipeline") === "1";

  // Load project from persistent store (or seed presets)
  const initialProject = React.useMemo(() => {
    return getProjectById(rawProjectId) || SEED_PROJECTS[0];
  }, [rawProjectId]);

  // Core Production State
  const [projectId, setProjectId] = React.useState(initialProject.id);
  const [projectTitle, setProjectTitle] = React.useState(initialProject.title);
  const [genre, setGenre] = React.useState(initialProject.genre);
  const [premiseInput, setPremiseInput] = React.useState(initialProject.premise);
  const [sceneTitle, setSceneTitle] = React.useState(initialProject.sceneTitle);
  const [sceneSummary, setSceneSummary] = React.useState(initialProject.sceneSummary);
  const [screenplayText, setScreenplayText] = React.useState(initialProject.screenplayText);
  const [characters, setCharacters] = React.useState<ProjectCharacter[]>(initialProject.characters);
  const [activeCharacterName, setActiveCharacterName] = React.useState<string>(
    initialProject.characters[0]?.name || "Marcus"
  );

  // Slates list for navigation
  const [allProjects, setAllProjects] = React.useState<ProjectData[]>([]);

  React.useEffect(() => {
    setAllProjects(getAllProjects());
  }, [projectId]);

  // Timeline & Interrogation State
  const [timeSeconds, setTimeSeconds] = React.useState(34 * 60);
  const [events, setEvents] = React.useState<StoryEventMarker[]>(initialProject.initialEvents || []);
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

  React.useEffect(() => {
    fetchProjectEvents(projectId);
  }, [projectId, fetchProjectEvents]);

  // Dialogue Insertion Micro-Interaction
  const handleInsertIntoScript = (characterName: string, dialogue: string) => {
    const formatted = `\n\n${characterName.toUpperCase()}\n(interrogation alternate)\n${dialogue}\n`;
    setScreenplayText((prev) => {
      const updated = prev + formatted;
      saveCurrentProject({ screenplayText: updated });
      return updated;
    });
  };

  // Helper to persist current state
  const saveCurrentProject = React.useCallback(
    (partial?: Partial<ProjectData>) => {
      const proj: ProjectData = {
        id: projectId,
        title: projectTitle,
        genre: genre,
        premise: premiseInput,
        sceneTitle: sceneTitle,
        sceneSummary: sceneSummary,
        screenplayText: screenplayText,
        characters: characters,
        initialEvents: events,
        createdAt: initialProject.createdAt,
        updatedAt: Date.now(),
        isCustom: initialProject.isCustom,
        ...partial,
      };
      saveProject(proj);
      setAllProjects(getAllProjects());
    },
    [
      projectId,
      projectTitle,
      genre,
      premiseInput,
      sceneTitle,
      sceneSummary,
      screenplayText,
      characters,
      events,
      initialProject,
    ]
  );

  // Chemistry Test Execution
  const handleRunChemistry = async () => {
    setIsChemistryRunning(true);
    const charA = characters[0] || { name: "Lead", archetype: "Protagonist" };
    const charB = characters[1] || characters[0] || { name: "Counterpart", archetype: "Antagonist" };

    try {
      const res = await fetch("/api/character/chemistry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          char_a_name: charA.name,
          char_a_dna: `${charA.name}: ${charA.archetype}, ${charA.speechStyle || "naturalistic"}`,
          char_b_name: charB.name,
          char_b_dna: `${charB.name}: ${charB.archetype}, ${charB.speechStyle || "measured"}`,
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

  // Dynamic Blueprint Node Callbacks
  const nodeCallbacks: NodeCallbacks = React.useMemo(
    () => ({
      onOpenHotSeat: (charName: string) => {
        setActiveCharacterName(charName);
        setActiveTab("hotseat");
      },
      onGenerateDraft: () => {
        runFullPipeline(projectId, premiseInput);
      },
      onViewScript: () => {
        setScriptViewerOpen(true);
      },
      onOpenDeck: (subTab) => {
        setActiveTab("deck");
        setDeckSubTab(subTab);
      },
      onOpenTableRead: () => {
        setShowTableRead(true);
      },
      onOpenHeatmap: () => {
        setActiveTab("deck");
        setDeckSubTab("territory");
      },
      onRunChemistry: () => {
        handleRunChemistry();
      },
    }),
    [projectId, premiseInput]
  );

  // Generate initial React Flow nodes & edges directly from project data
  const initialGraph = React.useMemo(() => {
    return buildProjectNodesAndEdges(initialProject, nodeCallbacks, isGenerating);
  }, [initialProject, nodeCallbacks, isGenerating]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);

  // Update nodes and edges whenever project graph needs re-sync
  const syncGraphWithProject = React.useCallback(
    (proj: ProjectData) => {
      const { nodes: newNodes, edges: newEdges } = buildProjectNodesAndEdges(
        proj,
        nodeCallbacks,
        false
      );
      setNodes(newNodes);
      setEdges(newEdges);
    },
    [nodeCallbacks, setNodes, setEdges]
  );

  // Run Script Generation & Sharding Pipeline
  const runFullPipeline = async (pid: string, premise: string) => {
    setIsGenerating(true);
    try {
      setGenerationStage("Drafting Master Screenplay (Gemini 3.7 Flash)...");
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

      const newSceneTitle = shardData.scene_title || `${projectTitle} — Scene 01`;
      const newSceneSummary = shardData.scene_summary || premise;
      setSceneTitle(newSceneTitle);
      setSceneSummary(newSceneSummary);

      let newCharacters: ProjectCharacter[] = characters;
      if (Array.isArray(shardData.characters) && shardData.characters.length > 0) {
        newCharacters = shardData.characters.map((c: any) => ({
          name: c.name,
          archetype: c.archetype,
          speechStyle: c.speech_style || "naturalistic",
          subtextRatio: c.subtext_ratio || "high",
          actorComp: `${c.name} Comp`,
          objective: "Confront the central crisis",
        }));
        setCharacters(newCharacters);
        setActiveCharacterName(newCharacters[0].name);
      }

      logClickHouseQuery(
        `INSERT INTO story_events VALUES (${shardData.events_written} events committed)`,
        "insert",
        15
      );

      setGenerationStage("Finalizing Timeline & Syncing Graph...");
      await fetchProjectEvents(pid);

      const updatedProject: ProjectData = {
        id: pid,
        title: projectTitle,
        genre: genre,
        premise: premise,
        sceneTitle: newSceneTitle,
        sceneSummary: newSceneSummary,
        screenplayText: generatedScript,
        characters: newCharacters,
        initialEvents: events,
        createdAt: initialProject.createdAt,
        updatedAt: Date.now(),
        isCustom: true,
      };

      saveProject(updatedProject);
      syncGraphWithProject(updatedProject);
      setActiveTab("hotseat");
    } catch (err) {
      console.error("Pipeline failed:", err);
    } finally {
      setIsGenerating(false);
      setGenerationStage("");
    }
  };

  // Re-shard script after user edits
  const handleReshardScript = async (newScript: string) => {
    setIsGenerating(true);
    setGenerationStage("Re-sharding Perspectives with Gemini 3.7 & ClickHouse...");
    try {
      const shardRes = await fetch("/api/sharding/shard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          screenplayText: newScript,
        }),
      });
      if (!shardRes.ok) throw new Error("Perspective sharding failed");
      const shardData = await shardRes.json();

      if (shardData.scene_title) setSceneTitle(shardData.scene_title);
      if (shardData.scene_summary) setSceneSummary(shardData.scene_summary);

      let updatedChars = characters;
      if (Array.isArray(shardData.characters) && shardData.characters.length > 0) {
        updatedChars = shardData.characters.map((c: any) => ({
          name: c.name,
          archetype: c.archetype,
          speechStyle: c.speech_style || "naturalistic",
          subtextRatio: c.subtext_ratio || "moderate",
          actorComp: `${c.name} Comp`,
          objective: "Resolve scene conflict",
        }));
        setCharacters(updatedChars);
        setActiveCharacterName(updatedChars[0].name);
      }

      setScreenplayText(newScript);

      const updatedProject: ProjectData = {
        id: projectId,
        title: projectTitle,
        genre: genre,
        premise: premiseInput,
        sceneTitle: shardData.scene_title || sceneTitle,
        sceneSummary: shardData.scene_summary || sceneSummary,
        screenplayText: newScript,
        characters: updatedChars,
        initialEvents: events,
        createdAt: initialProject.createdAt,
        updatedAt: Date.now(),
        isCustom: true,
      };

      saveProject(updatedProject);
      syncGraphWithProject(updatedProject);

      logClickHouseQuery(
        `INSERT INTO story_events VALUES (${shardData.events_written} events committed)`,
        "insert",
        12
      );
      await fetchProjectEvents(projectId);
    } catch (err) {
      console.error("Resharding failed:", err);
    } finally {
      setIsGenerating(false);
      setGenerationStage("");
    }
  };

  // Multiverse Take Application with automatic ClickHouse re-sharding
  const handleApplyTake = async (take: MultiverseTake) => {
    setScreenplayText(take.scriptSnippet);
    setSceneSummary(take.synopsis);
    saveCurrentProject({ screenplayText: take.scriptSnippet, sceneSummary: take.synopsis });
    await handleReshardScript(take.scriptSnippet);
  };

  // Trigger auto pipeline if navigated with ?pipeline=1 or brand new empty custom project
  React.useEffect(() => {
    if (shouldAutoRunPipeline || (initialProject.isCustom && !initialProject.screenplayText)) {
      runFullPipeline(initialProject.id, initialProject.premise);
    }
  }, [shouldAutoRunPipeline]);

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

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const inspectorPanelRef = usePanelRef();
  const topPanelRef = usePanelRef();
  const bottomPanelRef = usePanelRef();
  const [layoutMode, setLayoutMode] = React.useState<"split" | "canvas-only" | "dock-only">("split");

  const setViewMode = React.useCallback(
    (mode: "split" | "canvas-only" | "dock-only") => {
      setLayoutMode(mode);
      if (mode === "canvas-only") {
        bottomPanelRef.current?.collapse();
        inspectorPanelRef.current?.collapse();
        setIsSidebarOpen(false);
        topPanelRef.current?.expand();
        topPanelRef.current?.resize("100%");
      } else if (mode === "dock-only") {
        topPanelRef.current?.collapse();
        bottomPanelRef.current?.expand();
        bottomPanelRef.current?.resize("100%");
      } else {
        // "split"
        topPanelRef.current?.expand();
        bottomPanelRef.current?.expand();
        topPanelRef.current?.resize("65%");
        bottomPanelRef.current?.resize("35%");
      }
    },
    [topPanelRef, bottomPanelRef, inspectorPanelRef]
  );

  const toggleSidebar = React.useCallback(() => {
    const panel = inspectorPanelRef.current;
    if (!panel) {
      setIsSidebarOpen((prev) => !prev);
      return;
    }
    if (panel.isCollapsed()) {
      panel.expand();
      setIsSidebarOpen(true);
    } else {
      panel.collapse();
      setIsSidebarOpen(false);
    }
  }, [inspectorPanelRef]);

  const [selectedNode, setSelectedNode] = React.useState<Node | null>(() => nodes[5] || nodes[0] || null);

  // Two-way synchronization between inspector edits and project state
  const handleUpdateNodeData = React.useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return { ...n, data: { ...n.data, ...newData } };
          }
          return n;
        })
      );
      setSelectedNode((prev) =>
        prev && prev.id === nodeId ? { ...prev, data: { ...prev.data, ...newData } } : prev
      );

      // Two-way synchronization with Project State
      if (nodeId.startsWith("node-core-")) {
        const charName = (newData.name as string) || "";
        const charArchetype = (newData.archetype as string) || "";
        const charObj = (newData.objective as string) || "";
        if (charName || charArchetype || charObj) {
          setCharacters((prevChars) => {
            const updated = prevChars.map((c) => {
              if (`node-core-${c.name.toLowerCase()}` === nodeId) {
                return {
                  ...c,
                  name: charName || c.name,
                  archetype: charArchetype || c.archetype,
                  objective: charObj || c.objective,
                };
              }
              return c;
            });
            saveCurrentProject({ characters: updated });
            return updated;
          });
          if (charName) setActiveCharacterName(charName);
        }
      } else if (nodeId === "node-scene-1") {
        if (newData.title) {
          setSceneTitle(newData.title as string);
          saveCurrentProject({ sceneTitle: newData.title as string });
        }
        if (newData.stakes) {
          setSceneSummary(newData.stakes as string);
          saveCurrentProject({ sceneSummary: newData.stakes as string });
        }
      } else if (nodeId === "node-script-1") {
        if (newData.previewText) {
          setScreenplayText(newData.previewText as string);
          saveCurrentProject({ screenplayText: newData.previewText as string });
        }
      }
    },
    [saveCurrentProject, setNodes]
  );

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
            title: "Custom Aesthetic Study",
            url: "cinematic-reference.mp4",
            timestampRange: "01:00 - 02:30",
            lightingStyle: "Extracted golden hour contrast",
            palette: ["#ffb703", "#fb8500", "#023047"],
            pacing: "Moderate slow-burn",
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
        setCharacters((prev) => [
          ...prev,
          {
            name: "New Hero",
            archetype: "Reluctant protagonist",
            objective: "Survive the night",
          },
        ]);
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
            prompt: `2.39:1 low-angle dramatic shot of the scene with high-contrast volumetric illumination.`,
            shotType: "2.39:1 Anamorphic Scope",
            lighting: "Chiaroscuro key lighting",
          },
        };
        break;
      case "floorplan":
        newNode = {
          id,
          type: "floorplan",
          position: pos,
          data: {
            sceneTitle: sceneTitle || "Production Set Master",
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
            actCount: 3,
            currentSeconds: timeSeconds,
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
            screenplayText: screenplayText,
            onOpenTableRead: () => setScriptViewerOpen(true),
          },
        };
        break;
      case "market":
        newNode = {
          id,
          type: "market",
          position: pos,
          data: {
            genre: genre,
            onOpenDeck: () => {
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
    setSelectedNode(newNode);
  };

  // Node Selection in Inspector
  const handleNodeClick = React.useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      const panel = inspectorPanelRef.current;
      if (panel && panel.isCollapsed()) {
        panel.expand();
        setIsSidebarOpen(true);
      }
    },
    [inspectorPanelRef]
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground selection:bg-accent/30 selection:text-accent-foreground">
      {/* Studio Header Bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card/95 px-3 backdrop-blur select-none z-20">
        {/* Left: Slate Identity & Switcher */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="h-8 text-xs text-muted-foreground hover:text-foreground -ml-1"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Slate Hub
          </Button>

          <div className="h-4 w-[1px] bg-border" />

          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-accent" />
            <span className="font-heading text-sm font-bold text-foreground max-w-[200px] truncate">
              {projectTitle}
            </span>
          </div>

          {/* Dynamic Slate Switcher from localStorage & presets */}
          <div className="flex items-center gap-1.5 ml-2 overflow-x-auto max-w-[400px]">
            {allProjects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => router.push(`/studio/${p.id}`)}
                className={`rounded px-2 py-0.5 text-xs font-mono transition-colors whitespace-nowrap ${
                  projectId === p.id
                    ? "bg-accent/20 text-accent border border-accent/40 font-semibold"
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
          {/* Layout View Switcher */}
          <div className="flex items-center rounded-lg border border-border/80 bg-secondary/40 p-0.5 mr-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("canvas-only")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                layoutMode === "canvas-only"
                  ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title="Canvas Only (Hide other panels)"
            >
              <Square className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Canvas Only</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                layoutMode === "split"
                  ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title="Split View (Canvas + Bottom Cinema Dock)"
            >
              <Rows className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Split View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("dock-only")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                layoutMode === "dock-only"
                  ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title="Bottom Panel Only (Full Cinema Dock)"
            >
              <PanelBottom className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Bottom Panel</span>
            </button>
          </div>

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
            variant={isSidebarOpen ? "secondary" : "outline"}
            onClick={toggleSidebar}
            className="gap-1.5 text-xs border-border/80 text-foreground"
            title="Toggle Studio Inspector Sidebar"
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isSidebarOpen ? "Hide Inspector" : "Show Inspector"}</span>
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

      {/* Resizable Studio Layout */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <ResizablePanelGroup orientation="vertical" className="h-full w-full">
          {/* Top Panel: Canvas + Resizable Inspector Sidebar */}
          <ResizablePanel
            panelRef={topPanelRef}
            collapsible={true}
            collapsedSize="0%"
            defaultSize="65%"
            minSize="0%"
            maxSize="100%"
            className="relative"
            onResize={(panelSize) => {
              if (panelSize.asPercentage <= 2) {
                setLayoutMode("dock-only");
              } else {
                const bottomSize = bottomPanelRef.current?.getSize()?.asPercentage;
                if (bottomSize !== undefined && bottomSize <= 2) {
                  setLayoutMode("canvas-only");
                } else if (layoutMode === "dock-only") {
                  setLayoutMode("split");
                }
              }
            }}
          >
            <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
              {/* Left Panel: React Flow Story Canvas */}
              <ResizablePanel defaultSize="72%" minSize="35%">
                <div className="relative h-full w-full overflow-hidden bg-background">
                  <StoryCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    onAddNode={handleAddBlueprintNode}
                  />

                  {/* Canvas Only Quick Restore Pill */}
                  {layoutMode === "canvas-only" && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode("split")}
                        className="flex items-center gap-2 rounded-full border border-border/80 bg-card/95 px-4 py-2 text-xs font-semibold text-foreground shadow-2xl backdrop-blur hover:bg-secondary hover:border-accent transition-all cursor-pointer"
                      >
                        <PanelBottomOpen className="h-4 w-4 text-accent" />
                        <span>Open Cinema Dock</span>
                        <span className="text-[10px] text-muted-foreground font-mono">({activeCharacterName})</span>
                      </button>
                    </div>
                  )}
                </div>
              </ResizablePanel>

              {/* Vertical Separator Handle between Canvas and Sidebar */}
              <ResizableHandle withHandle />

              {/* Right Panel: Studio Parameter Inspector Sidebar */}
              <ResizablePanel
                panelRef={inspectorPanelRef}
                collapsible={true}
                collapsedSize="0%"
                defaultSize="28%"
                minSize="18%"
                maxSize="50%"
                onResize={(panelSize) => {
                  setIsSidebarOpen(panelSize.asPercentage > 2);
                }}
              >
                <StudioInspector
                  selectedNode={selectedNode}
                  nodes={nodes}
                  onSelectNode={(nodeId) => {
                    const found = nodes.find((n) => n.id === nodeId);
                    if (found) setSelectedNode(found);
                  }}
                  onUpdateNodeData={handleUpdateNodeData}
                  onOpenHotSeat={(charName) => {
                    setActiveCharacterName(charName);
                    setActiveTab("hotseat");
                  }}
                  onOpenScriptReader={() => setScriptViewerOpen(true)}
                  onOpenDeck={(subTab) => {
                    setActiveTab("deck");
                    setDeckSubTab(subTab);
                  }}
                  onOpenTableRead={() => setShowTableRead(true)}
                  onClose={() => {
                    inspectorPanelRef.current?.collapse();
                    setIsSidebarOpen(false);
                  }}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Horizontal Resizable Handle between Canvas and Bottom Dock */}
          <ResizableHandle withHandle />

          {/* Bottom Panel: Resizable Cinema Dock */}
          <ResizablePanel
            panelRef={bottomPanelRef}
            collapsible={true}
            collapsedSize="0%"
            defaultSize="35%"
            minSize="0%"
            maxSize="100%"
            className="flex flex-col overflow-hidden bg-card/95 backdrop-blur border-t border-border"
            onResize={(panelSize) => {
              if (panelSize.asPercentage <= 2) {
                setLayoutMode("canvas-only");
              } else {
                const topSize = topPanelRef.current?.getSize()?.asPercentage;
                if (topSize !== undefined && topSize <= 2) {
                  setLayoutMode("dock-only");
                } else if (layoutMode === "canvas-only") {
                  setLayoutMode("split");
                }
              }
            }}
          >
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
                  <span>Director&apos;s Deck Suite</span>
                </button>
              </div>

              {/* Status Badge & Dock View Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden md:inline">ClickHouse Sub-ms Time-Gate Active</span>
                </div>

                <div className="h-3.5 w-[1px] bg-border" />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode(layoutMode === "dock-only" ? "split" : "dock-only")}
                    className={cn(
                      "flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors cursor-pointer",
                      layoutMode === "dock-only"
                        ? "bg-accent/20 text-accent font-medium border border-accent/40"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                    title={layoutMode === "dock-only" ? "Restore Split View" : "Maximize Bottom Panel (Hide Canvas)"}
                  >
                    {layoutMode === "dock-only" ? (
                      <>
                        <Minimize2 className="h-3.5 w-3.5" />
                        <span className="text-[11px]">Restore</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span className="text-[11px]">Maximize</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("canvas-only")}
                    className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                    title="Hide Bottom Panel (Canvas Only)"
                  >
                    <PanelBottomClose className="h-3.5 w-3.5" />
                    <span className="text-[11px]">Hide</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab 1: Timeline Scrubber & Hot Seat Interrogation */}
            {activeTab === "hotseat" && (
              <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
                <div className="border-b border-border/50 px-4 py-2 bg-background/50 shrink-0 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <TimelineScrubber
                      durationSeconds={DURATION_SECONDS}
                      value={timeSeconds}
                      onChange={setTimeSeconds}
                      events={events}
                    />
                  </div>

                  {/* Character Quick Switcher */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground mr-1 hidden sm:inline">
                      Interrogate:
                    </span>
                    {characters.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setActiveCharacterName(c.name)}
                        className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                          activeCharacterName === c.name
                            ? "bg-accent text-accent-foreground shadow-xs"
                            : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden p-2 flex flex-col">
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
                      `What are you hiding right now at minute ${Math.round(timeSeconds / 60)}?`,
                      "Why won't you turn around and answer directly?",
                      "Where were you when the situation compromised?",
                    ]}
                    className="h-full w-full"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Showrunner AI Co-Pilot */}
            {activeTab === "showrunner" && (
              <div className="flex-1 min-h-0 overflow-hidden p-2 flex flex-col">
                <ShowrunnerChat
                  messages={showrunnerMessages}
                  isThinking={isShowrunnerThinking}
                  onSendMessage={handleSendShowrunner}
                  suggestedPrompts={[
                    `Analyze dramatic tension for ${projectTitle}`,
                    `Suggest subtext improvements for ${activeCharacterName}'s dialogue`,
                    "Query ClickHouse box-office precedents for this premise",
                  ]}
                  className="h-full w-full"
                />
              </div>
            )}

            {/* Tab 3: Dream Casting Chemistry Bench */}
            {activeTab === "chemistry" && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between shrink-0">
                  <div>
                    <h4 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                      <Flame className="h-4 w-4 text-rose-500" />
                      Dynamic Friction Sandbox ({characters[0]?.name || "Lead"} vs{" "}
                      {characters[1]?.name || "Counterpart"})
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Simulates how two contrasting character vocal profiles and secrets clash in an unexpected situation.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleRunChemistry}
                    disabled={isChemistryRunning}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-semibold gap-1.5"
                  >
                    {isChemistryRunning ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Simulating Scene...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Run Chemistry Test</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex gap-3 shrink-0">
                  <input
                    type="text"
                    value={chemistryScenario}
                    onChange={(e) => setChemistryScenario(e.target.value)}
                    placeholder="Enter an environmental conflict scenario..."
                    className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground font-mono"
                  />
                </div>

                {chemistrySceneOutput ? (
                  <div className="flex-1 min-h-0 rounded-lg border border-border bg-background/80 p-4 font-mono text-xs leading-relaxed text-foreground overflow-y-auto shadow-inner">
                    <MarkdownRenderer content={chemistrySceneOutput} />
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
                    Click &ldquo;Run Chemistry Test&rdquo; to simulate an impromptu friction scene between{" "}
                    {characters[0]?.name || "Lead"} and {characters[1]?.name || "Counterpart"}.
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Director's Deck Suite */}
            {activeTab === "deck" && (
              <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
                <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-1.5 bg-secondary/20">
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
                    Tension &amp; Pacing Curve
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

                <div className="flex-1 min-h-0 overflow-y-auto p-4">
                  {deckSubTab === "blocking" && (
                    <FloorPlanView sceneTitle={sceneTitle} characters={characters} />
                  )}
                  {deckSubTab === "tension" && (
                    <TensionCurveView
                      currentTimeSeconds={timeSeconds}
                      onScrubTime={setTimeSeconds}
                      projectId={projectId}
                      characters={characters}
                      events={events}
                    />
                  )}
                  {deckSubTab === "territory" && (
                    <TerritoryHeatmapView
                      genre={genre}
                      projectTitle={projectTitle}
                      logline={premiseInput}
                    />
                  )}
                  {deckSubTab === "stripboard" && (
                    <StripboardView
                      projectTitle={projectTitle}
                      characters={characters}
                      screenplayText={screenplayText}
                      projectId={projectId}
                    />
                  )}
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Persistent Bottom ClickHouse Live Inspector */}
      <ClickHouseInspector logs={queryLogs} lastSql={lastSql} />

      {/* Screenplay Reader & Editor Modal */}
      <ScreenplayDialog
        open={scriptViewerOpen}
        onOpenChange={setScriptViewerOpen}
        title={sceneTitle}
        summary={sceneSummary}
        screenplayText={screenplayText}
        onSaveScript={(newScript) => {
          setScreenplayText(newScript);
          saveCurrentProject({ screenplayText: newScript });
        }}
        onReshard={handleReshardScript}
        isResharding={isGenerating}
      />

      {/* Audio Table Read Modal */}
      <Dialog open={showTableRead} onOpenChange={setShowTableRead}>
        <DialogContent className="max-w-2xl bg-card border-border p-5">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-cyan-400" />
              <DialogTitle className="text-base font-heading">
                Multi-Voice Audio Table Read · {sceneTitle}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Synchronized actor voice synthesis for script rhythm &amp; cadence testing.
            </DialogDescription>
          </DialogHeader>
          <TableReadPlayer
            screenplayText={screenplayText}
            className="border-0 bg-transparent p-0"
            hideHeader
          />
        </DialogContent>
      </Dialog>

      {/* Multiverse Alternate Takes Modal */}
      <MultiverseTakesDialog
        open={multiverseOpen}
        onOpenChange={setMultiverseOpen}
        onApplyTake={handleApplyTake}
        projectTitle={projectTitle}
        characters={characters}
        screenplayText={screenplayText}
      />

      {/* Film Fusion Crossover Modal */}
      <FilmFusionDialog
        open={fusionOpen}
        onOpenChange={setFusionOpen}
        onFusionComplete={() => {
          setAllProjects(getAllProjects());
        }}
      />

      {/* New Project Slate Creation Dialog */}
      <NewProjectDialog
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
        onSubmit={async (data) => {
          const newProject = createNewProjectEntry({
            title: data.title,
            logline: data.logline,
            genre: data.genre,
            characters: data.characters,
          });
          setProjectId(newProject.id);
          setProjectTitle(newProject.title);
          setGenre(newProject.genre);
          setPremiseInput(newProject.premise);
          setSceneTitle(newProject.sceneTitle);
          setSceneSummary(newProject.sceneSummary);
          setCharacters(newProject.characters);
          setActiveCharacterName(newProject.characters[0]?.name || "Lead");
          setScreenplayText("");
          setEvents([]);
          setHotSeatTurns([]);

          router.push(`/studio/${newProject.id}`);
          await runFullPipeline(newProject.id, newProject.premise);
        }}
      />

      {/* Real-time Autonomous Agent Generation Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="max-w-md w-full mx-4 rounded-xl border border-accent/40 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-accent/15 border border-accent/30 text-accent">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <div>
                <SlateLabel>Agentic Cinema Engine</SlateLabel>
                <h3 className="text-base font-heading font-bold text-foreground">
                  Autonomous Writers&apos; Room
                </h3>
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-secondary/30 p-3.5 border border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Active Agent Stage:</span>
                <span className="font-mono text-[11px] text-accent animate-pulse">Running</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                {generationStage || "Orchestrating Gemini 3.7 Flash & ClickHouse Story Event Engine..."}
              </p>
            </div>

            <div className="text-[11px] text-muted-foreground text-center">
              Generating screenplay text, sharding character knowledge firewalls, and synchronizing blueprint node graph.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
