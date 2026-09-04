"use client";

import * as React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { SlateLabel } from "@/components/cinema/slate-label";
import { FilmstripLoader } from "@/components/cinema/filmstrip-loader";
import { Badge } from "@/components/ui/badge";

export type NodeState = "idle" | "generating" | "ready" | "stale" | "error";

const STATE_BADGE: Record<NodeState, { label: string; className: string }> = {
  idle: { label: "Idle", className: "border-border text-muted-foreground" },
  generating: { label: "Generating", className: "border-accent/40 bg-accent/10 text-accent" },
  ready: { label: "Ready", className: "border-success/40 bg-success/15 text-success" },
  stale: { label: "Stale", className: "border-warning/40 bg-warning/15 text-warning" },
  error: { label: "Error", className: "border-destructive/40 bg-destructive/15 text-destructive" },
};

const handleClassName =
  "!h-2.5 !w-2.5 !border-2 !border-background !bg-accent transition-transform hover:!scale-125";

/**
 * Shared chrome for every custom node type: sprocket-edge FilmCard body,
 * slate-label eyebrow, a state badge, and themed connection handles. React
 * Flow's default node is a plain white-bordered box — this is what makes
 * the canvas itself read as production tooling rather than a generic
 * flowchart app.
 */
function NodeShell({
  kind,
  title,
  state = "idle",
  selected,
  showTargetHandle = true,
  showSourceHandle = true,
  children,
}: {
  kind: string;
  title: string;
  state?: NodeState;
  selected?: boolean;
  showTargetHandle?: boolean;
  showSourceHandle?: boolean;
  children?: React.ReactNode;
}) {
  const badge = STATE_BADGE[state];
  return (
    <div
      className={cn(
        "sprocket-edge film-grain w-72 rounded-xl border bg-card py-4 text-sm shadow-lg transition-shadow",
        selected ? "border-accent ring-2 ring-accent/30" : "border-border"
      )}
    >
      {showTargetHandle && (
        <Handle type="target" position={Position.Left} className={handleClassName} />
      )}

      <div className="flex items-start justify-between gap-2 px-4 pb-2">
        <div className="flex flex-col gap-0.5">
          <SlateLabel>{kind}</SlateLabel>
          <span className="font-heading text-sm font-medium leading-snug">{title}</span>
        </div>
        <Badge className={cn("shrink-0 text-[10px]", badge.className)}>{badge.label}</Badge>
      </div>

      {state === "generating" ? (
        <div className="px-4 pt-1">
          <FilmstripLoader frames={6} />
        </div>
      ) : (
        children && <div className="px-4 pt-1">{children}</div>
      )}

      {showSourceHandle && (
        <Handle type="source" position={Position.Right} className={handleClassName} />
      )}
    </div>
  );
}

export interface SceneNodeData extends Record<string, unknown> {
  title: string;
  state: NodeState;
  summary?: string;
  characterCount?: number;
  onViewScript?: () => void;
}

function SceneNode({ data, selected }: NodeProps & { data: SceneNodeData }) {
  return (
    <NodeShell kind="Scene" title={data.title} state={data.state} selected={selected}>
      {data.summary && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{data.summary}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        {typeof data.characterCount === "number" && (
          <span className="text-[11px] text-muted-foreground">
            {data.characterCount} character{data.characterCount === 1 ? "" : "s"} sharded
          </span>
        )}
        {data.onViewScript && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onViewScript?.();
            }}
            className="rounded px-1.5 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/10 transition-colors"
          >
            Read Script →
          </button>
        )}
      </div>
    </NodeShell>
  );
}

export interface CharacterNodeData extends Record<string, unknown> {
  name: string;
  state: NodeState;
  archetype?: string;
  isSelected?: boolean;
}

function CharacterNode({ data, selected }: NodeProps & { data: CharacterNodeData }) {
  const isTarget = data.isSelected || selected;
  return (
    <NodeShell
      kind="Character"
      title={data.name}
      state={data.state}
      selected={isTarget}
    >
      {data.archetype && (
        <p className="text-xs text-muted-foreground">{data.archetype}</p>
      )}
      {data.isSelected && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-accent font-medium">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Live in Hot Seat
        </div>
      )}
    </NodeShell>
  );
}

export interface InspirationNodeData extends Record<string, unknown> {
  title: string;
  state: NodeState;
}

function InspirationNode({ data, selected }: NodeProps & { data: InspirationNodeData }) {
  return (
    <NodeShell
      kind="Inspiration"
      title={data.title}
      state={data.state}
      selected={selected}
      showTargetHandle={false}
    />
  );
}

export interface StoryboardNodeData extends Record<string, unknown> {
  prompt: string;
  shotType?: string;
  lighting?: string;
}

function StoryboardNode({ data, selected }: NodeProps & { data: StoryboardNodeData }) {
  return (
    <NodeShell kind="Storyboard" title="Cinematic Frame" state="ready" selected={selected}>
      <div className="letterbox relative mt-1 w-full overflow-hidden rounded border border-border/70 bg-gradient-to-br from-secondary/80 via-card to-background flex items-center justify-center p-3 text-center">
        <div className="z-10 flex flex-col gap-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-accent">
            {data.shotType || "2.39:1 Anamorphic Master"}
          </span>
          <p className="text-[11px] leading-snug text-foreground/90 line-clamp-2 italic">
            &ldquo;{data.prompt}&rdquo;
          </p>
        </div>
      </div>
      {data.lighting && (
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Atmosphere: {data.lighting}</span>
          <span className="font-mono text-accent font-medium">Imagen 3</span>
        </div>
      )}
    </NodeShell>
  );
}

export interface FloorPlanNodeData extends Record<string, unknown> {
  sceneTitle: string;
  cameraCount?: number;
  onOpenDeck?: () => void;
}

function FloorPlanNode({ data, selected }: NodeProps & { data: FloorPlanNodeData }) {
  return (
    <NodeShell kind="Blocking" title="2D Floor Plan" state="ready" selected={selected}>
      <div className="relative mt-1 w-full rounded border border-border/70 bg-background/90 p-2.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-mono text-muted-foreground">{data.sceneTitle}</span>
          <span className="text-accent font-semibold">{data.cameraCount || 3} Cams · Scope</span>
        </div>
        {/* Mini 2D SVG preview */}
        <div className="w-full h-12 bg-secondary/30 rounded border border-border/50 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 40">
            <rect x="5" y="5" width="90" height="30" fill="none" stroke="var(--border)" strokeWidth="1" />
            <circle cx="35" cy="20" r="3" fill="var(--accent)" />
            <circle cx="65" cy="18" r="3" fill="#10b981" />
            <line x1="20" y1="32" x2="35" y2="20" stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="20" cy="32" r="2" fill="var(--secondary)" stroke="var(--accent)" />
            <line x1="75" y1="12" x2="65" y2="18" stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="75" cy="12" r="2" fill="var(--secondary)" stroke="var(--accent)" />
          </svg>
        </div>
        {data.onOpenDeck && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onOpenDeck?.();
            }}
            className="w-full mt-1 py-1 rounded bg-secondary/50 hover:bg-accent/15 text-accent text-[10px] font-medium transition-colors text-center"
          >
            Open Director Blocking Deck →
          </button>
        )}
      </div>
    </NodeShell>
  );
}

export const nodeTypes = {
  scene: SceneNode,
  character: CharacterNode,
  inspiration: InspirationNode,
  storyboard: StoryboardNode,
  floorplan: FloorPlanNode,
};

export { SceneNode, CharacterNode, InspirationNode, StoryboardNode, FloorPlanNode, NodeShell };
