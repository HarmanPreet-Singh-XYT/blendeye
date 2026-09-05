"use client";

import * as React from "react";
import type { Edge, Node } from "@xyflow/react";
import { StoryCanvas } from "@/components/cinema/story-canvas";
import {
  TimelineScrubber,
  type StoryEventMarker,
} from "@/components/cinema/timeline-scrubber";
import {
  HotSeatChat,
  type HotSeatTurn,
  type KnowledgeFact,
} from "@/components/cinema/hot-seat-chat";
import { formatTimecode } from "@/components/cinema/timeline-scrubber";

const DURATION_SECONDS = 90 * 60; // 90-minute feature runtime

const initialNodes: Node[] = [
  {
    id: "inspiration-1",
    type: "inspiration",
    position: { x: 0, y: 120 },
    data: { title: "Heist crew splits up after a job goes wrong", state: "ready" },
  },
  {
    id: "scene-4",
    type: "scene",
    position: { x: 320, y: 0 },
    data: {
      title: "The Vault — Scene 04",
      state: "ready",
      summary: "Marcus realizes the keys are gone. Tension breaks the crew's trust.",
      characterCount: 3,
    },
  },
  {
    id: "character-marcus",
    type: "character",
    position: { x: 680, y: -80 },
    data: { name: "Marcus", state: "ready", archetype: "Getaway driver, loyal but rattles easily" },
  },
  {
    id: "character-elena",
    type: "character",
    position: { x: 680, y: 40 },
    data: { name: "Elena", state: "ready", archetype: "Planner, trusts no one fully" },
  },
  {
    id: "character-teo",
    type: "character",
    position: { x: 680, y: 160 },
    data: { name: "Teo", state: "generating", archetype: "Muscle, off-screen during the reveal" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "inspiration-1", target: "scene-4" },
  { id: "e2", source: "scene-4", target: "character-marcus" },
  { id: "e3", source: "scene-4", target: "character-elena" },
  {
    id: "e4",
    source: "scene-4",
    target: "character-teo",
    className: "generating",
  },
];

const EVENTS: StoryEventMarker[] = [
  { atSeconds: 28 * 60, characterName: "Marcus", eventType: "known_fact" },
  { atSeconds: 34 * 60, characterName: "Elena", eventType: "unaware_of" },
  { atSeconds: 52 * 60, characterName: "Marcus", eventType: "known_fact" },
  { atSeconds: 61 * 60, characterName: "Teo", eventType: "location" },
];

const KNOWLEDGE_AT_34: KnowledgeFact[] = [
  { content: "The vault code was Elena's idea", type: "known_fact" },
  { content: "He was responsible for the keys", type: "known_fact" },
  { content: "Marcus lost the keys near the tunnel", type: "unaware_of" },
];

const KNOWLEDGE_AT_52: KnowledgeFact[] = [
  { content: "The vault code was Elena's idea", type: "known_fact" },
  { content: "Marcus lost the keys near the tunnel", type: "known_fact" },
  { content: "Elena saw him drop them", type: "known_fact" },
];

const TURNS_AT_34: HotSeatTurn[] = [
  { role: "interviewer", content: "Do you know who has the keys?" },
  {
    role: "character",
    content: "Marcus has them. He showed them to me before we split up.",
    isWithinFirewall: true,
  },
];

const TURNS_AT_52: HotSeatTurn[] = [
  { role: "interviewer", content: "Do you know who has the keys?" },
  { role: "character", content: "Marcus betrayed us. The vault was empty when I arrived." },
];

export default function CanvasDemoPage() {
  const [timeSeconds, setTimeSeconds] = React.useState(34 * 60);
  const [extraTurns34, setExtraTurns34] = React.useState<HotSeatTurn[]>([]);
  const [extraTurns52, setExtraTurns52] = React.useState<HotSeatTurn[]>([]);
  const [isAsking, setIsAsking] = React.useState(false);

  const atOrAfter52 = timeSeconds >= 52 * 60;
  const knownFacts = atOrAfter52 ? KNOWLEDGE_AT_52 : KNOWLEDGE_AT_34;
  const baseTurns = atOrAfter52 ? TURNS_AT_52 : TURNS_AT_34;
  const extraTurns = atOrAfter52 ? extraTurns52 : extraTurns34;
  const turns = [...baseTurns, ...extraTurns];

  const handleSend = async (message: string) => {
    const text = message.trim();
    if (!text || isAsking) return;

    setIsAsking(true);
    const userTurn: HotSeatTurn = { role: "interviewer", content: text };
    if (atOrAfter52) {
      setExtraTurns52((prev) => [...prev, userTurn]);
    } else {
      setExtraTurns34((prev) => [...prev, userTurn]);
    }

    const timecode = formatTimecode(timeSeconds);

    try {
      const res = await fetch("/api/hot-seat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "vault-heist-demo",
          characterName: "Elena",
          currentTimestamp: timecode,
          question: text,
          speechStyle: "Sharp, guarded, high subtext",
          subtextRatio: "high",
          priorTurns: turns.map((t) => ({ role: t.role, content: t.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const characterTurn: HotSeatTurn = {
          role: "character",
          content: data.answer,
          isWithinFirewall: data.is_within_firewall,
        };
        if (atOrAfter52) {
          setExtraTurns52((prev) => [...prev, characterTurn]);
        } else {
          setExtraTurns34((prev) => [...prev, characterTurn]);
        }
        setIsAsking(false);
        return;
      }
    } catch {
      // Backend unreachable or offline, generate contextual local answer respecting time firewall
    }

    // Local in-character fallback response adhering to timeline knowledge firewall
    let reply = "";
    let isWithinFirewall = true;

    if (atOrAfter52) {
      if (text.toLowerCase().includes("key") || text.toLowerCase().includes("marcus")) {
        reply = "Marcus dropped them right before the service tunnel door. I saw it myself. He didn't lose them — he threw them.";
      } else {
        reply = "Look around us. The perimeter is sealed and Marcus is gone. Whatever we had planned is over.";
      }
    } else {
      if (text.toLowerCase().includes("drop") || text.toLowerCase().includes("betray") || text.toLowerCase().includes("tunnel")) {
        reply = "What are you talking about? Marcus is holding the extraction point right now. Stick to the timeline.";
        isWithinFirewall = false; // Director asked about future event unknown to Elena yet
      } else if (text.toLowerCase().includes("key")) {
        reply = "Marcus has the bypass keys in his jacket. He showed them to me five minutes ago at the loading dock.";
      } else {
        reply = "We have five minutes before the security rotation. Ask what you need to ask and let's move.";
      }
    }

    const fallbackTurn: HotSeatTurn = {
      role: "character",
      content: reply,
      isWithinFirewall,
    };

    if (atOrAfter52) {
      setExtraTurns52((prev) => [...prev, fallbackTurn]);
    } else {
      setExtraTurns34((prev) => [...prev, fallbackTurn]);
    }
    setIsAsking(false);
  };

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <span className="slate-label">Layer 0 — Custom Interaction Reference</span>
        <h1 className="text-xl font-semibold tracking-tight">
          Story Canvas · Timeline Scrubber · Hot Seat
        </h1>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="min-h-0 flex-1">
            <StoryCanvas nodes={initialNodes} edges={initialEdges} />
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <TimelineScrubber
              durationSeconds={DURATION_SECONDS}
              value={timeSeconds}
              onChange={setTimeSeconds}
              events={EVENTS}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Scrub to {formatTimecode(34 * 60)} vs {formatTimecode(52 * 60)} — Elena&apos;s
              knowledge state and hot-seat answer both change with the timeline.
            </p>
          </div>
        </div>

        <HotSeatChat
          characterName="Elena"
          characterArchetype="Planner, trusts no one fully"
          currentTimecode={formatTimecode(timeSeconds)}
          knownFacts={knownFacts}
          turns={turns}
          onSend={handleSend}
          isAsking={isAsking}
          suggestedQuestions={[
            "Do you know who has the keys?",
            "What happened at the service tunnel?",
            "Can we trust Marcus right now?",
          ]}
        />
      </div>
    </div>
  );
}
