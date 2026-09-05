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
  type HistoryEntry,
  type HistoryCategory,
  type SnapshotState,
  StudioVersionControl,
} from "@/lib/version-control";
import {
  GitBranch,
  RotateCcw,
  RotateCw,
  Bookmark,
  CheckCircle2,
  Clock,
  Link2,
  Unlink,
  Sliders,
  FileText,
  LayoutGrid,
  PlusCircle,
  Scissors,
  Tag,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface VersionControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vcs: StudioVersionControl | null;
  onRevertSnapshot: (snapshot: SnapshotState, summary: string) => void;
}

const CATEGORY_META: Record<
  HistoryCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  initial: { label: "Init", icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  node_add: { label: "Node +", icon: PlusCircle, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  node_remove: { label: "Node -", icon: Scissors, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
  wire_add: { label: "Wire Link", icon: Link2, color: "text-accent bg-accent/10 border-accent/30" },
  wire_remove: { label: "Wire Sever", icon: Unlink, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
  parameter: { label: "Parameter", icon: Sliders, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  script: { label: "Screenplay", icon: FileText, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  layout: { label: "Auto-Layout", icon: LayoutGrid, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  milestone: { label: "Milestone", icon: Bookmark, color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/40" },
};

export function VersionControlDialog({
  open,
  onOpenChange,
  vcs,
  onRevertSnapshot,
}: VersionControlDialogProps) {
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(-1);
  const [milestoneName, setMilestoneName] = React.useState("");

  React.useEffect(() => {
    if (!vcs) return;
    const update = () => {
      setHistory(vcs.getHistory());
      setCurrentIndex(vcs.getCurrentIndex());
    };
    update();
    return vcs.subscribe(update);
  }, [vcs, open]);

  const handleUndo = () => {
    if (!vcs) return;
    const snap = vcs.undo();
    if (snap) {
      const entry = vcs.getCurrentEntry();
      onRevertSnapshot(snap, `Undid to: ${entry?.summary || "previous revision"}`);
    }
  };

  const handleRedo = () => {
    if (!vcs) return;
    const snap = vcs.redo();
    if (snap) {
      const entry = vcs.getCurrentEntry();
      onRevertSnapshot(snap, `Redid to: ${entry?.summary || "next revision"}`);
    }
  };

  const handleRevertTo = (entryId: string) => {
    if (!vcs) return;
    const targetEntry = history.find((h) => h.id === entryId);
    const snap = vcs.revertTo(entryId);
    if (snap && targetEntry) {
      onRevertSnapshot(snap, `Reverted Backlot to Slate: ${targetEntry.summary}`);
    }
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vcs || !milestoneName.trim()) return;
    vcs.createMilestone(milestoneName.trim());
    setMilestoneName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card/95 backdrop-blur border-border/80 p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="border-b border-border/70 p-5 bg-secondary/20 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 border border-accent/40 text-accent">
                <GitBranch className="h-4 w-4" />
              </div>
              <div>
                <SlateLabel>Project Backlot Version Control</SlateLabel>
                <DialogTitle className="font-heading text-lg font-bold text-foreground">
                  Slate Revision History & Takes
                </DialogTitle>
              </div>
            </div>

            {/* Quick Undo / Redo Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                disabled={!vcs?.canUndo()}
                className="h-8 gap-1.5 text-xs cursor-pointer"
                title="Undo last change (Cmd+Z)"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Undo</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRedo}
                disabled={!vcs?.canRedo()}
                className="h-8 gap-1.5 text-xs cursor-pointer"
                title="Redo next change (Cmd+Shift+Z)"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Redo</span>
              </Button>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Complete chronological audit log of all blueprint additions, wiring changes, dial tuning, and screenplay drafts.
            Click on any historical slate to rewind the live backlot graph.
          </DialogDescription>
        </div>

        {/* Milestone Creator Bar */}
        <form
          onSubmit={handleCreateMilestone}
          className="flex items-center gap-2 border-b border-border/60 bg-background/50 px-5 py-2.5"
        >
          <Tag className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <input
            type="text"
            placeholder="Commit a Named Milestone Take (e.g., 'Take 2: Noir Chiaroscuro Draft')..."
            value={milestoneName}
            onChange={(e) => setMilestoneName(e.target.value)}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none font-mono"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!milestoneName.trim()}
            className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shrink-0"
          >
            <Bookmark className="h-3 w-3" />
            <span>Tag Milestone Take</span>
          </Button>
        </form>

        {/* Reversible History Log List */}
        <div className="max-h-[420px] overflow-y-auto p-5 flex flex-col gap-2">
          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No backlot changes recorded yet in this session.
            </div>
          ) : (
            [...history].reverse().map((entry, reversedIndex) => {
              const originalIndex = history.length - 1 - reversedIndex;
              const isCurrent = originalIndex === currentIndex;
              const isFuture = originalIndex > currentIndex;
              const meta = CATEGORY_META[entry.category] || CATEGORY_META.initial;
              const Icon = meta.icon;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "group relative flex items-center justify-between gap-3 rounded-xl border p-3 transition-all",
                    isCurrent
                      ? "border-accent bg-accent/10 shadow-md ring-1 ring-accent/30"
                      : isFuture
                      ? "border-border/40 bg-card/40 opacity-60 hover:opacity-100"
                      : "border-border/70 bg-card/80 hover:bg-secondary/40 hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Category Icon Badge */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        meta.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-semibold text-foreground truncate">
                          {entry.summary}
                        </span>
                        {isCurrent && (
                          <Badge className="bg-accent text-accent-foreground text-[9px] py-0 px-1.5 uppercase font-mono tracking-wider">
                            HEAD (Active)
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={cn("text-[9px] py-0 px-1 font-mono uppercase", meta.color)}
                        >
                          {meta.label}
                        </Badge>
                      </div>

                      {entry.description && (
                        <p className="text-[11px] text-muted-foreground truncate leading-tight">
                          {entry.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/80 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{entry.displayTime}</span>
                        <span>·</span>
                        <span>{entry.snapshot.nodes?.length || 0} nodes</span>
                        <span>·</span>
                        <span>{entry.snapshot.edges?.length || 0} wires</span>
                      </div>
                    </div>
                  </div>

                  {/* Action: Revert / Jump to this revision */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isCurrent ? (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-accent font-semibold px-2 py-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Active Slate</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevertTo(entry.id)}
                        className="h-7 text-xs gap-1 border-border hover:border-accent hover:bg-accent/10 hover:text-accent cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Rewind to this Take</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 bg-secondary/30 px-5 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Active Slate: #{currentIndex + 1} of {history.length}</span>
            <span>·</span>
            <span>Hotkeys: <kbd className="rounded bg-secondary px-1 py-0.5 border border-border">Cmd+Z</kbd> / <kbd className="rounded bg-secondary px-1 py-0.5 border border-border">Cmd+Shift+Z</kbd></span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="h-7 text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
