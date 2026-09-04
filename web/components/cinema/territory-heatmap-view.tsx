"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Globe2, DollarSign, BarChart3, Database, Award } from "lucide-react";

interface Territory {
  code: string;
  name: string;
  share: number; // percentage
  estimatedRevenue: string;
  ratingProfile: string;
  color: string;
}

interface PrecedentFilm {
  title: string;
  year: number;
  genre: string;
  budget: string;
  boxOffice: string;
  asymmetryScore: number;
  retention: string;
}

interface TerritoryHeatmapViewProps {
  projectTitle: string;
  genre?: string;
  className?: string;
}

export function TerritoryHeatmapView({
  projectTitle,
  genre = "Heist / Crime Thriller",
  className,
}: TerritoryHeatmapViewProps) {
  const territories: Territory[] = [
    {
      code: "NA",
      name: "North America (Domestic)",
      share: 42,
      estimatedRevenue: "$48.5M",
      ratingProfile: "R-Rated Theatrical / High Urban Core",
      color: "var(--accent)",
    },
    {
      code: "EMEA",
      name: "Europe & Middle East",
      share: 31,
      estimatedRevenue: "$35.8M",
      ratingProfile: "Strong French & UK Crime Thriller indexing",
      color: "#10b981",
    },
    {
      code: "APAC",
      name: "Asia-Pacific",
      share: 21,
      estimatedRevenue: "$24.2M",
      ratingProfile: "High South Korea & Japan Neo-Noir Affinity",
      color: "#06b6d4",
    },
    {
      code: "LATAM",
      name: "Latin America",
      share: 6,
      estimatedRevenue: "$6.9M",
      ratingProfile: "Streaming / Secondary Window Driven",
      color: "#f59e0b",
    },
  ];

  const [livePrecedents, setLivePrecedents] = React.useState<Array<{
    historical_reference: string;
    trope: string;
    tension_level: number;
    commercial_territory: string;
    audience_retention_pct: number;
    precedent_example: string;
  }>>([]);

  React.useEffect(() => {
    async function loadPrecedents() {
      try {
        const res = await fetch(`/api/precedents`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLivePrecedents(data);
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadPrecedents();
  }, [genre]);

  return (
    <div className={`flex flex-col rounded-xl border border-border bg-card p-4 space-y-4 ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-accent" />
            <SlateLabel>Global Territory Heatmap &amp; Box Office Intelligence</SlateLabel>
          </div>
          <span className="text-xs text-muted-foreground">
            ClickHouse precedent distribution &amp; audience market projection
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground bg-secondary/40 px-2 py-1 rounded border border-border">
          <Database className="h-3 w-3 text-accent" />
          <span>cinematic_precedents</span>
        </div>
      </div>

      {/* Global Distribution Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {territories.map((t) => (
          <div
            key={t.code}
            className="flex flex-col justify-between p-3 rounded-lg border border-border/80 bg-secondary/20 hover:bg-secondary/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-bold text-foreground">{t.code}</span>
              <span className="font-mono text-xs font-semibold" style={{ color: t.color }}>
                {t.share}%
              </span>
            </div>
            <div className="mt-1">
              <span className="text-sm font-bold font-mono text-foreground">{t.estimatedRevenue}</span>
              <p className="text-[10px] text-muted-foreground line-clamp-1">{t.name}</p>
            </div>
            {/* Mini visual bar */}
            <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${t.share}%`, backgroundColor: t.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Projected Box Office Model & Release Vector */}
      <div className="rounded-lg border border-border/70 bg-secondary/15 p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-foreground">Worldwide Cumulative Projection</span>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
              $115.4M Est.
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Targeting 2,600 domestic screens with fall theatrical window followed by day-45 premium streaming.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-semibold text-muted-foreground">Production ROI</span>
            <span className="text-sm font-bold font-mono text-emerald-400">3.4x Mult</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-right">
            <span className="block text-[10px] uppercase font-semibold text-muted-foreground">Audience Match</span>
            <span className="text-sm font-bold font-mono text-accent">96.2%</span>
          </div>
        </div>
      </div>

      {/* ClickHouse Precedent Benchmark Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-accent" />
            ClickHouse Comparative Precedents
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            WHERE genre LIKE &apos;%{genre.split("/")[0].trim()}%&apos;
          </span>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground font-mono text-[10px] uppercase">
              <tr>
                <th className="p-2.5 font-medium">Historical Precedent</th>
                <th className="p-2.5 font-medium">Core Cinematic Trope</th>
                <th className="p-2.5 font-medium">Target Territory</th>
                <th className="p-2.5 font-medium">Tension Index</th>
                <th className="p-2.5 font-medium text-right">Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono text-[11px]">
              {(livePrecedents.length > 0
                ? livePrecedents
                : [
                    {
                      historical_reference: "Reservoir Dogs (1992), The Italian Job (2003)",
                      trope: "Internal Mole / Private Deal",
                      tension_level: 10,
                      commercial_territory: "Global Theatrical",
                      audience_retention_pct: 96.8,
                    },
                    {
                      historical_reference: "Rififi (1955), Heat (1995)",
                      trope: "Missing Keys / Locked Vault",
                      tension_level: 9,
                      commercial_territory: "Domestic / Western Europe",
                      audience_retention_pct: 94.2,
                    },
                    {
                      historical_reference: "Chinatown (1974), Blade Runner (1982)",
                      trope: "Fabricated Evidence / Frame-up",
                      tension_level: 8,
                      commercial_territory: "Domestic Indie / North America",
                      audience_retention_pct: 88.0,
                    },
                    {
                      historical_reference: "Alien (1979), Solaris (1972)",
                      trope: "Quarantine Purge / Air-Breach",
                      tension_level: 9,
                      commercial_territory: "Global Streaming & Theatrical",
                      audience_retention_pct: 91.5,
                    },
                  ]
              ).map((film, idx) => (
                <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-2.5 font-sans font-medium text-foreground">
                    {film.historical_reference}
                  </td>
                  <td className="p-2.5 text-muted-foreground font-sans text-xs">{film.trope}</td>
                  <td className="p-2.5 text-emerald-400 font-sans">{film.commercial_territory}</td>
                  <td className="p-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-accent">{film.tension_level}/10</span>
                      <div className="w-12 bg-secondary h-1 rounded-full overflow-hidden">
                        <div className="bg-accent h-full" style={{ width: `${film.tension_level * 10}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-2.5 text-right text-foreground font-bold">{film.audience_retention_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
