"use client";

import * as React from "react";
import {
  Plus,
  Sparkles,
  Clapperboard,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ZoomIn,
  ZoomOut,
  Users,
  Film,
  GripVertical,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTimecode } from "@/components/cinema/timeline-scrubber";
import { isBridgeScene } from "@/components/cinema/project-scenes-page";
import type { FilmScene } from "@/lib/project-store";
import { cn } from "@/lib/utils";

interface SequenceTimelineViewProps {
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
  onEditScene?: (scene: FilmScene) => void;
  characters?: Array<{ name: string }>;
  projectTitle: string;
}

export function SequenceTimelineView({
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
  onEditScene,
  characters = [],
  projectTitle,
}: SequenceTimelineViewProps) {
  // Timeline zoom level: 0.8 = 80%, 1 = 100%, 1.5 = 150%
  const [zoom, setZoom] = React.useState<number>(1);
  const [draggedSceneIdx, setDraggedSceneIdx] = React.useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);

  // Total duration across all scenes
  const totalDuration = React.useMemo(() => {
    return scenes.reduce((acc, s) => acc + (s.durationSeconds || 180), 0);
  }, [scenes]);

  const activeIndex = scenes.findIndex((s) => s.id === activeSceneId);
  const selectedScene = scenes[activeIndex] || scenes[0];

  // Base pixels per second scaling for horizontal scrollable track
  const basePxPerSecond = 0.65 * zoom;
  const trackWidth = Math.max(900, Math.round(totalDuration * basePxPerSecond));

  // Time ruler tick intervals: 1m, 2m, or 5m intervals based on zoom
  const tickIntervalSec = zoom >= 1.2 ? 60 : zoom >= 0.8 ? 120 : 300;
  const tickCount = Math.ceil(totalDuration / tickIntervalSec) + 1;
  const ticks = Array.from({ length: tickCount }, (_, i) => i * tickIntervalSec);

  // Drag and Drop reordering handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSceneIdx(index);
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedSceneIdx === null || draggedSceneIdx === targetIndex) {
      setDraggedSceneIdx(null);
      setDragOverIdx(null);
      return;
    }

    const reordered = [...scenes];
    const [moved] = reordered.splice(draggedSceneIdx, 1);
    reordered.splice(targetIndex, 0, moved);

    setDraggedSceneIdx(null);
    setDragOverIdx(null);
    onReorderScenes(reordered);
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-[#0a0c10] overflow-hidden shadow-2xl">
      {/* ── TOP TIMELINE TOOLBAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-secondary/30 px-4 py-2.5">
        {/* Left: Summary & Drag Tip */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold text-foreground">
              Sequence Arranger
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground border-l border-border pl-3">
            <span>
              Total: <strong className="text-foreground">{formatTimecode(totalDuration)}</strong> ({scenes.length} Scenes)
            </span>
            <span>•</span>
            <span className="hidden md:inline text-muted-foreground/80">
              Drag clips or use ◀ ▶ to reorder • Click seam for AI Bridge
            </span>
          </div>
        </div>

        {/* Right: Zoom Scaling & Add Scene */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary/50 border border-border/70 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.2) * 10) / 10))}
              disabled={zoom <= 0.6}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
              title="Zoom Out Timeline"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-mono text-muted-foreground px-1.5 select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.0, Math.round((z + 0.2) * 10) / 10))}
              disabled={zoom >= 2.0}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
              title="Zoom In Timeline"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            {zoom !== 1 && (
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="text-[10px] font-mono text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-secondary cursor-pointer"
                title="Reset Zoom to 100%"
              >
                Reset
              </button>
            )}
          </div>

          <Button
            size="sm"
            onClick={onAddScene}
            className="h-8 gap-1.5 text-xs bg-accent text-accent-foreground font-semibold hover:bg-accent/90 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Scene</span>
          </Button>
        </div>
      </div>

      {/* ── TIMELINE CANVAS (RULER + CLIPS TRACK) ── */}
      <div className="relative flex overflow-hidden select-none">
        {/* Left Track Header Column */}
        <div className="w-32 sm:w-40 shrink-0 bg-[#0e1117] border-r border-border/80 flex flex-col z-20">
          {/* Ruler Corner */}
          <div className="h-8 border-b border-border/70 flex items-center px-3 bg-secondary/30">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-accent" />
              Timecode
            </span>
          </div>

          {/* Track Label */}
          <div className="h-44 p-3 flex flex-col justify-between bg-secondary/15">
            <div>
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold">
                  TRACK 1
                </span>
                Scene Clips
              </span>
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">
                Order represents macro film sequence.
              </p>
            </div>

            <div className="text-[10px] font-mono text-muted-foreground">
              {scenes.length} Scenes in order
            </div>
          </div>
        </div>

        {/* Scrollable Track Canvas */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#06080b] relative">
          <div style={{ width: `${trackWidth}px` }} className="relative flex flex-col min-w-full">
            {/* 1. Timecode Ruler */}
            <div className="h-8 border-b border-border/70 bg-secondary/20 relative overflow-hidden">
              {ticks.map((tSec) => {
                const leftPct = totalDuration > 0 ? (tSec / totalDuration) * 100 : 0;
                return (
                  <div
                    key={tSec}
                    style={{ left: `${leftPct}%` }}
                    className="absolute top-0 bottom-0 flex flex-col justify-end pointer-events-none"
                  >
                    <div className="h-2 w-px bg-border/80" />
                    <span className="text-[9px] font-mono text-muted-foreground/80 pl-1 pb-0.5">
                      {formatTimecode(tSec)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 2. Scene Clips Track */}
            <div className="h-44 relative bg-background/30 p-2.5 flex items-center">
              <div className="flex items-center h-full w-full gap-2 relative">
                {scenes.map((scene, idx) => {
                  const duration = scene.durationSeconds || 180;
                  const widthPct = totalDuration > 0 ? (duration / totalDuration) * 100 : 100 / scenes.length;
                  const isActive = scene.id === activeSceneId;
                  const isBridge = isBridgeScene(scene);
                  const isDragged = draggedSceneIdx === idx;
                  const isDragTarget = dragOverIdx === idx;

                  return (
                    <React.Fragment key={scene.id}>
                      {/* Clip Block */}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onClick={() => onSelectScene(scene.id)}
                        onDoubleClick={() => onOpenSceneStudio(scene.id)}
                        style={{ width: `${widthPct}%`, minWidth: "170px" }}
                        className={cn(
                          "h-full rounded-xl border transition-all duration-150 p-3 flex flex-col justify-between cursor-pointer group relative overflow-hidden select-none",
                          isDragged && "opacity-30 scale-95 border-dashed border-accent",
                          isDragTarget && "ring-2 ring-accent scale-102 z-10",
                          isActive
                            ? isBridge
                              ? "bg-purple-950/80 border-purple-400 ring-2 ring-purple-400/50 shadow-lg shadow-purple-900/30"
                              : "bg-secondary/95 border-accent ring-2 ring-accent/50 shadow-lg shadow-accent/15"
                            : isBridge
                            ? "bg-purple-950/40 border-purple-500/50 hover:border-purple-400 hover:bg-purple-950/60"
                            : "bg-card/75 border-border/80 hover:border-accent/60 hover:bg-card/95"
                        )}
                        title={`Drag to reorder. Double-click to launch Scene Studio for "${scene.title}".`}
                      >
                        {/* Top: Scene #, Bridge Badge, Setting & Duration */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <span
                              className={cn(
                                "font-mono text-[10px] font-black px-1.5 py-0.5 rounded",
                                isBridge
                                  ? "bg-purple-500/30 text-purple-200 border border-purple-500/40"
                                  : "bg-accent/20 text-accent border border-accent/40"
                              )}
                            >
                              SCENE {String(scene.sceneNumber).padStart(2, "0")}
                            </span>

                            {isBridge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/25 text-purple-200 font-mono font-bold shrink-0">
                                ⚡ BRIDGE
                              </span>
                            )}

                            <span className="text-[9px] font-mono uppercase text-muted-foreground bg-secondary/80 px-1 py-0.5 rounded">
                              {scene.slugline?.split("-")[0]?.trim() || "INT."}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono text-muted-foreground shrink-0 bg-background/70 px-1.5 py-0.5 rounded border border-border/50">
                            {formatTimecode(duration)}
                          </span>
                        </div>

                        {/* Center: Title & Slugline */}
                        <div className="my-1.5 min-w-0 space-y-0.5">
                          <div className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">
                            {scene.title}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground truncate opacity-80">
                            {scene.slugline || "INT. SCENE LOCATION"}
                          </div>
                        </div>

                        {/* Bottom: Cast Initials & Reorder Nudge Arrows */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-border/40 text-[10px]">
                          {/* Cast Initials / Pills */}
                          <div className="flex items-center gap-1 truncate max-w-[120px]">
                            <Users className="h-3 w-3 text-cyan-400 shrink-0" />
                            <span className="truncate text-muted-foreground font-mono text-[10px]">
                              {(scene.castPresent || []).slice(0, 2).join(", ") || "Unassigned"}
                              {(scene.castPresent || []).length > 2 ? ` +${(scene.castPresent || []).length - 2}` : ""}
                            </span>
                          </div>

                          {/* Quick Nudge Arrows */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveScene(idx, "up");
                              }}
                              className="p-1 rounded bg-secondary/90 hover:bg-accent hover:text-accent-foreground text-muted-foreground disabled:opacity-20 cursor-pointer"
                              title="Move Earlier in Film Sequence"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === scenes.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveScene(idx, "down");
                              }}
                              className="p-1 rounded bg-secondary/90 hover:bg-accent hover:text-accent-foreground text-muted-foreground disabled:opacity-20 cursor-pointer"
                              title="Move Later in Film Sequence"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Seam Connector: AI Bridge Scene Button */}
                      {idx < scenes.length - 1 && (
                        <div className="relative flex items-center justify-center shrink-0 z-10">
                          <button
                            type="button"
                            disabled={isGeneratingBridge === idx}
                            onClick={() => onGenerateBridge(idx)}
                            className="h-7 w-7 rounded-full border border-purple-500/50 bg-[#0e1117] hover:bg-purple-900/60 hover:border-purple-400 text-purple-300 flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-120"
                            title={`Insert AI Bridge Scene between Scene ${idx + 1} and Scene ${idx + 2}`}
                          >
                            <Sparkles
                              className={cn(
                                "h-3.5 w-3.5",
                                isGeneratingBridge === idx && "animate-spin text-purple-400"
                              )}
                            />
                          </button>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SELECTED CLIP INSPECTOR DRAWER (BOTTOM) ── */}
      {selectedScene && (
        <div className="border-t border-border bg-[#0d1017] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-accent">
                SCENE {selectedScene.sceneNumber} OF {scenes.length}
              </span>
              <span className="text-border">·</span>
              <span className="text-sm font-bold text-foreground truncate">
                {selectedScene.title}
              </span>
              {isBridgeScene(selectedScene) && (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-[10px] font-mono">
                  ⚡ AI Bridge Scene
                </Badge>
              )}
              <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded border border-border">
                {Math.round((selectedScene.durationSeconds || 180) / 60)} min ({selectedScene.durationSeconds || 180}s)
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              <strong className="text-foreground/80 font-mono mr-1.5">{selectedScene.slugline}:</strong>
              {selectedScene.summary || "Dramatic beat sequence ready for directorial exploration."}
            </p>
          </div>

          {/* Actions on Selected Clip */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap self-end md:self-auto">
            {/* Reorder Buttons */}
            <div className="flex items-center rounded-lg border border-border bg-secondary/40 p-0.5 text-xs font-mono">
              <button
                type="button"
                disabled={activeIndex <= 0}
                onClick={() => onMoveScene(activeIndex, "up")}
                className="px-2.5 py-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer flex items-center gap-1"
                title="Move earlier in film sequence"
              >
                <ChevronLeft className="h-3 w-3" />
                <span>Move Left</span>
              </button>
              <div className="h-3 w-px bg-border mx-0.5" />
              <button
                type="button"
                disabled={activeIndex >= scenes.length - 1}
                onClick={() => onMoveScene(activeIndex, "down")}
                className="px-2.5 py-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer flex items-center gap-1"
                title="Move later in film sequence"
              >
                <span>Move Right</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* AI Bridge Button if not last scene */}
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

            {/* Edit Scene Details */}
            {onEditScene && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditScene(selectedScene)}
                className="gap-1.5 text-xs border-border hover:border-accent hover:text-accent font-medium shadow-2xs"
              >
                <Pencil className="h-3 w-3" />
                <span>Edit Scene</span>
              </Button>
            )}

            {/* Launch Studio CTA */}
            <Button
              onClick={() => onOpenSceneStudio(selectedScene.id)}
              className="gap-1.5 text-xs bg-accent text-accent-foreground font-semibold hover:bg-accent/90 shadow-sm"
            >
              <Clapperboard className="h-3.5 w-3.5" />
              Launch Scene Studio
            </Button>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => onDeleteScene(selectedScene.id)}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
              title="Delete this scene"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
