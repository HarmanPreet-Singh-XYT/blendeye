"use client";

import * as React from "react";
import {
  type ProjectData,
  type FilmScene,
  type LocationCandidate,
  formatCurrency,
  saveProject,
} from "@/lib/project-store";
import {
  LOCATION_STYLE_PRESETS,
  LOCATION_CAMERA_FRAMINGS,
  STUDIO_STAGE_TEMPLATES,
  cleanCandidateName,
  synthesizeLocationVisualPrompt,
} from "@/components/cinema/location-board";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { notifyIfFallback } from "@/lib/fallback-notice";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Sparkles,
  RefreshCw,
  DollarSign,
  CheckCircle2,
  Lock,
  Unlock,
  ExternalLink,
  MessageSquare,
  Building2,
  Film,
  Send,
  Camera,
  Loader2,
  Maximize2,
  Tv,
  Check,
  Plus,
  FileText,
} from "lucide-react";
import { LocationDossierDialog } from "@/components/cinema/location-dossier-dialog";

export interface SceneLocationDockProps {
  project: ProjectData;
  scene: FilmScene;
  onUpdateScene: (updatedScene: FilmScene) => void;
  onUpdateProject?: (updatedProject: ProjectData) => void;
  className?: string;
}

interface QAMessage {
  sender: "user" | "agent";
  text: string;
  sources?: Array<{ title: string; url: string }>;
  suggestedFollowups?: string[];
  timestamp: number;
  isFallback?: boolean;
}

export function SceneLocationDock({
  project,
  scene,
  onUpdateScene,
  onUpdateProject,
  className,
}: SceneLocationDockProps) {
  // Local editable scene fields
  const [locationName, setLocationName] = React.useState(scene.location || "");
  const [shootRegion, setShootRegion] = React.useState(scene.shootRegion || "");
  const [locationBudget, setLocationBudget] = React.useState<string>(
    scene.locationBudget !== undefined ? String(scene.locationBudget) : ""
  );
  const [isSavingDetails, setIsSavingDetails] = React.useState(false);
  const [hasDirtyDetails, setHasDirtyDetails] = React.useState(false);

  // Sync state if scene prop changes
  React.useEffect(() => {
    setLocationName(scene.location || "");
    setShootRegion(scene.shootRegion || "");
    setLocationBudget(scene.locationBudget !== undefined ? String(scene.locationBudget) : "");
    setHasDirtyDetails(false);
  }, [scene.id, scene.location, scene.shootRegion, scene.locationBudget]);

  // Scouting State
  const [isScouting, setIsScouting] = React.useState(false);

  // Keyframe Image Generation State
  const [isGeneratingImage, setIsGeneratingImage] = React.useState<Record<string, boolean>>({});
  const [selectedPresetPerCand, setSelectedPresetPerCand] = React.useState<Record<string, string>>({});
  const [selectedFramingPerCand, setSelectedFramingPerCand] = React.useState<Record<string, string>>({});
  const [expandedImageCandidate, setExpandedImageCandidate] = React.useState<LocationCandidate | null>(null);

  // Studio Stage Modal State
  const [isAddStudioModalOpen, setIsAddStudioModalOpen] = React.useState(false);
  const [selectedStudioTemplateId, setSelectedStudioTemplateId] = React.useState<string>(
    STUDIO_STAGE_TEMPLATES[0].id
  );
  const [customStudioName, setCustomStudioName] = React.useState(STUDIO_STAGE_TEMPLATES[0].name);

  // Add Custom Location Modal State
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = React.useState(false);
  const [customLocName, setCustomLocName] = React.useState("");
  const [customLocCategory, setCustomLocCategory] = React.useState("warehouse");
  const [customLocRegion, setCustomLocRegion] = React.useState("");
  const [customLocDayRate, setCustomLocDayRate] = React.useState("2500");
  const [customLocPermitFee, setCustomLocPermitFee] = React.useState("500");
  const [customLocFilmPrecedent, setCustomLocFilmPrecedent] = React.useState("");
  const [customLocDirector, setCustomLocDirector] = React.useState("");
  const [customLocWhy, setCustomLocWhy] = React.useState("");
  const [customLocPracticalNotes, setCustomLocPracticalNotes] = React.useState("");
  const [customLocAutoLock, setCustomLocAutoLock] = React.useState(false);

  // Q&A State
  const [activeQACandidate, setActiveQACandidate] = React.useState<LocationCandidate | null>(null);
  const [qaMessages, setQaMessages] = React.useState<Record<string, QAMessage[]>>({});
  const [qaInput, setQaInput] = React.useState("");
  const [isAskingQA, setIsAskingQA] = React.useState(false);

  // Production Dossier Modal State
  const [dossierCandidate, setDossierCandidate] = React.useState<LocationCandidate | null>(null);

  // Calculations
  const currency = project.currency || "USD";
  const locAllocationPct = project.budgetAllocation?.locationsPct
    ? project.budgetAllocation.locationsPct / 100
    : 0.15;
  const defaultSceneBudget = Math.round(
    (locAllocationPct * (project.budget || 250000)) /
      Math.max(1, project.scenes?.length || 1)
  );
  const effectiveSceneBudget =
    scene.locationBudget !== undefined && scene.locationBudget !== null
      ? scene.locationBudget
      : defaultSceneBudget;

  const candidates = scene.locationCandidates || [];
  const lockedCandidate = candidates.find(
    (c) => c.candidate_id === scene.selectedLocationCandidateId
  );

  // Save Scene Location Details
  const handleSaveSceneDetails = () => {
    setIsSavingDetails(true);
    const budgetNum = locationBudget.trim() !== "" ? Number(locationBudget) : undefined;
    const updatedScene: FilmScene = {
      ...scene,
      location: locationName.trim() || scene.location || "Set Location",
      shootRegion: shootRegion.trim() || undefined,
      locationBudget: Number.isFinite(budgetNum) ? budgetNum : undefined,
    };

    onUpdateScene(updatedScene);

    if (project.scenes) {
      const updatedScenes = project.scenes.map((s) => (s.id === scene.id ? updatedScene : s));
      const updatedProject: ProjectData = {
        ...project,
        scenes: updatedScenes,
        updatedAt: Date.now(),
      };
      saveProject(updatedProject);
      onUpdateProject?.(updatedProject);
    }

    setHasDirtyDetails(false);
    setIsSavingDetails(false);
    toast.add({
      title: "Scene Location Saved",
      description: `Updated location setting and budget for Scene ${scene.sceneNumber}.`,
      type: "success",
    });
  };

  // Run AI Location Scout for this scene
  const handleScoutScene = async () => {
    setIsScouting(true);
    const productionBase = shootRegion.trim() || project.shootRegion || "Los Angeles, CA";

    const payload = {
      production_base: productionBase,
      currency: currency,
      scenes: [
        {
          scene_id: scene.id,
          scene_number: scene.sceneNumber,
          title: scene.title,
          slugline: scene.slugline,
          location: locationName.trim() || scene.location,
          summary: scene.summary,
          shoot_region: productionBase,
          location_budget: effectiveSceneBudget,
        },
      ],
    };

    try {
      const res = await fetch("/api/location/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Location scout returned status ${res.status}`);
      }

      const data = await res.json();
      const wasFallback = notifyIfFallback(data, "Scene Location Scout");

      if (Array.isArray(data.scenes) && data.scenes[0]) {
        const scResult = data.scenes[0];
        const newCandidates: LocationCandidate[] = scResult.candidates || [];

        if (newCandidates.length > 0) {
          const autoLock = scene.selectedLocationCandidateId || newCandidates[0].candidate_id;
          const updatedScene: FilmScene = {
            ...scene,
            locationCandidates: newCandidates,
            selectedLocationCandidateId: autoLock,
            location: cleanCandidateName(newCandidates[0].name) || scene.location,
          };

          onUpdateScene(updatedScene);

          if (project.scenes) {
            const updatedScenes = project.scenes.map((s) => (s.id === scene.id ? updatedScene : s));
            const updatedProject: ProjectData = {
              ...project,
              scenes: updatedScenes,
              updatedAt: Date.now(),
            };
            saveProject(updatedProject);
            onUpdateProject?.(updatedProject);
          }

          if (!wasFallback) {
            toast.add({
              title: "Scouting Complete",
              description: `Found ${newCandidates.length} real-world location candidates near ${productionBase}.`,
              type: "success",
            });
          }
        } else {
          toast.add({
            title: "Scout Complete",
            description: "No new candidates returned. Try tweaking the location setting or region.",
            type: "neutral",
          });
        }
      }
    } catch (err) {
      console.error("Failed to scout scene location:", err);
      toast.add({
        title: "Scout Request Failed",
        description: err instanceof Error ? err.message : "Unable to reach research service.",
        type: "error",
      });
    } finally {
      setIsScouting(false);
    }
  };

  // Lock In / Unlock Candidate
  const handleToggleLockCandidate = (cand: LocationCandidate) => {
    const isCurrentlyLocked = scene.selectedLocationCandidateId === cand.candidate_id;
    const newLockId = isCurrentlyLocked ? undefined : cand.candidate_id;
    const newLocation = isCurrentlyLocked
      ? scene.location
      : cleanCandidateName(cand.name);

    const updatedScene: FilmScene = {
      ...scene,
      selectedLocationCandidateId: newLockId,
      location: newLocation,
    };

    onUpdateScene(updatedScene);

    if (project.scenes) {
      const updatedScenes = project.scenes.map((s) => (s.id === scene.id ? updatedScene : s));
      const updatedProject: ProjectData = {
        ...project,
        scenes: updatedScenes,
        updatedAt: Date.now(),
      };
      saveProject(updatedProject);
      onUpdateProject?.(updatedProject);
    }

    toast.add({
      title: isCurrentlyLocked ? "Location Unlocked" : "Location Locked In",
      description: isCurrentlyLocked
        ? `Unlocked location for Scene ${scene.sceneNumber}.`
        : `Locked "${cleanCandidateName(cand.name)}" for Scene ${scene.sceneNumber}.`,
      type: "success",
    });
  };

  // Generate Visual Keyframe for Candidate
  const handleGenerateKeyframe = async (cand: LocationCandidate) => {
    const candId = cand.candidate_id;
    const preset = selectedPresetPerCand[candId] || LOCATION_STYLE_PRESETS[0].name;
    const framing = selectedFramingPerCand[candId] || LOCATION_CAMERA_FRAMINGS[0].name;

    const prompt = synthesizeLocationVisualPrompt(cand, scene, preset, framing);

    setIsGeneratingImage((prev) => ({ ...prev, [candId]: true }));
    try {
      const res = await fetch("/api/media/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspect_ratio: "16:9",
        }),
      });

      if (!res.ok) {
        throw new Error(`Generation failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      notifyIfFallback(data, "Visual Keyframe Generation");

      if (!data.image_url) {
        throw new Error(data.error || "No image URL returned");
      }

      const updatedCandidates = (scene.locationCandidates || []).map((c) => {
        if (c.candidate_id === candId) {
          return {
            ...c,
            preview_image_url: data.image_url,
            preview_image_prompt: prompt,
            preview_style_preset: preset,
            preview_camera_framing: framing,
          };
        }
        return c;
      });

      const updatedScene: FilmScene = {
        ...scene,
        locationCandidates: updatedCandidates,
      };

      onUpdateScene(updatedScene);

      if (project.scenes) {
        const updatedScenes = project.scenes.map((s) => (s.id === scene.id ? updatedScene : s));
        const updatedProject: ProjectData = {
          ...project,
          scenes: updatedScenes,
          updatedAt: Date.now(),
        };
        saveProject(updatedProject);
        onUpdateProject?.(updatedProject);
      }

      toast.add({
        title: "Keyframe Rendered",
        description: `Generated 16:9 visual concept for ${cleanCandidateName(cand.name)}.`,
        type: "success",
      });
    } catch (err) {
      console.error("Keyframe generation error:", err);
      toast.add({
        title: "Keyframe Generation Failed",
        description: err instanceof Error ? err.message : "Failed to generate keyframe.",
        type: "error",
      });
    } finally {
      setIsGeneratingImage((prev) => ({ ...prev, [candId]: false }));
    }
  };

  // Add Studio Stage Candidate
  const handleAddStudioStage = () => {
    const tpl =
      STUDIO_STAGE_TEMPLATES.find((t) => t.id === selectedStudioTemplateId) ||
      STUDIO_STAGE_TEMPLATES[0];

    const candId = `studio-${scene.id}-${Date.now()}`;
    const newCand: LocationCandidate = {
      candidate_id: candId,
      name: customStudioName.trim() || tpl.name,
      region: shootRegion.trim() || project.shootRegion || "Los Angeles, CA",
      category: tpl.category,
      environment_type: tpl.environment_type,
      rank_score: 0.94,
      score_breakdown: {
        budget_fit: 0.9,
        creative_fit: 0.96,
        shootability: 0.98,
        consolidation_bonus: 0.92,
      },
      estimated_cost: {
        day_rate: tpl.day_rate,
        permit_fee: tpl.permit_fee,
        currency: currency,
        notes: `Studio stage package. Paint fee: $${tpl.paint_fee}. Sound isolated (${tpl.sound_rating}).`,
      },
      film_precedents: [tpl.film_precedent],
      practical_notes: `${tpl.description} Clear grid height: ${tpl.grid_height}. Power: ${tpl.power_capacity}. ${tpl.pros.join("; ")}.`,
      stage_specs: {
        stage_type: tpl.stage_type,
        cyc_type: tpl.cyc_type,
        dimensions: tpl.dimensions,
        grid_height: tpl.grid_height,
        power_capacity: tpl.power_capacity,
        sound_rating: tpl.sound_rating,
      },
      shared_with_scenes: [scene.id],
      sources: [],
      search_grounded: false,
    };

    const updatedCandidates = [newCand, ...(scene.locationCandidates || [])];
    const updatedScene: FilmScene = {
      ...scene,
      locationCandidates: updatedCandidates,
      selectedLocationCandidateId: candId,
      location: newCand.name,
    };

    onUpdateScene(updatedScene);

    if (project.scenes) {
      const updatedScenes = project.scenes.map((s) => (s.id === scene.id ? updatedScene : s));
      const updatedProject: ProjectData = {
        ...project,
        scenes: updatedScenes,
        updatedAt: Date.now(),
      };
      saveProject(updatedProject);
      onUpdateProject?.(updatedProject);
    }

    setIsAddStudioModalOpen(false);
    toast.add({
      title: "Studio Stage Added & Locked",
      description: `Configured ${newCand.name} for Scene ${scene.sceneNumber}.`,
      type: "success",
    });
  };

  // Add Custom Location Candidate
  const handleAddCustomLocation = () => {
    const trimmedName = customLocName.trim();
    if (!trimmedName) {
      toast.add({
        title: "Location Name Required",
        description: "Please enter a location name or venue title.",
        type: "error",
      });
      return;
    }

    const candId = `custom-loc-${Date.now()}`;
    const dayRateNum = Number(customLocDayRate) || 2000;
    const permitFeeNum = Number(customLocPermitFee) || 300;
    const regionVal =
      customLocRegion.trim() || shootRegion.trim() || project.shootRegion || "Production Base";

    const newCand: LocationCandidate = {
      candidate_id: candId,
      name: trimmedName,
      region: regionVal,
      category: customLocCategory.trim().toLowerCase() || "practical",
      environment_type: "practical",
      rank_score: 0.92,
      score_breakdown: {
        budget_fit: dayRateNum <= effectiveSceneBudget ? 0.95 : 0.75,
        creative_fit: 0.92,
        shootability: 0.90,
        consolidation_bonus: 0.85,
      },
      estimated_cost: {
        day_rate: dayRateNum,
        permit_fee: permitFeeNum,
        currency: currency,
        notes: `Custom scouted venue in ${regionVal}.`,
      },
      shared_with_scenes: [scene.id],
      film_precedents: customLocFilmPrecedent.trim()
        ? [
            {
              film: customLocFilmPrecedent.trim(),
              director: customLocDirector.trim() || "Director Comp",
              why: customLocWhy.trim() || "Atmospheric visual and staging reference",
            },
          ]
        : [],
      practical_notes: customLocPracticalNotes.trim() || "User-added production location.",
      sources: [],
      search_grounded: false,
    };

    const updatedCandidates = [...(scene.locationCandidates || []), newCand];
    const shouldLock = customLocAutoLock || !scene.selectedLocationCandidateId;

    const updatedScene: FilmScene = {
      ...scene,
      locationCandidates: updatedCandidates,
      selectedLocationCandidateId: shouldLock ? candId : scene.selectedLocationCandidateId,
      location: shouldLock ? cleanCandidateName(trimmedName) : scene.location,
    };

    onUpdateScene(updatedScene);

    if (project.scenes) {
      const updatedScenes = project.scenes.map((s) => (s.id === scene.id ? updatedScene : s));
      const updatedProject: ProjectData = {
        ...project,
        scenes: updatedScenes,
        updatedAt: Date.now(),
      };
      saveProject(updatedProject);
      onUpdateProject?.(updatedProject);
    }

    setIsAddLocationModalOpen(false);
    setCustomLocName("");
    setCustomLocFilmPrecedent("");
    setCustomLocDirector("");
    setCustomLocWhy("");
    setCustomLocPracticalNotes("");

    toast.add({
      title: "Location Added",
      description: `Added "${trimmedName}" to Scene ${scene.sceneNumber}${shouldLock ? " and locked as active venue." : "."}`,
      type: "success",
    });
  };

  // Ask AI Q&A
  const handleSendQA = async (cand: LocationCandidate, customQ?: string) => {
    const questionText = (customQ || qaInput).trim();
    if (!questionText || isAskingQA) return;

    const candId = cand.candidate_id;
    const userMsg: QAMessage = {
      sender: "user",
      text: questionText,
      timestamp: Date.now(),
    };

    setQaMessages((prev) => ({
      ...prev,
      [candId]: [...(prev[candId] || []), userMsg],
    }));
    setQaInput("");
    setIsAskingQA(true);

    try {
      const res = await fetch("/api/location/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate: cand,
          question: questionText,
          region: cand.region || shootRegion || project.shootRegion,
          project_title: project.title,
          genre: project.genre,
        }),
      });

      const data = await res.json();
      const agentMsg: QAMessage = {
        sender: "agent",
        text: data.answer || "No response received from location researcher.",
        sources: data.sources,
        suggestedFollowups: data.suggested_followups,
        timestamp: Date.now(),
        isFallback: Boolean(data._fallback),
      };

      setQaMessages((prev) => ({
        ...prev,
        [candId]: [...(prev[candId] || []), agentMsg],
      }));
    } catch (err) {
      console.error("QA request error:", err);
      const errorMsg: QAMessage = {
        sender: "agent",
        text: "Unable to reach the location QA service. Please check your network connection.",
        timestamp: Date.now(),
      };
      setQaMessages((prev) => ({
        ...prev,
        [candId]: [...(prev[candId] || []), errorMsg],
      }));
    } finally {
      setIsAskingQA(false);
    }
  };

  return (
    <div className={cn("space-y-3 text-foreground pb-2", className)}>
      {/* 1. COMPACT SCENE LOCATION & BUDGET TOOLBAR */}
      <div className="rounded-xl border border-border bg-card/85 p-3 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Scene Identity & Status Badge */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Scene {scene.sceneNumber}: {scene.title}
                </span>
                {lockedCandidate ? (
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-mono gap-1"
                  >
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                    Locked: {cleanCandidateName(lockedCandidate.name).slice(0, 28)}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono"
                  >
                    No Venue Locked
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground truncate block max-w-sm">
                {scene.slugline || "INT. SCENE - DAY"}
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCustomLocRegion(shootRegion.trim() || project.shootRegion || "Los Angeles, CA");
                setIsAddLocationModalOpen(true);
              }}
              className="h-7 text-xs font-semibold gap-1.5 border-border bg-secondary/40 hover:bg-secondary cursor-pointer"
              title="Add a custom scouted venue to this scene"
            >
              <Plus className="h-3.5 w-3.5 text-accent" />
              <span>+ Add Location</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddStudioModalOpen(true)}
              className="h-7 text-xs font-semibold gap-1.5 border-border bg-secondary/40 hover:bg-secondary cursor-pointer"
              title="Add a Green Screen Cyc, LED Volume, or Soundstage"
            >
              <Tv className="h-3.5 w-3.5 text-cyan-400" />
              <span>+ Studio Stage</span>
            </Button>

            <Button
              size="sm"
              onClick={handleScoutScene}
              disabled={isScouting}
              className="h-7 text-xs font-semibold gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs cursor-pointer"
            >
              {isScouting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Searching Film Offices...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Scout Scene</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Inline Editable Fields: Setting Name, Region Override, Budget Override */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-border/50">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>Location Setting</span>
            </label>
            <Input
              value={locationName}
              onChange={(e) => {
                setLocationName(e.target.value);
                setHasDirtyDetails(true);
              }}
              placeholder="e.g. Underground Bank Vault"
              className="h-7 text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>Shoot Region Override</span>
            </label>
            <Input
              value={shootRegion}
              onChange={(e) => {
                setShootRegion(e.target.value);
                setHasDirtyDetails(true);
              }}
              placeholder={project.shootRegion || "Los Angeles, CA"}
              className="h-7 text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>Scene Budget Override</span>
              </label>
              <span className="text-[9px] font-mono text-muted-foreground">
                Target: {formatCurrency(defaultSceneBudget, currency)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                value={locationBudget}
                onChange={(e) => {
                  setLocationBudget(e.target.value);
                  setHasDirtyDetails(true);
                }}
                placeholder={String(defaultSceneBudget)}
                className="h-7 text-xs font-mono bg-background"
              />
              {hasDirtyDetails && (
                <Button
                  size="sm"
                  onClick={handleSaveSceneDetails}
                  disabled={isSavingDetails}
                  className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 font-semibold cursor-pointer gap-1"
                  title="Save changes to scene location details"
                >
                  <Check className="h-3 w-3" />
                  <span>Save</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. CANDIDATE SHORTLIST */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              Location Candidates ({candidates.length})
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Budget Target: {formatCurrency(effectiveSceneBudget, currency)}
            </span>
          </div>

          {candidates.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleScoutScene}
              disabled={isScouting}
              className="h-6 px-2 text-[11px] font-mono text-muted-foreground hover:text-accent gap-1 cursor-pointer"
            >
              <RefreshCw className={cn("h-3 w-3", isScouting && "animate-spin")} />
              <span>Refresh Scout</span>
            </Button>
          )}
        </div>

        {candidates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 mx-auto flex items-center justify-center text-accent">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-xs font-bold text-foreground">
                No Locations Scouted for Scene {scene.sceneNumber}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Run the AI Location Scout to discover real-world locations, film office permit costs, and precedents in {shootRegion || project.shootRegion || "your production base"}, or quickly add a studio soundstage.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleScoutScene}
                disabled={isScouting}
                className="h-8 text-xs font-semibold gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
              >
                {isScouting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Searching Film Offices...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Scout Locations for This Scene</span>
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddStudioModalOpen(true)}
                className="h-8 text-xs font-semibold gap-1.5 border-border cursor-pointer"
              >
                <Tv className="h-3.5 w-3.5 text-cyan-400" />
                <span>+ Studio Stage</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {candidates.map((cand) => {
              const isLocked = scene.selectedLocationCandidateId === cand.candidate_id;
              const isGen = isGeneratingImage[cand.candidate_id];
              const candId = cand.candidate_id;
              const currentPreset = selectedPresetPerCand[candId] || LOCATION_STYLE_PRESETS[0].name;
              const currentFraming = selectedFramingPerCand[candId] || LOCATION_CAMERA_FRAMINGS[0].name;

              return (
                <div
                  key={cand.candidate_id}
                  className={cn(
                    "rounded-xl border p-3 transition-all flex flex-col sm:flex-row gap-3 items-stretch shadow-xs",
                    isLocked
                      ? "border-emerald-500/70 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/30"
                      : "border-border bg-card hover:border-border/80"
                  )}
                >
                  {/* LEFT: 16:9 Dedicated Media Slot (Unified height across cards) */}
                  <div className="sm:w-52 md:w-56 shrink-0 flex flex-col">
                    {cand.preview_image_url ? (
                      <div
                        onClick={() => setExpandedImageCandidate(cand)}
                        className="relative rounded-lg overflow-hidden border border-border bg-black aspect-video cursor-pointer group shadow-sm flex-1 min-h-[110px]"
                      >
                        <img
                          src={cand.preview_image_url}
                          alt={cand.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/55 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-[10px] text-white font-semibold flex items-center gap-1 bg-black/75 px-2 py-1 rounded">
                            <Maximize2 className="h-3 w-3" />
                            Expand Keyframe
                          </span>
                        </div>
                        <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                          <Badge className="text-[8px] bg-black/85 text-white/90 font-mono py-0 px-1.5 backdrop-blur-xs">
                            {cand.preview_style_preset?.slice(0, 18) || "35mm Scope"}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      /* Sleek Interactive Render Placeholder (matches 16:9 thumbnail exactly) */
                      <div
                        onClick={() => handleGenerateKeyframe(cand)}
                        className={cn(
                          "rounded-lg border border-dashed border-border/80 bg-secondary/20 aspect-video flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer group hover:bg-secondary/40 hover:border-accent/60 flex-1 min-h-[110px]",
                          isGen && "pointer-events-none opacity-80"
                        )}
                        title="Click to render a 16:9 cinematic keyframe look"
                      >
                        {isGen ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <Loader2 className="h-4 w-4 animate-spin text-accent" />
                            <span className="text-[10px] font-mono text-accent font-medium">
                              Rendering Look...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-foreground">
                            <div className="h-7 w-7 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:bg-accent/15 transition-colors">
                              <Camera className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-[10px] font-semibold">Render Concept Look</span>
                            <span className="text-[9px] font-mono text-muted-foreground/70">
                              Click to generate 16:9
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Metadata, Precedents, Selectors & Action Buttons */}
                  <div className="flex-1 flex flex-col justify-between gap-2 min-w-0">
                    {/* Top line: Badges & Cost */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-accent/15 text-accent border border-accent/30">
                            {Math.round((cand.rank_score || 0.85) * 100)}% Match
                          </span>
                          <Badge variant="outline" className="text-[9px] uppercase font-mono py-0">
                            {cand.category}
                          </Badge>
                          {isLocked && (
                            <Badge className="text-[9px] bg-emerald-600 text-white font-mono py-0 gap-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Locked
                            </Badge>
                          )}
                        </div>

                        {/* Cost */}
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-foreground">
                            {formatCurrency(cand.estimated_cost?.day_rate || 0, currency)}
                          </span>
                          <span className="text-[9px] font-mono text-muted-foreground ml-1">
                            + permit {formatCurrency(cand.estimated_cost?.permit_fee || 0, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Venue Name & Region */}
                      <h4
                        onClick={() => setDossierCandidate(cand)}
                        className="text-xs font-bold text-foreground leading-snug line-clamp-1 cursor-pointer hover:text-accent hover:underline transition-colors"
                        title="Click to view full production dossier and specs"
                      >
                        {cleanCandidateName(cand.name)}
                      </h4>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 line-clamp-1">
                        <MapPin className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                        <span>{cand.region || shootRegion || project.shootRegion}</span>
                      </p>
                    </div>

                    {/* Precedent Snippet */}
                    {cand.film_precedents?.[0] ? (
                      <p className="text-[10px] text-muted-foreground bg-secondary/30 rounded px-2 py-1 border border-border/40 line-clamp-1 leading-snug">
                        <strong className="text-foreground font-medium">
                          {cand.film_precedents[0].film}:
                        </strong>{" "}
                        {cand.film_precedents[0].why}
                      </p>
                    ) : (
                      cand.practical_notes && (
                        <p className="text-[10px] text-muted-foreground bg-secondary/30 rounded px-2 py-1 border border-border/40 line-clamp-1 leading-snug">
                          {cand.practical_notes}
                        </p>
                      )
                    )}

                    {/* Controls Row: Style, Framing, Lock & Render */}
                    <div className="space-y-1.5 pt-1 border-t border-border/40">
                      <div className="grid grid-cols-2 gap-1.5">
                        <select
                          value={currentPreset}
                          onChange={(e) =>
                            setSelectedPresetPerCand((prev) => ({
                              ...prev,
                              [candId]: e.target.value,
                            }))
                          }
                          className="w-full h-6 rounded border border-border bg-background px-1.5 text-[9px] text-foreground truncate"
                        >
                          {LOCATION_STYLE_PRESETS.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>

                        <select
                          value={currentFraming}
                          onChange={(e) =>
                            setSelectedFramingPerCand((prev) => ({
                              ...prev,
                              [candId]: e.target.value,
                            }))
                          }
                          className="w-full h-6 rounded border border-border bg-background px-1.5 text-[9px] text-foreground truncate"
                        >
                          {LOCATION_CAMERA_FRAMINGS.map((f) => (
                            <option key={f.id} value={f.name}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant={isLocked ? "default" : "outline"}
                          onClick={() => handleToggleLockCandidate(cand)}
                          className={cn(
                            "h-6.5 flex-1 text-[11px] font-semibold gap-1 cursor-pointer py-0",
                            isLocked
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                              : "border-border hover:border-accent hover:text-accent"
                          )}
                        >
                          {isLocked ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Locked In</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              <span>Lock In</span>
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isGen}
                          onClick={() => handleGenerateKeyframe(cand)}
                          className="h-6.5 text-[11px] font-semibold gap-1 border-accent/40 text-accent hover:bg-accent/10 cursor-pointer py-0 px-2.5"
                          title="Render on-demand 16:9 cinematic keyframe"
                        >
                          {isGen ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Camera className="h-3 w-3" />
                          )}
                          <span>{cand.preview_image_url ? "Re-render" : "Render"}</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDossierCandidate(cand)}
                          className="h-6.5 text-[11px] font-semibold gap-1 border-border hover:border-accent hover:text-accent cursor-pointer py-0 px-2"
                          title="View complete production dossier: acoustics, power, stage dimensions, permit breakdown, precedents & reviews"
                        >
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span>Specs</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setActiveQACandidate(cand)}
                          className="h-6.5 w-6.5 p-0 text-muted-foreground hover:text-accent cursor-pointer shrink-0"
                          title="Ask AI Location Scout questions about this venue"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. ADD CUSTOM LOCATION MODAL */}
      <Dialog open={isAddLocationModalOpen} onOpenChange={setIsAddLocationModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-accent" />
              <span>Add Custom Location Candidate</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Manually append a scouted venue, real-world street, or private property for Scene {scene.sceneNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            {/* Location Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-muted-foreground block">
                Venue / Location Name *
              </label>
              <Input
                value={customLocName}
                onChange={(e) => setCustomLocName(e.target.value)}
                placeholder="e.g. Grand Central Whispering Gallery or Tribeca Loft"
                className="h-8 text-xs bg-background"
                autoFocus
              />
            </div>

            {/* Category & Region */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Category
                </label>
                <select
                  value={customLocCategory}
                  onChange={(e) => setCustomLocCategory(e.target.value)}
                  className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
                >
                  <option value="warehouse">Warehouse / Industrial</option>
                  <option value="rooftop">Rooftop / Skyline</option>
                  <option value="vault">Vault / Secure Room</option>
                  <option value="subterranean">Subterranean / Bunker</option>
                  <option value="residential">Residential / Apartment</option>
                  <option value="diner">Diner / Restaurant</option>
                  <option value="office">Office / Corporate</option>
                  <option value="exterior-street">Exterior Street / Alley</option>
                  <option value="transit">Transit / Station / Subway</option>
                  <option value="park">Park / Waterfront</option>
                  <option value="historic">Historic / Landmark</option>
                  <option value="practical">Other Practical Venue</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Region / City
                </label>
                <Input
                  value={customLocRegion}
                  onChange={(e) => setCustomLocRegion(e.target.value)}
                  placeholder={shootRegion || project.shootRegion || "City, State"}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            {/* Costs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Estimated Day Rate ($)
                </label>
                <Input
                  type="number"
                  value={customLocDayRate}
                  onChange={(e) => setCustomLocDayRate(e.target.value)}
                  placeholder="2500"
                  className="h-8 text-xs font-mono bg-background"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Permit Fee ($)
                </label>
                <Input
                  type="number"
                  value={customLocPermitFee}
                  onChange={(e) => setCustomLocPermitFee(e.target.value)}
                  placeholder="500"
                  className="h-8 text-xs font-mono bg-background"
                />
              </div>
            </div>

            {/* Optional Precedent */}
            <div className="space-y-1 pt-1 border-t border-border/50">
              <label className="text-[10px] font-mono uppercase text-muted-foreground block">
                Cinematic Precedent (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={customLocFilmPrecedent}
                  onChange={(e) => setCustomLocFilmPrecedent(e.target.value)}
                  placeholder="Film Title (e.g. Inside Man)"
                  className="h-8 text-xs bg-background"
                />
                <Input
                  value={customLocDirector}
                  onChange={(e) => setCustomLocDirector(e.target.value)}
                  placeholder="Director (e.g. Spike Lee)"
                  className="h-8 text-xs bg-background"
                />
              </div>
              <Input
                value={customLocWhy}
                onChange={(e) => setCustomLocWhy(e.target.value)}
                placeholder="Why it works (e.g. Tight subterranean sightlines)"
                className="h-8 text-xs bg-background mt-1"
              />
            </div>

            {/* Practical Notes */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-muted-foreground block">
                Practical Logistics &amp; Constraints (Optional)
              </label>
              <Input
                value={customLocPracticalNotes}
                onChange={(e) => setCustomLocPracticalNotes(e.target.value)}
                placeholder="e.g. Freight elevator on 44th St; night access only after 9pm"
                className="h-8 text-xs bg-background"
              />
            </div>

            {/* Auto Lock Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoLockCheck"
                checked={customLocAutoLock}
                onChange={(e) => setCustomLocAutoLock(e.target.checked)}
                className="rounded border-border h-3.5 w-3.5 text-accent cursor-pointer"
              />
              <label htmlFor="autoLockCheck" className="text-[11px] text-foreground cursor-pointer select-none">
                Immediately lock this as the active location for Scene {scene.sceneNumber}
              </label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddLocationModalOpen(false)}
              className="h-8 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddCustomLocation}
              disabled={!customLocName.trim()}
              className="h-8 text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
            >
              Add Location to Scene
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. STUDIO STAGE CREATION MODAL */}
      <Dialog open={isAddStudioModalOpen} onOpenChange={setIsAddStudioModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Tv className="h-4 w-4 text-cyan-400" />
              <span>Add Studio Soundstage or Virtual Volume</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select a professional stage template equipped with lighting grid, soundproofing, and power distribution.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-muted-foreground">
                Stage Template
              </label>
              <div className="space-y-1.5">
                {STUDIO_STAGE_TEMPLATES.map((tpl) => {
                  const isSelected = selectedStudioTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedStudioTemplateId(tpl.id);
                        setCustomStudioName(tpl.name);
                      }}
                      className={cn(
                        "rounded-lg border p-2.5 cursor-pointer transition-colors text-xs space-y-1",
                        isSelected
                          ? "border-accent bg-accent/10"
                          : "border-border hover:bg-secondary/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{tpl.name}</span>
                        <span className="font-mono text-[10px] text-accent font-bold">
                          ${tpl.day_rate}/day
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{tpl.description}</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground pt-0.5">
                        <span>Grid: {tpl.grid_height}</span>
                        <span>•</span>
                        <span>{tpl.sound_rating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-muted-foreground">
                Stage Name / Stage Number
              </label>
              <Input
                value={customStudioName}
                onChange={(e) => setCustomStudioName(e.target.value)}
                placeholder="e.g. Stage 4 — Infinite Green Cyc"
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddStudioModalOpen(false)}
              className="h-8 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddStudioStage}
              className="h-8 text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
            >
              Add Stage to Scene
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. FULL-SCREEN IMAGE KEYFRAME MODAL */}
      <Dialog
        open={expandedImageCandidate !== null}
        onOpenChange={(open) => {
          if (!open) setExpandedImageCandidate(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl bg-card border-border p-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center justify-between">
              <span>{cleanCandidateName(expandedImageCandidate?.name || "")}</span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {expandedImageCandidate?.preview_style_preset || "16:9 Concept"}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {expandedImageCandidate?.preview_camera_framing} • {expandedImageCandidate?.region}
            </DialogDescription>
          </DialogHeader>

          {expandedImageCandidate?.preview_image_url && (
            <div className="rounded-lg overflow-hidden border border-border bg-black aspect-video mt-2">
              <img
                src={expandedImageCandidate.preview_image_url}
                alt={expandedImageCandidate.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {expandedImageCandidate?.preview_image_prompt && (
            <div className="rounded bg-secondary/30 p-2 text-[10px] font-mono text-muted-foreground mt-2 border border-border">
              <span className="font-bold text-foreground">Synthesized Prompt: </span>
              {expandedImageCandidate.preview_image_prompt}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. AI Q&A ASSISTANT MODAL */}
      <Dialog
        open={activeQACandidate !== null}
        onOpenChange={(open) => {
          if (!open) setActiveQACandidate(null);
        }}
      >
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" />
              <span>Location AI Dossier Q&amp;A</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ask targeted questions about {cleanCandidateName(activeQACandidate?.name || "")} (noise constraints, permits, film history).
            </DialogDescription>
          </DialogHeader>

          {activeQACandidate && (
            <div className="space-y-3 pt-2">
              {/* Message History */}
              <div className="max-h-60 overflow-y-auto space-y-2.5 p-2 rounded-lg bg-background border border-border">
                {!(qaMessages[activeQACandidate.candidate_id] || []).length ? (
                  <div className="text-center py-4 text-xs text-muted-foreground space-y-2">
                    <p>No questions asked yet for this venue.</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {[
                        "What is the noise level during evening shoots?",
                        "What is the permit turnaround time?",
                        "What films shot here before?",
                      ].map((sugg) => (
                        <button
                          key={sugg}
                          type="button"
                          onClick={() => handleSendQA(activeQACandidate, sugg)}
                          className="text-[10px] font-mono px-2 py-1 rounded bg-secondary hover:bg-accent/15 hover:text-accent border border-border transition-colors cursor-pointer text-left"
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  qaMessages[activeQACandidate.candidate_id].map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-lg p-2.5 text-xs max-w-[85%] space-y-1",
                        msg.sender === "user"
                          ? "ml-auto bg-accent text-accent-foreground font-medium"
                          : "mr-auto bg-secondary/70 text-foreground border border-border"
                      )}
                    >
                      <p>{msg.text}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="text-[10px] font-mono opacity-80 pt-1 border-t border-border/40 space-y-0.5">
                          <span className="font-bold">Sources:</span>
                          {msg.sources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-accent hover:underline truncate"
                            >
                              • {s.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="flex items-center gap-1.5">
                <Input
                  value={qaInput}
                  onChange={(e) => setQaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendQA(activeQACandidate);
                    }
                  }}
                  placeholder="Ask about acoustics, power, or city permits..."
                  className="h-8 text-xs bg-background"
                />
                <Button
                  size="sm"
                  disabled={isAskingQA || !qaInput.trim()}
                  onClick={() => handleSendQA(activeQACandidate)}
                  className="h-8 px-3 bg-accent text-accent-foreground font-semibold cursor-pointer"
                >
                  {isAskingQA ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 6. COMPREHENSIVE PRODUCTION DOSSIER MODAL */}
      <LocationDossierDialog
        candidate={dossierCandidate}
        isOpen={Boolean(dossierCandidate)}
        onClose={() => setDossierCandidate(null)}
        currency={currency}
        scene={scene}
        isLocked={scene.selectedLocationCandidateId === dossierCandidate?.candidate_id}
        onLockCandidate={(cand) => handleToggleLockCandidate(cand)}
        onUnlockCandidate={(cand) => handleToggleLockCandidate(cand)}
        onAskAI={(cand) => {
          setActiveQACandidate(cand);
        }}
        onGenerateKeyframe={async (cand, preset, framing) => {
          setSelectedPresetPerCand((prev) => ({ ...prev, [cand.candidate_id]: preset }));
          setSelectedFramingPerCand((prev) => ({ ...prev, [cand.candidate_id]: framing }));
          await handleGenerateKeyframe(cand);
        }}
        isGeneratingKeyframe={dossierCandidate ? isGeneratingImage[dossierCandidate.candidate_id] : false}
      />
    </div>
  );
}
