"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { notifyIfFallback } from "@/lib/fallback-notice";
import { SlateLabel } from "@/components/cinema/slate-label";
import {
  Video,
  Play,
  Pause,
  Download,
  Sparkles,
  Camera,
  Film,
  Maximize2,
  RefreshCw,
  Clock,
  Layers,
} from "lucide-react";

interface VeoVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sceneTitle: string;
  sceneSummary?: string;
  visualPrompt?: string;
}

const CAMERA_MOTIONS = [
  "Slow Cinematic Dolly In",
  "High Crane Overhead Sweep",
  "Handheld Gritty Tension",
  "35mm Anamorphic Tracking Shot",
  "Static Master Table View",
];

const STYLE_PRESETS = [
  "35mm Anamorphic Film, 2.39:1 Scope",
  "Neo-Noir Cyberpunk, Sodium Vapor & Rain",
  "70mm IMAX High-Contrast Master",
  "Gritty 16mm Indie Grain",
];

export function VeoVideoDialog({
  open,
  onOpenChange,
  sceneTitle,
  sceneSummary,
  visualPrompt,
}: VeoVideoDialogProps) {
  const [cameraMotion, setCameraMotion] = React.useState<string>(CAMERA_MOTIONS[0]);
  const [stylePreset, setStylePreset] = React.useState<string>(STYLE_PRESETS[0]);
  const [durationSec, setDurationSec] = React.useState<number>(6);
  const [customPrompt, setCustomPrompt] = React.useState<string>(
    visualPrompt ||
      `Cinematic establishing shot of ${sceneTitle}. Moody shadows, photoreal anamorphic lens, high dramatic tension.`
  );

  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [generationStage, setGenerationStage] = React.useState<string>("");
  const [operationName, setOperationName] = React.useState<string | null>(null);
  const pollIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = React.useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Stop any in-flight poll loop if the dialog unmounts or is closed mid-generation.
  React.useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  React.useEffect(() => {
    if (!open) {
      stopPolling();
    }
  }, [open, stopPolling]);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  );
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (visualPrompt) {
      setCustomPrompt(
        `${visualPrompt}, ${cameraMotion.toLowerCase()}, Hollywood director cinematography.`
      );
    }
  }, [visualPrompt, cameraMotion]);

  // Handle Video Generation via Google Veo 3.1
  const handleGenerateVideo = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationStage("Conditioning Google Veo 3.1 Motion Vectors...");

    try {
      const fullPrompt = `${customPrompt}. Camera style: ${cameraMotion}. Visual aesthetic: ${stylePreset}.`;
      const res = await fetch("/api/media/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          duration_seconds: durationSec,
          style_preset: stylePreset,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOperationName(data.operation_name);

        if (data.video_url && data.status === "completed") {
          setVideoUrl(data.video_url);
          setIsGenerating(false);
          setGenerationStage("");
          notifyIfFallback(data, "Video Render");
        } else {
          // Poll operation
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
      console.error("Video dispatch error:", err);
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
    setGenerationStage("Google Veo 3.1 Cloud Synthesis: Painting 16:9 Frames...");
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
            setVideoUrl(statusData.video_url);
            setIsGenerating(false);
            setGenerationStage("");
            notifyIfFallback(statusData, "Video Render");
          } else if (statusData.status === "failed") {
            stopPolling();
            toast.add({
              title: "Video generation failed",
              description: statusData.error || "Veo reported a failed render.",
              type: "error",
            });
            setIsGenerating(false);
            setGenerationStage("");
          } else if (attempts > 30) {
            // Safety timeout after 90s
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
    toast.add({ title: "Generation cancelled", type: "info" });
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-card border-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                <Video className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-heading">
                    Google Veo 3.1 Cinema Video Generation · {sceneTitle}
                  </DialogTitle>
                  <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-300 text-[10px] font-mono">
                    Veo 3.1 Fast Preview
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  Transform screenplay, storyboard prompts, and camera coordinates into 16:9 cinematic video.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-md border border-border/70">
              <Clock className="h-3 w-3 text-accent" />
              <span>{durationSec}s Take Duration</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Video Theater View (7 Cols) */}
          <div className="md:col-span-7 bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {videoUrl ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border/80 shadow-2xl bg-black group">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Theater Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
                  <div className="flex justify-between items-center pointer-events-auto">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent bg-black/60 px-2 py-0.5 rounded">
                      Veo 3.1 · 16:9 Scope
                    </span>
                  </div>

                  <div className="flex items-center justify-between pointer-events-auto">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlay}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>

                    <a
                      href={videoUrl}
                      download={`${sceneTitle.replace(/\s+/g, "_")}_veo_take.mp4`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-mono text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download Take</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2">
                <Film className="h-10 w-10 text-muted-foreground/40" />
                <span className="text-xs">No video rendered yet for this slate.</span>
                <span className="text-[11px] text-muted-foreground/70">Click &apos;Render Cinematic Video&apos; to dispatch to Google Veo.</span>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                <RefreshCw className="h-8 w-8 text-purple-400 animate-spin" />
                <div className="space-y-1">
                  <h4 className="text-sm font-heading font-semibold text-foreground">
                    Google Veo 3.1 Synthesizing Scene...
                  </h4>
                  <p className="text-xs text-purple-300 font-mono">
                    {generationStage}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Neural diffusion video rendering typically completes in 30-60 seconds.
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Director Controls & Prompt Conditioning (5 Cols) */}
          <div className="md:col-span-5 flex flex-col p-4 bg-secondary/15 border-l border-border/80 space-y-3.5 overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <Camera className="h-4 w-4 text-purple-400" />
              <SlateLabel>Veo Camera &amp; Cinematography Deck</SlateLabel>
            </div>

            {/* Camera Motion */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Camera Movement Dynamics</label>
              <select
                value={cameraMotion}
                onChange={(e) => setCameraMotion(e.target.value)}
                className="w-full text-xs font-mono rounded-md border border-border bg-card px-2.5 py-1.5 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {CAMERA_MOTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Style Preset */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Visual Film Stock &amp; Color Grade</label>
              <select
                value={stylePreset}
                onChange={(e) => setStylePreset(e.target.value)}
                className="w-full text-xs rounded-md border border-border bg-card px-2.5 py-1.5 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {STYLE_PRESETS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Selector */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">Take Duration</span>
                <span className="font-mono text-accent">{durationSec} seconds</span>
              </div>
              <div className="flex items-center gap-2">
                {[4, 5, 6, 8].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setDurationSec(sec)}
                    className={`flex-1 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                      durationSec === sec
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Scene Conditioning Prompt */}
            <div className="space-y-1 flex-1 flex flex-col">
              <label className="text-xs font-medium text-foreground">Scene Visual Conditioning Prompt</label>
              <textarea
                rows={4}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full text-xs font-mono bg-card rounded-md border border-border/80 p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed flex-1"
                placeholder="Describe scene visual framing and action..."
              />
            </div>

            {/* Primary Action Button */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleGenerateVideo}
                disabled={isGenerating || !customPrompt.trim()}
                className="flex-1 h-9 text-xs font-semibold gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isGenerating ? "Rendering with Veo 3.1..." : "Render Scene with Google Veo 3.1"}</span>
              </Button>
              {isGenerating && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelGeneration}
                  className="h-9 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
