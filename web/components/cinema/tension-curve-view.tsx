"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { formatTimecode } from "@/components/cinema/timeline-scrubber";

interface TensionBeat {
  timeSeconds: number;
  tensionScore: number; // 0 - 100
  title: string;
  description: string;
  characterFocus: string;
}

interface TensionCurveViewProps {
  currentTimeSeconds: number;
  onScrubTime?: (seconds: number) => void;
  className?: string;
  projectId?: string;
}

export function TensionCurveView({
  currentTimeSeconds,
  onScrubTime,
  className,
  projectId = "vault-heist-demo",
}: TensionCurveViewProps) {
  const [activeCurveMode, setActiveCurveMode] = React.useState<"macro" | "marcus" | "elena">("macro");

  // Macro narrative curve beats across 90 min (5400s)
  const defaultBeats: TensionBeat[] = React.useMemo(() => {
    if (projectId === "space-airlock-demo") {
      return [
        { timeSeconds: 0, tensionScore: 20, title: "Orbital Drift", description: "Routine maintenance cycle", characterFocus: "Vance" },
        { timeSeconds: 15 * 60, tensionScore: 45, title: "Pressure Alert", description: "Module 4 alarm sounds", characterFocus: "Vance" },
        { timeSeconds: 22 * 60, tensionScore: 68, title: "Code Breach", description: "Manual override discovered", characterFocus: "Ray" },
        { timeSeconds: 45 * 60, tensionScore: 88, title: "Specimen Breach", description: "Infection vector identified", characterFocus: "Vance" },
        { timeSeconds: 75 * 60, tensionScore: 96, title: "Emergency Purge", description: "Terminal airlock choice", characterFocus: "Ray" },
        { timeSeconds: 90 * 60, tensionScore: 35, title: "Vacuum Silence", description: "Aftermath", characterFocus: "Vance" },
      ];
    }
    return [
      { timeSeconds: 0, tensionScore: 18, title: "Exterior Recon", description: "Establishing vault perimeter", characterFocus: "Teo" },
      { timeSeconds: 18 * 60, tensionScore: 42, title: "Laser Grid Bypass", description: "First security threshold", characterFocus: "Elena" },
      { timeSeconds: 28 * 60, tensionScore: 60, title: "Vault Breach", description: "Inner door heavy hydraulic lock drops", characterFocus: "Marcus" },
      { timeSeconds: 34 * 60, tensionScore: 82, title: "The Missing Keys", description: "Marcus discovers bypass keys gone", characterFocus: "Marcus" },
      { timeSeconds: 52 * 60, tensionScore: 92, title: "Elena's Syndicate Deal", description: "True motive unmasked under vent timer", characterFocus: "Elena" },
      { timeSeconds: 76 * 60, tensionScore: 98, title: "Atmospheric Cycle", description: "Cyan gas begins ventilation", characterFocus: "Marcus" },
      { timeSeconds: 90 * 60, tensionScore: 30, title: "Sub-Tunnel Extraction", description: "Sole survivor resolution", characterFocus: "Elena" },
    ];
  }, [projectId]);

  // Dimensions for SVG plot (1000x240 high-density coordinate space)
  const svgWidth = 1000;
  const svgHeight = 240;
  const paddingX = 55;
  const paddingY = 32;
  const totalDuration = 90 * 60; // 5400s

  // Compute curve points
  const points = React.useMemo(() => {
    return defaultBeats.map((b) => {
      let score = b.tensionScore;
      if (activeCurveMode === "marcus") {
        score = b.characterFocus === "Marcus" ? Math.min(100, score + 12) : Math.max(10, score - 15);
      } else if (activeCurveMode === "elena") {
        score = b.characterFocus === "Elena" ? Math.min(100, score + 16) : Math.max(15, score - 10);
      }
      const x = paddingX + (b.timeSeconds / totalDuration) * (svgWidth - 2 * paddingX);
      const y = svgHeight - paddingY - (score / 100) * (svgHeight - 2 * paddingY);
      return { ...b, x, y, score };
    });
  }, [defaultBeats, activeCurveMode]);

  // Construct smooth SVG cubic bezier path
  const pathD = React.useMemo(() => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  // Area under curve path for gradient fill
  const areaPathD = React.useMemo(() => {
    if (!pathD || points.length === 0) return "";
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = svgHeight - paddingY;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points]);

  // Current scrubber position in SVG space
  const currentX = React.useMemo(() => {
    const clamped = Math.max(0, Math.min(totalDuration, currentTimeSeconds));
    return paddingX + (clamped / totalDuration) * (svgWidth - 2 * paddingX);
  }, [currentTimeSeconds]);

  // Find nearest beat
  const activeBeat = React.useMemo(() => {
    let closest = defaultBeats[0];
    let minDiff = Infinity;
    defaultBeats.forEach((b) => {
      const diff = Math.abs(b.timeSeconds - currentTimeSeconds);
      if (diff < minDiff) {
        minDiff = diff;
        closest = b;
      }
    });
    return closest;
  }, [defaultBeats, currentTimeSeconds]);

  return (
    <div className={`flex flex-col rounded-xl border border-border bg-card p-4 space-y-4 ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <SlateLabel>Dramatic Tension &amp; Pacing Curve</SlateLabel>
          </div>
          <span className="text-xs text-muted-foreground">
            Non-linear pacing analysis indexed against 3-act story structure
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveCurveMode("macro")}
            className={`px-2 py-0.5 rounded transition-all ${
              activeCurveMode === "macro"
                ? "bg-card text-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Macro Tension
          </button>
          <button
            type="button"
            onClick={() => setActiveCurveMode("marcus")}
            className={`px-2 py-0.5 rounded transition-all ${
              activeCurveMode === "marcus"
                ? "bg-accent/20 text-accent font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Marcus POV
          </button>
          <button
            type="button"
            onClick={() => setActiveCurveMode("elena")}
            className={`px-2 py-0.5 rounded transition-all ${
              activeCurveMode === "elena"
                ? "bg-emerald-500/20 text-emerald-400 font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Elena POV
          </button>
        </div>
      </div>

      {/* SVG Curve Canvas */}
      <div className="relative w-full h-[200px] sm:h-[220px] rounded-lg border border-border/80 bg-background/90 overflow-hidden select-none">
        <svg
          className="w-full h-full cursor-crosshair"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const svgX = (clickX / rect.width) * svgWidth;
            const clampedX = Math.max(paddingX, Math.min(svgWidth - paddingX, svgX));
            const clickRatio = (clampedX - paddingX) / (svgWidth - 2 * paddingX);
            const clickSec = Math.round(clickRatio * totalDuration);
            onScrubTime?.(clickSec);
          }}
        >
          <defs>
            {/* Ambient Tension Fill Gradient */}
            <linearGradient id="tension-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.06" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>

            {/* Tension Line Glow Filter */}
            <filter id="tension-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="var(--accent)" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Act Region Background Shading */}
          <rect
            x={paddingX}
            y={paddingY}
            width={(svgWidth - 2 * paddingX) * 0.25}
            height={svgHeight - 2 * paddingY}
            fill="var(--secondary)"
            opacity="0.15"
          />
          <text
            x={paddingX + 12}
            y={paddingY + 16}
            fill="var(--muted-foreground)"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="0.5"
          >
            ACT I · SETUP
          </text>

          <rect
            x={paddingX + (svgWidth - 2 * paddingX) * 0.25}
            y={paddingY}
            width={(svgWidth - 2 * paddingX) * 0.5}
            height={svgHeight - 2 * paddingY}
            fill="var(--accent)"
            opacity="0.04"
          />
          <text
            x={paddingX + (svgWidth - 2 * paddingX) * 0.25 + 12}
            y={paddingY + 16}
            fill="var(--accent)"
            opacity="0.75"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="0.5"
          >
            ACT II · CONFLICT &amp; ASYMMETRY
          </text>

          <text
            x={paddingX + (svgWidth - 2 * paddingX) * 0.75 + 12}
            y={paddingY + 16}
            fill="var(--muted-foreground)"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="0.5"
          >
            ACT III · CLIMAX
          </text>

          {/* Horizontal Reference Grid Lines */}
          {[25, 50, 75, 100].map((level) => {
            const y = svgHeight - paddingY - (level / 100) * (svgHeight - 2 * paddingY);
            return (
              <g key={level}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="0.75"
                  strokeDasharray="4 4"
                  opacity="0.45"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3.5}
                  fill="var(--muted-foreground)"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Gradient Fill Under Curve */}
          <path d={areaPathD} fill="url(#tension-fill)" />

          {/* Main Dramatic Tension Line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#tension-glow)"
          />

          {/* Beat Markers */}
          {points.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onScrubTime?.(pt.timeSeconds);
              }}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="var(--background)"
                stroke="var(--accent)"
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={pt.y - 8}
                fill="var(--foreground)"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {pt.score}%
              </text>
            </g>
          ))}

          {/* Current Scrubber Head Vertical Ray */}
          <line
            x1={currentX}
            y1={paddingY - 6}
            x2={currentX}
            y2={svgHeight - paddingY + 6}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <circle cx={currentX} cy={paddingY - 5} r="3.5" fill="#f59e0b" />
        </svg>
      </div>

      {/* Current Beat Card & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Nearest Beat Highlight */}
        <div className="col-span-2 flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-2.5">
          <div className="p-1.5 rounded bg-accent/10 border border-accent/30 text-accent shrink-0">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground truncate">
                {activeBeat.title}
              </span>
              <span className="font-mono text-[11px] text-accent">
                {formatTimecode(activeBeat.timeSeconds)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {activeBeat.description}
            </p>
            <div className="flex items-center gap-2 pt-0.5 text-[10px]">
              <span className="text-muted-foreground">Focus:</span>
              <Badge variant="outline" className="text-[9px] py-0 px-1 border-accent/40 text-accent">
                {activeBeat.characterFocus}
              </Badge>
              <span className="text-muted-foreground">Intensity:</span>
              <span className="font-mono text-accent font-semibold">{activeBeat.tensionScore}%</span>
            </div>
          </div>
        </div>

        {/* Real-time ClickHouse Pacing Engine Metric */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-secondary/20 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">
              Retention Est.
            </span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="my-1">
            <span className="text-lg font-bold font-mono text-foreground">94.8%</span>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Strong mid-point hold via asymmetric secret reveal.
            </p>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground/80">
            ClickHouse benchmark indexed
          </span>
        </div>
      </div>
    </div>
  );
}
