"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  Eye,
  CheckCircle2,
  Target,
  MapPin,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";

export interface StoryEventMarker {
  /** Story-time in seconds, matching ClickHouse story_events.event_timestamp */
  atSeconds: number;
  characterName: string;
  eventType: "known_fact" | "unaware_of" | "location" | "objective";
}

export function formatTimecode(totalSeconds: number, forceHours = false) {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = Math.floor(clamped % 60);

  if (forceHours || h > 0) {
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  }
  return [m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export interface TimelineSceneSegment {
  id: string;
  sceneNumber: number;
  title: string;
  startSeconds: number;
  durationSeconds: number;
  slugline?: string;
  isActive?: boolean;
}

export interface TimelineScrubberProps {
  /** Scene duration in seconds (e.g. 180s - 480s) */
  durationSeconds: number;
  /** Current playhead time in seconds (absolute film time or relative scene seconds) */
  value: number;
  /** Callback fired when playhead is scrubbed */
  onChange: (seconds: number) => void;
  /** Event markers in ClickHouse or narrative story event engine */
  events?: StoryEventMarker[];
  className?: string;
  /** Offset of this scene in the master movie timeline (e.g. 2040s = 34m mark). Default 0 */
  scenePlacementSeconds?: number;
  /** Duration of this scene */
  sceneDurationSeconds?: number;
  /** Scene Title */
  sceneTitle?: string;
  /** Scene Number */
  sceneNumber?: number;
  /** Hollywood Slugline */
  slugline?: string;
  /** Whether this is an AI-generated transitional bridge scene */
  isBridge?: boolean;
  /** Optional multi-scene segments (ignored in low-level scene mode) */
  scenes?: TimelineSceneSegment[];
  activeSceneId?: string;
  onSelectScene?: (sceneId: string) => void;
  onOpenTimeframeModal?: () => void;
  /** Scene duration extend callback (+30s, etc.) */
  onExtend?: (deltaSeconds: number) => void;
  /** Scene duration shrink callback (-30s, etc.) */
  onShrink?: (deltaSeconds: number) => void;
  narrativeFormat?: string;
}

const SCENE_BEATS = [
  { label: "Beat 1: Entry", fullLabel: "Beat 1: Establishing & Scene Entry", color: "text-sky-400" },
  { label: "Beat 2: Escalation", fullLabel: "Beat 2: Inciting Shift & Escalation", color: "text-amber-400" },
  { label: "Beat 3: Turning Point", fullLabel: "Beat 3: Conflict & Turning Point", color: "text-rose-400" },
  { label: "Beat 4: Button", fullLabel: "Beat 4: Scene Climax & Button", color: "text-emerald-400" },
];

/**
 * TimelineScrubber — Low-Level Scene Story Timeline.
 * Dedicated strictly to scrubbing and analyzing a single particular scene.
 * Provides second-by-second micro-control, scene beat phases, and ClickHouse event pins.
 */
function TimelineScrubber({
  durationSeconds,
  value,
  onChange,
  events = [],
  className,
  scenePlacementSeconds = 0,
  sceneDurationSeconds,
  sceneTitle = "Current Scene",
  sceneNumber = 1,
  slugline,
  isBridge = false,
  onExtend,
  onShrink,
}: TimelineScrubberProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [hoverLocalSeconds, setHoverLocalSeconds] = React.useState<number | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const sceneStart = scenePlacementSeconds ?? 0;
  const sceneDur = Math.max(10, sceneDurationSeconds || durationSeconds || 180);

  // Normalize current scrub position: supports both absolute (startSec + local) and relative (0..sceneDur)
  const currentLocal = Math.max(0, Math.min(sceneDur, value >= sceneStart ? value - sceneStart : value));
  const currentAbsolute = sceneStart + currentLocal;
  const pct = sceneDur > 0 ? (currentLocal / sceneDur) * 100 : 0;

  // Active scene beat phase
  const activeBeatIndex = Math.min(3, Math.max(0, Math.floor((currentLocal / sceneDur) * 4)));
  const currentBeat = SCENE_BEATS[activeBeatIndex];

  // Client X to local scene seconds
  const localSecondsFromClientX = React.useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return currentLocal;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return Math.round(ratio * sceneDur);
    },
    [sceneDur, currentLocal]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const localSec = localSecondsFromClientX(e.clientX);
    onChange(sceneStart + localSec);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const localSec = localSecondsFromClientX(e.clientX);
    setHoverLocalSeconds(localSec);
    if (dragging) {
      onChange(sceneStart + localSec);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Step controls (-1s, +1s, -5s, +5s)
  const handleStep = (deltaSeconds: number) => {
    const nextLocal = Math.max(0, Math.min(sceneDur, currentLocal + deltaSeconds));
    onChange(sceneStart + nextLocal);
  };

  // Real-time playback simulation within the scene
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (currentLocal >= sceneDur) {
        setIsPlaying(false);
      } else {
        onChange(sceneStart + currentLocal + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentLocal, sceneDur, sceneStart, onChange]);

  // Generate low-level ruler ticks (every 15s or 30s)
  const tickStep = sceneDur <= 180 ? 15 : sceneDur <= 360 ? 30 : 60;
  const ticks = React.useMemo(() => {
    const arr: number[] = [];
    for (let t = 0; t <= sceneDur; t += tickStep) {
      arr.push(t);
    }
    return arr;
  }, [sceneDur, tickStep]);

  // Filter events strictly to THIS scene
  const sceneEvents = React.useMemo(() => {
    if (!events || events.length === 0) return [];
    return events
      .filter((ev) => {
        if (sceneStart > 0) {
          return ev.atSeconds >= sceneStart && ev.atSeconds <= sceneStart + sceneDur;
        }
        return ev.atSeconds <= sceneDur;
      })
      .map((ev) => {
        const localSec = ev.atSeconds >= sceneStart ? ev.atSeconds - sceneStart : ev.atSeconds;
        const leftPct = sceneDur > 0 ? (localSec / sceneDur) * 100 : 0;
        return {
          ...ev,
          localSec,
          leftPct: Math.min(99, Math.max(1, leftPct)),
        };
      });
  }, [events, sceneStart, sceneDur]);

  return (
    <div className={cn("flex flex-col gap-1.5 select-none", className)}>
      {/* Top Header: Low-Level Scene Identity & Playhead Readouts */}
      <div className="flex items-center justify-between gap-3 text-xs">
        {/* Left: Scene Identity Badge & Current Beat Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-accent/40 bg-accent/15 text-[11px] font-semibold text-accent shrink-0">
            <Film className="h-3 w-3" />
            <span>Scene Timeline</span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <span className="font-heading font-semibold text-foreground truncate max-w-[170px] sm:max-w-[240px]">
              Sc. {sceneNumber}: {sceneTitle}
            </span>
            {isBridge && (
              <Badge variant="outline" className="text-[9px] py-0 px-1 border-purple-500/50 bg-purple-500/15 text-purple-300 font-mono shrink-0 font-bold">
                BRIDGE
              </Badge>
            )}
            {slugline && (
              <span className="hidden lg:inline text-[10px] font-mono text-muted-foreground/80 truncate max-w-[220px]">
                · {slugline}
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/40 border border-border/60 text-[10px] font-mono">
            <span className={cn("font-medium", currentBeat.color)}>
              {currentBeat.label}
            </span>
          </div>
        </div>

        {/* Right: Fine-Grained Stepper, Duration Adjusters, and Scene Timecodes */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Frame & Second Steppers */}
          <div className="hidden md:flex items-center gap-0.5 border-r border-border/60 pr-2">
            <button
              type="button"
              onClick={() => handleStep(-5)}
              className="px-1 py-0.5 rounded hover:bg-secondary text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
              title="Step back 5 seconds"
            >
              -5s
            </button>
            <button
              type="button"
              onClick={() => handleStep(-1)}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              title="Step back 1 second"
            >
              <SkipBack className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "p-1 rounded cursor-pointer transition-colors",
                isPlaying
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
              title={isPlaying ? "Pause Scene Playback Preview" : "Play Scene Preview (1x Real-time)"}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={() => handleStep(1)}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              title="Step forward 1 second"
            >
              <SkipForward className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => handleStep(5)}
              className="px-1 py-0.5 rounded hover:bg-secondary text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
              title="Step forward 5 seconds"
            >
              +5s
            </button>
          </div>

          {/* Quick Scene Duration Pacing Adjusters (+30s / -30s) */}
          {(onShrink || onExtend) && (
            <div className="hidden xl:flex items-center gap-1 border-r border-border/60 pr-2">
              {onShrink && (
                <button
                  type="button"
                  onClick={() => onShrink(30)}
                  className="px-1.5 py-0.5 rounded border border-border/60 bg-secondary/30 hover:bg-rose-500/10 hover:text-rose-300 text-[9px] font-mono text-muted-foreground cursor-pointer transition-colors"
                  title="Shrink scene duration (-30s)"
                >
                  -30s
                </button>
              )}
              {onExtend && (
                <button
                  type="button"
                  onClick={() => onExtend(30)}
                  className="px-1.5 py-0.5 rounded border border-border/60 bg-secondary/30 hover:bg-emerald-500/10 hover:text-emerald-300 text-[9px] font-mono text-muted-foreground cursor-pointer transition-colors"
                  title="Extend scene duration (+30s)"
                >
                  +30s
                </button>
              )}
            </div>
          )}

          {/* High-Precision Timecode Readout */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-xs font-bold text-foreground bg-secondary/40 px-1.5 py-0.5 rounded border border-border/60">
              +{formatTimecode(currentLocal)}
              <span className="text-muted-foreground font-normal"> / {formatTimecode(sceneDur)}</span>
            </span>
            {sceneStart > 0 && (
              <span className="hidden sm:inline text-[10px] text-muted-foreground/70" title="Master Movie Timeline Position">
                [Film: {formatTimecode(currentAbsolute)}]
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Track Container (Low-Level Scene Strip) */}
      <div
        ref={trackRef}
        className="relative h-12 cursor-pointer touch-none select-none rounded-md bg-[#0a0d14] border border-border/70 overflow-hidden shadow-inner"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => !dragging && setHoverLocalSeconds(null)}
      >
        {/* Top sprocket rhythm */}
        <div className="sprocket-strip absolute top-0 left-0 right-0 h-1.5 opacity-60 pointer-events-none" />

        {/* 4 Dramatic Phase Background Zones */}
        <div className="absolute inset-x-0 top-1.5 bottom-1.5 grid grid-cols-4 pointer-events-none divide-x divide-white/5">
          {SCENE_BEATS.map((beat, i) => (
            <div
              key={i}
              className={cn(
                "relative flex items-end p-1 transition-colors",
                activeBeatIndex === i ? "bg-accent/5" : "bg-transparent"
              )}
            >
              <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/40">
                {beat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Played range fill with subtle gradient */}
        <div
          className="absolute top-1.5 bottom-1.5 left-0 bg-gradient-to-r from-accent/20 to-accent/35 border-r border-accent pointer-events-none"
          style={{ width: `${pct}%` }}
        />

        {/* Fine-grained second ruler tick lines */}
        {ticks.map((t) => {
          const leftPct = sceneDur > 0 ? (t / sceneDur) * 100 : 0;
          return (
            <div
              key={t}
              className="absolute top-1.5 bottom-1.5 w-px border-r border-white/10 pointer-events-none"
              style={{ left: `${leftPct}%` }}
            >
              <span className="absolute top-0.5 left-0.5 text-[7px] font-mono text-white/30 select-none">
                +{formatTimecode(t)}
              </span>
            </div>
          );
        })}

        {/* Low-Level Scene Story Event Pins (ClickHouse Knowledge & Beats) */}
        {sceneEvents.map((ev, idx) => {
          const isPast = ev.localSec <= currentLocal;
          return (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                onChange(sceneStart + ev.localSec);
              }}
              className="absolute top-0 bottom-0 z-15 flex flex-col items-center justify-center -translate-x-1/2 cursor-pointer group px-1"
              style={{ left: `${ev.leftPct}%` }}
              title={`+${formatTimecode(ev.localSec)}: ${ev.characterName} (${ev.eventType.replace("_", " ")}) — Click to jump`}
            >
              <div
                className={cn(
                  "w-1 h-full transition-colors",
                  isPast ? "bg-accent" : "bg-border/80 group-hover:bg-accent/70"
                )}
              />
              <div
                className={cn(
                  "absolute -top-0.5 flex items-center justify-center h-4 w-4 rounded-full border shadow-sm transition-transform group-hover:scale-125",
                  ev.eventType === "unaware_of"
                    ? "bg-rose-950 border-rose-400 text-rose-300"
                    : ev.eventType === "known_fact"
                    ? "bg-emerald-950 border-emerald-400 text-emerald-300"
                    : ev.eventType === "objective"
                    ? "bg-sky-950 border-sky-400 text-sky-300"
                    : "bg-amber-950 border-amber-400 text-amber-300"
                )}
              >
                {ev.eventType === "unaware_of" ? (
                  <Eye className="h-2 w-2" />
                ) : ev.eventType === "known_fact" ? (
                  <CheckCircle2 className="h-2 w-2" />
                ) : ev.eventType === "objective" ? (
                  <Target className="h-2 w-2" />
                ) : (
                  <MapPin className="h-2 w-2" />
                )}
              </div>
            </div>
          );
        })}

        {/* Bottom sprocket rhythm */}
        <div className="sprocket-strip absolute bottom-0 left-0 right-0 h-1.5 opacity-60 pointer-events-none" />

        {/* Hover preview tooltip */}
        {hoverLocalSeconds !== null && !dragging && (
          <div
            className="pointer-events-none absolute -top-6 -translate-x-1/2 font-mono text-[10px] text-accent bg-black/90 px-1.5 py-0.5 rounded border border-accent/40 shadow-md z-30"
            style={{
              left: `${sceneDur > 0 ? (hoverLocalSeconds / sceneDur) * 100 : 0}%`,
            }}
          >
            +{formatTimecode(hoverLocalSeconds)}
          </div>
        )}

        {/* High-Visibility Neon Playhead */}
        <div
          className="absolute top-0 bottom-0 -translate-x-1/2 z-25 pointer-events-none"
          style={{ left: `${pct}%` }}
        >
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2 bg-accent shadow-[0_0_10px_var(--accent)]" />
          <div
            className={cn(
              "absolute -top-1 left-1/2 flex h-4 w-3 -translate-x-1/2 items-center justify-center rounded-[2px] bg-accent text-accent-foreground shadow-[0_0_6px_rgba(255,255,255,0.4)] transition-transform",
              dragging && "scale-125 bg-amber-400 text-amber-950"
            )}
          >
            <div className="w-0.5 h-2 bg-background/60 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { TimelineScrubber };
