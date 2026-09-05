"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectCharacter } from "@/lib/project-store";

interface GenerationStudioViewProps {
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

const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 Widescreen", ratioClass: "aspect-video", safeGuide: "16:9 Standard" },
  { id: "2.39:1", label: "2.39:1 Scope", ratioClass: "aspect-[2.39/1]", safeGuide: "2.39:1 Anamorphic" },
  { id: "4:3", label: "4:3 Academy", ratioClass: "aspect-[4/3]", safeGuide: "1.33:1 Academy" },
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
}

export function GenerationStudioView({
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
  // Director Controls State
  const [activeTab, setActiveTab] = React.useState<"camera" | "dialogue" | "deliverables">("camera");
  const [cameraMotion, setCameraMotion] = React.useState<string>(
    initialCameraMotion || CAMERA_MOTIONS[0].id
  );
  const [stylePreset, setStylePreset] = React.useState<string>(STYLE_PRESETS[0].id);
  const [aspectRatio, setAspectRatio] = React.useState<string>("16:9");
  const [durationSec, setDurationSec] = React.useState<number>(6);
  const [showFrameGuides, setShowFrameGuides] = React.useState<boolean>(false);

  const [prompt, setPrompt] = React.useState<string>(
    initialPromptNote
      ? `${initialPromptNote} Visual aesthetic: ${STYLE_PRESETS[0].label}. Masterful Hollywood cinematography.`
      : `Cinematic establishing shot of ${sceneTitle}. ${sceneSummary}. Moody cinematic lighting, shallow depth of field, photoreal anamorphic lens, high dramatic tension.`
  );

  // Video Generation & Playback State
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [generationStage, setGenerationStage] = React.useState<string>("");
  const [activeVideoUrl, setActiveVideoUrl] = React.useState<string>(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  );
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [videoDuration, setVideoDuration] = React.useState<number>(6);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [isLooping, setIsLooping] = React.useState<boolean>(true);
  const [hasExportedPackage, setHasExportedPackage] = React.useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = React.useState<boolean>(false);

  // Active Take Selection
  const [activeTakeId, setActiveTakeId] = React.useState<string>("take-1");

  // Recent Takes List
  const [recentTakes, setRecentTakes] = React.useState<RenderedTake[]>([
    {
      id: "take-1",
      takeNumber: 1,
      title: `${sceneTitle} — Take 01`,
      timestamp: "10m ago",
      durationSec: 6,
      camera: "35mm Anamorphic Tracking Shot",
      style: "35mm Anamorphic Scope",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      prompt: `Cinematic establishing shot of ${sceneTitle}. Moody cinematic lighting, shallow depth of field, 35mm anamorphic lens.`,
    },
    {
      id: "take-2",
      takeNumber: 2,
      title: `${sceneTitle} — Take 02`,
      timestamp: "25m ago",
      durationSec: 5,
      camera: "Slow Cinematic Dolly In",
      style: "Neo-Noir Sodium & Rain",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      prompt: `Close intimate push on character during ${sceneTitle}. Neo-noir sodium vapor and high contrast shadows.`,
    },
  ]);

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
          aspect_ratio: aspectRatio === "2.39:1" ? "16:9" : aspectRatio,
          style_preset: stylePreset,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.video_url && data.status === "completed") {
          setActiveVideoUrl(data.video_url);
          setIsGenerating(false);
          setGenerationStage("");
          addTakeToHistory(data.video_url);
        } else {
          pollVideoStatus(data.operation_name);
        }
      } else {
        setIsGenerating(false);
        setGenerationStage("");
      }
    } catch (err) {
      console.error("Veo generation error:", err);
      setIsGenerating(false);
      setGenerationStage("");
    }
  };

  const pollVideoStatus = async (opName: string) => {
    setGenerationStage("Google Veo 3.1 Cloud Synthesis: Painting Photoreal Frames...");
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/media/video/status?operation_name=${encodeURIComponent(opName)}`);
        if (res.ok) {
          const statusData = await res.json();
          if (statusData.status === "completed" && statusData.video_url) {
            clearInterval(interval);
            setActiveVideoUrl(statusData.video_url);
            setIsGenerating(false);
            setGenerationStage("");
            addTakeToHistory(statusData.video_url);
          } else if (attempts > 30) {
            clearInterval(interval);
            setIsGenerating(false);
            setGenerationStage("");
          }
        }
      } catch {
        clearInterval(interval);
        setIsGenerating(false);
        setGenerationStage("");
      }
    }, 3000);
  };

  const addTakeToHistory = (url: string) => {
    const nextNum = recentTakes.length + 1;
    const newTake: RenderedTake = {
      id: "take-" + Date.now(),
      takeNumber: nextNum,
      title: `${sceneTitle} — Take 0${nextNum}`,
      timestamp: "Just now",
      durationSec,
      camera: cameraMotion,
      style: stylePreset,
      videoUrl: url,
      prompt,
    };
    setRecentTakes((prev) => [newTake, ...prev]);
    setActiveTakeId(newTake.id);
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
        if (data.audio_url) {
          if (audioRef.current) {
            audioRef.current.src = data.audio_url;
            audioRef.current.play();
            audioRef.current.onended = () => setPlayingLineIdx(null);
          }
        }
      }
    } catch {
      setPlayingLineIdx(null);
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
                    <span className="text-xs font-medium text-foreground truncate">{take.title}</span>
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
                <Button
                  size="lg"
                  onClick={handleGenerateVeoVideo}
                  disabled={isGenerating}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2 cursor-pointer shadow-md"
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
