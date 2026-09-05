"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SlateLabel } from "@/components/cinema/slate-label";
import { TableReadPlayer } from "@/components/cinema/table-read-player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Edit3,
  Eye,
  Sparkles,
  Check,
  RefreshCw,
  Upload,
  User,
  Layers,
  Lock,
  MessageSquare,
  Compass,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { notifyIfFallback } from "@/lib/fallback-notice";
import type { ProjectCharacter } from "@/lib/project-store";

interface ScreenplayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  summary?: string;
  screenplayText: string;
  characters?: ProjectCharacter[];
  currentTimecode?: string;
  onSaveScript?: (newScript: string) => void;
  onReshard?: (newScript: string) => Promise<void>;
  onOpenHotSeat?: (charName: string) => void;
  isResharding?: boolean;
}

export function ScreenplayDialog({
  open,
  onOpenChange,
  title,
  summary,
  screenplayText,
  characters = [],
  currentTimecode = "00:34:00",
  onSaveScript,
  onReshard,
  onOpenHotSeat,
  isResharding = false,
}: ScreenplayDialogProps) {
  // POV track mode: "master" or character name
  const [activeTrack, setActiveTrack] = React.useState<string>("master");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedText, setEditedText] = React.useState(screenplayText);
  const [hasSaved, setHasSaved] = React.useState(false);
  const [tuneChar, setTuneChar] = React.useState(characters[0]?.name || "MARCUS");
  const [tuneInput, setTuneInput] = React.useState("I know what you did with the vault keys.");
  const [isTuning, setIsTuning] = React.useState(false);
  const [tunedResult, setTunedResult] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setEditedText(screenplayText);
  }, [screenplayText]);

  React.useEffect(() => {
    if (characters.length > 0 && !tuneChar) {
      setTuneChar(characters[0].name);
    }
  }, [characters, tuneChar]);

  const activeChar = React.useMemo(() => {
    if (activeTrack === "master") return null;
    return characters.find((c) => c.name.toLowerCase() === activeTrack.toLowerCase()) || characters[0];
  }, [activeTrack, characters]);

  // Generate perspective-specific POV script text
  const characterPovScript = React.useMemo(() => {
    if (!activeChar) return screenplayText;

    const name = activeChar.name.toUpperCase();
    const otherChars = characters.filter((c) => c.name.toUpperCase() !== name);
    const otherName = otherChars[0]?.name.toUpperCase() || "COUNTERPART";

    return `PERSPECTIVE TRACK: ${name} (POV)
STORY TIMECODE: ${currentTimecode}
PHYSICAL COORDINATES: Primary Scene Staging Zone
EPISTEMIC BOUNDARY: Strictly bounded by events witnessed prior to ${currentTimecode}

================================================================================
INTERNAL OBJECTIVE:
${activeChar.objective || "Control the situation and ascertain leverage before time expires."}

CURRENT PSYCHOLOGICAL STATE:
Cadence: ${activeChar.speechStyle || "naturalistic, guarded"} · Subtext Level: ${activeChar.subtextRatio || "high"}
Mannerisms: ${(activeChar.quirks || ["Scans perimeter", "Maintains guarded stance"]).join("; ")}
================================================================================

[SCENE FROM ${name}'S SIGHTLINE]

You are observing ${otherName}. Every word they speak carries veiled subtext.
You are actively listening for hesitation or deceptive cadence.

${screenplayText
  .split("\n")
  .map((line) => {
    if (line.trim().startsWith(name)) {
      return `\n>> YOUR LINE (${name}):\n${line}`;
    }
    if (line.trim().startsWith(otherName)) {
      return `\n>> WHAT YOU HEAR FROM ${otherName}:\n${line}`;
    }
    return line;
  })
  .join("\n")}

================================================================================
OFF-SCREEN ACTIONS & KNOWLEDGE FIREWALL:
- Events after ${currentTimecode} are strictly locked out of your epistemic horizon.
- If questioned about future timeline events, you respond with suspicion or genuine ignorance.
================================================================================`;
  }, [activeChar, characters, currentTimecode, screenplayText]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setEditedText(text);
        setIsEditing(true);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveOnly = () => {
    onSaveScript?.(editedText);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2000);
  };

  const handleSaveAndReshard = async () => {
    onSaveScript?.(editedText);
    if (onReshard) {
      await onReshard(editedText);
    }
  };

  const handleTuneDialogue = async () => {
    if (isTuning || !tuneInput) return;
    setIsTuning(true);
    setTunedResult(null);
    try {
      const res = await fetch("/api/character/tune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character_name: tuneChar,
          speech_style: "Measured, subtext-heavy cinematic cadence",
          subtext_ratio: "High subtext, veiled tension",
          raw_dialogue: tuneInput,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTunedResult(data.tuned_dialogue || data.dialogue);
        notifyIfFallback(data, "Dialogue Tuning");
      } else {
        const detail = await res.text().catch(() => "");
        toast.add({
          title: "Dialogue tuning failed",
          description: detail || `Request failed (${res.status}). Try again.`,
          type: "error",
        });
      }
    } catch (err) {
      console.error("Dialogue tune error:", err);
      toast.add({
        title: "Dialogue tuning failed",
        description: err instanceof Error ? err.message : "Could not reach the tuning backend.",
        type: "error",
      });
    } finally {
      setIsTuning(false);
    }
  };

  const handleInsertTunedLine = () => {
    if (!tunedResult) return;
    const formatted = `\n\n${tuneChar.toUpperCase()}\n${tunedResult}\n`;
    setEditedText((prev) => prev + formatted);
    setTunedResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-border">
        {/* Modal Header */}
        <DialogHeader className="p-5 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <SlateLabel>Production Screenplay · Multi-POV Screenplay Engine</SlateLabel>
              <DialogTitle className="text-xl font-heading">{title}</DialogTitle>
              {summary && (
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {summary}
                </DialogDescription>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.fountain,.pdf,.md"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs gap-1.5 h-8 border-border text-muted-foreground hover:text-foreground cursor-pointer"
                title="Import existing screenplay file"
              >
                <Upload className="h-3.5 w-3.5 text-accent" />
                <span className="hidden sm:inline">Import Script</span>
              </Button>

              {activeTrack === "master" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs gap-1.5 h-8 border-border cursor-pointer"
                >
                  {isEditing ? (
                    <>
                      <Eye className="h-3.5 w-3.5 text-accent" />
                      <span>Reader View</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3.5 w-3.5 text-accent" />
                      <span>Edit Master</span>
                    </>
                  )}
                </Button>
              )}

              {isEditing && activeTrack === "master" && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleSaveOnly}
                    className="text-xs gap-1.5 h-8"
                  >
                    {hasSaved ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : null}
                    <span>{hasSaved ? "Saved" : "Save Local"}</span>
                  </Button>

                  {onReshard && (
                    <Button
                      size="sm"
                      onClick={handleSaveAndReshard}
                      disabled={isResharding}
                      className="text-xs gap-1.5 h-8 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {isResharding ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Sharding to ClickHouse...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Save &amp; Re-shard</span>
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Perspective Track Switcher Bar */}
          <div className="flex items-center gap-1.5 pt-3 overflow-x-auto">
            <span className="text-[10px] font-mono uppercase text-muted-foreground mr-1 flex items-center gap-1">
              <Layers className="h-3 w-3 text-accent" /> Track:
            </span>

            <button
              type="button"
              onClick={() => {
                setActiveTrack("master");
                setIsEditing(false);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTrack === "master"
                  ? "bg-foreground text-background font-bold shadow-xs"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
              }`}
            >
              Master Screenplay
            </button>

            {characters.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  setActiveTrack(c.name);
                  setIsEditing(false);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTrack.toLowerCase() === c.name.toLowerCase()
                    ? "bg-accent text-accent-foreground font-bold shadow-xs"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                }`}
              >
                <User className="h-3 w-3" />
                <span>{c.name}&apos;s POV Script</span>
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Audio Table Read Player Bar (in Master mode) */}
        {activeTrack === "master" && (
          <div className="p-4 border-b border-border bg-secondary/15">
            <TableReadPlayer
              screenplayText={isEditing ? editedText : screenplayText}
              className="border-0 bg-transparent p-0"
              hideHeader
            />
          </div>
        )}

        {/* Epistemic Firewall Banner in Character POV mode */}
        {activeTrack !== "master" && activeChar && (
          <div className="p-3.5 border-b border-accent/30 bg-accent/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono text-accent font-bold">
                <Lock className="h-3.5 w-3.5" />
                <span>Epistemic Firewall @ {currentTimecode}</span>
              </div>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <span className="text-muted-foreground hidden sm:inline">
                Restricted to what {activeChar.name} has witnessed up to this minute.
              </span>
            </div>

            {onOpenHotSeat && (
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onOpenHotSeat(activeChar.name);
                }}
                className="text-xs h-7 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Interrogate at this Beat</span>
              </Button>
            )}
          </div>
        )}

        {/* Script Content Area */}
        {isEditing && activeTrack === "master" ? (
          <div className="flex-1 flex flex-col p-4 bg-background overflow-hidden">
            <div className="text-[11px] text-muted-foreground font-mono mb-2 flex items-center justify-between">
              <span>Standard Hollywood Screenplay Format · Type action lines and CHARACTERS in caps</span>
              <span>{editedText.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>

            {/* AI Dialogue Subtext Polish Drawer */}
            <div className="mb-2 p-2.5 rounded-lg border border-accent/30 bg-accent/5 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-accent flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="h-3 w-3" />
                  AI Dialogue Subtext Sharpener (Gemini 3.7)
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">Character Vocal Cadence</span>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={tuneChar}
                  onChange={(e) => setTuneChar(e.target.value.toUpperCase())}
                  placeholder="CHARACTER"
                  className="w-28 text-xs font-mono font-bold bg-background h-7"
                />
                <Input
                  value={tuneInput}
                  onChange={(e) => setTuneInput(e.target.value)}
                  placeholder="Raw dialogue line to sharpen with subtext..."
                  className="flex-1 text-xs bg-background h-7"
                />
                <Button
                  size="sm"
                  onClick={handleTuneDialogue}
                  disabled={isTuning || !tuneInput}
                  className="text-xs h-7 gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isTuning ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  <span>Polish</span>
                </Button>
              </div>

              {tunedResult && (
                <div className="flex items-center justify-between p-2 rounded bg-background/80 border border-accent/20">
                  <div className="text-xs italic font-serif text-accent">
                    &ldquo;{tunedResult}&rdquo;
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleInsertTunedLine}
                    className="text-xs h-6 text-accent hover:bg-accent/10"
                  >
                    Insert at Bottom
                  </Button>
                </div>
              )}
            </div>

            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-xs bg-secondary/15 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none leading-relaxed"
            />
          </div>
        ) : (
          <div className="flex-1 p-6 bg-background overflow-y-auto font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed select-text">
            {activeTrack === "master" ? screenplayText : characterPovScript}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
