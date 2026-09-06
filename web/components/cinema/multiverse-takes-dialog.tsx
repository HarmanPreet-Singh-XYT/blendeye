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
import {
  Clapperboard,
  Check,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Send,
  Sliders,
  User,
  Activity,
  Camera,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { notifyIfFallback } from "@/lib/fallback-notice";

export interface MultiverseTake {
  id: string;
  takeLabel: string;
  directorStyle: string;
  povCharacter?: string;
  tone?: string;
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
  const [takes, setTakes] = React.useState<MultiverseTake[]>([]);
  const [selectedTakeId, setSelectedTakeId] = React.useState<string>(currentTakeId);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFallback, setIsFallback] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [customDirective, setCustomDirective] = React.useState("");

  const charA = characters[0]?.name || "Marcus";
  const charB = characters[1]?.name || "Elena";

  const fallbackSceneText = React.useMemo(() => {
    if (screenplayText.trim()) return screenplayText;
    const match = screenplayText.match(/(?:^|\n)(INT\.|EXT\.)[^\n]+/i);
    const slugline = match ? match[0].trim() : "INT. CONFRONTATION CHAMBER - NIGHT";
    return `${slugline}\n\n${charA} and ${charB} face off over an unresolved betrayal.`;
  }, [screenplayText, charA, charB]);

  const fetchMultiverseTakes = React.useCallback(
    async (directive?: string) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch("/api/script/multiverse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scene_text: fallbackSceneText,
            characters: characters.map((c) => c.name),
            project_title: projectTitle,
            count: 3,
            custom_direction: directive ?? customDirective,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const fallbackUsed = notifyIfFallback(data, "Multiverse Alternate Takes");
          setIsFallback(Boolean(fallbackUsed));

          if (Array.isArray(data.takes) && data.takes.length > 0) {
            const mappedTakes: MultiverseTake[] = data.takes.map((t: any, idx: number) => ({
              id: t.id || `take-${idx + 1}`,
              takeLabel: t.take_label || `Take ${String.fromCharCode(65 + idx)} · Alternate Cut`,
              directorStyle: t.director_style || "Hollywood Standard",
              povCharacter: t.pov_character || charA,
              tone: t.tone || "Dramatic Tension",
              subtextRatio: t.subtext_ratio || "80% Subtext",
              pacingBpm: t.pacing_bpm || 80,
              cameraMovement: t.camera_movement || "35mm Coverage",
              synopsis: t.synopsis || "Alternate dramatic interpretation.",
              scriptSnippet: t.rewritten_scene || fallbackSceneText,
            }));
            setTakes(mappedTakes);
            if (!mappedTakes.some((t) => t.id === selectedTakeId)) {
              setSelectedTakeId(mappedTakes[0].id);
            }
          }
        } else {
          const detail = await res.text().catch(() => "");
          setErrorMessage(detail || `Generation failed (${res.status})`);
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Could not reach the generation backend.");
      } finally {
        setIsLoading(false);
      }
    },
    [fallbackSceneText, characters, projectTitle, customDirective, charA, selectedTakeId]
  );

  // Auto-generate on first modal open if no takes yet
  React.useEffect(() => {
    if (open && takes.length === 0) {
      fetchMultiverseTakes();
    }
  }, [open, takes.length, fetchMultiverseTakes]);

  const activeTake = takes.find((t) => t.id === selectedTakeId) || takes[0];

  const handleApply = () => {
    if (!activeTake) return;
    onApplyTake(activeTake);
    toast.add({
      title: "Take applied to slate",
      description: `${activeTake.takeLabel.split("·")[0].trim()} applied. Timeline reshared.`,
      type: "success",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-6 border-border bg-card">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clapperboard className="h-5 w-5 text-accent" />
              <DialogTitle className="font-heading text-lg">
                Multiverse Alternate Takes Studio · {projectTitle}
              </DialogTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-accent/40 text-accent gap-1">
              <Sparkles className="h-3 w-3" />
              Gemini 3.7 Agentic Multi-Take
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Gemini reads your current scene for {charA} and {charB} and generates 3 contrasting directorial cuts across tone, pacing BPM, camera movement, and point-of-view — generated live by Google ADK.
          </DialogDescription>
        </DialogHeader>

        {/* Custom Directorial Guidance / Re-roll seed */}
        <div className="flex items-center gap-2 pt-1 pb-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={customDirective}
              onChange={(e) => setCustomDirective(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  fetchMultiverseTakes();
                }
              }}
              placeholder="Directorial seed (e.g. 'Shift empathy to Elena; make Take B visceral claustrophobia, Take C cold calculation')..."
              className="w-full text-xs font-mono bg-background/80 border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground/60"
            />
          </div>
          <Button
            size="sm"
            onClick={() => fetchMultiverseTakes()}
            disabled={isLoading}
            className="text-xs gap-1.5 bg-secondary/80 hover:bg-secondary text-foreground cursor-pointer shrink-0 border border-border"
          >
            {isLoading ? (
              <RefreshCw className="h-3.5 w-3.5 text-accent animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-accent" />
            )}
            <span>{isLoading ? "Synthesizing Takes..." : "Generate Alternate Takes"}</span>
          </Button>
        </div>

        {/* 3 Takes Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          {takes.map((take) => {
            const isSelected = activeTake?.id === take.id;
            return (
              <button
                key={take.id}
                type="button"
                onClick={() => setSelectedTakeId(take.id)}
                className={`flex flex-col text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "border-accent bg-accent/10 shadow-md ring-1 ring-accent"
                    : "border-border bg-secondary/20 hover:bg-secondary/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? "text-accent" : "text-foreground"}`}>
                    {take.takeLabel.split("·")[0]}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-accent" />}
                </div>
                <span className="text-[11px] font-semibold text-foreground line-clamp-1">
                  {take.takeLabel.split("·")[1] || take.takeLabel}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono mt-0.5 line-clamp-1">
                  {take.directorStyle.split("—")[0].trim()}
                </span>

                <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                  <Badge variant="outline" className="text-[9px] py-0 px-1 border-accent/30 text-accent">
                    {take.subtextRatio}
                  </Badge>
                  {take.povCharacter && (
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1 rounded">
                      POV: {take.povCharacter}
                    </span>
                  )}
                  <span className="font-mono text-muted-foreground">{take.pacingBpm} BPM</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Take Script Preview */}
        <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-border bg-background/80 p-4 space-y-3 mt-2 overflow-hidden">
          {activeTake && (
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <SlateLabel>{activeTake.takeLabel}</SlateLabel>
                  {activeTake.tone && (
                    <Badge variant="outline" className="text-[9px] font-mono text-amber-400 border-amber-500/30">
                      {activeTake.tone}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{activeTake.synopsis}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20 flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  {activeTake.cameraMovement}
                </span>
              </div>
            </div>
          )}

          {isFallback && (
            <div className="flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-mono text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Offline fallback loaded — showing pre-seeded contrasting cuts.</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto rounded border border-border/70 bg-card/60 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-accent/30">
            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-accent" />
                <span className="text-xs font-mono">Gemini is synthesizing 3 distinct multiverse screenplay takes…</span>
              </div>
            )}
            {!isLoading && errorMessage && (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-rose-400 py-12">
                <AlertTriangle className="h-6 w-6" />
                <span>{errorMessage}</span>
                <Button size="sm" variant="outline" className="text-xs mt-1" onClick={() => fetchMultiverseTakes()}>
                  Retry Generation
                </Button>
              </div>
            )}
            {!isLoading && !errorMessage && activeTake?.scriptSnippet}
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
              disabled={isLoading || !activeTake}
              className="text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Apply {activeTake?.takeLabel?.split("·")[0] || "Take"} to Production Slate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
