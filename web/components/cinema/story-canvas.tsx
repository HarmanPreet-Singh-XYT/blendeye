"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ConnectionMode,
  SelectionMode,
  type Edge,
  type Node,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "@/components/cinema/graph-nodes";
import { DeletableEdge } from "@/components/cinema/deletable-edge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  FileText,
  User,
  Sliders,
  Sparkles,
  Clapperboard,
  Image as ImageIcon,
  Compass,
  Activity,
  Volume2,
  Globe2,
  Users2,
  Plus,
  Link2,
  Unlink,
  Share2,
  X,
  Scissors,
  Layers,
  ArrowRight,
  RotateCcw,
  RotateCw,
  LayoutGrid,
  History,
  Zap,
} from "lucide-react";

export interface StoryCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: React.ComponentProps<typeof ReactFlow>["onNodesChange"];
  onEdgesChange?: React.ComponentProps<typeof ReactFlow>["onEdgesChange"];
  onConnect?: React.ComponentProps<typeof ReactFlow>["onConnect"];
  onNodeClick?: React.ComponentProps<typeof ReactFlow>["onNodeClick"];
  onAddNode?: (type: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onLinkMultipleNodes?: (nodeIds: string[], mode: "chain" | "all") => void;
  onUnlinkSelectedNodes?: (nodeIds: string[]) => void;
  onUnlinkAllForNode?: (nodeId: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onOpenRevisions?: () => void;
  revisionCount?: number;
  onAutoTidy?: () => void;
  onOpenCommander?: () => void;
  extraNodeTypes?: NodeTypes;
  children?: React.ReactNode;
}

const customEdgeTypes: EdgeTypes = {
  deletable: DeletableEdge,
  default: DeletableEdge,
  smoothstep: DeletableEdge,
};

function StoryCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onAddNode,
  onDeleteEdge,
  onLinkMultipleNodes,
  onUnlinkSelectedNodes,
  onUnlinkAllForNode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenRevisions,
  revisionCount,
  onAutoTidy,
  onOpenCommander,
  extraNodeTypes,
  children,
}: StoryCanvasProps) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [selectedNodes, setSelectedNodes] = React.useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = React.useState<Edge[]>([]);
  const [quickLinkOpen, setQuickLinkOpen] = React.useState(false);

  // Keyboard shortcuts for Undo (Cmd+Z) and Redo (Cmd+Shift+Z / Cmd+Y)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && !e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        onUndo?.();
      } else if (
        (cmdOrCtrl && e.shiftKey && (e.key === "z" || e.key === "Z")) ||
        (cmdOrCtrl && (e.key === "y" || e.key === "Y"))
      ) {
        e.preventDefault();
        onRedo?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUndo, onRedo]);

  // Track if edge reconnection was successful or if user dragged wire to empty space to disconnect
  const edgeReconnectSuccessful = React.useRef(true);

  const handleReconnectStart = React.useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const handleReconnect = React.useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      if (onDeleteEdge) {
        onDeleteEdge(oldEdge.id);
      } else {
        onEdgesChange?.([{ type: "remove", id: oldEdge.id }]);
      }
      onConnect?.(newConnection);
    },
    [onDeleteEdge, onEdgesChange, onConnect]
  );

  const handleReconnectEnd = React.useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        // Dropped wire onto open canvas -> UNLINK connection
        if (onDeleteEdge) {
          onDeleteEdge(edge.id);
        } else {
          onEdgesChange?.([{ type: "remove", id: edge.id }]);
        }
      }
      edgeReconnectSuccessful.current = true;
    },
    [onDeleteEdge, onEdgesChange]
  );

  const handleSelectionChange = React.useCallback((params: OnSelectionChangeParams) => {
    setSelectedNodes(params.nodes);
    setSelectedEdges(params.edges);
  }, []);

  // Multi-node linking handlers
  const handleLinkSelected = React.useCallback(
    (mode: "chain" | "all") => {
      const ids = selectedNodes.map((n) => n.id);
      if (ids.length < 2) return;
      if (onLinkMultipleNodes) {
        onLinkMultipleNodes(ids, mode);
      } else {
        if (mode === "chain") {
          for (let i = 0; i < ids.length - 1; i++) {
            onConnect?.({
              source: ids[i],
              target: ids[i + 1],
              sourceHandle: null,
              targetHandle: null,
            });
          }
        } else {
          for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
              onConnect?.({
                source: ids[i],
                target: ids[j],
                sourceHandle: null,
                targetHandle: null,
              });
            }
          }
        }
      }
    },
    [selectedNodes, onLinkMultipleNodes, onConnect]
  );

  const handleUnlinkSelected = React.useCallback(() => {
    const ids = selectedNodes.map((n) => n.id);
    if (ids.length < 2) return;
    if (onUnlinkSelectedNodes) {
      onUnlinkSelectedNodes(ids);
    } else {
      const idSet = new Set(ids);
      const toRemove = edges.filter((e) => idSet.has(e.source) && idSet.has(e.target));
      toRemove.forEach((e) => {
        if (onDeleteEdge) onDeleteEdge(e.id);
      });
      if (!onDeleteEdge) {
        onEdgesChange?.(toRemove.map((e) => ({ type: "remove", id: e.id })));
      }
    }
  }, [selectedNodes, onUnlinkSelectedNodes, edges, onDeleteEdge, onEdgesChange]);

  const handleUnlinkEdge = React.useCallback(
    (edgeId: string) => {
      if (onDeleteEdge) {
        onDeleteEdge(edgeId);
      } else {
        onEdgesChange?.([{ type: "remove", id: edgeId }]);
      }
    },
    [onDeleteEdge, onEdgesChange]
  );

  // Link single selected node to chosen target
  const handleQuickLinkSingleNode = React.useCallback(
    (targetNodeId: string) => {
      if (selectedNodes.length !== 1 || !targetNodeId || selectedNodes[0].id === targetNodeId) {
        return;
      }
      onConnect?.({
        source: selectedNodes[0].id,
        target: targetNodeId,
        sourceHandle: null,
        targetHandle: null,
      });
      setQuickLinkOpen(false);
    },
    [selectedNodes, onConnect]
  );

  const singleSelectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const singleNodeConnections = singleSelectedNode
    ? edges.filter((e) => e.source === singleSelectedNode.id || e.target === singleSelectedNode.id)
    : [];

  return (
    <div className="story-canvas relative h-full w-full overflow-hidden rounded-xl border border-border">
      {/* Floating Unreal-style Blueprint Node Spawner */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/90 p-1.5 shadow-2xl backdrop-blur">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPaletteOpen(!paletteOpen)}
          className="h-8 gap-1.5 border-accent/40 bg-accent/10 text-xs font-semibold text-accent hover:bg-accent/20 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Blueprint Node</span>
        </Button>

        {paletteOpen && (
          <div className="absolute left-0 top-11 flex w-[580px] flex-col gap-2 rounded-xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="font-heading text-xs font-bold text-foreground">
                Cinema Blueprint Palette — Modular Backlot Nodes
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">Click to spawn on canvas</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              {/* Category 1: Ingestion */}
              <div className="flex flex-col gap-1 rounded-lg border border-purple-500/20 bg-purple-500/5 p-2">
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">1. Ingestion</span>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("clip");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-purple-500/20 text-foreground transition-colors cursor-pointer"
                >
                  <Video className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>YouTube Clip</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("note");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-purple-500/20 text-foreground transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Voice / Idea Note</span>
                </button>
              </div>

              {/* Category 2: Character Lab */}
              <div className="flex flex-col gap-1 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">2. Character Lab</span>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("characterCore");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-cyan-500/20 text-foreground font-semibold transition-colors cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>Character Core</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("actor");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-cyan-500/20 text-foreground transition-colors cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Actor Legacy</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("personality");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-cyan-500/20 text-foreground transition-colors cursor-pointer"
                >
                  <Sliders className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>Personality Dials</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("quirks");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-cyan-500/20 text-foreground transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span>Behavior Quirks</span>
                </button>
              </div>

              {/* Category 3: Narrative & Screenplay */}
              <div className="flex flex-col gap-1 rounded-lg border border-accent/20 bg-accent/5 p-2">
                <span className="text-[10px] font-mono uppercase text-accent font-bold">3. Screenplay</span>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("scene");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-accent/20 text-foreground transition-colors cursor-pointer"
                >
                  <Clapperboard className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>Scene Master</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("script");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-accent/20 text-foreground transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>Screenplay Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("chemistry");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-accent/20 text-foreground transition-colors cursor-pointer"
                >
                  <Users2 className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span>Chemistry Bench</span>
                </button>
              </div>

              {/* Category 4: Director Deck & Production */}
              <div className="flex flex-col gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">4. Director Suite</span>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("storyboard");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-emerald-500/20 text-foreground transition-colors cursor-pointer"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Storyboard Frame</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("floorplan");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-emerald-500/20 text-foreground transition-colors cursor-pointer"
                >
                  <Compass className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>2D Floor Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("tensionCurve");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-emerald-500/20 text-foreground transition-colors cursor-pointer"
                >
                  <Activity className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span>Tension Curve</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("tableRead");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-emerald-500/20 text-foreground transition-colors cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>Table Read</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("market");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-emerald-500/20 text-foreground transition-colors cursor-pointer"
                >
                  <Globe2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>ClickHouse Map</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Hollywood Backlot VCS & Auto-Tidy Toolbar */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-lg border border-border/80 bg-card/90 p-1.5 shadow-2xl backdrop-blur">
        <Button
          size="sm"
          variant="ghost"
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo Take Change (Cmd+Z)"
          className="h-7 px-2 text-xs font-mono gap-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden sm:inline">Undo</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo Take Change (Cmd+Shift+Z)"
          className="h-7 px-2 text-xs font-mono gap-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
        >
          <RotateCw className="h-3 w-3" />
          <span className="hidden sm:inline">Redo</span>
        </Button>

        <div className="h-4 w-px bg-border/60 mx-0.5" />

        {onAutoTidy && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onAutoTidy}
            title="Auto-align backlot nodes into neat production workflow lanes"
            className="h-7 px-2 text-xs font-medium gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/15 cursor-pointer"
          >
            <LayoutGrid className="h-3 w-3" />
            <span className="hidden sm:inline">Auto-Tidy</span>
          </Button>
        )}
      </div>

      {/* Floating Multi-Node Linking & Unlinking Action Toolbar */}
      {selectedNodes.length >= 2 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-xl border border-accent/40 bg-card/95 px-3 py-1.5 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-top-2 duration-150">
          <Badge variant="outline" className="border-accent/40 bg-accent/15 text-accent font-mono text-[10px] py-0.5">
            {selectedNodes.length} Nodes Selected
          </Badge>

          <button
            type="button"
            onClick={() => handleLinkSelected("chain")}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow hover:bg-accent/90 transition-all cursor-pointer"
            title="Link selected nodes in sequence (A → B → C)"
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>Link in Sequence</span>
          </button>

          <button
            type="button"
            onClick={() => handleLinkSelected("all")}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/80 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary hover:border-accent transition-all cursor-pointer"
            title="Connect all selected nodes to each other"
          >
            <Share2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Link All to Each Other</span>
          </button>

          <button
            type="button"
            onClick={handleUnlinkSelected}
            className="flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive hover:text-white transition-all cursor-pointer"
            title="Sever all connections between selected nodes"
          >
            <Unlink className="h-3.5 w-3.5" />
            <span>Unlink Selected</span>
          </button>
        </div>
      )}

      {/* Floating Single Node Quick-Action Pill */}
      {singleSelectedNode && selectedNodes.length === 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-xl border border-border/80 bg-card/90 px-3 py-1.5 shadow-xl backdrop-blur text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-foreground font-medium truncate max-w-[160px]">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="truncate">
              {((singleSelectedNode.data as any)?.title ||
                (singleSelectedNode.data as any)?.name ||
                singleSelectedNode.id) as string}
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickLinkOpen(!quickLinkOpen)}
              className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[11px] text-foreground hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
              title="Link this node to another node"
            >
              <Link2 className="h-3 w-3" />
              <span>Link to...</span>
            </button>

            {quickLinkOpen && (
              <div className="absolute left-0 top-8 z-40 w-52 rounded-lg border border-border bg-card p-1.5 shadow-2xl backdrop-blur max-h-56 overflow-y-auto">
                <div className="text-[10px] font-mono text-muted-foreground px-2 py-1 uppercase">
                  Select target node to wire
                </div>
                {nodes
                  .filter((n) => n.id !== singleSelectedNode.id)
                  .map((targetNode) => {
                    const label =
                      (targetNode.data as any)?.title ||
                      (targetNode.data as any)?.name ||
                      targetNode.id;
                    return (
                      <button
                        key={targetNode.id}
                        type="button"
                        onClick={() => handleQuickLinkSingleNode(targetNode.id)}
                        className="flex items-center justify-between w-full rounded px-2 py-1 text-left text-xs hover:bg-accent/20 hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
                      >
                        <span className="truncate">{label}</span>
                        <ArrowRight className="h-3 w-3 opacity-50 shrink-0" />
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {singleNodeConnections.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (onUnlinkAllForNode) {
                  onUnlinkAllForNode(singleSelectedNode.id);
                } else {
                  singleNodeConnections.forEach((c) => handleUnlinkEdge(c.id));
                }
              }}
              className="flex items-center gap-1 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-2 py-0.5 text-[11px] text-rose-300 transition-all cursor-pointer"
              title={`Sever all ${singleNodeConnections.length} connection wires attached to this node`}
            >
              <Unlink className="h-3 w-3" />
              <span>Unlink All ({singleNodeConnections.length})</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Selected Edge Unlink Banner */}
      {selectedEdges.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-card/95 px-4 py-2 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="text-xs font-mono text-foreground">
            {selectedEdges.length} Connection{selectedEdges.length > 1 ? "s" : ""} Selected
          </span>
          <button
            type="button"
            onClick={() => {
              selectedEdges.forEach((e) => handleUnlinkEdge(e.id));
            }}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 text-xs font-semibold shadow transition-all cursor-pointer"
            title="Delete / disconnect selected wires (Backspace/Delete)"
          >
            <Scissors className="h-3.5 w-3.5" />
            <span>Unlink Connection Wire{selectedEdges.length > 1 ? "s" : ""}</span>
          </button>
        </div>
      )}

      {/* Clean Slate Empty Backlot Notice */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
          <div className="flex flex-col items-center max-w-md text-center p-6 rounded-2xl border border-dashed border-border/80 bg-card/85 shadow-2xl backdrop-blur">
            <div className="h-10 w-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mb-3">
              <Plus className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Empty Scene Backlot</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This scene is completely empty. Click <strong className="text-foreground font-semibold">&ldquo;Add Blueprint Node&rdquo;</strong> in the top-left to spawn script, character, or camera nodes, or edit the screenplay below.
            </p>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={{ ...nodeTypes, ...extraNodeTypes }}
        edgeTypes={customEdgeTypes}
        connectionMode={ConnectionMode.Loose}
        edgesReconnectable={true}
        onReconnect={handleReconnect}
        onReconnectStart={handleReconnectStart}
        onReconnectEnd={handleReconnectEnd}
        onSelectionChange={handleSelectionChange}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Meta", "Control", "Shift"]}
        selectionMode={SelectionMode.Partial}
        panOnDrag={true}
        defaultEdgeOptions={{
          type: "deletable",
          style: { stroke: "var(--border)", strokeWidth: 1.8 },
          interactionWidth: 36,
        }}
        fitView
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.2}
          color="var(--border)"
        />
        <Controls
          showInteractive={false}
          className="!rounded-lg !border !border-border !bg-card !shadow-lg [&_button]:!border-border [&_button]:!bg-card [&_button]:!fill-foreground [&_button:hover]:!bg-secondary"
        />
        <MiniMap
          pannable
          zoomable
          className="!rounded-lg !border !border-border !bg-card"
          maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
          nodeColor="var(--muted)"
          nodeStrokeColor="var(--border)"
        />
        {children}
      </ReactFlow>

      {/* Edge / handle styling that React Flow doesn't expose as props */}
      <style>{`
        .story-canvas .react-flow__edge-path {
          stroke: var(--border);
        }
        .story-canvas .react-flow__edge.selected .react-flow__edge-path,
        .story-canvas .react-flow__edge:hover .react-flow__edge-path {
          stroke: var(--accent);
          stroke-width: 2.4px;
          filter: drop-shadow(0 0 4px color-mix(in oklch, var(--accent) 60%, transparent));
        }
        .story-canvas .react-flow__edge[data-handle-id="actor_ref"] .react-flow__edge-path {
          stroke: #10b981;
        }
        .story-canvas .react-flow__edge[data-handle-id="personality"] .react-flow__edge-path {
          stroke: #06b6d4;
        }
        .story-canvas .react-flow__edge[data-handle-id="quirks"] .react-flow__edge-path {
          stroke: #f43f5e;
        }
        .story-canvas .react-flow__edge[data-handle-id="style_ref"] .react-flow__edge-path {
          stroke: #a855f7;
        }
        .story-canvas .react-flow__edge.generating .react-flow__edge-path {
          stroke: var(--accent);
          stroke-dasharray: 4 3;
          animation: story-canvas-flow 0.6s linear infinite;
        }
        @keyframes story-canvas-flow {
          to { stroke-dashoffset: -7; }
        }
        .story-canvas .react-flow__attribution { display: none; }
      `}</style>
    </div>
  );
}

export { StoryCanvas };
