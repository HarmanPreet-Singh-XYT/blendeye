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
import { Badge } from "@/components/ui/badge";
import { SlateLabel } from "@/components/cinema/slate-label";
import {
  Clapperboard,
  Sparkles,
  Users,
  Clock,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Check,
  Zap,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { FilmScene, ProjectCharacter } from "@/lib/project-store";
import { cn } from "@/lib/utils";

interface CreateSceneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  projectCharacters: ProjectCharacter[];
  nextSceneNumber: number;
  onAddScene: (scene: FilmScene, openStudioImmediately: boolean) => void;
  existingScenes?: FilmScene[];
}

const COMMON_LOCATIONS = [
  "Underground Reinforced Vault",
  "Roadside Diner Booth",
  "Tech Surveillance Van",
  "Police Interrogation Room",
  "Rooftop Helipad",
  "High-Rise Penthouse Corridor",
  "Subway Service Tunnel",
  "Industrial Cargo Docks",
  "Abandoned Warehouse Loft",
  "Corporate Boardroom",
];

const SCENE_ROLE_PRESETS = [
  "Infiltrator / Safe-cracker",
  "Interrogator / Aggressor",
  "Withholding Critical Intel",
  "Lookout / Tactical Overwatch",
  "Reluctant Accomplice",
  "Decoy / Distraction",
  "Hostage / Target",
  "Enforcer / Muscle",
];

export function CreateSceneDialog({
  open,
  onOpenChange,
  projectTitle,
  projectCharacters = [],
  nextSceneNumber,
  onAddScene,
  existingScenes = [],
}: CreateSceneDialogProps) {
  const [sceneNumber, setSceneNumber] = React.useState(nextSceneNumber);
  const [title, setTitle] = React.useState("");
  const [settingType, setSettingType] = React.useState<"INT." | "EXT." | "INT./EXT.">("INT.");
  const [locationName, setLocationName] = React.useState("");
  const [timeOfDay, setTimeOfDay] = React.useState<"NIGHT" | "DAY" | "DUSK" | "DAWN" | "CONTINUOUS">("NIGHT");
  const [summary, setSummary] = React.useState("");
  const [durationMinutes, setDurationMinutes] = React.useState(4);

  // Character selection & roles
  const [selectedCast, setSelectedCast] = React.useState<string[]>([]);
  const [castRoles, setCastRoles] = React.useState<Record<string, string>>({});

  // Adding an ad-hoc character for this scene
  const [newCharName, setNewCharName] = React.useState("");
  const [newCharRole, setNewCharRole] = React.useState("");
  const [showAddCharInput, setShowAddCharInput] = React.useState(false);

  // Screenplay preview & AI drafting
  const [screenplayText, setScreenplayText] = React.useState("");
  const [isDraftingAI, setIsDraftingAI] = React.useState(false);

  // Reset form when opened with new nextSceneNumber
  React.useEffect(() => {
    if (open) {
      setSceneNumber(nextSceneNumber);
      setTitle(`Scene ${nextSceneNumber}`);
      setLocationName("");
      setSummary("");
      setScreenplayText("");
      // Default to picking first 2 project characters if available
      const initialCast = projectCharacters.slice(0, 2).map((c) => c.name);
      setSelectedCast(initialCast);
      const initialRoles: Record<string, string> = {};
      initialCast.forEach((name, i) => {
        initialRoles[name] = i === 0 ? "Protagonist / Primary Driver" : "Counterpart / Obstacle";
      });
      setCastRoles(initialRoles);
    }
  }, [open, nextSceneNumber, projectCharacters]);

  const computedSlugline = `${settingType} ${locationName.trim().toUpperCase() || "LOCATION"} - ${timeOfDay}`;

  const toggleCharacter = (charName: string) => {
    setSelectedCast((prev) => {
      const exists = prev.includes(charName);
      if (exists) {
        const next = prev.filter((c) => c !== charName);
        const nextRoles = { ...castRoles };
        delete nextRoles[charName];
        setCastRoles(nextRoles);
        return next;
      } else {
        const next = [...prev, charName];
        setCastRoles((r) => ({
          ...r,
          [charName]: r[charName] || "Participant in scene conflict",
        }));
        return next;
      }
    });
  };

  const handleAddNewCharacter = () => {
    const trimmed = newCharName.trim();
    if (!trimmed) return;
    if (!selectedCast.includes(trimmed)) {
      setSelectedCast((prev) => [...prev, trimmed]);
      setCastRoles((prev) => ({
        ...prev,
        [trimmed]: newCharRole.trim() || "Dynamic Scene Specialist",
      }));
    }
    setNewCharName("");
    setNewCharRole("");
    setShowAddCharInput(false);
  };

  const handleGenerateScriptDraft = async () => {
    if (!title && !locationName && !summary) return;
    setIsDraftingAI(true);
    try {
      const prompt = `Write a dramatic Hollywood scene script:
Project: ${projectTitle}
Scene ${sceneNumber}: ${title || "Dramatic Scene"}
Slugline: ${computedSlugline}
Stakes/Summary: ${summary || "High dramatic confrontation"}
Cast & Roles in this scene:
${selectedCast.map((c) => `- ${c}: ${castRoles[c] || "Participant"}`).join("\n")}
Format standard screenplay format with scene header, action descriptions, character names, and tense subtext dialogue.`;

      const res = await fetch("/api/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          premise: prompt,
          genre: "Cinematic Drama / Thriller",
          characters: selectedCast.map((name) => ({
            name,
            role: castRoles[name] || "Character",
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.screenplay) {
          setScreenplayText(data.screenplay);
          if (!summary && data.summary) setSummary(data.summary);
        }
      }
    } catch (err) {
      console.warn("AI scene draft failed, using fallback:", err);
    } finally {
      setIsDraftingAI(false);
    }

    if (!screenplayText) {
      // Fallback draft
      const primaryChar = selectedCast[0] || "LEAD";
      const secondChar = selectedCast[1] || "COUNTERPART";
      setScreenplayText(`${computedSlugline}

Tension hangs heavy in the room.

${primaryChar.toUpperCase()}
We don't have much time before everything falls apart.

${secondChar.toUpperCase()}
Then make your move now.`);
    }
  };

  const handleSave = (openStudio: boolean) => {
    const calculatedStartSeconds = existingScenes.reduce(
      (acc, sc) => acc + (sc.durationSeconds || 180),
      0
    );

    const newScene: FilmScene = {
      id: `scene-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sceneNumber: Number(sceneNumber) || nextSceneNumber,
      title: title.trim() || `Scene ${sceneNumber}`,
      slugline: computedSlugline,
      summary: summary.trim() || `Dramatic sequence at ${locationName || "the location"}.`,
      startSeconds: calculatedStartSeconds,
      durationSeconds: Math.max(30, Math.round(durationMinutes * 60)),
      location: locationName.trim() || "Set Location",
      castPresent: selectedCast,
      castRoles: castRoles,
      screenplayText: screenplayText || `${computedSlugline}\n\n[Scene action and dialogue to be written in Scene Studio]`,
    };

    onAddScene(newScene, openStudio);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl p-6 sm:p-8">
        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
          <div className="h-8 w-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <Clapperboard className="h-4 w-4" />
          </div>
          <span>Create New Scene</span>
          <span className="text-xs font-mono text-muted-foreground ml-auto bg-secondary px-2.5 py-1 rounded-full border border-border">
            {projectTitle}
          </span>
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground -mt-1">
          Add a scene to the film sequence. Define dramatic stakes, cast presence, and each character&apos;s specific objective in this beat.
        </DialogDescription>

        <div className="space-y-6 pt-2">
          {/* SECTION 1: Scene Identity & Slugline */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                1. Scene Heading &amp; Slugline
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Scene #</span>
                <Input
                  type="number"
                  min={1}
                  value={sceneNumber}
                  onChange={(e) => setSceneNumber(Number(e.target.value))}
                  className="w-16 h-7 text-xs font-mono font-bold text-center bg-card"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-foreground block mb-1">
                  Scene Title
                </label>
                <Input
                  placeholder="e.g. The Rooftop Extraction, The Confrontation..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xs bg-card"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1">
                  Est. Runtime (Minutes)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="30"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseFloat(e.target.value) || 3)}
                    className="text-xs font-mono bg-card"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    ({Math.round(durationMinutes * 60)}s)
                  </span>
                </div>
              </div>
            </div>

            {/* Slugline builder controls */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] uppercase font-mono text-muted-foreground block mb-1">
                  Setting
                </label>
                <div className="flex rounded-md border border-border bg-card p-0.5 text-xs">
                  {(["INT.", "EXT.", "INT./EXT."] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSettingType(t)}
                      className={cn(
                        "flex-1 py-1 text-[11px] font-mono rounded transition-colors",
                        settingType === t ? "bg-accent text-accent-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase font-mono text-muted-foreground block mb-1">
                  Location Name
                </label>
                <Input
                  placeholder="e.g. UNDERGROUND VAULT, PRECINCT PARKING..."
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="text-xs font-mono bg-card uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-muted-foreground block mb-1">
                  Time of Day
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-border bg-card px-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="NIGHT">NIGHT</option>
                  <option value="DAY">DAY</option>
                  <option value="DUSK">DUSK</option>
                  <option value="DAWN">DAWN</option>
                  <option value="CONTINUOUS">CONTINUOUS</option>
                </select>
              </div>
            </div>

            {/* Quick location suggestion chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-muted-foreground self-center mr-1">Quick Sets:</span>
              {COMMON_LOCATIONS.slice(0, 6).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocationName(loc)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border bg-card/60 hover:bg-accent/10 hover:border-accent/40 text-muted-foreground hover:text-foreground transition-all"
                >
                  {loc}
                </button>
              ))}
            </div>

            {/* Slugline live preview badge */}
            <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-accent font-semibold">
                Screenplay Slugline:
              </span>
              <span className="font-mono text-xs text-foreground tracking-wider font-bold">
                {computedSlugline}
              </span>
            </div>
          </div>

          {/* SECTION 2: Dramatic Stakes & Synopsis */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-accent" />
              2. Scene Stakes &amp; Dramatic Conflict
            </label>
            <textarea
              placeholder="What happens in this scene? What does the lead want, what stands in their way, and what information or stakes change before the cut?"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none placeholder:text-muted-foreground/60"
            />
          </div>

          {/* SECTION 3: Cast Selection & Per-Character Scene Roles (The Core Feature!) */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-accent" />
                  3. Characters in this Scene &amp; Their Roles
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Select which characters are present in this location, and define their specific objective for this beat.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddCharInput((p) => !p)}
                className="h-7 text-xs gap-1 border-border"
              >
                <Plus className="h-3 w-3" />
                {showAddCharInput ? "Cancel" : "Add Character"}
              </Button>
            </div>

            {/* Quick-add new character form */}
            {showAddCharInput && (
              <div className="rounded-lg border border-accent/40 bg-accent/5 p-3 space-y-2">
                <span className="text-[11px] font-semibold text-accent flex items-center gap-1">
                  Introduce New Character in this Scene:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Character Name (e.g. Detective Miller)"
                    value={newCharName}
                    onChange={(e) => setNewCharName(e.target.value)}
                    className="text-xs bg-card h-8"
                  />
                  <Input
                    placeholder="Archetype / Scene Role (e.g. Lead Interrogator)"
                    value={newCharRole}
                    onChange={(e) => setNewCharRole(e.target.value)}
                    className="text-xs bg-card h-8"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewCharacter}
                    disabled={!newCharName.trim()}
                    className="h-7 text-xs bg-accent text-accent-foreground font-semibold"
                  >
                    Include in Scene
                  </Button>
                </div>
              </div>
            )}

            {/* Character selection toggles */}
            <div className="flex flex-wrap gap-2">
              {projectCharacters.map((char) => {
                const isSelected = selectedCast.includes(char.name);
                return (
                  <button
                    key={char.name}
                    type="button"
                    onClick={() => toggleCharacter(char.name)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer",
                      isSelected
                        ? "border-accent bg-accent/15 text-foreground shadow-xs"
                        : "border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card"
                    )}
                  >
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        isSelected ? "bg-accent animate-pulse" : "bg-muted-foreground/40"
                      )}
                    />
                    <span>{char.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ({char.archetype || "Character"})
                    </span>
                    {isSelected && <Check className="h-3 w-3 text-accent shrink-0 ml-1" />}
                  </button>
                );
              })}

              {/* Any ad-hoc characters added */}
              {selectedCast
                .filter((name) => !projectCharacters.some((c) => c.name === name))
                .map((adhocName) => (
                  <button
                    key={adhocName}
                    type="button"
                    onClick={() => toggleCharacter(adhocName)}
                    className="px-3 py-1.5 rounded-lg border border-accent bg-accent/20 text-foreground text-xs font-semibold flex items-center gap-2"
                  >
                    <div className="h-2 w-2 rounded-full bg-accent" />
                    <span>{adhocName}</span>
                    <span className="text-[9px] bg-accent/30 px-1.5 py-0.2 rounded text-accent font-mono">
                      New
                    </span>
                    <Check className="h-3 w-3 text-accent shrink-0" />
                  </button>
                ))}
            </div>

            {/* Per-character role definition cards */}
            {selectedCast.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-semibold text-foreground block">
                  Character Objectives &amp; Roles for THIS Scene:
                </span>
                <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {selectedCast.map((charName) => (
                    <div
                      key={charName}
                      className="rounded-lg border border-border bg-card p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                          {charName}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Scene Role &amp; Motive
                        </span>
                      </div>
                      <Input
                        placeholder={`What is ${charName}'s specific goal or conflict in this scene?`}
                        value={castRoles[charName] || ""}
                        onChange={(e) =>
                          setCastRoles((prev) => ({
                            ...prev,
                            [charName]: e.target.value,
                          }))
                        }
                        className="text-xs bg-secondary/30 h-8"
                      />
                      {/* Preset chips */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {SCENE_ROLE_PRESETS.slice(0, 4).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              setCastRoles((prev) => ({
                                ...prev,
                                [charName]: preset,
                              }))
                            }
                            className="text-[9px] px-1.5 py-0.5 rounded border border-border/80 bg-secondary/40 text-muted-foreground hover:text-foreground transition-all"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: AI Screenplay Drafting Co-Pilot */}
          <div className="rounded-xl border border-border bg-secondary/15 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                  <Sparkles className="h-3 w-3" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground">AI Screenplay Drafting</span>
                  <p className="text-[10px] text-muted-foreground">
                    Generate initial Hollywood screenplay dialogue based on the selected scene roles
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateScriptDraft}
                disabled={isDraftingAI || selectedCast.length === 0}
                className="h-8 text-xs gap-1.5 border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
              >
                <Sparkles className={cn("h-3 w-3", isDraftingAI && "animate-spin")} />
                {isDraftingAI ? "Drafting Screenplay..." : "Draft with Gemini"}
              </Button>
            </div>

            {screenplayText && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  Screenplay Draft Preview:
                </span>
                <textarea
                  value={screenplayText}
                  onChange={(e) => setScreenplayText(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-card p-2.5 font-mono text-[11px] text-foreground resize-none leading-relaxed focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border pt-4 mt-4">
          <div className="text-[11px] text-muted-foreground font-mono">
            {selectedCast.length} characters in Scene {sceneNumber} · {Math.round(durationMinutes * 60)}s
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9 flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSave(false)}
              className="text-xs h-9 flex-1 sm:flex-initial gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add to Sequence
            </Button>
            <Button
              type="button"
              onClick={() => handleSave(true)}
              className="text-xs h-9 flex-1 sm:flex-initial gap-1.5 bg-accent text-accent-foreground font-semibold hover:bg-accent/90 shadow-sm"
            >
              <Clapperboard className="h-3.5 w-3.5" />
              Add &amp; Open Scene Studio
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
