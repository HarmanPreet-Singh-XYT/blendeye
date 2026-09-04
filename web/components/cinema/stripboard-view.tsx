"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Film, DollarSign, Calendar, Clock, Layers, Users } from "lucide-react";

interface StripboardScene {
  sceneNumber: string;
  setting: "INT" | "EXT";
  timeOfDay: "DAY" | "NIGHT";
  location: string;
  pages: string;
  castIds: number[];
  stuntsOrFX: string;
  shootDay: number;
}

interface StripboardViewProps {
  projectTitle: string;
  characters?: Array<{ name: string }>;
  className?: string;
  projectId?: string;
}

export function StripboardView({
  projectTitle,
  characters = [],
  className,
  projectId = "vault-heist-demo",
}: StripboardViewProps) {
  const strips: StripboardScene[] = React.useMemo(() => {
    if (projectId === "space-airlock-demo") {
      return [
        {
          sceneNumber: "01",
          setting: "INT",
          timeOfDay: "NIGHT",
          location: "ORBITAL CORRIDOR - BULKHEAD C",
          pages: "1 2/8",
          castIds: [1],
          stuntsOrFX: "Zero-G Wire Rig, Amber Strobe",
          shootDay: 1,
        },
        {
          sceneNumber: "02",
          setting: "INT",
          timeOfDay: "NIGHT",
          location: "MODULE 4 AIRLOCK CONSOLE",
          pages: "2 4/8",
          castIds: [1, 2],
          stuntsOrFX: "Depressurization Fog, Manual Purge Valve",
          shootDay: 1,
        },
        {
          sceneNumber: "03",
          setting: "INT",
          timeOfDay: "NIGHT",
          location: "HYDROPONICS QUARANTINE LAB",
          pages: "3 1/8",
          castIds: [2],
          stuntsOrFX: "Practical Specimen Pod, Shattered Acrylic",
          shootDay: 2,
        },
        {
          sceneNumber: "04",
          setting: "EXT",
          timeOfDay: "NIGHT",
          location: "OUTER HULL AIRLOCK GANTRY",
          pages: "2 0/8",
          castIds: [1, 2],
          stuntsOrFX: "Space Suit Rigging, Vacuum Purge Explosion",
          shootDay: 3,
        },
      ];
    }
    return [
      {
        sceneNumber: "01",
        setting: "EXT",
        timeOfDay: "NIGHT",
        location: "FINANCIAL DISTRICT SERVICE ALLEY",
        pages: "1 4/8",
        castIds: [1, 3],
        stuntsOrFX: "Wet Down Pavement, Getaway Van Idling",
        shootDay: 1,
      },
      {
        sceneNumber: "02",
        setting: "INT",
        timeOfDay: "NIGHT",
        location: "SUB-TERRAIN TUNNEL CONDUIT",
        pages: "2 1/8",
        castIds: [1, 2, 3],
        stuntsOrFX: "Thermal Torch Sparks, Atmospheric Smoke",
        shootDay: 1,
      },
      {
        sceneNumber: "04",
        setting: "INT",
        timeOfDay: "NIGHT",
        location: "UNDERGROUND PRIMARY VAULT",
        pages: "3 3/8",
        castIds: [1, 2],
        stuntsOrFX: "Hydraulic Locking Safe, Cyan Practical LEDs",
        shootDay: 2,
      },
      {
        sceneNumber: "05",
        setting: "INT",
        timeOfDay: "NIGHT",
        location: "VAULT ESCAPE FLUE & VENTILATION SHAFT",
        pages: "2 0/8",
        castIds: [1, 2],
        stuntsOrFX: "Cyan Gas FX, Stunt Fall, Gun Draw",
        shootDay: 2,
      },
      {
        sceneNumber: "06",
        setting: "EXT",
        timeOfDay: "DAY",
        location: "RIVER CANAL DRAINAGE EXIT",
        pages: "1 6/8",
        castIds: [2],
        stuntsOrFX: "Dawn Haze, Water Tank Footwork",
        shootDay: 3,
      },
    ];
  }, [projectId]);

  const castRoster = React.useMemo(() => {
    return characters.map((c, idx) => ({ id: idx + 1, name: c.name }));
  }, [characters]);

  // Strip styling based on INT/EXT and DAY/NIGHT
  const getStripColor = (setting: "INT" | "EXT", time: "DAY" | "NIGHT") => {
    if (setting === "INT" && time === "NIGHT") return "border-blue-500/50 bg-blue-950/20 text-blue-300";
    if (setting === "INT" && time === "DAY") return "border-slate-400/50 bg-slate-900/30 text-slate-200";
    if (setting === "EXT" && time === "DAY") return "border-amber-500/50 bg-amber-950/20 text-amber-300";
    return "border-emerald-500/50 bg-emerald-950/20 text-emerald-300";
  };

  return (
    <div className={`flex flex-col rounded-xl border border-border bg-card p-4 space-y-4 ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent" />
            <SlateLabel>Production Stripboard &amp; Shooting Logistics</SlateLabel>
          </div>
          <span className="text-xs text-muted-foreground">{projectTitle} · Daily Call &amp; Strip Schedule</span>
        </div>
        <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent text-[10px]">
          3 Shoot Days · 11 2/8 Total Pages
        </Badge>
      </div>

      {/* Production KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-lg border border-border bg-secondary/20 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold">Estimated Budget</span>
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-bold font-mono text-foreground">$14.5M</div>
          <span className="text-[10px] text-muted-foreground block">Mid-tier studio package</span>
        </div>

        <div className="rounded-lg border border-border bg-secondary/20 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold">Shoot Schedule</span>
            <Calendar className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="text-base font-bold font-mono text-foreground">22 Days</div>
          <span className="text-[10px] text-muted-foreground block">Principal photography</span>
        </div>

        <div className="rounded-lg border border-border bg-secondary/20 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold">Daily Pace</span>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-base font-bold font-mono text-foreground">3.8 Pgs/Day</div>
          <span className="text-[10px] text-muted-foreground block">Heavy dialogue / tight setups</span>
        </div>

        <div className="rounded-lg border border-border bg-secondary/20 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold">Cast Calls</span>
            <Users className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-base font-bold font-mono text-foreground">{characters.length} Principals</div>
          <span className="text-[10px] text-muted-foreground block">High subtext interrogation</span>
        </div>
      </div>

      {/* Hollywood Production Stripboard Rows */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5 text-accent" />
            Shooting Strips (Order of Production)
          </span>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-blue-500 inline-block" /> INT NIGHT
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-amber-500 inline-block" /> EXT DAY
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-slate-400 inline-block" /> INT DAY
            </span>
          </div>
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          {strips.map((strip, idx) => (
            <div
              key={idx}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 rounded-lg border transition-all hover:translate-x-0.5 ${getStripColor(
                strip.setting,
                strip.timeOfDay
              )}`}
            >
              {/* Scene Number & Type Header */}
              <div className="flex items-center gap-2.5 min-w-[160px]">
                <span className="font-bold text-sm bg-background/60 px-2 py-0.5 rounded border border-border/40">
                  SC {strip.sceneNumber}
                </span>
                <span className="text-[10px] uppercase font-semibold">
                  {strip.setting}. {strip.timeOfDay}
                </span>
              </div>

              {/* Location & Scene Description */}
              <div className="flex-1 font-sans font-medium text-xs px-2 truncate">
                {strip.location}
              </div>

              {/* Page count, Cast IDs, and FX */}
              <div className="flex items-center gap-3 shrink-0 text-[11px] mt-1 sm:mt-0">
                <span className="text-muted-foreground bg-background/40 px-1.5 py-0.5 rounded border border-border/30">
                  {strip.pages} pgs
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] uppercase text-muted-foreground">Cast:</span>
                  {strip.castIds.map((cid) => (
                    <span
                      key={cid}
                      className="h-4 w-4 rounded-full bg-accent/30 text-accent font-bold text-[10px] flex items-center justify-center border border-accent/40"
                    >
                      {cid}
                    </span>
                  ))}
                </div>
                <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-border/60 bg-background/30 text-muted-foreground">
                  Day {strip.shootDay}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cast Key Index */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-secondary/30 p-2.5 rounded-lg border border-border">
        <span className="text-[10px] uppercase font-bold text-muted-foreground">Cast Breakdown:</span>
        {castRoster.map((actor) => (
          <span key={actor.id} className="flex items-center gap-1 font-mono text-[11px] text-foreground">
            <span className="h-3.5 w-3.5 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
              {actor.id}
            </span>
            {actor.name}
          </span>
        ))}
      </div>
    </div>
  );
}
