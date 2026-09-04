"use client";

import * as React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { SlateLabel } from "@/components/cinema/slate-label";
import { FilmstripLoader } from "@/components/cinema/filmstrip-loader";
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
  Flame,
  MessageSquare,
  Lock,
  Unlock,
  Play,
  RotateCcw,
} from "lucide-react";

export type NodeState = "idle" | "generating" | "ready" | "stale" | "error";

const STATE_BADGE: Record<NodeState, { label: string; className: string }> = {
  idle: { label: "Idle", className: "border-border text-muted-foreground" },
  generating: { label: "Generating", className: "border-accent/40 bg-accent/10 text-accent" },
  ready: { label: "Ready", className: "border-success/40 bg-success/15 text-success" },
  stale: { label: "Pending Sync", className: "border-warning/40 bg-warning/15 text-warning animate-pulse" },
  error: { label: "Error", className: "border-destructive/40 bg-destructive/15 text-destructive" },
};

const handleBaseClass =
  "!h-2.5 !w-2.5 !border-2 !border-background transition-transform hover:!scale-150";

/**
 * Shared themed shell for all nodes in the Unreal Engine Blueprint-style graph.
 */
function BlueprintNodeShell({
  kind,
  title,
  icon: Icon,
  state = "ready",
  selected,
  colorScheme = "default",
  headerRight,
  children,
}: {
  kind: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  state?: NodeState;
  selected?: boolean;
  colorScheme?: "default" | "purple" | "cyan" | "emerald" | "amber" | "rose" | "blue";
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const badge = STATE_BADGE[state];
  const borderColors = {
    default: selected ? "border-accent ring-2 ring-accent/30" : "border-border/80",
    purple: selected ? "border-purple-500 ring-2 ring-purple-500/30" : "border-purple-500/40",
    cyan: selected ? "border-cyan-500 ring-2 ring-cyan-500/30" : "border-cyan-500/40",
    emerald: selected ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-emerald-500/40",
    amber: selected ? "border-amber-500 ring-2 ring-amber-500/30" : "border-amber-500/40",
    rose: selected ? "border-rose-500 ring-2 ring-rose-500/30" : "border-rose-500/40",
    blue: selected ? "border-blue-500 ring-2 ring-blue-500/30" : "border-blue-500/40",
  };

  return (
    <div
      className={cn(
        "sprocket-edge film-grain w-80 rounded-xl border bg-card/95 py-3.5 text-sm shadow-xl backdrop-blur transition-all",
        borderColors[colorScheme]
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b border-border/40 px-3.5 pb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-secondary/80 text-foreground">
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <SlateLabel>{kind}</SlateLabel>
            <span className="font-heading text-xs font-semibold leading-tight text-foreground truncate max-w-[150px]">
              {title}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {headerRight}
          <Badge className={cn("text-[9px] py-0 px-1.5", badge.className)}>{badge.label}</Badge>
        </div>
      </div>

      {state === "generating" ? (
        <div className="px-3.5 pt-3">
          <FilmstripLoader frames={6} />
        </div>
      ) : (
        <div className="px-3.5 pt-2.5">{children}</div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 1. YouTube Clip / Reference Node
// -------------------------------------------------------------
export interface ClipNodeData extends Record<string, unknown> {
  title: string;
  url: string;
  timestampRange: string;
  lightingStyle: string;
  palette: string[];
  pacing: string;
}

export function ClipNode({ data, selected }: NodeProps & { data: ClipNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Clip Reference"
      title={data.title || "YouTube Cinematography"}
      icon={Video}
      colorScheme="purple"
      selected={selected}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span className="truncate max-w-[170px] text-accent/90">{data.url}</span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">{data.timestampRange}</span>
        </div>

        <div className="rounded border border-border/50 bg-background/60 p-2 text-xs">
          <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Extracted Aesthetic:</div>
          <p className="mt-0.5 text-[11px] leading-snug text-foreground/90">{data.lightingStyle}</p>
        </div>

        {data.palette && data.palette.length > 0 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground">Palette Swatches:</span>
            <div className="flex items-center gap-1">
              {data.palette.map((hex, i) => (
                <div
                  key={i}
                  className="h-3.5 w-3.5 rounded-full border border-border/60 shadow-sm"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>
        )}

        {/* Output Port */}
        <div className="relative mt-1 flex items-center justify-end pt-1 border-t border-border/30">
          <span className="text-[10px] font-mono text-purple-400 mr-2">style_ref →</span>
          <Handle
            type="source"
            position={Position.Right}
            id="style_ref"
            className={cn(handleBaseClass, "!bg-purple-500 -right-5")}
          />
        </div>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 2. Brainstorm Note / Voice Memo / Plot Seed Node
// -------------------------------------------------------------
export interface NoteNodeData extends Record<string, unknown> {
  noteType: "Voice Memo" | "Plot Seed" | "Dialogue Snippet" | "World Lore";
  content: string;
  audioDuration?: string;
}

export function NoteNode({ data, selected }: NodeProps & { data: NoteNodeData }) {
  return (
    <BlueprintNodeShell
      kind={data.noteType || "Idea Note"}
      title={data.noteType || "Brainstorm"}
      icon={FileText}
      colorScheme="amber"
      selected={selected}
    >
      <div className="flex flex-col gap-2">
        {data.audioDuration && (
          <div className="flex items-center gap-1.5 rounded bg-amber-500/10 px-2 py-1 text-[11px] text-amber-400 border border-amber-500/20">
            <Volume2 className="h-3 w-3 animate-pulse" />
            <span className="font-mono">Voice Memo ({data.audioDuration})</span>
          </div>
        )}
        <p className="rounded border border-border/50 bg-background/60 p-2 text-xs leading-relaxed text-foreground/90 line-clamp-3 italic">
          &ldquo;{data.content}&rdquo;
        </p>

        <div className="relative mt-1 flex items-center justify-end pt-1 border-t border-border/30">
          <span className="text-[10px] font-mono text-amber-400 mr-2">plot_seed →</span>
          <Handle
            type="source"
            position={Position.Right}
            id="plot_seed"
            className={cn(handleBaseClass, "!bg-amber-500 -right-5")}
          />
        </div>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 3. Actor Legacy / Dream Comp Node
// -------------------------------------------------------------
export interface ActorNodeData extends Record<string, unknown> {
  actorName: string;
  roleReference: string;
  vocalWeight: string;
  energyProfile: string;
}

export function ActorNode({ data, selected }: NodeProps & { data: ActorNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Actor Legacy Comp"
      title={data.actorName || "Dream Actor"}
      icon={User}
      colorScheme="emerald"
      selected={selected}
    >
      <div className="flex flex-col gap-2 text-xs">
        <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-2">
          <div className="text-[10px] font-mono uppercase text-emerald-400">Past Performance Baseline:</div>
          <p className="mt-0.5 text-[11px] font-medium text-foreground">{data.roleReference}</p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Vocal Delivery:</span>
          <span className="font-mono text-foreground font-medium">{data.vocalWeight}</span>
        </div>

        <div className="relative mt-1 flex items-center justify-end pt-1 border-t border-border/30">
          <span className="text-[10px] font-mono text-emerald-400 mr-2">actor_out →</span>
          <Handle
            type="source"
            position={Position.Right}
            id="actor_out"
            className={cn(handleBaseClass, "!bg-emerald-500 -right-5")}
          />
        </div>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 4. Personality Dial Node
// -------------------------------------------------------------
export interface PersonalityNodeData extends Record<string, unknown> {
  confidence: number;
  speed: number;
  subtext: number;
  presetName?: string;
  onTweak?: (dials: { confidence: number; speed: number; subtext: number }) => void;
}

export function PersonalityNode({ data, selected }: NodeProps & { data: PersonalityNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Personality Dials"
      title={data.presetName || "Character Dials"}
      icon={Sliders}
      colorScheme="cyan"
      selected={selected}
    >
      <div className="flex flex-col gap-2.5 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Confidence</span>
            <span className="text-cyan-400">{data.confidence ?? 60}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${data.confidence ?? 60}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Verbal Pacing (Staccato ↔ Manic)</span>
            <span className="text-cyan-400">{data.speed ?? 45}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${data.speed ?? 45}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Subtext & Sarcasm</span>
            <span className="text-cyan-400">{data.subtext ?? 75}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${data.subtext ?? 75}%` }}
            />
          </div>
        </div>

        <div className="relative mt-1 flex items-center justify-end pt-1 border-t border-border/30">
          <span className="text-[10px] font-mono text-cyan-400 mr-2">personality_out →</span>
          <Handle
            type="source"
            position={Position.Right}
            id="personality_out"
            className={cn(handleBaseClass, "!bg-cyan-500 -right-5")}
          />
        </div>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 5. Behavioral Quirks & Tics Node
// -------------------------------------------------------------
export interface QuirksNodeData extends Record<string, unknown> {
  tics: string[];
}

export function QuirksNode({ data, selected }: NodeProps & { data: QuirksNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Behavioral Quirks"
      title="Character Tics"
      icon={Sparkles}
      colorScheme="rose"
      selected={selected}
    >
      <div className="flex flex-col gap-1.5 text-xs">
        {data.tics?.map((tic, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded bg-rose-500/10 px-2 py-1 text-[11px] text-rose-300 border border-rose-500/20"
          >
            <span className="h-1 w-1 rounded-full bg-rose-400" />
            <span>{tic}</span>
          </div>
        ))}

        <div className="relative mt-1 flex items-center justify-end pt-1 border-t border-border/30">
          <span className="text-[10px] font-mono text-rose-400 mr-2">quirks_out →</span>
          <Handle
            type="source"
            position={Position.Right}
            id="quirks_out"
            className={cn(handleBaseClass, "!bg-rose-500 -right-5")}
          />
        </div>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 6. Modular Character Core Node (Anchor)
// -------------------------------------------------------------
export interface CharacterCoreNodeData extends Record<string, unknown> {
  name: string;
  archetype: string;
  objective: string;
  ttsVoice?: string;
  actorComp?: string;
  dialsSummary?: string;
  quirksSummary?: string;
  isStale?: boolean;
  onOpenHotSeat?: () => void;
  onTuneVoice?: () => void;
}

export function CharacterCoreNode({ data, selected }: NodeProps & { data: CharacterCoreNodeData }) {
  return (
    <div
      className={cn(
        "sprocket-edge film-grain relative w-84 rounded-xl border bg-card/95 p-3.5 text-sm shadow-xl backdrop-blur transition-all",
        data.isStale
          ? "border-warning/60 ring-2 ring-warning/30"
          : selected
          ? "border-accent ring-2 ring-accent/30"
          : "border-border/80"
      )}
    >
      {/* Target Input Ports on Left */}
      <div className="absolute -left-3 top-7 flex flex-col gap-5 z-20">
        <div className="relative group">
          <Handle
            type="target"
            position={Position.Left}
            id="actor_ref"
            className={cn(handleBaseClass, "!bg-emerald-500")}
          />
          <span className="absolute left-4 top-0 hidden rounded bg-popover px-1.5 py-0.5 text-[9px] font-mono text-emerald-400 group-hover:block whitespace-nowrap shadow">
            actor_ref
          </span>
        </div>
        <div className="relative group">
          <Handle
            type="target"
            position={Position.Left}
            id="personality"
            className={cn(handleBaseClass, "!bg-cyan-500")}
          />
          <span className="absolute left-4 top-0 hidden rounded bg-popover px-1.5 py-0.5 text-[9px] font-mono text-cyan-400 group-hover:block whitespace-nowrap shadow">
            personality
          </span>
        </div>
        <div className="relative group">
          <Handle
            type="target"
            position={Position.Left}
            id="quirks"
            className={cn(handleBaseClass, "!bg-rose-500")}
          />
          <span className="absolute left-4 top-0 hidden rounded bg-popover px-1.5 py-0.5 text-[9px] font-mono text-rose-400 group-hover:block whitespace-nowrap shadow">
            quirks
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/20 border border-accent/40 font-heading text-sm font-bold text-accent">
            {data.name?.slice(0, 2).toUpperCase() || "CH"}
          </div>
          <div>
            <SlateLabel>Character Core</SlateLabel>
            <h3 className="font-heading text-sm font-bold text-foreground leading-tight">{data.name}</h3>
          </div>
        </div>
        <Badge
          className={cn(
            "text-[9px]",
            data.isStale
              ? "border-warning/40 bg-warning/15 text-warning animate-pulse"
              : "border-success/40 bg-success/15 text-success"
          )}
        >
          {data.isStale ? "Pending Sync" : "Bound"}
        </Badge>
      </div>

      {/* Body Details */}
      <div className="mt-2.5 flex flex-col gap-2 text-xs">
        <p className="text-[11px] text-muted-foreground leading-snug">{data.archetype}</p>

        <div className="rounded border border-border/50 bg-background/50 p-2 text-[11px]">
          <span className="font-mono text-[9px] uppercase text-muted-foreground block">Active Objective:</span>
          <span className="text-foreground/90 font-medium">{data.objective || "Survive and secure assets"}</span>
        </div>

        {/* Connected modules indicators */}
        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
          <div className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 border border-emerald-500/20 truncate">
            Actor: {data.actorComp || "Unbound"}
          </div>
          <div className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-cyan-400 border border-cyan-500/20 truncate">
            Dials: {data.dialsSummary || "Default"}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-1 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onOpenHotSeat?.();
            }}
            className="flex-1 flex items-center justify-center gap-1 rounded bg-accent/15 hover:bg-accent/25 text-accent py-1 text-[10px] font-medium transition-colors"
          >
            <MessageSquare className="h-3 w-3" />
            Hot Seat Chat
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onTuneVoice?.();
            }}
            className="flex items-center justify-center gap-1 rounded bg-secondary hover:bg-secondary/80 text-foreground px-2 py-1 text-[10px] transition-colors"
            title="Tune Dialogue Cadence"
          >
            <Sliders className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Output Port on Right */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 group">
        <Handle
          type="source"
          position={Position.Right}
          id="character_out"
          className={cn(handleBaseClass, "!bg-accent")}
        />
        <span className="absolute right-4 top-0 hidden rounded bg-popover px-1.5 py-0.5 text-[9px] font-mono text-accent group-hover:block whitespace-nowrap shadow">
          character_out
        </span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. Dream Casting Chemistry Bench Node
// -------------------------------------------------------------
export interface ChemistryNodeData extends Record<string, unknown> {
  scenario: string;
  lastGeneratedScene?: string;
  onRunChemistry?: () => void;
}

export function ChemistryNode({ data, selected }: NodeProps & { data: ChemistryNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Casting Bench"
      title="Chemistry Sandbox"
      icon={Users2}
      colorScheme="rose"
      selected={selected}
    >
      <div className="relative flex flex-col gap-2 text-xs">
        {/* Target Ports for Char A and Char B */}
        <div className="absolute -left-6 top-2 flex flex-col gap-4">
          <Handle
            type="target"
            position={Position.Left}
            id="char_a"
            className={cn(handleBaseClass, "!bg-blue-400")}
          />
          <Handle
            type="target"
            position={Position.Left}
            id="char_b"
            className={cn(handleBaseClass, "!bg-purple-400")}
          />
        </div>

        <div className="rounded border border-border/50 bg-background/60 p-2">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Friction Scenario:</div>
          <p className="mt-0.5 text-[11px] italic text-foreground">{data.scenario}</p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data.onRunChemistry?.();
          }}
          className="flex items-center justify-center gap-1.5 w-full rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 py-1.5 text-xs font-semibold transition-colors border border-rose-500/30"
        >
          <Flame className="h-3.5 w-3.5" />
          Test 1-Page Dynamic Friction
        </button>

        {/* Output Port */}
        <div className="relative mt-1 flex items-center justify-end pt-1 border-t border-border/30">
          <span className="text-[10px] font-mono text-rose-400 mr-2">friction_scene →</span>
          <Handle
            type="source"
            position={Position.Right}
            id="scene_out"
            className={cn(handleBaseClass, "!bg-rose-500 -right-5")}
          />
        </div>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 8. Scene Node
// -------------------------------------------------------------
export interface SceneNodeData extends Record<string, unknown> {
  title: string;
  slugline: string;
  stakes: string;
  state: NodeState;
  characterCount?: number;
  hasStyleRef?: boolean;
  onGenerateDraft?: () => void;
  onViewScript?: () => void;
}

export function SceneNode({ data, selected }: NodeProps & { data: SceneNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Scene Master"
      title={data.title || "Scene Master"}
      icon={Clapperboard}
      colorScheme="default"
      state={data.state}
      selected={selected}
    >
      <div className="relative flex flex-col gap-2 text-xs">
        {/* Input Ports for Characters, Style Ref, Plot Seed */}
        <div className="absolute -left-6 top-2 flex flex-col gap-4">
          <Handle
            type="target"
            position={Position.Left}
            id="character_in"
            className={cn(handleBaseClass, "!bg-accent")}
          />
          <Handle
            type="target"
            position={Position.Left}
            id="style_ref"
            className={cn(handleBaseClass, "!bg-purple-500")}
          />
          <Handle
            type="target"
            position={Position.Left}
            id="plot_seed"
            className={cn(handleBaseClass, "!bg-amber-500")}
          />
        </div>

        <div className="font-mono text-[11px] font-bold text-accent tracking-wide uppercase">
          {data.slugline || "INT. SCENE LOCATION - TIME"}
        </div>

        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
          {data.stakes || "Dramatic conflict and objectives"}
        </p>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
          <span>{data.characterCount ?? 2} Cast Members Wired</span>
          {data.hasStyleRef && <span className="text-purple-400 font-mono">Style Sync ✓</span>}
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onGenerateDraft?.();
            }}
            className="flex-1 rounded bg-accent text-accent-foreground hover:bg-accent/90 py-1 text-[11px] font-semibold transition-colors text-center"
          >
            Generate Screenplay Draft
          </button>
        </div>

        {/* Output Port */}
        <div className="relative mt-1 flex items-center justify-end pt-1 border-t border-border/30">
          <span className="text-[10px] font-mono text-accent mr-2">scene_out →</span>
          <Handle
            type="source"
            position={Position.Right}
            id="scene_out"
            className={cn(handleBaseClass, "!bg-accent -right-5")}
          />
        </div>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 9. Screenplay Script Node
// -------------------------------------------------------------
export interface ScriptNodeData extends Record<string, unknown> {
  title: string;
  previewText: string;
  wordCount: number;
  isLocked?: boolean;
  onViewScript?: () => void;
  onToggleLock?: () => void;
}

export function ScriptNode({ data, selected }: NodeProps & { data: ScriptNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Screenplay Draft"
      title={data.title || "Hollywood Script"}
      icon={FileText}
      colorScheme="default"
      selected={selected}
      headerRight={
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data.onToggleLock?.();
          }}
          className="text-muted-foreground hover:text-foreground"
          title={data.isLocked ? "Lines Locked" : "Lines Unlocked"}
        >
          {data.isLocked ? <Lock className="h-3.5 w-3.5 text-accent" /> : <Unlock className="h-3.5 w-3.5" />}
        </button>
      }
    >
      <div className="relative flex flex-col gap-2 text-xs">
        <Handle
          type="target"
          position={Position.Left}
          id="script_in"
          className={cn(handleBaseClass, "!bg-accent -left-5")}
        />

        <div className="rounded border border-border/60 bg-background/80 p-2 font-mono text-[10px] leading-relaxed text-foreground/90 max-h-24 overflow-hidden line-clamp-4">
          {data.previewText}
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{data.wordCount || 420} words</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onViewScript?.();
            }}
            className="text-accent hover:underline font-medium"
          >
            Open Screenplay Reader →
          </button>
        </div>

        {/* Output Port */}
        <div className="relative mt-1 flex items-center justify-end pt-1 border-t border-border/30">
          <span className="text-[10px] font-mono text-accent mr-2">script_out →</span>
          <Handle
            type="source"
            position={Position.Right}
            id="script_out"
            className={cn(handleBaseClass, "!bg-accent -right-5")}
          />
        </div>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 10. Storyboard Node (Imagen 3)
// -------------------------------------------------------------
export interface StoryboardNodeData extends Record<string, unknown> {
  prompt: string;
  shotType?: string;
  lighting?: string;
}

export function StoryboardNode({ data, selected }: NodeProps & { data: StoryboardNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Visual Concept"
      title="Imagen 3 Storyboard"
      icon={ImageIcon}
      colorScheme="purple"
      selected={selected}
    >
      <div className="relative flex flex-col gap-1.5 text-xs">
        <Handle
          type="target"
          position={Position.Left}
          id="script_in"
          className={cn(handleBaseClass, "!bg-purple-500 -left-5")}
        />

        <div className="letterbox relative mt-1 w-full overflow-hidden rounded border border-border/70 bg-gradient-to-br from-secondary/80 via-card to-background flex items-center justify-center p-3 text-center">
          <div className="z-10 flex flex-col gap-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-accent">
              {data.shotType || "2.39:1 Anamorphic Scope"}
            </span>
            <p className="text-[11px] leading-snug text-foreground/90 line-clamp-2 italic">
              &ldquo;{data.prompt}&rdquo;
            </p>
          </div>
        </div>

        {data.lighting && (
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
            <span>Atmosphere: {data.lighting}</span>
            <span className="font-mono text-accent font-medium">Imagen 3</span>
          </div>
        )}
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 11. Director Floor Plan Node
// -------------------------------------------------------------
export interface FloorPlanNodeData extends Record<string, unknown> {
  sceneTitle: string;
  cameraCount?: number;
  onOpenDeck?: () => void;
}

export function FloorPlanNode({ data, selected }: NodeProps & { data: FloorPlanNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Camera Blocking"
      title="2D Floor Plan"
      icon={Compass}
      colorScheme="blue"
      selected={selected}
    >
      <div className="relative flex flex-col gap-1.5 text-xs">
        <Handle
          type="target"
          position={Position.Left}
          id="script_in"
          className={cn(handleBaseClass, "!bg-blue-500 -left-5")}
        />

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{data.sceneTitle}</span>
          <span className="text-accent font-semibold">{data.cameraCount || 3} Cams · Scope</span>
        </div>

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

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data.onOpenDeck?.();
          }}
          className="w-full mt-1 py-1 rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 text-[10px] font-medium transition-colors text-center border border-blue-500/30"
        >
          Open Director Blocking Deck →
        </button>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 12. Tension Curve Node
// -------------------------------------------------------------
export interface TensionCurveNodeData extends Record<string, unknown> {
  peakTension: number;
  hasWarning?: boolean;
  onOpenDeck?: () => void;
}

export function TensionCurveNode({ data, selected }: NodeProps & { data: TensionCurveNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Audience EKG"
      title="Pacing & Tension Curve"
      icon={Activity}
      colorScheme="rose"
      selected={selected}
    >
      <div className="relative flex flex-col gap-1.5 text-xs">
        <Handle
          type="target"
          position={Position.Left}
          id="script_in"
          className={cn(handleBaseClass, "!bg-rose-500 -left-5")}
        />

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Dynamic Stakes vs Relief</span>
          <span className="font-mono text-rose-400 font-bold">Peak: {data.peakTension || 92}%</span>
        </div>

        {/* Mini SVG Tension Graph */}
        <div className="w-full h-12 bg-secondary/30 rounded border border-border/50 relative overflow-hidden flex items-center justify-center p-1">
          <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path
              d="M 0,25 Q 25,18 45,22 T 75,5 T 100,12"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
            />
            <circle cx="75" cy="5" r="2.5" fill="#f43f5e" />
          </svg>
        </div>

        {data.hasWarning && (
          <div className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            ⚠ Tension plateau detected in Act 2
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data.onOpenDeck?.();
          }}
          className="w-full mt-1 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[10px] font-medium transition-colors text-center border border-rose-500/30"
        >
          View Full 3-Act Curve →
        </button>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 13. Audio Table Read Node
// -------------------------------------------------------------
export interface TableReadNodeData extends Record<string, unknown> {
  voiceCount: number;
  duration?: string;
  onOpenPlayer?: () => void;
}

export function TableReadNode({ data, selected }: NodeProps & { data: TableReadNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Speech Studio"
      title="Gemini TTS Table Read"
      icon={Volume2}
      colorScheme="cyan"
      selected={selected}
    >
      <div className="relative flex flex-col gap-2 text-xs">
        <Handle
          type="target"
          position={Position.Left}
          id="script_in"
          className={cn(handleBaseClass, "!bg-cyan-500 -left-5")}
        />

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Multi-Character Voice Synthesizer</span>
          <span className="font-mono text-cyan-400">{data.voiceCount || 3} Voices</span>
        </div>

        {/* Audio Visualizer Wave */}
        <div className="flex items-center justify-center gap-1 h-8 rounded bg-background/60 border border-border/40 px-2">
          {[40, 70, 30, 90, 60, 80, 45, 95, 65, 35, 75, 50].map((h, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-cyan-400/70 animate-pulse"
              style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data.onOpenPlayer?.();
          }}
          className="flex items-center justify-center gap-1.5 w-full rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 py-1 text-[11px] font-semibold transition-colors border border-cyan-500/30"
        >
          <Play className="h-3 w-3 fill-current" />
          Play Multi-Speaker Table Read
        </button>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// 14. Global Territory Viability Node (ClickHouse)
// -------------------------------------------------------------
export interface MarketNodeData extends Record<string, unknown> {
  globalScore: number;
  topTerritory: string;
  onOpenHeatmap?: () => void;
}

export function MarketNode({ data, selected }: NodeProps & { data: MarketNodeData }) {
  return (
    <BlueprintNodeShell
      kind="Distribution Intel"
      title="ClickHouse Territory Map"
      icon={Globe2}
      colorScheme="emerald"
      selected={selected}
    >
      <div className="relative flex flex-col gap-1.5 text-xs">
        <Handle
          type="target"
          position={Position.Left}
          id="script_in"
          className={cn(handleBaseClass, "!bg-emerald-500 -left-5")}
        />

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Historical Box Office Comps</span>
          <span className="font-mono text-emerald-400 font-bold">Global: {data.globalScore || 79}%</span>
        </div>

        <div className="rounded border border-emerald-500/20 bg-emerald-500/10 p-2 text-[11px]">
          <div className="text-[9px] font-mono uppercase text-emerald-400">Prime Market Fit:</div>
          <p className="mt-0.5 text-foreground font-medium">{data.topTerritory || "North America (86%) & South Korea (83%)"}</p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data.onOpenHeatmap?.();
          }}
          className="w-full mt-1 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[10px] font-medium transition-colors text-center border border-emerald-500/30"
        >
          Inspect World Choropleth Map →
        </button>
      </div>
    </BlueprintNodeShell>
  );
}

// -------------------------------------------------------------
// React Flow NodeTypes Registry
// -------------------------------------------------------------
export const nodeTypes = {
  clip: ClipNode,
  note: NoteNode,
  actor: ActorNode,
  personality: PersonalityNode,
  quirks: QuirksNode,
  characterCore: CharacterCoreNode,
  chemistry: ChemistryNode,
  scene: SceneNode,
  script: ScriptNode,
  storyboard: StoryboardNode,
  floorplan: FloorPlanNode,
  tensionCurve: TensionCurveNode,
  tableRead: TableReadNode,
  market: MarketNode,
};
