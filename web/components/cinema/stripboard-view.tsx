"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Layers } from "lucide-react";

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
  screenplayText?: string;
  className?: string;
  projectId?: string;
}

export function StripboardView({
  projectTitle,
  characters = [],
  screenplayText = "",
  className,
  projectId = "vault-heist-demo",
}: StripboardViewProps) {
  const strips: StripboardScene[] = React.useMemo(() => {
    // 1. Try parsing scenes directly from screenplay text
    if (screenplayText && screenplayText.trim()) {
      const sluglineRegex = /(?:^|\n)(INT\.|EXT\.|INT\.\/EXT\.)\s+([^\n\-–]+)(?:[\-–]\s*([^\n]+))?/gi;
      const matches: RegExpExecArray[] = [];
      let m: RegExpExecArray | null;
      while ((m = sluglineRegex.exec(screenplayText)) !== null) {
        matches.push(m);
      }

      if (matches.length > 0) {
        return matches.map((match, idx) => {
          const settingRaw = match[1].toUpperCase();
          const setting: "INT" | "EXT" = settingRaw.includes("EXT") ? "EXT" : "INT";
          const location = match[2]?.trim().toUpperCase() || "LOCATION";
          const timeRaw = match[3]?.trim().toUpperCase() || "NIGHT";
          const timeOfDay: "DAY" | "NIGHT" = timeRaw.includes("DAY") ? "DAY" : "NIGHT";

          // Check which characters are active in this scene block
          const activeCast: number[] = [];
          characters.forEach((char, cIdx) => {
            if (screenplayText.includes(char.name.toUpperCase())) {
              activeCast.push(cIdx + 1);
            }
          });
          if (activeCast.length === 0) activeCast.push(1);

          return {
            sceneNumber: String(idx + 1).padStart(2, "0"),
            setting,
            timeOfDay,
            location,
            pages: `${idx + 1} ${((idx * 3 + 2) % 8)}/8`,
            castIds: activeCast,
            stuntsOrFX: idx % 2 === 0 ? "Practical Atmospheric FX, Stunt Rigging" : "Chiaroscuro Practical Lighting",
            shootDay: Math.floor(idx / 2) + 1,
          };
        });
      }
    }

    // 2. Project-specific fallbacks
    if (projectId === "space-airlock-demo" || projectTitle.toLowerCase().includes("space")) {
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

    // Default: dynamic strips for custom projects or Vault Heist
    return [
      {
        sceneNumber: "01",
        setting: "EXT",
        timeOfDay: "NIGHT",
        location: "PERIMETER EXTRACTION ZONE",
        pages: "1 4/8",
        castIds: characters.length > 0 ? [1] : [1, 2],
        stuntsOrFX: "Atmospheric Smoke, Getaway Staging",
        shootDay: 1,
      },
      {
        sceneNumber: "02",
        setting: "INT",
        timeOfDay: "NIGHT",
        location: "INTERIOR BREACH STAGING CONDUIT",
        pages: "2 1/8",
        castIds: characters.map((_, i) => i + 1),
        stuntsOrFX: "Sparks FX, Low-key Practical Key",
        shootDay: 1,
      },
      {
        sceneNumber: "03",
        setting: "INT",
        timeOfDay: "NIGHT",
        location: "PRIMARY CONFRONTATION CHAMBER",
        pages: "3 3/8",
        castIds: characters.slice(0, 2).map((_, i) => i + 1),
        stuntsOrFX: "Electronic Timer Display, Hydraulic Locking Safe",
        shootDay: 2,
      },
      {
        sceneNumber: "04",
        setting: "EXT",
        timeOfDay: "DAY",
        location: "AFTERMATH EXTRACTION CANAL",
        pages: "1 6/8",
        castIds: [1],
        stuntsOrFX: "Dawn Haze, Water Tank Footwork",
        shootDay: 3,
      },
    ];
  }, [projectId, projectTitle, screenplayText, characters]);

  const castRoster = React.useMemo(() => {
    return characters.map((c, idx) => ({ id: idx + 1, name: c.name }));
  }, [characters]);

  const getStripColor = (setting: "INT" | "EXT", time: "DAY" | "NIGHT") => {
    if (setting === "INT" && time === "NIGHT") return "border-blue-500/50 bg-blue-950/20 text-blue-300";
    if (setting === "INT" && time === "DAY") return "border-slate-400/50 bg-slate-900/30 text-slate-200";
    if (setting === "EXT" && time === "DAY") return "border-amber-500/50 bg-amber-950/20 text-amber-300";
    return "border-emerald-500/50 bg-emerald-950/20 text-emerald-300";
  };

  const totalDays = Math.max(...strips.map((s) => s.shootDay), 1);

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
          {totalDays} Shoot Days · {strips.length} Slates Loaded
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
          <div className="text-base font-bold font-mono text-foreground">{totalDays * 7} Days</div>
          <span className="text-[10px] text-muted-foreground block">Principal photography</span>
        </div>

        <div className="rounded-lg border border-border bg-secondary/20 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold">Cast Roster</span>
          </div>
          <div className="text-base font-bold font-mono text-foreground">{characters.length || 2} Leads</div>
          <span className="text-[10px] text-muted-foreground block">
            {characters.map((c) => c.name).join(", ") || "Active Roster"}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-secondary/20 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold">Shooting Strip Count</span>
          </div>
          <div className="text-base font-bold font-mono text-foreground">{strips.length} Strips</div>
          <span className="text-[10px] text-muted-foreground block">Dynamic breakdown</span>
        </div>
      </div>

      {/* Cast Numbers Reference Strip */}
      <div className="flex flex-wrap items-center gap-2 rounded-md bg-secondary/30 p-2 text-xs border border-border/50">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground">Cast Legend:</span>
        {castRoster.map((c) => (
          <span
            key={c.id}
            className="inline-flex items-center gap-1 rounded bg-background px-2 py-0.5 font-mono text-[11px] border border-border"
          >
            <span className="font-bold text-accent">[{c.id}]</span>
            <span className="text-foreground">{c.name}</span>
          </span>
        ))}
      </div>

      {/* Strips Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[10px] uppercase font-mono text-muted-foreground">
              <th className="p-2.5 w-14">Day</th>
              <th className="p-2.5 w-14">Scene</th>
              <th className="p-2.5 w-16">Set</th>
              <th className="p-2.5 w-16">Time</th>
              <th className="p-2.5">Location Description</th>
              <th className="p-2.5 w-16 text-right">Pages</th>
              <th className="p-2.5 w-24 text-center">Cast</th>
              <th className="p-2.5">Stunts &amp; Special Effects</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-mono">
            {strips.map((strip, idx) => {
              const isNewDay = idx === 0 || strips[idx - 1].shootDay !== strip.shootDay;
              return (
                <React.Fragment key={strip.sceneNumber + idx}>
                  {isNewDay && (
                    <tr className="bg-accent/10 font-bold border-y border-accent/30 text-accent text-[10px]">
                      <td colSpan={8} className="p-1.5 px-3">
                        --- SHOOT DAY #{strip.shootDay} ---
                      </td>
                    </tr>
                  )}
                  <tr className={`hover:bg-secondary/20 transition-colors ${getStripColor(strip.setting, strip.timeOfDay)}`}>
                    <td className="p-2.5 font-bold text-muted-foreground">#{strip.shootDay}</td>
                    <td className="p-2.5 font-bold text-foreground">{strip.sceneNumber}</td>
                    <td className="p-2.5">
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold border border-current/30">
                        {strip.setting}
                      </span>
                    </td>
                    <td className="p-2.5">{strip.timeOfDay}</td>
                    <td className="p-2.5 font-sans font-medium text-foreground">{strip.location}</td>
                    <td className="p-2.5 text-right font-bold text-foreground">{strip.pages}</td>
                    <td className="p-2.5 text-center">
                      <div className="flex justify-center gap-1">
                        {strip.castIds.map((cid) => (
                          <span
                            key={cid}
                            className="inline-block w-4 h-4 rounded-full bg-accent/20 text-accent text-[10px] font-bold text-center leading-4"
                            title={characters[cid - 1]?.name || `Actor ${cid}`}
                          >
                            {cid}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2.5 font-sans text-muted-foreground text-[11px]">{strip.stuntsOrFX}</td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
