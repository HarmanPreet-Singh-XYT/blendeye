"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings2,
  Users,
  Film,
  Globe2,
  Clock,
  Lock,
  Plus,
  Trash2,
  Check,
  MapPin,
  DollarSign,
  ShieldAlert,
  Navigation,
} from "lucide-react";
import {
  type ProjectData,
  type ProjectCharacter,
  type NarrativeFormat,
  type SupportedCurrency,
  type BudgetCapPolicy,
  GENRE_OPTIONS,
  CURRENCY_SYMBOLS,
  formatCurrency,
  saveProject,
} from "@/lib/project-store";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectData;
  onSaveProject: (updated: ProjectData) => void;
}

const DIRECTOR_STYLES = [
  { id: "Denis Villeneuve", style: "Brutalist scale, atmospheric sound design, deliberate slow-burn spatial geometry" },
  { id: "David Fincher", style: "Meticulous procedural rhythm, low-key chiaroscuro, relentless technical precision" },
  { id: "Christopher Nolan", style: "Non-linear chronological cross-cutting, practical scale, escalating tension" },
  { id: "Michael Mann", style: "Neo-noir sodium vapor, wet reflections, telephoto lens compression" },
  { id: "Bong Joon-ho", style: "Social status friction, sudden tonal turns, claustrophobic framing" },
  { id: "Greta Gerwig", style: "High-density conversational cadence, vivid emotional realism, razor-sharp status wit" },
];

const TARGET_TERRITORIES = [
  { code: "US", name: "North America", note: "Pacing & 3-Act Structure Focus", icon: "🇺🇸" },
  { code: "IN", name: "India", note: "Emotional Stakes, Music & Family Dynamics", icon: "🇮🇳" },
  { code: "KR", name: "South Korea", note: "Moral Ambiguity & Psychological Twists", icon: "🇰🇷" },
  { code: "DE", name: "Western Europe", note: "Procedural Realism & Authentic Logic", icon: "🇩🇪" },
  { code: "BR", name: "Latin America", note: "Ensemble Chemistry & High Energy", icon: "🇧🇷" },
  { code: "JP", name: "Japan", note: "Atmospheric Subtlety & Tension Control", icon: "🇯🇵" },
];

const FORMAT_OPTIONS: Array<{
  id: NarrativeFormat;
  label: string;
  minutes: number;
  badge: string;
}> = [
  { id: "feature", label: "Feature Film", minutes: 105, badge: "105 min" },
  { id: "pilot", label: "TV Pilot", minutes: 52, badge: "52 min" },
  { id: "short", label: "Festival Short", minutes: 18, badge: "18 min" },
  { id: "teaser", label: "PoC Teaser", minutes: 3, badge: "3 min" },
  { id: "series", label: "Limited Series", minutes: 65, badge: "65 min" },
  { id: "custom", label: "Custom Scope", minutes: 45, badge: "Custom" },
];

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
  onSaveProject,
}: EditProjectDialogProps) {
  const [activeTab, setActiveTab] = React.useState<"general" | "format" | "world" | "budget" | "territories" | "characters">("general");

  // Form states
  const [title, setTitle] = React.useState(project.title);
  const [premise, setPremise] = React.useState(project.premise);
  const [genre, setGenre] = React.useState(project.genre);
  const [isCustomGenre, setIsCustomGenre] = React.useState(false);
  const [customGenre, setCustomGenre] = React.useState("");
  const [directorStyle, setDirectorStyle] = React.useState(project.directorStyle || "");
  const [isCustomDirector, setIsCustomDirector] = React.useState(false);
  const [customDirector, setCustomDirector] = React.useState("");

  // Scope & Runtime
  const [narrativeFormat, setNarrativeFormat] = React.useState<NarrativeFormat>(
    project.narrativeFormat || "feature"
  );
  const [targetRuntimeMinutes, setTargetRuntimeMinutes] = React.useState<number>(
    project.targetRuntimeMinutes || 95
  );

  // World & Secrets
  const [primaryLocation, setPrimaryLocation] = React.useState(project.primaryLocation || "");
  const [coreSecret, setCoreSecret] = React.useState(project.coreSecret || "");

  // Budget & Logistics
  const [shootRegion, setShootRegion] = React.useState(project.shootRegion || "Los Angeles, CA");
  const [currency, setCurrency] = React.useState<SupportedCurrency>(project.currency || "USD");
  const [budget, setBudget] = React.useState<number>(project.budget || 850_000);
  const [budgetPerShootDay, setBudgetPerShootDay] = React.useState<number>(project.budgetPerShootDayUsd || 85_000);
  const [locationsPct, setLocationsPct] = React.useState<number>(project.budgetAllocation?.locationsPct || 15);
  const [budgetCapPolicy, setBudgetCapPolicy] = React.useState<BudgetCapPolicy>(project.budgetCapPolicy || "advisory");

  // Territories
  const [selectedTerritories, setSelectedTerritories] = React.useState<string[]>(
    project.targetTerritories || ["US", "IN", "KR"]
  );

  // Characters
  const [characters, setCharacters] = React.useState<ProjectCharacter[]>(project.characters || []);
  const [editingCharIdx, setEditingCharIdx] = React.useState<number | null>(null);
  const [newCharName, setNewCharName] = React.useState("");
  const [newCharRole, setNewCharRole] = React.useState("");
  const [newCharArchetype, setNewCharArchetype] = React.useState("");

  // Sync state when project changes or dialog opens
  React.useEffect(() => {
    if (open && project) {
      setTitle(project.title);
      setPremise(project.premise);
      
      // Match genre
      const matchedGenre = GENRE_OPTIONS.find((g) => g.id === project.genre);
      if (matchedGenre) {
        setGenre(project.genre);
        setIsCustomGenre(false);
        setCustomGenre("");
      } else {
        setIsCustomGenre(true);
        setCustomGenre(project.genre);
        setGenre(project.genre);
      }

      // Match director
      const matchedDirector = DIRECTOR_STYLES.find((d) => d.id === project.directorStyle);
      if (matchedDirector) {
        setDirectorStyle(project.directorStyle || "");
        setIsCustomDirector(false);
        setCustomDirector("");
      } else if (project.directorStyle) {
        setIsCustomDirector(true);
        setCustomDirector(project.directorStyle);
        setDirectorStyle(project.directorStyle);
      } else {
        setDirectorStyle(DIRECTOR_STYLES[0].id);
        setIsCustomDirector(false);
      }

      setNarrativeFormat(project.narrativeFormat || "feature");
      setTargetRuntimeMinutes(project.targetRuntimeMinutes || 95);
      setPrimaryLocation(project.primaryLocation || "");
      setCoreSecret(project.coreSecret || "");
      setShootRegion(project.shootRegion || "Los Angeles, CA");
      setCurrency(project.currency || "USD");
      setBudget(project.budget || 850_000);
      setBudgetPerShootDay(project.budgetPerShootDayUsd || 85_000);
      setLocationsPct(project.budgetAllocation?.locationsPct || 15);
      setBudgetCapPolicy(project.budgetCapPolicy || "advisory");
      setSelectedTerritories(project.targetTerritories || ["US", "IN", "KR"]);
      setCharacters(project.characters ? [...project.characters] : []);
      setActiveTab("general");
    }
  }, [open, project]);

  const effectiveGenre = isCustomGenre && customGenre.trim() ? customGenre.trim() : genre;
  const effectiveDirector = isCustomDirector && customDirector.trim() ? customDirector.trim() : directorStyle;

  const handleToggleTerritory = (code: string) => {
    setSelectedTerritories((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleAddCharacter = () => {
    const trimmedName = newCharName.trim();
    if (!trimmedName) return;
    const newChar: ProjectCharacter = {
      name: trimmedName,
      role: newCharRole.trim() || "Supporting Role",
      archetype: newCharArchetype.trim() || "Character with strong narrative agency",
      speechStyle: "Conversational, direct",
      subtextRatio: "high",
      confidence: 75,
      verbalPacing: 65,
      objective: "Pursuing clear scene goals",
    };
    setCharacters((prev) => [...prev, newChar]);
    setNewCharName("");
    setNewCharRole("");
    setNewCharArchetype("");
  };

  const handleDeleteCharacter = (idx: number) => {
    setCharacters((prev) => prev.filter((_, i) => i !== idx));
    if (editingCharIdx === idx) setEditingCharIdx(null);
  };

  const handleUpdateCharacterField = (idx: number, field: keyof ProjectCharacter, value: unknown) => {
    setCharacters((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSaveAll = () => {
    if (!title.trim()) {
      toast.add({
        title: "Title Required",
        description: "Please provide a valid project title.",
        type: "error",
      });
      return;
    }

    const totalBudget = Number(budget) || 850_000;
    const locPct = Number(locationsPct) || 15;
    const locAmount = Math.round(totalBudget * (locPct / 100));

    const updated: ProjectData = {
      ...project,
      title: title.trim(),
      premise: premise.trim(),
      genre: effectiveGenre,
      directorStyle: effectiveDirector,
      narrativeFormat,
      targetRuntimeMinutes,
      primaryLocation: primaryLocation.trim(),
      coreSecret: coreSecret.trim(),
      shootRegion: shootRegion.trim() || "Los Angeles, CA",
      currency,
      budget: totalBudget,
      budgetPerShootDayUsd: Number(budgetPerShootDay) || 85_000,
      budgetAllocation: {
        locationsPct: locPct,
        locationsAmount: locAmount,
      },
      budgetCapPolicy,
      targetTerritories: selectedTerritories,
      characters: characters,
      updatedAt: Date.now(),
    };

    saveProject(updated);
    onSaveProject(updated);
    onOpenChange(false);

    toast.add({
      title: "Project Settings Saved",
      description: `Updated project metadata and cast configuration for "${updated.title}".`,
      type: "success",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-card border-border shadow-2xl p-0">
        {/* Header */}
        <div className="p-6 border-b border-border bg-secondary/20 shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-xl font-bold text-foreground">
            <div className="h-8 w-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Settings2 className="h-4 w-4" />
            </div>
            <span>Project Settings &amp; Configuration</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Update title, premise, genre style, narrative scope, core secrets, and character ensemble.
          </DialogDescription>

          {/* Section Switcher Tabs */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "general"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              <Film className="h-3.5 w-3.5" />
              General &amp; Genre
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("format")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "format"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              Scope &amp; Runtime
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("world")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "world"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              Secret &amp; Location
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("budget")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "budget"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              <DollarSign className="h-3.5 w-3.5" />
              Budget &amp; Logistics
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("territories")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "territories"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              <Globe2 className="h-3.5 w-3.5" />
              Markets ({selectedTerritories.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("characters")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "characters"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              Characters ({characters.length})
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GENERAL & GENRE */}
          {activeTab === "general" && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Project Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midnight Flop, The Vault Heist"
                  className="bg-secondary/40 border-border text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Logline / Central Premise
                </label>
                <textarea
                  value={premise}
                  onChange={(e) => setPremise(e.target.value)}
                  placeholder="The dramatic core and overarching dilemma driving this story..."
                  rows={3}
                  className="w-full rounded-md border border-border bg-secondary/40 p-3 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-hidden"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Cinematic Genre</span>
                  <button
                    type="button"
                    onClick={() => setIsCustomGenre(!isCustomGenre)}
                    className="text-[11px] text-accent hover:underline lowercase font-normal"
                  >
                    {isCustomGenre ? "← choose from presets" : "+ custom genre"}
                  </button>
                </label>

                {isCustomGenre ? (
                  <Input
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    placeholder="e.g. Afrofuturist Cyber-Western, Supernatural Heist"
                    className="bg-secondary/40 border-border text-xs"
                  />
                ) : (
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full rounded-md border border-border bg-secondary/40 p-2.5 text-xs text-foreground focus:border-accent focus:outline-hidden"
                  >
                    {GENRE_OPTIONS.map((g) => (
                      <option key={g.id} value={g.id} className="bg-card text-foreground">
                        {g.label} ({g.tag})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Director Vision &amp; Aesthetic Signature</span>
                  <button
                    type="button"
                    onClick={() => setIsCustomDirector(!isCustomDirector)}
                    className="text-[11px] text-accent hover:underline lowercase font-normal"
                  >
                    {isCustomDirector ? "← choose from masters" : "+ custom director"}
                  </button>
                </label>

                {isCustomDirector ? (
                  <Input
                    value={customDirector}
                    onChange={(e) => setCustomDirector(e.target.value)}
                    placeholder="e.g. Stanley Kubrick (one-point perspective, cold symmetry)"
                    className="bg-secondary/40 border-border text-xs"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DIRECTOR_STYLES.map((d) => {
                      const isSelected = directorStyle === d.id;
                      return (
                        <div
                          key={d.id}
                          onClick={() => setDirectorStyle(d.id)}
                          className={cn(
                            "rounded-lg border p-3 cursor-pointer transition-all space-y-1 text-left",
                            isSelected
                              ? "border-accent bg-accent/10 shadow-xs"
                              : "border-border bg-secondary/20 hover:border-accent/40"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">{d.id}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-accent" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                            {d.style}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FORMAT & RUNTIME */}
          {activeTab === "format" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Narrative Scope &amp; Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {FORMAT_OPTIONS.map((fmt) => {
                    const isSelected = narrativeFormat === fmt.id;
                    return (
                      <div
                        key={fmt.id}
                        onClick={() => {
                          setNarrativeFormat(fmt.id);
                          setTargetRuntimeMinutes(fmt.minutes);
                        }}
                        className={cn(
                          "rounded-lg border p-3 cursor-pointer transition-all space-y-1.5",
                          isSelected
                            ? "border-accent bg-accent/10 shadow-xs"
                            : "border-border bg-secondary/20 hover:border-accent/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{fmt.label}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                            {fmt.badge}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Target Total Runtime
                  </span>
                  <span className="text-sm font-bold font-mono text-accent">
                    {targetRuntimeMinutes} minutes ({Math.round(targetRuntimeMinutes / 60 * 10) / 10}h)
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={240}
                  step={1}
                  value={targetRuntimeMinutes}
                  onChange={(e) => setTargetRuntimeMinutes(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>2m (PoC)</span>
                  <span>45m (TV)</span>
                  <span>105m (Feature)</span>
                  <span>240m (Epic)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORLD & SECRETS */}
          {activeTab === "world" && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  Primary Story World / Anchor Location
                </label>
                <Input
                  value={primaryLocation}
                  onChange={(e) => setPrimaryLocation(e.target.value)}
                  placeholder="e.g. Underground reinforced bank vault sub-level under emergency lighting"
                  className="bg-secondary/40 border-border text-xs"
                />
                <span className="text-[11px] text-muted-foreground">
                  Serves as the baseline physical anchor for production stripboarding and scout grounding.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  The Core Secret / Hidden Dramatic Knowledge
                </label>
                <textarea
                  value={coreSecret}
                  onChange={(e) => setCoreSecret(e.target.value)}
                  placeholder="What clandestine truth is hidden between characters? (e.g. Elena secretly swapped the vault bypass keys...)"
                  rows={4}
                  className="w-full rounded-md border border-border bg-secondary/40 p-3 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-hidden"
                />
                <span className="text-[11px] text-muted-foreground">
                  Showrunner AI uses this hidden knowledge to enforce dramatic irony, continuity checks, and dialogue subtext.
                </span>
              </div>
            </div>
          )}

          {/* TAB: BUDGET & LOGISTICS */}
          {activeTab === "budget" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  Financial Blueprint &amp; Production Base
                </label>
                <p className="text-xs text-muted-foreground">
                  Configure real-world production financials, shoot location base, and location budget cap enforcement.
                </p>
              </div>

              {/* Production Base / Shoot Region */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-accent" />
                  Production Base / Shoot Region
                </label>
                <Input
                  value={shootRegion}
                  onChange={(e) => setShootRegion(e.target.value)}
                  placeholder="e.g. Los Angeles, CA or London, UK"
                  className="bg-secondary/40 border-border text-xs"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "Los Angeles, CA",
                    "New York, NY",
                    "London, UK",
                    "Vancouver, BC",
                    "Atlanta, GA",
                    "Toronto, ON",
                  ].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setShootRegion(city)}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer",
                        shootRegion === city
                          ? "border-accent bg-accent/20 text-accent font-semibold"
                          : "border-border text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground block">
                  Grounds live web search for actual municipal permit offices, soundstage rates, and location rentals.
                </span>
              </div>

              {/* Financial Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Currency */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                    className="w-full h-9 rounded-md border border-border bg-secondary/40 px-2.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="CAD">CAD (CA$ - Canadian Dollar)</option>
                    <option value="AUD">AUD (A$ - Australian Dollar)</option>
                    <option value="JPY">JPY (¥ - Japanese Yen)</option>
                  </select>
                </div>

                {/* Total Budget */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Total Budget ({CURRENCY_SYMBOLS[currency]})
                  </label>
                  <Input
                    type="number"
                    min={1000}
                    step={5000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value) || 0)}
                    className="bg-secondary/40 border-border text-xs font-mono"
                  />
                </div>

                {/* Day Rate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Daily Rate ({CURRENCY_SYMBOLS[currency]}/day)
                  </label>
                  <Input
                    type="number"
                    min={500}
                    step={1000}
                    value={budgetPerShootDay}
                    onChange={(e) => setBudgetPerShootDay(Number(e.target.value) || 0)}
                    className="bg-secondary/40 border-border text-xs font-mono"
                  />
                </div>
              </div>

              {/* Location Budget Allocation */}
              <div className="p-4 rounded-xl border border-border bg-secondary/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                      Location Budget Allocation
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Percentage of total production budget reserved for physical locations &amp; permits.
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {formatCurrency(Math.round(budget * (locationsPct / 100)), currency)}
                    </span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      ({locationsPct}% of total)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={1}
                    value={locationsPct}
                    onChange={(e) => setLocationsPct(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold w-12 text-right">{locationsPct}%</span>
                </div>
              </div>

              {/* Budget Cap Enforcement Policy */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-accent" />
                  Budget Cap Enforcement Policy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setBudgetCapPolicy("advisory")}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all space-y-1",
                      budgetCapPolicy === "advisory"
                        ? "border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/30"
                        : "border-border bg-secondary/20 hover:border-emerald-500/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Advisory Warning</span>
                      <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
                        Flexible
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Locations exceeding budget show an alert badge and overage warning, but the director is allowed to lock them in.
                    </p>
                  </div>

                  <div
                    onClick={() => setBudgetCapPolicy("hard_block")}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all space-y-1",
                      budgetCapPolicy === "hard_block"
                        ? "border-rose-500 bg-rose-500/10 shadow-xs ring-1 ring-rose-500/30"
                        : "border-border bg-secondary/20 hover:border-rose-500/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Hard Block</span>
                      <Badge variant="outline" className="text-[10px] border-rose-500/40 text-rose-400">
                        Strict
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Prevents locking in any location candidate that blows the allocated location budget. Selection is disabled until budget is increased.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TARGET TERRITORIES */}
          {activeTab === "territories" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Global Target Distribution Territories
                </label>
                <p className="text-xs text-muted-foreground">
                  ClickHouse box-office telemetry and territory heatmaps correlate pacing and structural preferences across selected markets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TARGET_TERRITORIES.map((t) => {
                  const isSelected = selectedTerritories.includes(t.code);
                  return (
                    <div
                      key={t.code}
                      onClick={() => handleToggleTerritory(t.code)}
                      className={cn(
                        "rounded-xl border p-3 cursor-pointer transition-all flex items-start gap-3",
                        isSelected
                          ? "border-accent bg-accent/10 shadow-xs"
                          : "border-border bg-secondary/20 hover:border-accent/40"
                      )}
                    >
                      <span className="text-2xl select-none">{t.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{t.name}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-accent shrink-0" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: CHARACTERS & CAST */}
          {activeTab === "characters" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-foreground">
                    Project Character Ensemble ({characters.length})
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Define characters, psychological archetypes, speech cadences, and dramatic objectives.
                  </p>
                </div>
              </div>

              {/* Character List */}
              <div className="space-y-3">
                {characters.map((char, idx) => {
                  const isEditing = editingCharIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-secondary/20 p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-accent font-mono">#{idx + 1}</span>
                          <span className="text-sm font-bold text-foreground">{char.name}</span>
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            {char.role || "Character"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCharIdx(isEditing ? null : idx)}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {isEditing ? "Done" : "Edit Details"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCharacter(idx)}
                            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase">Name</label>
                            <Input
                              value={char.name}
                              onChange={(e) => handleUpdateCharacterField(idx, "name", e.target.value)}
                              className="h-8 text-xs bg-card"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase">Role</label>
                            <Input
                              value={char.role || ""}
                              onChange={(e) => handleUpdateCharacterField(idx, "role", e.target.value)}
                              className="h-8 text-xs bg-card"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase">Archetype</label>
                            <Input
                              value={char.archetype}
                              onChange={(e) => handleUpdateCharacterField(idx, "archetype", e.target.value)}
                              className="h-8 text-xs bg-card"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase">Actor Comp</label>
                            <Input
                              value={char.actorComp || ""}
                              onChange={(e) => handleUpdateCharacterField(idx, "actorComp", e.target.value)}
                              className="h-8 text-xs bg-card"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase">Speech Style</label>
                            <Input
                              value={char.speechStyle || ""}
                              onChange={(e) => handleUpdateCharacterField(idx, "speechStyle", e.target.value)}
                              className="h-8 text-xs bg-card"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase">Dramatic Objective</label>
                            <Input
                              value={char.objective || ""}
                              onChange={(e) => handleUpdateCharacterField(idx, "objective", e.target.value)}
                              className="h-8 text-xs bg-card"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {char.archetype || "No archetype specified."}
                          {char.actorComp && <span className="font-mono text-accent/80 block mt-0.5">Comp: {char.actorComp}</span>}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add New Character */}
              <div className="rounded-xl border border-dashed border-border p-4 space-y-3 bg-secondary/10">
                <span className="text-xs font-semibold text-foreground font-mono uppercase tracking-wider block">
                  + Add New Character to Ensemble
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Character Name (e.g. Teo)"
                    value={newCharName}
                    onChange={(e) => setNewCharName(e.target.value)}
                    className="h-8 text-xs bg-card"
                  />
                  <Input
                    placeholder="Role (e.g. Getaway Driver)"
                    value={newCharRole}
                    onChange={(e) => setNewCharRole(e.target.value)}
                    className="h-8 text-xs bg-card"
                  />
                  <Input
                    placeholder="Archetype (e.g. Cynical specialist)"
                    value={newCharArchetype}
                    onChange={(e) => setNewCharArchetype(e.target.value)}
                    className="h-8 text-xs bg-card"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddCharacter}
                  disabled={!newCharName.trim()}
                  className="text-xs gap-1.5 border-accent/40 text-accent hover:bg-accent/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Character
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveAll}
            className="text-xs font-semibold gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
          >
            <Check className="h-3.5 w-3.5" />
            Save Project Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
