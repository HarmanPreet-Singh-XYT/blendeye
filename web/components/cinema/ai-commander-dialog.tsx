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
import { Input } from "@/components/ui/input";
import { SlateLabel } from "@/components/cinema/slate-label";
import {
  Zap,
  Sparkles,
  Send,
  CheckCircle2,
  Brain,
  Sliders,
  RotateCcw,
  ArrowRight,
  Bot,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { CommanderExecutionResponse } from "@/lib/studio-actions";

export interface AICommanderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecutePrompt: (prompt: string) => Promise<CommanderExecutionResponse | null>;
}

const QUICK_DIRECTIVES = [
  "Add a rival double-agent named Viktor and wire him to Elena with Rivalry",
  "Crank Elena's subtext to 95% and verbal pacing to 85%",
  "Auto-tidy the entire backlot canvas into neat production lanes",
  "Rewrite the scene climax with a sudden power blackout",
  "Sever the wire connecting Elena and Marcus",
];

export function AICommanderDialog({
  open,
  onOpenChange,
  onExecutePrompt,
}: AICommanderDialogProps) {
  const [prompt, setPrompt] = React.useState("");
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<CommanderExecutionResponse | null>(null);
  const [lastError, setLastError] = React.useState<string | null>(null);

  const handleSubmit = async (commandToRun?: string) => {
    const text = (commandToRun || prompt).trim();
    if (!text || isExecuting) return;

    setIsExecuting(true);
    setLastResult(null);
    setLastError(null);

    try {
      const result = await onExecutePrompt(text);
      if (result) {
        setLastResult(result);
        setPrompt("");
      } else {
        setLastError("The Executive AI couldn't process that directive. Check that the agent-service backend is running and try again.");
      }
    } catch (err) {
      console.error("Commander execution failed:", err);
      setLastError(err instanceof Error ? err.message : "Commander execution failed unexpectedly.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-card/98 p-0 shadow-2xl backdrop-blur">
        {/* Header */}
        <DialogHeader className="border-b border-border/80 px-6 py-4 bg-secondary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shadow-sm">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                  Studio Executive AI Commander
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.2 text-[10px] font-mono text-emerald-400 font-medium">
                    ● Autonomous CRUD
                  </span>
                </DialogTitle>
                <SlateLabel>Omniscient Backlot Director &amp; Project Orchestrator</SlateLabel>
              </div>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Speak your vision. The Executive AI reasons step-by-step and performs live CRUD operations across characters, backlot wires, node dials, layout, and screenplay.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Input bar */}
          <div className="flex gap-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. 'Add rival Viktor, wire to Elena with rivalry, crank subtext to 95%, and tidy backlot'..."
              disabled={isExecuting}
              className="flex-1 bg-background text-sm h-11 border-border/80"
              autoFocus
            />
            <Button
              onClick={() => handleSubmit()}
              disabled={isExecuting || !prompt.trim()}
              className="h-11 px-5 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-semibold cursor-pointer shrink-0"
            >
              {isExecuting ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Execute</span>
                </>
              )}
            </Button>
          </div>

          {/* Error state — request failed or threw */}
          {lastError && !isExecuting && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-150">
              <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-foreground/90 leading-relaxed">
                <div className="font-semibold text-red-400 mb-0.5">Directive failed</div>
                {lastError}
              </div>
            </div>
          )}

          {/* Quick Presets */}
          {!lastResult && !lastError && !isExecuting && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Quick Executive Directives:
              </span>
              <div className="flex flex-col gap-1.5">
                {QUICK_DIRECTIVES.map((directive, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSubmit(directive)}
                    className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/60 hover:border-accent/40 text-xs text-foreground/80 hover:text-foreground transition-all text-left cursor-pointer group"
                  >
                    <span>&ldquo;{directive}&rdquo;</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-accent transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Execution Output */}
          {lastResult && (
            <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              {/* Degraded-mode warning */}
              {lastResult._fallback && (
                <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] font-mono text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Ran in degraded mode — the AI backend was unreachable, so this used a local
                    pattern-matching fallback instead of real reasoning.
                  </span>
                </div>
              )}

              {/* Thinking Reasoning */}
              {lastResult.thought_process && (
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
                    <Brain className="h-3.5 w-3.5 text-accent" />
                    <span>Executive Creative Reasoning</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap">
                    {lastResult.thought_process}
                  </p>
                </div>
              )}

              {/* Action Badges */}
              {lastResult.actions && lastResult.actions.length > 0 && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Mutations Executed on Backlot Canvas ({lastResult.actions.length})</span>
                  </div>
                  <div className="space-y-1">
                    {lastResult.actions.map((act, aIdx) => (
                      <div key={aIdx} className="text-xs font-mono text-foreground flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>
                          {act.type === "create_character" && `Created Character "${act.name}" (${act.archetype})`}
                          {act.type === "update_character" && `Updated Character "${act.name}" parameters`}
                          {act.type === "delete_character" && `Deleted Character "${act.name}"`}
                          {act.type === "connect_nodes" && `Wired "${act.source}" → "${act.target}" (${act.relationship || "Connection"})`}
                          {act.type === "sever_wire" && `Severed wire between "${act.source || act.edgeId}" and "${act.target || ""}"`}
                          {act.type === "create_node" && `Spawned "${act.nodeType}" node`}
                          {act.type === "delete_node" && `Deleted node "${act.nodeId}"`}
                          {act.type === "update_node_data" && `Modified node "${act.nodeId}" parameters`}
                          {act.type === "auto_tidy_backlot" && "Auto-aligned entire backlot production layout"}
                          {act.type === "update_screenplay" && `Updated screenplay draft: ${act.summary || "Full rewrite"}`}
                          {act.type === "update_scene_meta" && `Updated scene metadata`}
                          {act.type === "create_take_milestone" && `Created milestone take "${act.title}"`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Executive Response Message */}
              <div className="text-xs text-foreground/90 leading-relaxed pt-1">
                {lastResult.assistant_message}
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px] text-muted-foreground border-t border-border/40">
                <span className="font-mono">All mutations protected by Version Control (<kbd className="bg-secondary px-1 py-0.5 rounded text-[10px]">Cmd+Z</kbd> to undo)</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-7 text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
