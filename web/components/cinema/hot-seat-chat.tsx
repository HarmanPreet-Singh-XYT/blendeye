"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlateLabel } from "@/components/cinema/slate-label";
import { MarkdownRenderer } from "@/components/cinema/markdown-renderer";
import { SendIcon, FilePlus, Check } from "lucide-react";

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

function cleanDialogueQuotes(content: string) {
  let text = content.trim();
  if (
    (text.startsWith('"') && text.endsWith('"') && text.length > 1) ||
    (text.startsWith('“') && text.endsWith('”') && text.length > 1) ||
    (text.startsWith("'") && text.endsWith("'") && text.length > 1)
  ) {
    text = text.slice(1, -1).trim();
  }
  return text;
}

/**
 * HotSeatChat — the time-gated character interrogation surface. Deliberately
 * NOT a generic chat UI: character turns render as screenplay dialogue
 * blocks (centered caps name, indented dialogue) with rich markdown support.
 * The KnowledgeFact strip above the input is the visible "tell" for the time-gate
 * mechanic — a director watching the facts list change as the timeline scrubs sees
 * the mechanism working before the character even answers.
 */
function HotSeatChat({
  characterName,
  characterArchetype,
  currentTimecode,
  knownFacts,
  turns,
  onSend,
  onInsertIntoScript,
  isAsking = false,
  suggestedQuestions = [],
  className,
  activeSceneTitle,
  isCastPresentInScene,
}: {
  characterName: string;
  characterArchetype?: string;
  currentTimecode: string;
  knownFacts: KnowledgeFact[];
  turns: HotSeatTurn[];
  onSend: (message: string) => void;
  onInsertIntoScript?: (characterName: string, dialogue: string) => void;
  isAsking?: boolean;
  suggestedQuestions?: string[];
  className?: string;
  activeSceneTitle?: string;
  isCastPresentInScene?: boolean;
}) {
  const [draft, setDraft] = React.useState("");
  const [insertedIndex, setInsertedIndex] = React.useState<number | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [turns.length, isAsking]);

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed || isAsking) return;
    onSend(trimmed);
    setDraft("");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      {/* header — interrogation slate */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5 bg-secondary/30">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{characterName}</span>
            <SlateLabel>Hot seat</SlateLabel>
            {activeSceneTitle && (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors flex items-center gap-1.5",
                  isCastPresentInScene === false
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                )}
                title={
                  isCastPresentInScene === false
                    ? `${characterName} is NOT present in "${activeSceneTitle}". Knowledge is bounded by the asymmetric firewall.`
                    : `${characterName} is actively present in "${activeSceneTitle}".`
                }
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isCastPresentInScene === false ? "bg-amber-400" : "bg-emerald-400 animate-pulse"
                  )}
                />
                {isCastPresentInScene === false ? `Off-Stage (${activeSceneTitle})` : `In Scene: ${activeSceneTitle}`}
              </span>
            )}
          </div>
          {characterArchetype && (
            <span className="text-xs text-muted-foreground line-clamp-1">{characterArchetype}</span>
          )}
        </div>
        <span className="timecode text-xs sm:text-sm font-mono">{currentTimecode}</span>
      </div>

      {/* knowledge-state strip — the time-gate mechanic made visible */}
      <div className="flex shrink-0 flex-wrap gap-1.5 border-b border-border bg-secondary/40 px-4 py-2 max-h-24 overflow-y-auto">
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
            title={f.type === "known_fact" ? "Witnessed / Known fact" : "CRITICAL FIREWALL: Character unaware"}
          >
            {f.type === "known_fact" ? "✓ " : "⊘ "}
            {f.content}
          </span>
        ))}
      </div>

      {/* transcript — screenplay-block formatting with internal scrolling */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {turns.length === 0 && (
            <div className="my-auto py-8 text-center text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1 text-sm">Interrogation Ready</p>
              <p>Scrub the timeline to change {characterName}&apos;s knowledge state, then interrogate them.</p>
            </div>
          )}

          {turns.map((turn, i) =>
            turn.role === "interviewer" ? (
              <div key={i} className="flex items-start gap-2.5 max-w-xl self-start text-left">
                <span className="rounded bg-accent/20 border border-accent/40 text-accent font-mono text-[10px] font-bold px-1.5 py-0.5 mt-0.5 shrink-0">
                  Q
                </span>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-secondary/40 border border-border/60 rounded-lg px-3 py-1.5">
                  {turn.content}
                </p>
              </div>
            ) : (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 text-center bg-secondary/25 hover:bg-secondary/35 transition-colors p-3.5 rounded-lg border border-border/60 shadow-sm"
              >
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-xs font-semibold uppercase tracking-widest text-foreground font-mono">
                    {characterName}
                  </span>
                  {turn.isWithinFirewall && (
                    <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[9px] font-normal normal-case tracking-normal text-warning">
                      bounded by knowledge state
                    </span>
                  )}
                </div>

                {(() => {
                  const clean = cleanDialogueQuotes(turn.content);
                  const isPrefixed =
                    clean.startsWith('"') ||
                    clean.startsWith('“') ||
                    clean.startsWith('*') ||
                    clean.startsWith('(');
                  const displayContent = isPrefixed ? clean : `"${clean}"`;

                  return (
                    <div className="w-full max-w-xl text-left md:text-center text-xs sm:text-sm leading-relaxed text-foreground/90 font-serif italic py-1">
                      <MarkdownRenderer content={displayContent} />
                    </div>
                  );
                })()}

                {onInsertIntoScript && (
                  <button
                    type="button"
                    onClick={() => {
                      const clean = cleanDialogueQuotes(turn.content);
                      onInsertIntoScript(characterName, clean);
                      setInsertedIndex(i);
                      setTimeout(() => setInsertedIndex(null), 2500);
                    }}
                    className="mt-1 flex items-center gap-1.5 text-[11px] text-accent/90 hover:text-accent hover:underline transition-colors cursor-pointer"
                  >
                    {insertedIndex === i ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Inserted into Script!</span>
                      </>
                    ) : (
                      <>
                        <FilePlus className="h-3 w-3" />
                        <span>Insert into Script Draft</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          )}

          {isAsking && (
            <div className="flex flex-col items-center gap-2 text-center py-3 animate-pulse">
              <span className="text-xs uppercase tracking-widest text-accent font-medium font-mono">
                {characterName} is responding from memory...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* suggested questions quick-chips */}
      {suggestedQuestions.length > 0 && !isAsking && (
        <div className="shrink-0 border-t border-border/50 bg-card/50 px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1 font-mono">
            Suggested Interrogations
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSend(q)}
                className="text-left rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs text-secondary-foreground hover:border-accent hover:bg-accent/10 transition-colors"
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* input */}
      <div className="shrink-0 flex items-center gap-2 border-t border-border p-2.5 bg-background/50">
        <Input
          value={draft}
          disabled={isAsking}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={`Ask ${characterName} something...`}
          className="flex-1 text-xs sm:text-sm h-9 bg-card"
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0"
          aria-label="Send"
          disabled={isAsking || !draft.trim()}
          onClick={submit}
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { HotSeatChat };
