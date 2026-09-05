"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Sparkles,
  Sliders,
  Mic,
  Headphones,
  Radio,
  Music,
  RotateCcw,
  Check,
  Activity,
  Layers,
  Settings2,
  Video,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import type { ProjectCharacter } from "@/lib/project-store";

interface AudioStudioViewProps {
  characters: ProjectCharacter[];
  screenplayText: string;
  sceneTitle: string;
  onOpenVeoVideo?: () => void;
}

interface ChannelStripState {
  id: string;
  name: string;
  characterKey: string;
  voiceName: string;
  formantShift: number; // -12 to +12 semitones
  pitchFine: number; // -12 to +12
  speed: number; // 0.75 to 1.5
  deliveryStyle: string;
  eqHigh: number; // -12 to +12 dB
  eqHighMid: number; // -12 to +12 dB
  eqLowMid: number; // -12 to +12 dB
  eqLow: number; // -12 to +12 dB
  hpfEnabled: boolean;
  compThreshold: number; // -40 to 0 dB
  compRatio: string; // "2:1", "4:1", "8:1"
  compGain: number; // 0 to +12 dB
  deEsser: boolean;
  reverbSend: number; // 0 to 100%
  reverbRoom: string;
  delaySend: number; // 0 to 100%
  delayTime: string; // "80ms", "160ms", "320ms"
  pan: number; // -100 to +100
  faderDb: number; // -60 to +6 dB (0 is unity)
  isMuted: boolean;
  isSolo: boolean;
  isPhaseInverted: boolean;
  isAuditionActive: boolean;
}

const AVAILABLE_VOICES = [
  { id: "Fenrir", label: "Fenrir (Deep, Measured, Noir Resonance)", gender: "Male", comp: "Detective / Anti-Hero" },
  { id: "Aoede", label: "Aoede (Dynamic, Expressive, Sharp Intensity)", gender: "Female", comp: "Informant / Lead Female" },
  { id: "Puck", label: "Puck (Agile, Naturalistic, Quick-witted)", gender: "Neutral", comp: "Hacker / Tech Specialist" },
  { id: "Zephyr", label: "Zephyr (Whispering, Low-Register Noir)", gender: "Male", comp: "Narrator / Mastermind" },
  { id: "Charon", label: "Charon (Authoritative, Deep Sub-Bass)", gender: "Male", comp: "Colonel / Mob Boss" },
  { id: "Kore", label: "Kore (Crisp, Articulate, Razor-Sharp)", gender: "Female", comp: "Executive / Corrupt Official" },
];

const DELIVERY_STYLES = [
  "High Stakes Interrogation",
  "Whispered Urgency (Breath-Heavy)",
  "Cold Analytical (Detached)",
  "Gravelly Neo-Noir",
  "Heated Confrontation (Crescendo)",
  "Subtle Veiled Subtext",
];

const REVERB_ROOMS = [
  "Interrogation Vault (Dry Concrete)",
  "Rain-Slicked Pier (Exterior Slap)",
  "Industrial Warehouse (Long Tail)",
  "Service Elevator (Tight Tube)",
  "Scoring Sound Stage (Warm Wood)",
];

const COMP_RATIOS = ["1.5:1", "2:1", "4:1", "8:1", "Limit"];

export function AudioStudioView({
  characters,
  screenplayText,
  sceneTitle,
  onOpenVeoVideo,
}: AudioStudioViewProps) {
  // Active selected view mode: "mixer" | "audition" | "eq"
  const [activeConsoleTab, setActiveConsoleTab] = React.useState<"mixer" | "audition" | "eq">("mixer");

  // Professional Channel Strips State
  const [channels, setChannels] = React.useState<Record<string, ChannelStripState>>({
    DX1: {
      id: "DX1",
      name: "DX-1 MARCUS",
      characterKey: "MARCUS",
      voiceName: "Fenrir",
      formantShift: -2,
      pitchFine: 0,
      speed: 1.0,
      deliveryStyle: "High Stakes Interrogation",
      eqHigh: 1.5,
      eqHighMid: 2.0,
      eqLowMid: -1.0,
      eqLow: 0.5,
      hpfEnabled: true,
      compThreshold: -18,
      compRatio: "4:1",
      compGain: 3,
      deEsser: true,
      reverbSend: 22,
      reverbRoom: "Interrogation Vault (Dry Concrete)",
      delaySend: 10,
      delayTime: "80ms",
      pan: -20,
      faderDb: 0.0,
      isMuted: false,
      isSolo: false,
      isPhaseInverted: false,
      isAuditionActive: true,
    },
    DX2: {
      id: "DX2",
      name: "DX-2 ELENA",
      characterKey: "ELENA",
      voiceName: "Aoede",
      formantShift: 1,
      pitchFine: 1,
      speed: 0.98,
      deliveryStyle: "Cold Analytical (Detached)",
      eqHigh: 2.5,
      eqHighMid: 1.0,
      eqLowMid: -2.0,
      eqLow: -1.0,
      hpfEnabled: true,
      compThreshold: -16,
      compRatio: "4:1",
      compGain: 2.5,
      deEsser: true,
      reverbSend: 25,
      reverbRoom: "Interrogation Vault (Dry Concrete)",
      delaySend: 12,
      delayTime: "80ms",
      pan: 20,
      faderDb: -0.5,
      isMuted: false,
      isSolo: false,
      isPhaseInverted: false,
      isAuditionActive: false,
    },
    DX3: {
      id: "DX3",
      name: "DX-3 NARRATOR",
      characterKey: "NARRATOR",
      voiceName: "Zephyr",
      formantShift: -4,
      pitchFine: -1,
      speed: 1.04,
      deliveryStyle: "Gravelly Neo-Noir",
      eqHigh: 0.0,
      eqHighMid: -1.0,
      eqLowMid: 1.0,
      eqLow: 3.0,
      hpfEnabled: false,
      compThreshold: -14,
      compRatio: "2:1",
      compGain: 1.0,
      deEsser: false,
      reverbSend: 15,
      reverbRoom: "Scoring Sound Stage (Warm Wood)",
      delaySend: 0,
      delayTime: "160ms",
      pan: 0,
      faderDb: -2.0,
      isMuted: false,
      isSolo: false,
      isPhaseInverted: false,
      isAuditionActive: false,
    },
    MX1: {
      id: "MX1",
      name: "MX-1 LYRIA SCORE",
      characterKey: "SCORE",
      voiceName: "Synth",
      formantShift: 0,
      pitchFine: 0,
      speed: 1.0,
      deliveryStyle: "Cinematic Atmosphere",
      eqHigh: -3.0,
      eqHighMid: -4.0,
      eqLowMid: 2.0,
      eqLow: 4.0,
      hpfEnabled: false,
      compThreshold: -22,
      compRatio: "2:1",
      compGain: 0,
      deEsser: false,
      reverbSend: 45,
      reverbRoom: "Industrial Warehouse (Long Tail)",
      delaySend: 20,
      delayTime: "320ms",
      pan: 0,
      faderDb: -8.0,
      isMuted: false,
      isSolo: false,
      isPhaseInverted: false,
      isAuditionActive: false,
    },
  });

  // Master Bus Controls
  const [masterFaderDb, setMasterFaderDb] = React.useState<number>(0.0);
  const [isLimiterActive, setIsLimiterActive] = React.useState<boolean>(true);
  const [lufsTarget, setLufsTarget] = React.useState<string>("-23 LUFS (Broadcast)");
  const [isAmbientPlaying, setIsAmbientPlaying] = React.useState<boolean>(false);

  // Audition sandbox state
  const [activeAuditionChannel, setActiveAuditionChannel] = React.useState<string>("DX1");
  const [auditionText, setAuditionText] = React.useState<string>(
    "The vault codes were wiped before we breached the perimeter."
  );
  const [isAuditioning, setIsAuditioning] = React.useState<boolean>(false);
  const [auditionSuccess, setAuditionSuccess] = React.useState<boolean>(false);

  // Master Assembly Playback State
  const [isPlayingMaster, setIsPlayingMaster] = React.useState<boolean>(false);
  const [currentLineIdx, setCurrentLineIdx] = React.useState<number>(0);

  const activeAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const ambientContextRef = React.useRef<AudioContext | null>(null);

  // Parse lines for sequential playback
  const scriptLines = React.useMemo(() => {
    const raw = screenplayText.split("\n");
    const parsed: Array<{ id: number; speaker: string; text: string }> = [];
    let currentSpeaker = "NARRATOR";

    raw.forEach((r, idx) => {
      const line = r.trim();
      if (!line) return;
      if (/^[A-Z0-9\s]{2,25}$/.test(line) && !line.includes(" - ")) {
        currentSpeaker = line;
      } else if (line.startsWith("(") && line.endsWith(")")) {
        // Skip purely visual action line
      } else {
        parsed.push({ id: idx, speaker: currentSpeaker, text: line });
      }
    });
    return parsed;
  }, [screenplayText]);

  const updateChannel = (channelId: string, patch: Partial<ChannelStripState>) => {
    setChannels((prev) => ({
      ...prev,
      [channelId]: { ...prev[channelId], ...patch },
    }));
  };

  // Convert dB to linear gain: 10^(dB/20)
  const dbToLinear = (db: number) => Math.pow(10, db / 20);

  // Audition single channel voice via Gemini 3.1 Flash TTS
  const handleAudition = async () => {
    if (isAuditioning) return;
    setIsAuditioning(true);
    setAuditionSuccess(false);

    const ch = channels[activeAuditionChannel] || channels["DX1"];

    try {
      const res = await fetch("/api/media/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: auditionText,
          speaker: ch.characterKey,
          voice_name: ch.voiceName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio_url) {
          if (activeAudioRef.current) activeAudioRef.current.pause();
          const audio = new Audio(data.audio_url);
          activeAudioRef.current = audio;
          audio.playbackRate = ch.speed;
          // Apply fader gain
          const gain = dbToLinear(ch.faderDb) * dbToLinear(masterFaderDb);
          audio.volume = Math.max(0, Math.min(1, gain));
          await audio.play();
          setAuditionSuccess(true);
          setTimeout(() => setAuditionSuccess(false), 2000);
        }
      }
    } catch (err) {
      console.error("Audition failed:", err);
    } finally {
      setIsAuditioning(false);
    }
  };

  // Web Audio API Cinematic Drone (Lyria 3 style)
  const toggleAmbientSoundtrack = () => {
    if (isAmbientPlaying) {
      if (ambientContextRef.current) {
        ambientContextRef.current.close();
        ambientContextRef.current = null;
      }
      setIsAmbientPlaying(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        ambientContextRef.current = ctx;

        const oscSub = ctx.createOscillator();
        const oscDrone = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        oscSub.type = "sine";
        oscSub.frequency.setValueAtTime(45, ctx.currentTime); // Sub-bass 45Hz

        oscDrone.type = "sawtooth";
        oscDrone.frequency.setValueAtTime(90, ctx.currentTime); // 90Hz harmonic

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(220, ctx.currentTime); // Dark cinema dampening

        const mxGain = dbToLinear(channels.MX1.faderDb) * dbToLinear(masterFaderDb) * 0.18;
        gain.gain.setValueAtTime(Math.max(0, Math.min(0.5, mxGain)), ctx.currentTime);

        oscSub.connect(filter);
        oscDrone.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        oscSub.start();
        oscDrone.start();
        setIsAmbientPlaying(true);
      } catch (err) {
        console.error("Ambient audio error:", err);
      }
    }
  };

  // Sequential line player
  const playMasterLine = React.useCallback(
    async (idx: number) => {
      if (idx >= scriptLines.length) {
        setIsPlayingMaster(false);
        setCurrentLineIdx(0);
        return;
      }

      const item = scriptLines[idx];
      const speakerUpper = item.speaker.trim().toUpperCase();

      let targetChannel = channels.DX1;
      if (speakerUpper.includes("ELENA")) targetChannel = channels.DX2;
      else if (speakerUpper.includes("NARRATOR")) targetChannel = channels.DX3;

      if (targetChannel.isMuted) {
        setCurrentLineIdx(idx + 1);
        playMasterLine(idx + 1);
        return;
      }

      try {
        const res = await fetch("/api/media/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: item.text,
            speaker: targetChannel.characterKey,
            voice_name: targetChannel.voiceName,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audio_url) {
            const audio = new Audio(data.audio_url);
            activeAudioRef.current = audio;
            audio.playbackRate = targetChannel.speed;
            const gain = dbToLinear(targetChannel.faderDb) * dbToLinear(masterFaderDb);
            audio.volume = Math.max(0, Math.min(1, gain));
            audio.onended = () => {
              if (isPlayingMaster && idx + 1 < scriptLines.length) {
                setCurrentLineIdx(idx + 1);
                playMasterLine(idx + 1);
              } else {
                setIsPlayingMaster(false);
              }
            };
            audio.onerror = () => setIsPlayingMaster(false);
            await audio.play();
          }
        }
      } catch {
        setIsPlayingMaster(false);
      }
    },
    [scriptLines, channels, isPlayingMaster, masterFaderDb]
  );

  const togglePlayMaster = () => {
    if (isPlayingMaster) {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      setIsPlayingMaster(false);
    } else {
      setIsPlayingMaster(true);
      playMasterLine(currentLineIdx);
    }
  };

  React.useEffect(() => {
    return () => {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      if (ambientContextRef.current) ambientContextRef.current.close();
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-[#0a0c10] text-foreground p-5 space-y-4 select-none">
      {/* Top Console Meterbridge & Global Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3 bg-secondary/10 px-4 py-2.5 rounded-xl border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center shadow-lg">
            <Headphones className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-foreground">
                Fairlight Studio Console · {sceneTitle}
              </h2>
              <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-[10px] font-mono">
                Gemini 3.1 TTS + Lyria Bus
              </Badge>
              <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-300 text-[10px] font-mono">
                EBU R128 (-23 LUFS)
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              4-Band Parametric EQ · VCA Compressors · Convolution Space · Stem Mapping to Google Veo
            </p>
          </div>
        </div>

        {/* Top Transport & Mode Tabs */}
        <div className="flex items-center gap-2.5">
          {/* Sub-View Switcher */}
          <div className="flex items-center rounded-lg border border-border bg-black/50 p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveConsoleTab("mixer")}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                activeConsoleTab === "mixer"
                  ? "bg-cyan-600 text-white font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mixing Console
            </button>
            <button
              type="button"
              onClick={() => setActiveConsoleTab("audition")}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                activeConsoleTab === "audition"
                  ? "bg-cyan-600 text-white font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ADR Voice Shaper
            </button>
            <button
              type="button"
              onClick={() => setActiveConsoleTab("eq")}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                activeConsoleTab === "eq"
                  ? "bg-cyan-600 text-white font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Parametric EQ / Dynamics
            </button>
          </div>

          {/* Ambient Synth Toggle */}
          <button
            type="button"
            onClick={toggleAmbientSoundtrack}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${
              isAmbientPlaying
                ? "bg-purple-600/30 border-purple-500/60 text-purple-200"
                : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Radio className={`h-3.5 w-3.5 ${isAmbientPlaying ? "text-purple-400 animate-pulse" : "text-muted-foreground"}`} />
            <span>{isAmbientPlaying ? "Score Live" : "Lyria Bed"}</span>
          </button>

          {/* Master Scene Playback */}
          <Button
            size="sm"
            onClick={togglePlayMaster}
            className={`h-8 px-4 gap-1.5 text-xs font-semibold cursor-pointer shadow-md ${
              isPlayingMaster
                ? "bg-accent text-accent-foreground animate-pulse"
                : "bg-cyan-500 hover:bg-cyan-600 text-black"
            }`}
          >
            {isPlayingMaster ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            <span>{isPlayingMaster ? "Pause Scene" : "Play Scene Mix"}</span>
          </Button>

          {/* Direct Link to Veo 3.1 Video Mapping */}
          {onOpenVeoVideo && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenVeoVideo}
              className="h-8 px-3 gap-1.5 text-xs border-purple-500/40 text-purple-300 hover:bg-purple-500/15 cursor-pointer"
              title="Map Audio Stems & Storyboards into Google Veo 3.1"
            >
              <Video className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden sm:inline">Map to Veo 3.1</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Console Board Area */}
      {activeConsoleTab === "mixer" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Channel Strips Area (10 Cols) */}
          <div className="md:col-span-10 grid grid-cols-4 gap-3 bg-black/60 p-3.5 rounded-xl border border-border/80 shadow-2xl">
            {Object.values(channels).map((ch) => {
              const isLeadMarcus = ch.id === "DX1";
              const isLeadElena = ch.id === "DX2";
              const accentColor = isLeadMarcus ? "text-accent" : isLeadElena ? "text-rose-400" : "text-cyan-400";
              const borderAccent = isLeadMarcus ? "border-accent/40" : isLeadElena ? "border-rose-500/40" : "border-border/70";

              return (
                <div
                  key={ch.id}
                  className={`flex flex-col rounded-lg border ${borderAccent} bg-card/70 p-3 space-y-3 relative shadow-inner`}
                >
                  {/* Strip Header */}
                  <div className="flex flex-col items-center border-b border-border/50 pb-2 text-center">
                    <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${accentColor}`}>
                      {ch.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                      {ch.voiceName} · {ch.speed}x
                    </span>
                  </div>

                  {/* Rotary Controls: EQ Trim & Pan */}
                  <div className="space-y-2 bg-black/40 p-2 rounded border border-border/50">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-muted-foreground">Pan</span>
                      <span className="text-foreground font-bold">
                        {ch.pan < 0 ? `L${Math.abs(ch.pan)}` : ch.pan > 0 ? `R${ch.pan}` : "C"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={ch.pan}
                      onChange={(e) => updateChannel(ch.id, { pan: parseInt(e.target.value) })}
                      className="w-full h-1 accent-cyan-400 bg-secondary rounded cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                      <span className="text-muted-foreground">Reverb</span>
                      <span className="text-purple-300 font-bold">{ch.reverbSend}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ch.reverbSend}
                      onChange={(e) => updateChannel(ch.id, { reverbSend: parseInt(e.target.value) })}
                      className="w-full h-1 accent-purple-400 bg-secondary rounded cursor-pointer"
                    />
                  </div>

                  {/* Channel State Buttons: MUTE / SOLO / PHASE */}
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => updateChannel(ch.id, { isMuted: !ch.isMuted })}
                      className={`py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors ${
                        ch.isMuted
                          ? "bg-rose-600 text-white shadow-md shadow-rose-900/50"
                          : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                      title="Mute Track"
                    >
                      M
                    </button>
                    <button
                      type="button"
                      onClick={() => updateChannel(ch.id, { isSolo: !ch.isSolo })}
                      className={`py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors ${
                        ch.isSolo
                          ? "bg-amber-400 text-black shadow-md shadow-amber-900/50"
                          : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                      title="Solo Track"
                    >
                      S
                    </button>
                    <button
                      type="button"
                      onClick={() => updateChannel(ch.id, { isPhaseInverted: !ch.isPhaseInverted })}
                      className={`py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors ${
                        ch.isPhaseInverted
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                      title="Phase Invert (180°)"
                    >
                      Ø
                    </button>
                  </div>

                  {/* Long-Throw Fader & Dual LED VU Meter */}
                  <div className="flex items-center justify-center gap-3 py-2 flex-1 min-h-[160px]">
                    {/* Calibrated dB Scale */}
                    <div className="flex flex-col justify-between text-[9px] font-mono text-muted-foreground/60 h-36 select-none">
                      <span>+6</span>
                      <span>0</span>
                      <span>-6</span>
                      <span>-12</span>
                      <span>-24</span>
                      <span>-∞</span>
                    </div>

                    {/* Vertical Throw Fader */}
                    <div className="relative h-36 flex items-center justify-center w-8 bg-black/60 rounded border border-border/60">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20 pointer-events-none" />
                      <input
                        type="range"
                        min="-60"
                        max="6"
                        step="0.5"
                        value={ch.faderDb}
                        onChange={(e) => updateChannel(ch.id, { faderDb: parseFloat(e.target.value) })}
                        className="h-32 -rotate-90 accent-cyan-400 cursor-pointer w-32"
                      />
                    </div>

                    {/* Segmented LED VU Meter Ladder */}
                    <div className="flex flex-col gap-0.5 h-36 justify-between py-1 bg-black/80 px-1 rounded border border-border/40">
                      <span className={`w-2 h-2 rounded-xs ${isPlayingMaster && ch.faderDb > 2 ? "bg-rose-500 animate-pulse" : "bg-rose-950/40"}`} />
                      <span className={`w-2 h-2 rounded-xs ${isPlayingMaster && ch.faderDb > 0 ? "bg-amber-400" : "bg-amber-950/40"}`} />
                      <span className={`w-2 h-2 rounded-xs ${isPlayingMaster && ch.faderDb > -6 ? "bg-amber-400" : "bg-amber-950/40"}`} />
                      <span className={`w-2 h-2 rounded-xs ${isPlayingMaster && ch.faderDb > -12 ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                      <span className={`w-2 h-2 rounded-xs ${isPlayingMaster && ch.faderDb > -18 ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                      <span className={`w-2 h-2 rounded-xs ${isPlayingMaster && ch.faderDb > -24 ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                      <span className={`w-2 h-2 rounded-xs ${isPlayingMaster && ch.faderDb > -36 ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                      <span className={`w-2 h-2 rounded-xs ${isPlayingMaster && ch.faderDb > -48 ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                    </div>
                  </div>

                  {/* Fader Readout & Quick Audition */}
                  <div className="flex items-center justify-between text-[11px] font-mono border-t border-border/50 pt-2">
                    <span className="text-foreground font-bold">
                      {ch.faderDb > 0 ? `+${ch.faderDb.toFixed(1)}` : ch.faderDb <= -59 ? "-∞" : ch.faderDb.toFixed(1)} dB
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAuditionChannel(ch.id);
                        setActiveConsoleTab("audition");
                      }}
                      className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      ADR Shaper →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Master 2-Bus Channel Strip (2 Cols) */}
          <div className="md:col-span-2 flex flex-col rounded-xl border border-accent/40 bg-accent/5 p-3.5 space-y-3 relative shadow-2xl">
            <div className="flex flex-col items-center border-b border-accent/30 pb-2 text-center">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                2-BUS MASTER
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {isLimiterActive ? "Limiter: -0.1 dBFS" : "Bypass"}
              </span>
            </div>

            {/* Master Limiter Switch */}
            <div className="bg-black/50 p-2 rounded border border-border/60 flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground text-[11px]">True Peak</span>
              <button
                type="button"
                onClick={() => setIsLimiterActive(!isLimiterActive)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  isLimiterActive ? "bg-emerald-500 text-black" : "bg-secondary text-muted-foreground"
                }`}
              >
                {isLimiterActive ? "LIMIT ON" : "BYPASS"}
              </button>
            </div>

            {/* Master Throw Fader & Dual Stereo Ladder */}
            <div className="flex items-center justify-center gap-2 py-2 flex-1 min-h-[160px]">
              <div className="flex flex-col justify-between text-[9px] font-mono text-muted-foreground/60 h-36 select-none">
                <span>+6</span>
                <span>0</span>
                <span>-6</span>
                <span>-12</span>
                <span>-24</span>
                <span>-∞</span>
              </div>

              {/* Fader */}
              <div className="relative h-36 flex items-center justify-center w-8 bg-black/60 rounded border border-accent/40">
                <input
                  type="range"
                  min="-60"
                  max="6"
                  step="0.5"
                  value={masterFaderDb}
                  onChange={(e) => setMasterFaderDb(parseFloat(e.target.value))}
                  className="h-32 -rotate-90 accent-accent cursor-pointer w-32"
                />
              </div>

              {/* Dual Stereo Meters (L and R) */}
              <div className="flex gap-0.5">
                {/* L */}
                <div className="flex flex-col gap-0.5 h-36 justify-between py-1 bg-black/80 px-0.5 rounded border border-border/40">
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster && masterFaderDb > 1 ? "bg-rose-500" : "bg-rose-950/40"}`} />
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster && masterFaderDb > -2 ? "bg-amber-400" : "bg-amber-950/40"}`} />
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                </div>
                {/* R */}
                <div className="flex flex-col gap-0.5 h-36 justify-between py-1 bg-black/80 px-0.5 rounded border border-border/40">
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster && masterFaderDb > 1 ? "bg-rose-500" : "bg-rose-950/40"}`} />
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster && masterFaderDb > -2 ? "bg-amber-400" : "bg-amber-950/40"}`} />
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                  <span className={`w-1.5 h-2 rounded-xs ${isPlayingMaster ? "bg-emerald-500" : "bg-emerald-950/40"}`} />
                </div>
              </div>
            </div>

            <div className="text-center border-t border-accent/30 pt-2 font-mono text-xs font-bold text-accent">
              {masterFaderDb > 0 ? `+${masterFaderDb.toFixed(1)}` : masterFaderDb.toFixed(1)} dBFS
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 2: ADR Voice & Formant Acoustic Shaper */}
      {activeConsoleTab === "audition" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-card border border-border p-5 rounded-xl">
          {/* Character Track Selector (4 Cols) */}
          <div className="md:col-span-4 space-y-3 border-r border-border/60 pr-4">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Select Track to Audition</span>
            <div className="space-y-1.5">
              {Object.values(channels).map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveAuditionChannel(ch.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                    activeAuditionChannel === ch.id
                      ? "bg-accent text-accent-foreground font-bold border-accent shadow-md"
                      : "bg-secondary/20 border-border/60 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <span>{ch.name}</span>
                  <span className="text-[11px] opacity-80">{ch.voiceName}</span>
                </button>
              ))}
            </div>

            {/* Quick Audition Line Input */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-mono text-muted-foreground">Audition Test Line:</span>
              <textarea
                rows={3}
                value={auditionText}
                onChange={(e) => setAuditionText(e.target.value)}
                className="w-full text-xs font-serif bg-secondary/30 rounded border border-border p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <Button
                size="sm"
                onClick={handleAudition}
                disabled={isAuditioning || !auditionText.trim()}
                className="w-full h-8 text-xs font-semibold gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isAuditioning ? "Synthesizing with Gemini 3.1..." : `Audition ${channels[activeAuditionChannel]?.characterKey} Voice`}</span>
              </Button>
            </div>
          </div>

          {/* Acoustic & Formant Tuning Controls (8 Cols) */}
          {(() => {
            const ch = channels[activeAuditionChannel] || channels.DX1;
            return (
              <div className="md:col-span-8 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-heading font-bold text-foreground">
                      {ch.name} · Vocal Timbre &amp; Resonance Architecture
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">Gemini 3.1 Flash Speech Engine</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Voice Model Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Prebuilt Google TTS Timbre</label>
                    <select
                      value={ch.voiceName}
                      onChange={(e) => updateChannel(ch.id, { voiceName: e.target.value })}
                      className="w-full text-xs font-mono rounded border border-border bg-secondary/40 p-2 text-foreground cursor-pointer"
                    >
                      {AVAILABLE_VOICES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delivery Style */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Psychological Delivery Mode</label>
                    <select
                      value={ch.deliveryStyle}
                      onChange={(e) => updateChannel(ch.id, { deliveryStyle: e.target.value })}
                      className="w-full text-xs rounded border border-border bg-secondary/40 p-2 text-foreground cursor-pointer"
                    >
                      {DELIVERY_STYLES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Formant & Cadence Sliders */}
                <div className="grid grid-cols-3 gap-4 pt-1">
                  <div className="space-y-1 bg-secondary/20 p-2.5 rounded border border-border/60">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">Formant Throat</span>
                      <span className="text-cyan-400">{ch.formantShift > 0 ? `+${ch.formantShift}` : ch.formantShift} st</span>
                    </div>
                    <input
                      type="range"
                      min="-6"
                      max="6"
                      value={ch.formantShift}
                      onChange={(e) => updateChannel(ch.id, { formantShift: parseInt(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5"
                    />
                    <span className="text-[9px] text-muted-foreground">Chest vs Head Resonance</span>
                  </div>

                  <div className="space-y-1 bg-secondary/20 p-2.5 rounded border border-border/60">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">Cadence Speed</span>
                      <span className="text-accent">{ch.speed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.5"
                      step="0.05"
                      value={ch.speed}
                      onChange={(e) => updateChannel(ch.id, { speed: parseFloat(e.target.value) })}
                      className="w-full accent-accent cursor-pointer h-1.5"
                    />
                    <span className="text-[9px] text-muted-foreground">Rhythm &amp; Syllable Rate</span>
                  </div>

                  <div className="space-y-1 bg-secondary/20 p-2.5 rounded border border-border/60">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">Pitch Tuning</span>
                      <span className="text-purple-300">{ch.pitchFine > 0 ? `+${ch.pitchFine}` : ch.pitchFine} st</span>
                    </div>
                    <input
                      type="range"
                      min="-6"
                      max="6"
                      value={ch.pitchFine}
                      onChange={(e) => updateChannel(ch.id, { pitchFine: parseInt(e.target.value) })}
                      className="w-full accent-purple-400 cursor-pointer h-1.5"
                    />
                    <span className="text-[9px] text-muted-foreground">Fundamental Frequency</span>
                  </div>
                </div>

                {/* Acoustic Space Convolution */}
                <div className="space-y-1 bg-secondary/15 p-3 rounded border border-border/70">
                  <span className="text-xs font-mono text-muted-foreground">Acoustic Room Impulse (Convolution Reverb)</span>
                  <select
                    value={ch.reverbRoom}
                    onChange={(e) => updateChannel(ch.id, { reverbRoom: e.target.value })}
                    className="w-full text-xs rounded border border-border bg-card p-2 text-foreground cursor-pointer"
                  >
                    {REVERB_ROOMS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Sub-View 3: 4-Band Parametric EQ & Dynamics Rack */}
      {activeConsoleTab === "eq" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-card border border-border p-5 rounded-xl">
          {Object.values(channels).map((ch) => (
            <div key={ch.id} className="md:col-span-6 rounded-lg border border-border/70 bg-secondary/15 p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <span className="text-xs font-mono font-bold text-foreground">{ch.name} · Parametric EQ &amp; Dynamics</span>
                <span className="text-[10px] font-mono text-cyan-400">VCA Opto-Comp</span>
              </div>

              {/* 4-Band EQ Sliders */}
              <div className="grid grid-cols-4 gap-2 bg-black/40 p-2.5 rounded border border-border/50 text-center">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground">HIGH (10k)</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={ch.eqHigh}
                    onChange={(e) => updateChannel(ch.id, { eqHigh: parseFloat(e.target.value) })}
                    className="h-16 -rotate-90 accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono block text-foreground">{ch.eqHigh} dB</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground">HI-MID (3k)</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={ch.eqHighMid}
                    onChange={(e) => updateChannel(ch.id, { eqHighMid: parseFloat(e.target.value) })}
                    className="h-16 -rotate-90 accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono block text-foreground">{ch.eqHighMid} dB</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground">LO-MID (600)</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={ch.eqLowMid}
                    onChange={(e) => updateChannel(ch.id, { eqLowMid: parseFloat(e.target.value) })}
                    className="h-16 -rotate-90 accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono block text-foreground">{ch.eqLowMid} dB</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground">LOW (100)</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={ch.eqLow}
                    onChange={(e) => updateChannel(ch.id, { eqLow: parseFloat(e.target.value) })}
                    className="h-16 -rotate-90 accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono block text-foreground">{ch.eqLow} dB</span>
                </div>
              </div>

              {/* Compressor Controls */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-secondary/30 p-2 rounded">
                  <span className="text-[10px] text-muted-foreground block">Thresh</span>
                  <span className="font-bold text-foreground">{ch.compThreshold} dB</span>
                </div>
                <div className="bg-secondary/30 p-2 rounded">
                  <span className="text-[10px] text-muted-foreground block">Ratio</span>
                  <span className="font-bold text-cyan-400">{ch.compRatio}</span>
                </div>
                <div className="bg-secondary/30 p-2 rounded">
                  <span className="text-[10px] text-muted-foreground block">Make-Up</span>
                  <span className="font-bold text-emerald-400">+{ch.compGain} dB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sequential Script Teleprompter Strip */}
      <div className="rounded-xl border border-border/80 bg-black/50 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pb-1 border-b border-border/40">
          <span>Screenplay Master Assembly ({scriptLines.length} lines total)</span>
          <span>Line {currentLineIdx + 1} of {scriptLines.length}</span>
        </div>

        <div className="flex gap-2 overflow-x-auto py-1">
          {scriptLines.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                setCurrentLineIdx(idx);
                if (isPlayingMaster) playMasterLine(idx);
              }}
              className={`p-2 rounded border text-xs font-mono cursor-pointer shrink-0 max-w-xs transition-all ${
                currentLineIdx === idx
                  ? "bg-accent/20 border-accent text-foreground font-semibold shadow-md"
                  : "bg-card/40 border-border/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-[10px] font-bold text-accent uppercase block">
                {item.speaker}:
              </span>
              <p className="line-clamp-2 italic text-[11px] mt-0.5">
                &ldquo;{item.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
