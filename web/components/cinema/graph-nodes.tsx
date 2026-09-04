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
}

function SceneNode({ data, selected }: NodeProps & { data: SceneNodeData }) {
  return (
    <NodeShell kind="Scene" title={data.title} state={data.state} selected={selected}>
      {data.summary && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{data.summary}</p>
      )}
      {typeof data.characterCount === "number" && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {data.characterCount} character{data.characterCount === 1 ? "" : "s"} sharded
        </p>
      )}
    </NodeShell>
  );
}

export interface CharacterNodeData extends Record<string, unknown> {
  name: string;
  state: NodeState;
  archetype?: string;
}

function CharacterNode({ data, selected }: NodeProps & { data: CharacterNodeData }) {
  return (
    <NodeShell kind="Character" title={data.name} state={data.state} selected={selected}>
      {data.archetype && (
        <p className="text-xs text-muted-foreground">{data.archetype}</p>
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

export const nodeTypes = {
  scene: SceneNode,
  character: CharacterNode,
  inspiration: InspirationNode,
};

export { SceneNode, CharacterNode, InspirationNode, NodeShell };
