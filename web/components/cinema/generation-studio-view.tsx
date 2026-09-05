"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { notifyIfFallback } from "@/lib/fallback-notice";
import {
  Film,
  Video,
  Play,
  Pause,
  Download,
  Sparkles,
  Camera,
  Maximize2,
  RefreshCw,
  Clock,
  Layers,
  Sliders,
  Check,
  FolderDown,
  Volume2,
  VolumeX,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ArrowLeft,
  Plus,
  Compass,
  Eye,
  Aperture,
  Grid,
  Copy,
  FastForward,
  Rewind,
  Clapperboard,
  User,
  Shirt,
} from "lucide-react";
import type { Node } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { ProjectCharacter } from "@/lib/project-store";
import { getVideoTakes, saveVideoTake, setMasterVideoTake, type VideoTake } from "@/lib/project-store";
import {
  synthesizeCinemaPrompt,
  type NodeContribution,
} from "@/lib/cinema-prompt-synthesizer";

interface GenerationStudioViewProps {
  projectId?: string;
  nodes?: Node[];
  sceneTitle: string;
  sceneSummary: string;
  screenplayText: string;
  characters: ProjectCharacter[];
  genre: string;
  projectTitle: string;
  onReturnToStudio?: () => void;
  initialCameraMotion?: string;
  initialPromptNote?: string;
}

interface CameraMotionOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Camera;
}

const CAMERA_MOTIONS: CameraMotionOption[] = [
  { id: "Slow Cinematic Dolly In", label: "Dolly In", description: "Slow dramatic push into subject tension", icon: Camera },
  { id: "High Crane Overhead Sweep", label: "Crane Sweep", description: "Overhead spatial geography reveal", icon: Compass },
  { id: "Handheld Gritty Tension", label: "Handheld", description: "Visceral, kinetic micro-shake", icon: Aperture },
  { id: "35mm Anamorphic Tracking Shot", label: "Tracking Shot", description: "Lateral tracking with cinematic bokeh", icon: Film },
  { id: "Static Master Table View", label: "Static Master", description: "Locked-off tableau composition", icon: Grid },
  { id: "Dutch Angle Push-In", label: "Dutch Push", description: "Tilted axis conveying psychological unease", icon: Eye },
];

const STYLE_PRESETS = [
  { id: "35mm Anamorphic Film, 2.39:1 Scope", label: "35mm Anamorphic Scope", desc: "Panavision blue streaks, oval bokeh, rich grain" },
  { id: "Neo-Noir Cyberpunk, Sodium Vapor & Rain", label: "Neo-Noir Sodium & Rain", desc: "High contrast amber streetlights, wet reflections" },
  { id: "70mm IMAX High-Contrast Master", label: "70mm IMAX Master", desc: "Razor-sharp resolution, deep dynamic range" },
  { id: "Gritty 16mm Indie Grain", label: "16mm Indie Grain", desc: "Textured celluloid, warm earthy shadows" },
  { id: "Fincher Low-Key Practical Cold/Amber", label: "Fincher Low-Key", desc: "Desaturated greens/ambers, precise geometric lighting" },
];

// Veo 3.1 only renders in these two ratios — no others are offered since
// picking anything else would silently render 16:9 and crop it with CSS.
const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 Widescreen", ratioClass: "aspect-video", safeGuide: "16:9 Standard" },
  { id: "9:16", label: "9:16 Mobile", ratioClass: "aspect-[9/16]", safeGuide: "9:16 Vertical" },
];

const PROMPT_SUGGESTIONS = [
  "+ 35mm Anamorphic",
  "+ Low-Key Chiaroscuro",
  "+ Volumetric Smoke & Hazing",
  "+ Golden Hour Rim Light",
  "+ Shallow Depth of Field",
  "+ Master Push-In",
  "+ Steadicam Tracking",
  "+ High Dynamic Range Film Grain",
];

interface RenderedTake {
  id: string;
  takeNumber: number;
  title: string;
  timestamp: string;
  durationSec: number;
  camera: string;
  style: string;
  videoUrl: string;
  prompt: string;
  isSample?: boolean;
}

export function GenerationStudioView({
  projectId,
  nodes = [],
  sceneTitle,
  sceneSummary,
  screenplayText,
  characters,
  genre,
  projectTitle,
  onReturnToStudio,
  initialCameraMotion,
  initialPromptNote,
}: GenerationStudioViewProps) {
  const effectiveProjectId = projectId || "vault-heist-demo";

  // Director Controls State
  const [activeTab, setActiveTab] = React.useState<"camera" | "dialogue" | "deliverables">("camera");
  const [cameraMotion, setCameraMotion] = React.useState<string>(
    initialCameraMotion || CAMERA_MOTIONS[0].id
  );
  const [stylePreset, setStylePreset] = React.useState<string>(STYLE_PRESETS[0].id);
  const [aspectRatio, setAspectRatio] = React.useState<string>("16:9");
  const [durationSec, setDurationSec] = React.useState<number>(6);
  const [showFrameGuides, setShowFrameGuides] = React.useState<boolean>(false);

  const [selectedCharacterName, setSelectedCharacterName] = React.useState<string | null>(null);
  const activeCharacter = characters.find((c) => c.name === selectedCharacterName);

  // Active conditioning image and contributing canvas nodes
  const [activeConditioningImage, setActiveConditioningImage] = React.useState<string | null>(null);
  const [activeImageType, setActiveImageType] = React.useState<"face" | "body" | null>(null);
  const [activeNodeContributions, setActiveNodeContributions] = React.useState<NodeContribution[]>([]);

  // Multi-node & character context synthesizer
  const runSynthesis = React.useCallback(
    (charName: string | null = selectedCharacterName, imgPref: "face" | "body" | "auto" = "auto") => {
      const res = synthesizeCinemaPrompt({
        nodes,
        characters,
        sceneTitle,
        sceneSummary,
        screenplayText,
        genre,
        focusCharacterName: charName,
        cameraMotion,
        stylePreset,
        imagePreference: imgPref,
      });

      setPrompt(res.fullPrompt);
      setActiveNodeContributions(res.contributions);
      setActiveConditioningImage(res.conditioningImageUrl);
      setActiveImageType(res.conditioningImageType === "scene" ? null : res.conditioningImageType);
    },
    [nodes, characters, sceneTitle, sceneSummary, screenplayText, genre, cameraMotion, stylePreset, selectedCharacterName]
  );

  const [prompt, setPrompt] = React.useState<string>(
    initialPromptNote
      ? `${initialPromptNote} Visual aesthetic: ${STYLE_PRESETS[0].label}. Masterful Hollywood cinematography.`
      : `Cinematic establishing shot of ${sceneTitle}. ${sceneSummary}. Moody cinematic lighting, shallow depth of field, photoreal anamorphic lens, high dramatic tension.`
  );

  React.useEffect(() => {
    if (!initialPromptNote) {
      runSynthesis(null);
    }
  }, []);

  // Video Generation & Playback State
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [generationStage, setGenerationStage] = React.useState<string>("");
  const pollIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = React.useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Stop any in-flight poll loop if this view unmounts (e.g. user navigates away mid-render).
  React.useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Load saved takes from project-store or default to verified local cinematic takes
  const initialSavedTakes = React.useMemo(() => {
    const takes = getVideoTakes(effectiveProjectId);
    if (takes && takes.length > 0) {
      return takes.map((t) => ({
        id: t.id,
        takeNumber: t.takeNumber,
        title: t.title,
        timestamp: "Project Vault",
        durationSec: t.durationSec,
        camera: t.cameraMotion,
        style: t.stylePreset,
        videoUrl: t.videoUrl,
        prompt: t.prompt || "",
      }));
    }
    return [
      {
        id: "take-1",
        takeNumber: 1,
        title: `${sceneTitle} — Sample Take 01`,
        timestamp: "Sample clip",
        durationSec: 6,
        camera: "35mm Anamorphic Tracking Shot",
        style: "35mm Anamorphic Scope",
        videoUrl: "/videos/vault_heist_take_01.mp4",
        prompt: `Cinematic establishing shot of ${sceneTitle}. Moody cinematic lighting, shallow depth of field, 35mm anamorphic lens.`,
        isSample: true,
      },
      {
        id: "take-2",
        takeNumber: 2,
        title: `${sceneTitle} — Sample Take 02`,
        timestamp: "Sample clip",
        durationSec: 6,
        camera: "Slow Cinematic Dolly In",
        style: "Neo-Noir Sodium & Rain",
        videoUrl: "/videos/directors_suite_take_01.mp4",
        prompt: `Close intimate push on character during ${sceneTitle}. Neo-noir sodium vapor and high contrast shadows.`,
        isSample: true,
      },
    ];
  }, [effectiveProjectId, sceneTitle]);

  const [recentTakes, setRecentTakes] = React.useState<RenderedTake[]>(initialSavedTakes);
  const [activeVideoUrl, setActiveVideoUrl] = React.useState<string>(
    initialSavedTakes[0]?.videoUrl || "/videos/vault_heist_take_01.mp4"
  );
  const [activeTakeId, setActiveTakeId] = React.useState<string>(
    initialSavedTakes[0]?.id || "take-1"
  );
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [videoDuration, setVideoDuration] = React.useState<number>(6);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [isLooping, setIsLooping] = React.useState<boolean>(true);
  const [hasExportedPackage, setHasExportedPackage] = React.useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = React.useState<boolean>(false);

  // Screenplay dialogue parsing for audio sync
  const scriptLines = React.useMemo(() => {
    if (!screenplayText) return [];
    const lines: Array<{ speaker: string; text: string }> = [];
    const rawLines = screenplayText.split("\n");
    let currentSpeaker = "";
    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (
        trimmed === trimmed.toUpperCase() &&
        trimmed.length < 30 &&
        !trimmed.startsWith("INT.") &&
        !trimmed.startsWith("EXT.")
      ) {
        currentSpeaker = trimmed;
      } else if (currentSpeaker && !trimmed.startsWith("(") && !trimmed.endsWith(")")) {
        lines.push({ speaker: currentSpeaker, text: trimmed });
        currentSpeaker = "";
      }
    }
    return lines;
  }, [screenplayText]);

  // Audio Playback for Dialogue Sync
  const [playingLineIdx, setPlayingLineIdx] = React.useState<number | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (initialCameraMotion) {
      setCameraMotion(initialCameraMotion);
    }
    if (initialPromptNote) {
      setPrompt(`${initialPromptNote} Visual aesthetic: ${stylePreset}. Masterful Hollywood cinematography.`);
    }
  }, [initialCameraMotion, initialPromptNote, stylePreset]);

  // Synchronize prompt with motion or style changes
  const updatePromptWithPreset = (newMotion?: string, newStyle?: string) => {
    const m = newMotion || cameraMotion;
    const s = newStyle || stylePreset;
    setPrompt(
      `Cinematic establishing shot of ${sceneTitle}. ${sceneSummary}. Camera style: ${m}. Visual aesthetic: ${s}. Masterful Hollywood cinematography, photorealistic depth.`
    );
  };

  const handleAddPromptTag = (tag: string) => {
    const cleanedTag = tag.replace(/^\+\s*/, "");
    if (!prompt.includes(cleanedTag)) {
      setPrompt((prev) => `${prev.trim()}, ${cleanedTag}`);
    }
  };

  const handleGenerateVeoVideo = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationStage("Conditioning Google Veo 3.1 Motion Vectors...");

    try {
      const fullPrompt = `${prompt}. Camera style: ${cameraMotion}. Film preset: ${stylePreset}. Aspect ratio: ${aspectRatio}.`;
      const res = await fetch("/api/media/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          duration_seconds: durationSec,
          aspect_ratio: aspectRatio,
          style_preset: stylePreset,
          image_url: activeConditioningImage || undefined,
          character_name: selectedCharacterName || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.video_url && data.status === "completed") {
          setActiveVideoUrl(data.video_url);
          setIsGenerating(false);
          setGenerationStage("");
          addTakeToHistory(data.video_url);
          notifyIfFallback(data, "Video Render");
        } else {
          pollVideoStatus(data.operation_name);
        }
      } else {
        const detail = await res.text().catch(() => "");
        toast.add({
          title: "Video generation failed",
          description: detail || `Veo request failed (${res.status}). Try again.`,
          type: "error",
        });
        setIsGenerating(false);
        setGenerationStage("");
      }
    } catch (err) {
      console.error("Veo generation error:", err);
      toast.add({
        title: "Video generation failed",
        description: err instanceof Error ? err.message : "Could not reach the render backend.",
        type: "error",
      });
      setIsGenerating(false);
      setGenerationStage("");
    }
  };

  const pollVideoStatus = async (opName: string) => {
    setGenerationStage("Google Veo 3.1 Cloud Synthesis: Painting Photoreal Frames...");
    let attempts = 0;
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/media/video/status?operation_name=${encodeURIComponent(opName)}`);
        if (res.ok) {
          const statusData = await res.json();
          if (statusData.status === "completed" && statusData.video_url) {
            stopPolling();
            setActiveVideoUrl(statusData.video_url);
            setIsGenerating(false);
            setGenerationStage("");
            addTakeToHistory(statusData.video_url);
            notifyIfFallback(statusData, "Video Render");
          } else if (statusData.status === "failed" || statusData.status === "error") {
            stopPolling();
            toast.add({
              title: "Video generation failed",
              description: statusData.error || "Veo reported a failed render.",
              type: "error",
            });
            setIsGenerating(false);
            setGenerationStage("");
          } else if (attempts > 30) {
            stopPolling();
            toast.add({
              title: "Video generation timed out",
              description: "Veo didn't finish rendering within 90s. Try again, or check the agent-service logs.",
              type: "warning",
            });
            setIsGenerating(false);
            setGenerationStage("");
          }
        } else if (attempts > 30) {
          stopPolling();
          toast.add({
            title: "Video generation timed out",
            description: "Couldn't confirm render status after 90s. Try again.",
            type: "warning",
          });
          setIsGenerating(false);
          setGenerationStage("");
        }
      } catch {
        stopPolling();
        toast.add({
          title: "Lost connection to render backend",
          description: "The status check failed. Try generating again.",
          type: "error",
        });
        setIsGenerating(false);
        setGenerationStage("");
      }
    }, 3000);
  };

  const handleCancelGeneration = () => {
    stopPolling();
    setIsGenerating(false);
    setGenerationStage("");
    toast.add({
      title: "Stopped watching this render",
      description: "Veo has no cancel API — the job keeps rendering on Google's side, it just won't be picked up here.",
      type: "info",
    });
  };

  const addTakeToHistory = (url: string) => {
    const nextNum = recentTakes.length + 1;
    const newTake: RenderedTake = {
      id: "take-" + Date.now(),
      takeNumber: nextNum,
      title: `${sceneTitle} — Take ${String(nextNum).padStart(2, "0")}`,
      timestamp: "Just now",
      durationSec,
      camera: cameraMotion,
      style: stylePreset,
      videoUrl: url,
      prompt,
    };
    setRecentTakes((prev) => [newTake, ...prev]);
    setActiveTakeId(newTake.id);
    setActiveVideoUrl(url);

    // Persist to project store and localStorage
    saveVideoTake(effectiveProjectId, {
      title: newTake.title,
      cameraMotion,
      stylePreset,
      durationSec,
      videoUrl: url,
      prompt,
      isMaster: true,
    });
    toast.add({
      title: `Take #${nextNum} Saved to Project Vault`,
      description: "Stored in project take vault and set as Master Take.",
      type: "success",
    });
  };

  const selectTake = (take: RenderedTake) => {
    setActiveTakeId(take.id);
    setActiveVideoUrl(take.videoUrl);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play();
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const stepFrame = (frames: number) => {
    if (!videoRef.current) return;
    const frameDuration = 1 / 24; // 24 fps
    const newTime = Math.max(0, Math.min(videoDuration, videoRef.current.currentTime + frames * frameDuration));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || durationSec);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Dialogue Line Audition / Playback
  const handlePlayDialogue = async (speaker: string, text: string, idx: number) => {
    if (playingLineIdx === idx) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingLineIdx(null);
      return;
    }

    try {
      setPlayingLineIdx(idx);
      const res = await fetch("/api/media/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speaker, text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audio_url && audioRef.current) {
          audioRef.current.src = data.audio_url;
          audioRef.current.play();
          audioRef.current.onended = () => setPlayingLineIdx(null);
        } else {
          setPlayingLineIdx(null);
          toast.add({ title: "Playback failed", description: "No audio returned. Try again.", type: "error" });
        }
      } else {
        setPlayingLineIdx(null);
        toast.add({ title: "Playback failed", description: `TTS request failed (${res.status}).`, type: "error" });
      }
    } catch (err) {
      setPlayingLineIdx(null);
      toast.add({
        title: "Playback failed",
        description: err instanceof Error ? err.message : "Could not reach the TTS backend.",
        type: "error",
      });
    }
  };

  // Export Master Studio Package
  const handleExportPackage = () => {
    const pkg = {
      productionTitle: projectTitle,
      sceneTitle,
      genre,
      exportTimestamp: new Date().toISOString(),
      generator: "Google Cloud Agentic Cinema Studio Pipeline",
      activeTake: recentTakes.find((t) => t.id === activeTakeId) || recentTakes[0],
      videoDelivery: {
        engine: "Google Veo 3.1",
        cameraMotion,
        stylePreset,
        aspectRatio,
        durationSeconds: durationSec,
        videoUrl: activeVideoUrl,
        prompt,
      },
      dailiesManifest: recentTakes,
      castVoiceManifest: characters.map((c) => ({
        character: c.name,
        speechStyle: c.speechStyle,
        subtextRatio: c.subtextRatio,
        assignedTTSVoice:
          c.name.toUpperCase() === "MARCUS"
            ? "Fenrir"
            : c.name.toUpperCase() === "ELENA"
            ? "Aoede"
            : "Puck",
      })),
      screenplayMasterText: screenplayText,
    };

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sceneTitle.replace(/\s+/g, "_")}_Studio_Dailies_Master.json`;
    link.click();
    URL.revokeObjectURL(url);

    setHasExportedPackage(true);
    setTimeout(() => setHasExportedPackage(false), 3000);
  };

  // Format timecode HH:MM:SS:FF (24 fps)
  const formatTimecodeDisplay = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const f = Math.floor((sec % 1) * 24);
    return `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
  };

  const activeRatioConfig =
    ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];
  const currentActiveTake =
    recentTakes.find((t) => t.id === activeTakeId) || recentTakes[0];

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 bg-background overflow-hidden">
      {/* Hidden Audio element for dialogue sync */}
      <audio ref={audioRef} className="hidden" />

      {/* Top Header Toolbar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <Clapperboard className="h-4 w-4 text-accent" />
            <span className="font-heading font-semibold text-xs uppercase tracking-wider text-foreground">
              Screening Room &amp; Dailies
            </span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
              {sceneTitle}
            </span>
          </div>

          <Badge variant="outline" className="hidden sm:inline-flex border-accent/40 bg-accent/10 text-accent font-mono text-[10px]">
            Google Veo 3.1
          </Badge>

          <Badge variant="secondary" className="font-mono text-[10px]">
            {activeRatioConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onReturnToStudio && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReturnToStudio}
              className="h-8 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Studio</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPackage}
            className="h-8 text-xs gap-1.5 border-border bg-secondary/30 hover:bg-secondary cursor-pointer"
            title="Download Master JSON containing scene video, dialogue stems, and camera metadata"
          >
            <FolderDown className="h-3.5 w-3.5 text-accent" />
            <span>{hasExportedPackage ? "Dailies Saved!" : "Export Dailies"}</span>
          </Button>

          <a
            href={activeVideoUrl}
            download={`${sceneTitle.replace(/\s+/g, "_")}_veo_master.mp4`}
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm" className="h-8 text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
              <Download className="h-3.5 w-3.5" />
              <span>Master MP4</span>
            </Button>
          </a>
        </div>
      </header>

      {/* Main 2-Column Director Workstation */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Side: Cinema Screening Bay & Dailies Reel (~65-70%) */}
        <main className="flex-1 flex flex-col min-w-0 bg-background/50 border-r border-border overflow-hidden">
          {/* Cinema Monitor Viewport Container */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 min-h-0 overflow-hidden relative select-none">
            {/* Aspect Ratio Box with Cinema Letterboxing */}
            <div
              ref={containerRef}
              className={cn(
                "w-full max-h-full rounded-xl bg-black border border-border/80 shadow-2xl overflow-hidden relative flex flex-col items-center justify-center group transition-all duration-300",
                activeRatioConfig.ratioClass,
                aspectRatio === "9:16" ? "max-w-xs" : "max-w-5xl"
              )}
            >
              <video
                ref={videoRef}
                src={activeVideoUrl}
                loop={isLooping}
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full h-full object-cover cursor-pointer"
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => {
                  console.warn("Screening bay video load error:", activeVideoUrl);
                  setActiveVideoUrl("/videos/vault_heist_take_01.mp4");
                }}
              />

              {/* Rule of Thirds / Anamorphic Frame Guides Overlay */}
              {showFrameGuides && (
                <div className="absolute inset-0 pointer-events-none border border-amber-500/20 grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-amber-500/20" />
                  <div className="border-r border-b border-amber-500/20" />
                  <div className="border-b border-amber-500/20" />
                  <div className="border-r border-b border-amber-500/20" />
                  <div className="border-r border-b border-amber-500/20" />
                  <div className="border-b border-amber-500/20" />
                  <div className="border-r border-b border-amber-500/20" />
                  <div className="border-r border-b border-amber-500/20" />
                  <div />
                  {/* Center Optical Crosshair */}
                  <div className="absolute inset-0 m-auto h-4 w-4 border-t border-l border-amber-400/40 pointer-events-none" />
                </div>
              )}

              {/* Production Slate Burn-In Overlay (Top Bar) */}
              <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-white/90 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-accent">TAKE 0{currentActiveTake.takeNumber}</span>
                  <span className="text-white/40">|</span>
                  <span className="truncate max-w-[150px] sm:max-w-xs">{currentActiveTake.camera}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/60 hidden sm:inline">{activeRatioConfig.safeGuide}</span>
                  <Badge variant="outline" className="border-white/20 text-white/90 text-[9px] font-mono px-1.5 py-0">
                    24.00 FPS
                  </Badge>
                </div>
              </div>

              {/* Big Center Play / Pause Indicator */}
              <button
                type="button"
                onClick={togglePlay}
                className={cn(
                  "absolute inset-0 m-auto h-16 w-16 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-md hover:scale-105 hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer",
                  isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-90"
                )}
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1 fill-current" />}
              </button>

              {/* Bottom Transport Scrubber & Timecode Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 flex flex-col gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
                {/* Visual Progress Track */}
                <input
                  type="range"
                  min={0}
                  max={videoDuration || 6}
                  step={0.01}
                  value={currentTime}
                  onChange={handleScrub}
                  className="w-full h-1 bg-white/20 accent-accent rounded cursor-pointer transition-all hover:h-1.5"
                />

                {/* Transport Buttons & Telemetry Readout */}
                <div className="flex items-center justify-between text-xs font-mono text-white/90">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Play/Pause */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-1 rounded hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                    </button>

                    {/* Step -1 Frame */}
                    <button
                      type="button"
                      onClick={() => stepFrame(-1)}
                      className="p-1 rounded hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                      title="Step -1 Frame (24fps)"
                    >
                      <Rewind className="h-3.5 w-3.5" />
                    </button>

                    {/* Step +1 Frame */}
                    <button
                      type="button"
                      onClick={() => stepFrame(1)}
                      className="p-1 rounded hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                      title="Step +1 Frame (24fps)"
                    >
                      <FastForward className="h-3.5 w-3.5" />
                    </button>

                    {/* Volume / Mute */}
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 rounded hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                    </button>

                    {/* Timecode Readout */}
                    <div className="flex items-center gap-1.5 pl-1">
                      <span className="font-bold tracking-wider text-accent">
                        {formatTimecodeDisplay(currentTime)}
                      </span>
                      <span className="text-white/40">/</span>
                      <span className="text-white/60">
                        {formatTimecodeDisplay(videoDuration)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Frame Guides Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowFrameGuides(!showFrameGuides)}
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-colors",
                        showFrameGuides
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                          : "border-white/10 text-white/50 hover:text-white hover:border-white/30"
                      )}
                      title="Toggle framing safe area guides"
                    >
                      Grid
                    </button>

                    {/* Loop Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsLooping(!isLooping)}
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-colors",
                        isLooping
                          ? "bg-accent/20 border-accent/40 text-accent"
                          : "border-white/10 text-white/50 hover:text-white hover:border-white/30"
                      )}
                      title="Toggle Video Loop"
                    >
                      Loop
                    </button>

                    {/* Fullscreen */}
                    <button
                      type="button"
                      onClick={handleToggleFullscreen}
                      className="p-1 rounded hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                      title="Fullscreen Monitor"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Dailies Reel Strip */}
          <div className="h-28 shrink-0 border-t border-border bg-card/40 px-4 py-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-heading font-semibold uppercase tracking-wider text-foreground">
                  Dailies Reel &amp; Takes
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {recentTakes.length} Takes Rendered
                </Badge>
              </div>

              <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
                Click any take to review in monitor
              </span>
            </div>

            {/* Horizontal Reel of Takes */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              {recentTakes.map((take) => {
                const isSelected = activeTakeId === take.id;
                return (
                  <button
                    key={take.id}
                    type="button"
                    onClick={() => selectTake(take)}
                    className={cn(
                      "w-48 shrink-0 rounded-lg border p-2 text-left cursor-pointer transition-all flex flex-col gap-1",
                      isSelected
                        ? "border-accent bg-accent/15 ring-1 ring-accent/40 shadow-xs"
                        : "border-border bg-secondary/30 hover:bg-secondary/60 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={cn("font-bold", isSelected ? "text-accent" : "text-foreground")}>
                        TAKE 0{take.takeNumber}
                      </span>
                      <span className="text-muted-foreground">{take.durationSec}s · {take.timestamp}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground truncate flex items-center gap-1.5">
                      {take.title}
                      {take.isSample && (
                        <span className="shrink-0 rounded-sm bg-amber-500/15 px-1 py-0.5 text-[9px] font-mono font-semibold text-amber-500">
                          SAMPLE
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground truncate">{take.camera}</span>
                  </button>
                );
              })}

              {/* Stage Next Angle Quick Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("camera");
                  setCameraMotion("High Crane Overhead Sweep");
                  updatePromptWithPreset("High Crane Overhead Sweep", stylePreset);
                }}
                className="w-40 shrink-0 h-[62px] rounded-lg border border-dashed border-border hover:border-accent/50 hover:bg-accent/5 flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:text-accent cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-[10px] font-mono">Stage Next Take</span>
              </button>
            </div>
          </div>
        </main>

        {/* Right Side: Director Control Deck (~30-35%, 380-420px) */}
        <aside className="w-[380px] xl:w-[420px] shrink-0 flex flex-col bg-card/60 overflow-hidden">
          {/* Sub-Tabs Header */}
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-3 bg-secondary/20">
            <div className="flex items-center gap-1 w-full">
              <button
                type="button"
                onClick={() => setActiveTab("camera")}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-md text-xs font-heading font-medium tracking-wide transition-colors cursor-pointer text-center",
                  activeTab === "camera"
                    ? "bg-background text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Camera &amp; Style
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dialogue")}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-md text-xs font-heading font-medium tracking-wide transition-colors cursor-pointer text-center",
                  activeTab === "dialogue"
                    ? "bg-background text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Dialogue &amp; ADR
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("deliverables")}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-md text-xs font-heading font-medium tracking-wide transition-colors cursor-pointer text-center",
                  activeTab === "deliverables"
                    ? "bg-background text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Deliverables
              </button>
            </div>
          </div>

          {/* TAB 1: Camera Motion, Visual Prompt & Veo Dispatch */}
          {activeTab === "camera" && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {/* Character Visual Conditioning Module */}
              {characters && characters.length > 0 && (
                <div className="flex flex-col gap-2 p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-purple-400" />
                      <SlateLabel>Character Visual Reference</SlateLabel>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono border-purple-500/40 text-purple-300 py-0">
                      Veo Conditioning
                    </Badge>
                  </div>

                  {/* Character Selection Pills */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCharacterName(null);
                        runSynthesis(null);
                      }}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer",
                        selectedCharacterName === null
                          ? "bg-purple-600 text-white font-semibold shadow-xs"
                          : "bg-card/80 border border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Master Scene (Ensemble)
                    </button>
                    {characters.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedCharacterName(c.name);
                          runSynthesis(c.name);
                        }}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                          selectedCharacterName === c.name
                            ? "bg-purple-600 text-white font-semibold shadow-xs"
                            : "bg-card/80 border border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {c.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            className="h-3.5 w-3.5 rounded-full object-cover border border-white/40"
                          />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold">
                            {c.name.charAt(0)}
                          </span>
                        )}
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Connected Canvas Node Context Badges */}
                  {activeNodeContributions.length > 0 && (
                    <div className="pt-2 border-t border-purple-500/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-purple-300">
                          <Layers className="h-3 w-3" />
                          <span>Connected Canvas Nodes ({activeNodeContributions.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => runSynthesis(selectedCharacterName)}
                          className="text-[9px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
                          title="Re-synthesize prompt using current nodes"
                        >
                          <RefreshCw className="h-2.5 w-2.5" />
                          <span>Re-Synthesize</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activeNodeContributions.map((contrib) => (
                          <span
                            key={contrib.id}
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${contrib.badgeColor}`}
                            title={contrib.summary}
                          >
                            {contrib.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Conditioning Controls (Image-to-Video) */}
                  {activeCharacter && (activeCharacter.imageUrl || activeCharacter.fullBodyImageUrl) && (
                    <div className="p-2 rounded-lg border border-purple-500/30 bg-purple-950/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-purple-300 font-semibold flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-accent" />
                          <span>Veo Image-to-Video Conditioning</span>
                        </span>
                        {activeConditioningImage ? (
                          <Badge variant="outline" className="text-[8px] font-mono border-emerald-500/50 bg-emerald-500/10 text-emerald-300 py-0">
                            Active Reference
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[8px] font-mono text-muted-foreground py-0">
                            Text Only
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {activeConditioningImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={activeConditioningImage}
                            alt="Conditioning reference"
                            className="h-9 w-9 rounded-md object-cover border border-purple-400 shrink-0"
                          />
                        )}
                        <div className="flex items-center gap-1 flex-1">
                          {activeCharacter.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveConditioningImage(activeCharacter.imageUrl!);
                                setActiveImageType("face");
                              }}
                              className={`px-2 py-1 rounded text-[10px] font-mono flex-1 border cursor-pointer transition-colors ${
                                activeConditioningImage === activeCharacter.imageUrl
                                  ? "bg-purple-600 border-purple-400 text-white font-semibold"
                                  : "bg-card border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              Face Image
                            </button>
                          )}
                          {activeCharacter.fullBodyImageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveConditioningImage(activeCharacter.fullBodyImageUrl!);
                                setActiveImageType("body");
                              }}
                              className={`px-2 py-1 rounded text-[10px] font-mono flex-1 border cursor-pointer transition-colors ${
                                activeConditioningImage === activeCharacter.fullBodyImageUrl
                                  ? "bg-purple-600 border-purple-400 text-white font-semibold"
                                  : "bg-card border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              Body Stance
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveConditioningImage(null);
                              setActiveImageType(null);
                            }}
                            className={`px-1.5 py-1 rounded text-[10px] font-mono border cursor-pointer transition-colors ${
                              !activeConditioningImage
                                ? "bg-secondary border-border text-foreground font-semibold"
                                : "bg-card/40 border-border/60 text-muted-foreground hover:text-foreground"
                            }`}
                            title="Generate text-only without conditioning image"
                          >
                            Off
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Character Dossier */}
                  {activeCharacter && (
                    <div className="p-2.5 rounded-lg border border-purple-500/20 bg-black/40 space-y-2">
                      <div className="flex items-start gap-2.5">
                        {/* Face */}
                        <div className="h-12 w-12 rounded-md overflow-hidden border border-border bg-black shrink-0 relative">
                          {activeCharacter.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={activeCharacter.imageUrl}
                              alt={activeCharacter.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Eye className="h-4 w-4" />
                            </div>
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[7px] font-mono text-center text-white">
                            Face
                          </span>
                        </div>

                        {/* Body */}
                        <div className="h-12 w-9 rounded-md overflow-hidden border border-border bg-black shrink-0 relative">
                          {activeCharacter.fullBodyImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={activeCharacter.fullBodyImageUrl}
                              alt={`${activeCharacter.name} body`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Shirt className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[7px] font-mono text-center text-white">
                            Body
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground truncate">{activeCharacter.name}</span>
                            <Badge variant="outline" className="text-[9px] py-0 px-1 border-purple-500/40 text-purple-300">
                              {activeCharacter.role || "Cast"}
                            </Badge>
                          </div>
                          {activeCharacter.actorComp && (
                            <div className="text-[10px] text-cyan-400 font-mono truncate">
                              Comp: {activeCharacter.actorComp}
                            </div>
                          )}
                          {activeCharacter.wardrobe && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              Wardrobe: {activeCharacter.wardrobe}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Character Shot Buttons */}
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                        <button
                          type="button"
                          onClick={() => {
                            setCameraMotion("Slow Cinematic Dolly In");
                            runSynthesis(activeCharacter.name, "face");
                          }}
                          className="px-2 py-0.5 rounded bg-secondary/80 hover:bg-secondary text-[10px] font-mono text-foreground border border-border/60 transition-colors cursor-pointer"
                        >
                          👤 Face Push-In
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCameraMotion("35mm Anamorphic Tracking Shot");
                            runSynthesis(activeCharacter.name, "body");
                          }}
                          className="px-2 py-0.5 rounded bg-secondary/80 hover:bg-secondary text-[10px] font-mono text-foreground border border-border/60 transition-colors cursor-pointer"
                        >
                          🏃 Full-Body Action
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCameraMotion("Handheld Gritty Tension");
                            runSynthesis(activeCharacter.name, "face");
                          }}
                          className="px-2 py-0.5 rounded bg-secondary/80 hover:bg-secondary text-[10px] font-mono text-foreground border border-border/60 transition-colors cursor-pointer"
                        >
                          ⚔️ Two-Shot Standoff
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Visual Prompt Editor */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <SlateLabel>Visual Synthesis Prompt</SlateLabel>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                      title="Copy prompt text"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedPrompt ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePromptWithPreset()}
                      className="text-[10px] font-mono text-accent hover:underline cursor-pointer"
                    >
                      Sync Staging
                    </button>
                  </div>
                </div>

                <Textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="font-mono text-xs bg-background/60 resize-none min-h-[90px]"
                  placeholder="Describe the cinematic scene visual, lighting, depth, and camera motion..."
                />

                {/* Quick Add Style Tags */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {PROMPT_SUGGESTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddPromptTag(tag)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 cursor-pointer transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Motion Vectors */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <SlateLabel>Camera Motion Vector</SlateLabel>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Veo 3.1 Trajectory
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {CAMERA_MOTIONS.map((motion) => {
                    const IconComp = motion.icon;
                    const isSelected = cameraMotion === motion.id;
                    return (
                      <button
                        key={motion.id}
                        type="button"
                        onClick={() => {
                          setCameraMotion(motion.id);
                          updatePromptWithPreset(motion.id, stylePreset);
                        }}
                        className={cn(
                          "flex flex-col items-start p-2 rounded-lg border text-left cursor-pointer transition-all gap-0.5",
                          isSelected
                            ? "bg-accent/15 border-accent text-accent-foreground font-semibold shadow-xs"
                            : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <IconComp className={cn("h-3.5 w-3.5", isSelected ? "text-accent" : "text-muted-foreground")} />
                            <span className="text-xs font-mono">{motion.label}</span>
                          </div>
                          {isSelected && <Check className="h-3 w-3 text-accent" />}
                        </div>
                        <span className="text-[9px] text-muted-foreground line-clamp-1">{motion.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cinematography Style Bible */}
              <div className="flex flex-col gap-1.5">
                <SlateLabel>Cinematography Style Bible</SlateLabel>
                <div className="flex flex-col gap-1.5">
                  {STYLE_PRESETS.map((preset) => {
                    const isSelected = stylePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setStylePreset(preset.id);
                          updatePromptWithPreset(cameraMotion, preset.id);
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg border text-left cursor-pointer transition-all",
                          isSelected
                            ? "bg-accent/15 border-accent text-accent-foreground shadow-xs"
                            : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        )}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className={cn("text-xs font-mono", isSelected ? "font-semibold text-foreground" : "")}>
                            {preset.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{preset.desc}</span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-accent shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio & Duration */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1.5">
                  <SlateLabel>Aspect Ratio</SlateLabel>
                  <div className="grid grid-cols-2 gap-1">
                    {ASPECT_RATIOS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setAspectRatio(r.id)}
                        className={cn(
                          "py-1.5 px-2 rounded text-center text-xs font-mono cursor-pointer transition-colors border",
                          aspectRatio === r.id
                            ? "bg-accent text-accent-foreground border-accent font-semibold"
                            : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {r.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <SlateLabel>Duration</SlateLabel>
                    <span className="text-xs font-mono font-bold text-accent">{durationSec}s</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={8}
                    step={1}
                    value={durationSec}
                    onChange={(e) => setDurationSec(Number(e.target.value))}
                    className="w-full mt-2 accent-accent cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>4s</span>
                    <span>6s</span>
                    <span>8s</span>
                  </div>
                </div>
              </div>

              {/* Primary Render Button */}
              <div className="mt-auto pt-2 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    onClick={handleGenerateVeoVideo}
                    disabled={isGenerating}
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2 cursor-pointer shadow-md"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    <span>
                      {isGenerating ? "Rendering with Veo 3.1..." : "Render Scene with Google Veo 3.1"}
                    </span>
                  </Button>
                  {isGenerating && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleCancelGeneration}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                {isGenerating && (
                  <div className="rounded-lg bg-accent/10 border border-accent/30 p-2.5 text-center flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono text-accent font-bold uppercase tracking-wider animate-pulse">
                      {generationStage}
                    </span>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full animate-pulse w-3/4" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Screenplay Dialogue & Voice Audition */}
          {activeTab === "dialogue" && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <SlateLabel>Scene Dialogue &amp; Voice Stems</SlateLabel>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {scriptLines.length} Lines Parsed
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Audition actor AI voice timbres directly against the active video take.
              </p>

              {scriptLines.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
                  No formatted dialogue lines detected in screenplay text.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {scriptLines.map((line, idx) => {
                    const isPlayingLine = playingLineIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-border bg-secondary/30 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-accent">
                            {line.speaker}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePlayDialogue(line.speaker, line.text, idx)}
                            className={cn(
                              "h-6 px-2 text-[10px] font-mono gap-1 cursor-pointer",
                              isPlayingLine ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {isPlayingLine ? <Pause className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            <span>{isPlayingLine ? "Playing" : "Audition"}</span>
                          </Button>
                        </div>
                        <p className="text-xs text-foreground/90 italic font-serif leading-relaxed">
                          &ldquo;{line.text}&rdquo;
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Dailies & Deliverables Package */}
          {activeTab === "deliverables" && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <SlateLabel>Cinema Production Dailies</SlateLabel>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-[10px]">
                  Ready for Delivery
                </Badge>
              </div>

              {/* Manifest Breakdown Card */}
              <Card className="border-border bg-secondary/20">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs font-heading font-semibold uppercase tracking-wider">
                    Production Assets
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Packaged for post-production NLE and grading suites
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono p-2 rounded bg-background/60 border border-border/40">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5 text-blue-400" /> Screenplay Draft
                    </span>
                    <span className="text-emerald-400 text-[10px] font-semibold">Included</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono p-2 rounded bg-background/60 border border-border/40">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> Multi-Speaker Stems
                    </span>
                    <span className="text-emerald-400 text-[10px] font-semibold">Cached</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono p-2 rounded bg-background/60 border border-border/40">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Video className="h-3.5 w-3.5 text-accent" /> Veo 3.1 Master Video
                    </span>
                    <span className="text-emerald-400 text-[10px] font-semibold">Rendered</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono p-2 rounded bg-background/60 border border-border/40">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Camera className="h-3.5 w-3.5 text-amber-400" /> Camera Motion Manifest
                    </span>
                    <span className="text-emerald-400 text-[10px] font-semibold">{currentActiveTake.camera}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="mt-auto flex flex-col gap-2">
                <Button
                  size="default"
                  onClick={handleExportPackage}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold gap-2 cursor-pointer shadow-md"
                >
                  {hasExportedPackage ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>Package Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <FolderDown className="h-4 w-4" />
                      <span>Export Studio Package (.JSON)</span>
                    </>
                  )}
                </Button>

                <a
                  href={activeVideoUrl}
                  download={`${sceneTitle.replace(/\s+/g, "_")}_master.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" size="default" className="w-full text-xs gap-2 cursor-pointer border-border">
                    <Download className="h-4 w-4" />
                    <span>Download Raw MP4 Master</span>
                  </Button>
                </a>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
