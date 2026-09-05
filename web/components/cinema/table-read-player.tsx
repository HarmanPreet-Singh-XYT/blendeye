"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Sparkles, RefreshCw } from "lucide-react";
import { notifyIfFallback } from "@/lib/fallback-notice";

interface ScriptLine {
  id: number;
  type: "character" | "parenthetical" | "dialogue" | "action" | "slugline";
  speaker?: string;
  text: string;
}

interface TableReadPlayerProps {
  screenplayText: string;
  className?: string;
  hideHeader?: boolean;
}

export function TableReadPlayer({
  screenplayText,
  className,
  hideHeader = false,
}: TableReadPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [speechRate, setSpeechRate] = React.useState<number>(1.0);
  const [isMuted, setIsMuted] = React.useState(false);
  const [voiceEngine, setVoiceEngine] = React.useState<"gemini" | "browser">("gemini");
  const [isSynthesizing, setIsSynthesizing] = React.useState(false);
  const [activeVoiceName, setActiveVoiceName] = React.useState<string>("Fenrir");

  const activeUtteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);
  const activeAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Parse screenplay into structural tokens
  const lines: ScriptLine[] = React.useMemo(() => {
    const raw = screenplayText.split("\n");
    const parsed: ScriptLine[] = [];
    let currentSpeaker = "";

    raw.forEach((rawLine, idx) => {
      const line = rawLine.trim();
      if (!line) return;

      if (line.startsWith("INT.") || line.startsWith("EXT.")) {
        parsed.push({ id: idx, type: "slugline", text: line });
        currentSpeaker = "";
      } else if (/^[A-Z0-9\s]{2,25}$/.test(line) && !line.includes(" - ")) {
        // Character Name Header
        currentSpeaker = line;
        parsed.push({ id: idx, type: "character", speaker: line, text: line });
      } else if (line.startsWith("(") && line.endsWith(")")) {
        // Parenthetical Direction
        parsed.push({ id: idx, type: "parenthetical", speaker: currentSpeaker, text: line });
      } else if (currentSpeaker) {
        // Character Spoken Dialogue
        parsed.push({ id: idx, type: "dialogue", speaker: currentSpeaker, text: line });
      } else {
        // Scene Action / Direction
        parsed.push({ id: idx, type: "action", text: line });
      }
    });

    return parsed;
  }, [screenplayText]);

  const stopAllAudio = React.useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Handle speaking a specific line
  const speakLine = React.useCallback(
    async (index: number) => {
      stopAllAudio();

      if (index >= lines.length) {
        setIsPlaying(false);
        setCurrentIndex(0);
        return;
      }

      const item = lines[index];
      if (!item) return;

      let spokenText = item.text;
      if (item.type === "parenthetical") {
        spokenText = item.text.replace(/[()]/g, "");
      }

      // Try Gemini 3.1 Flash TTS first if engine selected
      if (voiceEngine === "gemini") {
        setIsSynthesizing(true);
        try {
          const res = await fetch("/api/media/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: spokenText,
              speaker: item.speaker || "NARRATOR",
            }),
          });

          if (res.ok) {
            const data = await res.json();
            notifyIfFallback(data, "Table Read TTS");
            if (data.audio_url && !data._fallback) {
              setActiveVoiceName(data.voice_name || "Fenrir");
              if (!isMuted) {
                const audio = new Audio(data.audio_url);
                activeAudioRef.current = audio;
                audio.playbackRate = speechRate;
                audio.onended = () => {
                  if (isPlaying && index + 1 < lines.length) {
                    setCurrentIndex(index + 1);
                    speakLine(index + 1);
                  } else {
                    setIsPlaying(false);
                  }
                };
                audio.onerror = () => {
                  setIsPlaying(false);
                };
                await audio.play();
                setIsSynthesizing(false);
                return;
              }
            }
          }
        } catch {
          // Graceful fallback to browser speech synthesis
        } finally {
          setIsSynthesizing(false);
        }
      }

      // Fallback: Browser Web Speech API
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      let pitch = 1.0;
      let rate = speechRate;

      if (item.type === "character") {
        spokenText = `${item.text}`;
        pitch = 1.1;
      } else if (item.type === "parenthetical") {
        pitch = 0.9;
        rate = speechRate * 0.9;
      } else if (item.type === "dialogue") {
        const s = (item.speaker || "").toUpperCase();
        if (s.includes("MARCUS")) {
          pitch = 0.95;
          rate = speechRate * 1.08;
        } else if (s.includes("ELENA")) {
          pitch = 1.25;
          rate = speechRate * 0.92;
        } else {
          const hash = Array.from(s).reduce((acc, c) => acc + c.charCodeAt(0), 0);
          pitch = 0.85 + (hash % 6) * 0.08;
          rate = speechRate * (0.92 + (hash % 4) * 0.06);
        }
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const s = (item.speaker || "").toUpperCase();
        if (s.includes("ELENA")) {
          const femaleVoice = voices.find((v) => v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Zira"));
          if (femaleVoice) utterance.voice = femaleVoice;
        } else if (s.includes("MARCUS") || s.includes("VANCE")) {
          const maleVoice = voices.find((v) => v.name.includes("Alex") || v.name.includes("Daniel") || v.name.includes("David"));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }

      utterance.onend = () => {
        if (isPlaying && index + 1 < lines.length) {
          setCurrentIndex(index + 1);
          speakLine(index + 1);
        } else {
          setIsPlaying(false);
        }
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      activeUtteranceRef.current = utterance;
      if (!isMuted) {
        window.speechSynthesis.speak(utterance);
      }
    },
    [lines, isPlaying, speechRate, isMuted, voiceEngine, stopAllAudio]
  );

  // Play / Pause Toggle
  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakLine(currentIndex);
    }
  };

  const handleNext = () => {
    window.speechSynthesis.cancel();
    const nextIdx = Math.min(lines.length - 1, currentIndex + 1);
    setCurrentIndex(nextIdx);
    if (isPlaying) speakLine(nextIdx);
  };

  const handlePrev = () => {
    window.speechSynthesis.cancel();
    const prevIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(prevIdx);
    if (isPlaying) speakLine(prevIdx);
  };

  const handleReset = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const currentLine = lines[currentIndex];

  return (
    <div className={`flex flex-col rounded-xl border border-border bg-card p-4 space-y-3.5 ${className ?? ""}`}>
      {/* Header & Controls Bar */}
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-accent" />
              <SlateLabel>Audio Table Read · Multi-Voice Simulation</SlateLabel>
              <Badge variant="outline" className="text-[10px] font-mono border-accent/40 bg-accent/10 text-accent">
                {voiceEngine === "gemini" ? `Gemini 3.1 TTS (${activeVoiceName})` : "Browser Web Speech"}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              Synchronized actor voice synthesis for script rhythm &amp; cadence testing
            </span>
          </div>

          {/* Engine & Speed Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border border-border bg-secondary/30 p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setVoiceEngine("gemini")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  voiceEngine === "gemini" ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Gemini 3.1 Flash TTS Multi-Speaker Expressive Speech"
              >
                Gemini TTS
              </button>
              <button
                type="button"
                onClick={() => setVoiceEngine("browser")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  voiceEngine === "browser" ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Client Browser Web Speech API"
              >
                Browser
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSpeechRate((r) => (r === 1.0 ? 1.25 : 1.0))}
                className="font-mono text-[11px] px-2 py-1 rounded border border-border bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {speechRate}x
              </button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground"
                onClick={() => setIsMuted((m) => !m)}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-destructive" /> : <Volume2 className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Transport Controls */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/25 p-2.5">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            className={`h-8 px-4 gap-2 text-xs font-semibold ${
              isPlaying ? "bg-accent text-accent-foreground" : "bg-card border border-border text-foreground hover:bg-secondary"
            }`}
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-accent" />}
            <span>{isPlaying ? "Pause Read" : "Start Table Read"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleNext}
            disabled={currentIndex === lines.length - 1}
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground"
            onClick={handleReset}
            title="Reset to Top"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Audio Waveform Speaking Animation & Controls */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {isPlaying ? (
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 bg-accent rounded-full animate-[bounce_0.6s_infinite_100ms] h-3" />
              <span className="w-1 bg-accent rounded-full animate-[bounce_0.6s_infinite_200ms] h-4" />
              <span className="w-1 bg-accent rounded-full animate-[bounce_0.6s_infinite_300ms] h-2" />
              <span className="w-1 bg-accent rounded-full animate-[bounce_0.6s_infinite_150ms] h-4" />
              <span className="w-1 bg-accent rounded-full animate-[bounce_0.6s_infinite_250ms] h-3" />
            </div>
          ) : (
            <span className="text-muted-foreground">Ready</span>
          )}
          <span className="text-muted-foreground">
            Line {currentIndex + 1} / {lines.length}
          </span>
          {hideHeader && (
            <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
              <button
                type="button"
                onClick={() => setSpeechRate((r) => (r === 1.0 ? 1.25 : 1.0))}
                className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                {speechRate}x
              </button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-muted-foreground"
                onClick={() => setIsMuted((m) => !m)}
              >
                {isMuted ? <VolumeX className="h-3 w-3 text-destructive" /> : <Volume2 className="h-3 w-3" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Active Line Focus Display */}
      {currentLine && (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
              {currentLine.speaker || (currentLine.type === "slugline" ? "SCENE HEADING" : "STAGE DIRECTION")}
            </span>
            <Badge variant="outline" className="text-[9px] py-0 px-1 border-accent/40 text-accent">
              {currentLine.type}
            </Badge>
          </div>
          <p className="font-mono text-xs text-foreground leading-relaxed">
            {currentLine.text}
          </p>
        </div>
      )}
    </div>
  );
}
