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
import { Clapperboard, Check, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { notifyIfFallback } from "@/lib/fallback-notice";

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

interface TakeStyle {
  id: string;
  takeLabel: string;
  directorStyle: string;
  subtextRatio: string;
  pacingBpm: number;
  cameraMovement: string;
  synopsis: string;
}

const TAKE_STYLES: TakeStyle[] = [
  {
    id: "take-psychological",
    takeLabel: "Take A · Psychological Slow-Burn",
    directorStyle: "A24 / Atmospheric Tension — lingering silences, restrained performances, dread communicated through lighting and stillness rather than dialogue",
    subtextRatio: "92% Subtext",
    pacingBpm: 60,
    cameraMovement: "Lingering 50mm Prime · Shallow Depth of Field",
    synopsis: "A slower, quieter cut where most of the conflict plays out beneath the surface.",
  },
  {
    id: "take-neonoir",
    takeLabel: "Take B · Neo-Noir Confrontation",
    directorStyle: "Michael Mann / David Fincher Precision — hardboiled, razor-sharp dialogue, cold procedural confrontation",
    subtextRatio: "78% Subtext",
    pacingBpm: 88,
    cameraMovement: "35mm Anamorphic Master · Razor Cuts · Cold Cyan Fill",
    synopsis: "A harder-edged cut with direct accusations and physical evidence on the table.",
  },
  {
    id: "take-action",
    takeLabel: "Take C · Visceral Ticking Clock",
    directorStyle: "Christopher Nolan / Denis Villeneuve Urgency — kinetic, high-velocity, physical pressure escalating in real time",
    subtextRatio: "45% Subtext",
    pacingBpm: 125,
    cameraMovement: "Handheld Steadicam · Kinetic Dutch Angles · Warning Strobe",
    synopsis: "A faster, more physical cut where the crisis is already actively unfolding.",
  },
];

interface MultiverseTakesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTake: (take: MultiverseTake) => void;
  currentTakeId?: string;
  projectTitle?: string;
  characters?: Array<{ name: string }>;
  screenplayText?: string;
}

type TakeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; scriptSnippet: string; isFallback: boolean }
  | { status: "error"; message: string };

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
  const [takeResults, setTakeResults] = React.useState<Record<string, TakeState>>({});

  const charA = characters[0]?.name || "Marcus";
  const charB = characters[1]?.name || "Elena";

  const fallbackSceneText = React.useMemo(() => {
    if (screenplayText.trim()) return screenplayText;
    const match = screenplayText.match(/(?:^|\n)(INT\.|EXT\.)[^\n]+/i);
    const slugline = match ? match[0].trim() : "INT. CONFRONTATION CHAMBER - NIGHT";
    return `${slugline}\n\n${charA} and ${charB} face off over an unresolved betrayal.`;
  }, [screenplayText, charA, charB]);

  const generateTake = React.useCallback(
    async (style: TakeStyle) => {
      setTakeResults((prev) => ({ ...prev, [style.id]: { status: "loading" } }));
      try {
        const res = await fetch("/api/script/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scene_text: fallbackSceneText,
            director_style: style.directorStyle,
            subtext_ratio: style.subtextRatio,
            pacing_bpm: style.pacingBpm,
            camera_movement: style.cameraMovement,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const isFallback = notifyIfFallback(data, `Multiverse ${style.takeLabel.split("·")[0].trim()}`);
          setTakeResults((prev) => ({
            ...prev,
            [style.id]: { status: "ready", scriptSnippet: data.rewritten_scene, isFallback },
          }));
        } else {
          const detail = await res.text().catch(() => "");
          setTakeResults((prev) => ({
            ...prev,
            [style.id]: { status: "error", message: detail || `Request failed (${res.status})` },
          }));
        }
      } catch (err) {
        setTakeResults((prev) => ({
          ...prev,
          [style.id]: {
            status: "error",
            message: err instanceof Error ? err.message : "Could not reach the rewrite backend.",
          },
        }));
      }
    },
    [fallbackSceneText]
  );

  // Kick off generation for the initially-selected take as soon as the dialog opens.
  React.useEffect(() => {
    if (!open) {
      setTakeResults({});
      return;
    }
    const initial = TAKE_STYLES.find((s) => s.id === currentTakeId) || TAKE_STYLES[0];
    generateTake(initial);
    // Only run once per dialog open — subsequent takes are generated on-demand when selected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSelectTake = (style: TakeStyle) => {
    setSelectedTakeId(style.id);
    const existing = takeResults[style.id];
    if (!existing || existing.status === "error") {
      generateTake(style);
    }
  };

  const activeStyle = TAKE_STYLES.find((s) => s.id === selectedTakeId) || TAKE_STYLES[0];
  const activeResult: TakeState = takeResults[activeStyle.id] || { status: "idle" };

  const handleApply = () => {
    if (activeResult.status !== "ready") return;
    onApplyTake({
      id: activeStyle.id,
      takeLabel: activeStyle.takeLabel,
      directorStyle: activeStyle.directorStyle,
      subtextRatio: activeStyle.subtextRatio,
      pacingBpm: activeStyle.pacingBpm,
      cameraMovement: activeStyle.cameraMovement,
      synopsis: activeStyle.synopsis,
      scriptSnippet: activeResult.scriptSnippet,
    });
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
            Gemini rewrites your current scene for {charA} and {charB} under 3 diverging director styles. Each take alters tone, subtext ratio, camera blocking, and dialogue rhythm — generated live, not templated.
          </DialogDescription>
        </DialogHeader>

        {/* 3 Takes Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
          {TAKE_STYLES.map((style) => {
            const isSelected = selectedTakeId === style.id;
            const result = takeResults[style.id];
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => handleSelectTake(style)}
                className={`flex flex-col text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "border-accent bg-accent/10 shadow-md ring-1 ring-accent"
                    : "border-border bg-secondary/20 hover:bg-secondary/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold ${isSelected ? "text-accent" : "text-foreground"}`}>
                    {style.takeLabel.split("·")[0]}
                  </span>
                  {result?.status === "loading" && <RefreshCw className="h-3.5 w-3.5 text-accent animate-spin" />}
                  {result?.status === "ready" && isSelected && <Check className="h-3.5 w-3.5 text-accent" />}
                  {result?.status === "error" && <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />}
                </div>
                <span className="text-[11px] font-semibold text-foreground">
                  {style.takeLabel.split("·")[1]}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono mt-1">
                  {style.directorStyle.split("—")[0].trim()}
                </span>

                <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                  <Badge variant="outline" className="text-[9px] py-0 px-1 border-accent/30 text-accent">
                    {style.subtextRatio}
                  </Badge>
                  <span className="font-mono text-muted-foreground">{style.pacingBpm} BPM</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Take Script Preview */}
        <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-border bg-background/80 p-4 space-y-3 mt-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <SlateLabel>{activeStyle.takeLabel}</SlateLabel>
              <p className="text-xs text-muted-foreground">{activeStyle.synopsis}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                {activeStyle.cameraMovement}
              </span>
            </div>
          </div>

          {activeResult.status === "ready" && activeResult.isFallback && (
            <div className="flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-mono text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Backend unreachable — showing your original scene unchanged, not a real rewrite.</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto rounded border border-border/70 bg-card/60 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-accent/30">
            {activeResult.status === "loading" && (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin text-accent" />
                <span>Gemini is rewriting this scene in the selected style…</span>
              </div>
            )}
            {activeResult.status === "error" && (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-rose-400">
                <AlertTriangle className="h-5 w-5" />
                <span>{activeResult.message}</span>
                <Button size="sm" variant="outline" className="text-xs mt-1" onClick={() => generateTake(activeStyle)}>
                  Retry
                </Button>
              </div>
            )}
            {activeResult.status === "ready" && activeResult.scriptSnippet}
            {activeResult.status === "idle" && (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a take to generate it.
              </div>
            )}
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
              disabled={activeResult.status !== "ready"}
              className="text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Apply {activeStyle.takeLabel.split("·")[0]} to Production
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
