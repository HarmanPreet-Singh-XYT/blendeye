"use client";

import * as React from "react";
import {
  type FilmScene,
  type TimelineMoment,
} from "@/lib/project-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { notifyIfFallback } from "@/lib/fallback-notice";
import { cn } from "@/lib/utils";
import {
  Image as ImageIcon,
  Loader2,
  Trash2,
  Plus,
  Maximize2,
  Download,
  Sparkles,
  Camera,
  Film,
  Clock,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  X,
  Copy,
  Eye,
  Sliders,
  Clapperboard,
  Upload,
} from "lucide-react";
import { AssetPickerModal } from "@/components/cinema/asset-picker-modal";
import {
  LOCATION_STYLE_PRESETS,
  LOCATION_CAMERA_FRAMINGS,
} from "@/components/cinema/location-board";

export interface SceneTimelineCanvasProps {
  scene: FilmScene | null;
  onUpdateScene?: (updatedScene: FilmScene) => void;
  aspectRatio?: "16:9" | "9:16";
  /** All scenes for the scene-switcher rail */
  scenes?: FilmScene[];
  activeSceneId?: string;
  onSelectScene?: (sceneId: string) => void;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTimecode(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Build a rich, context-aware Imagen prompt for a given timeline moment */
function buildMomentPrompt(
  scene: FilmScene,
  timestampSec: number,
  styleId: string,
  framingId: string,
  customNote: string
): string {
  const style =
    LOCATION_STYLE_PRESETS.find((p) => p.id === styleId) ||
    LOCATION_STYLE_PRESETS[0];
  const framing =
    LOCATION_CAMERA_FRAMINGS.find((f) => f.id === framingId) ||
    LOCATION_CAMERA_FRAMINGS[0];

  const totalSec = scene.durationSeconds || 180;
  const pct = Math.round((timestampSec / totalSec) * 100);
  const momentLabel =
    pct < 20
      ? "scene opening"
      : pct < 45
      ? "early scene development"
      : pct < 55
      ? "scene midpoint"
      : pct < 80
      ? "scene escalation"
      : "scene climax / resolution";

  const location = scene.location || scene.title || "Cinematic Location";
  const slugline = scene.slugline ? `${scene.slugline}. ` : "";
  const summary = scene.summary ? `${scene.summary.slice(0, 180)}. ` : "";
  const castClause =
    scene.castPresent && scene.castPresent.length > 0
      ? `Characters present: ${scene.castPresent.slice(0, 3).join(", ")}. `
      : "";
  const directorClause = scene.directorStyle
    ? `Director style: ${scene.directorStyle}. `
    : "";
  const screenplayClause = scene.screenplayText
    ? `Scene context: ${scene.screenplayText.slice(0, 200).replace(/\n/g, " ")}. `
    : "";
  const noteClause = customNote.trim() ? `${customNote.trim()}. ` : "";

  return (
    `${framing.promptModifier} of ${location}. ` +
    `${slugline}` +
    `Depicting the ${momentLabel} — ${timestampSec}s into a ${totalSec}s scene (${pct}% through). ` +
    `${summary}` +
    `${castClause}` +
    `${directorClause}` +
    `${screenplayClause}` +
    `${noteClause}` +
    `${style.promptModifier}. ` +
    `Photoreal cinematic still, high dynamic range, master cinematography.`
  );
}

/** Generate a human-readable label for a moment based on its position */
function momentPositionLabel(timestampSec: number, totalSec: number): string {
  const pct = totalSec > 0 ? (timestampSec / totalSec) * 100 : 0;
  if (pct < 10) return "Opening";
  if (pct < 30) return "Early";
  if (pct < 50) return "Mid";
  if (pct < 70) return "Late-Mid";
  if (pct < 90) return "Late";
  return "Finale";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SceneTimelineCanvas({
  scene,
  onUpdateScene,
  aspectRatio = "16:9",
  scenes = [],
  activeSceneId,
  onSelectScene,
}: SceneTimelineCanvasProps) {
  const totalSec = scene?.durationSeconds || 180;

  // Sort moments chronologically
  const moments = React.useMemo(
    () =>
      (scene?.timelineMoments || [])
        .slice()
        .sort((a, b) => a.timestampSec - b.timestampSec),
    [scene?.timelineMoments]
  );

  // Group into stacks by rounded timestamp
  const stacks = React.useMemo(() => {
    const map = new Map<number, TimelineMoment[]>();
    for (const m of moments) {
      const key = Math.round(m.timestampSec);
      const list = map.get(key) || [];
      list.push(m);
      map.set(key, list);
    }
    return Array.from(map.entries())
      .map(([timestampSec, items]) => ({ timestampSec, items }))
      .sort((a, b) => a.timestampSec - b.timestampSec);
  }, [moments]);

  // ── Scrubber state ──
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [scrubTimeSec, setScrubTimeSec] = React.useState<number>(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [hoverSec, setHoverSec] = React.useState<number | null>(null);

  const pct = totalSec > 0 ? (scrubTimeSec / totalSec) * 100 : 0;

  const secFromClientX = React.useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return scrubTimeSec;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return Math.round(ratio * totalSec);
    },
    [totalSec, scrubTimeSec]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setScrubTimeSec(secFromClientX(e.clientX));
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    const s = secFromClientX(e.clientX);
    setHoverSec(s);
    if (isDragging) setScrubTimeSec(s);
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };
  const step = (delta: number) =>
    setScrubTimeSec((prev) => Math.max(0, Math.min(totalSec, prev + delta)));

  // ── Generation controls ──
  const [styleId, setStyleId] = React.useState<string>(
    LOCATION_STYLE_PRESETS[0].id
  );
  const [framingId, setFramingId] = React.useState<string>(
    LOCATION_CAMERA_FRAMINGS[0].id
  );
  const [customNote, setCustomNote] = React.useState<string>("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = React.useState(false);

  // Derived prompt preview
  const promptPreview = React.useMemo(() => {
    if (!scene) return "";
    return buildMomentPrompt(scene, scrubTimeSec, styleId, framingId, customNote);
  }, [scene, scrubTimeSec, styleId, framingId, customNote]);

  // ── Lightbox ──
  const [lightboxMoment, setLightboxMoment] = React.useState<TimelineMoment | null>(null);

  // ── Panel tabs ──
  const [panel, setPanel] = React.useState<"style" | "framing" | "prompt">("style");

  // ── Selected stack for focus view ──
  const [focusTimestamp, setFocusTimestamp] = React.useState<number | null>(null);
  const focusStack = stacks.find((s) => s.timestampSec === focusTimestamp) || null;

  // ── Generate ──
  const handleGenerate = async () => {
    if (!scene || isGenerating) return;
    setIsGenerating(true);
    try {
      const prompt = buildMomentPrompt(
        scene,
        scrubTimeSec,
        styleId,
        framingId,
        customNote
      );
      const res = await fetch("/api/media/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspect_ratio: aspectRatio }),
      });
      if (!res.ok) throw new Error("Image generation request failed");
      const result = await res.json();
      if (result.image_url) {
        const style =
          LOCATION_STYLE_PRESETS.find((p) => p.id === styleId) ||
          LOCATION_STYLE_PRESETS[0];
        const framing =
          LOCATION_CAMERA_FRAMINGS.find((f) => f.id === framingId) ||
          LOCATION_CAMERA_FRAMINGS[0];
        const newMoment: TimelineMoment = {
          id: `moment-${Date.now()}`,
          timestampSec: scrubTimeSec,
          imageUrl: result.image_url,
          prompt,
          createdAt: Date.now(),
          styleId,
          framingId,
          label: `${momentPositionLabel(scrubTimeSec, totalSec)} · ${style.name.split(" ")[0]} · ${framing.name.split(" ")[0]}`,
        } as TimelineMoment & { styleId: string; framingId: string; label: string };

        onUpdateScene?.({
          ...scene,
          timelineMoments: [...(scene.timelineMoments || []), newMoment],
        });
        notifyIfFallback(result, "Timeline Moment");

        // Auto-focus the newly generated stack
        setFocusTimestamp(Math.round(scrubTimeSec));

        toast.add({
          title: "📽️ Timeline Frame Generated",
          description: `Moment at ${formatTimecode(scrubTimeSec)} captured — ${style.name}`,
          type: "success",
        });
      }
    } catch (err) {
      toast.add({
        title: "Generation failed",
        description:
          err instanceof Error ? err.message : "Could not generate frame.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteMoment = (id: string) => {
    if (!scene) return;
    const remaining = (scene.timelineMoments || []).filter((m) => m.id !== id);
    onUpdateScene?.({ ...scene, timelineMoments: remaining });
    // If focus stack becomes empty after delete, clear focus
    if (
      focusStack &&
      focusStack.items.length === 1 &&
      focusStack.items[0].id === id
    ) {
      setFocusTimestamp(null);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  // ── Ruler ticks ──
  const tickStep = totalSec <= 180 ? 15 : totalSec <= 360 ? 30 : 60;
  const ticks = React.useMemo(() => {
    const arr: number[] = [];
    for (let t = 0; t <= totalSec; t += tickStep) arr.push(t);
    return arr;
  }, [totalSec, tickStep]);

  // ── No scene guard ──
  if (!scene) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground gap-2">
        <Film className="h-4 w-4 opacity-50" />
        <span>No active scene selected.</span>
      </div>
    );
  }

  const activeStyle =
    LOCATION_STYLE_PRESETS.find((p) => p.id === styleId) ||
    LOCATION_STYLE_PRESETS[0];
  const activeFraming =
    LOCATION_CAMERA_FRAMINGS.find((f) => f.id === framingId) ||
    LOCATION_CAMERA_FRAMINGS[0];

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 bg-background overflow-hidden">
      {/* ── Top Scene Info Bar ─────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-border bg-card/60">
        {/* Scene selector */}
        {scenes.length > 1 && (
          <div className="flex items-center gap-1 border-r border-border/60 pr-3 mr-1">
            <button
              type="button"
              onClick={() => {
                const idx = scenes.findIndex((s) => s.id === scene.id);
                if (idx > 0) onSelectScene?.(scenes[idx - 1].id);
              }}
              disabled={scenes.findIndex((s) => s.id === scene.id) === 0}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Previous scene"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const idx = scenes.findIndex((s) => s.id === scene.id);
                if (idx < scenes.length - 1) onSelectScene?.(scenes[idx + 1].id);
              }}
              disabled={
                scenes.findIndex((s) => s.id === scene.id) ===
                scenes.length - 1
              }
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Next scene"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Clapperboard className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-heading font-semibold uppercase tracking-wider text-foreground truncate">
            Sc.{scene.sceneNumber}: {scene.title}
          </span>
          {scene.slugline && (
            <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground truncate max-w-[240px]">
              · {scene.slugline}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-amber-500/30 text-amber-300"
          >
            {totalSec}s scene
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-border text-muted-foreground"
          >
            {stacks.length} frame{stacks.length !== 1 ? "s" : ""}
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-border text-muted-foreground"
          >
            {aspectRatio}
          </Badge>
        </div>
      </div>

      {/* ── Main 2-Column Layout ──────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── LEFT: Timeline scrubber + gallery ─────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-border">
          {/* Scrubber region */}
          <div className="shrink-0 px-4 pt-4 pb-3 bg-card/30 border-b border-border/60">
            {/* Header row */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-mono font-semibold text-foreground">
                  {formatTimecode(scrubTimeSec)}
                  <span className="text-muted-foreground font-normal">
                    {" / "}{formatTimecode(totalSec)}
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
                  ({Math.round(pct)}% through scene)
                </span>
              </div>

              {/* Steppers */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => step(-10)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                  title="Back 10s"
                >
                  −10s
                </button>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                  title="Back 1s"
                >
                  <SkipBack className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                  title="Forward 1s"
                >
                  <SkipForward className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => step(10)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                  title="Forward 10s"
                >
                  +10s
                </button>
              </div>
            </div>

            {/* Timeline track */}
            <div
              ref={trackRef}
              className="relative h-14 rounded-md bg-[#080b12] border border-border/70 cursor-crosshair select-none overflow-hidden shadow-inner touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={() => !isDragging && setHoverSec(null)}
            >
              {/* Sprocket top */}
              <div className="sprocket-strip absolute top-0 left-0 right-0 h-1.5 opacity-50 pointer-events-none" />

              {/* Played fill */}
              <div
                className="absolute top-1.5 bottom-1.5 left-0 bg-gradient-to-r from-amber-500/20 to-amber-400/35 border-r-2 border-amber-400 pointer-events-none"
                style={{ width: `${pct}%` }}
              />

              {/* Ruler ticks */}
              {ticks.map((t) => {
                const lp = totalSec > 0 ? (t / totalSec) * 100 : 0;
                return (
                  <div
                    key={t}
                    className="absolute top-1.5 bottom-1.5 w-px border-r border-white/10 pointer-events-none"
                    style={{ left: `${lp}%` }}
                  >
                    <span className="absolute top-1 left-0.5 text-[7px] font-mono text-white/30 select-none">
                      {formatTimecode(t)}
                    </span>
                  </div>
                );
              })}

              {/* Existing stack markers */}
              {stacks.map((s) => {
                const lp = totalSec > 0 ? (s.timestampSec / totalSec) * 100 : 0;
                const isFocused = focusTimestamp === s.timestampSec;
                return (
                  <div
                    key={s.timestampSec}
                    onClick={(e) => {
                      e.stopPropagation();
                      setScrubTimeSec(s.timestampSec);
                      setFocusTimestamp(isFocused ? null : s.timestampSec);
                    }}
                    className="absolute top-0 bottom-0 z-10 flex flex-col items-center -translate-x-1/2 cursor-pointer group"
                    style={{ left: `${lp}%` }}
                    title={`${s.timestampSec}s · ${s.items.length} image${s.items.length !== 1 ? "s" : ""} — click to focus`}
                  >
                    <div
                      className={cn(
                        "w-0.5 h-full transition-colors",
                        isFocused ? "bg-amber-400" : "bg-amber-500/60 group-hover:bg-amber-400"
                      )}
                    />
                    <div
                      className={cn(
                        "absolute top-1 flex items-center justify-center h-5 w-5 rounded-full border text-[8px] font-bold shadow transition-transform group-hover:scale-110",
                        isFocused
                          ? "bg-amber-400 border-amber-300 text-amber-950 scale-110"
                          : "bg-amber-950 border-amber-500/60 text-amber-300"
                      )}
                    >
                      {s.items.length}
                    </div>
                  </div>
                );
              })}

              {/* Hover tooltip */}
              {hoverSec !== null && !isDragging && (
                <div
                  className="pointer-events-none absolute -top-7 -translate-x-1/2 font-mono text-[10px] text-amber-300 bg-black/90 px-1.5 py-0.5 rounded border border-amber-500/40 shadow-md z-30"
                  style={{
                    left: `${totalSec > 0 ? (hoverSec / totalSec) * 100 : 0}%`,
                  }}
                >
                  {formatTimecode(hoverSec)}
                </div>
              )}

              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 -translate-x-1/2 z-20 pointer-events-none"
                style={{ left: `${pct}%` }}
              >
                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2 bg-amber-400 shadow-[0_0_8px_theme(colors.amber.400)]" />
                <div
                  className={cn(
                    "absolute -top-0.5 left-1/2 flex h-4 w-3 -translate-x-1/2 items-center justify-center rounded-[2px] bg-amber-400 text-amber-950 shadow-[0_0_6px_rgba(251,191,36,0.5)] transition-transform",
                    isDragging && "scale-125 bg-amber-300"
                  )}
                >
                  <div className="w-0.5 h-2 bg-amber-950/60 rounded-full" />
                </div>
              </div>

              {/* Sprocket bottom */}
              <div className="sprocket-strip absolute bottom-0 left-0 right-0 h-1.5 opacity-50 pointer-events-none" />
            </div>

            {/* Scene beat indicator row */}
            <div className="flex items-center gap-1 mt-1.5">
              {["Opening", "Early", "Mid", "Late-Mid", "Late", "Finale"].map(
                (label, i, arr) => {
                  const threshold = (i / arr.length) * 100;
                  const nextThreshold = ((i + 1) / arr.length) * 100;
                  const active = pct >= threshold && pct < nextThreshold;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        setScrubTimeSec(
                          Math.round((threshold / 100) * totalSec)
                        )
                      }
                      className={cn(
                        "flex-1 text-center text-[9px] font-mono py-0.5 rounded cursor-pointer transition-colors",
                        active
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                          : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/50"
                      )}
                    >
                      {label}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Gallery area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {stacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-secondary/40 border border-border/60 flex items-center justify-center">
                  <Film className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    No timeline frames yet
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Scrub to any moment on the timeline above, configure the
                    look in the right panel, and generate a cinematic still.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {stacks.map((s) => {
                  const isFocused = focusTimestamp === s.timestampSec;
                  return (
                    <div
                      key={s.timestampSec}
                      className={cn(
                        "rounded-xl border transition-colors",
                        isFocused
                          ? "border-amber-500/40 bg-amber-500/5"
                          : "border-border/60 bg-card/40"
                      )}
                    >
                      {/* Stack header */}
                      <div
                        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
                        onClick={() =>
                          setFocusTimestamp(
                            isFocused ? null : s.timestampSec
                          )
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-amber-400/80" />
                          <span className="text-xs font-mono font-semibold text-foreground">
                            {formatTimecode(s.timestampSec)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ·{" "}
                            {momentPositionLabel(s.timestampSec, totalSec)} ·{" "}
                            {Math.round(
                              (s.timestampSec / totalSec) * 100
                            )}
                            % through
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-[9px] font-mono border-amber-500/30 text-amber-300"
                          >
                            {s.items.length} take{s.items.length !== 1 ? "s" : ""}
                          </Badge>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setScrubTimeSec(s.timestampSec);
                            }}
                            className="p-1 rounded text-muted-foreground hover:text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                            title="Jump playhead here"
                          >
                            <Clock className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Image grid */}
                      <div
                        className={cn(
                          "grid gap-3 px-3 pb-3",
                          s.items.length === 1
                            ? "grid-cols-1"
                            : "grid-cols-2 sm:grid-cols-3"
                        )}
                      >
                        {s.items.map((m, idx) => {
                            return (
                            <div
                              key={m.id}
                              className="relative rounded-lg border border-border/60 overflow-hidden group bg-black"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.imageUrl}
                                alt={`Frame ${idx + 1} at ${formatTimecode(s.timestampSec)}`}
                                className={cn(
                                  "w-full object-cover transition-opacity group-hover:opacity-90",
                                  aspectRatio === "9:16"
                                    ? "aspect-[9/16]"
                                    : "aspect-video"
                                )}
                              />

                              {/* Overlay actions */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => setLightboxMoment(m)}
                                  className="p-1.5 rounded-md bg-black/80 hover:bg-black text-white/90 hover:text-white border border-white/20 cursor-pointer"
                                  title="Full screen"
                                >
                                  <Maximize2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownload(
                                      m.imageUrl,
                                      `frame_${s.timestampSec}s_take${idx + 1}.jpg`
                                    )
                                  }
                                  className="p-1.5 rounded-md bg-black/80 hover:bg-black text-white/90 hover:text-white border border-white/20 cursor-pointer"
                                  title="Download"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(m.prompt);
                                    toast.add({
                                      title: "Prompt copied",
                                      type: "success",
                                    });
                                  }}
                                  className="p-1.5 rounded-md bg-black/80 hover:bg-black text-white/90 hover:text-white border border-white/20 cursor-pointer"
                                  title="Copy prompt"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMoment(m.id)}
                                  className="p-1.5 rounded-md bg-black/80 hover:bg-black text-white/90 hover:text-destructive border border-white/20 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Bottom label */}
                              <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                                <p className="text-[9px] font-mono text-white/90 truncate">
                                  {m.label ||
                                    `Take ${idx + 1} · ${formatTimecode(s.timestampSec)}`}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Control panel ──────────────────────────────────────── */}
        <div className="w-72 xl:w-80 shrink-0 flex flex-col bg-card/40 border-l border-border overflow-hidden">
          {/* Generate CTA */}
          <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border/60">
            <Button
              className="w-full gap-2 font-semibold bg-amber-500 hover:bg-amber-400 text-black border-0 cursor-pointer"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Frame at {formatTimecode(scrubTimeSec)}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 gap-1.5 text-xs border-border hover:bg-secondary text-accent font-medium cursor-pointer"
              onClick={() => setIsAssetPickerOpen(true)}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import from Asset Hub / Upload...</span>
            </Button>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              Imagen 3 AI generation or custom uploaded media
            </p>
          </div>

          {/* Director's Note — always visible alongside all generation options */}
          <div className="shrink-0 px-3 pt-2 pb-3 border-b border-border/60 bg-card/20">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clapperboard className="h-2.5 w-2.5" />
                Director&apos;s Note
                <span className="text-muted-foreground/40 font-normal normal-case tracking-normal">
                  · optional
                </span>
              </label>
              {customNote.trim() && (
                <button
                  type="button"
                  onClick={() => setCustomNote("")}
                  className="text-[9px] text-muted-foreground/60 hover:text-muted-foreground cursor-pointer flex items-center gap-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                  Clear
                </button>
              )}
            </div>
            <Textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Backlit silhouette, rain-soaked, tension on her face as she grips the case..."
              className="min-h-[60px] text-[11px] font-mono resize-none bg-secondary/20 border-border/50 placeholder:text-muted-foreground/30"
            />
            {customNote.trim() && (
              <p className="text-[9px] text-amber-400/70 mt-1 font-mono">
                ✓ Note will be injected into Imagen prompt
              </p>
            )}
          </div>

          {/* Panel tabs — Film Look / Framing / Prompt */}
          <div className="flex shrink-0 border-b border-border/60">
            {(
              [
                { id: "style", label: "Film Look", icon: Film },
                { id: "framing", label: "Framing", icon: Camera },
                { id: "prompt", label: "Prompt", icon: Sliders },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPanel(id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors border-b-2",
                  panel === id
                    ? "border-amber-400 text-amber-300 bg-amber-500/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto">
            {panel === "style" && (
              <div className="p-3 space-y-1.5">
                <p className="text-[10px] font-mono text-muted-foreground px-1 mb-2">
                  Cinematographic look & stock
                </p>
                {LOCATION_STYLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setStyleId(p.id)}
                    className={cn(
                      "w-full text-left px-2.5 py-2 rounded-lg border cursor-pointer transition-all text-[11px]",
                      styleId === p.id
                        ? "border-amber-500/60 bg-amber-500/10 text-foreground"
                        : "border-border/50 bg-secondary/20 text-muted-foreground hover:border-border hover:bg-secondary/40 hover:text-foreground"
                    )}
                  >
                    <span className="font-semibold block truncate">{p.name}</span>
                    <span className="text-[10px] opacity-70 line-clamp-1">
                      {p.description}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {panel === "framing" && (
              <div className="p-3 space-y-1.5">
                <p className="text-[10px] font-mono text-muted-foreground px-1 mb-2">
                  Camera lens & composition
                </p>
                {LOCATION_CAMERA_FRAMINGS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFramingId(f.id)}
                    className={cn(
                      "w-full text-left px-2.5 py-2 rounded-lg border cursor-pointer transition-all text-[11px]",
                      framingId === f.id
                        ? "border-amber-500/60 bg-amber-500/10 text-foreground"
                        : "border-border/50 bg-secondary/20 text-muted-foreground hover:border-border hover:bg-secondary/40 hover:text-foreground"
                    )}
                  >
                    <span className="font-semibold block truncate">{f.name}</span>
                    <span className="text-[10px] opacity-70 line-clamp-1">
                      {f.description}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {panel === "prompt" && (
              <div className="p-3 space-y-3">
                {/* Active selection summary */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-secondary/30 border border-border/50">
                    <Film className="h-3 w-3 text-amber-400 shrink-0" />
                    <span className="text-[10px] text-muted-foreground truncate">
                      {activeStyle.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-secondary/30 border border-border/50">
                    <Camera className="h-3 w-3 text-amber-400 shrink-0" />
                    <span className="text-[10px] text-muted-foreground truncate">
                      {activeFraming.name}
                    </span>
                  </div>
                  {customNote.trim() && (
                    <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                      <Clapperboard className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-[10px] text-amber-300/80 line-clamp-2">
                        {customNote}
                      </span>
                    </div>
                  )}
                </div>

                {/* Full prompt preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-mono text-muted-foreground">
                      Full Imagen prompt preview
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(promptPreview);
                        toast.add({ title: "Prompt copied", type: "success" });
                      }}
                      className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-2.5 w-2.5" />
                      Copy
                    </button>
                  </div>
                  <div className="p-2.5 rounded-md bg-secondary/30 border border-border/50 text-[9px] font-mono text-muted-foreground leading-relaxed max-h-36 overflow-y-auto">
                    {promptPreview}
                  </div>
                </div>

                {/* Context info */}
                <div className="rounded-md bg-secondary/20 border border-border/40 p-2.5 space-y-1">
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
                    Scene context injected
                  </p>
                  {scene.castPresent && scene.castPresent.length > 0 && (
                    <div className="flex gap-1.5 items-start">
                      <Eye className="h-2.5 w-2.5 text-muted-foreground/60 mt-0.5 shrink-0" />
                      <span className="text-[9px] text-muted-foreground/70">
                        Cast: {scene.castPresent.slice(0, 3).join(", ")}
                      </span>
                    </div>
                  )}
                  {scene.directorStyle && (
                    <div className="flex gap-1.5 items-start">
                      <Clapperboard className="h-2.5 w-2.5 text-muted-foreground/60 mt-0.5 shrink-0" />
                      <span className="text-[9px] text-muted-foreground/70 line-clamp-2">
                        Director style: {scene.directorStyle}
                      </span>
                    </div>
                  )}
                  {scene.slugline && (
                    <div className="flex gap-1.5 items-start">
                      <Film className="h-2.5 w-2.5 text-muted-foreground/60 mt-0.5 shrink-0" />
                      <span className="text-[9px] text-muted-foreground/70 line-clamp-1">
                        {scene.slugline}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick jump buttons */}
          <div className="shrink-0 px-3 py-2.5 border-t border-border/60 bg-card/30">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
              Quick jump
            </p>
            <div className="grid grid-cols-3 gap-1">
              {[0, 25, 50, 75, 90, 100].map((p) => {
                const sec = Math.round((p / 100) * totalSec);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setScrubTimeSec(sec)}
                    className={cn(
                      "py-1 rounded text-[10px] font-mono cursor-pointer transition-colors border",
                      scrubTimeSec === sec
                        ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                        : "border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    {p === 0
                      ? "Open"
                      : p === 100
                      ? "End"
                      : `${p}%`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────── */}
      {lightboxMoment && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setLightboxMoment(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxMoment.imageUrl}
            alt="Timeline frame"
            className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
          />
          {/* Bottom bar */}
          <div
            className="mt-3 flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-mono text-white/60">
              {formatTimecode(lightboxMoment.timestampSec)}
            </span>
            <button
              type="button"
              onClick={() =>
                handleDownload(
                  lightboxMoment.imageUrl,
                  `frame_${lightboxMoment.timestampSec}s.jpg`
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer border border-white/20"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(lightboxMoment.prompt);
                toast.add({ title: "Prompt copied", type: "success" });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer border border-white/20"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Prompt
            </button>
            <button
              type="button"
              onClick={() => setLightboxMoment(null)}
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer border border-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Prompt peek */}
          <p className="mt-2 max-w-2xl text-center text-[9px] font-mono text-white/30 line-clamp-2">
            {lightboxMoment.prompt}
          </p>
        </div>
      )}

      {/* Asset Picker Modal for Timeline Media */}
      <AssetPickerModal
        open={isAssetPickerOpen}
        onOpenChange={setIsAssetPickerOpen}
        title={`Import Media at ${formatTimecode(scrubTimeSec)}`}
        description="Select an image plate, character still, or video take from your Asset Hub to anchor this timeline moment."
        acceptedTypes={["image", "video"]}
        onSelectAsset={(asset) => {
          if (!scene) return;
          const newMoment: TimelineMoment = {
            id: `moment-asset-${Date.now()}`,
            timestampSec: scrubTimeSec,
            imageUrl: asset.thumbnailUrl || asset.url,
            prompt: `Imported reference: ${asset.name}`,
            createdAt: Date.now(),
            styleId,
            framingId,
            label: `${momentPositionLabel(scrubTimeSec, totalSec)} · ${asset.name}`,
          } as TimelineMoment & { styleId: string; framingId: string; label: string };

          onUpdateScene?.({
            ...scene,
            timelineMoments: [...(scene.timelineMoments || []), newMoment],
          });
          setFocusTimestamp(Math.round(scrubTimeSec));
          toast.add({
            title: "Media Placed on Timeline",
            description: `"${asset.name}" placed at ${formatTimecode(scrubTimeSec)}.`,
            type: "success",
          });
        }}
      />
    </div>
  );
}
