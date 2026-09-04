/**
 * Server-side-only client for the Python/FastAPI agent-service sidecar.
 * Never imported from client components — Next.js API routes proxy to
 * this so the agent-service URL (and any future auth to it) stays off
 * the browser network tab. See ../../plan.md for the two-service split.
 */

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL ?? "http://localhost:8000";

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const res = await fetch(`${AGENT_SERVICE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`agent-service ${path} failed (${res.status}): ${detail}`);
  }

  return res.json() as Promise<TResponse>;
}

export interface GenerateScriptResponse {
  screenplay_text: string;
}

export function generateScript(premise: string) {
  return postJson<GenerateScriptResponse>("/script/generate", { premise });
}

export interface StoryEvent {
  project_id: string;
  character_name: string;
  event_timestamp: string;
  event_type: "known_fact" | "unaware_of" | "location" | "objective";
  content: string;
}

export interface ShardScriptResponse {
  events_written: number;
  events: StoryEvent[];
}

export function shardScript(projectId: string, screenplayText: string) {
  return postJson<ShardScriptResponse>("/sharding/shard", {
    project_id: projectId,
    screenplay_text: screenplayText,
  });
}

export interface HotSeatTurnIn {
  role: "interviewer" | "character";
  content: string;
}

export interface HotSeatAskRequest {
  projectId: string;
  characterName: string;
  currentTimestamp: string;
  question: string;
  physicalLocation?: string;
  activeObjective?: string;
  speechStyle?: string;
  subtextRatio?: string;
  priorTurns?: HotSeatTurnIn[];
}

export interface KnowledgeFactOut {
  content: string;
  type: "known_fact" | "unaware_of";
}

export interface HotSeatAskResponse {
  answer: string;
  known_facts: KnowledgeFactOut[];
}

export function askHotSeat(req: HotSeatAskRequest) {
  return postJson<HotSeatAskResponse>("/hot-seat/ask", {
    project_id: req.projectId,
    character_name: req.characterName,
    current_timestamp: req.currentTimestamp,
    question: req.question,
    physical_location: req.physicalLocation ?? "",
    active_objective: req.activeObjective ?? "",
    speech_style: req.speechStyle ?? "naturalistic",
    subtext_ratio: req.subtextRatio ?? "moderate",
    prior_turns: req.priorTurns ?? [],
  });
}
