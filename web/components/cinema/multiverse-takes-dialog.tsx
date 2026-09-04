"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Clapperboard, Check, Sparkles } from "lucide-react";

export interface MultiverseTake {
  id: string;
  takeLabel: string;
  directorStyle: string;
  subtextRatio: string;
  pacingBpm: number;
  cameraMovement: string;
  synopsis: string;
  scriptSnippet: string;
}

interface MultiverseTakesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTake: (take: MultiverseTake) => void;
  currentTakeId?: string;
  projectTitle?: string;
  characters?: Array<{ name: string }>;
  screenplayText?: string;
}

export function MultiverseTakesDialog({
  open,
  onOpenChange,
  onApplyTake,
  currentTakeId = "take-psychological",
  projectTitle = "Feature Film",
  characters = [],
  screenplayText = "",
}: MultiverseTakesDialogProps) {
  const [selectedTakeId, setSelectedTakeId] = React.useState(currentTakeId);

  const charA = characters[0]?.name || "Marcus";
  const charB = characters[1]?.name || "Elena";

  // Derive slugline from screenplay if available
  const slugline = React.useMemo(() => {
    if (screenplayText) {
      const match = screenplayText.match(/(?:^|\n)(INT\.|EXT\.)[^\n]+/i);
      if (match) return match[0].trim();
    }
    return "INT. CONFRONTATION CHAMBER - NIGHT";
  }, [screenplayText]);

  const alternateTakes: MultiverseTake[] = React.useMemo(() => {
    // If it's specifically the benchmark Vault Heist
    if (charA === "Marcus" && charB === "Elena") {
      return [
        {
          id: "take-psychological",
          takeLabel: "Take A · Psychological Slow-Burn",
          directorStyle: "A24 / Atmospheric Tension",
          subtextRatio: "92% Subtext",
          pacingBpm: 60,
          cameraMovement: "Lingering 50mm Prime · Shallow Depth of Field",
          synopsis:
            "Elena maintains unbroken silence while Marcus dismantles his equipment in growing isolation. The threat of the ventilation vents is communicated entirely through lighting shifts.",
          scriptSnippet: `INT. UNDERGROUND VAULT - NIGHT

Auxiliary cyan strips buzz softly. A drop of condensation strikes the concrete floor.

MARCUS
(kneeling, hands trembling inside the gear bag)
Elena. Look at me.

ELENA doesn't move. Her reflection stares back from the polished vault steel.

MARCUS (CONT'D)
You knew the codes were cycled. You knew before we cut the perimeter cable.

ELENA
(after a ten-second pause)
If you don't keep your hands inside that bag, Marcus, you won't live to see the cyan vents open.`,
        },
        {
          id: "take-neonoir",
          takeLabel: "Take B · Neo-Noir Confrontation",
          directorStyle: "Michael Mann / David Fincher Precision",
          subtextRatio: "78% Subtext",
          pacingBpm: 88,
          cameraMovement: "35mm Anamorphic Master · Razor Cuts · Cold Cyan Fill",
          synopsis:
            "Hardboiled rapid-fire accusations. Marcus presents physical evidence of Elena's syndicate burner phone.",
          scriptSnippet: `INT. UNDERGROUND VAULT - NIGHT

Strobe warning indicators flash against titanium deposit boxes.

MARCUS
(slamming a titanium bypass chip onto the counter)
The serial number. 4-4-9-Juliet. That's not syndicate issue, Elena. That's Central Bureau.

ELENA
(spinning around, hand inches from her sidearm)
You've got three minutes before the sweep team clears the tunnel, Marcus. You really want to audit receipts right now?

MARCUS
I want to know if I'm walking out of here or if you already sold my seat in the van.`,
        },
        {
          id: "take-action",
          takeLabel: "Take C · Visceral Ticking Clock",
          directorStyle: "Christopher Nolan / Denis Villeneuve Urgency",
          subtextRatio: "45% Subtext",
          pacingBpm: 125,
          cameraMovement: "Handheld Steadicam · Kinetic Dutch Angles · Siren Strobe",
          synopsis:
            "High-velocity panic. The ventilation purge has already begun cycling emergency gas. Every word is delivered under physical pressure.",
          scriptSnippet: `INT. UNDERGROUND VAULT - NIGHT

RED AND CYAN EMERGENCY ALARMS SCREAM. Pressurized mist hiss from overhead valves.

MARCUS
(coughing violently, hammering the electronic keypad)
THE OVERRIDE FAILED! ELENA! THE VENTS ARE PURGING!

ELENA
(forcing Marcus against the bulkhead)
GRAB THE HARD DRIVES! THE DOOR ONLY OPENS FROM OUTSIDE ONCE THE PRESSURE EQUALIZES!

MARCUS
YOU LOCKED US IN! YOU LOCKED US BOTH IN!

ELENA
JUST HOLD YOUR BREATH!`,
        },
      ];
    }

    // Dynamic generation for Space Airlock or any custom project
    return [
      {
        id: "take-psychological",
        takeLabel: "Take A · Psychological Slow-Burn",
        directorStyle: "A24 / Atmospheric Tension",
        subtextRatio: "92% Subtext",
        pacingBpm: 58,
        cameraMovement: "Lingering 50mm Prime · Clinical Negative Space",
        synopsis: `${charB} maintains unblinking stillness while ${charA} searches for micro-expressions. Tension builds through prolonged ambient sound design and silence.`,
        scriptSnippet: `${slugline}

Ambient emergency hum reverberates through the structure. Shadows stretch across cold metallic bulkheads.

${charA.toUpperCase()}
(voice quiet, hands clenched at their side)
${charB}. Turn around.

${charB.toUpperCase()} does not move. Their gaze remains fixed on the status terminal.

${charA.toUpperCase()} (CONT'D)
You knew before the alarm triggered. You knew what was coming.

${charB.toUpperCase()}
(slowly exhaling)
If you speak another word, neither of us makes it out of this room.`,
      },
      {
        id: "take-neonoir",
        takeLabel: "Take B · Neo-Noir Precision",
        directorStyle: "Michael Mann / David Fincher Precision",
        subtextRatio: "75% Subtext",
        pacingBpm: 84,
        cameraMovement: "35mm Anamorphic Master · Razor Sharp Edits",
        synopsis: `Hardboiled interrogation. ${charA} directly confronts ${charB} with physical proof of tampered telemetry and hidden motives.`,
        scriptSnippet: `${slugline}

Cold sodium illumination reflects off high-polish surfaces.

${charA.toUpperCase()}
(dropping the data drive onto the console)
The authorization code at zero-two-hundred. It bears your biometric tag, ${charB}.

${charB.toUpperCase()}
(stepping forward, tone razor sharp)
You have less than three minutes before security locks down this sector. You really want to audit timestamps right now?

${charA.toUpperCase()}
I want to know who gave the command to override that seal.`,
      },
      {
        id: "take-action",
        takeLabel: "Take C · Visceral Ticking Clock",
        directorStyle: "Christopher Nolan / Denis Villeneuve Urgency",
        subtextRatio: "42% Subtext",
        pacingBpm: 120,
        cameraMovement: "Handheld Steadicam · Kinetic Dutch Angles · Warning Strobe",
        synopsis: `High-velocity crisis. Critical system failure forces ${charA} and ${charB} into a frantic physical scramble as time expires.`,
        scriptSnippet: `${slugline}

PULSING EMERGENCY WARNING KLAXONS. Steam vents burst with deafening pressure.

${charA.toUpperCase()}
(straining against the emergency release mechanism)
THE OVERRIDE FAILED! ${charB.toUpperCase()}! IT'S PURGING!

${charB.toUpperCase()}
(slamming their shoulder into the bulkhead latch)
PULL THE PRIMARY LEVER! WE HAVE THIRTY SECONDS BEFORE THE SEAL DROPS!

${charA.toUpperCase()}
IT'S JAMMED! YOU LOCKED US IN HERE!

${charB.toUpperCase()}
BRACE YOURSELF!`,
      },
    ];
  }, [charA, charB, slugline]);

  const activeTake = alternateTakes.find((t) => t.id === selectedTakeId) || alternateTakes[0];

  const handleApply = () => {
    onApplyTake(activeTake);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-6 border-border bg-card">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Clapperboard className="h-5 w-5 text-accent" />
            <DialogTitle className="font-heading text-lg">
              Multiverse Alternate Takes Studio · {projectTitle}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Explore 3 diverging director cuts for {charA} and {charB}. Each take alters tone, subtext ratio, camera blocking, and dialogue rhythm.
          </DialogDescription>
        </DialogHeader>

        {/* 3 Takes Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
          {alternateTakes.map((take) => {
            const isSelected = selectedTakeId === take.id;
            return (
              <button
                key={take.id}
                type="button"
                onClick={() => setSelectedTakeId(take.id)}
                className={`flex flex-col text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "border-accent bg-accent/10 shadow-md ring-1 ring-accent"
                    : "border-border bg-secondary/20 hover:bg-secondary/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold ${isSelected ? "text-accent" : "text-foreground"}`}>
                    {take.takeLabel.split("·")[0]}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-accent" />}
                </div>
                <span className="text-[11px] font-semibold text-foreground">
                  {take.takeLabel.split("·")[1]}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono mt-1">
                  {take.directorStyle}
                </span>

                <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                  <Badge variant="outline" className="text-[9px] py-0 px-1 border-accent/30 text-accent">
                    {take.subtextRatio}
                  </Badge>
                  <span className="font-mono text-muted-foreground">{take.pacingBpm} BPM</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Take Script Preview */}
        <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-border bg-background/80 p-4 space-y-3 mt-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <SlateLabel>{activeTake.takeLabel}</SlateLabel>
              <p className="text-xs text-muted-foreground">{activeTake.synopsis}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                {activeTake.cameraMovement}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded border border-border/70 bg-card/60 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-accent/30">
            {activeTake.scriptSnippet}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground font-mono">
            Will update screenplay text &amp; re-shard ClickHouse timeline
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Apply {activeTake.takeLabel.split("·")[0]} to Production
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
