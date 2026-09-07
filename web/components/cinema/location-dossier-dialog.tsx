"use client";

import * as React from "react";
import {
  type LocationCandidate,
  type FilmScene,
  type SupportedCurrency,
  formatCurrency,
} from "@/lib/project-store";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Building2,
  Navigation,
  Star,
  Camera,
  Layers,
  DollarSign,
  Scale,
  Film,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  MessageSquare,
  Lock,
  Unlock,
  Copy,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  cleanCandidateName,
  synthesizeLocationVisualPrompt,
  LOCATION_STYLE_PRESETS,
  LOCATION_CAMERA_FRAMINGS,
} from "@/components/cinema/location-board";

export interface LocationDossierDialogProps {
  candidate: LocationCandidate | null;
  isOpen: boolean;
  onClose: () => void;
  currency?: SupportedCurrency;
  scene?: FilmScene;
  isLocked?: boolean;
  onLockCandidate?: (candidate: LocationCandidate) => void;
  onUnlockCandidate?: (candidate: LocationCandidate) => void;
  onAskAI?: (candidate: LocationCandidate) => void;
  onGenerateKeyframe?: (candidate: LocationCandidate, preset: string, framing: string) => Promise<void>;
  isGeneratingKeyframe?: boolean;
}

type DossierTab = "keyframe" | "stage_specs" | "costs" | "precedents" | "pros_cons" | "reviews" | "economy";

export function LocationDossierDialog({
  candidate,
  isOpen,
  onClose,
  currency = "USD",
  scene,
  isLocked = false,
  onLockCandidate,
  onUnlockCandidate,
  onAskAI,
  onGenerateKeyframe,
  isGeneratingKeyframe = false,
}: LocationDossierDialogProps) {
  const [activeTab, setActiveTab] = React.useState<DossierTab>("keyframe");
  const [selectedPreset, setSelectedPreset] = React.useState<string>(
    candidate?.preview_style_preset || LOCATION_STYLE_PRESETS[0].name
  );
  const [selectedFraming, setSelectedFraming] = React.useState<string>(
    candidate?.preview_camera_framing || LOCATION_CAMERA_FRAMINGS[0].name
  );

  React.useEffect(() => {
    if (candidate) {
      setSelectedPreset(candidate.preview_style_preset || LOCATION_STYLE_PRESETS[0].name);
      setSelectedFraming(candidate.preview_camera_framing || LOCATION_CAMERA_FRAMINGS[0].name);
      if (candidate.stage_specs) {
        setActiveTab("stage_specs");
      } else {
        setActiveTab("keyframe");
      }
    }
  }, [candidate]);

  if (!candidate) return null;

  const candidateName = cleanCandidateName(candidate.name);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[94vw] lg:w-[960px] max-h-[85vh] p-0 flex flex-col bg-card border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Dossier Header */}
        <div className="p-4 pb-2.5 border-b border-border/70 bg-secondary/20 shrink-0 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="h-7 w-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <Building2 className="h-4 w-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {candidateName}
                </h3>
                <Badge variant="outline" className="text-[10px] font-medium capitalize">
                  {candidate.category}
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-semibold tabular-nums">
                  {Math.round(candidate.rank_score * 100)}% Match
                </Badge>
                {isLocked && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Locked for Scene {scene?.sceneNumber}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Navigation className="h-3 w-3 text-accent" />
                {candidate.region} · Location Production &amp; Operational Dossier
              </p>
            </div>

            {candidate.reviews && candidate.reviews.length > 0 && (
              <div className="px-3 py-1 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-1.5 shrink-0 shadow-xs tabular-nums font-semibold">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{candidate.reviews[0].rating.toFixed(1)} / 5.0</span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline font-normal">
                  ({candidate.reviews.length} reviews)
                </span>
              </div>
            )}
          </div>

          {/* Dossier Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1 scrollbar-none">
            {([
              { id: "keyframe" as const, label: "Visual Concept Look", icon: Camera },
              ...(candidate.stage_specs
                ? [{ id: "stage_specs" as const, label: "Stage & Rigging Specs", icon: Layers }]
                : []),
              { id: "costs" as const, label: "Itemized Costs & Zone", icon: DollarSign },
              {
                id: "precedents" as const,
                label: `Cinematic Precedents (${candidate.film_precedents?.length || 0})`,
                icon: Film,
              },
              { id: "pros_cons" as const, label: "Pros & Cons", icon: Scale },
              {
                id: "reviews" as const,
                label: `Reviews (${candidate.reviews?.length || 0})`,
                icon: Star,
              },
              { id: "economy" as const, label: "Technical Sound, Power & Economy", icon: Building2 },
            ]).map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap",
                    activeTab === tab.id
                      ? "border-accent bg-accent/20 text-accent shadow-xs"
                      : "border-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                  )}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dossier Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: VISUAL CONCEPT KEYFRAME */}
          {activeTab === "keyframe" && (
            <div className="space-y-4 pt-1 text-xs">
              {/* Controls bar */}
              <div className="rounded-xl border border-border bg-secondary/15 p-3 sm:p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-accent" />
                      16:9 Concept Keyframe Look
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Photorealistic production design concept for Scene {scene?.sceneNumber} (
                      {scene?.slugline || scene?.location || candidateName}).
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium text-accent border-accent/40 bg-accent/5 self-start sm:self-auto"
                  >
                    16:9 Widescreen Scope
                  </Badge>
                </div>

                {onGenerateKeyframe && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                        Cinematic Style Preset:
                      </label>
                      <select
                        value={selectedPreset}
                        onChange={(e) => setSelectedPreset(e.target.value)}
                        className="w-full h-8 text-xs rounded border border-border bg-background px-2 text-foreground cursor-pointer"
                      >
                        {LOCATION_STYLE_PRESETS.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                        Camera Framing:
                      </label>
                      <select
                        value={selectedFraming}
                        onChange={(e) => setSelectedFraming(e.target.value)}
                        className="w-full h-8 text-xs rounded border border-border bg-background px-2 text-foreground cursor-pointer"
                      >
                        {LOCATION_CAMERA_FRAMINGS.map((f) => (
                          <option key={f.id} value={f.name}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3 flex items-end">
                      <Button
                        size="sm"
                        disabled={isGeneratingKeyframe}
                        onClick={() => onGenerateKeyframe(candidate, selectedPreset, selectedFraming)}
                        className="w-full h-8 text-xs gap-1.5 font-semibold bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer shadow-xs"
                      >
                        {isGeneratingKeyframe ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Rendering...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3" />
                            <span>{candidate.preview_image_url ? "Re-render" : "Generate Visual"}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* High-Resolution Keyframe Display */}
              {candidate.preview_image_url ? (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/80 bg-black/80 shadow-xl group">
                    <img
                      src={candidate.preview_image_url}
                      alt={`Cinematic concept of ${candidate.name}`}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-white flex items-center gap-1.5">
                      <Camera className="h-3 w-3 text-accent" />
                      <span>{candidate.preview_style_preset || selectedPreset}</span>
                      <span>•</span>
                      <span>{candidate.preview_camera_framing || selectedFraming}</span>
                    </div>
                  </div>

                  {/* Synthesized Prompt */}
                  <div className="rounded-xl border border-border bg-secondary/15 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                        Synthesized Imagen 3 Prompt
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(candidate.preview_image_prompt || "");
                          toast.add({
                            title: "Prompt Copied",
                            description: "Visual prompt copied to clipboard.",
                            type: "success",
                          });
                        }}
                        className="text-[10px] text-accent hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Copy className="h-2.5 w-2.5" />
                        <span>Copy Prompt</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed bg-background/50 p-2.5 rounded-lg border border-border/60 break-words font-mono text-[10px]">
                      {candidate.preview_image_prompt ||
                        synthesizeLocationVisualPrompt(
                          candidate,
                          scene,
                          candidate.preview_style_preset,
                          candidate.preview_camera_framing
                        )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 bg-secondary/10 p-8 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center text-accent">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="text-sm font-bold text-foreground">
                      No Visual Concept Keyframe Generated Yet
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Generate an on-demand 16:9 cinematic look for{" "}
                      <strong className="text-foreground">{candidateName}</strong>.
                      Imagen synthesizes the real-world venue architecture with the scene&apos;s lighting atmosphere.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STAGE & RIGGING SPECS */}
          {activeTab === "stage_specs" && candidate.stage_specs && (
            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3.5 rounded-xl border border-accent/30 bg-accent/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-accent" />
                    {candidate.stage_specs.stage_type.toUpperCase().replace("_", " ")}
                  </span>
                  <Badge variant="outline" className="text-[10px] border-accent/40 text-accent font-mono">
                    Controlled Soundstage Package
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {candidate.stage_specs.custom_set_notes || candidate.practical_notes}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-secondary/15 p-3 space-y-2">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                    Dimensions &amp; Clear Height
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Clear Grid Height:</span>
                      <span className="font-semibold text-foreground">
                        {candidate.stage_specs.grid_height || "24 ft clearance"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Footprint Area:</span>
                      <span className="font-semibold text-foreground">
                        {candidate.stage_specs.square_footage
                          ? `${candidate.stage_specs.square_footage.toLocaleString()} sq ft`
                          : candidate.stage_specs.dimensions || "4,500 sq ft"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Cyclorama Cove:</span>
                      <span className="font-semibold text-foreground">
                        {candidate.stage_specs.cyc_dimensions || candidate.stage_specs.cyc_type || "3-Wall Hard Cove Cyc"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Overhead Grid:</span>
                      <span className="font-semibold text-foreground text-[11px]">
                        {candidate.stage_specs.lighting_grid || "Motorized Pipe Grid with DMX Distribution"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-secondary/15 p-3 space-y-2">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                    Sound, Power &amp; Access Logistics
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Acoustic Isolation:</span>
                      <span className="font-semibold text-emerald-400">
                        {candidate.stage_specs.sound_rating || "NC-25 Certified Soundstage"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Electrical Service:</span>
                      <span className="font-semibold text-foreground">
                        {candidate.stage_specs.power_capacity || "1200A 3-Phase Camlock"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Load-In Access:</span>
                      <span className="font-semibold text-foreground">
                        {candidate.stage_specs.load_in_access || "14' x 16' Elephant Door (Drive-In)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Cyc Repaint Fee:</span>
                      <span className="font-semibold text-amber-400 tabular-nums">
                        {candidate.stage_specs.paint_or_restoration_fee !== undefined
                          ? formatCurrency(candidate.stage_specs.paint_or_restoration_fee, currency)
                          : "$500 (Fresh Chroma Green)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ITEMIZED COSTS & CREW ZONE */}
          {activeTab === "costs" && (
            <div className="space-y-4 pt-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Itemized Table */}
                <div className="rounded-xl border border-border bg-secondary/15 p-3.5 space-y-2.5">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                    Itemized Daily Cost Breakdown
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground py-0.5">
                      <span>Base Facility Day Rate:</span>
                      <span className="text-foreground font-semibold tabular-nums">
                        {formatCurrency(
                          candidate.detailed_costs?.day_rate || candidate.estimated_cost?.day_rate || 0,
                          currency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground py-0.5">
                      <span>Film Permit Fee:</span>
                      <span className="text-foreground tabular-nums">
                        {formatCurrency(
                          candidate.detailed_costs?.permit_fee || candidate.estimated_cost?.permit_fee || 0,
                          currency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground py-0.5">
                      <span>Fire Safety / Police Monitor:</span>
                      <span className="text-foreground tabular-nums">
                        {formatCurrency(candidate.detailed_costs?.fire_or_police_monitor || 450, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground py-0.5">
                      <span>Site Representative:</span>
                      <span className="text-foreground tabular-nums">
                        {formatCurrency(candidate.detailed_costs?.security_or_site_rep || 350, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground py-0.5">
                      <span>Basecamp &amp; Truck Parking:</span>
                      <span className="text-foreground tabular-nums">
                        {formatCurrency(candidate.detailed_costs?.basecamp_parking || 400, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground py-0.5">
                      <span>Cleaning / Restoration Deposit:</span>
                      <span className="text-foreground tabular-nums">
                        {formatCurrency(candidate.detailed_costs?.cleaning_deposit || 500, currency)}
                      </span>
                    </div>

                    <div className="flex justify-between font-bold text-sm pt-2.5 border-t border-border/60 text-emerald-400 tabular-nums">
                      <span>Comprehensive Day Estimate:</span>
                      <span>
                        {formatCurrency(
                          candidate.detailed_costs?.total_comprehensive ||
                            (candidate.estimated_cost?.day_rate || 0) +
                              (candidate.estimated_cost?.permit_fee || 0) +
                              1700,
                          currency
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Crew Logistics & Studio Zone Rule */}
                <div className="rounded-xl border border-border bg-secondary/15 p-3.5 space-y-2.5">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                    Crew Travel Zone &amp; Per-Diem Impact
                  </span>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                    <span className="font-semibold block">
                      {candidate.detailed_costs?.crew_travel_zone ||
                        candidate.local_economy?.studio_zone_status ||
                        "Inside 30-Mile Studio Zone (TMZ)"}
                    </span>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      Under IATSE, DGA, and Teamster union jurisdiction, crew members report directly to set without requiring portal-to-portal travel pay, hotel bookings, or meal per-diems.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-background/50 border border-border space-y-1 text-muted-foreground">
                    <span className="font-semibold text-foreground block text-[11px]">
                      Estimated Crew Travel Savings:
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      Shooting locally within the production base zone saves an estimated <strong>$1,800 to $3,200 per shoot day</strong> compared to distant remote staging.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CINEMATIC PRECEDENTS */}
          {activeTab === "precedents" && (
            <div className="space-y-3 pt-1 text-xs">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                Film &amp; Television Productions Shot Here
              </span>
              {candidate.film_precedents && candidate.film_precedents.length > 0 ? (
                <div className="space-y-2">
                  {candidate.film_precedents.map((prec, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 rounded-xl border border-border bg-secondary/15 flex items-start gap-3"
                    >
                      <div className="h-8 w-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0 mt-0.5">
                        <Film className="h-4 w-4" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">{prec.film}</span>
                          <span className="text-muted-foreground text-[10px] font-mono">
                            dir. {prec.director}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {prec.why}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border text-center text-muted-foreground">
                  No cinematic precedents logged yet. Add references in custom location staging.
                </div>
              )}

              {/* Practical Staging Notes */}
              <div className="rounded-xl border border-border bg-secondary/15 p-3 space-y-1 mt-2">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                  Practical Logistics Notes
                </span>
                <p className="text-[11px] text-foreground leading-relaxed">
                  {candidate.practical_notes || "Standard municipal production rules apply."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: PROS & CONS */}
          {activeTab === "pros_cons" && (
            <div className="space-y-3 pt-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Advantages */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2.5">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    Filming Advantages (Pros)
                  </span>
                  <ul className="space-y-2 text-foreground">
                    {(
                      candidate.pros || [
                        "Pristine acoustic sound isolation with zero ambient street rumble",
                        "Authentic architectural texture provides instant cinematic production value",
                        "Direct alley loading bay with 400A Camlock power tie-in",
                        "Eligible for municipal and state film production tax credits",
                      ]
                    ).map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Constraints */}
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 space-y-2.5">
                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <ThumbsDown className="h-3.5 w-3.5" />
                    Logistical Constraints (Cons)
                  </span>
                  <ul className="space-y-2 text-foreground">
                    {(
                      candidate.cons || [
                        "Strict 10 PM sound curfew unless neighbor signatures waiver is submitted 5 days prior",
                        "Single freight elevator bottleneck requires strict staggered load-in schedules",
                        "Street-level parking requires police monitor officer for lane coning",
                      ]
                    ).map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FILMMAKER REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-3 pt-1 text-xs">
              {(
                candidate.reviews || [
                  {
                    author: "Elena Rostova",
                    role: "Supervising Location Manager (LMGI / DGA)",
                    rating: 4.9,
                    quote:
                      "One of the best practical locations in the district. Building superintendent understands film crew protocols and gave us 24h keycard access. Make sure your generator truck arrives before 6:30 AM to secure alley docking.",
                    project_type: "Studio Crime Thriller",
                  },
                  {
                    author: "David Chen",
                    role: "Director of Photography",
                    rating: 4.7,
                    quote:
                      "The practical ceiling fluoros and deep architectural perspective gave us instant Fincher mood. Sound recordist was thrilled with the thick concrete sound barrier.",
                    project_type: "Neo-Noir Drama",
                  },
                ]
              ).map((rev, rIdx) => (
                <div
                  key={rIdx}
                  className="p-3.5 rounded-xl border border-border bg-secondary/15 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-foreground text-xs block">{rev.author}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {rev.role} {rev.project_type && `· ${rev.project_type}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-300 text-xs font-semibold tabular-nums">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{rev.rating.toFixed(1)} / 5.0</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-foreground/90 italic leading-relaxed">
                    &ldquo;{rev.quote}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: LOCAL FILM ECONOMY & RIGGING */}
          {activeTab === "economy" && (
            <div className="space-y-4 pt-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tax Credits & Nearby Vendors */}
                <div className="rounded-xl border border-border bg-secondary/15 p-3.5 space-y-2.5">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                    Tax Incentives &amp; Local Vendors
                  </span>
                  <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/25 text-accent space-y-1">
                    <span className="font-semibold block text-xs">
                      {candidate.local_economy?.tax_incentive ||
                        "State/Regional Production Tax Credit Qualified (20%–35%)"}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Eligible local spend (location fees, municipal police monitors, in-zone crew payroll) qualifies toward production tax credit audits.
                    </p>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                      Nearby Equipment Rental Houses:
                    </span>
                    <div className="space-y-1">
                      {(
                        candidate.local_economy?.nearby_vendors || [
                          "Panavision (Camera & Anamorphic Glass)",
                          "Quixote / Cinelease (Grip & Electric Trucks)",
                          "MBS Equipment Co (Stage Lighting)",
                        ]
                      ).map((vend, vI) => (
                        <div key={vI} className="flex items-center gap-1.5 text-[11px] text-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                          <span>{vend}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sound & Power Specs */}
                <div className="rounded-xl border border-border bg-secondary/15 p-3.5 space-y-2.5">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                    Technical Sound &amp; Power Rigging
                  </span>
                  <div className="p-2.5 rounded-lg bg-background/50 border border-border space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                      Sound &amp; Acoustics:
                    </span>
                    <p className="text-[11px] text-foreground leading-relaxed">
                      {candidate.sound_and_acoustics ||
                        "Subterranean concrete acoustic isolation; pristine dialogue recording with zero street traffic bleed."}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-background/50 border border-border space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                      Electrical Power &amp; Generators:
                    </span>
                    <p className="text-[11px] text-foreground leading-relaxed">
                      {candidate.power_specs ||
                        "400A 3-Phase Camlock tie-in available on-site; silent whisper-watt generator permitted in rear alley."}
                    </p>
                  </div>

                  {/* Sources & Citations */}
                  {candidate.sources && candidate.sources.length > 0 && (
                    <div className="pt-2 border-t border-border/40 space-y-1">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">
                        Verified Sources &amp; Citations:
                      </span>
                      <div className="space-y-1">
                        {candidate.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[10px] text-accent hover:underline truncate"
                          >
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">{src.title || src.url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dossier Footer Action Bar */}
        <div className="p-3 sm:p-3.5 border-t border-border bg-secondary/30 flex items-center justify-between gap-3 shrink-0">
          {onAskAI ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onAskAI(candidate);
                onClose();
              }}
              className="text-xs h-8 px-3 gap-1.5 text-accent border-accent/40 hover:bg-accent/10 cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Ask AI Scout Q&amp;A</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 px-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Close
            </Button>

            {isLocked ? (
              onUnlockCandidate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onUnlockCandidate(candidate);
                    onClose();
                  }}
                  className="text-xs h-8 px-3 gap-1.5 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Unlock Location</span>
                </Button>
              )
            ) : (
              onLockCandidate && (
                <Button
                  size="sm"
                  onClick={() => {
                    onLockCandidate(candidate);
                    onClose();
                  }}
                  className="text-xs h-8 px-4 gap-1.5 bg-accent text-accent-foreground font-semibold hover:bg-accent/90 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Lock In Location</span>
                </Button>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
