"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Activity,
  Globe2,
  Volume2,
  Layers,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  DollarSign,
  TrendingUp,
  Award,
  Film,
  Eye,
  Lightbulb,
} from "lucide-react";

type DeckTab = "blocking" | "tension" | "territory" | "audio" | "stripboard";

export function DirectorsDeckSuite() {
  const [activeTab, setActiveTab] = React.useState<DeckTab>("blocking");

  // Camera Blocking State
  const [activeCam, setActiveCam] = React.useState<"cam-a" | "cam-b" | "cam-c">("cam-a");

  // Tension Curve Scrub State
  const [tensionScrubMinute, setTensionScrubMinute] = React.useState<number>(34);

  // Audio Table Read State
  const [isPlayingAudio, setIsPlayingAudio] = React.useState<boolean>(false);
  const [audioLineIndex, setAudioLineIndex] = React.useState<number>(1);
  const [playbackSpeed, setPlaybackSpeed] = React.useState<string>("1.0x");

  // Audio simulated timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioLineIndex((prev) => (prev >= 3 ? 0 : prev + 1));
      }, 2600);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const AUDIO_LINES = [
    {
      speaker: "MARCUS",
      text: "They're not here. Elena. The bypass keys. They're not in the bag.",
      cadence: "Terse, breathless, panic onset",
      pitch: "1.12x / Anxious Tenor",
      color: "text-amber-400",
    },
    {
      speaker: "ELENA",
      text: "Check the side pouch, Marcus.",
      cadence: "Deadpan, slow, calculated poise",
      pitch: "0.92x / Low Alto",
      color: "text-purple-400",
    },
    {
      speaker: "MARCUS",
      text: "I checked the pouch! I checked it twice! You were the last one at the staging locker!",
      cadence: "Elevated volume, accusatory crack",
      pitch: "1.25x / Strained",
      color: "text-amber-400",
    },
    {
      speaker: "ELENA",
      text: "We have six minutes until the atmospheric vents cycle. Panic won't unlock that steel door.",
      cadence: "Icy finality, unbothered",
      pitch: "0.95x / Monotone",
      color: "text-purple-400",
    },
  ];

  return (
    <div id="directors-deck" className="w-full space-y-6 pt-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <SlateLabel>Production Deck Suite</SlateLabel>
          <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">
            The Director&apos;s Deck: Pre-Production Tools
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
            Everything Hollywood directors and showrunners need before stepping on set. Explore the interactive modules below.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-secondary/60 border border-border">
          {[
            { id: "blocking", label: "2D Floor Plan", icon: Camera },
            { id: "tension", label: "Tension Curve", icon: Activity },
            { id: "territory", label: "Box Office Precedents", icon: Globe2 },
            { id: "audio", label: "Audio Table Read", icon: Volume2 },
            { id: "stripboard", label: "Stripboard", icon: Film },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DeckTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Suite Card Container */}
      <div className="rounded-2xl border border-border bg-card/90 overflow-hidden shadow-2xl p-6 min-h-[460px]">
        {/* TAB 1: 2D Stage Floor Plan & Camera Blocking */}
        {activeTab === "blocking" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-accent" />
                  <h3 className="font-heading font-bold text-sm text-foreground">
                    Scene 04 Stage Blocking: Underground Vault Interior
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Architectural overhead camera blocking with active frustum cones, practical fixtures, and sightline vectors.
                </p>
              </div>

              {/* Camera Selection Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-muted-foreground">Select Camera:</span>
                {[
                  { id: "cam-a", name: "Cam A: Panavision 40mm (Master)", lens: "40mm Anamorphic T2.0" },
                  { id: "cam-b", name: "Cam B: 85mm Prime (Marcus OTS)", lens: "85mm Prime T1.4" },
                  { id: "cam-c", name: "Cam C: 100mm Macro (Elena Close-up)", lens: "100mm Macro T2.8" },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setActiveCam(cam.id as any)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${
                      activeCam === cam.id
                        ? "border-accent bg-accent/20 text-accent font-bold shadow-sm"
                        : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {cam.name.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Stage Blueprint */}
            <div className="relative w-full h-[320px] rounded-xl border border-border bg-black/80 overflow-hidden flex items-center justify-center p-4">
              <svg className="w-full h-full" viewBox="0 0 800 300">
                {/* Blueprint Grid Lines */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1c1f24" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="800" height="300" fill="url(#grid)" />

                {/* Vault Wall Boundaries */}
                <rect x="60" y="30" width="680" height="240" fill="none" stroke="#2a2d33" strokeWidth="3" rx="8" />
                
                {/* Heavy Steel Safe Door */}
                <rect x="60" y="90" width="16" height="120" fill="#2a2d33" stroke="#5fa88a" strokeWidth="2" />
                <text x="85" y="155" fill="#5fa88a" fontSize="10" fontFamily="monospace">PRIMARY VAULT HATCH</text>

                {/* Lockboxes wall */}
                <line x1="160" y1="30" x2="480" y2="30" stroke="#d4a054" strokeWidth="4" strokeDasharray="4 4" />
                <text x="240" y="24" fill="#d4a054" fontSize="9" fontFamily="monospace">SAFETY DEPOSIT LOCKBOX BANK</text>

                {/* Practical Lighting Elements */}
                <circle cx="280" cy="80" r="18" fill="rgba(6, 182, 212, 0.15)" />
                <circle cx="280" cy="80" r="4" fill="#06b6d4" />
                <text x="260" y="70" fill="#06b6d4" fontSize="8" fontFamily="monospace">Aux Light (5600K)</text>

                <circle cx="520" cy="80" r="18" fill="rgba(212, 160, 84, 0.15)" />
                <circle cx="520" cy="80" r="4" fill="#d4a054" />
                <text x="500" y="70" fill="#d4a054" fontSize="8" fontFamily="monospace">Amber Timer (3200K)</text>

                {/* Actors: Marcus & Elena */}
                {/* Sightline Vector between Marcus and Elena */}
                <line x1="280" y1="170" x2="490" y2="150" stroke="#c25b52" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                
                {/* Marcus */}
                <circle cx="280" cy="170" r="14" fill="#d4a054" />
                <circle cx="280" cy="170" r="18" fill="none" stroke="#d4a054" strokeWidth="1" strokeDasharray="2 2" />
                <text x="260" y="202" fill="#d4a054" fontSize="11" fontFamily="monospace" fontWeight="bold">MARCUS (Kneeling)</text>

                {/* Elena */}
                <circle cx="490" cy="150" r="14" fill="#a855f7" />
                <circle cx="490" cy="150" r="18" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" />
                <text x="470" y="182" fill="#a855f7" fontSize="11" fontFamily="monospace" fontWeight="bold">ELENA (Standing)</text>

                {/* Camera Frustum Cones based on active camera */}
                {activeCam === "cam-a" && (
                  <g>
                    {/* Wide Master Cam */}
                    <polygon points="380,265 140,70 640,70" fill="rgba(6, 182, 212, 0.18)" stroke="#06b6d4" strokeWidth="1.5" />
                    <rect x="365" y="255" width="30" height="20" rx="4" fill="#06b6d4" />
                    <circle cx="380" cy="255" r="4" fill="#fff" />
                    <text x="340" y="290" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">CAM A: 40mm Wide Master</text>
                  </g>
                )}

                {activeCam === "cam-b" && (
                  <g>
                    {/* Over the shoulder Marcus Cam */}
                    <polygon points="210,210 450,110 540,180" fill="rgba(212, 160, 84, 0.22)" stroke="#d4a054" strokeWidth="1.5" />
                    <rect x="195" y="200" width="30" height="20" rx="4" fill="#d4a054" />
                    <circle cx="210" cy="200" r="4" fill="#fff" />
                    <text x="160" y="235" fill="#d4a054" fontSize="10" fontFamily="monospace" fontWeight="bold">CAM B: 85mm Marcus OTS</text>
                  </g>
                )}

                {activeCam === "cam-c" && (
                  <g>
                    {/* Close up Elena Cam */}
                    <polygon points="620,150 460,135 460,165" fill="rgba(168, 85, 247, 0.25)" stroke="#a855f7" strokeWidth="1.5" />
                    <rect x="605" y="140" width="30" height="20" rx="4" fill="#a855f7" />
                    <circle cx="605" cy="150" r="4" fill="#fff" />
                    <text x="560" y="180" fill="#a855f7" fontSize="10" fontFamily="monospace" fontWeight="bold">CAM C: 100mm Elena Close-Up</text>
                  </g>
                )}
              </svg>
            </div>

            {/* Camera Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-secondary/40 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Lens &amp; Aperture</span>
                <p className="font-mono font-bold text-foreground">
                  {activeCam === "cam-a" ? "Panavision C-Series 40mm T2.0" : activeCam === "cam-b" ? "Cooke S4/i 85mm T1.4" : "Zeiss Master 100mm T2.8"}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-secondary/40 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Aspect Ratio</span>
                <p className="font-mono font-bold text-accent">2.39:1 Anamorphic Scope</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-secondary/40 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Color Temperature</span>
                <p className="font-mono font-bold text-cyan-400">4300K Cool Fluorescent / Amber</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-secondary/40 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Stage Coverage</span>
                <p className="font-mono font-bold text-success">100% Sightline Cleared</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 3-Act Dramatic Tension Curve */}
        {activeTab === "tension" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-warning" />
                  <h3 className="font-heading font-bold text-sm text-foreground">
                    Non-Linear 3-Act Narrative Tension &amp; Pacing Graph
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tracks pacing spikes across 90 minutes. Scrub the slider below to inspect tension at that exact minute.
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-muted-foreground">Minute {tensionScrubMinute}:00</span>
                <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning font-bold">
                  Tension: {tensionScrubMinute < 20 ? "35" : tensionScrubMinute < 40 ? "82" : tensionScrubMinute < 65 ? "94" : "98"}/100
                </Badge>
              </div>
            </div>

            {/* Tension Scrub Range Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={90}
                value={tensionScrubMinute}
                onChange={(e) => setTensionScrubMinute(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>Act 1: Recon (00:00)</span>
                <span className="text-accent font-semibold">Act 2: Breach &amp; Betrayal (00:34)</span>
                <span className="text-warning">Climax: Gas Purge (00:76)</span>
                <span>Resolution (00:90)</span>
              </div>
            </div>

            {/* Interactive SVG Tension Curve */}
            <div className="relative w-full h-[240px] rounded-xl border border-border bg-black/80 p-4">
              <svg className="w-full h-full" viewBox="0 0 800 200">
                {/* Horizontal reference lines */}
                <line x1="40" y1="40" x2="760" y2="40" stroke="#2a2d33" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="760" y2="100" stroke="#2a2d33" strokeDasharray="3 3" />
                <line x1="40" y1="160" x2="760" y2="160" stroke="#2a2d33" strokeDasharray="3 3" />

                {/* Tension Curve (Amber) */}
                <path
                  d="M 50 170 C 180 160, 240 120, 320 60 C 400 110, 480 40, 620 20 C 690 10, 720 120, 750 170"
                  fill="none"
                  stroke="#d4a054"
                  strokeWidth="3"
                />

                {/* Character POV Curve: Marcus Paranoia (Cyan) */}
                <path
                  d="M 50 180 C 180 170, 260 140, 320 45 C 380 70, 480 30, 620 15 C 690 40, 720 140, 750 175"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />

                {/* Active Playhead vertical bar */}
                {(() => {
                  const playheadX = 50 + (tensionScrubMinute / 90) * 700;
                  return (
                    <g>
                      <line x1={playheadX} y1="10" x2={playheadX} y2="185" stroke="#d4a054" strokeWidth="2" />
                      <circle cx={playheadX} cy="60" r="5" fill="#d4a054" />
                      <text x={playheadX - 25} y="15" fill="#d4a054" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        {tensionScrubMinute}m
                      </text>
                    </g>
                  );
                })()}

                {/* Beat Labels */}
                <circle cx="320" cy="60" r="4" fill="#c25b52" />
                <text x="270" y="80" fill="#c25b52" fontSize="9" fontFamily="monospace">Keys Missing (34m)</text>

                <circle cx="480" cy="40" r="4" fill="#a855f7" />
                <text x="440" y="55" fill="#a855f7" fontSize="9" fontFamily="monospace">Syndicate Deal (52m)</text>

                <circle cx="620" cy="20" r="4" fill="#5fa88a" />
                <text x="590" y="35" fill="#5fa88a" fontSize="9" fontFamily="monospace">Vent Purge (76m)</text>
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-t border-border/40 pt-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-accent font-semibold">
                  <span className="h-2 w-2 rounded-full bg-accent" /> Macro Narrative Arc
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" /> Marcus Paranoia Vector
                </span>
              </div>
              <span className="text-muted-foreground">ClickHouse Benchmark Correlation: 94.2%</span>
            </div>
          </div>
        )}

        {/* TAB 3: Box Office Precedents & Global Territory Heatmap */}
        {activeTab === "territory" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-heading font-bold text-sm text-foreground">
                    Global Box Office &amp; Precedent Intelligence
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Queried directly from ClickHouse <code className="text-accent font-mono text-[10px]">cinematic_precedents</code> benchmark database.
                </p>
              </div>

              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-mono py-1">
                Global Projection: $115.4M
              </Badge>
            </div>

            {/* Territory Revenue Share Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { territory: "North America (Domestic)", code: "NA", share: 42, gross: "$48.5M", color: "bg-accent", border: "border-accent/40" },
                { territory: "Europe & Middle East", code: "EMEA", share: 31, gross: "$35.8M", color: "bg-emerald-500", border: "border-emerald-500/40" },
                { territory: "Asia-Pacific", code: "APAC", share: 21, gross: "$24.2M", color: "bg-cyan-500", border: "border-cyan-500/40" },
                { territory: "Latin America", code: "LATAM", share: 6, gross: "$6.9M", color: "bg-amber-500", border: "border-amber-500/40" },
              ].map((t) => (
                <div key={t.code} className={`p-4 rounded-xl border ${t.border} bg-secondary/30 space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-foreground">{t.code}</span>
                    <span className="text-xs font-mono text-accent font-bold">{t.share}%</span>
                  </div>
                  <div className="text-base font-heading font-bold text-foreground">{t.gross}</div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div className={`${t.color} h-full rounded-full`} style={{ width: `${t.share}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{t.territory}</p>
                </div>
              ))}
            </div>

            {/* Benchmark Film Comps Table */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                ClickHouse Historical Comps (Heat, Sicario, Alien):
              </span>
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                {[
                  { title: "Heat (1995)", director: "Michael Mann", budget: "$60M", boxOffice: "$187M", retention: "92%", score: 9.4 },
                  { title: "Sicario (2015)", director: "Denis Villeneuve", budget: "$30M", boxOffice: "$85M", retention: "89%", score: 9.1 },
                  { title: "Alien (1979)", director: "Ridley Scott", budget: "$11M", boxOffice: "$108M", retention: "96%", score: 9.7 },
                ].map((comp) => (
                  <div key={comp.title} className="p-3 bg-secondary/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-accent shrink-0" />
                      <div>
                        <span className="font-heading font-bold text-foreground">{comp.title}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">Dir: {comp.director}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 font-mono text-[11px]">
                      <span className="text-muted-foreground">Budget: {comp.budget}</span>
                      <span className="text-emerald-400 font-semibold">BO: {comp.boxOffice}</span>
                      <span className="text-accent font-semibold">Retention: {comp.retention}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Audio Table Read Simulation */}
        {activeTab === "audio" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-accent" />
                  <h3 className="font-heading font-bold text-sm text-foreground">
                    Multi-Speaker Audio Table Read Simulator
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Hear screenplays performed with character pitch synthesis, cadence shifts, and synchronized screenplay line highlights.
                </p>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                >
                  {isPlayingAudio ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                  <span>{isPlayingAudio ? "Pause Table Read" : "Play Table Read"}</span>
                </Button>

                <div className="flex items-center gap-1 text-[11px] font-mono">
                  {["1.0x", "1.25x", "1.5x"].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-1 rounded ${
                        playbackSpeed === speed
                          ? "bg-secondary text-foreground font-bold border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Audio Waveform Graphic Visualizer */}
            <div className="p-4 rounded-xl border border-border bg-black/80 flex items-center justify-between gap-1.5 h-20 px-6">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 rounded-full transition-all duration-150 ${
                    isPlayingAudio ? "bg-accent" : "bg-muted"
                  }`}
                  style={{
                    height: isPlayingAudio ? `${Math.max(15, (Math.sin(i * 0.7 + audioLineIndex * 2) + 1) * 45)}%` : "20%",
                  }}
                />
              ))}
            </div>

            {/* Script Performance Dialogue Cards */}
            <div className="space-y-2">
              {AUDIO_LINES.map((line, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    audioLineIndex === idx && isPlayingAudio
                      ? "border-accent bg-accent/15 shadow-md shadow-accent/10"
                      : "border-border/60 bg-secondary/20 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-heading font-bold ${line.color}`}>
                      {line.speaker}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Voice Synth: {line.pitch} · {line.cadence}
                    </span>
                  </div>
                  <p className="text-sm font-sans text-foreground">
                    &ldquo;{line.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Production Stripboard */}
        {activeTab === "stripboard" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-accent" />
                  <h3 className="font-heading font-bold text-sm text-foreground">
                    Hollywood Production Stripboard &amp; Shooting Logistics
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Day/Night call sheets, page counts, cast calls, and camera days generated directly from the screenplay graph.
                </p>
              </div>

              <Badge variant="outline" className="border-border text-muted-foreground text-xs font-mono py-1">
                Estimated Shoot: 24 Camera Days
              </Badge>
            </div>

            {/* Production Strips */}
            <div className="space-y-2">
              {[
                { strip: "STRIP 01", location: "INT. UNDERGROUND VAULT - NIGHT", desc: "Marcus breaches the lockboxes; discovery of missing keys.", pages: "3 2/8 pgs", cast: "Cast: Marcus (#1), Elena (#2)", color: "border-l-4 border-l-blue-500 bg-blue-500/5" },
                { strip: "STRIP 02", location: "INT. SERVICE TUNNEL CORRIDOR - NIGHT", desc: "Teo monitors the perimeter perimeter security cameras.", pages: "1 4/8 pgs", cast: "Cast: Teo (#3)", color: "border-l-4 border-l-blue-500 bg-blue-500/5" },
                { strip: "STRIP 03", location: "EXT. FINANCIAL DISTRICT ALLEY - DAY", desc: "Reconnaissance getaway van idling near storm drain.", pages: "2 1/8 pgs", cast: "Cast: Marcus (#1), Teo (#3)", color: "border-l-4 border-l-amber-500 bg-amber-500/5" },
                { strip: "STRIP 04", location: "INT. UNDERGROUND VAULT - NIGHT (CYAN PURGE)", desc: "Atmospheric vents cycle; survival race against time.", pages: "4 0/8 pgs", cast: "Cast: Marcus (#1), Elena (#2)", color: "border-l-4 border-l-rose-500 bg-rose-500/5" },
              ].map((item) => (
                <div key={item.strip} className={`p-3.5 rounded-xl border border-border ${item.color} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase font-bold text-accent">{item.strip}</span>
                      <h4 className="font-heading font-bold text-xs text-foreground">{item.location}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <span className="text-muted-foreground">{item.cast}</span>
                    <span className="text-accent font-bold bg-background/80 px-2 py-0.5 rounded border border-border">{item.pages}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
