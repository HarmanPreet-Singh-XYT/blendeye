"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlateLabel } from "@/components/cinema/slate-label";
import { SendIcon, Sparkles, Bot } from "lucide-react";
import type { ShowrunnerMessage } from "@/lib/agent-service";

interface ShowrunnerChatProps {
  messages: ShowrunnerMessage[];
  onSendMessage: (msg: string) => void;
  isThinking: boolean;
  suggestedPrompts?: string[];
  className?: string;
}

export function ShowrunnerChat({
  messages,
  onSendMessage,
  isThinking,
  suggestedPrompts = [
    "Critique this scene's dramatic tension",
    "How can we heighten Elena's subtext?",
    "Check continuity: What does Marcus know right now?",
    "Suggest a sharper reversal for the scene climax",
  ],
  className,
}: ShowrunnerChatProps) {
  const [draft, setDraft] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isThinking]);

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed || isThinking) return;
    onSendMessage(trimmed);
    setDraft("");
  };

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border border-border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-secondary/30">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-accent" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Showrunner AI</span>
            <SlateLabel>Omniscient Writers&apos; Room Co-Pilot</SlateLabel>
          </div>
        </div>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] text-accent font-medium">
          Gemini 3.7
        </span>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground space-y-2">
            <div className="h-8 w-8 mx-auto rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <p className="font-medium text-foreground text-sm">Writers&apos; Room Assistant Ready</p>
            <p className="max-w-xs mx-auto leading-relaxed">
              Ask for script critiques, dialogue subtext adjustments, continuity sentry checks, or alternate twists.
            </p>
          </div>
        )}

        {messages.map((msg, idx) =>
          msg.role === "user" ? (
            <div key={idx} className="flex justify-end">
              <div className="max-w-[85%] rounded-lg bg-accent text-accent-foreground px-3.5 py-2 text-xs leading-relaxed">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={idx} className="flex justify-start">
              <div className="max-w-[90%] rounded-lg border border-border bg-secondary/30 px-3.5 py-2.5 text-xs leading-relaxed space-y-2 text-foreground/90 whitespace-pre-wrap">
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">
                  SHOWRUNNER
                </span>
                {msg.content}
              </div>
            </div>
          )
        )}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-accent animate-pulse py-2">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>Showrunner is analyzing the screenplay and character arcs...</span>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {suggestedPrompts.length > 0 && !isThinking && (
        <div className="border-t border-border/50 bg-secondary/15 px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
            Director Commands
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSendMessage(p)}
                className="rounded border border-border/80 bg-background/80 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-accent transition-colors text-left"
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={draft}
          disabled={isThinking}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Direct the showrunner (e.g. 'Make Elena more menacing', 'Critique the pacing')..."
          className="flex-1 text-xs"
        />
        <Button size="icon" aria-label="Send command" disabled={isThinking || !draft.trim()} onClick={submit}>
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
