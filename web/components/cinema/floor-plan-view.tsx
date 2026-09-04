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

  // Dynamic coordinates based on scene characters
  const charPositions: FloorPlanCharacter[] = React.useMemo(() => {
    const list: FloorPlanCharacter[] = [
      {
        name: characters[0]?.name || "Marcus",
        role: "Primary Subject (Kneeling)",
        x: 180,
        y: 160,
        angle: 45,
        color: "var(--accent)",
      },
      {
        name: characters[1]?.name || "Elena",
        role: "Foreground Counter-Weight",
        x: 320,
        y: 120,
        angle: 210,
        color: "#10b981",
      },
    ];
    if (characters[2]) {
      list.push({
        name: characters[2].name,
        role: "Perimeter Lookout",
        x: 420,
        y: 220,
        angle: 180,
        color: "#f59e0b",
      });
    }
    return list;
  }, [characters]);

  const cameras: CameraSetup[] = [
    {
      id: "cam-a",
      name: "Cam A · Wide Master",
      lens: "35mm T1.5 Anamorphic",
      x: 100,
      y: 240,
      targetX: 250,
      targetY: 140,
      fov: 60,
    },
    {
      id: "cam-b",
      name: "Cam B · Over-The-Shoulder",
      lens: "50mm T1.3 Prime",
      x: 350,
      y: 80,
      targetX: 180,
      targetY: 160,
      fov: 40,
    },
    {
      id: "cam-c",
      name: "Cam C · Intimate Close-Up",
      lens: "85mm T1.4 Portrait",
      x: 140,
      y: 190,
      targetX: 180,
      targetY: 160,
      fov: 30,
    },
  ];

  const lights: PracticalLight[] = [
    { id: "light-1", name: "Cyan Emergency Strip", x: 250, y: 30, type: "practical", color: "#06b6d4" },
    { id: "light-2", name: "Key Fill Panel", x: 80, y: 120, type: "key", color: "#e2e8f0" },
    { id: "light-3", name: "Corridor Spill", x: 440, y: 220, type: "ambient", color: "#f59e0b" },
  ];

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

      {/* SVG Architectural Floor Plan */}
      <div className="relative w-full aspect-[16/10] rounded-lg border border-border/80 bg-background/80 overflow-hidden select-none">
        {/* Architectural Grid */}
        <svg className="w-full h-full" viewBox="0 0 500 300">
          <defs>
            <pattern id="floor-grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.4" />
            </pattern>
            {/* Camera FOV Gradients */}
            {cameras.map((cam) => (
              <radialGradient key={`fov-${cam.id}`} id={`fov-grad-${cam.id}`}>
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
              </radialGradient>
            ))}
          </defs>

          {/* Grid Background */}
          <rect width="500" height="300" fill="url(#floor-grid)" />

          {/* Architectural Walls */}
          <rect x="30" y="20" width="440" height="260" fill="none" stroke="var(--border)" strokeWidth="2.5" rx="4" />
          {/* Security door / corridor opening */}
          <line x1="430" y1="280" x2="470" y2="280" stroke="var(--accent)" strokeWidth="4" />
          <text x="410" y="295" fill="var(--muted-foreground)" fontSize="9" fontFamily="monospace">
            DOOR / CORRIDOR
          </text>

          {/* Stage Furniture / Vault Safety Deposit Boxes */}
          <rect x="60" y="60" width="60" height="150" fill="var(--secondary)" stroke="var(--border)" strokeWidth="1" rx="2" />
          <text x="70" y="140" fill="var(--muted-foreground)" fontSize="8" fontFamily="monospace" transform="rotate(-90 70 140)">
            VAULT DEPOSIT BOXES
          </text>

          {/* Timer Console */}
          <rect x="310" y="50" width="70" height="25" fill="var(--secondary)" stroke="var(--border)" strokeWidth="1" rx="2" />
          <text x="320" y="66" fill="var(--muted-foreground)" fontSize="8" fontFamily="monospace">
            TIMER CONSOLE
          </text>

          {/* Practical Lights */}
          {lights.map((l) => (
            <g key={l.id}>
              <circle cx={l.x} cy={l.y} r="18" fill={l.color} opacity="0.12" />
              <circle cx={l.x} cy={l.y} r="5" fill={l.color} />
              <text x={l.x - 15} y={l.y - 8} fill="var(--muted-foreground)" fontSize="7" fontFamily="monospace">
                {l.name}
              </text>
            </g>
          ))}

          {/* Camera Sightlines & FOV Cones */}
          {cameras.map((cam) => {
            const isSelected = selectedCam === cam.id;
            // Draw sightline ray
            return (
              <g key={cam.id} className="transition-opacity">
                <line
                  x1={cam.x}
                  y1={cam.y}
                  x2={cam.targetX}
                  y2={cam.targetY}
                  stroke={isSelected ? "var(--accent)" : "var(--border)"}
                  strokeWidth={isSelected ? "1.5" : "0.75"}
                  strokeDasharray={isSelected ? "none" : "3 3"}
                  opacity={isSelected ? 1 : 0.4}
                />
                <circle
                  cx={cam.x}
                  cy={cam.y}
                  r={isSelected ? 8 : 6}
                  fill={isSelected ? "var(--accent)" : "var(--secondary)"}
                  stroke="var(--border)"
                  strokeWidth="1.5"
                  className="cursor-pointer"
                  onClick={() => setSelectedCam(cam.id)}
                />
                <text
                  x={cam.x - 18}
                  y={cam.y + 16}
                  fill={isSelected ? "var(--accent)" : "var(--muted-foreground)"}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight={isSelected ? "bold" : "normal"}
                >
                  {cam.name.split("·")[0]}
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
                x2={char.x + Math.cos((char.angle * Math.PI) / 180) * 35}
                y2={char.y + Math.sin((char.angle * Math.PI) / 180) * 35}
                stroke={char.color}
                strokeWidth="1.5"
                strokeDasharray="2 2"
                opacity="0.8"
              />
              <circle
                cx={char.x}
                cy={char.y}
                r="10"
                fill={char.color}
                stroke="var(--background)"
                strokeWidth="2"
                className="shadow"
              />
              <text
                x={char.x}
                y={char.y + 3}
                fill="var(--background)"
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
              >
                {char.name[0]}
              </text>
              <text
                x={char.x}
                y={char.y + 22}
                fill="var(--foreground)"
                fontSize="9"
                fontWeight="600"
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
