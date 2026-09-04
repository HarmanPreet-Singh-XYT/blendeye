"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Letterbox } from "@/components/cinema/letterbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NewProjectDialog,
  type NewProjectFormData,
} from "@/components/cinema/new-project-dialog";
import { FilmFusionDialog } from "@/components/cinema/film-fusion-dialog";
import {
  Film,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  Clock,
  ShieldAlert,
  Play,
  Plus,
  Shuffle,
} from "lucide-react";

const FEATURED_SLATES = [
  {
    id: "vault-heist-demo",
    title: "The Vault Heist",
    genre: "Heist / Crime Thriller",
    runtime: "90 Min Feature",
    characters: ["Marcus", "Elena", "Teo"],
    logline:
      "A heist crew breaches an underground vault, but Marcus realizes the exit keys are missing and Elena is hiding something.",
    hook: "Scrub to 00:34:00 to ask Marcus who has the keys (he defends his ignorance). Scrub to 00:52:00 to hear his reaction when Elena's betrayal is revealed.",
    badge: "Benchmark Demo",
    badgeVariant: "border-accent/40 bg-accent/15 text-accent",
  },
  {
    id: "space-airlock-demo",
    title: "Deep Space Airlock",
    genre: "Sci-Fi / Space Horror",
    runtime: "90 Min Feature",
    characters: ["Commander Vance", "Engineer Ray"],
    logline:
      "Oxygen pressure drops in Module 4. Vance discovers the purge valve was manually overridden from inside the chamber.",
    hook: "At 00:22:00 Ray hides his infection outbreak. At 00:45:00 the station flight log confirms the override codes.",
    badge: "Sci-Fi Chamber",
    badgeVariant: "border-warning/40 bg-warning/15 text-warning",
  },
];

export default function FilmHubLandingPage() {
  const router = useRouter();
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [fusionOpen, setFusionOpen] = React.useState(false);

  const handleCreateProject = (data: NewProjectFormData) => {
    const newPid = `project-${Date.now().toString(36)}`;
    // Store preliminary creation metadata if needed, then route to studio
    router.push(`/studio/${newPid}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent/30 selection:text-accent-foreground">
      {/* Top Studio Nav */}
      <header className="flex h-16 items-center justify-between border-b border-border px-6 md:px-12 bg-card/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <Film className="h-5 w-5 text-accent" />
          <span className="font-heading font-semibold tracking-tight text-base">
            Agentic Cinema
          </span>
          <span className="text-border">/</span>
          <SlateLabel>Production Slate Hub</SlateLabel>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground bg-secondary/40 px-3 py-1.5 rounded-full border border-border">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span>ClickHouse Live · Port 8123</span>
          </div>

          <Button
            size="sm"
            className="h-9 text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setNewProjectOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            New Film Slate
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6 py-12 md:py-20 max-w-5xl mx-auto w-full space-y-16">
        <div className="text-center space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 shadow-sm">
            <SlateLabel>Google Cloud Agentic Cinema · ClickHouse Partner Track</SlateLabel>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading font-semibold tracking-tight leading-tight">
            The Writers&apos; Room That Knows What Your Characters Know
          </h1>

          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Scrub a story timeline to any minute and interrogate any character live. Characters strictly answer within their time-gated knowledge boundary, backed by ClickHouse story events and Gemini 3.7 Flash.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-medium text-sm h-11 px-6 shadow-lg shadow-accent/20"
              onClick={() => router.push("/studio/vault-heist-demo")}
            >
              <Play className="h-4 w-4 fill-current" />
              Launch Benchmark Demo (The Vault)
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-sm h-11 px-6 border-border hover:bg-secondary"
              onClick={() => setNewProjectOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Custom Film Slate
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-sm h-11 px-6 border border-border/80 hover:bg-secondary/80"
              onClick={() => setFusionOpen(true)}
            >
              <Shuffle className="h-4 w-4 text-accent" />
              Film Fusion (Crossover)
            </Button>
          </div>
        </div>

        {/* Featured Productions Grid */}
        <section className="w-full space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <SlateLabel>Featured Production Slates</SlateLabel>
              <h2 className="text-lg font-heading font-semibold mt-0.5">
                Select a Slate to Enter the Writers&apos; Room
              </h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {FEATURED_SLATES.length} pre-configured productions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURED_SLATES.map((slate) => (
              <div
                key={slate.id}
                className="group relative rounded-xl border border-border bg-card hover:border-accent/60 transition-all p-6 flex flex-col justify-between space-y-6 shadow-md hover:shadow-xl cursor-pointer"
                onClick={() => router.push(`/studio/${slate.id}`)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      {slate.genre} · {slate.runtime}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${slate.badgeVariant}`}>
                      {slate.badge}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-heading font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors flex items-center gap-2">
                    {slate.title}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {slate.logline}
                  </p>

                  <div className="pt-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1.5">
                      Cast in Scene:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {slate.characters.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded border border-border/80 bg-secondary/50 text-[11px] font-medium text-secondary-foreground"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-secondary/20 p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-accent font-medium text-[11px]">
                    <Clock className="h-3 w-3" />
                    <span>Centerpiece Demo Beat</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {slate.hook}
                  </p>
                </div>

                <Button
                  size="sm"
                  className="w-full text-xs gap-2 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/studio/${slate.id}`);
                  }}
                >
                  <span>Enter Writers&apos; Room</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Complete Director's Pre-Production Suite Callout */}
        <section className="w-full space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <SlateLabel>Production Deck &amp; Directorial Tools</SlateLabel>
              <h2 className="text-lg font-heading font-semibold mt-0.5">
                Built for Hollywood Pre-Production Workflows
              </h2>
            </div>
            <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent text-xs">
              4 Integrated Modules
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
              <span className="text-xl block">📐</span>
              <h4 className="text-sm font-semibold">2D Floor Plan &amp; Blocking</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Overhead architectural stage layout with multi-camera FOV angles, practical lights, and actor sightline vectors.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
              <span className="text-xl block">📈</span>
              <h4 className="text-sm font-semibold">Tension &amp; Pacing Curve</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Non-linear narrative intensity graph tracking scene tension beats, character POV curves, and audience retention metrics.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
              <span className="text-xl block">🌍</span>
              <h4 className="text-sm font-semibold">Box Office &amp; Precedents</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ClickHouse-indexed precedent comparisons across Heat, Sicario, and Alien with global territory revenue heatmaps.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
              <span className="text-xl block">🎙️</span>
              <h4 className="text-sm font-semibold">Audio Table Read</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Multi-speaker speech simulation playing back character dialogue with distinct vocal pitch, speed, and real-time line highlighting.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono text-xs uppercase font-bold">Unreal-Style Node Network</span>
                <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300">14 Node Types</Badge>
              </div>
              <h3 className="font-heading text-base font-semibold">Visual Backlot Canvas</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Drag, drop, and wire modular nodes like in Unreal Engine: YouTube reference clips with timecodes, idea notes, scenes, scripts, storyboards, 2D floor plans, tension curves, and ClickHouse global market heatmaps.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-mono text-xs uppercase font-bold">Modular Character Lab</span>
                <Badge variant="outline" className="text-[10px] border-rose-500/30 text-rose-300">DNA Blender</Badge>
              </div>
              <h3 className="font-heading text-base font-semibold">Actor Comps &amp; Personality Dials</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Decouple character identities into swappable sub-nodes: Actor Legacy comps, Confidence &amp; Sarcasm sliders, behavioral quirks, and live impromptu 1-page chemistry tests.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Architecture Breakdown */}
        <section className="w-full rounded-2xl border border-border bg-card/40 p-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <SlateLabel>Architecture &amp; Data Plane</SlateLabel>
            <h3 className="text-lg font-heading font-semibold">
              How the Time-Gated Knowledge Firewall Operates
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-xl border border-border/60 bg-secondary/15 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <Cpu className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold">1. Master Script Generation</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gemini 3.7 drafts formatted scenes with built-in asymmetric knowledge between characters.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-secondary/15 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <Database className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold">2. Perspective Sharding</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Decomposes the scene into timestamped events and blind spots written directly into ClickHouse <code className="text-accent font-mono text-[10px]">story_events</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-secondary/15 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold">3. Time-Gated Interrogation</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scrubbing to timecode $T$ fires a filtered query <code className="text-accent font-mono text-[10px]">WHERE timestamp &lt;= T</code> to enforce strict firewall boundaries on character memory.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
        <span>Agentic Cinema · Built for Google Cloud Agentic Cinema Hackathon (ClickHouse Partner Track)</span>
        <div className="flex items-center gap-4">
          <a href="/design-system" className="hover:text-foreground transition-colors underline underline-offset-2">
            Design System Reference
          </a>
          <span>MIT License</span>
        </div>
      </footer>

      {/* New Project Dialog */}
      <NewProjectDialog
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
        onSubmit={handleCreateProject}
      />

      {/* Film Fusion Crossover Dialog */}
      <FilmFusionDialog
        open={fusionOpen}
        onOpenChange={setFusionOpen}
      />
    </div>
  );
}
