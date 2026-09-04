"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Shuffle, Sparkles, ArrowRight, Layers, UserCheck } from "lucide-react";
import type { FilmFusionResponse } from "@/lib/agent-service";

interface FilmFusionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFusionComplete?: (res: FilmFusionResponse) => void;
}

export function FilmFusionDialog({
  open,
  onOpenChange,
  onFusionComplete,
}: FilmFusionDialogProps) {
  const router = useRouter();
  const [isFusing, setIsFusing] = React.useState(false);
  const [directive, setDirective] = React.useState(
    "Marcus and Elena's heist crew breaches an abandoned orbital vault station where Commander Vance is fighting an emergency biological containment breach."
  );
  const [fusionResult, setFusionResult] = React.useState<FilmFusionResponse | null>(null);

  const handleRunFusion = async () => {
    setIsFusing(true);
    setFusionResult(null);

    const scriptA = `INT. UNDERGROUND VAULT - NIGHT
MARCUS: The bypass keys are gone. Elena, you were the last one at the locker.
ELENA: We have six minutes until atmospheric purge. Panic won't unlock that door.`;

    const scriptB = `INT. ORBITAL RESEARCH MODULE - ZERO GRAVITY
COMMANDER VANCE: Ray, someone entered the override sequence to purge the airlock!
ENGINEER RAY: If I didn't vent that compartment, whatever was inside would have reached life support.`;

    try {
      const res = await fetch("/api/fusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title_a: "The Vault Heist",
          script_a: scriptA,
          title_b: "Deep Space Airlock",
          script_b: scriptB,
          fusion_directive: directive,
          fusion_project_id: "fusion-crossover-demo",
        }),
      });

      if (!res.ok) throw new Error("Film fusion failed");
      const data: FilmFusionResponse = await res.json();
      setFusionResult(data);
      if (onFusionComplete) onFusionComplete(data);
    } catch (err) {
      console.error("Fusion error:", err);
    } finally {
      setIsFusing(false);
    }
  };

  const handleEnterFusedStudio = () => {
    onOpenChange(false);
    router.push("/studio/fusion-crossover-demo");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border p-6 overflow-hidden max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-accent" />
            <SlateLabel>Layer 4b · Multiverse Crossover Engine</SlateLabel>
          </div>
          <DialogTitle className="text-lg font-heading tracking-tight">
            Film Fusion: Reconcile Two Distinct Stories
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Combines two source screenplays, re-maps character objectives, detects narrative contradictions, and reconciles a unified ClickHouse time-gated story timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Source Stories Strip */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-secondary/20 text-xs">
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-accent uppercase tracking-wider block">
                Source Story A
              </span>
              <p className="font-semibold text-foreground">The Vault Heist</p>
              <p className="text-muted-foreground text-[11px]">Marcus (Driver) &amp; Elena (Mastermind)</p>
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-accent uppercase tracking-wider block">
                Source Story B
              </span>
              <p className="font-semibold text-foreground">Deep Space Airlock</p>
              <p className="text-muted-foreground text-[11px]">Commander Vance &amp; Engineer Ray</p>
            </div>
          </div>

          {/* Fusion Directive Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Showrunner Fusion Directive:
            </label>
            <textarea
              value={directive}
              onChange={(e) => setDirective(e.target.value)}
              disabled={isFusing}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent resize-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Fusion Result Preview */}
          {fusionResult && (
            <div className="p-4 rounded-xl border border-accent/40 bg-accent/5 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div>
                  <span className="text-[10px] font-mono text-accent uppercase">Reconciled Crossover</span>
                  <h4 className="font-semibold text-sm">{fusionResult.fused_title}</h4>
                </div>
                <span className="text-[10px] font-mono bg-success/15 border border-success/30 text-success px-2 py-0.5 rounded-full">
                  {fusionResult.events_written_to_clickhouse} Events Committed to ClickHouse
                </span>
              </div>

              <p className="text-xs text-muted-foreground italic">
                &ldquo;{fusionResult.fused_logline}&rdquo;
              </p>

              {/* Character Re-mappings */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Re-mapped Character Roles:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fusionResult.character_remappings.map((remap, idx) => (
                    <div key={idx} className="p-2 rounded border border-border bg-card text-xs space-y-0.5">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-accent">{remap.original_name}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {remap.alignment}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {remap.fused_role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          {fusionResult ? (
            <Button
              type="button"
              size="sm"
              className="text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleEnterFusedStudio}
            >
              <span>Enter Fused Writers&apos; Room</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isFusing}
              onClick={handleRunFusion}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isFusing ? "Reconciling Timelines with Gemini & ClickHouse..." : "Reconcile & Fuse Timeline"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
