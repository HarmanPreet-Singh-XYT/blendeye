"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlateLabel } from "@/components/cinema/slate-label";
import { MarkdownRenderer } from "@/components/cinema/markdown-renderer";
import {
  SendIcon,
  Sparkles,
  Bot,
  User,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Brain,
  Sliders,
  Scissors,
  Link2,
  FileText,
  UserPlus,
  LayoutGrid,
  Database,
  AlertTriangle,
} from "lucide-react";
import type { CitedPrecedent, StudioAction } from "@/lib/studio-actions";

export interface ExtendedShowrunnerMessage {
  id?: string;
  role: "user" | "showrunner";
  content: string;
  thought_process?: string;
  actions?: StudioAction[];
  execution_summaries?: string[];
  precedents_cited?: CitedPrecedent[];
  is_fallback?: boolean;
}

export interface ShowrunnerChatProps {
  messages: ExtendedShowrunnerMessage[];
  onSendMessage: (msg: string) => void;
  isThinking: boolean;
  suggestedPrompts?: string[];
  className?: string;
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  placeholder?: string;
  hideHeader?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export function ShowrunnerChat({
  messages,
  onSendMessage,
  isThinking,
  suggestedPrompts = [
    "Replace Scene 1 with a midnight rooftop interrogation",
    "Replace Marcus with a cyber-specialist named Kael",
    "Change film title to 'Shadow Protocol' and genre to Cyber Noir",
    "Introduce a rival cyber-agent named Viktor and wire him to Elena with Rivalry",
    "Crank Elena's subtext to 95% and verbal pacing to 85%",
    "Auto-tidy the entire backlot canvas into production columns",
  ],
  title = "Studio Executive AI",
  subtitle = "Omniscient Writers' Room & Backlot Commander",
  badgeLabel = "Live CRUD Mode",
  placeholder = "Command the Studio Executive (e.g. 'Add rival Viktor, wire to Elena, crank subtext to 95%')...",
  hideHeader = false,
  emptyStateTitle = "Centralized Studio Executive AI Ready",
  emptyStateDescription = "Give any natural language command. The AI will reason step-by-step and autonomously execute CRUD mutations across nodes, wires, characters, dials, and screenplays.",
  className,
}: ShowrunnerChatProps) {
  const [draft, setDraft] = React.useState("");
  const [openThoughts, setOpenThoughts] = React.useState<Record<number, boolean>>({});
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, isThinking]);

  const toggleThought = (idx: number) => {
    setOpenThoughts((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed || isThinking) return;
    onSendMessage(trimmed);
    setDraft("");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      {/* Header */}
      {!hideHeader && (
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5 bg-secondary/30">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-sm">
              <Zap className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{title}</span>
                <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.2 text-[9px] font-mono font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {badgeLabel}
                </span>
              </div>
              <SlateLabel>{subtitle}</SlateLabel>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] text-accent font-mono font-medium">
              Gemini 3.7 / 2.5
            </span>
          </div>
        </div>
      )}

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shadow-lg">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-foreground text-sm">
                {emptyStateTitle}
              </p>
              <p className="max-w-md mx-auto mt-1 leading-relaxed text-muted-foreground">
                {emptyStateDescription}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) =>
          msg.role === "user" ? (
            <div key={idx} className="flex justify-end">
              <div className="max-w-[85%] rounded-lg bg-accent/15 border border-accent/30 text-foreground px-3.5 py-2 text-xs leading-relaxed shadow-sm">
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-accent font-medium justify-end">
                  <span>DIRECTOR DIRECTIVE</span>
                  <User className="h-3 w-3" />
                </div>
                <div className="font-medium">{msg.content}</div>
              </div>
            </div>
          ) : (
            <div key={idx} className="flex justify-start">
              <div className="max-w-[94%] w-full rounded-lg border border-border bg-secondary/25 hover:bg-secondary/35 transition-colors px-4 py-3 text-xs leading-relaxed space-y-3 text-foreground/90 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-accent" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold">
                      STUDIO EXECUTIVE
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {msg.execution_summaries && msg.execution_summaries.length > 0
                      ? `${msg.execution_summaries.length} Mutation${msg.execution_summaries.length > 1 ? "s" : ""} Executed`
                      : msg.actions && msg.actions.length > 0
                      ? "Proposed — Nothing Matched"
                      : "Analysis & Critique"}
                  </span>
                </div>

                {/* Degraded-mode warning: Gemini/agent-service was unreachable, this ran on the local regex fallback */}
                {msg.is_fallback && (
                  <div className="flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[10px] font-mono text-amber-400">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span>
                      Ran in degraded mode — the AI backend was unreachable, so this used a local
                      pattern-matching fallback instead of real reasoning.
                    </span>
                  </div>
                )}

                {/* Collapsible Chain-of-Thought / Creative Rationale */}
                {msg.thought_process && (
                  <div className="rounded border border-border/60 bg-background/50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleThought(idx)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors text-left"
                    >
                      <span className="flex items-center gap-1.5 text-accent">
                        <Brain className="h-3 w-3" />
                        <span>AI Executive Thinking &amp; Reasoning</span>
                      </span>
                      {openThoughts[idx] ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                    {openThoughts[idx] && (
                      <div className="px-2.5 py-2 border-t border-border/40 text-[11px] text-muted-foreground/90 leading-relaxed font-mono bg-card/40 whitespace-pre-wrap">
                        {msg.thought_process}
                      </div>
                    )}
                  </div>
                )}

                {/* ClickHouse Precedent Grounding */}
                {msg.precedents_cited && msg.precedents_cited.length > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      <Database className="h-3.5 w-3.5 text-amber-400" />
                      <span>ClickHouse Precedent Grounding</span>
                    </div>
                    <div className="space-y-1">
                      {msg.precedents_cited.map((p, pIdx) => (
                        <div key={pIdx} className="text-[11px] text-foreground/90 font-mono">
                          <span className="text-amber-400">{p.historical_reference}</span>
                          {" · "}
                          {p.trope} · {p.audience_retention_pct}% retention ({p.commercial_territory})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Executed Live CRUD Operations Banner */}
                {msg.execution_summaries && msg.execution_summaries.length > 0 && (
                  <div className="rounded-lg border border-border bg-background/60 p-2.5 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      <span>Live Project Mutations Executed ({msg.execution_summaries.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {msg.execution_summaries.map((summary, sIdx) => {
                        const isDelete = summary.toLowerCase().includes("deleted") || summary.toLowerCase().includes("removed") || summary.toLowerCase().includes("severed");
                        const isReplace = summary.toLowerCase().includes("replaced");
                        const isCreate = summary.toLowerCase().includes("created") || summary.toLowerCase().includes("spawned") || summary.toLowerCase().includes("added");
                        const badgeColor = isDelete
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          : isReplace
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : isCreate
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-secondary text-foreground/80 border-border";

                        return (
                          <div
                            key={sIdx}
                            className="flex items-center gap-2 text-[11px] text-foreground font-mono"
                          >
                            <span className={cn("px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border tracking-wider", badgeColor)}>
                              {isDelete ? "DEL" : isReplace ? "REPLACE" : isCreate ? "ADD" : "UPDATE"}
                            </span>
                            <span className="truncate">{summary}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Conversational Assistant Reply */}
                <div className="prose prose-invert max-w-none text-xs leading-relaxed">
                  <MarkdownRenderer content={msg.content} />
                </div>
              </div>
            </div>
          )
        )}

        {isThinking && (
          <div className="flex items-center gap-2.5 text-xs text-accent animate-pulse py-2 px-1">
            <Sparkles className="h-4 w-4 animate-spin text-accent" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">Studio Executive is analyzing prompt &amp; deciding actions...</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Reasoning narrative arc · formulating CRUD mutations
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {suggestedPrompts.length > 0 && !isThinking && (
        <div className="shrink-0 border-t border-border/50 bg-secondary/15 px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1 font-mono">
            Executive Directives (Click to Execute)
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {suggestedPrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSendMessage(p)}
                className="rounded border border-border/80 bg-background/80 px-2 py-1 text-[10.5px] text-muted-foreground hover:text-foreground hover:border-accent hover:bg-accent/10 transition-colors text-left font-sans cursor-pointer"
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 flex items-center gap-2 border-t border-border p-2.5 bg-background/50">
        <Input
          value={draft}
          disabled={isThinking}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={placeholder}
          className="flex-1 text-xs sm:text-sm h-9 bg-card"
        />
        <Button
          size="sm"
          className="h-9 px-3 shrink-0 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
          aria-label="Send command"
          disabled={isThinking || !draft.trim()}
          onClick={submit}
        >
          <SendIcon className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold hidden sm:inline">Execute</span>
        </Button>
      </div>
    </div>
  );
}
