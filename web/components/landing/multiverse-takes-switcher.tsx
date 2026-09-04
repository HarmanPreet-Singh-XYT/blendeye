"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Sliders, ArrowRight, Clapperboard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MultiverseStyleTake {
  id: string;
  name: string;
  directorPacing: string;
  lightingCue: string;
  cameraPackage: string;
  colorTheme: string;
  dialogueExcerpt: string;
  subtextFocus: string;
}

const TAKES: MultiverseStyleTake[] = [
  {
    id: "a24",
    name: "Psychological Slow-Burn",
    directorPacing: "A24 / Aster / Eggers Style · Long Unbroken Takes",
    lightingCue: "Single 25-watt flickering tungsten fixture; deep crushing shadows",
    cameraPackage: "Arri Alexa 65 · Vintage 1960s Uncoated Prime",
    colorTheme: "border-amber-500/50 bg-amber-500/10 text-amber-300",
    dialogueExcerpt: `MARCUS
(whispering, hands shaking against the canvas)
They aren't here. Elena... look at me. Look at my hands.

ELENA doesn't turn. Her reflection in the stainless steel safe door doesn't blink for eight seconds.

ELENA
I told you to breathe, Marcus. The steel doesn't care about your heart rate.`,
    subtextFocus: "Visceral claustrophobia, impending psychological breakdown, intimate physical dread.",
  },
  {
    id: "mann",
    name: "Tactical Neo-Noir",
    directorPacing: "Michael Mann / David Fincher · Razor-Sharp Cadence",
    lightingCue: "4300K cyan fluorescent tube lighting; sharp high-contrast reflections",
    cameraPackage: "Sony Venice 2 · Panavision C-Series Anamorphic",
    colorTheme: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300",
    dialogueExcerpt: `MARCUS
Bypass card Alpha-Seven is absent from the kit. You verified the sequence at staging 02:40. Where is it?

ELENA checks the digital chronograph on her wrist. Her tone is flat, clinical.

ELENA
We have 340 seconds before the district grid cycles. You're wasting twelve of them asking questions with known answers.`,
    subtextFocus: "Hyper-professional criminality, cold calculation, tactical competence masking private betrayal.",
  },
  {
    id: "nolan",
    name: "Visceral Ticking Clock",
    directorPacing: "Christopher Nolan / Denis Villeneuve · Driving Tempo",
    lightingCue: "Pulsing red auxiliary emergency strobes with volumetric atmospheric haze",
    cameraPackage: "IMAX 70mm 15-Perf · Custom Hasselblad Prime",
    colorTheme: "border-rose-500/50 bg-rose-500/10 text-rose-300",
    dialogueExcerpt: `MARCUS
(yelling over the deafening low-frequency air intake)
The locks are already descending! Elena! Look at the pressure differential! Did you pull the keys?!

ELENA steps backward into the shadows of the escape tunnel as the airlock hiss drowns out Marcus's voice.

ELENA
Every second you spend in this chamber was priced into the contract, Marcus.`,
    subtextFocus: "Massive scale, terminal inevitability, relentless acoustic drive.",
  },
];

export function MultiverseTakesSwitcher() {
  const [selectedTakeId, setSelectedTakeId] = React.useState<string>("mann");

  const activeTake = TAKES.find((t) => t.id === selectedTakeId) || TAKES[1];

  return (
    <div id="multiverse" className="w-full space-y-6 pt-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <SlateLabel>Multiverse Director Suite</SlateLabel>
          <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">
            3-Way Alternate Director Takes Studio
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
            Same core scene, radically different cinema visions. Toggle between the director cuts below to watch the screenplay tone, camera package, and lighting dynamically overhaul.
          </p>
        </div>

        <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent text-xs font-mono py-1">
          1-Click Style Transfer
        </Badge>
      </div>

      {/* Multiverse Interactive Container */}
      <div className="rounded-2xl border border-border bg-card/90 overflow-hidden shadow-2xl p-6 space-y-6">
        {/* Style Selector Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TAKES.map((take) => (
            <button
              key={take.id}
              onClick={() => setSelectedTakeId(take.id)}
              className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                selectedTakeId === take.id
                  ? `${take.colorTheme} border-2 shadow-lg`
                  : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-foreground">
                  {take.name}
                </span>
                {selectedTakeId === take.id && (
                  <span className="h-2 w-2 rounded-full bg-accent" />
                )}
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                {take.directorPacing}
              </p>
            </button>
          ))}
        </div>

        {/* Dynamic Scene Comparison Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left: Screenplay Excerpt (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-xl border border-border bg-background/95 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
                Screenplay Draft · {activeTake.name} Cut
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                Hollywood Courier Standard
              </span>
            </div>

            <pre className="font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {activeTake.dialogueExcerpt}
            </pre>

            <div className="pt-3 border-t border-border/40 text-xs space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-accent">
                Dramatic Subtext:
              </span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {activeTake.subtextFocus}
              </p>
            </div>
          </div>

          {/* Right: Cinematography & Camera Telemetry (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-xl border border-border bg-secondary/20 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                <Sliders className="h-4 w-4 text-accent" />
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                  Directorial Production Specs
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Lighting &amp; Gaffer Setup</span>
                  <p className="font-mono font-medium text-foreground text-[11px] leading-relaxed">
                    {activeTake.lightingCue}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Camera &amp; Lens Package</span>
                  <p className="font-mono font-medium text-cyan-400 text-[11px]">
                    {activeTake.cameraPackage}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Editing Rhythm</span>
                  <p className="font-mono font-medium text-emerald-400 text-[11px]">
                    {activeTake.directorPacing}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-accent/30 bg-accent/5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">Apply to Master Production:</span>
              <Badge variant="outline" className="border-accent/40 bg-accent/20 text-accent text-[10px]">
                Instant Sync
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
