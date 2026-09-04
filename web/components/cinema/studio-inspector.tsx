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
  RefreshCw,
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

  const [isSynthesizing, setIsSynthesizing] = React.useState(false);
  const [isExtractingStyle, setIsExtractingStyle] = React.useState(false);
  const [sampleLine, setSampleLine] = React.useState("Step away from the control console.");
  const [isTuningDialogue, setIsTuningDialogue] = React.useState(false);
  const [tunedDialogueResult, setTunedDialogueResult] = React.useState<string | null>(null);
  const [newTic, setNewTic] = React.useState("");

  const handleTuneDialogue = async () => {
    if (isTuningDialogue || !sampleLine) return;
    setIsTuningDialogue(true);
    setTunedDialogueResult(null);
    try {
      const res = await fetch("/api/character/tune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character_name: nodeData.name || "Character",
          speech_style:
            (nodeData.speed ?? 50) > 60
              ? "Fast-talking, staccato cadence"
              : "Measured, calculated cadence",
          subtext_ratio:
            (nodeData.subtext ?? 70) > 60
              ? "Heavy subtext, veiled sarcasm"
              : "Literal, direct",
          raw_dialogue: sampleLine,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTunedDialogueResult(data.tuned_dialogue || data.dialogue);
      }
    } catch (err) {
      console.error("Failed to tune dialogue:", err);
    } finally {
      setIsTuningDialogue(false);
    }
  };

  const handleSynthesizeCharacter = async () => {
    if (isSynthesizing || !selectedNode) return;
    setIsSynthesizing(true);
    try {
      const res = await fetch("/api/character/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nodeData.name || nodeData.actorName || "Character",
          base_archetype: nodeData.archetype || "High-stakes dramatic character",
          dream_actor: nodeData.actorComp || nodeData.actorName || "Character Actor",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateNodeData?.(selectedNode.id, {
          name: data.name || nodeData.name,
          archetype: data.archetype || nodeData.archetype,
          bio: data.bio,
          speechStyle: data.speech_style,
          subtextRatio: data.subtext_ratio,
          actorComp: data.dream_actor_comp,
          quirks: data.behavioral_tics,
        });
      }
    } catch (err) {
      console.error("Failed to synthesize character:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleExtractStyle = async () => {
    if (isExtractingStyle || !selectedNode) return;
    setIsExtractingStyle(true);
    try {
      const res = await fetch("/api/style/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: nodeData.url || "youtube.com/watch?v=cinematic",
          timestamp_range: nodeData.timestampRange || "01:00 - 02:30",
          genre: "Feature Film",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const swatches = Array.isArray(data.visual_palette)
          ? data.visual_palette.map((c: string) => c.split(" ")[0])
          : ["#0b132b", "#1c2541", "#3a506b", "#e09f3e", "#d62828"];

        onUpdateNodeData?.(selectedNode.id, {
          lightingStyle: data.lighting_style,
          palette: swatches,
          pacing: data.editing_rhythm,
        });
      }
    } catch (err) {
      console.error("Failed to extract style:", err);
    } finally {
      setIsExtractingStyle(false);
    }
  };

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
                      onClick={handleSynthesizeCharacter}
                      disabled={isSynthesizing}
                      className="gap-2 bg-purple-600 hover:bg-purple-500 text-white w-full"
                    >
                      {isSynthesizing ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {isSynthesizing ? "Synthesizing..." : "Synthesize Character DNA (Gemini AI)"}
                      </span>
                    </Button>
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

                  {/* Live AI Cadence & Subtext Tuning */}
                  <div className="mt-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Live Cadence Tuning
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground">Gemini 3.7</span>
                    </div>
                    <input
                      type="text"
                      value={sampleLine}
                      onChange={(e) => setSampleLine(e.target.value)}
                      placeholder="Sample dialogue to tune..."
                      className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground font-mono"
                    />
                    <Button
                      size="sm"
                      onClick={handleTuneDialogue}
                      disabled={isTuningDialogue}
                      className="w-full text-xs h-7 gap-1 bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                      {isTuningDialogue ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sliders className="h-3 w-3" />
                      )}
                      <span>{isTuningDialogue ? "Tuning Cadence..." : "Test Dialogue Cadence"}</span>
                    </Button>
                    {tunedDialogueResult && (
                      <div className="rounded bg-background/80 p-2 text-xs italic font-serif text-cyan-200 border border-cyan-500/20 leading-snug">
                        &ldquo;{tunedDialogueResult}&rdquo;
                      </div>
                    )}
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

                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={handleSynthesizeCharacter}
                      disabled={isSynthesizing}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white w-full"
                    >
                      {isSynthesizing ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {isSynthesizing ? "Synthesizing..." : "Synthesize Cast DNA (Gemini AI)"}
                      </span>
                    </Button>
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

                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={handleExtractStyle}
                      disabled={isExtractingStyle}
                      className="gap-2 bg-purple-600 hover:bg-purple-500 text-white w-full"
                    >
                      {isExtractingStyle ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {isExtractingStyle
                          ? "Extracting Palette..."
                          : "Extract Aesthetic & Palette (Gemini AI)"}
                      </span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Premise Note Controls */}
              {selectedNode.type === "note" && (
                <div className="flex flex-col gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Note Classification
                    </label>
                    <select
                      value={nodeData.noteType || "Plot Seed"}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { noteType: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground font-semibold"
                    >
                      <option value="Plot Seed">Plot Seed</option>
                      <option value="Voice Memo">Voice Memo</option>
                      <option value="Dialogue Snippet">Dialogue Snippet</option>
                      <option value="World Lore">World Lore</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Premise / Core Narrative Idea
                    </label>
                    <textarea
                      rows={5}
                      value={nodeData.content || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { content: e.target.value })
                      }
                      placeholder="Enter the dramatic seed or narrative premise..."
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Behavioral Quirks Controls */}
              {selectedNode.type === "quirks" && (
                <div className="flex flex-col gap-3 text-xs">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">
                    Behavioral Quirks & Tells
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {(nodeData.tics || []).map((tic: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded bg-rose-500/10 px-2.5 py-1.5 text-[11px] text-rose-300 border border-rose-500/20"
                      >
                        <span>{tic}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (nodeData.tics || []).filter((_: any, idx: number) => idx !== i);
                            onUpdateNodeData?.(selectedNode.id, { tics: updated });
                          }}
                          className="text-rose-400 hover:text-rose-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      value={newTic}
                      onChange={(e) => setNewTic(e.target.value)}
                      placeholder="Add new behavioral tic..."
                      className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newTic.trim()) {
                          const updated = [...(nodeData.tics || []), newTic.trim()];
                          onUpdateNodeData?.(selectedNode.id, { tics: updated });
                          setNewTic("");
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (newTic.trim()) {
                          const updated = [...(nodeData.tics || []), newTic.trim()];
                          onUpdateNodeData?.(selectedNode.id, { tics: updated });
                          setNewTic("");
                        }
                      }}
                      className="text-xs h-7 px-2.5 bg-rose-600 hover:bg-rose-500 text-white"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}

              {/* Chemistry Node Controls */}
              {selectedNode.type === "chemistry" && (
                <div className="flex flex-col gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Friction Scenario
                    </label>
                    <textarea
                      rows={3}
                      value={nodeData.scenario || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { scenario: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground leading-snug"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => nodeData.onRunChemistry?.()}
                    className="gap-2 bg-rose-600 hover:bg-rose-500 text-white w-full"
                  >
                    <Flame className="h-3.5 w-3.5" />
                    <span>Run Dynamic Friction Scene</span>
                  </Button>
                </div>
              )}

              {/* Storyboard Node Controls */}
              {selectedNode.type === "storyboard" && (
                <div className="flex flex-col gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Shot Composition / Aspect Ratio
                    </label>
                    <input
                      type="text"
                      value={nodeData.shotType || "2.39:1 Anamorphic Scope"}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { shotType: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Imagen 3 Visual Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={nodeData.prompt || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { prompt: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground leading-snug font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">
                      Lighting & Atmosphere
                    </label>
                    <input
                      type="text"
                      value={nodeData.lighting || ""}
                      onChange={(e) =>
                        onUpdateNodeData?.(selectedNode.id, { lighting: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
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

                  {nodeData.stakes !== undefined && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase">
                        Dramatic Stakes
                      </label>
                      <textarea
                        rows={2}
                        value={nodeData.stakes || ""}
                        onChange={(e) =>
                          onUpdateNodeData?.(selectedNode.id, { stakes: e.target.value })
                        }
                        className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground leading-snug"
                      />
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    {nodeData.onGenerateDraft && (
                      <Button
                        size="sm"
                        onClick={nodeData.onGenerateDraft}
                        className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Generate Screenplay Draft</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onOpenScriptReader}
                      className="gap-2 border-border w-full"
                    >
                      <FileText className="h-3.5 w-3.5 text-accent" />
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
