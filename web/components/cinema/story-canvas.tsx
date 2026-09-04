"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "@/components/cinema/graph-nodes";
import { Button } from "@/components/ui/button";
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
  Layers,
  Sparkle,
} from "lucide-react";

export interface StoryCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: React.ComponentProps<typeof ReactFlow>["onNodesChange"];
  onEdgesChange?: React.ComponentProps<typeof ReactFlow>["onEdgesChange"];
  onConnect?: React.ComponentProps<typeof ReactFlow>["onConnect"];
  onNodeClick?: React.ComponentProps<typeof ReactFlow>["onNodeClick"];
  onAddNode?: (type: string) => void;
  extraNodeTypes?: NodeTypes;
  children?: React.ReactNode;
}

function StoryCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onAddNode,
  extraNodeTypes,
  children,
}: StoryCanvasProps) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  return (
    <div className="story-canvas relative h-full w-full overflow-hidden rounded-xl border border-border">
      {/* Floating Unreal-style Blueprint Node Spawner */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/90 p-1.5 shadow-2xl backdrop-blur">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPaletteOpen(!paletteOpen)}
          className="h-8 gap-1.5 border-accent/40 bg-accent/10 text-xs font-semibold text-accent hover:bg-accent/20"
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
              {/* Category 1: Inspiration & Scrapbook */}
              <div className="flex flex-col gap-1 rounded-lg border border-purple-500/20 bg-purple-500/5 p-2">
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">1. Ingestion</span>
                <button
                  type="button"
                  onClick={() => {
                    onAddNode?.("clip");
                    setPaletteOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-purple-500/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-purple-500/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-cyan-500/20 text-foreground font-semibold transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-cyan-500/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-cyan-500/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-cyan-500/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-accent/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-accent/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-accent/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-emerald-500/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-emerald-500/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-emerald-500/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-emerald-500/20 text-foreground transition-colors"
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
                  className="flex items-center gap-1.5 rounded p-1 text-[11px] text-left hover:bg-emerald-500/20 text-foreground transition-colors"
                >
                  <Globe2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>ClickHouse Map</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={{ ...nodeTypes, ...extraNodeTypes }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "var(--border)", strokeWidth: 1.8 },
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
          stroke-width: 2.2px;
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
