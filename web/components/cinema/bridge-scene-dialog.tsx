"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Plus,
  Clock,
  ArrowRight,
  FileText,
  Users,
  Check,
  Zap,
} from "lucide-react";
import type { FilmScene, ProjectCharacter } from "@/lib/project-store";
import { cn } from "@/lib/utils";

interface BridgeSceneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevScene: FilmScene | null;
  nextScene: FilmScene | null;
  targetIndex: number | null;
  projectTitle: string;
  projectCharacters: ProjectCharacter[];
  isGenerating: boolean;
  onGenerateAI: (
    index: number,
    options: { userPrompt?: string; durationSeconds?: number }
  ) => Promise<void>;
  onInsertBlank: (
    index: number,
    blankData: {
      title: string;
      slugline: string;
      location: string;
      summary: string;
      screenplayText?: string;
      durationSeconds: number;
      castPresent: string[];
      isCompletelyEmpty?: boolean;
    }
  ) => void;
}

const QUICK_PROMPT_PRESETS = [
  { label: "🚗 High-speed transit / chase", prompt: "A tense, fast-paced vehicle transit sequence under heavy pursuit." },
  { label: "🤫 Covert stealth & surveillance", prompt: "Silent tactical infiltration, checking corners and evading patrol cameras." },
  { label: "⚡ Heated confrontation", prompt: "Two characters get into a sharp, escalating argument over conflicting objectives." },
  { label: "🚨 Close call with security", prompt: "A nail-biting close encounter where characters must freeze and avoid detection." },
  { label: "📞 Clandestine intel exchange", prompt: "A hurried, encrypted transmission or dead-drop exchange under time pressure." },
  { label: "☕ Quiet emotional decompression", prompt: "A quiet moment of decompression and vulnerability before entering the fray." },
];

export function BridgeSceneDialog({
  open,
  onOpenChange,
  prevScene,
  nextScene,
  targetIndex,
  projectTitle,
  projectCharacters = [],
  isGenerating,
  onGenerateAI,
  onInsertBlank,
}: BridgeSceneDialogProps) {
  const [activeTab, setActiveTab] = React.useState<"ai" | "blank">("ai");

  // AI Mode states
  const [userPrompt, setUserPrompt] = React.useState("");
  const [aiDurationMinutes, setAiDurationMinutes] = React.useState(2);

  // Blank Mode states
  const [blankType, setBlankType] = React.useState<"empty" | "custom">("empty");
  const [blankTitle, setBlankTitle] = React.useState("");
  const [settingType, setSettingType] = React.useState<"INT." | "EXT." | "INT./EXT.">("INT.");
  const [locationName, setLocationName] = React.useState("TRANSIT CORRIDOR");
  const [timeOfDay, setTimeOfDay] = React.useState<"CONTINUOUS" | "NIGHT" | "DAY" | "DUSK" | "DAWN">("CONTINUOUS");
  const [blankSummary, setBlankSummary] = React.useState("");
  const [blankDurationMinutes, setBlankDurationMinutes] = React.useState(2);
  const [selectedCast, setSelectedCast] = React.useState<string[]>([]);

  // Reset form when opened
  React.useEffect(() => {
    if (open && prevScene && nextScene) {
      setUserPrompt("");
      setAiDurationMinutes(2);
      setBlankType("empty");
      setBlankTitle(`Scene ${prevScene.sceneNumber + 1}`);
      setBlankSummary("");
      setLocationName(prevScene.location || "Transit Corridor");
      setSelectedCast([]);
      setActiveTab("ai");
    }
  }, [open, prevScene, nextScene]);

  if (!prevScene || !nextScene || targetIndex === null) {
    return null;
  }

  const computedBlankSlugline = `${settingType} ${locationName.trim() || "TRANSIT AREA"} - ${timeOfDay}`;

  const handleRunAI = async () => {
    await onGenerateAI(targetIndex, {
      userPrompt: userPrompt.trim() || undefined,
      durationSeconds: aiDurationMinutes * 60,
    });
    onOpenChange(false);
  };

  const handleRunBlank = () => {
    const isEmpty = blankType === "empty";
    onInsertBlank(targetIndex, {
      title: blankTitle.trim() || (isEmpty ? `Scene ${prevScene.sceneNumber + 1}` : "Transitional Beat"),
      slugline: computedBlankSlugline,
      location: locationName.trim() || "Transit Area",
      summary: isEmpty ? "" : blankSummary.trim(),
      screenplayText: isEmpty ? "" : (blankSummary.trim() ? `${computedBlankSlugline}\n\n${blankSummary.trim()}` : ""),
      durationSeconds: Math.max(30, blankDurationMinutes * 60),
      castPresent: isEmpty ? [] : selectedCast,
      isCompletelyEmpty: isEmpty,
    });
    onOpenChange(false);
  };

  const toggleCast = (name: string) => {
    setSelectedCast((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl p-6">
        <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
          <div className="h-8 w-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>Insert Bridge Scene</span>
          <span className="text-xs font-mono text-muted-foreground ml-auto bg-secondary px-2.5 py-1 rounded-full border border-border">
            {projectTitle}
          </span>
        </DialogTitle>

        <DialogDescription className="text-xs text-muted-foreground -mt-1">
          Insert a connective narrative beat between Scene {prevScene.sceneNumber} and Scene {nextScene.sceneNumber}.
        </DialogDescription>

        {/* ── SEAM CONTEXT: PREV & NEXT SCENE ── */}
        <div className="mt-3 p-3 rounded-xl border border-border/70 bg-secondary/30 grid grid-cols-[1fr,auto,1fr] items-center gap-3">
          <div className="min-w-0 bg-background/60 p-2.5 rounded-lg border border-border/50">
            <div className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">
              Scene {prevScene.sceneNumber} (Preceding)
            </div>
            <div className="text-xs font-bold text-foreground truncate mt-0.5">
              {prevScene.title}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground truncate">
              {prevScene.slugline}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-1 text-purple-400">
            <div className="h-6 w-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <ArrowRight className="h-3 w-3" />
            </div>
            <span className="text-[9px] font-mono mt-1 font-semibold text-purple-300 uppercase">
              Bridge
            </span>
          </div>

          <div className="min-w-0 bg-background/60 p-2.5 rounded-lg border border-border/50">
            <div className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">
              Scene {nextScene.sceneNumber} (Following)
            </div>
            <div className="text-xs font-bold text-foreground truncate mt-0.5">
              {nextScene.title}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground truncate">
              {nextScene.slugline}
            </div>
          </div>
        </div>

        {/* ── MODE SWITCHER ── */}
        <div className="mt-4 flex gap-2 p-1 bg-secondary/50 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === "ai"
                ? "bg-purple-600 text-white shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Synthesized Beat</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("blank")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === "blank"
                ? "bg-background text-foreground shadow-xs font-semibold border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Blank / Custom Scene</span>
          </button>
        </div>

        {/* ── TAB 1: AI SYNTHESIZED BEAT ── */}
        {activeTab === "ai" && (
          <div className="mt-4 space-y-4">
            <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Directorial Prompt / Guidance (Optional)</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-purple-300 border-purple-500/30">
                  {userPrompt.trim() ? "Custom Directed" : "Auto AI Synthesis"}
                </Badge>
              </div>

              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Leave blank for automatic AI generation, or provide specific instructions (e.g. 'Marcus and Elena argue inside the express lift before alarms trigger')..."
                className="text-xs bg-background/80 border-border min-h-[85px] resize-none focus-visible:ring-purple-500"
              />

              {/* Quick suggestions pills */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Quick Directorial Inspirations:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setUserPrompt((prev) =>
                          prev.trim() ? `${prev.trim()} ${preset.prompt}` : preset.prompt
                        );
                      }}
                      className="text-[11px] px-2 py-1 rounded-md bg-secondary/80 hover:bg-purple-900/40 hover:text-purple-200 border border-border/80 text-muted-foreground transition-all cursor-pointer text-left"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Estimated Duration */}
            <div className="p-3 rounded-xl border border-border bg-secondary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Estimated Bridge Duration</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((mins) => (
                  <Button
                    key={mins}
                    type="button"
                    variant={aiDurationMinutes === mins ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAiDurationMinutes(mins)}
                    className={cn(
                      "h-7 px-2.5 text-xs font-mono",
                      aiDurationMinutes === mins && "bg-purple-600 hover:bg-purple-500 text-white"
                    )}
                  >
                    {mins}m
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: BLANK / CUSTOM SCENE ── */}
        {activeTab === "blank" && (
          <div className="mt-4 space-y-4">
            {/* Blank Type Selector */}
            <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setBlankType("empty")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all text-center cursor-pointer",
                  blankType === "empty"
                    ? "bg-accent/20 text-accent font-semibold border border-accent/40 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ✨ Completely Empty (Clean Slate)
              </button>
              <button
                type="button"
                onClick={() => setBlankType("custom")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all text-center cursor-pointer",
                  blankType === "custom"
                    ? "bg-accent/20 text-accent font-semibold border border-accent/40 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ⚙️ Custom Metadata
              </button>
            </div>

            {blankType === "empty" ? (
              <div className="p-3.5 rounded-xl border border-dashed border-accent/40 bg-accent/5 text-xs space-y-1.5">
                <div className="text-foreground font-semibold flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-accent" />
                  <span>Zero Boilerplate & Clean Studio Canvas</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Inserts an unpopulated scene between Scene {prevScene.sceneNumber} and Scene {nextScene.sceneNumber}. Script, story canvas blueprint nodes, and timeline markers will start 100% empty so you have a true clean slate in the studio.
                </p>
              </div>
            ) : null}

            <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <FileText className="h-3.5 w-3.5 text-accent" />
                <span>Scene Identity</span>
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  Title
                </label>
                <Input
                  value={blankTitle}
                  onChange={(e) => setBlankTitle(e.target.value)}
                  placeholder={`Scene ${prevScene.sceneNumber + 1}`}
                  className="text-xs bg-background"
                />
              </div>

              {/* Slugline Builder */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  Slugline Elements
                </label>
                <div className="grid grid-cols-[auto,1fr,auto] gap-2">
                  <select
                    value={settingType}
                    onChange={(e) => setSettingType(e.target.value as "INT." | "EXT." | "INT./EXT.")}
                    className="h-8 rounded-md border border-border bg-background px-2 text-xs font-mono font-bold text-accent"
                  >
                    <option value="INT.">INT.</option>
                    <option value="EXT.">EXT.</option>
                    <option value="INT./EXT.">INT./EXT.</option>
                  </select>

                  <Input
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="LOCATION (e.g. ELEVATOR SHAFT)"
                    className="h-8 text-xs font-mono uppercase bg-background"
                  />

                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value as "CONTINUOUS" | "NIGHT" | "DAY" | "DUSK" | "DAWN")}
                    className="h-8 rounded-md border border-border bg-background px-2 text-xs font-mono text-muted-foreground"
                  >
                    <option value="CONTINUOUS">CONTINUOUS</option>
                    <option value="NIGHT">NIGHT</option>
                    <option value="DAY">DAY</option>
                    <option value="DUSK">DUSK</option>
                    <option value="DAWN">DAWN</option>
                  </select>
                </div>
                <div className="text-[11px] font-mono text-accent/80 mt-1 bg-background/50 px-2 py-1 rounded border border-border/40 truncate">
                  {computedBlankSlugline}
                </div>
              </div>

              {/* Summary only in Custom mode */}
              {blankType === "custom" && (
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Summary / Directorial Notes
                  </label>
                  <Textarea
                    value={blankSummary}
                    onChange={(e) => setBlankSummary(e.target.value)}
                    placeholder="Outline what takes place during this transition..."
                    className="text-xs bg-background min-h-[60px] resize-none"
                  />
                </div>
              )}

              {/* Cast Selection only in Custom mode */}
              {blankType === "custom" && projectCharacters.length > 0 && (
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    Cast Present in Transition
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {projectCharacters.map((char) => {
                      const isSelected = selectedCast.includes(char.name);
                      return (
                        <button
                          key={char.name}
                          type="button"
                          onClick={() => toggleCast(char.name)}
                          className={cn(
                            "flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-md border transition-all cursor-pointer",
                            isSelected
                              ? "bg-accent/20 border-accent text-accent font-semibold"
                              : "bg-secondary/40 border-border text-muted-foreground hover:border-border/80"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          {char.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Duration */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Duration</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((mins) => (
                    <Button
                      key={mins}
                      type="button"
                      variant={blankDurationMinutes === mins ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBlankDurationMinutes(mins)}
                      className="h-7 px-2.5 text-xs font-mono"
                    >
                      {mins}m
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeTab === "ai" ? (
              <>
                {userPrompt.trim() && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isGenerating}
                    onClick={() => {
                      setUserPrompt("");
                      onGenerateAI(targetIndex, {
                        userPrompt: undefined,
                        durationSeconds: aiDurationMinutes * 60,
                      }).then(() => onOpenChange(false));
                    }}
                    className="text-xs gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Zap className="h-3 w-3 text-amber-400" />
                    Auto (Ignore Prompt)
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  disabled={isGenerating}
                  onClick={handleRunAI}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1.5 font-medium shadow-md cursor-pointer"
                >
                  <Sparkles className={cn("h-3.5 w-3.5", isGenerating && "animate-spin")} />
                  {isGenerating
                    ? "Synthesizing Bridge Beat..."
                    : userPrompt.trim()
                    ? "Generate Guided Beat"
                    : "Auto-Generate AI Beat"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleRunBlank}
                className="w-full sm:w-auto text-xs gap-1.5 font-medium shadow-md cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                {blankType === "empty" ? "Insert Completely Empty Scene" : "Insert Custom Bridge Scene"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
