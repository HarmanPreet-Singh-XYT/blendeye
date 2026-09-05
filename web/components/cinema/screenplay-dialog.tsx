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
import { Edit3, Eye, Sparkles, Check, RefreshCw, Upload } from "lucide-react";

interface ScreenplayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  summary?: string;
  screenplayText: string;
  onSaveScript?: (newScript: string) => void;
  onReshard?: (newScript: string) => Promise<void>;
  isResharding?: boolean;
}

export function ScreenplayDialog({
  open,
  onOpenChange,
  title,
  summary,
  screenplayText,
  onSaveScript,
  onReshard,
  isResharding = false,
}: ScreenplayDialogProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedText, setEditedText] = React.useState(screenplayText);
  const [hasSaved, setHasSaved] = React.useState(false);
  const [tuneChar, setTuneChar] = React.useState("MARCUS");
  const [tuneInput, setTuneInput] = React.useState("I know what you did with the vault keys.");
  const [isTuning, setIsTuning] = React.useState(false);
  const [tunedResult, setTunedResult] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setEditedText(screenplayText);
  }, [screenplayText]);

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
      }
    } catch (err) {
      console.error("Dialogue tune error:", err);
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
      <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-5 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <SlateLabel>Production Screenplay · Master Script</SlateLabel>
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
                title="Import existing screenplay file (.fountain, .txt, .md)"
              >
                <Upload className="h-3.5 w-3.5 text-accent" />
                <span className="hidden sm:inline">Import Script</span>
              </Button>

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
                    <span>Edit Script</span>
                  </>
                )}
              </Button>

              {isEditing && (
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
                          <span>Save & Re-shard AI</span>
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Audio Table Read Player Bar */}
        <div className="p-4 border-b border-border bg-secondary/15">
          <TableReadPlayer
            screenplayText={isEditing ? editedText : screenplayText}
            className="border-0 bg-transparent p-0"
            hideHeader
          />
        </div>

        {isEditing ? (
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
                <span className="font-mono text-[10px] text-muted-foreground">Hollywood Subtext Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tuneChar}
                  onChange={(e) => setTuneChar(e.target.value)}
                  placeholder="CHARACTER"
                  className="w-28 rounded border border-border bg-background px-2 py-1 font-mono uppercase text-[11px]"
                />
                <input
                  type="text"
                  value={tuneInput}
                  onChange={(e) => setTuneInput(e.target.value)}
                  placeholder="Raw dialogue line..."
                  className="flex-1 rounded border border-border bg-background px-2 py-1 font-mono text-[11px]"
                />
                <Button
                  size="sm"
                  onClick={handleTuneDialogue}
                  disabled={isTuning}
                  className="h-7 text-xs gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isTuning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  <span>Sharpen</span>
                </Button>
              </div>
              {tunedResult && (
                <div className="flex items-center justify-between rounded bg-background/90 p-2 border border-accent/40 font-mono text-xs">
                  <span className="italic text-foreground/90">&ldquo;{tunedResult}&rdquo;</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleInsertTunedLine}
                    className="h-6 text-[10px] ml-2 border-accent text-accent shrink-0"
                  >
                    + Append to Script
                  </Button>
                </div>
              )}
            </div>

            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="flex-1 w-full resize-none rounded border border-border/80 bg-secondary/10 p-4 font-mono text-sm leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="INT. SCENE - TIME..."
              rows={20}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 bg-background font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-accent/30 selection:text-accent-foreground text-foreground/90">
            {screenplayText || "No screenplay generated yet. Click 'Edit Script' to write one or trigger the Gemini 3.7 generator."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
