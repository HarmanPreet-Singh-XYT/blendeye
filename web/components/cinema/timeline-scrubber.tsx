"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Clock, Maximize2, Minimize2, ChevronRight } from "lucide-react";

export interface StoryEventMarker {
  /** Story-time in seconds, matching ClickHouse story_events.event_timestamp */
  atSeconds: number;
  characterName: string;
  eventType: "known_fact" | "unaware_of" | "location" | "objective";
}

function formatTimecode(totalSeconds: number, forceHours = false) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  if (forceHours || h > 0) {
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  }
  return [m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

interface TimelineScrubberProps {
  durationSeconds: number;
  value: number;
  onChange: (seconds: number) => void;
  events?: StoryEventMarker[];
  className?: string;
  scenePlacementSeconds?: number;
  sceneDurationSeconds?: number;
  sceneTitle?: string;
  onOpenTimeframeModal?: () => void;
  onExtend?: (deltaMinutes: number) => void;
  onShrink?: (deltaMinutes: number) => void;
  narrativeFormat?: string;
}

/**
 * TimelineScrubber — the core mechanic's control surface.
 * Position-accurate ticks, act markers, scene pinpoint brackets,
 * and quick extend/shrink pacing controls.
 */
function TimelineScrubber({
  durationSeconds,
  value,
  onChange,
  events = [],
  className,
  scenePlacementSeconds,
  sceneDurationSeconds = 180,
  sceneTitle,
  onOpenTimeframeModal,
  onExtend,
  onShrink,
  narrativeFormat = "Feature",
}: TimelineScrubberProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [hoverSeconds, setHoverSeconds] = React.useState<number | null>(null);

  const totalRuntimeMinutes = Math.round(durationSeconds / 60);
  const pct = durationSeconds > 0 ? (value / durationSeconds) * 100 : 0;

  const secondsFromClientX = React.useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return value;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return Math.round(ratio * durationSeconds);
    },
    [durationSeconds, value]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onChange(secondsFromClientX(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const s = secondsFromClientX(e.clientX);
    setHoverSeconds(s);
    if (dragging) onChange(s);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Scene highlight bracket
  const hasSceneAnchor = scenePlacementSeconds !== undefined;
  const sceneLeftPct = hasSceneAnchor && durationSeconds > 0
    ? (scenePlacementSeconds / durationSeconds) * 100
    : 0;
  const sceneWidthPct = hasSceneAnchor && durationSeconds > 0
    ? Math.max(2.5, (sceneDurationSeconds / durationSeconds) * 100)
    : 0;

  return (
    <div className={cn("flex flex-col gap-1.5 select-none", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="slate-label">Story timeline</span>
          {onOpenTimeframeModal ? (
            <button
              type="button"
              onClick={onOpenTimeframeModal}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/80 bg-secondary/40 hover:bg-secondary text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Click to adjust project duration, extend, or shrink flow"
            >
              <Clock className="h-3 w-3 text-accent" />
              <span>{totalRuntimeMinutes}m Scope</span>
              <span className="text-muted-foreground/60">▾</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground">
              {totalRuntimeMinutes}m
            </span>
          )}

          {hasSceneAnchor && (
            <span className="text-[10px] font-mono text-accent hidden sm:inline truncate max-w-[200px]">
              · {sceneTitle || "Current Scene"}: {formatTimecode(scenePlacementSeconds, true)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Extend / Shrink Buttons */}
          {(onShrink || onExtend) && (
            <div className="hidden md:flex items-center gap-1 border-r border-border/60 pr-2 mr-1">
              {onShrink && (
                <button
                  type="button"
                  onClick={() => onShrink(15)}
                  className="px-1.5 py-0.5 rounded border border-border/60 bg-secondary/30 hover:bg-rose-500/10 hover:text-rose-300 text-[9px] font-mono text-muted-foreground cursor-pointer transition-colors"
                  title="Shrink timeline (-15m)"
                >
                  -15m
                </button>
              )}
              {onExtend && (
                <button
                  type="button"
                  onClick={() => onExtend(15)}
                  className="px-1.5 py-0.5 rounded border border-border/60 bg-secondary/30 hover:bg-emerald-500/10 hover:text-emerald-300 text-[9px] font-mono text-muted-foreground cursor-pointer transition-colors"
                  title="Extend timeline (+15m)"
                >
                  +15m
                </button>
              )}
            </div>
          )}

          <span className="timecode text-xs font-semibold text-foreground">
            {formatTimecode(value, true)}
            <span className="text-muted-foreground font-normal"> / {formatTimecode(durationSeconds, true)}</span>
          </span>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative h-11 cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => !dragging && setHoverSeconds(null)}
      >
        {/* top sprocket rhythm */}
        <div className="sprocket-strip absolute top-0 left-0 right-0 h-2" />

        {/* track body */}
        <div className="absolute top-2 left-0 right-0 bottom-2 rounded-sm bg-secondary overflow-hidden">
          {/* played range */}
          <div
            className="absolute inset-y-0 left-0 bg-muted/90"
            style={{ width: `${pct}%` }}
          />

          {/* Act Structure Dividers */}
          {/* Act I (25%) */}
          <div
            className="absolute top-0 bottom-0 w-px border-r border-dashed border-white/20 pointer-events-none"
            style={{ left: "25%" }}
          >
            <span className="absolute top-0.5 left-1 text-[7px] font-mono text-white/30 uppercase tracking-widest">
              Act I
            </span>
          </div>

          {/* Midpoint (50%) */}
          <div
            className="absolute top-0 bottom-0 w-px bg-amber-400/40 pointer-events-none shadow-[0_0_4px_rgba(251,191,36,0.3)]"
            style={{ left: "50%" }}
          >
            <span className="absolute top-0.5 left-1 text-[7px] font-mono text-amber-300/60 uppercase tracking-widest">
              Midpoint
            </span>
          </div>

          {/* Act III (75%) */}
          <div
            className="absolute top-0 bottom-0 w-px border-r border-dashed border-white/20 pointer-events-none"
            style={{ left: "75%" }}
          >
            <span className="absolute top-0.5 left-1 text-[7px] font-mono text-white/30 uppercase tracking-widest">
              Act III
            </span>
          </div>

          {/* Current Scene Placement Anchor Bracket */}
          {hasSceneAnchor && (
            <div
              className="absolute top-0 bottom-0 rounded-xs border border-accent/70 bg-accent/20 z-10 pointer-events-none transition-all"
              style={{
                left: `${sceneLeftPct}%`,
                width: `${sceneWidthPct}%`,
              }}
              title={`${sceneTitle || "Current Scene"}: ${formatTimecode(scenePlacementSeconds, true)}`}
            />
          )}

          {/* event ticks, position-accurate to story time */}
          {events.map((ev, i) => {
            const left = durationSeconds > 0 ? (ev.atSeconds / durationSeconds) * 100 : 0;
            const isPast = ev.atSeconds <= value;
            return (
              <div
                key={i}
                className={cn(
                  "absolute top-0 bottom-0 w-px transition-colors z-10",
                  isPast ? "bg-accent" : "bg-border"
                )}
                style={{ left: `${left}%` }}
                title={`${ev.characterName} · ${ev.eventType} · ${formatTimecode(ev.atSeconds, true)}`}
              />
            );
          })}
        </div>

        {/* bottom sprocket rhythm */}
        <div className="sprocket-strip absolute bottom-0 left-0 right-0 h-2" />

        {/* hover preview timecode */}
        {hoverSeconds !== null && !dragging && (
          <div
            className="pointer-events-none absolute -top-6 -translate-x-1/2 timecode text-xs opacity-75 bg-black/80 px-1.5 py-0.5 rounded border border-white/10"
            style={{
              left: `${durationSeconds > 0 ? (hoverSeconds / durationSeconds) * 100 : 0}%`,
            }}
          >
            {formatTimecode(hoverSeconds, true)}
          </div>
        )}

        {/* playhead — slate-tab handle */}
        <div
          className="absolute top-0 bottom-0 -translate-x-1/2 z-20"
          style={{ left: `${pct}%` }}
        >
          <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-accent shadow-[0_0_8px_var(--accent)]" />
          <div
            className={cn(
              "absolute -top-1.5 left-1/2 flex h-4 w-2.5 -translate-x-1/2 items-center justify-center rounded-[2px] bg-accent shadow-[0_0_0_2px_var(--background)] transition-transform",
              dragging && "scale-125"
            )}
          />
        </div>
      </div>
    </div>
  );
}

export { TimelineScrubber, formatTimecode };
