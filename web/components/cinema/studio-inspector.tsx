"use client";

import * as React from "react";
import type { Node } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
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
  MessageSquare,
  Lock,
  Unlock,
  Layers,
  ChevronRight,
  Flame,
  X,
  ExternalLink,
} from "lucide-react";

export interface StudioInspectorProps {
  selectedNode: Node | null;
  nodes: Node[];
  onSelectNode: (nodeId: string) => void;
  onUpdateNodeData?: (nodeId: string, newData: Record<string, unknown>) => void;
  onOpenHotSeat?: (charName: string) => void;
  onOpenScriptReader?: () => void;
  onOpenDeck?: (subTab: "blocking" | "tension" | "territory" | "stripboard") => void;
  onOpenTableRead?: () => void;
  onClose?: () => void;
  className?: string;
}

export function StudioInspector({
  selectedNode,
  nodes,
  onSelectNode,
  onUpdateNodeData,
  onOpenHotSeat,
  onOpenScriptReader,
  onOpenDeck,
  onOpenTableRead,
  onClose,
  className,
}: StudioInspectorProps) {
  const [activeTab, setActiveTab] = React.useState<"inspector" | "outliner">("inspector");

  const nodeData = (selectedNode?.data || {}) as Record<string, any>;

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-l border-border bg-card/95 backdrop-blur overflow-hidden select-none",
        className
      )}
    >
      {/* Top Header & Tab Strip */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-3 bg-secondary/30">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("inspector")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeTab === "inspector"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Sliders className="h-3 w-3" />
            <span>Inspector</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("outliner")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeTab === "outliner"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Outliner ({nodes.length})</span>
          </button>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            title="Collapse Sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tab 1: Parameter Inspector */}
      {activeTab === "inspector" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {selectedNode ? (
            <div className="flex flex-col gap-4">
              {/* Selected Node Summary */}
              <div className="flex items-start justify-between border-b border-border/50 pb-3">
                <div className="flex flex-col gap-0.5">
                  <SlateLabel>{selectedNode.type?.toUpperCase()} NODE</SlateLabel>
                  <h3 className="font-heading text-base font-bold text-foreground leading-tight">
                    {nodeData.title || nodeData.name || selectedNode.id}
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {selectedNode.type}
                </Badge>
              </div>

              {/* Character Core Controls */}
              {selectedNode.type === "characterCore" && (
                <div className="flex flex-col gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Character Name
                    </label>
                    <input
                      type="text"
                      value={nodeData.name || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { name: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Archetype & Psychology
                    </label>
                    <textarea
                      rows={2}
                      value={nodeData.archetype || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { archetype: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground leading-snug"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Dramatic Objective
                    </label>
                    <textarea
                      rows={2}
                      value={nodeData.objective || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { objective: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground leading-snug"
                    />
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => onOpenHotSeat?.(nodeData.name || "Marcus")}
                      className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Interrogate in Hot Seat</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Personality Dials Controls */}
              {selectedNode.type === "personality" && (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span>Confidence</span>
                      <span className="text-cyan-400 font-bold">{nodeData.confidence ?? 60}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={nodeData.confidence ?? 60}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, {
                          confidence: Number(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span>Verbal Pacing (Staccato ↔ Manic)</span>
                      <span className="text-cyan-400 font-bold">{nodeData.speed ?? 45}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={nodeData.speed ?? 45}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, {
                          speed: Number(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span>Subtext & Sarcasm Level</span>
                      <span className="text-cyan-400 font-bold">{nodeData.subtext ?? 75}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={nodeData.subtext ?? 75}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, {
                          subtext: Number(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1.5">
                      Archetype DNA Presets:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: "Rust Cohle + Zuckerberg", conf: 45, spd: 80, sub: 70 },
                        { name: "70% Landa + 30% Kendall", conf: 95, spd: 30, sub: 95 },
                        { name: "Charming Con-Artist", conf: 85, spd: 65, sub: 80 },
                        { name: "Hyper-Literal Soldier", conf: 90, spd: 40, sub: 10 },
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            onUpdateNodeData?.(selectedNode.id, {
                              presetName: preset.name,
                              confidence: preset.conf,
                              speed: preset.spd,
                              subtext: preset.sub,
                            })
                          }
                          className="rounded bg-secondary/80 hover:bg-secondary px-2 py-1 text-[10px] font-mono text-foreground transition-colors border border-border"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actor Comp Controls */}
              {selectedNode.type === "actor" && (
                <div className="flex flex-col gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Dream Actor Likeness
                    </label>
                    <input
                      type="text"
                      value={nodeData.actorName || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { actorName: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Iconic Role Reference
                    </label>
                    <input
                      type="text"
                      value={nodeData.roleReference || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { roleReference: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Vocal Weight & Delivery
                    </label>
                    <input
                      type="text"
                      value={nodeData.vocalWeight || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { vocalWeight: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                    />
                  </div>
                </div>
              )}

              {/* YouTube Clip Controls */}
              {selectedNode.type === "clip" && (
                <div className="flex flex-col gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      YouTube URL
                    </label>
                    <input
                      type="text"
                      value={nodeData.url || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { url: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Timestamp Markers (In - Out)
                    </label>
                    <input
                      type="text"
                      value={nodeData.timestampRange || "02:14 - 03:45"}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { timestampRange: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Extracted Lighting & Tone
                    </label>
                    <textarea
                      rows={2}
                      value={nodeData.lightingStyle || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { lightingStyle: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground leading-snug"
                    />
                  </div>
                </div>
              )}

              {/* Screenplay & Scene Controls */}
              {(selectedNode.type === "scene" || selectedNode.type === "script") && (
                <div className="flex flex-col gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Scene Slugline
                    </label>
                    <input
                      type="text"
                      value={nodeData.slugline || "INT. SCENE LOCATION - TIME"}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { slugline: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground font-mono font-bold"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={onOpenScriptReader}
                      className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Open Full Screenplay Reader</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Production Module Shortcuts */}
              {selectedNode.type === "floorplan" && (
                <Button
                  size="sm"
                  onClick={() => onOpenDeck?.("blocking")}
                  className="gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 w-full"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Open 2D Camera Blocking Deck</span>
                </Button>
              )}

              {selectedNode.type === "tensionCurve" && (
                <Button
                  size="sm"
                  onClick={() => onOpenDeck?.("tension")}
                  className="gap-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 w-full"
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Inspect 3-Act Tension Beats</span>
                </Button>
              )}

              {selectedNode.type === "tableRead" && (
                <Button
                  size="sm"
                  onClick={onOpenTableRead}
                  className="gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 w-full"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Launch Audio Table Read</span>
                </Button>
              )}

              {selectedNode.type === "market" && (
                <Button
                  size="sm"
                  onClick={() => onOpenDeck?.("territory")}
                  className="gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 w-full"
                >
                  <Globe2 className="h-3.5 w-3.5" />
                  <span>Open ClickHouse Territory Map</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-muted-foreground gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/80 border border-border flex items-center justify-center text-accent">
                <Sliders className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading text-sm font-semibold text-foreground">
                  No Blueprint Node Selected
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                  Click on any node in the canvas or outliner to inspect and tune its live parameters.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Canvas Outliner & Hierarchy */}
      {activeTab === "outliner" && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider px-1">
            Canvas Node Hierarchy
          </div>

          <div className="flex flex-col gap-1">
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const data = (node.data || {}) as Record<string, any>;
              const label = data.title || data.name || node.id;

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelectNode(node.id)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs transition-all text-left",
                    isSelected
                      ? "bg-accent/20 border border-accent/50 text-foreground font-semibold"
                      : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="h-2 w-2 rounded-full bg-accent/80 shrink-0" />
                    <span className="truncate">{label}</span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase shrink-0">
                    {node.type}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto border-t border-border/50 pt-3 px-1 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
            <span>Total: {nodes.length} nodes</span>
            <span className="text-emerald-400">ClickHouse Active</span>
          </div>
        </div>
      )}
    </aside>
  );
}
