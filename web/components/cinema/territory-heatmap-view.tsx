"use client";

import * as React from "react";
import * as d3Geo from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import worldData from "world-atlas/countries-110m.json";

import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe2,
  Database,
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Sliders,
  Check,
  CheckCircle2,
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { notifyIfFallback } from "@/lib/fallback-notice";

interface MarketTerritoryPrediction {
  country_code: string;
  country_name: string;
  market_fit_score: number;
  commercial_appetite: string;
  cultural_friction: string;
  actionable_fix: string;
}

interface MarketPredictionData {
  overall_global_score?: number;
  territories?: MarketTerritoryPrediction[];
  clickhouse_query_executed?: string;
}

interface TerritoryHeatmapViewProps {
  projectTitle: string;
  genre?: string;
  logline?: string;
  targetTerritories?: string[];
  className?: string;
}

// ISO 3166-1 numeric ID -> alpha-2 code & standardized name
const NUMERIC_TO_ALPHA2: Record<string, { code: string; name: string }> = {
  "840": { code: "US", name: "United States" },
  "124": { code: "CA", name: "Canada" },
  "484": { code: "MX", name: "Mexico" },
  "076": { code: "BR", name: "Brazil" },
  "032": { code: "AR", name: "Argentina" },
  "152": { code: "CL", name: "Chile" },
  "170": { code: "CO", name: "Colombia" },
  "826": { code: "GB", name: "United Kingdom" },
  "276": { code: "DE", name: "Germany" },
  "250": { code: "FR", name: "France" },
  "380": { code: "IT", name: "Italy" },
  "724": { code: "ES", name: "Spain" },
  "528": { code: "NL", name: "Netherlands" },
  "752": { code: "SE", name: "Sweden" },
  "578": { code: "NO", name: "Norway" },
  "208": { code: "DK", name: "Denmark" },
  "246": { code: "FI", name: "Finland" },
  "616": { code: "PL", name: "Poland" },
  "040": { code: "AT", name: "Austria" },
  "756": { code: "CH", name: "Switzerland" },
  "056": { code: "BE", name: "Belgium" },
  "372": { code: "IE", name: "Ireland" },
  "620": { code: "PT", name: "Portugal" },
  "300": { code: "GR", name: "Greece" },
  "203": { code: "CZ", name: "Czechia" },
  "356": { code: "IN", name: "India" },
  "410": { code: "KR", name: "South Korea" },
  "392": { code: "JP", name: "Japan" },
  "036": { code: "AU", name: "Australia" },
  "554": { code: "NZ", name: "New Zealand" },
  "156": { code: "CN", name: "China" },
  "702": { code: "SG", name: "Singapore" },
  "764": { code: "TH", name: "Thailand" },
  "360": { code: "ID", name: "Indonesia" },
  "458": { code: "MY", name: "Malaysia" },
  "704": { code: "VN", name: "Vietnam" },
  "608": { code: "PH", name: "Philippines" },
  "586": { code: "PK", name: "Pakistan" },
  "050": { code: "BD", name: "Bangladesh" },
  "784": { code: "AE", name: "United Arab Emirates" },
  "682": { code: "SA", name: "Saudi Arabia" },
  "792": { code: "TR", name: "Turkey" },
  "376": { code: "IL", name: "Israel" },
  "818": { code: "EG", name: "Egypt" },
  "710": { code: "ZA", name: "South Africa" },
  "566": { code: "NG", name: "Nigeria" },
  "404": { code: "KE", name: "Kenya" },
  "504": { code: "MA", name: "Morocco" },
  "643": { code: "RU", name: "Russia" },
  "804": { code: "UA", name: "Ukraine" },
};

const NAME_TO_ALPHA2: Record<string, string> = {
  "united states of america": "US",
  "united states": "US",
  "canada": "CA",
  "mexico": "MX",
  "brazil": "BR",
  "argentina": "AR",
  "united kingdom": "GB",
  "germany": "DE",
  "france": "FR",
  "italy": "IT",
  "spain": "ES",
  "india": "IN",
  "south korea": "KR",
  "japan": "JP",
  "australia": "AU",
  "china": "CN",
  "new zealand": "NZ",
  "singapore": "SG",
  "indonesia": "ID",
  "philippines": "PH",
  "thailand": "TH",
  "vietnam": "VN",
  "malaysia": "MY",
  "united arab emirates": "AE",
  "saudi arabia": "SA",
  "turkey": "TR",
  "egypt": "EG",
  "south africa": "ZA",
  "nigeria": "NG",
  "kenya": "KE",
};

// Initial distribution data covering primary global theatrical circuits
const DEFAULT_TERRITORIES: MarketTerritoryPrediction[] = [
  {
    country_code: "US",
    country_name: "United States",
    market_fit_score: 85,
    commercial_appetite: "Strong domestic theatrical & streaming appetite for genre thrillers; high demand for contained high-concept stakes",
    cultural_friction: "Requires sharp 3-act pacing; audience drops off if midpoint lacks clear escalation or tangible ticking clock",
    actionable_fix: "Tighten Act 2 midpoint turnaround; escalate immediate physical consequences and clock urgency",
  },
  {
    country_code: "IN",
    country_name: "India",
    market_fit_score: 72,
    commercial_appetite: "Massive theatrical appetite for high-stakes action, heroic confrontation, and emotional gravitas",
    cultural_friction: "Pure cynical dialogue without emotional or family stakes underperforms in mass single-screens and multiplexes",
    actionable_fix: "Heighten personal/familial stakes, emphasize thematic musical score via Lyria, prepare regional dubs (Hindi/Tamil/Telugu)",
  },
  {
    country_code: "KR",
    country_name: "South Korea",
    market_fit_score: 82,
    commercial_appetite: "High commercial interest in psychological thrillers with intense moral ambiguity and complex character motivations",
    cultural_friction: "Western humor idioms need visual translation; audiences demand rapid dramatic irony and clever plot twists",
    actionable_fix: "Amplify dramatic irony and character betrayal reveals across timeline; tighten psychological cat-and-mouse tension",
  },
  {
    country_code: "DE",
    country_name: "Germany / Western Europe",
    market_fit_score: 76,
    commercial_appetite: "Consistent interest in tactical procedural realism, technical authenticity, and grounded mysteries",
    cultural_friction: "Skeptical of Hollywood plot contrivances and convenient physical coincidences; demands logical consistency",
    actionable_fix: "Ensure tactical logistics, electronic physical tools, and timeline mechanics hold up logically under scrutiny",
  },
  {
    country_code: "BR",
    country_name: "Latin America / Brazil",
    market_fit_score: 75,
    commercial_appetite: "Strong appetite for ensemble drama, loyalty tests, visceral rhythm, and kinetic pacing",
    cultural_friction: "Extended silent exposition risks streaming abandonment; requires warm character relational dynamics",
    actionable_fix: "Increase rhythm of physical confrontations, emphasize crew camaraderie, and prepare localized Portuguese dubs",
  },
  {
    country_code: "GB",
    country_name: "United Kingdom",
    market_fit_score: 84,
    commercial_appetite: "Robust theatrical appetite for gritty neo-noir, dry dramatic irony, and atmospheric tension",
    cultural_friction: "Heavy melodrama or unearned sentimentality is viewed skeptically by domestic critics and audiences",
    actionable_fix: "Maintain dry, underplayed character tension and atmospheric, rain-slicked visual palette",
  },
  {
    country_code: "JP",
    country_name: "Japan",
    market_fit_score: 79,
    commercial_appetite: "High affinity for stylish visual aesthetic, psychological depth, meticulous craft, and distinct character designs",
    cultural_friction: "Overtly aggressive confrontation styles can feel grating without clear honor/duty motivations",
    actionable_fix: "Ground character motivations in code of honor or personal obligation; craft distinct iconic visual silhouettes",
  },
  {
    country_code: "CA",
    country_name: "Canada",
    market_fit_score: 86,
    commercial_appetite: "Direct demographic alignment with North American theatrical circuit and premium format demand (IMAX/Dolby)",
    cultural_friction: "Minimal friction; genre conventions align cleanly with North American theatrical expectations",
    actionable_fix: "Emphasize widescreen visual scope and immersive Dolby Atmos sound design",
  },
  {
    country_code: "AU",
    country_name: "Australia",
    market_fit_score: 81,
    commercial_appetite: "Strong interest in visceral survival stakes, high-tension heist set pieces, and irreverent banter",
    cultural_friction: "Pompous exposition slows theatrical momentum; audience favors swift kinetic transitions",
    actionable_fix: "Keep narrative tempo crisp and let character dynamics express through high-pressure actions",
  },
  {
    country_code: "FR",
    country_name: "France",
    market_fit_score: 78,
    commercial_appetite: "Strong theatrical culture for auteur crime thrillers (polar genre), character psychology, and moral gray zones",
    cultural_friction: "Dislikes generic CGI action beats devoid of human stakes or thematic texture",
    actionable_fix: "Elevate thematic subtext and directorial aesthetic rhythm; emphasize nuanced performance beats",
  },
  {
    country_code: "MX",
    country_name: "Mexico",
    market_fit_score: 80,
    commercial_appetite: "Massive urban multiplex turnout for adrenaline-fueled thrillers with intense suspense and familial undercurrents",
    cultural_friction: "Cold, sterile technical jargon alienates broader demographics without emotional resonance",
    actionable_fix: "Infuse family or fraternal loyalty motives into Marcus and Teo shared backstory",
  },
  {
    country_code: "ES",
    country_name: "Spain",
    market_fit_score: 77,
    commercial_appetite: "Strong streaming & theatrical traction for heist masterminds and ticking-clock suspense",
    cultural_friction: "Predictable heist tropes receive harsh reception; demands clever deception mechanics",
    actionable_fix: "Layer multi-level sleight-of-hand into the vault breach plan",
  },
  {
    country_code: "IT",
    country_name: "Italy",
    market_fit_score: 74,
    commercial_appetite: "Appetite for stylish ensemble crime and high-stakes games of wits with operatic tension",
    cultural_friction: "Pacing lag in second act causes steep box office decay in second week",
    actionable_fix: "Deliver a show-stopping mid-film set piece to generate positive word-of-mouth",
  },
];

// Helper to resolve standard alpha-2 code and name from a GeoJSON feature
function getFeatureCountry(f: Feature<Geometry, { name?: string }>): { code: string; name: string } {
  const numericId = String(f.id ?? "");
  if (NUMERIC_TO_ALPHA2[numericId]) {
    return NUMERIC_TO_ALPHA2[numericId];
  }
  const rawName = f.properties?.name || "Territory";
  const norm = rawName.toLowerCase().trim();
  if (NAME_TO_ALPHA2[norm]) {
    return { code: NAME_TO_ALPHA2[norm], name: rawName };
  }
  const fallbackCode = norm.slice(0, 2).toUpperCase();
  return { code: fallbackCode, name: rawName };
}

// Generate dynamic dossier if user clicks any unlisted country on the world map
function generateTerritoryDossier(code: string, name: string): MarketTerritoryPrediction {
  return {
    country_code: code,
    country_name: name,
    market_fit_score: 73,
    commercial_appetite: `Emerging streaming audience with growing theatrical engagement for suspense, mystery, and high-concept crime thrillers.`,
    cultural_friction: `Dialogue idioms and localized cultural references require attentive translation and native sub/dub curation.`,
    actionable_fix: `Deploy localized subtitle track and partner with regional streaming platform distributor for synchronized windowing.`,
  };
}

// Key distribution hubs that display persistent centroid badge pins
const KEY_MARKET_HUBS = new Set(["US", "CA", "IN", "KR", "JP", "GB", "DE", "BR", "AU", "FR", "MX"]);

type RegionPreset = "world" | "asia" | "americas" | "europe";

const REGION_PRESETS: Record<RegionPreset, { label: string; x: number; y: number; scale: number }> = {
  world: { label: "World Overview", x: 0, y: 0, scale: 1 },
  asia: { label: "Asia-Pacific", x: -440, y: -70, scale: 1.65 },
  americas: { label: "Americas", x: 130, y: -40, scale: 1.5 },
  europe: { label: "Europe / EMEA", x: -220, y: 30, scale: 1.9 },
};

export function TerritoryHeatmapView({
  projectTitle,
  genre = "Heist / Crime Thriller",
  logline,
  targetTerritories = [],
  className,
}: TerritoryHeatmapViewProps) {
  const [isPredicting, setIsPredicting] = React.useState(false);
  const [predictionData, setPredictionData] = React.useState<MarketPredictionData | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = React.useState<string>(
    targetTerritories && targetTerritories.length > 0 ? targetTerritories[0] : "US"
  );
  const [hoveredCountry, setHoveredCountry] = React.useState<{
    code: string;
    name: string;
    score: number;
    boost: number;
    appetite: string;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    if (targetTerritories && targetTerritories.length > 0) {
      setSelectedCountryCode((prev) => (targetTerritories.includes(prev) ? prev : targetTerritories[0]));
    }
  }, [targetTerritories]);

  // Zoom & Pan state
  const [zoom, setZoom] = React.useState({ x: 0, y: 0, scale: 1 });
  const [activeRegion, setActiveRegion] = React.useState<RegionPreset>("world");
  const isDragging = React.useRef(false);
  const dragStart = React.useRef({ x: 0, y: 0 });
  const dragMoved = React.useRef(0);
  const mapContainerRef = React.useRef<HTMLDivElement>(null);

  // "What-If" Audience Metric Optimizer Levers
  const [optimizationLevers, setOptimizationLevers] = React.useState({
    familyStakes: false,
    lyriaScore: false,
    pacingTurnaround: false,
    moralAmbiguity: false,
    multilingualDub: false,
    proceduralRealism: false,
  });

  const handleToggleLever = (leverKey: keyof typeof optimizationLevers) => {
    setOptimizationLevers((prev) => ({ ...prev, [leverKey]: !prev[leverKey] }));
  };

  const handleRunMarketPredict = async () => {
    if (isPredicting) return;
    setIsPredicting(true);
    try {
      const res = await fetch("/api/market/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: genre || "Heist Thriller",
          logline: logline || projectTitle,
          target_territories: targetTerritories,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPredictionData(data);
        notifyIfFallback(data, "Market Prediction");
      } else {
        const detail = await res.text().catch(() => "");
        toast.add({
          title: "Market prediction failed",
          description: detail || `Request failed (${res.status}). Try again.`,
          type: "error",
        });
      }
    } catch (err) {
      console.error("Market predict error:", err);
      toast.add({
        title: "Market prediction failed",
        description: err instanceof Error ? err.message : "Could not reach the prediction backend.",
        type: "error",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  // Precompute GeoJSON features and projection paths using d3-geo
  const { pathGenerator, spherePath, graticulePath, countryFeatures } = React.useMemo(() => {
    const geojson = feature(
      worldData as unknown as Topology,
      (worldData as unknown as Topology).objects.countries
    ) as unknown as FeatureCollection<Geometry, { name: string }>;

    // Natural Earth 1 projection fitted to 960x480 coordinate space
    const projection = d3Geo.geoNaturalEarth1().fitSize([960, 480], geojson);
    const pathGen = d3Geo.geoPath().projection(projection);
    const sphere = pathGen({ type: "Sphere" }) || "";
    const graticule = pathGen(d3Geo.geoGraticule10()) || "";

    return {
      pathGenerator: pathGen,
      spherePath: sphere,
      graticulePath: graticule,
      countryFeatures: geojson.features,
    };
  }, []);

  // Merge backend prediction territories with default market list
  const baseTerritories: MarketTerritoryPrediction[] = React.useMemo(() => {
    if (!predictionData?.territories || predictionData.territories.length === 0) {
      return DEFAULT_TERRITORIES;
    }
    const map = new Map<string, MarketTerritoryPrediction>();
    DEFAULT_TERRITORIES.forEach((t) => map.set(t.country_code, t));
    predictionData.territories.forEach((t) => map.set(t.country_code, t));
    return Array.from(map.values());
  }, [predictionData]);

  // Compute live scores with "What-If" Optimization Levers
  const territoriesWithOptimization = React.useMemo(() => {
    return baseTerritories.map((t) => {
      let boost = 0;
      if (t.country_code === "IN") {
        if (optimizationLevers.familyStakes) boost += 8;
        if (optimizationLevers.lyriaScore) boost += 6;
        if (optimizationLevers.multilingualDub) boost += 9;
      } else if (t.country_code === "US" || t.country_code === "CA") {
        if (optimizationLevers.pacingTurnaround) boost += 9;
        if (optimizationLevers.moralAmbiguity) boost += 4;
        if (optimizationLevers.lyriaScore) boost += 3;
      } else if (t.country_code === "KR" || t.country_code === "JP") {
        if (optimizationLevers.moralAmbiguity) boost += 10;
        if (optimizationLevers.pacingTurnaround) boost += 4;
      } else if (["DE", "GB", "FR", "IT", "ES"].includes(t.country_code)) {
        if (optimizationLevers.proceduralRealism) boost += 11;
        if (optimizationLevers.moralAmbiguity) boost += 4;
      } else if (t.country_code === "BR" || t.country_code === "MX") {
        if (optimizationLevers.familyStakes) boost += 7;
        if (optimizationLevers.multilingualDub) boost += 8;
      } else if (t.country_code === "AU") {
        if (optimizationLevers.pacingTurnaround) boost += 7;
        if (optimizationLevers.lyriaScore) boost += 4;
      }

      const finalScore = Math.min(99, t.market_fit_score + boost);
      return {
        ...t,
        market_fit_score: finalScore,
        boost,
      };
    });
  }, [baseTerritories, optimizationLevers]);

  // Look up or dynamically generate active territory dossier
  const activeTerritory = React.useMemo(() => {
    const matched = territoriesWithOptimization.find((t) => t.country_code === selectedCountryCode);
    if (matched) return matched;

    const featureMatch = countryFeatures.find((f) => getFeatureCountry(f).code === selectedCountryCode);
    const countryName = featureMatch ? getFeatureCountry(featureMatch).name : selectedCountryCode;
    const generated = generateTerritoryDossier(selectedCountryCode, countryName);
    return {
      ...generated,
      boost: 0,
    };
  }, [territoriesWithOptimization, selectedCountryCode, countryFeatures]);

  // Overall Global Average
  const overallGlobalScore = React.useMemo(() => {
    const avg =
      territoriesWithOptimization.reduce((sum, t) => sum + t.market_fit_score, 0) /
      (territoriesWithOptimization.length || 1);
    return Math.round(avg);
  }, [territoriesWithOptimization]);

  // Helper for color coding scores
  const getScoreColor = (score: number) => {
    if (score >= 82) return "#10b981"; // Emerald
    if (score >= 74) return "#06b6d4"; // Cyan
    if (score >= 65) return "#f59e0b"; // Amber
    return "#f43f5e"; // Rose
  };

  // Mouse handlers for smooth pan / drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragMoved.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      dragMoved.current += Math.abs(dx) + Math.abs(dy);
      setZoom((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      dragStart.current = { x: e.clientX, y: e.clientY };
    }

    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleCountryClick = (code: string) => {
    if (dragMoved.current > 6) return;
    setSelectedCountryCode(code);
  };

  const handleZoomIn = () => {
    setZoom((prev) => ({
      ...prev,
      scale: Math.min(3.5, Number((prev.scale + 0.3).toFixed(2))),
    }));
  };

  const handleZoomOut = () => {
    setZoom((prev) => ({
      ...prev,
      scale: Math.max(0.8, Number((prev.scale - 0.3).toFixed(2))),
    }));
  };

  const handleResetZoom = () => {
    setActiveRegion("world");
    setZoom({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className={`flex flex-col rounded-xl border border-border bg-[#0b0d13] p-5 space-y-5 ${className ?? ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/80 pb-4 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-accent" />
            <SlateLabel>Global Audience Intelligence · Regional Viability</SlateLabel>
          </div>
          <p className="text-xs text-muted-foreground">
            True cartographic projection of 177 sovereign territories, ClickHouse precedent benchmarks, and live &ldquo;What-If&rdquo; narrative levers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRunMarketPredict}
            disabled={isPredicting}
            className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            {isPredicting ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            <span>{isPredicting ? "Predicting..." : "Run AI Market Viability"}</span>
          </Button>
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground bg-secondary/30 px-2.5 py-1.5 rounded-lg border border-border">
            <Database className="h-3 w-3 text-accent" />
            <span>ClickHouse cinematic_precedents</span>
          </div>
        </div>
      </div>

      {/* Target Distribution Markets Selector Banner */}
      {targetTerritories && targetTerritories.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-xl border border-accent/30 bg-accent/5">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-accent" />
            <span className="text-xs font-heading font-semibold text-foreground">
              Production Slate Target Markets:
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              (Configured in Project Setup)
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {targetTerritories.map((code) => {
              const isSelected = selectedCountryCode === code;
              const territoryData = territoriesWithOptimization.find((t) => t.country_code === code);
              const score = territoryData ? territoryData.market_fit_score : null;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedCountryCode(code)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                    isSelected
                      ? "bg-accent text-accent-foreground font-bold shadow-xs ring-1 ring-accent/60"
                      : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60"
                  }`}
                >
                  <span>{code}</span>
                  {score !== null && (
                    <span className="text-[10px] opacity-80 font-bold">({score})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Banner: Global Score & Top Territory */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border/80 bg-secondary/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">
              Aggregate Global Fit
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400">
              {overallGlobalScore}
              <span className="text-xs text-muted-foreground font-normal"> / 100</span>
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/80 bg-secondary/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">
              Selected Territory Focus
            </span>
            <span className="text-sm font-bold text-foreground block">
              {activeTerritory.country_name} ({activeTerritory.country_code})
            </span>
            <span className="text-xs font-mono font-bold" style={{ color: getScoreColor(activeTerritory.market_fit_score) }}>
              Score: {activeTerritory.market_fit_score}/100
              {activeTerritory.boost > 0 && ` (+${activeTerritory.boost} boost)`}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Compass className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/80 bg-secondary/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">
              Audience Appetite
            </span>
            <p className="text-xs text-foreground font-medium line-clamp-2 mt-0.5">
              {activeTerritory.commercial_appetite}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border/80 bg-secondary/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">
              Cultural Friction Alert
            </span>
            <p className="text-xs text-amber-400/90 font-medium line-clamp-2 mt-0.5">
              {activeTerritory.cultural_friction}
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          MAIN CARTOGRAPHIC VECTOR WORLD MAP (D3-GEO & WORLD-ATLAS)
      ────────────────────────────────────────────────────────── */}
      <div className="relative rounded-xl border border-border/80 bg-[#06080f] p-4 overflow-hidden shadow-inner">
        {/* Map Header & Viewport Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-foreground tracking-wide">
              Global Cartographic Heatmap
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              (Natural Earth Projection · 177 Sovereign Territories)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Region Presets */}
            <div className="flex items-center rounded-lg bg-secondary/30 p-0.5 border border-border/60 text-[10px]">
              {(Object.keys(REGION_PRESETS) as RegionPreset[]).map((regionKey) => (
                <button
                  key={regionKey}
                  type="button"
                  onClick={() => {
                    setActiveRegion(regionKey);
                    setZoom(REGION_PRESETS[regionKey]);
                  }}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    activeRegion === regionKey
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {REGION_PRESETS[regionKey].label}
                </button>
              ))}
            </div>

            {/* Zoom / Reset Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-border/60 bg-secondary/20 hover:bg-secondary/40 text-xs"
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-border/60 bg-secondary/20 hover:bg-secondary/40 text-xs"
                onClick={handleZoomOut}
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-border/60 bg-secondary/20 hover:bg-secondary/40 text-xs"
                onClick={handleResetZoom}
                title="Reset World View"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Interactive SVG Projection Canvas */}
        <div
          ref={mapContainerRef}
          className="relative w-full aspect-[2/1] max-h-[460px] overflow-hidden select-none cursor-grab active:cursor-grabbing mt-2"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setHoveredCountry(null);
          }}
        >
          <svg
            viewBox="0 0 960 480"
            className="w-full h-full filter drop-shadow-md select-none"
          >
            <defs>
              {/* Radial background vignette */}
              <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#0d1424" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#05070d" stopOpacity="1" />
              </radialGradient>

              {/* Glowing Aura Filter for Selected Territory */}
              <filter id="map-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Pin Drop Shadow */}
              <filter id="pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* Deep space map backdrop */}
            <rect width="960" height="480" fill="url(#vignette)" />

            {/* Transformable Cartographic Group */}
            <g
              transform={`translate(${zoom.x}, ${zoom.y}) scale(${zoom.scale})`}
              className="transition-transform duration-300 ease-out"
            >
              {/* Cartographic Sphere Outline */}
              {spherePath && (
                <path
                  d={spherePath}
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.15)"
                  strokeWidth="1.2"
                />
              )}

              {/* Graticule Latitude / Longitude lines */}
              {graticulePath && (
                <path
                  d={graticulePath}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeWidth="0.6"
                />
              )}

              {/* Render All Sovereign Country Polygons */}
              {countryFeatures.map((f, idx) => {
                const pathStr = pathGenerator(f);
                if (!pathStr) return null;

                const { code, name } = getFeatureCountry(f);
                const matched = territoriesWithOptimization.find((t) => t.country_code === code);
                const isSelected = selectedCountryCode === code;
                const isHovered = hoveredCountry?.code === code;

                const score = matched ? matched.market_fit_score : 70;
                const boost = matched ? matched.boost : 0;
                const color = matched ? getScoreColor(score) : "#131a29";

                return (
                  <path
                    key={`country-${f.id || idx}`}
                    d={pathStr}
                    fill={matched ? color : "#131926"}
                    fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : matched ? 0.55 : 0.4}
                    stroke={isSelected ? "#ffffff" : isHovered ? "#38bdf8" : targetTerritories.includes(code) ? "var(--accent)" : matched ? color : "#1f2a3f"}
                    strokeWidth={isSelected ? 2.2 : isHovered ? 1.5 : targetTerritories.includes(code) ? 1.6 : matched ? 0.9 : 0.5}
                    filter={isSelected ? "url(#map-glow)" : undefined}
                    className="transition-all duration-150 cursor-pointer"
                    onClick={() => handleCountryClick(code)}
                    onMouseEnter={() => {
                      setHoveredCountry({
                        code,
                        name,
                        score,
                        boost,
                        appetite: matched ? matched.commercial_appetite : "Untapped territory / Emerging theatrical market",
                      });
                    }}
                  />
                );
              })}

              {/* Tactical Centroid Beacon Pins & Market Badges */}
              {countryFeatures.map((f, idx) => {
                const { code } = getFeatureCountry(f);
                const isSelected = selectedCountryCode === code;
                const isKeyHub = KEY_MARKET_HUBS.has(code);
                const isTargetTerritory = targetTerritories.includes(code);

                // Draw persistent pins for key film hubs, target territories, or the currently selected country
                if (!isKeyHub && !isSelected && !isTargetTerritory) return null;

                const centroid = pathGenerator.centroid(f);
                if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return null;

                const [cx, cy] = centroid;
                const matched = territoriesWithOptimization.find((t) => t.country_code === code);
                const score = matched ? matched.market_fit_score : 72;
                const color = getScoreColor(score);

                return (
                  <g
                    key={`pin-${code}-${idx}`}
                    className="cursor-pointer select-none"
                    onClick={() => handleCountryClick(code)}
                  >
                    {/* Sonar Radar Wave on Selected Territory */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="16"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        className="animate-ping opacity-75 origin-center"
                      />
                    )}

                    {/* Luminous Core Pin Dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 5 : 3.5}
                      fill={isSelected ? "#ffffff" : color}
                      stroke="#090d18"
                      strokeWidth="1.5"
                      filter="url(#pin-shadow)"
                    />

                    {/* Tactical Score Badge Pill */}
                    <g
                      transform={`translate(${cx}, ${cy - 14})`}
                      filter="url(#pin-shadow)"
                    >
                      <rect
                        x="-22"
                        y="-11"
                        width="44"
                        height="18"
                        rx="4"
                        fill="#070a12"
                        fillOpacity="0.95"
                        stroke={isSelected ? "#ffffff" : color}
                        strokeWidth={isSelected ? 1.8 : 0.9}
                      />
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {code} {score}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredCountry && tooltipPos && (
            <div
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full pb-3 transition-transform duration-75"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
            >
              <div className="rounded-lg border border-border/90 bg-[#090d18]/95 backdrop-blur-md px-3 py-2 shadow-2xl space-y-1 text-left min-w-[190px] max-w-[270px]">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
                  <span className="text-xs font-bold text-foreground truncate">
                    {hoveredCountry.name}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-semibold shrink-0">
                    {hoveredCountry.code}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-muted-foreground">Market Fit:</span>
                  <span
                    className="font-mono font-bold"
                    style={{ color: getScoreColor(hoveredCountry.score) }}
                  >
                    {hoveredCountry.score}/100
                    {hoveredCountry.boost > 0 && ` (+${hoveredCountry.boost})`}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
                  {hoveredCountry.appetite}
                </p>
                <div className="text-[9px] text-cyan-400/80 font-mono flex items-center gap-1 pt-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  <span>Click to inspect cultural dossier</span>
                </div>
              </div>
            </div>
          )}

          {/* Map Footer Score Scale & Interaction Cue */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none text-[10px] font-mono text-muted-foreground bg-[#06080f]/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>&ge;82 High Fit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                <span>74-81 Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>&le;73 Friction</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-muted-foreground/60">
                <span className="h-2 w-2 rounded-full bg-[#1e2a3f]" />
                <span>Untapped / Emerging</span>
              </div>
            </div>
            <div className="hidden sm:block text-muted-foreground/70">
              Click any territory to focus · Drag to pan · Scroll/buttons to zoom
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          "WHAT-IF" AUDIENCE METRIC OPTIMIZER (INTERACTIVE LEVERS)
      ────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400">
              &ldquo;What-If&rdquo; Cultural Metric Optimization Simulator
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Illustrative heuristic, not a live model
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Different audiences respond to distinct dramatic mechanics. Toggle script interventions to see a directional, rule-of-thumb estimate of regional appetite shift — these are illustrative point boosts, not a live audience-data model.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
          {/* Lever 1 */}
          <button
            type="button"
            onClick={() => handleToggleLever("familyStakes")}
            className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2 ${
              optimizationLevers.familyStakes
                ? "border-emerald-500 bg-emerald-500/15 text-foreground"
                : "border-border/70 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
            }`}
          >
            <div
              className={`h-4 w-4 rounded flex items-center justify-center border text-[9px] mt-0.5 shrink-0 ${
                optimizationLevers.familyStakes
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-border bg-background"
              }`}
            >
              {optimizationLevers.familyStakes && <Check className="h-3 w-3" />}
            </div>
            <div>
              <span className="font-bold block text-xs">Heighten Personal / Family Stakes</span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                India +8% • Latin America +7%
              </span>
            </div>
          </button>

          {/* Lever 2 */}
          <button
            type="button"
            onClick={() => handleToggleLever("lyriaScore")}
            className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2 ${
              optimizationLevers.lyriaScore
                ? "border-emerald-500 bg-emerald-500/15 text-foreground"
                : "border-border/70 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
            }`}
          >
            <div
              className={`h-4 w-4 rounded flex items-center justify-center border text-[9px] mt-0.5 shrink-0 ${
                optimizationLevers.lyriaScore
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-border bg-background"
              }`}
            >
              {optimizationLevers.lyriaScore && <Check className="h-3 w-3" />}
            </div>
            <div>
              <span className="font-bold block text-xs">Emphasize Thematic Score Swells</span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                India +6% • Theatrical Mass +5%
              </span>
            </div>
          </button>

          {/* Lever 3 */}
          <button
            type="button"
            onClick={() => handleToggleLever("multilingualDub")}
            className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2 ${
              optimizationLevers.multilingualDub
                ? "border-emerald-500 bg-emerald-500/15 text-foreground"
                : "border-border/70 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
            }`}
          >
            <div
              className={`h-4 w-4 rounded flex items-center justify-center border text-[9px] mt-0.5 shrink-0 ${
                optimizationLevers.multilingualDub
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-border bg-background"
              }`}
            >
              {optimizationLevers.multilingualDub && <Check className="h-3 w-3" />}
            </div>
            <div>
              <span className="font-bold block text-xs">Regional Multilingual Dubs (Hindi/Tamil)</span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                India +9% • LatAm +8%
              </span>
            </div>
          </button>

          {/* Lever 4 */}
          <button
            type="button"
            onClick={() => handleToggleLever("pacingTurnaround")}
            className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2 ${
              optimizationLevers.pacingTurnaround
                ? "border-emerald-500 bg-emerald-500/15 text-foreground"
                : "border-border/70 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
            }`}
          >
            <div
              className={`h-4 w-4 rounded flex items-center justify-center border text-[9px] mt-0.5 shrink-0 ${
                optimizationLevers.pacingTurnaround
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-border bg-background"
              }`}
            >
              {optimizationLevers.pacingTurnaround && <Check className="h-3 w-3" />}
            </div>
            <div>
              <span className="font-bold block text-xs">Accelerate Act 2 Midpoint Turn</span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                North America +9% • Korea +4%
              </span>
            </div>
          </button>

          {/* Lever 5 */}
          <button
            type="button"
            onClick={() => handleToggleLever("moralAmbiguity")}
            className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2 ${
              optimizationLevers.moralAmbiguity
                ? "border-emerald-500 bg-emerald-500/15 text-foreground"
                : "border-border/70 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
            }`}
          >
            <div
              className={`h-4 w-4 rounded flex items-center justify-center border text-[9px] mt-0.5 shrink-0 ${
                optimizationLevers.moralAmbiguity
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-border bg-background"
              }`}
            >
              {optimizationLevers.moralAmbiguity && <Check className="h-3 w-3" />}
            </div>
            <div>
              <span className="font-bold block text-xs">Deepen Moral Ambiguity & Irony</span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                South Korea +10% • Europe +4%
              </span>
            </div>
          </button>

          {/* Lever 6 */}
          <button
            type="button"
            onClick={() => handleToggleLever("proceduralRealism")}
            className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2 ${
              optimizationLevers.proceduralRealism
                ? "border-emerald-500 bg-emerald-500/15 text-foreground"
                : "border-border/70 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
            }`}
          >
            <div
              className={`h-4 w-4 rounded flex items-center justify-center border text-[9px] mt-0.5 shrink-0 ${
                optimizationLevers.proceduralRealism
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-border bg-background"
              }`}
            >
              {optimizationLevers.proceduralRealism && <Check className="h-3 w-3" />}
            </div>
            <div>
              <span className="font-bold block text-xs">Grounded Procedural Logistics</span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                Germany / Europe +11%
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          DEEP CULTURAL DOSSIER FOR SELECTED TERRITORY
      ────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl border border-border/80 bg-secondary/15 space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground">
              {activeTerritory.country_name} ({activeTerritory.country_code}) Cultural Distribution Dossier
            </span>
            <Badge
              variant="outline"
              className="font-mono text-[10px]"
              style={{ color: getScoreColor(activeTerritory.market_fit_score) }}
            >
              Fit: {activeTerritory.market_fit_score}/100
            </Badge>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">ClickHouse Precedent Analysis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-border/60 bg-secondary/20 space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Commercial Appetite & Genre Fit
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {activeTerritory.commercial_appetite}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-1">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5 text-[11px]">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              Cultural Sensitivity & Friction Points
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {activeTerritory.cultural_friction}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-2.5 text-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-300 block text-xs">
              Actionable Script Localization Recommendation
            </span>
            <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">
              {activeTerritory.actionable_fix}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
