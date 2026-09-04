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

async function getJson<TResponse>(path: string): Promise<TResponse> {
  const res = await fetch(`${AGENT_SERVICE_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
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

export interface CharacterProfile {
  name: string;
  archetype: string;
  speech_style?: string;
  subtext_ratio?: string;
}

export interface ShardScriptResponse {
  scene_title: string;
  scene_summary: string;
  characters: CharacterProfile[];
  events_written: number;
  events: StoryEvent[];
}

export function shardScript(projectId: string, screenplayText: string) {
  return postJson<ShardScriptResponse>("/sharding/shard", {
    project_id: projectId,
    screenplay_text: screenplayText,
  });
}

export function getProjectEvents(projectId: string) {
  return getJson<StoryEvent[]>(`/sharding/events/${encodeURIComponent(projectId)}`);
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

export interface KnowledgeStateResponse {
  character_name: string;
  current_timestamp: string;
  known_facts: KnowledgeFactOut[];
  query_sql: string;
}

export function getKnowledgeState(projectId: string, characterName: string, currentTimestamp: string) {
  const query = new URLSearchParams({
    project_id: projectId,
    character_name: characterName,
    current_timestamp: currentTimestamp,
  });
  return getJson<KnowledgeStateResponse>(`/hot-seat/knowledge?${query.toString()}`);
}

export interface HotSeatAskResponse {
  answer: string;
  known_facts: KnowledgeFactOut[];
  is_within_firewall?: boolean;
  query_sql?: string;
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

export interface ShowrunnerMessage {
  role: "user" | "showrunner";
  content: string;
}

export interface ShowrunnerChatRequest {
  projectTitle?: string;
  logline?: string;
  screenplayText?: string;
  characters?: string[];
  message: string;
  history?: ShowrunnerMessage[];
}

export interface ShowrunnerChatResponse {
  reply: string;
  suggested_actions: string[];
  clickhouse_query_sql?: string;
  precedents_cited?: Array<{
    genre: string;
    trope: string;
    historical_reference: string;
    tension_level: number;
    commercial_territory: string;
    audience_retention_pct: number;
    precedent_example: string;
  }>;
}

export function chatWithShowrunner(req: ShowrunnerChatRequest) {
  return postJson<ShowrunnerChatResponse>("/showrunner/chat", {
    project_title: req.projectTitle ?? "",
    logline: req.logline ?? "",
    screenplay_text: req.screenplayText ?? "",
    characters: req.characters ?? [],
    message: req.message,
    history: req.history ?? [],
  });
}

export interface CharacterRemapping {
  original_name: string;
  original_story: string;
  fused_role: string;
  alignment: string;
  speech_style: string;
  subtext_ratio: string;
}

export interface FusedTimelineEvent {
  character_name: string;
  event_timestamp: string;
  event_type: "known_fact" | "unaware_of" | "location" | "objective";
  content: string;
}

export interface FilmFusionRequest {
  title_a: string;
  script_a: string;
  title_b: string;
  script_b: string;
  fusion_directive?: string;
  fusion_project_id?: string;
}

export interface FilmFusionResponse {
  fusion_project_id: string;
  fused_title: string;
  fused_logline: string;
  character_remappings: CharacterRemapping[];
  reconciled_events: FusedTimelineEvent[];
  fused_screenplay: string;
  events_written_to_clickhouse: number;
}

export function fuseFilms(req: FilmFusionRequest) {
  return postJson<FilmFusionResponse>("/fusion/fuse", {
    title_a: req.title_a,
    script_a: req.script_a,
    title_b: req.title_b,
    script_b: req.script_b,
    fusion_directive: req.fusion_directive ?? "Combine these two worlds into a high-stakes crossover scene where the characters' secrets clash directly.",
    fusion_project_id: req.fusion_project_id ?? "fusion-crossover-demo",
  });
}

export interface PrecedentItem {
  genre: string;
  trope: string;
  historical_reference: string;
  tension_level: number;
  commercial_territory: string;
  audience_retention_pct: number;
  precedent_example: string;
}

export function getPrecedents(genre: string = "") {
  const query = genre ? `?genre=${encodeURIComponent(genre)}` : "";
  return getJson<PrecedentItem[]>(`/showrunner/precedents${query}`);
}



