"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Camera, Lightbulb, User, Eye } from "lucide-react";

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

interface FloorPlanViewProps {
  sceneTitle: string;
  characters?: Array<{ name: string; archetype?: string }>;
  className?: string;
}

export function FloorPlanView({
  sceneTitle,
  characters = [],
  className,
}: FloorPlanViewProps) {
  const [selectedCam, setSelectedCam] = React.useState<string>("cam-a");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 1000, height: 300 });

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
        name: characters[0]?.name || "Marcus",
        role: "Primary Subject (Kneeling)",
        x: Math.round(roomX + roomW * 0.4),
        y: Math.round(roomY + roomH * 0.55),
        angle: 45,
        color: "var(--accent)",
      },
      {
        name: characters[1]?.name || "Elena",
        role: "Foreground Counter-Weight",
        x: Math.round(roomX + roomW * 0.65),
        y: Math.round(roomY + roomH * 0.42),
        angle: 210,
        color: "#10b981",
      },
    ];
    if (characters[2]) {
      list.push({
        name: characters[2].name,
        role: "Perimeter Lookout",
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
      lens: "35mm T1.5 Anamorphic",
      x: Math.round(roomX + roomW * 0.2),
      y: Math.round(roomY + roomH * 0.82),
      targetX: Math.round(roomX + roomW * 0.52),
      targetY: Math.round(roomY + roomH * 0.48),
      fov: 60,
    },
    {
      id: "cam-b",
      name: "Cam B · Over-The-Shoulder",
      lens: "50mm T1.3 Prime",
      x: Math.round(roomX + roomW * 0.78),
      y: Math.round(roomY + roomH * 0.3),
      targetX: Math.round(roomX + roomW * 0.4),
      targetY: Math.round(roomY + roomH * 0.55),
      fov: 40,
    },
    {
      id: "cam-c",
      name: "Cam C · Intimate Close-Up",
      lens: "85mm T1.4 Portrait",
      x: Math.round(roomX + roomW * 0.3),
      y: Math.round(roomY + roomH * 0.66),
      targetX: Math.round(roomX + roomW * 0.4),
      targetY: Math.round(roomY + roomH * 0.55),
      fov: 30,
    },
  ], [roomX, roomY, roomW, roomH]);

  const lights: PracticalLight[] = React.useMemo(() => [
    { id: "light-1", name: "Cyan Emergency Strip", x: Math.round(roomX + roomW * 0.5), y: roomY + 18, type: "practical", color: "#06b6d4" },
    { id: "light-2", name: "Key Fill Panel", x: roomX + 170, y: Math.round(roomY + roomH * 0.38), type: "key", color: "#e2e8f0" },
    { id: "light-3", name: "Corridor Spill", x: roomX + roomW - 65, y: roomY + roomH - 25, type: "ambient", color: "#f59e0b" },
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
        <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent text-[10px]">
          3-Cam Setup · 2.39:1 Scope
        </Badge>
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
            SEC-04 · INNER VAULT PERIMETER
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
            CORRIDOR ACCESS
          </text>

          {/* Stage Furniture / Vault Safety Deposit Boxes */}
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
            VAULT DEPOSIT BOXES
          </text>

          {/* Timer Console */}
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
            TIMER CONSOLE
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
    </div>
  );
}
