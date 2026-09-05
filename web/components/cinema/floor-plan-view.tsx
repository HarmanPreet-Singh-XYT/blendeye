"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Lightbulb, User, Eye, Sparkles, RefreshCw, Film } from "lucide-react";

interface FloorPlanCharacter {
  name: string;
  x: number;
  y: number;
  angle: number; // degrees
  color: string;
  role: string;
}

interface CameraSetup {
  id: string;
  name: string;
  lens: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  fov: number; // degrees
}

interface PracticalLight {
  id: string;
  name: string;
  x: number;
  y: number;
  type: "key" | "practical" | "ambient";
  color: string;
}

interface PrecedentComp {
  film: string;
  director: string;
  scene_comparison: string;
  lens_and_blocking_technique: string;
}

interface LocationScoutData {
  film_precedents?: PrecedentComp[];
  location_aesthetic?: string;
  practical_lighting?: string;
  camera_package?: {
    cam_a: string;
    cam_b: string;
    cam_c: string;
  };
}

interface FloorPlanViewProps {
  sceneTitle: string;
  characters?: Array<{ name: string; archetype?: string }>;
  className?: string;
  onSendToVeo?: (camData: {
    camName: string;
    lens: string;
    motion: string;
    promptNote: string;
  }) => void;
}

export function FloorPlanView({
  sceneTitle,
  characters = [],
  className,
  onSendToVeo,
}: FloorPlanViewProps) {
  const [selectedCam, setSelectedCam] = React.useState<string>("cam-a");
  const [isScouting, setIsScouting] = React.useState(false);
  const [scoutedData, setScoutedData] = React.useState<LocationScoutData | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 1000, height: 300 });

  const handleRunLocationScout = async () => {
    if (isScouting) return;
    setIsScouting(true);
    try {
      const res = await fetch("/api/location/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene_description: sceneTitle || "Cinematic Confrontation",
          characters: characters.map((c) => c.name),
          genre: "Cinematic Drama / Thriller",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setScoutedData(data);
      }
    } catch (err) {
      console.error("Location scout error:", err);
    } finally {
      setIsScouting(false);
    }
  };

  React.useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const svgW = dimensions.width;
  const svgH = dimensions.height;

  // Blueprint room bounds centered within the viewport
  const roomW = Math.min(svgW - 60, 880);
  const roomH = Math.min(svgH - 40, 250);
  const roomX = Math.round((svgW - roomW) / 2);
  const roomY = Math.round((svgH - roomH) / 2);

  // Dynamic coordinates based on scene characters & room dimensions
  const charPositions: FloorPlanCharacter[] = React.useMemo(() => {
    const list: FloorPlanCharacter[] = [
      {
        name: characters[0]?.name || "Lead",
        role: characters[0]?.archetype ? `${characters[0].archetype.split(",")[0]}` : "Primary Subject",
        x: Math.round(roomX + roomW * 0.4),
        y: Math.round(roomY + roomH * 0.55),
        angle: 45,
        color: "var(--accent)",
      },
      {
        name: characters[1]?.name || "Counterpart",
        role: characters[1]?.archetype ? `${characters[1].archetype.split(",")[0]}` : "Counter-Weight",
        x: Math.round(roomX + roomW * 0.65),
        y: Math.round(roomY + roomH * 0.42),
        angle: 210,
        color: "#10b981",
      },
    ];
    if (characters[2]) {
      list.push({
        name: characters[2].name,
        role: characters[2].archetype ? `${characters[2].archetype.split(",")[0]}` : "Perimeter Lookout",
        x: Math.round(roomX + roomW * 0.8),
        y: Math.round(roomY + roomH * 0.72),
        angle: 180,
        color: "#f59e0b",
      });
    }
    return list;
  }, [characters, roomX, roomY, roomW, roomH]);

  const cameras: CameraSetup[] = React.useMemo(() => [
    {
      id: "cam-a",
      name: "Cam A · Wide Master",
      lens: scoutedData?.camera_package?.cam_a || "35mm T1.5 Anamorphic",
      x: Math.round(roomX + roomW * 0.2),
      y: Math.round(roomY + roomH * 0.82),
      targetX: Math.round(roomX + roomW * 0.52),
      targetY: Math.round(roomY + roomH * 0.48),
      fov: 60,
    },
    {
      id: "cam-b",
      name: "Cam B · Over-The-Shoulder",
      lens: scoutedData?.camera_package?.cam_b || "50mm T1.3 Prime",
      x: Math.round(roomX + roomW * 0.78),
      y: Math.round(roomY + roomH * 0.3),
      targetX: Math.round(roomX + roomW * 0.4),
      targetY: Math.round(roomY + roomH * 0.55),
      fov: 40,
    },
    {
      id: "cam-c",
      name: "Cam C · Intimate Close-Up",
      lens: scoutedData?.camera_package?.cam_c || "85mm T1.4 Portrait",
      x: Math.round(roomX + roomW * 0.3),
      y: Math.round(roomY + roomH * 0.66),
      targetX: Math.round(roomX + roomW * 0.4),
      targetY: Math.round(roomY + roomH * 0.55),
      fov: 30,
    },
  ], [roomX, roomY, roomW, roomH, scoutedData]);

  const lights: PracticalLight[] = React.useMemo(() => [
    { id: "light-1", name: "Key Practical Fixture", x: Math.round(roomX + roomW * 0.5), y: roomY + 18, type: "practical", color: "#06b6d4" },
    { id: "light-2", name: "Fill Key Panel", x: roomX + 170, y: Math.round(roomY + roomH * 0.38), type: "key", color: "#e2e8f0" },
    { id: "light-3", name: "Ambient Edge Spill", x: roomX + roomW - 65, y: roomY + roomH - 25, type: "ambient", color: "#f59e0b" },
  ], [roomX, roomY, roomW, roomH]);

  return (
    <div className={`flex flex-col rounded-xl border border-border bg-card p-4 space-y-4 ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-accent" />
            <SlateLabel>Director&apos;s 2D Floor Plan &amp; Spatial Blocking</SlateLabel>
          </div>
          <span className="text-xs font-semibold text-foreground">{sceneTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRunLocationScout}
            disabled={isScouting}
            className="text-xs h-7 gap-1.5 bg-blue-600 hover:bg-blue-500 text-white"
          >
            {isScouting ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            <span>{isScouting ? "Scouting..." : "AI Location Scout (Gemini 3.7)"}</span>
          </Button>
          <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent text-[10px]">
            3-Cam Setup · 2.39:1 Scope
          </Badge>
        </div>
      </div>

      {/* SVG Architectural Floor Plan Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-[280px] sm:h-[310px] rounded-lg border border-border/80 bg-background/90 overflow-hidden select-none"
      >
        <svg
          className="w-full h-full block"
          viewBox={`0 0 ${svgW} ${svgH}`}
        >
          <defs>
            <pattern id="floor-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
            {/* Camera FOV Gradients */}
            {cameras.map((cam) => (
              <radialGradient key={`fov-${cam.id}`} id={`fov-grad-${cam.id}`}>
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
              </radialGradient>
            ))}
          </defs>

          {/* Grid Background */}
          <rect width={svgW} height={svgH} fill="url(#floor-grid)" />

          {/* Architectural Perimeter Walls */}
          <rect
            x={roomX}
            y={roomY}
            width={roomW}
            height={roomH}
            fill="none"
            stroke="var(--border)"
            strokeWidth="2.5"
            rx="6"
          />

          {/* Blueprint Corner Accents */}
          <line x1={roomX} y1={roomY - 8} x2={roomX} y2={roomY + 12} stroke="var(--muted-foreground)" strokeWidth="1" opacity="0.4" />
          <line x1={roomX + roomW} y1={roomY - 8} x2={roomX + roomW} y2={roomY + 12} stroke="var(--muted-foreground)" strokeWidth="1" opacity="0.4" />
          <text
            x={roomX + 10}
            y={roomY - 4}
            fill="var(--muted-foreground)"
            fontSize="9.5"
            fontFamily="ui-monospace, monospace"
            opacity="0.6"
          >
            {scoutedData?.location_aesthetic
              ? `SETTING: ${scoutedData.location_aesthetic.slice(0, 42).toUpperCase()}`
              : `${(sceneTitle || "SOUNDSTAGE").toUpperCase()} · STAGE PERIMETER`}
          </text>

          {/* Security door / corridor opening */}
          <line
            x1={roomX + roomW - 100}
            y1={roomY + roomH}
            x2={roomX + roomW - 20}
            y2={roomY + roomH}
            stroke="var(--accent)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <text
            x={roomX + roomW - 60}
            y={roomY + roomH + 16}
            fill="var(--muted-foreground)"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            textAnchor="middle"
          >
            STAGE ACCESS / INGRESS
          </text>

          {/* Stage Furniture */}
          <rect
            x={roomX + 35}
            y={roomY + 30}
            width="80"
            height={roomH - 60}
            fill="var(--secondary)"
            stroke="var(--border)"
            strokeWidth="1.2"
            rx="3"
          />
          <text
            x={roomX + 50}
            y={roomY + roomH / 2}
            fill="var(--muted-foreground)"
            fontSize="9.5"
            fontFamily="ui-monospace, monospace"
            transform={`rotate(-90 ${roomX + 50} ${roomY + roomH / 2})`}
            letterSpacing="1"
            textAnchor="middle"
          >
            PRACTICAL SET RIG A
          </text>

          {/* Timer / Control Console */}
          <rect
            x={roomX + roomW - 150}
            y={roomY + 25}
            width="125"
            height="34"
            fill="var(--secondary)"
            stroke="var(--border)"
            strokeWidth="1.2"
            rx="3"
          />
          <text
            x={roomX + roomW - 87.5}
            y={roomY + 46}
            fill="var(--muted-foreground)"
            fontSize="9.5"
            fontFamily="ui-monospace, monospace"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            PRIMARY PROP / CONSOLE
          </text>

          {/* Practical Lights */}
          {lights.map((l) => (
            <g key={l.id}>
              <circle cx={l.x} cy={l.y} r="18" fill={l.color} opacity="0.12" />
              <circle cx={l.x} cy={l.y} r="4.5" fill={l.color} />
              <text
                x={l.x}
                y={l.y + 16}
                fill="var(--muted-foreground)"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                {l.name}
              </text>
            </g>
          ))}

          {/* Camera Sightlines & FOV Cones */}
          {cameras.map((cam) => {
            const isSelected = selectedCam === cam.id;
            return (
              <g key={cam.id} className="transition-opacity">
                <line
                  x1={cam.x}
                  y1={cam.y}
                  x2={cam.targetX}
                  y2={cam.targetY}
                  stroke={isSelected ? "var(--accent)" : "var(--border)"}
                  strokeWidth={isSelected ? "1.5" : "1"}
                  strokeDasharray={isSelected ? "none" : "4 4"}
                  opacity={isSelected ? 1 : 0.45}
                />
                <circle
                  cx={cam.x}
                  cy={cam.y}
                  r={isSelected ? 9 : 7}
                  fill={isSelected ? "var(--accent)" : "var(--secondary)"}
                  stroke="var(--border)"
                  strokeWidth="1.5"
                  className="cursor-pointer"
                  onClick={() => setSelectedCam(cam.id)}
                />
                <text
                  x={cam.x}
                  y={cam.y + 20}
                  fill={isSelected ? "var(--accent)" : "var(--muted-foreground)"}
                  fontSize="9.5"
                  fontFamily="ui-monospace, monospace"
                  fontWeight={isSelected ? "bold" : "normal"}
                  textAnchor="middle"
                >
                  {cam.name.split("·")[0].trim()}
                </text>
              </g>
            );
          })}

          {/* Character Tokens & Sightline Cones */}
          {charPositions.map((char) => (
            <g key={char.name}>
              {/* Sightline ray */}
              <line
                x1={char.x}
                y1={char.y}
                x2={char.x + Math.cos((char.angle * Math.PI) / 180) * 40}
                y2={char.y + Math.sin((char.angle * Math.PI) / 180) * 40}
                stroke={char.color}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.85"
              />
              <circle
                cx={char.x}
                cy={char.y}
                r="12"
                fill={char.color}
                stroke="var(--background)"
                strokeWidth="2.5"
                className="shadow-sm"
              />
              <text
                x={char.x}
                y={char.y + 3.5}
                fill="var(--background)"
                fontSize="9.5"
                fontWeight="bold"
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                {char.name[0]}
              </text>
              <text
                x={char.x}
                y={char.y + 22}
                fill="var(--foreground)"
                fontSize="9.5"
                fontWeight="600"
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                {char.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Camera Selection & Blocking Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {cameras.map((cam) => {
          const isSelected = selectedCam === cam.id;
          return (
            <button
              key={cam.id}
              type="button"
              onClick={() => setSelectedCam(cam.id)}
              className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                isSelected
                  ? "border-accent bg-accent/10 shadow-sm"
                  : "border-border bg-secondary/20 hover:bg-secondary/40 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-semibold ${isSelected ? "text-accent" : "text-foreground"}`}>
                  {cam.name}
                </span>
                <Camera className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{cam.lens}</p>
            </button>
          );
        })}
      </div>

      {/* Active Camera Details & Send to Veo Bridge */}
      {(() => {
        const activeCam = cameras.find((c) => c.id === selectedCam) || cameras[0];
        const defaultMotion =
          selectedCam === "cam-a"
            ? "35mm Anamorphic Tracking Shot"
            : selectedCam === "cam-b"
            ? "Slow Cinematic Dolly In"
            : "Dutch Angle Push-In";
        return (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-card/70 p-2.5 rounded-lg border border-border text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent font-mono text-[10px]">
                Active Rig: {activeCam.name}
              </Badge>
              <span className="text-muted-foreground font-mono text-[11px]">
                {activeCam.lens} · {activeCam.fov}° FOV
              </span>
            </div>
            {onSendToVeo && (
              <Button
                size="sm"
                onClick={() =>
                  onSendToVeo({
                    camName: activeCam.name,
                    lens: activeCam.lens,
                    motion: defaultMotion,
                    promptNote: `Shot framed via ${activeCam.name} (${activeCam.lens}, ${activeCam.fov}° FOV) with ${defaultMotion}, focused on ${characters[0]?.name || "Lead Subject"}.`,
                  })
                }
                className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs gap-1.5 cursor-pointer shadow-xs"
              >
                <Film className="h-3.5 w-3.5" />
                <span>Send Staging to Veo Prompt ↗</span>
              </Button>
            )}
          </div>
        );
      })()}

      {/* Blocking Summary Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground bg-secondary/30 p-2.5 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-accent inline-block" />
            Subject Key
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            Counter-Weight
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-400 inline-block" />
            Cyan Practical
          </span>
        </div>
        <span className="font-mono text-[10px]">Overhead 2D Blocking Engine</span>
      </div>

      {/* AI Location Scout Aesthetic & Precedent Comps */}
      {scoutedData && (
        <div className="rounded-lg border border-border bg-secondary/15 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5 text-accent" />
              Hollywood Precedent Comps &amp; Lens Packages
            </span>
            <Badge variant="outline" className="border-accent/40 text-accent text-[9px] font-mono">
              Gemini 3.7 Hollywood Scout
            </Badge>
          </div>

          {scoutedData.location_aesthetic && (
            <div className="rounded border border-border/60 bg-background/70 p-2.5 text-xs text-foreground/90 leading-relaxed">
              <span className="font-mono uppercase text-[10px] text-accent block mb-0.5 font-semibold">
                Scouted Architectural Aesthetic:
              </span>
              {scoutedData.location_aesthetic}
            </div>
          )}

          {scoutedData.practical_lighting && (
            <div className="rounded border border-border/60 bg-background/70 p-2.5 text-xs text-foreground/90 leading-relaxed">
              <span className="font-mono uppercase text-[10px] text-accent block mb-0.5 font-semibold">
                Practical Lighting Scheme:
              </span>
              {scoutedData.practical_lighting}
            </div>
          )}

          {scoutedData.film_precedents && scoutedData.film_precedents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {scoutedData.film_precedents.map((comp, idx) => (
                <div key={idx} className="rounded border border-border/50 bg-secondary/30 p-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{comp.film}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{comp.director}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{comp.scene_comparison}</p>
                  <div className="text-[10px] font-mono text-accent/90 pt-1 border-t border-border/40">
                    Technique: {comp.lens_and_blocking_technique}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
