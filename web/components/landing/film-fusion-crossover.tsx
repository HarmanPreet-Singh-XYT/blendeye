"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shuffle, Sparkles, ArrowRight, Merge, Database, CheckCircle2 } from "lucide-react";

interface FusionStep {
  label: string;
  sourceA: string;
  sourceB: string;
  reconciled: string;
}

const RECONCILIATIONS: FusionStep[] = [
  {
    label: "Protagonist Identity",
    sourceA: "Marcus Vance (Getaway Driver)",
    sourceB: "Commander Vance (Orbital Station Lead)",
    reconciled: "Captain Marcus Vance: Disgraced ex-pilot turned orbital vault courier",
  },
  {
    label: "MacGuffin Conflict",
    sourceA: "Underground Sub-Level Bypass Keys",
    sourceB: "Airlock Module 4 Manual Override Code",
    reconciled: "Quantum Biometric Override Keycard (Stored on cryogenic drive)",
  },
  {
    label: "Ticking Threat",
    sourceA: "Building Cyan Gas Ventilation Cycle",
    sourceB: "Atmospheric Zero-G Vacuum Decompression",
    reconciled: "Orbital Compartment Depressurization + Cyan Nitrogen Flush",
  },
];

export function FilmFusionCrossover({ onOpenFusionDialog }: { onOpenFusionDialog: () => void }) {
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [isMerged, setIsMerged] = React.useState<boolean>(true);

  return (
    <div className="w-full space-y-6 pt-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <SlateLabel>Layer 4b Multiverse Engine</SlateLabel>
          <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">
            Film Fusion: Screenplay Crossover Engine
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
            Reconcile two completely separate film universes into a single, cohesive ClickHouse time-gated narrative graph.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          className="h-8 text-xs gap-1.5 border border-border hover:bg-secondary/80"
          onClick={onOpenFusionDialog}
        >
          <Merge className="h-3.5 w-3.5 text-accent" />
          Launch Fusion Studio
        </Button>
      </div>

      {/* Fusion Schematic Board */}
      <div className="rounded-2xl border border-border bg-card/90 overflow-hidden shadow-2xl p-6 space-y-6">
        {/* Visual Crossover Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Universe A */}
          <div className="md:col-span-4 p-4 rounded-xl border border-cyan-500/40 bg-cyan-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Universe A</span>
              <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-300">Heist</Badge>
            </div>
            <h4 className="font-heading font-bold text-sm text-foreground">The Vault Heist</h4>
            <p className="text-xs text-muted-foreground">
              Underground bank vault, missing bypass keys, syndicate betrayal.
            </p>
          </div>

          {/* Fusion Bridge */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-2 text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shadow-lg shadow-accent/20">
              <Shuffle className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-mono text-accent font-bold uppercase tracking-wider">
              Gemini 3.7 Crossover Mesh
            </span>
            <span className="text-[10px] text-muted-foreground">ClickHouse Event Remapping</span>
          </div>

          {/* Universe B */}
          <div className="md:col-span-4 p-4 rounded-xl border border-warning/40 bg-warning/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-warning uppercase font-bold">Universe B</span>
              <Badge variant="outline" className="text-[9px] border-warning/30 text-warning">Sci-Fi</Badge>
            </div>
            <h4 className="font-heading font-bold text-sm text-foreground">Deep Space Airlock</h4>
            <p className="text-xs text-muted-foreground">
              Orbital research module, biometric lock failure, vacuum decompression.
            </p>
          </div>
        </div>

        {/* Reconciled Rules Matrix */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Reconciled Story Continuum Matrix:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {RECONCILIATIONS.map((r, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2">
                <div className="flex items-center gap-1.5 text-accent text-xs font-heading font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{r.label}</span>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-1">
                  <div><span className="text-cyan-400">A:</span> {r.sourceA}</div>
                  <div><span className="text-amber-400">B:</span> {r.sourceB}</div>
                </div>
                <div className="pt-2 border-t border-border/50 text-xs font-medium text-foreground">
                  <span className="text-[10px] font-mono uppercase text-success block font-bold">Unified canon:</span>
                  {r.reconciled}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
