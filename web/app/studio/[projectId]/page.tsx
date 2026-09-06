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
import { VersionControlDialog } from "@/components/cinema/version-control-dialog";
import { AICommanderDialog } from "@/components/cinema/ai-commander-dialog";
import { ClickHouseToolboxDialog } from "@/components/cinema/clickhouse-toolbox-dialog";
import { AudioStudioView } from "@/components/cinema/audio-studio-view";
import { VeoVideoDialog } from "@/components/cinema/veo-video-dialog";
import { GenerationStudioView } from "@/components/cinema/generation-studio-view";
import { DirectorLookbookDialog } from "@/components/cinema/director-lookbook-dialog";
import { CharacterLabDialog } from "@/components/cinema/character-lab-dialog";
import { ScratchpadDialog } from "@/components/cinema/scratchpad-dialog";
import { AuthUserButton } from "@/components/cinema/auth-user-button";
import { toast } from "@/components/ui/toast";
import { notifyIfFallback } from "@/lib/fallback-notice";
import {
  StudioVersionControl,
  type SnapshotState,
  type HistoryCategory,
} from "@/lib/version-control";
import { autoTidyBacklot } from "@/lib/backlot-layout";
import { executeStudioActions } from "@/lib/studio-commander";
import type { CommanderExecutionResponse } from "@/lib/studio-actions";
import type { ExtendedShowrunnerMessage } from "@/components/cinema/showrunner-chat";
import {
  ClickHouseInspector,
  type ClickHouseQueryLog,
} from "@/components/cinema/clickhouse-inspector";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Database,
  Sliders,
  Layers,
  Volume2,
  Headphones,
  Video,
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
  History,
  RotateCcw,
  RotateCw,
  Zap,
  ChevronDown,
  Check,
  Cpu,
  Activity,
  Camera,
  MessageSquare,
  Clock,
  Timer,
  Milestone,
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
  type NarrativeFormat,
  NARRATIVE_FORMATS,
  updateProjectTimeframe,
  type NodeCallbacks,
  SEED_PROJECTS,
} from "@/lib/project-store";
import { ProjectTimeframeDialog } from "@/components/cinema/project-timeframe-dialog";

export const PRESET_SCENARIOS = SEED_PROJECTS;

type MainStudioTab = "planning" | "simulation" | "generation";
type SimulationSubTab = "audio" | "hotseat" | "chemistry" | "showrunner";
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

  // Timeframe Scope & Narrative Placement State
  const [timeframeModalOpen, setTimeframeModalOpen] = React.useState(false);
  const [narrativeFormat, setNarrativeFormat] = React.useState<NarrativeFormat>(
    initialProject.narrativeFormat || "feature"
  );
  const [targetRuntimeMinutes, setTargetRuntimeMinutes] = React.useState<number>(
    initialProject.targetRuntimeMinutes || 95
  );
  const [scenePlacementSeconds, setScenePlacementSeconds] = React.useState<number>(
    initialProject.scenePlacementSeconds ?? 34 * 60
  );
  const [sceneDurationSeconds, setSceneDurationSeconds] = React.useState<number>(
    initialProject.sceneDurationSeconds ?? 6 * 60
  );
  const [directorStyle, setDirectorStyle] = React.useState<string>(
    initialProject.directorStyle || ""
  );
  const [coreSecret, setCoreSecret] = React.useState<string>(
    initialProject.coreSecret || ""
  );
  const [primaryLocation, setPrimaryLocation] = React.useState<string>(
    initialProject.primaryLocation || ""
  );
  const [targetTerritories, setTargetTerritories] = React.useState<string[]>(
    initialProject.targetTerritories || []
  );
  const durationSeconds = targetRuntimeMinutes * 60;

  // Slates list for navigation
  const [allProjects, setAllProjects] = React.useState<ProjectData[]>([]);

  React.useEffect(() => {
    setAllProjects(getAllProjects());
  }, [projectId]);

  // Synchronize state when initialProject changes
  React.useEffect(() => {
    if (initialProject) {
      setProjectId(initialProject.id);
      setProjectTitle(initialProject.title);
      setGenre(initialProject.genre);
      setPremiseInput(initialProject.premise);
      setSceneTitle(initialProject.sceneTitle);
      setSceneSummary(initialProject.sceneSummary);
      setScreenplayText(initialProject.screenplayText);
      setCharacters(initialProject.characters);
      setActiveCharacterName(initialProject.characters[0]?.name || "Marcus");
      setEvents(initialProject.initialEvents || []);
      setNarrativeFormat(initialProject.narrativeFormat || "feature");
      setTargetRuntimeMinutes(initialProject.targetRuntimeMinutes || 95);
      const placement = initialProject.scenePlacementSeconds ?? 34 * 60;
      setScenePlacementSeconds(placement);
      setTimeSeconds(placement);
      setSceneDurationSeconds(initialProject.sceneDurationSeconds ?? 6 * 60);
      setDirectorStyle(initialProject.directorStyle || "");
      setCoreSecret(initialProject.coreSecret || "");
      setPrimaryLocation(initialProject.primaryLocation || "");
      setTargetTerritories(initialProject.targetTerritories || []);
    }
  }, [initialProject]);

  const handleSaveTimeframe = (updates: {
    targetRuntimeMinutes: number;
    narrativeFormat: NarrativeFormat;
    scenePlacementSeconds: number;
    sceneDurationSeconds: number;
    directorStyle?: string;
    coreSecret?: string;
    primaryLocation?: string;
    targetTerritories?: string[];
    genre?: string;
  }) => {
    setTargetRuntimeMinutes(updates.targetRuntimeMinutes);
    setNarrativeFormat(updates.narrativeFormat);
    setScenePlacementSeconds(updates.scenePlacementSeconds);
    setSceneDurationSeconds(updates.sceneDurationSeconds);
    setTimeSeconds(updates.scenePlacementSeconds);
    if (updates.directorStyle !== undefined) setDirectorStyle(updates.directorStyle);
    if (updates.coreSecret !== undefined) setCoreSecret(updates.coreSecret);
    if (updates.primaryLocation !== undefined) setPrimaryLocation(updates.primaryLocation);
    if (updates.targetTerritories !== undefined) setTargetTerritories(updates.targetTerritories);
    if (updates.genre !== undefined) setGenre(updates.genre);

    updateProjectTimeframe(projectId, updates);
    setAllProjects(getAllProjects());
  };

  const handleExtendRuntime = (minutes = 15) => {
    setTargetRuntimeMinutes((prev) => {
      const next = Math.min(240, prev + minutes);
      updateProjectTimeframe(projectId, { targetRuntimeMinutes: next });
      setAllProjects(getAllProjects());
      return next;
    });
  };

  const handleShrinkRuntime = (minutes = 15) => {
    setTargetRuntimeMinutes((prev) => {
      const next = Math.max(2, prev - minutes);
      const nextDuration = next * 60;
      if (scenePlacementSeconds > nextDuration) {
        const clamped = Math.max(0, nextDuration - sceneDurationSeconds);
        setScenePlacementSeconds(clamped);
        updateProjectTimeframe(projectId, {
          targetRuntimeMinutes: next,
          scenePlacementSeconds: clamped,
        });
      } else {
        updateProjectTimeframe(projectId, { targetRuntimeMinutes: next });
      }
      setAllProjects(getAllProjects());
      return next;
    });
  };

  // Timeline & Interrogation State
  const [timeSeconds, setTimeSeconds] = React.useState(initialProject.scenePlacementSeconds ?? 34 * 60);
  const [events, setEvents] = React.useState<StoryEventMarker[]>(initialProject.initialEvents || []);
  const [knownFacts, setKnownFacts] = React.useState<KnowledgeFact[]>([]);
  const [hotSeatTurns, setHotSeatTurns] = React.useState<HotSeatTurn[]>([]);

  // Showrunner Chat & Central AI Commander State
  const [showrunnerMessages, setShowrunnerMessages] = React.useState<ExtendedShowrunnerMessage[]>([]);
  const [isShowrunnerThinking, setIsShowrunnerThinking] = React.useState(false);
  const [aiCommanderOpen, setAiCommanderOpen] = React.useState(false);

  // Chemistry Bench State
  const [chemistryScenario, setChemistryScenario] = React.useState(
    "Stuck in a broken service elevator with a ticking 2-minute security countdown"
  );
  const [chemistrySceneOutput, setChemistrySceneOutput] = React.useState<string>("");
  const [isChemistryRunning, setIsChemistryRunning] = React.useState(false);

  // 3-Tab Director Architecture: Planning | Simulation | Generation
  const [mainTab, setMainTab] = React.useState<MainStudioTab>("planning");
  const [simulationTab, setSimulationTab] = React.useState<SimulationSubTab>("audio");
  const [deckSubTab, setDeckSubTab] = React.useState<DeckSubTab>("blocking");

  // Deep link from elsewhere in the app (e.g. dashboard Character Lab "Talk to this
  // character" action) straight into Hot Seat for a specific character.
  React.useEffect(() => {
    const requestedChar = searchParams.get("hotSeat");
    if (requestedChar) {
      setActiveCharacterName(requestedChar);
      setMainTab("simulation");
      setSimulationTab("hotseat");
    }
    // Only consult the deep-link param once on mount — later param changes aren't re-navigations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard Shortcuts (Shift+1 for Planning, Shift+2 for Simulation, Shift+3 for Generation, Shift+C for ClickHouse)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.shiftKey) {
        if (e.key === "1") {
          e.preventDefault();
          setMainTab("planning");
        } else if (e.key === "2") {
          e.preventDefault();
          setMainTab("simulation");
        } else if (e.key === "3") {
          e.preventDefault();
          setMainTab("generation");
        } else if (e.key.toLowerCase() === "c") {
          e.preventDefault();
          setIsClickHouseInspectorOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // UI Navigation & Modals
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [fusionOpen, setFusionOpen] = React.useState(false);
  const [multiverseOpen, setMultiverseOpen] = React.useState(false);
  const [scriptViewerOpen, setScriptViewerOpen] = React.useState(false);
  const [showTableRead, setShowTableRead] = React.useState(false);
  const [versionControlOpen, setVersionControlOpen] = React.useState(false);
  const [clickhouseToolboxOpen, setClickhouseToolboxOpen] = React.useState(false);
  const [veoVideoOpen, setVeoVideoOpen] = React.useState(false);
  const [veoCharacterContext, setVeoCharacterContext] = React.useState<ProjectCharacter | null>(null);
  const [lookbookOpen, setLookbookOpen] = React.useState(false);
  const [characterLabOpen, setCharacterLabOpen] = React.useState(false);
  const [scratchpadOpen, setScratchpadOpen] = React.useState(false);
  const [stagedCameraMotion, setStagedCameraMotion] = React.useState<string>("");
  const [stagedPromptNote, setStagedPromptNote] = React.useState<string>("");

  const handleSendStagingToVeo = React.useCallback(
    (camData: { camName: string; lens: string; motion: string; promptNote: string }) => {
      setStagedCameraMotion(camData.motion);
      setStagedPromptNote(camData.promptNote);
      setMainTab("generation");
    },
    []
  );

  const [vcs, setVcs] = React.useState<StudioVersionControl | null>(null);
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const [vcsHistoryCount, setVcsHistoryCount] = React.useState(0);

  // Pipeline Status & Logs
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStage, setGenerationStage] = React.useState<string>("");
  const pipelineAbortRef = React.useRef<AbortController | null>(null);
  const [isAsking, setIsAsking] = React.useState(false);
  const [queryLogs, setQueryLogs] = React.useState<ClickHouseQueryLog[]>([]);
  const [lastSql, setLastSql] = React.useState<string>("");
  const [isClickHouseInspectorOpen, setIsClickHouseInspectorOpen] = React.useState(false);

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
      const existingProject = getProjectById(projectId) || initialProject;
      const proj: ProjectData = {
        ...existingProject,
        id: projectId,
        title: projectTitle,
        genre: genre,
        premise: premiseInput,
        sceneTitle: sceneTitle,
        sceneSummary: sceneSummary,
        screenplayText: screenplayText,
        characters: characters,
        initialEvents: events,
        nodes: nodesRef.current,
        edges: edgesRef.current,
        createdAt: existingProject?.createdAt || initialProject.createdAt,
        updatedAt: Date.now(),
        isCustom: existingProject?.isCustom ?? initialProject.isCustom,
        isStarred: existingProject?.isStarred ?? initialProject.isStarred,
        directorStyle: directorStyle,
        coreSecret: coreSecret,
        primaryLocation: primaryLocation,
        targetTerritories: targetTerritories,
        narrativeFormat: narrativeFormat,
        targetRuntimeMinutes: targetRuntimeMinutes,
        scenePlacementSeconds: scenePlacementSeconds,
        sceneDurationSeconds: sceneDurationSeconds,
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
      directorStyle,
      coreSecret,
      primaryLocation,
      targetTerritories,
      narrativeFormat,
      targetRuntimeMinutes,
      scenePlacementSeconds,
      sceneDurationSeconds,
    ]
  );

  // Chemistry Test Execution
  const handleRunChemistry = async () => {
    if (isChemistryRunning) return;
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
        setMainTab("simulation");
        setSimulationTab("chemistry");
        notifyIfFallback(data, "Chemistry Test");
      } else {
        const detail = await res.text().catch(() => "");
        toast.add({
          title: "Chemistry test failed",
          description: detail || `Request failed (${res.status}). Try again.`,
          type: "error",
        });
      }
    } catch (err) {
      console.error("Chemistry test failed:", err);
      toast.add({
        title: "Chemistry test failed",
        description: err instanceof Error ? err.message : "Could not reach the chemistry backend.",
        type: "error",
      });
    } finally {
      setIsChemistryRunning(false);
    }
  };

  // Forward ref to handleUpdateNodeData (defined later, after setNodes exists)
  // so nodeCallbacks can call it without reordering the whole hook chain.
  const handleUpdateNodeDataRef = React.useRef<
    (nodeId: string, newData: Record<string, unknown>) => void
  >(null);

  // Dynamic Blueprint Node Callbacks
  const nodeCallbacks: NodeCallbacks = React.useMemo(
    () => ({
      onOpenHotSeat: (charName: string) => {
        setActiveCharacterName(charName);
        setMainTab("simulation");
        setSimulationTab("hotseat");
      },
      onGenerateDraft: () => {
        runFullPipeline(projectId, premiseInput);
      },
      onViewScript: () => {
        setScriptViewerOpen(true);
      },
      onOpenDeck: (subTab) => {
        setMainTab("planning");
        setDeckSubTab(subTab);
      },
      onOpenTableRead: () => {
        setMainTab("simulation");
        setSimulationTab("audio");
      },
      onOpenHeatmap: () => {
        setMainTab("planning");
        setDeckSubTab("territory");
      },
      onRunChemistry: () => {
        setMainTab("simulation");
        setSimulationTab("chemistry");
        handleRunChemistry();
      },
      onTweakDials: (charName, dials) => {
        // Delegate to handleUpdateNodeData's node-dial-* branch (defined below)
        // via a ref, since nodeCallbacks must exist before useNodesState/setNodes.
        handleUpdateNodeDataRef.current?.(`node-dial-${charName.toLowerCase()}`, dials);
      },
    }),
    [projectId, premiseInput]
  );

  // Generate initial React Flow nodes & edges directly from project data, then
  // overlay any persisted per-node customization (dials, quirks, images, style)
  // from the last save — the structural rebuild keeps callbacks/positions live,
  // the overlay keeps edits from vanishing on refresh.
  const initialGraph = React.useMemo(() => {
    const fresh = buildProjectNodesAndEdges(initialProject, nodeCallbacks, isGenerating);
    const savedNodesById = new Map((initialProject.nodes || []).map((n) => [n.id, n]));
    const mergedNodes = fresh.nodes.map((n) => {
      const saved = savedNodesById.get(n.id);
      if (!saved || !saved.data) return n;
      // Saved customization (dials, quirks, images, extracted style) wins;
      // callback functions must always come from the fresh build since they
      // close over the current nodeCallbacks/isGenerating.
      const mergedData: Record<string, unknown> = { ...n.data, ...saved.data };
      for (const key of Object.keys(n.data || {})) {
        if (/^on[A-Z]/.test(key)) mergedData[key] = (n.data as Record<string, unknown>)[key];
      }
      return { ...n, data: mergedData };
    });
    return { nodes: mergedNodes, edges: fresh.edges };
  }, [initialProject, nodeCallbacks, isGenerating]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);

  // Refs mirror node/edge state for saveCurrentProject to read without
  // taking nodes/edges as a dependency (which would thrash on every drag).
  const nodesRef = React.useRef(nodes);
  const edgesRef = React.useRef(edges);
  React.useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  React.useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Initialize Studio Version Control
  React.useEffect(() => {
    if (!projectId) return;
    const instance = new StudioVersionControl(projectId, {
      nodes: initialGraph.nodes,
      edges: initialGraph.edges,
      characters,
      sceneTitle,
      sceneSummary,
      screenplayText,
    });
    setVcs(instance);

    const updateVcsState = () => {
      setCanUndo(instance.canUndo());
      setCanRedo(instance.canRedo());
      setVcsHistoryCount(instance.getHistory().length);
    };

    updateVcsState();
    return instance.subscribe(updateVcsState);
  }, [projectId]);

  // Apply VCS snapshot back into live canvas and project storage
  const applySnapshot = React.useCallback(
    (snap: SnapshotState) => {
      if (snap.nodes) setNodes(snap.nodes);
      if (snap.edges) setEdges(snap.edges);
      if (snap.characters) setCharacters(snap.characters);
      if (snap.sceneTitle) setSceneTitle(snap.sceneTitle);
      if (snap.sceneSummary) setSceneSummary(snap.sceneSummary);
      if (snap.screenplayText !== undefined) setScreenplayText(snap.screenplayText);

      saveCurrentProject({
        characters: snap.characters,
        sceneTitle: snap.sceneTitle,
        sceneSummary: snap.sceneSummary,
        screenplayText: snap.screenplayText,
      });
    },
    [setNodes, setEdges, saveCurrentProject]
  );

  const handleUndo = React.useCallback(() => {
    if (!vcs) return;
    const snap = vcs.undo();
    if (snap) {
      applySnapshot(snap);
    }
  }, [vcs, applySnapshot]);

  const handleRedo = React.useCallback(() => {
    if (!vcs) return;
    const snap = vcs.redo();
    if (snap) {
      applySnapshot(snap);
    }
  }, [vcs, applySnapshot]);

  const handleRevertSnapshot = React.useCallback(
    (snap: SnapshotState) => {
      applySnapshot(snap);
    },
    [applySnapshot]
  );

  const recordTakeChange = React.useCallback(
    (summary: string, category: HistoryCategory, customSnapshot?: Partial<SnapshotState>) => {
      if (!vcs) return;
      vcs.recordChange(
        summary,
        category,
        {
          nodes,
          edges,
          characters,
          sceneTitle,
          sceneSummary,
          screenplayText,
          ...customSnapshot,
        }
      );
    },
    [vcs, nodes, edges, characters, sceneTitle, sceneSummary, screenplayText]
  );

  const handleAutoTidy = React.useCallback(() => {
    const tidied = autoTidyBacklot(nodes);
    setNodes(tidied);
    recordTakeChange("Auto-Tidy Backlot Lanes", "layout", { nodes: tidied });
  }, [nodes, setNodes, recordTakeChange]);

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
    const controller = new AbortController();
    pipelineAbortRef.current = controller;
    try {
      setGenerationStage("Drafting Master Screenplay (Gemini 3.7 Flash)...");
      let enrichedPremise = premise;
      const effectiveDirectorStyle = directorStyle || initialProject.directorStyle;
      const effectiveCoreSecret = coreSecret || initialProject.coreSecret;
      const effectivePrimaryLocation = primaryLocation || initialProject.primaryLocation;

      if (effectiveDirectorStyle) {
        enrichedPremise += `\nDirectorial Tone: Style of ${effectiveDirectorStyle}.`;
      }
      if (effectiveCoreSecret) {
        enrichedPremise += `\nAsymmetric Knowledge / Hidden Secret: ${effectiveCoreSecret}.`;
      }
      if (effectivePrimaryLocation) {
        enrichedPremise += `\nPrimary Setting / Dramatic Location: ${effectivePrimaryLocation}.`;
      }
      if (characters && characters.length > 0) {
        const charRoster = characters
          .map((c) => `${c.name} (${c.role || c.archetype}${c.actorComp ? `, comp: ${c.actorComp}` : ""})`)
          .join("; ");
        enrichedPremise += `\nFeatured Characters: ${charRoster}.`;
      }

      const scriptRes = await fetch("/api/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ premise: enrichedPremise, projectId: pid }),
        signal: controller.signal,
      });
      if (!scriptRes.ok) {
        const detail = await scriptRes.text().catch(() => "");
        throw new Error(detail || "Script generation failed");
      }
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
        signal: controller.signal,
      });
      if (!shardRes.ok) {
        const detail = await shardRes.text().catch(() => "");
        throw new Error(detail || "Perspective sharding failed");
      }
      const shardData = await shardRes.json();

      const newSceneTitle = shardData.scene_title || `${projectTitle} — Scene 01`;
      const newSceneSummary = shardData.scene_summary || premise;
      setSceneTitle(newSceneTitle);
      setSceneSummary(newSceneSummary);

      let newCharacters: ProjectCharacter[] = characters;
      if (Array.isArray(shardData.characters) && shardData.characters.length > 0) {
        // Intelligently preserve authored character profiles
        newCharacters = shardData.characters.map((sc: any) => {
          const existing = characters.find(
            (c) => c.name.toLowerCase() === sc.name.toLowerCase()
          );
          if (existing) {
            return {
              ...existing,
              archetype: existing.archetype || sc.archetype,
              speechStyle: existing.speechStyle || sc.speech_style || "naturalistic",
              subtextRatio: existing.subtextRatio || sc.subtext_ratio || "high",
            };
          }
          return {
            name: sc.name,
            archetype: sc.archetype,
            speechStyle: sc.speech_style || "naturalistic",
            subtextRatio: sc.subtext_ratio || "high",
            actorComp: `${sc.name} Comp`,
            objective: "Confront the central crisis",
          };
        });

        // Retain any authored characters that weren't mentioned in the shard
        for (const authored of characters) {
          if (!newCharacters.some((nc) => nc.name.toLowerCase() === authored.name.toLowerCase())) {
            newCharacters.push(authored);
          }
        }

        setCharacters(newCharacters);
        if (newCharacters.length > 0) {
          setActiveCharacterName(newCharacters[0].name);
        }
      }

      logClickHouseQuery(
        `INSERT INTO story_events VALUES (${shardData.events_written} events committed)`,
        "insert",
        15
      );

      setGenerationStage("Finalizing Timeline & Syncing Graph...");
      await fetchProjectEvents(pid);

      const existingProject = getProjectById(pid) || initialProject;
      const updatedProject: ProjectData = {
        ...existingProject,
        id: pid,
        title: projectTitle,
        genre: genre,
        premise: premise,
        sceneTitle: newSceneTitle,
        sceneSummary: newSceneSummary,
        screenplayText: generatedScript,
        characters: newCharacters,
        initialEvents: events,
        createdAt: existingProject?.createdAt || initialProject.createdAt,
        updatedAt: Date.now(),
        isCustom: true,
        directorStyle: effectiveDirectorStyle,
        coreSecret: effectiveCoreSecret,
        primaryLocation: effectivePrimaryLocation,
        targetTerritories: targetTerritories.length > 0 ? targetTerritories : (existingProject?.targetTerritories || []),
        narrativeFormat,
        targetRuntimeMinutes,
        scenePlacementSeconds,
        sceneDurationSeconds,
      };

      saveProject(updatedProject);
      syncGraphWithProject(updatedProject);
      setAllProjects(getAllProjects());
      setMainTab("planning");
    } catch (err) {
      console.error("Pipeline failed:", err);
      if (err instanceof Error && err.name === "AbortError") {
        toast.add({ title: "Generation cancelled", type: "info" });
      } else {
        toast.add({
          title: "Script generation pipeline failed",
          description: err instanceof Error ? err.message : "Could not reach the generation backend.",
          type: "error",
        });
      }
    } finally {
      setIsGenerating(false);
      setGenerationStage("");
      pipelineAbortRef.current = null;
    }
  };

  const handleCancelPipeline = () => {
    pipelineAbortRef.current?.abort();
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

      const existingProject = getProjectById(projectId) || initialProject;
      const updatedProject: ProjectData = {
        ...existingProject,
        id: projectId,
        title: projectTitle,
        genre: genre,
        premise: premiseInput,
        sceneTitle: shardData.scene_title || sceneTitle,
        sceneSummary: shardData.scene_summary || sceneSummary,
        screenplayText: newScript,
        characters: updatedChars,
        initialEvents: events,
        createdAt: existingProject?.createdAt || initialProject.createdAt,
        updatedAt: Date.now(),
        isCustom: true,
        directorStyle: directorStyle || existingProject?.directorStyle,
        coreSecret: coreSecret || existingProject?.coreSecret,
        primaryLocation: primaryLocation || existingProject?.primaryLocation,
        targetTerritories: targetTerritories.length > 0 ? targetTerritories : (existingProject?.targetTerritories || []),
        narrativeFormat,
        targetRuntimeMinutes,
        scenePlacementSeconds,
        sceneDurationSeconds,
      };

      saveProject(updatedProject);
      syncGraphWithProject(updatedProject);
      setAllProjects(getAllProjects());

      logClickHouseQuery(
        `INSERT INTO story_events VALUES (${shardData.events_written} events committed)`,
        "insert",
        12
      );
      await fetchProjectEvents(projectId);
    } catch (err) {
      console.error("Resharding failed:", err);
      toast.add({
        title: "Re-sharding failed",
        description: err instanceof Error ? err.message : "Could not reach the sharding backend.",
        type: "error",
      });
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

  // Centralized Studio Executive AI Commander (Autonomous CRUD Orchestrator)
  const handleExecuteCommanderPrompt = React.useCallback(
    async (prompt: string): Promise<CommanderExecutionResponse | null> => {
      const trimmed = prompt.trim();
      if (!trimmed) return null;

      setIsShowrunnerThinking(true);
      const userMsg: ExtendedShowrunnerMessage = { role: "user", content: trimmed };
      setShowrunnerMessages((prev) => [...prev, userMsg]);

      const start = performance.now();
      try {
        const res = await fetch("/api/showrunner/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPrompt: trimmed,
            project: {
              id: projectId,
              title: projectTitle,
              genre,
              premise: premiseInput,
              sceneTitle,
              sceneSummary,
              screenplayText,
              characters,
              nodes,
              edges,
            },
            history: showrunnerMessages.slice(-6).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) {
          throw new Error(`Commander execution failed (${res.status})`);
        }

        const data: CommanderExecutionResponse = await res.json();

        // Autonomously execute mutations across project & backlot canvas
        let executedSummaries: string[] = [];
        if (data.actions && data.actions.length > 0) {
          const result = executeStudioActions(
            data.actions,
            {
              nodes,
              edges,
              characters,
              screenplayText,
              sceneTitle,
              sceneSummary,
              genre,
              projectId,
              vcs,
            },
            {
              setNodes,
              setEdges,
              setCharacters,
              setScreenplayText,
              setSceneTitle,
              setSceneSummary,
              saveProject: saveCurrentProject,
              recordTakeChange,
            }
          );
          executedSummaries = result.summaries;
        }

        const aiMsg: ExtendedShowrunnerMessage = {
          role: "showrunner",
          content: data.assistant_message,
          thought_process: data.thought_process,
          actions: data.actions,
          execution_summaries: executedSummaries,
          precedents_cited: data.precedents_cited,
          is_fallback: data._fallback,
        };

        setShowrunnerMessages((prev) => [...prev, aiMsg]);

        if (data._fallback) {
          toast.add({
            title: "Executive AI running in degraded mode",
            description: data._error || "The AI backend was unreachable — this directive was handled by a local fallback, not live reasoning.",
            type: "warning",
          });
        }

        // Log the real ClickHouse precedent query the commander used to ground
        // its creative reasoning (only if precedent rows actually came back).
        if (data.clickhouse_query_sql) {
          const elapsed = Math.round(performance.now() - start);
          logClickHouseQuery(data.clickhouse_query_sql, "precedents", elapsed);
        }

        return {
          ...data,
          execution_summary: executedSummaries,
        };
      } catch (err) {
        console.error("Studio Commander execution error:", err);
        const errMsg: ExtendedShowrunnerMessage = {
          role: "showrunner",
          content: `Executive AI encountered an issue executing your directive: ${err instanceof Error ? err.message : String(err)}`,
        };
        setShowrunnerMessages((prev) => [...prev, errMsg]);
        return null;
      } finally {
        setIsShowrunnerThinking(false);
      }
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
      nodes,
      edges,
      vcs,
      showrunnerMessages,
      setNodes,
      setEdges,
      setCharacters,
      saveCurrentProject,
      recordTakeChange,
      logClickHouseQuery,
    ]
  );

  // Showrunner Central AI Chat maps directly to Commander execution
  const handleSendShowrunner = async (message: string) => {
    await handleExecuteCommanderPrompt(message);
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
      } else if (nodeId.startsWith("node-dial-")) {
        const charName = nodeId.slice("node-dial-".length);
        let nextSummary: string | undefined;
        setCharacters((prevChars) => {
          const updated = prevChars.map((c) => {
            if (c.name.toLowerCase() !== charName) return c;
            const nextConfidence = (newData.confidence as number) ?? c.confidence ?? 60;
            const nextSpeed = (newData.speed as number) ?? c.verbalPacing ?? 75;
            const nextSubtext = (newData.subtext as number) ?? 85;
            nextSummary = `Confidence ${nextConfidence}% · Speed ${nextSpeed}% · Subtext ${nextSubtext}%`;
            return {
              ...c,
              confidence: nextConfidence,
              verbalPacing: nextSpeed,
              dialsSummary: nextSummary,
            };
          });
          saveCurrentProject({ characters: updated });
          return updated;
        });
        if (nextSummary) {
          const summary = nextSummary;
          setNodes((nds) =>
            nds.map((n) =>
              n.id === `node-core-${charName}` ? { ...n, data: { ...n.data, dialsSummary: summary } } : n
            )
          );
        }
      }
    },
    [saveCurrentProject, setNodes]
  );
  handleUpdateNodeDataRef.current = handleUpdateNodeData;

  // Allow user to draw new connections between nodes (loose, deletable, multi-wired)
  const onConnect = React.useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target || connection.source === connection.target) {
        return;
      }
      setEdges((eds) => {
        const next = addEdge(
          {
            ...connection,
            id: `e-${connection.source}-${connection.target}-${Date.now().toString(36)}`,
            type: "deletable",
            animated: true,
          },
          eds
        );
        recordTakeChange(`Connected wire: ${connection.source} → ${connection.target}`, "wire_add", { edges: next });
        return next;
      });
    },
    [setEdges, recordTakeChange]
  );

  const handleDeleteEdge = React.useCallback(
    (edgeId: string) => {
      setEdges((eds) => {
        const next = eds.filter((e) => e.id !== edgeId);
        recordTakeChange("Unlinked connection wire", "wire_remove", { edges: next });
        return next;
      });
    },
    [setEdges, recordTakeChange]
  );

  const handleLinkMultipleNodes = React.useCallback(
    (nodeIds: string[], mode: "chain" | "all") => {
      if (nodeIds.length < 2) return;
      setEdges((prevEdges) => {
        let updated = [...prevEdges];
        if (mode === "chain") {
          for (let i = 0; i < nodeIds.length - 1; i++) {
            const source = nodeIds[i];
            const target = nodeIds[i + 1];
            const exists = updated.some(
              (e) =>
                (e.source === source && e.target === target) ||
                (e.source === target && e.target === source)
            );
            if (!exists) {
              updated = addEdge(
                {
                  id: `e-${source}-${target}-${Date.now().toString(36)}`,
                  source,
                  target,
                  type: "deletable",
                  animated: true,
                },
                updated
              );
            }
          }
        } else {
          for (let i = 0; i < nodeIds.length; i++) {
            for (let j = i + 1; j < nodeIds.length; j++) {
              const source = nodeIds[i];
              const target = nodeIds[j];
              const exists = updated.some(
                (e) =>
                  (e.source === source && e.target === target) ||
                  (e.source === target && e.target === source)
              );
              if (!exists) {
                updated = addEdge(
                  {
                    id: `e-${source}-${target}-${Date.now().toString(36)}`,
                    source,
                    target,
                    type: "deletable",
                    animated: true,
                  },
                  updated
                );
              }
            }
          }
        }
        recordTakeChange(`Batch linked ${nodeIds.length} nodes (${mode})`, "wire_add", { edges: updated });
        return updated;
      });
    },
    [setEdges, recordTakeChange]
  );

  const handleUnlinkSelectedNodes = React.useCallback(
    (nodeIds: string[]) => {
      const idSet = new Set(nodeIds);
      setEdges((prevEdges) => {
        const next = prevEdges.filter((e) => !(idSet.has(e.source) && idSet.has(e.target)));
        recordTakeChange(`Severed connections between ${nodeIds.length} nodes`, "wire_remove", { edges: next });
        return next;
      });
    },
    [setEdges, recordTakeChange]
  );

  const handleUnlinkAllForNode = React.useCallback(
    (nodeId: string) => {
      setEdges((eds) => {
        const next = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
        recordTakeChange(`Severed all wires for node ${nodeId}`, "wire_remove", { edges: next });
        return next;
      });
    },
    [setEdges, recordTakeChange]
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
              setMainTab("simulation");
              setSimulationTab("hotseat");
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
              setMainTab("planning");
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
              setMainTab("planning");
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
            onOpenTableRead: () => {
              setMainTab("simulation");
              setSimulationTab("audio");
            },
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
              setMainTab("planning");
              setDeckSubTab("territory");
            },
          },
        };
        break;
      default:
        return;
    }

    setNodes((nds) => {
      const updated = [...nds, newNode];
      recordTakeChange(`Spawned ${type} blueprint node`, "node_add", { nodes: updated });
      return updated;
    });
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
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-border/70 bg-[#0a0c10]/95 px-3 backdrop-blur select-none z-20">
        {/* Left: Slate Identity & Scope */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer shrink-0"
            title="Back to Studio Dashboard"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-mono">Hub</span>
          </Button>

          <div className="h-4 w-px bg-border/60 shrink-0" />

          {/* Unified Project Slate Dropdown Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/60 bg-secondary/25 hover:bg-secondary/60 text-xs font-semibold text-foreground transition-all cursor-pointer min-w-0">
              <Film className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="font-heading truncate max-w-[130px] sm:max-w-[170px] text-xs">
                {projectTitle}
              </span>
              <span className="hidden xl:inline text-[10px] font-mono text-muted-foreground font-normal">
                · {genre}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-card border-border shadow-2xl p-1.5 z-50">
              <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">
                Production Slates ({allProjects.length})
              </DropdownMenuLabel>
              {allProjects.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => router.push(`/studio/${p.id}`)}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer",
                    p.id === projectId
                      ? "bg-accent/15 text-accent font-semibold"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={cn("h-1.5 w-1.5 rounded-full", p.id === projectId ? "bg-accent" : "bg-muted-foreground/50")} />
                    <span className="truncate">{p.title}</span>
                  </div>
                  {p.id === projectId && <Check className="h-3.5 w-3.5 text-accent shrink-0" />}
                </DropdownMenuItem>
              ))}
              <div className="h-px bg-border/50 my-1" />
              <DropdownMenuItem
                onClick={() => setNewProjectOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-accent hover:bg-accent/10 cursor-pointer font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Production Slate...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Timeframe Scope Dial */}
          <button
            type="button"
            onClick={() => setTimeframeModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono bg-secondary/30 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all cursor-pointer group"
            title={`Runtime: ${targetRuntimeMinutes}m (${narrativeFormat}) · Scene at ${Math.floor(scenePlacementSeconds / 60)}m mark. Click to configure blueprint & timeframe.`}
          >
            <Clock className="h-3 w-3 text-accent group-hover:scale-110 transition-transform" />
            <span className="font-medium text-foreground">{targetRuntimeMinutes}m</span>
            <span className="hidden md:inline text-[10px] text-muted-foreground">
              · {Math.floor(scenePlacementSeconds / 60)}m mark
            </span>
            <ChevronDown className="h-2.5 w-2.5 opacity-50" />
          </button>
        </div>

        {/* Center: 3 Core Tabs Architecture (Planning | Simulation | Generation) */}
        <div className="flex items-center justify-center">
          <div className="flex items-center rounded-lg border border-border/80 bg-secondary/30 p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setMainTab("planning")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                mainTab === "planning"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title="Director Planning: Backlot Graph, Script & Staging (Shift+1)"
            >
              <Film className="h-3.5 w-3.5" />
              <span>Planning</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab("simulation")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                mainTab === "simulation"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title="Pre-viz Simulation: AI Voices, Interrogation & Chemistry (Shift+2)"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Simulation</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab("generation")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                mainTab === "generation"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title="AI Media Generation: Google Veo 3.1 & Pre-viz Reels (Shift+3)"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generation</span>
            </button>
          </div>
        </div>

        {/* Right: Studio Tools, Telemetry & Executive Commander */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Directorial Quick Tools */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCharacterLabOpen(true)}
            className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer"
            title="Modular Character DNA Lab & Talent Vault"
          >
            <Users2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Characters</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setScratchpadOpen(true)}
            className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer"
            title="Showrunner Creative Scratchpad & Memos"
          >
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden xl:inline">Scratchpad</span>
          </Button>

          {/* Takes Version Control History */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setVersionControlOpen(true)}
            className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer"
            title="Takes History & Revisions"
          >
            <History className="h-3.5 w-3.5 text-accent" />
            <span className="hidden lg:inline">Takes</span>
            {vcsHistoryCount > 0 && (
              <Badge variant="outline" className="border-accent/40 bg-accent/15 text-accent text-[9px] px-1 py-0 h-3.5 ml-0.5">
                {vcsHistoryCount}
              </Badge>
            )}
          </Button>

          {/* Unified Creative Tools Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center h-7 gap-1.5 text-xs font-medium border border-border/70 rounded-md px-2.5 bg-secondary/30 hover:bg-secondary/70 text-foreground cursor-pointer transition-colors">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Tools</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-card border-border shadow-2xl p-1.5 z-50">
              <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">
                Directorial &amp; Story Design
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setCharacterLabOpen(true)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs cursor-pointer hover:bg-secondary"
              >
                <Users2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">Character DNA Lab</span>
                  <span className="text-[10px] text-muted-foreground">Modular casting &amp; voice chemistry</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setScratchpadOpen(true)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs cursor-pointer hover:bg-secondary"
              >
                <FileText className="h-4 w-4 text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">Showrunner Scratchpad</span>
                  <span className="text-[10px] text-muted-foreground">Creative memos &amp; unformatted notes</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLookbookOpen(true)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs cursor-pointer hover:bg-secondary"
              >
                <Film className="h-4 w-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">Director&apos;s Lookbook</span>
                  <span className="text-[10px] text-muted-foreground">Executive pitch &amp; production bible</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-border/50" />

              <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">
                Audio &amp; Multiverse Simulation
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setShowTableRead(true)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs cursor-pointer hover:bg-secondary"
              >
                <Volume2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">Multi-Voice Table Read</span>
                  <span className="text-[10px] text-muted-foreground">Synchronized character voice playback</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setMultiverseOpen(true)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs cursor-pointer hover:bg-secondary"
              >
                <Shuffle className="h-4 w-4 text-purple-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">Alternate Takes</span>
                  <span className="text-[10px] text-muted-foreground">Multiverse branching scene takes</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFusionOpen(true)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs cursor-pointer hover:bg-secondary"
              >
                <Sparkles className="h-4 w-4 text-accent shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">Film Fusion</span>
                  <span className="text-[10px] text-muted-foreground">Crossover narrative synthesis</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-border/50" />

              <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">
                Database &amp; Telemetry
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setClickhouseToolboxOpen(true)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs cursor-pointer hover:bg-secondary"
              >
                <Database className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">ClickHouse MCP Toolbox</span>
                    <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400 py-0 px-1">
                      Official
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Live story queries &amp; state audit (Shift+C)</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />

          {/* Inspector Toggle (Planning mode only) */}
          {mainTab === "planning" && (
            <Button
              size="sm"
              variant={isSidebarOpen ? "secondary" : "ghost"}
              onClick={toggleSidebar}
              className={cn(
                "h-7 w-7 p-0 cursor-pointer transition-colors shrink-0",
                isSidebarOpen
                  ? "bg-secondary text-accent border border-accent/40 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
              title={isSidebarOpen ? "Hide Inspector Sidebar" : "Show Inspector Sidebar"}
            >
              <Sliders className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* AI Commander Primary Action Button */}
          <Button
            size="sm"
            onClick={() => setAiCommanderOpen(true)}
            className="h-7 gap-1.5 text-xs bg-accent text-accent-foreground hover:bg-accent/90 font-semibold cursor-pointer px-2.5 shadow-xs shrink-0"
            title="Summon Studio AI Commander"
          >
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Commander</span>
          </Button>

          <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />

          <AuthUserButton className="h-7 text-xs" />
        </div>
      </header>

      {/* Active Studio Workspace */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
        {mainTab === "planning" && (
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
                    onDeleteEdge={handleDeleteEdge}
                    onLinkMultipleNodes={handleLinkMultipleNodes}
                    onUnlinkSelectedNodes={handleUnlinkSelectedNodes}
                    onUnlinkAllForNode={handleUnlinkAllForNode}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onOpenRevisions={() => setVersionControlOpen(true)}
                    revisionCount={vcsHistoryCount}
                    onAutoTidy={handleAutoTidy}
                    onOpenCommander={() => setAiCommanderOpen(true)}
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
                        <span>Open Staging Deck</span>
                        <span className="text-[10px] text-muted-foreground font-mono">({sceneTitle})</span>
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
                  edges={edges}
                  onSelectNode={(nodeId) => {
                    const found = nodes.find((n) => n.id === nodeId);
                    if (found) setSelectedNode(found);
                  }}
                  onUpdateNodeData={handleUpdateNodeData}
                  onDeleteEdge={handleDeleteEdge}
                  onAddEdge={(src, tgt) =>
                    onConnect({
                      source: src,
                      target: tgt,
                      sourceHandle: null,
                      targetHandle: null,
                    })
                  }
                  onUnlinkAllForNode={handleUnlinkAllForNode}
                  onOpenHotSeat={(charName) => {
                    setActiveCharacterName(charName);
                    setMainTab("simulation");
                    setSimulationTab("hotseat");
                  }}
                  onOpenScriptReader={() => setScriptViewerOpen(true)}
                  onOpenDeck={(subTab) => {
                    setMainTab("planning");
                    setDeckSubTab(subTab as DeckSubTab);
                  }}
                  onOpenTableRead={() => {
                    setMainTab("simulation");
                    setSimulationTab("audio");
                  }}
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
            {/* Director Staging Strip */}
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4 bg-secondary/30">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mr-1 hidden sm:inline">
                  Director Staging:
                </span>
                <button
                  type="button"
                  onClick={() => setDeckSubTab("blocking")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                    deckSubTab === "blocking"
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Camera className="h-3.5 w-3.5 text-emerald-400" />
                  <span>2D Camera Blocking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeckSubTab("tension")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                    deckSubTab === "tension"
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Activity className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Tension Curve</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeckSubTab("territory")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                    deckSubTab === "territory"
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Database className="h-3.5 w-3.5 text-purple-400" />
                  <span>Territory Comps</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeckSubTab("stripboard")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                    deckSubTab === "stripboard"
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Layers className="h-3.5 w-3.5 text-amber-400" />
                  <span>Stripboard</span>
                </button>
              </div>

              {/* Status Badge & Dock View Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMainTab("simulation")}
                  className="hidden md:flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 px-2.5 py-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 cursor-pointer"
                  title="Switch to Pre-viz Simulation Suite (Shift+2)"
                >
                  <Cpu className="h-3 w-3" />
                  <span>Simulation Suite ↗</span>
                </button>

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

            {/* Timeline Scrubber Bar for Staging Deck */}
            <div className="border-b border-border/50 px-4 py-2 bg-background/50 shrink-0">
              <TimelineScrubber
                durationSeconds={durationSeconds}
                value={timeSeconds}
                onChange={setTimeSeconds}
                events={events}
                scenePlacementSeconds={scenePlacementSeconds}
                sceneDurationSeconds={sceneDurationSeconds}
                sceneTitle={sceneTitle}
                onOpenTimeframeModal={() => setTimeframeModalOpen(true)}
                onExtend={handleExtendRuntime}
                onShrink={handleShrinkRuntime}
              />
            </div>

            {/* Active Staging Deck Sub-View */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              {deckSubTab === "blocking" && (
                <FloorPlanView
                  sceneTitle={sceneTitle}
                  characters={characters}
                  primaryLocation={primaryLocation}
                  onSendToVeo={handleSendStagingToVeo}
                />
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
                  targetTerritories={targetTerritories}
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
          </ResizablePanel>
        </ResizablePanelGroup>
        )}

        {/* TAB 2: Pre-viz Simulation Suite (Voice Cadence, Interrogation, Chemistry Bench, Showrunner Co-Pilot) */}
        {mainTab === "simulation" && (
          <div className="flex flex-1 flex-col min-h-0 overflow-hidden bg-background">
            {/* Simulation Sub-Navigation Bar */}
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4 bg-card/60 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mr-2 hidden md:inline">
                  Simulation Arena:
                </span>

                <button
                  type="button"
                  onClick={() => setSimulationTab("audio")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                    simulationTab === "audio"
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Headphones className="h-3.5 w-3.5 text-cyan-400" />
                  <span>AI Voice &amp; Cadence</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSimulationTab("hotseat")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                    simulationTab === "hotseat"
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                  <span>Character Interrogation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSimulationTab("chemistry")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                    simulationTab === "chemistry"
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Flame className="h-3.5 w-3.5 text-rose-400" />
                  <span>Dream Casting &amp; Chemistry</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSimulationTab("showrunner")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                    simulationTab === "showrunner"
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Showrunner AI Co-Pilot</span>
                </button>
              </div>

              {/* Quick Link to Generation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMainTab("generation")}
                  className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-md border border-amber-500/30 bg-amber-500/10 cursor-pointer transition-colors"
                  title="Switch to Veo Media Generation (Shift+3)"
                >
                  <Film className="h-3.5 w-3.5" />
                  <span>Veo Generation ↗</span>
                </button>
              </div>
            </div>

            {/* Sub-Tab 1: AI Voice & Audio Cadence */}
            {simulationTab === "audio" && (
              <div className="flex-1 min-h-0 overflow-hidden">
                <AudioStudioView
                  characters={characters}
                  screenplayText={screenplayText}
                  sceneTitle={sceneTitle}
                  onOpenVeoVideo={() => setMainTab("generation")}
                />
              </div>
            )}

            {/* Sub-Tab 2: Character Interrogation Chamber */}
            {simulationTab === "hotseat" && (
              <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
                <div className="border-b border-border/50 px-4 py-2 bg-background/50 shrink-0 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <TimelineScrubber
                      durationSeconds={durationSeconds}
                      value={timeSeconds}
                      onChange={setTimeSeconds}
                      events={events}
                      scenePlacementSeconds={scenePlacementSeconds}
                      sceneDurationSeconds={sceneDurationSeconds}
                      sceneTitle={sceneTitle}
                      onOpenTimeframeModal={() => setTimeframeModalOpen(true)}
                      onExtend={handleExtendRuntime}
                      onShrink={handleShrinkRuntime}
                    />
                  </div>

                  {/* Character Quick Switcher */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground mr-1 hidden sm:inline">
                      Subject:
                    </span>
                    {characters.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setActiveCharacterName(c.name)}
                        className={`rounded px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
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

                <div className="flex-1 min-h-0 overflow-hidden p-3 flex flex-col">
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

            {/* Sub-Tab 3: Dream Casting & Friction Sandbox */}
            {simulationTab === "chemistry" && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between shrink-0">
                  <div>
                    <h4 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                      <Flame className="h-4 w-4 text-rose-500" />
                      Dynamic Friction Sandbox ({characters[0]?.name || "Lead"} vs{" "}
                      {characters[1]?.name || "Counterpart"})
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Simulate how contrasting character motivations, secrets, and speech styles clash before production.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleRunChemistry}
                    disabled={isChemistryRunning}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-semibold gap-1.5 cursor-pointer"
                  >
                    {isChemistryRunning ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Simulating Conflict...</span>
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
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {chemistrySceneOutput ? (
                  <div className="flex-1 min-h-0 rounded-lg border border-border bg-card/60 p-4 font-mono text-xs leading-relaxed text-foreground overflow-y-auto shadow-inner">
                    <MarkdownRenderer content={chemistrySceneOutput} />
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
                    Click &ldquo;Run Chemistry Test&rdquo; to simulate an impromptu friction scene between{" "}
                    {characters[0]?.name || "Lead"} and {characters[1]?.name || "Counterpart"}.
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 4: Showrunner AI Co-Pilot */}
            {simulationTab === "showrunner" && (
              <div className="flex-1 min-h-0 overflow-hidden p-3 flex flex-col">
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
          </div>
        )}

        {/* TAB 3: Google Veo 3.1 & Master Cinema Video Generator */}
        {mainTab === "generation" && (
          <GenerationStudioView
            projectId={projectId}
            nodes={nodes}
            sceneTitle={sceneTitle}
            sceneSummary={sceneSummary}
            screenplayText={screenplayText}
            characters={characters}
            genre={genre}
            projectTitle={projectTitle}
            onReturnToStudio={() => setMainTab("planning")}
            initialCameraMotion={stagedCameraMotion}
            initialPromptNote={stagedPromptNote}
          />
        )}
      </div>

      {/* ClickHouse Live Query Inspector Drawer */}
      <ClickHouseInspector
        logs={queryLogs}
        lastSql={lastSql}
        isOpen={isClickHouseInspectorOpen}
        onToggle={() => setIsClickHouseInspectorOpen(!isClickHouseInspectorOpen)}
        onClose={() => setIsClickHouseInspectorOpen(false)}
      />

      {/* Screenplay Reader & Editor Modal with Multi-POV Support */}
      <ScreenplayDialog
        open={scriptViewerOpen}
        onOpenChange={setScriptViewerOpen}
        title={sceneTitle}
        summary={sceneSummary}
        screenplayText={screenplayText}
        characters={characters}
        currentTimecode={formatTimecode(timeSeconds)}
        onOpenHotSeat={(name) => {
          setScriptViewerOpen(false);
          setActiveCharacterName(name);
          setMainTab("simulation");
          setSimulationTab("hotseat");
        }}
        onSaveScript={(newScript) => {
          setScreenplayText(newScript);
          saveCurrentProject({ screenplayText: newScript });
        }}
        onReshard={handleReshardScript}
        isResharding={isGenerating}
      />

      {/* Modular Character Lab & Talent Vault Modal */}
      <CharacterLabDialog
        open={characterLabOpen}
        onOpenChange={setCharacterLabOpen}
        characters={characters}
        onUpdateCharacters={(updatedChars) => {
          setCharacters(updatedChars);
          saveCurrentProject({ characters: updatedChars });
          if (updatedChars.length > 0) {
            setActiveCharacterName(updatedChars[0].name);
          }
          syncGraphWithProject({
            ...initialProject,
            characters: updatedChars,
          });
        }}
        onOpenHotSeat={(name) => {
          setCharacterLabOpen(false);
          setActiveCharacterName(name);
          setMainTab("simulation");
          setSimulationTab("hotseat");
        }}
        onSendToVeo={(char) => {
          setVeoCharacterContext(char);
          setCharacterLabOpen(false);
          setVeoVideoOpen(true);
        }}
      />

      {/* Showrunner Scratchpad & Creative Brain */}
      <ScratchpadDialog
        open={scratchpadOpen}
        onOpenChange={setScratchpadOpen}
        projectId={projectId}
        onApplyNoteToScript={(noteText) => {
          const updated = `${screenplayText}\n\n// SCRATCHPAD BEAT:\n${noteText}`;
          setScreenplayText(updated);
          saveCurrentProject({ screenplayText: updated });
          toast.add({
            title: "Appended to Screenplay",
            description: "Scratchpad memo inserted into master screenplay.",
            type: "success",
          });
        }}
      />

      {/* Director's Pitch Lookbook & Production Bible */}
      <DirectorLookbookDialog
        open={lookbookOpen}
        onOpenChange={setLookbookOpen}
        projectTitle={projectTitle}
        genre={genre}
        premise={premiseInput}
        sceneTitle={sceneTitle}
        sceneSummary={sceneSummary}
        characters={characters}
        directorStyle={directorStyle}
        coreSecret={coreSecret}
        primaryLocation={primaryLocation}
        targetTerritories={targetTerritories}
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

      {/* Hollywood Slate Version Control & Take Changelog Modal */}
      <VersionControlDialog
        open={versionControlOpen}
        onOpenChange={setVersionControlOpen}
        vcs={vcs}
        onRevertSnapshot={handleRevertSnapshot}
      />

      {/* Centralized Studio Executive AI Commander Dialog */}
      <AICommanderDialog
        open={aiCommanderOpen}
        onOpenChange={setAiCommanderOpen}
        onExecutePrompt={handleExecuteCommanderPrompt}
      />

      {/* Official Partner: ClickHouse MCP Database Toolbox Modal */}
      <ClickHouseToolboxDialog
        open={clickhouseToolboxOpen}
        onOpenChange={setClickhouseToolboxOpen}
        projectId={projectId}
        queryLogs={queryLogs}
      />

      {/* Google Veo 3.1 Cinema Video Generation Modal */}
      <VeoVideoDialog
        open={veoVideoOpen}
        onOpenChange={(isOpen) => {
          setVeoVideoOpen(isOpen);
          if (!isOpen) {
            setVeoCharacterContext(null);
          }
        }}
        projectId={projectId}
        nodes={nodes}
        sceneTitle={sceneTitle}
        sceneSummary={sceneSummary}
        screenplayText={screenplayText}
        genre={genre}
        characters={characters}
        characterContext={veoCharacterContext || undefined}
        activeCharacterName={activeCharacterName}
        visualPrompt={
          veoCharacterContext
            ? `Cinematic 16:9 take featuring ${veoCharacterContext.name}${
                veoCharacterContext.actorComp ? ` (likeness resembling ${veoCharacterContext.actorComp})` : ""
              }${veoCharacterContext.wardrobe ? `, wearing ${veoCharacterContext.wardrobe}` : ""}. ${
                veoCharacterContext.visualDescription || ""
              } in ${sceneTitle}. 35mm anamorphic scope.`
            : ((nodes.find((n) => n.type === "storyboard")?.data?.prompt as string) ||
              `Cinematic 16:9 widescreen establishing shot of ${sceneTitle}. Moody shadows, photoreal 35mm film.`)
        }
      />

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
            directorStyle: data.directorStyle,
            coreSecret: data.coreSecret,
            primaryLocation: data.primaryLocation,
            targetTerritories: data.targetTerritories,
            customCharacters: data.customCharacters,
            narrativeFormat: data.narrativeFormat,
            targetRuntimeMinutes: data.targetRuntimeMinutes,
            scenePlacementSeconds: data.scenePlacementSeconds,
            sceneDurationSeconds: data.sceneDurationSeconds,
            totalScenesEstimate: data.totalScenesEstimate,
          });
          setProjectId(newProject.id);
          setProjectTitle(newProject.title);
          setGenre(newProject.genre);
          setPremiseInput(newProject.premise);
          setSceneTitle(newProject.sceneTitle);
          setSceneSummary(newProject.sceneSummary);
          setCharacters(newProject.characters);
          setActiveCharacterName(newProject.characters[0]?.name || "Lead");
          setDirectorStyle(newProject.directorStyle || "");
          setCoreSecret(newProject.coreSecret || "");
          setPrimaryLocation(newProject.primaryLocation || "");
          setTargetTerritories(newProject.targetTerritories || []);
          setNarrativeFormat(newProject.narrativeFormat || "feature");
          setTargetRuntimeMinutes(newProject.targetRuntimeMinutes || 95);
          const placement = newProject.scenePlacementSeconds ?? 34 * 60;
          setScenePlacementSeconds(placement);
          setTimeSeconds(placement);
          setSceneDurationSeconds(newProject.sceneDurationSeconds ?? 6 * 60);
          setScreenplayText("");
          setEvents([]);
          setHotSeatTurns([]);

          router.push(`/studio/${newProject.id}`);
          await runFullPipeline(newProject.id, newProject.premise);
        }}
      />

      {/* Project Timeframe & Scope Configuration Dialog */}
      <ProjectTimeframeDialog
        open={timeframeModalOpen}
        onOpenChange={setTimeframeModalOpen}
        projectId={projectId}
        projectTitle={projectTitle}
        genre={genre}
        targetRuntimeMinutes={targetRuntimeMinutes}
        narrativeFormat={narrativeFormat}
        scenePlacementSeconds={scenePlacementSeconds}
        sceneDurationSeconds={sceneDurationSeconds}
        directorStyle={directorStyle}
        coreSecret={coreSecret}
        primaryLocation={primaryLocation}
        targetTerritories={targetTerritories}
        onSave={handleSaveTimeframe}
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

            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelPipeline}
              className="w-full text-xs cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
