"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Clapperboard,
  Sparkles,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  LayoutGrid,
  Users,
  Zap,
  Unlink,
  RefreshCw,
  Scissors,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { formatTimecode } from "@/components/cinema/timeline-scrubber";
import { isBridgeScene } from "@/components/cinema/project-scenes-page";
import type { FilmScene } from "@/lib/project-store";
import { cn } from "@/lib/utils";

// ── CUSTOM SCENE NODE DATA ──
export interface SceneNodeData extends Record<string, unknown> {
  scene: FilmScene;
  index: number;
  totalScenes: number;
  isActive: boolean;
  isBridge: boolean;
  onSelectScene: (id: string) => void;
  onOpenSceneStudio: (id: string) => void;
  onMoveScene: (index: number, direction: "up" | "down") => void;
  onDeleteScene: (id: string) => void;
  onUnlinkNode: (id: string) => void;
}

// ── CUSTOM SCENE FLOW NODE ──
function SceneFlowNode({ data }: NodeProps & { data: SceneNodeData }) {
  const {
    scene,
    index,
    totalScenes,
    isActive,
    isBridge,
    onSelectScene,
    onOpenSceneStudio,
    onMoveScene,
    onDeleteScene,
    onUnlinkNode,
  } = data;

  const durationMin = Math.round((scene.durationSeconds || 180) / 60);
  const startTime = formatTimecode(scene.startSeconds || 0);

  return (
    <div
      onClick={() => onSelectScene(scene.id)}
      onDoubleClick={() => onOpenSceneStudio(scene.id)}
      className={cn(
        "w-[340px] rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all select-none cursor-grab active:cursor-grabbing relative group",
        isBridge
          ? isActive
            ? "border-purple-400 bg-purple-950/40 ring-2 ring-purple-500/50 shadow-purple-900/40"
            : "border-purple-500/60 bg-purple-950/20 hover:border-purple-400 hover:bg-purple-950/30 shadow-purple-950/20"
          : isActive
          ? "border-accent bg-card/95 ring-2 ring-accent/40 shadow-accent/20"
          : "border-border/80 bg-card/85 hover:border-border hover:bg-card/95 shadow-black/30"
      )}
    >
      {/* Multi-Directional Connection Handles for Freeform Wiring */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="!h-3.5 !w-3.5 !bg-accent !border-2 !border-background !-left-2 transition-transform hover:!scale-150 cursor-crosshair z-30"
        title="Input: Connect previous narrative beat"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="!h-3.5 !w-3.5 !bg-accent !border-2 !border-background !-right-2 transition-transform hover:!scale-150 cursor-crosshair z-30"
        title="Output: Connect next narrative beat"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="in-top"
        className="!h-3 !w-3 !bg-accent/70 !border-2 !border-background !-top-1.5 transition-transform hover:!scale-150 cursor-crosshair z-30"
        title="Top Input: Branching flow"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="out-bottom"
        className="!h-3 !w-3 !bg-accent/70 !border-2 !border-background !-bottom-1.5 transition-transform hover:!scale-150 cursor-crosshair z-30"
        title="Bottom Output: Branching flow"
      />

      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "font-mono text-xs font-black px-2 py-0.5 rounded",
              isBridge
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-accent/15 text-accent border border-accent/30"
            )}
          >
            SCENE {String(scene.sceneNumber).padStart(2, "0")}
          </span>

          <span className="font-mono text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/70 uppercase">
            {scene.slugline?.split("-")[0]?.trim() || "INT. SCENE"}
          </span>

          {isBridge && (
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-[10px] font-mono flex items-center gap-1 font-bold">
              <Sparkles className="h-2.5 w-2.5 text-purple-400" />
              BRIDGE
            </Badge>
          )}

          {isActive && (
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
              Active
            </Badge>
          )}
        </div>

        {/* Node Actions: Unlink wires & Quick Nudge */}
        <div className="flex items-center gap-1 nodrag">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUnlinkNode(scene.id);
            }}
            title="Detach all connection wires from this scene"
            className="p-1 rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Unlink className="h-3 w-3" />
          </button>

          <div className="h-3 w-px bg-border/60 mx-0.5" />

          <button
            type="button"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              onMoveScene(index, "up");
            }}
            title="Move scene earlier in sequence"
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalScenes - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMoveScene(index, "down");
            }}
            title="Move scene later in sequence"
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scene Title & Slugline */}
      <div className="space-y-1 mb-2.5">
        <h4 className="text-sm font-bold text-foreground truncate tracking-tight">
          {scene.title}
        </h4>
        <p className="font-mono text-[11px] text-muted-foreground truncate">
          {scene.slugline}
        </p>
      </div>

      {/* Dramatic Summary Excerpt */}
      <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed mb-3">
        {scene.summary || "Dramatic beat sequence ready for directorial exploration."}
      </p>

      {/* Cast & Location Pills */}
      <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2.5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 truncate">
          <Clock className="h-3 w-3 text-accent shrink-0" />
          <span className="font-mono text-[10px]">
            {startTime} ({durationMin}m)
          </span>
        </div>

        {scene.castPresent && scene.castPresent.length > 0 && (
          <div className="flex items-center gap-1 truncate max-w-[140px]">
            <Users className="h-3 w-3 text-cyan-400 shrink-0" />
            <span className="truncate text-[10px] font-mono">
              {scene.castPresent.slice(0, 2).join(", ")}
              {scene.castPresent.length > 2 ? ` +${scene.castPresent.length - 2}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Quick Launch CTA Button */}
      <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between nodrag">
        <span className="text-[10px] font-mono text-muted-foreground">
          Double-click to edit
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSceneStudio(scene.id);
          }}
          className={cn(
            "h-6 px-2 text-[10px] font-semibold gap-1 rounded-md shadow-xs cursor-pointer",
            isBridge
              ? "border-purple-500/40 text-purple-300 hover:bg-purple-900/40"
              : "border-accent/40 text-accent hover:bg-accent/10"
          )}
        >
          <Clapperboard className="h-3 w-3" />
          Studio
        </Button>
      </div>
    </div>
  );
}

// ── CUSTOM SCENE FLOW EDGE WITH + BRIDGE AND DETACH BUTTON ──
interface SceneEdgeData extends Record<string, unknown> {
  sourceIndex: number;
  targetIsBridge: boolean;
  onGenerateBridge: (index: number) => void;
  isGeneratingBridge: boolean;
  sourceTitle: string;
  targetTitle: string;
  onDetachEdge: (edgeId: string) => void;
}

function SceneFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const edgeData = data as unknown as SceneEdgeData | undefined;
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const isGenerating = Boolean(edgeData?.isGeneratingBridge);
  const targetIsBridge = Boolean(edgeData?.targetIsBridge);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: targetIsBridge ? "rgba(168, 85, 247, 0.75)" : "rgba(234, 179, 8, 0.7)",
          strokeWidth: 2.2,
          strokeDasharray: isGenerating ? "4,4" : undefined,
        }}
        markerEnd={markerEnd}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="z-20 nodrag nopan flex items-center gap-1 bg-card/95 border border-border/80 px-2 py-0.5 rounded-full shadow-lg backdrop-blur"
        >
          {targetIsBridge ? (
            <div className="flex items-center gap-1 text-purple-300 text-[10px] font-mono">
              <Zap className="h-2.5 w-2.5 text-purple-400" />
              <span>Bridge Beat</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={isGenerating}
              onClick={(e) => {
                e.stopPropagation();
                if (edgeData?.onGenerateBridge && typeof edgeData.sourceIndex === "number") {
                  edgeData.onGenerateBridge(edgeData.sourceIndex);
                }
              }}
              className="flex items-center gap-1 text-accent hover:text-accent-foreground text-[10px] font-mono transition-all cursor-pointer group disabled:opacity-50"
              title="Insert AI Transitional Bridge between these scenes"
            >
              <Sparkles className={cn("h-2.5 w-2.5 text-accent", isGenerating && "animate-spin")} />
              <span>{isGenerating ? "Generating..." : "+ AI Bridge"}</span>
            </button>
          )}

          <div className="h-3 w-px bg-border/60 mx-0.5" />

          {/* Detach / Sever Connection Wire Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              edgeData?.onDetachEdge?.(id);
            }}
            className="p-0.5 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
            title="Detach this connection (sever wire)"
          >
            <Scissors className="h-2.5 w-2.5" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes: NodeTypes = {
  sceneNode: SceneFlowNode,
};

const edgeTypes: EdgeTypes = {
  sceneEdge: SceneFlowEdge,
};

// ── INTERNAL GRAPH CANVAS CONTENT (inside ReactFlowProvider) ──
interface SceneGraphCanvasProps {
  scenes: FilmScene[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onOpenSceneStudio: (sceneId: string) => void;
  onMoveScene: (index: number, direction: "up" | "down") => void;
  onReorderScenes: (reordered: FilmScene[]) => void;
  onGenerateBridge: (index: number) => void;
  isGeneratingBridge: number | null;
  onDeleteScene: (sceneId: string) => void;
  onAddScene: () => void;
  onQuickAddScene?: (pos?: { x: number; y: number }) => void;
  characters?: Array<{ name: string }>;
  projectTitle: string;
}

function SceneGraphCanvas({
  scenes,
  activeSceneId,
  onSelectScene,
  onOpenSceneStudio,
  onMoveScene,
  onReorderScenes,
  onGenerateBridge,
  isGeneratingBridge,
  onDeleteScene,
  onAddScene,
  onQuickAddScene,
  characters = [],
  projectTitle,
}: SceneGraphCanvasProps) {
  const { fitView } = useReactFlow();

  // Persistent node positions store across scene updates
  const nodePositionsRef = React.useRef<Map<string, { x: number; y: number }>>(new Map());

  // Selected scene
  const activeIndex = scenes.findIndex((s) => s.id === activeSceneId);
  const selectedScene = scenes[activeIndex] || scenes[0];

  // Handler to detach a single edge
  const handleDetachEdge = React.useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      toast.add({
        title: "Connection Detached",
        description: "Narrative wire severed.",
        type: "info",
      });
    },
    [] // setEdges is stable
  );

  // Handler to unlink all wires for a node
  const handleUnlinkNode = React.useCallback(
    (sceneId: string) => {
      setEdges((eds) => eds.filter((e) => e.source !== sceneId && e.target !== sceneId));
      toast.add({
        title: "Scene Detached",
        description: "All narrative wires removed from this scene.",
        type: "info",
      });
    },
    []
  );

  // Build sequential default edges
  const buildInitialEdges = React.useCallback((): Edge[] => {
    const edgeList: Edge[] = [];
    for (let i = 0; i < scenes.length - 1; i++) {
      const source = scenes[i];
      const target = scenes[i + 1];
      const targetIsBridge = isBridgeScene(target);

      edgeList.push({
        id: `edge-${source.id}-${target.id}`,
        source: source.id,
        target: target.id,
        sourceHandle: "out",
        targetHandle: "in",
        type: "sceneEdge",
        animated: true,
        data: {
          sourceIndex: i,
          targetIsBridge,
          onGenerateBridge,
          isGeneratingBridge: isGeneratingBridge === i,
          sourceTitle: source.title,
          targetTitle: target.title,
          onDetachEdge: handleDetachEdge,
        } as SceneEdgeData,
      });
    }
    return edgeList;
  }, [scenes, onGenerateBridge, isGeneratingBridge, handleDetachEdge]);

  // Nodes & Edges state managed by React Flow hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<SceneNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Sync nodes while preserving user-dragged coordinates
  React.useEffect(() => {
    setNodes((prevNodes) => {
      return scenes.map((scene, idx) => {
        const isBridge = isBridgeScene(scene);
        const isActive = scene.id === activeSceneId;

        // Preserve existing user-dragged position or calculate default sequential position
        const existingPos =
          nodePositionsRef.current.get(scene.id) ||
          prevNodes.find((n) => n.id === scene.id)?.position || {
            x: idx * 420 + 80,
            y: 180 + (idx % 2 === 0 ? 0 : 36),
          };

        nodePositionsRef.current.set(scene.id, existingPos);

        return {
          id: scene.id,
          type: "sceneNode",
          position: existingPos,
          data: {
            scene,
            index: idx,
            totalScenes: scenes.length,
            isActive,
            isBridge,
            onSelectScene,
            onOpenSceneStudio,
            onMoveScene,
            onDeleteScene,
            onUnlinkNode: handleUnlinkNode,
          } as SceneNodeData,
        };
      });
    });
  }, [
    scenes,
    activeSceneId,
    onSelectScene,
    onOpenSceneStudio,
    onMoveScene,
    onDeleteScene,
    handleUnlinkNode,
    setNodes,
  ]);

  // Initialize or sync edges
  React.useEffect(() => {
    setEdges((prevEdges) => {
      // If edges already exist, preserve user customizations and update edge data
      if (prevEdges.length > 0) {
        return prevEdges.map((e) => {
          const sIdx = scenes.findIndex((sc) => sc.id === e.source);
          const targetScene = scenes.find((sc) => sc.id === e.target);
          return {
            ...e,
            data: {
              ...(e.data as SceneEdgeData),
              sourceIndex: sIdx,
              targetIsBridge: isBridgeScene(targetScene),
              onGenerateBridge,
              isGeneratingBridge: isGeneratingBridge === sIdx,
              onDetachEdge: handleDetachEdge,
            },
          };
        });
      }
      return buildInitialEdges();
    });
  }, [scenes, onGenerateBridge, isGeneratingBridge, buildInitialEdges, handleDetachEdge, setEdges]);

  // When node drag ends, remember its position
  const handleNodeDragStop = (_event: unknown, node: Node) => {
    nodePositionsRef.current.set(node.id, { x: node.position.x, y: node.position.y });
  };

  // Connect handle-to-handle
  const handleConnect = React.useCallback(
    (connection: Connection) => {
      const sIdx = scenes.findIndex((s) => s.id === connection.source);
      const targetScene = scenes.find((s) => s.id === connection.target);

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "sceneEdge",
            animated: true,
            data: {
              sourceIndex: sIdx,
              targetIsBridge: isBridgeScene(targetScene),
              onGenerateBridge,
              isGeneratingBridge: false,
              sourceTitle: scenes[sIdx]?.title || "Scene",
              targetTitle: targetScene?.title || "Scene",
              onDetachEdge: handleDetachEdge,
            } as SceneEdgeData,
          },
          eds
        )
      );

      toast.add({
        title: "Narrative Wire Connected",
        description: "Scenes connected in story graph flow.",
        type: "success",
      });
    },
    [scenes, onGenerateBridge, handleDetachEdge, setEdges]
  );

  // Reconnect / grab wire end to reattach
  const handleReconnect = React.useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
      toast.add({
        title: "Connection Re-wired",
        type: "info",
      });
    },
    [setEdges]
  );

  // Auto-Tidy layout action: smoothly realigns all nodes horizontally in sequence
  const handleAutoTidy = React.useCallback(() => {
    setNodes((prevNodes) => {
      return prevNodes.map((n, idx) => {
        const newPos = { x: idx * 420 + 80, y: 180 + (idx % 2 === 0 ? 0 : 36) };
        nodePositionsRef.current.set(n.id, newPos);
        return {
          ...n,
          position: newPos,
        };
      });
    });
    setTimeout(() => {
      fitView({ duration: 500, padding: 0.25 });
    }, 50);
  }, [fitView, setNodes]);

  // Sync Project Sequence Order from Graph Layout (sorts scenes left-to-right by node X position)
  const handleSyncSequenceFromGraph = React.useCallback(() => {
    // Sort scenes based on current node X coordinates
    const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
    const sortedScenes: FilmScene[] = [];

    for (const n of sortedNodes) {
      const found = scenes.find((s) => s.id === n.id);
      if (found) sortedScenes.push(found);
    }

    if (sortedScenes.length > 0) {
      onReorderScenes(sortedScenes);
      toast.add({
        title: "Sequence Order Synced",
        description: `Project scene order re-indexed based on left-to-right graph layout.`,
        type: "success",
      });
    }
  }, [nodes, scenes, onReorderScenes]);

  // Quick Add scene on double click on canvas pane
  const handlePaneDoubleClick = (e: React.MouseEvent) => {
    if (onQuickAddScene) {
      onQuickAddScene();
    }
  };

  const totalRuntimeMinutes = Math.round(
    scenes.reduce((acc, s) => acc + (s.durationSeconds || 180), 0) / 60
  );

  return (
    <div className="relative h-[720px] w-full rounded-xl border border-border bg-background/50 overflow-hidden flex flex-col shadow-inner">
      {/* ── TOP GRAPH TOOLBAR ── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-3 bg-card/90 backdrop-blur-md p-2.5 rounded-xl border border-border/80 shadow-lg">
        {/* Left: Info & Summary */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-heading text-xs font-bold text-foreground">
              Narrative Node Graph
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-muted-foreground border-l border-border pl-3">
            <span>{scenes.length} Nodes</span>
            <span>•</span>
            <span>{totalRuntimeMinutes}m Runtime</span>
            <span>•</span>
            <span className="text-purple-400">
              {scenes.filter(isBridgeScene).length} Bridges
            </span>
          </div>
        </div>

        {/* Right: Dynamic Graph Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sync Order to Project Sequence */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSyncSequenceFromGraph}
            className="h-7 px-2.5 text-xs font-mono gap-1.5 border-accent/40 text-accent hover:bg-accent/15 cursor-pointer shadow-xs"
            title="Update film sequence order based on left-to-right node positions"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sync Sequence to Graph</span>
          </Button>

          {/* Auto-Tidy Sequence */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoTidy}
            className="h-7 px-2.5 text-xs font-mono gap-1.5 border-border hover:border-accent hover:text-accent cursor-pointer"
            title="Align nodes horizontally along narrative timeline"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-accent" />
            <span className="hidden sm:inline">Auto-Tidy</span>
          </Button>

          {/* Quick Add Node */}
          {onQuickAddScene && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onQuickAddScene()}
              className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-accent/40 text-accent hover:bg-accent/10 shadow-xs cursor-pointer"
              title="Instantly spawn a new scene node on the canvas"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Quick Beat</span>
            </Button>
          )}

          {/* Add Detailed Scene Modal */}
          <Button
            size="sm"
            onClick={onAddScene}
            className="h-7 px-2.5 text-xs font-semibold gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Scene...</span>
          </Button>
        </div>
      </div>

      {/* ── REACT FLOW CANVAS ── */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onReconnect={handleReconnect}
          onNodeDragStop={handleNodeDragStop}
          onNodeClick={(_, node) => onSelectScene(node.id)}
          onDoubleClick={handlePaneDoubleClick}
          edgesReconnectable={true}
          deleteKeyCode={["Backspace", "Delete"]}
          panOnDrag={true}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          colorMode="dark"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.2}
            color="rgba(255, 255, 255, 0.08)"
          />
          <Controls
            showInteractive={false}
            className="!rounded-lg !border !border-border !bg-card !shadow-lg [&_button]:!border-border [&_button]:!bg-card [&_button]:!fill-foreground [&_button:hover]:!bg-secondary !bottom-24 !left-4"
          />
          <MiniMap
            pannable
            zoomable
            className="!rounded-lg !border !border-border !bg-card !bottom-24 !right-4"
            maskColor="rgba(0, 0, 0, 0.7)"
            nodeColor={(n) => {
              if (n.data?.isBridge) return "#a855f7";
              if (n.data?.isActive) return "#eab308";
              return "#3f3f46";
            }}
            nodeStrokeColor="transparent"
          />
        </ReactFlow>
      </div>

      {/* ── BOTTOM SELECTED SCENE INSPECTOR DRAWER ── */}
      {selectedScene && (
        <div className="border-t border-border bg-card/95 backdrop-blur-md p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xl z-20">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center font-mono font-black text-sm shrink-0 border",
                isBridgeScene(selectedScene)
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : "bg-accent/15 text-accent border-accent/30"
              )}
            >
              S{selectedScene.sceneNumber}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-foreground">
                  {selectedScene.title}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {selectedScene.slugline}
                </span>
                {isBridgeScene(selectedScene) && (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-[10px] font-mono">
                    ⚡ BRIDGE
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
                {selectedScene.summary || "No dramatic beat summary provided."}
              </p>
            </div>
          </div>

          {/* Quick Inspector Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Button
                size="sm"
                variant="outline"
                disabled={activeIndex <= 0}
                onClick={() => onMoveScene(activeIndex, "up")}
                className="h-8 px-2 text-xs font-mono gap-1"
                title="Move earlier in sequence"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Earlier</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={activeIndex >= scenes.length - 1}
                onClick={() => onMoveScene(activeIndex, "down")}
                className="h-8 px-2 text-xs font-mono gap-1"
                title="Move later in sequence"
              >
                <span className="hidden sm:inline">Later</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {activeIndex < scenes.length - 1 && (
              <Button
                size="sm"
                variant="outline"
                disabled={isGeneratingBridge === activeIndex}
                onClick={() => onGenerateBridge(activeIndex)}
                className="h-8 text-xs font-mono gap-1.5 border-purple-500/40 text-purple-300 hover:bg-purple-900/30"
              >
                <Sparkles
                  className={cn(
                    "h-3 w-3 text-purple-400",
                    isGeneratingBridge === activeIndex && "animate-spin"
                  )}
                />
                <span className="hidden sm:inline">Bridge to Next</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => onDeleteScene(selectedScene.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:border-destructive/40"
              title="Delete Scene"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>

            <Button
              size="sm"
              onClick={() => onOpenSceneStudio(selectedScene.id)}
              className="h-8 px-3 text-xs font-bold gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs"
            >
              <Clapperboard className="h-3.5 w-3.5" />
              Launch Scene Studio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── EXPORTED WRAPPER WITH REACTFLOWPROVIDER ──
export interface SceneGraphViewProps {
  scenes: FilmScene[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onOpenSceneStudio: (sceneId: string) => void;
  onMoveScene: (index: number, direction: "up" | "down") => void;
  onReorderScenes: (reordered: FilmScene[]) => void;
  onGenerateBridge: (index: number) => void;
  isGeneratingBridge: number | null;
  onDeleteScene: (sceneId: string) => void;
  onAddScene: () => void;
  onQuickAddScene?: (pos?: { x: number; y: number }) => void;
  characters?: Array<{ name: string }>;
  projectTitle: string;
}

export function SceneGraphView(props: SceneGraphViewProps) {
  return (
    <ReactFlowProvider>
      <SceneGraphCanvas {...props} />
    </ReactFlowProvider>
  );
}
