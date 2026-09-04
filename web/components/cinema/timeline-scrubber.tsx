"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface StoryEventMarker {
  /** Story-time in seconds, matching ClickHouse story_events.event_timestamp */
  atSeconds: number;
  characterName: string;
  eventType: "known_fact" | "unaware_of" | "location" | "objective";
}

function formatTimecode(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/**
 * TimelineScrubber — the core mechanic's control surface. Not a themed
 * shadcn Slider: a purpose-built scrubber where story events render as
 * position-accurate ticks on the track (pulled from ClickHouse story_events)
 * and the playhead is a slate-tab handle carrying the live timecode, so the
 * time-gate mechanic is visible in the control itself, not just its effect.
 *
 * Built on raw pointer events rather than a slider primitive because the
 * track needs to render arbitrary data (event density) under the thumb,
 * which fights most off-the-shelf range-input abstractions.
 */
function TimelineScrubber({
  durationSeconds,
  value,
  onChange,
  events = [],
  className,
}: {
  durationSeconds: number;
  value: number;
  onChange: (seconds: number) => void;
  events?: StoryEventMarker[];
  className?: string;
}) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [hoverSeconds, setHoverSeconds] = React.useState<number | null>(null);

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

  return (
    <div className={cn("flex flex-col gap-1.5 select-none", className)}>
      <div className="flex items-center justify-between">
        <span className="slate-label">Story timeline</span>
        <span className="timecode text-sm">{formatTimecode(value)}</span>
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
            className="absolute inset-y-0 left-0 bg-muted"
            style={{ width: `${pct}%` }}
          />
          {/* event ticks, position-accurate to story time */}
          {events.map((ev, i) => {
            const left = durationSeconds > 0 ? (ev.atSeconds / durationSeconds) * 100 : 0;
            const isPast = ev.atSeconds <= value;
            return (
              <div
                key={i}
                className={cn(
                  "absolute top-0 bottom-0 w-px transition-colors",
                  isPast ? "bg-accent/50" : "bg-border"
                )}
                style={{ left: `${left}%` }}
                title={`${ev.characterName} · ${ev.eventType} · ${formatTimecode(ev.atSeconds)}`}
              />
            );
          })}
        </div>

        {/* bottom sprocket rhythm */}
        <div className="sprocket-strip absolute bottom-0 left-0 right-0 h-2" />

        {/* hover preview timecode */}
        {hoverSeconds !== null && !dragging && (
          <div
            className="pointer-events-none absolute -top-6 -translate-x-1/2 timecode text-xs opacity-60"
            style={{
              left: `${durationSeconds > 0 ? (hoverSeconds / durationSeconds) * 100 : 0}%`,
            }}
          >
            {formatTimecode(hoverSeconds)}
          </div>
        )}

        {/* playhead — slate-tab handle */}
        <div
          className="absolute top-0 bottom-0 -translate-x-1/2"
          style={{ left: `${pct}%` }}
        >
          <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-accent" />
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
