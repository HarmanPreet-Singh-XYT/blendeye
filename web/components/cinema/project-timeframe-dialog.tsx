"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SlateLabel } from "@/components/cinema/slate-label";
import {
  Clock,
  Film,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Tv,
  Compass,
  Zap,
  Layers,
  Check,
  RotateCcw,
  Milestone,
  MapPin,
  Lock,
  Globe2,
  Sliders,
} from "lucide-react";
import {
  type NarrativeFormat,
  type GenreOption,
  GENRE_OPTIONS,
  NARRATIVE_FORMATS,
  updateProjectTimeframe,
} from "@/lib/project-store";
import { formatTimecode } from "@/components/cinema/timeline-scrubber";

const GENRE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "thriller", label: "Thriller" },
  { id: "scifi", label: "Sci-Fi" },
  { id: "noir", label: "Noir" },
  { id: "horror", label: "Horror" },
  { id: "action", label: "Action" },
  { id: "drama", label: "Drama" },
  { id: "epic", label: "Epic" },
] as const;

const DIRECTOR_STYLES = [
  { id: "Denis Villeneuve", style: "Brutalist scale, atmospheric sound design, deliberate slow-burn spatial geometry" },
  { id: "David Fincher", style: "Meticulous procedural rhythm, low-key amber/green chiaroscuro, relentless technical precision" },
  { id: "Christopher Nolan", style: "Non-linear chronological cross-cutting, practical scale, escalating tension" },
  { id: "Michael Mann", style: "Neo-noir sodium vapor & wet reflections, hyper-tactical realism, telephoto lens compression" },
  { id: "Bong Joon-ho", style: "Social status friction, sudden violent tonal turns, intense claustrophobic framing" },
  { id: "Greta Gerwig", style: "High-density conversational cadence, vivid emotional realism, razor-sharp status wit" },
];

const TARGET_TERRITORIES = [
  { code: "US", name: "North America", note: "Pacing & 3-Act Structure Focus", icon: "🇺🇸" },
  { code: "IN", name: "India", note: "Emotional Stakes, Music & Family Dynamics", icon: "🇮🇳" },
  { code: "KR", name: "South Korea", note: "Moral Ambiguity & Psychological Twists", icon: "🇰🇷" },
  { code: "DE", name: "Western Europe", note: "Procedural Realism & Authentic Logic", icon: "🇩🇪" },
  { code: "BR", name: "Latin America", note: "Ensemble Chemistry & High Energy", icon: "🇧🇷" },
  { code: "JP", name: "Japan", note: "Atmospheric Subtlety & Tension Control", icon: "🇯🇵" },
];

interface ProjectTimeframeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  sceneTitle?: string;
  genre?: string;
  initialFormat?: NarrativeFormat;
  narrativeFormat?: NarrativeFormat;
  initialRuntimeMinutes?: number;
  targetRuntimeMinutes?: number;
  initialScenePlacementSeconds?: number;
  scenePlacementSeconds?: number;
  initialSceneDurationSeconds?: number;
  sceneDurationSeconds?: number;
  directorStyle?: string;
  coreSecret?: string;
  primaryLocation?: string;
  targetTerritories?: string[];
  initialTab?: "timeframe" | "blueprint";
  onSave?: (data: {
    narrativeFormat: NarrativeFormat;
    targetRuntimeMinutes: number;
    scenePlacementSeconds: number;
    sceneDurationSeconds: number;
    directorStyle?: string;
    coreSecret?: string;
    primaryLocation?: string;
    targetTerritories?: string[];
    genre?: string;
  }) => void;
  onTimeframeUpdated?: (data: {
    narrativeFormat: NarrativeFormat;
    targetRuntimeMinutes: number;
    scenePlacementSeconds: number;
    sceneDurationSeconds: number;
    directorStyle?: string;
    coreSecret?: string;
    primaryLocation?: string;
    targetTerritories?: string[];
    genre?: string;
  }) => void;
}

export function ProjectTimeframeDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  sceneTitle = "Scene 1",
  genre,
  initialFormat,
  narrativeFormat,
  initialRuntimeMinutes,
  targetRuntimeMinutes,
  initialScenePlacementSeconds,
  scenePlacementSeconds,
  initialSceneDurationSeconds,
  sceneDurationSeconds,
  directorStyle,
  coreSecret,
  primaryLocation,
  targetTerritories,
  initialTab = "timeframe",
  onSave,
  onTimeframeUpdated,
}: ProjectTimeframeDialogProps) {
  const effectiveFormat = narrativeFormat || initialFormat || "feature";
  const effectiveRuntimeMinutes = targetRuntimeMinutes ?? initialRuntimeMinutes ?? 95;
  const effectiveScenePlacement = scenePlacementSeconds ?? initialScenePlacementSeconds ?? 34 * 60;
  const effectiveSceneDuration = sceneDurationSeconds ?? initialSceneDurationSeconds ?? 6 * 60;

  const [activeTab, setActiveTab] = React.useState<"timeframe" | "blueprint">(initialTab);
  const [selectedFormat, setSelectedFormat] = React.useState<NarrativeFormat>(effectiveFormat);
  const [runtimeMinutes, setRuntimeMinutes] = React.useState<number>(effectiveRuntimeMinutes);
  const [scenePlacement, setScenePlacement] = React.useState<number>(effectiveScenePlacement);
  const [sceneDuration, setSceneDuration] = React.useState<number>(effectiveSceneDuration);

  // Genre state
  const isInitiallyCustom = Boolean(genre && !GENRE_OPTIONS.some((g) => g.id === genre));
  const [curGenre, setCurGenre] = React.useState<string>(genre || GENRE_OPTIONS[0].id);
  const [genreCategory, setGenreCategory] = React.useState<string>("all");
  const [isCustomGenre, setIsCustomGenre] = React.useState<boolean>(isInitiallyCustom);
  const [customGenreText, setCustomGenreText] = React.useState<string>(isInitiallyCustom && genre ? genre : "");

  const effectiveGenre = isCustomGenre && customGenreText.trim() ? customGenreText.trim() : curGenre;

  const filteredGenres = React.useMemo(() => {
    if (genreCategory === "all") return GENRE_OPTIONS;
    return GENRE_OPTIONS.filter((g) => g.category === genreCategory);
  }, [genreCategory]);

  // Directorial blueprint & secrets state
  const [curDirectorStyle, setCurDirectorStyle] = React.useState<string>(directorStyle || "David Fincher");
  const [curCoreSecret, setCurCoreSecret] = React.useState<string>(coreSecret || "");
  const [curPrimaryLocation, setCurPrimaryLocation] = React.useState<string>(primaryLocation || "");
  const [curTargetTerritories, setCurTargetTerritories] = React.useState<string[]>(targetTerritories || ["US", "IN", "KR"]);

  React.useEffect(() => {
    if (open) {
      setSelectedFormat(effectiveFormat);
      setRuntimeMinutes(effectiveRuntimeMinutes);
      setScenePlacement(effectiveScenePlacement);
      setSceneDuration(effectiveSceneDuration);
      setCurDirectorStyle(directorStyle || "David Fincher");
      setCurCoreSecret(coreSecret || "");
      setCurPrimaryLocation(primaryLocation || "");
      setCurTargetTerritories(targetTerritories || ["US", "IN", "KR"]);
      const customGen = Boolean(genre && !GENRE_OPTIONS.some((g) => g.id === genre));
      setCurGenre(genre || GENRE_OPTIONS[0].id);
      setIsCustomGenre(customGen);
      setCustomGenreText(customGen && genre ? genre : "");
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [
    open,
    genre,
    effectiveFormat,
    effectiveRuntimeMinutes,
    effectiveScenePlacement,
    effectiveSceneDuration,
    directorStyle,
    coreSecret,
    primaryLocation,
    targetTerritories,
    initialTab,
  ]);

  const totalSeconds = runtimeMinutes * 60;
  const config = NARRATIVE_FORMATS[selectedFormat] || NARRATIVE_FORMATS.feature;

  // Act structure milestones
  const act1Seconds = Math.round(totalSeconds * config.structure.act1Pct);
  const midpointSeconds = Math.round(totalSeconds * config.structure.midpointPct);
  const act3Seconds = Math.round(totalSeconds * config.structure.act3Pct);

  // Quick Extend / Shrink handlers
  const handleExtend = (deltaMins: number) => {
    setRuntimeMinutes((prev) => Math.min(240, prev + deltaMins));
  };

  const handleShrink = (deltaMins: number) => {
    setRuntimeMinutes((prev) => {
      const next = Math.max(2, prev - deltaMins);
      if (scenePlacement > next * 60) {
        setScenePlacement(Math.floor(next * 60 * 0.25));
      }
      return next;
    });
  };

  const handleSelectFormat = (fmt: NarrativeFormat) => {
    setSelectedFormat(fmt);
    const targetMins = NARRATIVE_FORMATS[fmt].defaultMinutes;
    setRuntimeMinutes(targetMins);
    // Reposition scene placement proportionally
    const ratio = totalSeconds > 0 ? scenePlacement / totalSeconds : 0.25;
    setScenePlacement(Math.round(targetMins * 60 * ratio));
  };

  const handleSnapScene = (targetSeconds: number) => {
    setScenePlacement(Math.min(totalSeconds - sceneDuration, Math.max(0, targetSeconds)));
  };

  const handleToggleTerritory = (code: string) => {
    setCurTargetTerritories((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSave = () => {
    const finalGenre = effectiveGenre;
    updateProjectTimeframe(projectId, {
      narrativeFormat: selectedFormat,
      targetRuntimeMinutes: runtimeMinutes,
      scenePlacementSeconds: scenePlacement,
      sceneDurationSeconds: sceneDuration,
      directorStyle: curDirectorStyle,
      coreSecret: curCoreSecret,
      primaryLocation: curPrimaryLocation,
      targetTerritories: curTargetTerritories,
      genre: finalGenre,
    });

    const payload = {
      narrativeFormat: selectedFormat,
      targetRuntimeMinutes: runtimeMinutes,
      scenePlacementSeconds: scenePlacement,
      sceneDurationSeconds: sceneDuration,
      directorStyle: curDirectorStyle,
      coreSecret: curCoreSecret,
      primaryLocation: curPrimaryLocation,
      targetTerritories: curTargetTerritories,
      genre: finalGenre,
    };

    onTimeframeUpdated?.(payload);
    onSave?.(payload);

    onOpenChange(false);
  };

  const sceneProgressPct = totalSeconds > 0 ? (scenePlacement / totalSeconds) * 100 : 0;
  const sceneWidthPct = totalSeconds > 0 ? (sceneDuration / totalSeconds) * 100 : 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0b0c11] border border-border/70 shadow-[0_30px_90px_rgba(0,0,0,0.95)] p-0 overflow-hidden select-none rounded-2xl sm:rounded-3xl">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-3 border-b border-border/50 bg-gradient-to-b from-[#131520]/90 to-[#0c0e14]/80 backdrop-blur-md rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-xs">
                {activeTab === "timeframe" ? (
                  <Clock className="h-4.5 w-4.5" />
                ) : (
                  <Sliders className="h-4.5 w-4.5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-heading font-bold text-foreground tracking-tight">
                  {projectTitle} · Slate Blueprint &amp; Scope
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Configure macro narrative pacing, directorial tone, asymmetric secrets, and target markets.
                </DialogDescription>
              </div>
            </div>

            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 rounded-full border-accent/40 bg-accent/10 text-accent font-semibold shadow-xs">
              {runtimeMinutes}m · {selectedFormat}
            </Badge>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center rounded-lg bg-secondary/30 p-1 border border-border/70 mt-3">
            <button
              type="button"
              onClick={() => setActiveTab("timeframe")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "timeframe"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Timeframe &amp; Macro Pacing</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("blueprint")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "blueprint"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Directorial Blueprint &amp; Secrets</span>
            </button>
          </div>
        </DialogHeader>

        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {activeTab === "timeframe" ? (
            <>
              {/* Section 1: Narrative Format Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <SlateLabel>Production Format &amp; Scope</SlateLabel>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Est. ~{Math.round(runtimeMinutes / 3)} Master Scenes
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(NARRATIVE_FORMATS) as NarrativeFormat[])
                    .filter((f) => f !== "series" && f !== "custom")
                    .map((fmt) => {
                      const item = NARRATIVE_FORMATS[fmt];
                      const isSelected = selectedFormat === fmt;
                      return (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => handleSelectFormat(fmt)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                            isSelected
                              ? "border-accent bg-accent/15 ring-1 ring-accent/40 shadow-xs"
                              : "border-border/70 bg-card hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${isSelected ? "text-accent" : "text-foreground"}`}>
                              {item.label}
                            </span>
                            {isSelected && <Check className="h-3 w-3 text-accent" />}
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {item.defaultMinutes}m default
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Section 2: Extend / Shrink Runtime Dial */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-secondary/15 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-accent" />
                    <span className="text-xs font-semibold text-foreground">Target Project Runtime</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Shrink quick buttons */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShrink(15)}
                      className="h-7 px-2.5 rounded-lg border-border/70 bg-background/50 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-[11px] font-mono gap-1 cursor-pointer transition-colors"
                      title="Shrink project runtime by 15 minutes"
                    >
                      <Minimize2 className="h-3 w-3" />
                      <span>-15m Shrink</span>
                    </Button>
                    {/* Extend quick buttons */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExtend(15)}
                      className="h-7 px-2.5 rounded-lg border-border/70 bg-background/50 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 text-[11px] font-mono gap-1 cursor-pointer transition-colors"
                      title="Extend project runtime by 15 minutes"
                    >
                      <Maximize2 className="h-3 w-3" />
                      <span>+15m Extend</span>
                    </Button>
                  </div>
                </div>

                {/* Range Slider */}
                <div className="space-y-2 pt-1">
                  <input
                    type="range"
                    min={2}
                    max={180}
                    step={1}
                    value={runtimeMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setRuntimeMinutes(val);
                      if (scenePlacement > val * 60) {
                        setScenePlacement(Math.floor(val * 60 * 0.25));
                      }
                    }}
                    className="w-full accent-accent h-1.5 rounded-lg bg-secondary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                    <span>2 min (Teaser)</span>
                    <span className="font-bold text-foreground">{runtimeMinutes} Minutes Total Runtime</span>
                    <span>180 min (Epic)</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
                  {config.pacingDescription}
                </p>
              </div>

              {/* Section 3: Interactive Act Structure & Scene Pinpoint */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-secondary/15 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <SlateLabel>Pinpoint Active Scene on Narrative Flow</SlateLabel>
                  <span className="text-xs font-mono font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/25">
                    {sceneTitle}: {formatTimecode(scenePlacement)}
                  </span>
                </div>

                {/* Macro Act Timeline Bar */}
                <div className="relative h-12 w-full rounded-xl bg-black/80 border border-border/80 overflow-hidden flex items-center p-1 select-none shadow-inner">
                  {/* Act I Segment */}
                  <div
                    className="h-full bg-blue-950/60 border-r border-blue-500/40 relative flex items-center justify-center text-[9px] font-mono text-blue-300 transition-all rounded-l-lg"
                    style={{ width: `${config.structure.act1Pct * 100}%` }}
                  >
                    <span className="truncate px-1">Act I (Setup)</span>
                  </div>

                  {/* Act IIa Segment */}
                  <div
                    className="h-full bg-amber-950/50 border-r border-amber-500/50 relative flex items-center justify-center text-[9px] font-mono text-amber-300 transition-all"
                    style={{ width: `${(config.structure.midpointPct - config.structure.act1Pct) * 100}%` }}
                  >
                    <span className="truncate px-1">Act IIa</span>
                  </div>

                  {/* Act IIb Segment */}
                  <div
                    className="h-full bg-purple-950/50 border-r border-purple-500/50 relative flex items-center justify-center text-[9px] font-mono text-purple-300 transition-all"
                    style={{ width: `${(config.structure.act3Pct - config.structure.midpointPct) * 100}%` }}
                  >
                    <span className="truncate px-1">Act IIb (Escalation)</span>
                  </div>

                  {/* Act III Segment */}
                  <div
                    className="h-full bg-rose-950/60 relative flex items-center justify-center text-[9px] font-mono text-rose-300 transition-all rounded-r-lg"
                    style={{ width: `${(1 - config.structure.act3Pct) * 100}%` }}
                  >
                    <span className="truncate px-1">Act III (Climax)</span>
                  </div>

                  {/* Midpoint Divider Needle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                    style={{ left: `${config.structure.midpointPct * 100}%` }}
                    title={`Midpoint Shift: ${formatTimecode(midpointSeconds)}`}
                  />

                  {/* Active Scene Highlight Bracket */}
                  <div
                    className="absolute top-0.5 bottom-0.5 rounded-lg border-2 border-accent bg-accent/30 backdrop-blur-xs z-20 transition-all shadow-md flex items-center justify-center"
                    style={{
                      left: `${Math.min(94, Math.max(0, sceneProgressPct))}%`,
                      width: `${Math.max(4, Math.min(25, sceneWidthPct))}%`,
                    }}
                  >
                    <span className="text-[8px] font-mono font-bold text-white bg-black/80 px-1 rounded shadow-xs truncate">
                      THIS SCENE
                    </span>
                  </div>
                </div>

                {/* Quick Snap Pinpoint Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-mono text-muted-foreground mr-1">
                    Pinpoint Anchor:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSnapScene(Math.round(totalSeconds * 0.05))}
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-border/70 bg-card/80 hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors shadow-xs"
                  >
                    🎣 Opening Hook ({formatTimecode(Math.round(totalSeconds * 0.05))})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnapScene(act1Seconds)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-border/70 bg-card/80 hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors shadow-xs"
                  >
                    🚪 Act II Break ({formatTimecode(act1Seconds)})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnapScene(midpointSeconds)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 cursor-pointer transition-colors shadow-xs"
                  >
                    🔄 Midpoint Crisis ({formatTimecode(midpointSeconds)})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnapScene(act3Seconds)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-border/70 bg-card/80 hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors shadow-xs"
                  >
                    💥 Climax Standoff ({formatTimecode(act3Seconds)})
                  </button>
                </div>

                {/* Scene Position Scrub Slider */}
                <div className="space-y-1.5 pt-1">
                  <input
                    type="range"
                    min={0}
                    max={Math.max(60, totalSeconds - sceneDuration)}
                    step={30}
                    value={scenePlacement}
                    onChange={(e) => setScenePlacement(parseInt(e.target.value, 10))}
                    className="w-full accent-accent h-1.5 rounded-lg bg-secondary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                    <span>00:00:00</span>
                    <span className="text-foreground font-semibold">
                      Scene Placement: {formatTimecode(scenePlacement)} — {formatTimecode(scenePlacement + sceneDuration)}
                    </span>
                    <span>{formatTimecode(totalSeconds)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: Directorial Blueprint & Secrets */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Genre & Cinematic Palette */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-secondary/15 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <SlateLabel>Genre &amp; Cinematic Atmosphere</SlateLabel>
                    <Badge variant="outline" className="text-[10px] font-mono border-accent/30 text-accent">
                      {effectiveGenre}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomGenre(!isCustomGenre)}
                    className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1.5 ${
                      isCustomGenre
                        ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground border border-border/80 hover:border-accent/40 bg-secondary/20"
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    {isCustomGenre ? `Catalog (${GENRE_OPTIONS.length})` : "+ Custom / Hybrid"}
                  </button>
                </div>

                {isCustomGenre ? (
                  <div className="space-y-2 pt-1">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block">
                      Custom Hybrid Genre:
                    </label>
                    <Input
                      value={customGenreText}
                      onChange={(e) => setCustomGenreText(e.target.value)}
                      placeholder="e.g. Afrofuturist Cyber-Western, Samurai Gothic Noir, Supernatural Heist..."
                      className="h-8 text-xs font-mono bg-background/60 border-accent/30"
                    />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Custom genres influence screenplay tone, actor vocal pacing, camera lens packs, and lighting presets.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border/40">
                      {GENRE_CATEGORIES.map((cat) => {
                        const isActive = genreCategory === cat.id;
                        const count = cat.id === "all" ? GENRE_OPTIONS.length : GENRE_OPTIONS.filter((g) => g.category === cat.id).length;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setGenreCategory(cat.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                              isActive
                                ? "bg-accent/20 text-accent border border-accent/40 font-semibold shadow-xs"
                                : "bg-secondary/20 text-muted-foreground hover:text-foreground border border-border/40 hover:bg-secondary/40"
                            }`}
                          >
                            <span>{cat.label}</span>
                            <span className="text-[9px] opacity-60 font-mono">({count})</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {filteredGenres.map((g) => {
                        const isSelected = curGenre === g.id && !isCustomGenre;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              setCurGenre(g.id);
                              setIsCustomGenre(false);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 text-xs ${
                              isSelected
                                ? "border-accent bg-accent/15 ring-1 ring-accent/40 shadow-xs text-foreground"
                                : "border-border/70 bg-card hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className={`font-semibold text-xs ${isSelected ? "text-accent" : "text-foreground"} truncate block`}>
                                  {g.label}
                                </span>
                                {isSelected && <Check className="h-3 w-3 text-accent shrink-0" />}
                              </div>
                              <span className="text-[10px] text-muted-foreground block line-clamp-1">{g.tag}</span>
                            </div>
                            {g.palette && (
                              <span className="text-[9px] text-muted-foreground/80 font-mono mt-1 line-clamp-1 block border-t border-border/30 pt-1">
                                🎨 {g.palette}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Director Style & Tone */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-secondary/15 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <SlateLabel>Directorial Tone &amp; Cinematic Style</SlateLabel>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Guides Screenplay &amp; Camera Packages
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DIRECTOR_STYLES.map((d) => {
                    const isSelected = curDirectorStyle === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setCurDirectorStyle(d.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          isSelected
                            ? "border-accent bg-accent/15 ring-1 ring-accent/40 shadow-xs"
                            : "border-border/70 bg-card hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${isSelected ? "text-accent" : "text-foreground"}`}>
                            {d.id}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-accent" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {d.style}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">
                    Custom Directorial Style Override:
                  </label>
                  <Input
                    value={curDirectorStyle}
                    onChange={(e) => setCurDirectorStyle(e.target.value)}
                    placeholder="e.g. David Fincher, Michael Mann, or Custom..."
                    className="h-8 text-xs font-mono bg-background/60"
                  />
                </div>
              </div>

              {/* Asymmetric Core Secret */}
              <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-400" />
                    <SlateLabel className="text-amber-400">Asymmetric Knowledge / Concealed Secret</SlateLabel>
                  </div>
                  <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px] font-mono">
                    ClickHouse Time-Gated
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  The pivotal piece of hidden information that only one character knows, driving dramatic tension before its eventual revelation.
                </p>
                <Textarea
                  value={curCoreSecret}
                  onChange={(e) => setCurCoreSecret(e.target.value)}
                  placeholder="Describe the concealed secret (e.g. Elena swapped the access keys 10 minutes ago)..."
                  className="text-xs font-mono min-h-20 bg-background/80 border-amber-500/30 focus-visible:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Primary Staging Location */}
              <div className="p-4 sm:p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <SlateLabel className="text-cyan-400">Primary Dramatic Staging Location</SlateLabel>
                  </div>
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 text-[10px] font-mono">
                    2D Floor Plan &amp; AI Scout
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  The physical setting where this scene unfolds. Directly informs architectural floor-plan blocking and lens selection.
                </p>
                <Input
                  value={curPrimaryLocation}
                  onChange={(e) => setCurPrimaryLocation(e.target.value)}
                  placeholder="e.g. Underground reinforced bank vault sub-level under emergency lighting..."
                  className="text-xs font-mono bg-background/80 border-cyan-500/30 focus-visible:border-cyan-500"
                />
              </div>

              {/* Global Distribution Markets */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-secondary/15 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-accent" />
                    <SlateLabel>Target Global Distribution Territories</SlateLabel>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Selected: {curTargetTerritories.length} Markets
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TARGET_TERRITORIES.map((t) => {
                    const isSelected = curTargetTerritories.includes(t.code);
                    return (
                      <button
                        key={t.code}
                        type="button"
                        onClick={() => handleToggleTerritory(t.code)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-accent bg-accent/15 text-foreground font-semibold ring-1 ring-accent/40"
                            : "border-border/60 bg-card/60 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{t.icon}</span>
                          <div className="truncate">
                            <span className="text-xs block truncate">{t.name}</span>
                            <span className="text-[9px] font-mono text-muted-foreground block">
                              {t.code}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 mx-0 mb-0 px-6 py-4.5 border-t border-border/40 bg-gradient-to-t from-[#08090d] to-[#12141d]/90 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-2xl sm:rounded-b-3xl">
          <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/60 text-muted-foreground shadow-xs">
              <Clock className="h-3.5 w-3.5 text-accent" />
              <span>Runtime: <strong className="text-foreground">{runtimeMinutes}m</strong></span>
            </span>
            {curDirectorStyle && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent font-semibold shadow-xs">
                <Film className="h-3.5 w-3.5 text-accent" />
                <span className="truncate max-w-[140px]">Tone: <strong className="text-foreground">{curDirectorStyle}</strong></span>
              </span>
            )}
            {effectiveGenre && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent font-semibold shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="truncate max-w-[140px]">Genre: <strong className="text-foreground">{effectiveGenre}</strong></span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9 px-4 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer font-medium transition-all"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="text-xs h-9 px-5 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-md shadow-accent/20 hover:shadow-accent/30 hover:scale-[1.01] active:scale-[0.98] cursor-pointer transition-all gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply Production Blueprint</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
