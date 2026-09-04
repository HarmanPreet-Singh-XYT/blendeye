"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlateLabel } from "@/components/cinema/slate-label";
import { SendIcon } from "lucide-react";

export interface HotSeatTurn {
  role: "interviewer" | "character";
  content: string;
  /** Set true when the character's answer is knowingly bounded by the
   * firewall — i.e. it does not know something the audience knows. Renders
   * a visible "withholding" tag rather than relying on text tone alone. */
  isWithinFirewall?: boolean;
}

export interface KnowledgeFact {
  content: string;
  type: "known_fact" | "unaware_of";
}

/**
 * HotSeatChat — the time-gated character interrogation surface. Deliberately
 * NOT a generic chat UI: character turns render as screenplay dialogue
 * blocks (centered caps name, indented dialogue) so the product reads as a
 * script tool, not a chatbot. The KnowledgeFact strip above the input is
 * the visible "tell" for the time-gate mechanic — a director watching the
 * facts list change as the timeline scrubs sees the mechanism working
 * before the character even answers.
 */
function HotSeatChat({
  characterName,
  currentTimecode,
  knownFacts,
  turns,
  onSend,
  className,
}: {
  characterName: string;
  currentTimecode: string;
  knownFacts: KnowledgeFact[];
  turns: HotSeatTurn[];
  onSend: (message: string) => void;
  className?: string;
}) {
  const [draft, setDraft] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns.length]);

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  };

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border border-border bg-card", className)}>
      {/* header — interrogation slate */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{characterName}</span>
          <SlateLabel>Hot seat</SlateLabel>
        </div>
        <span className="timecode text-sm">{currentTimecode}</span>
      </div>

      {/* knowledge-state strip — the time-gate mechanic made visible */}
      <div className="flex flex-wrap gap-1.5 border-b border-border bg-secondary/40 px-4 py-2.5">
        {knownFacts.length === 0 && (
          <span className="text-xs text-muted-foreground">No established knowledge yet at this timestamp.</span>
        )}
        {knownFacts.map((f, i) => (
          <span
            key={i}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] leading-relaxed transition-colors",
              f.type === "known_fact"
                ? "border-success/30 bg-success/10 text-success"
                : "border-border bg-muted text-muted-foreground line-through decoration-muted-foreground/40"
            )}
          >
            {f.content}
          </span>
        ))}
      </div>

      {/* transcript — screenplay-block formatting, not chat bubbles */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto flex max-w-md flex-col gap-5">
          {turns.map((turn, i) =>
            turn.role === "interviewer" ? (
              <p key={i} className="text-sm text-muted-foreground">
                <span className="slate-label mr-2 align-middle">Q</span>
                {turn.content}
              </p>
            ) : (
              <div key={i} className="flex flex-col items-center gap-1 text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
                  {characterName}
                  {turn.isWithinFirewall && (
                    <span className="ml-2 rounded-full border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[9px] font-normal normal-case tracking-normal text-warning align-middle">
                      bounded by knowledge state
                    </span>
                  )}
                </span>
                <p className="max-w-sm text-sm leading-relaxed text-foreground/90">
                  {turn.content}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* input */}
      <div className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={`Ask ${characterName} something...`}
          className="flex-1"
        />
        <Button size="icon" aria-label="Send" onClick={submit}>
          <SendIcon />
        </Button>
      </div>
    </div>
  );
}

export { HotSeatChat };
