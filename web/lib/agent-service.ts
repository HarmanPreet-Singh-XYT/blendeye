/**
 * Server-side-only client for the Python/FastAPI agent-service sidecar.
 * Never imported from client components — Next.js API routes proxy to
 * this so the agent-service URL (and any future auth to it) stays off
 * the browser network tab. See ../../plan.md for the two-service split.
 */

import type {
  LocationCandidate,
  LocationCluster,
  SupportedCurrency,
  BudgetCapPolicy,
} from "./project-store";

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL ?? "http://localhost:8000";

// Long enough for a real Gemini/Veo call, short enough that a hung backend
// doesn't leave the UI (and the user) stuck forever with no feedback.
const DEFAULT_TIMEOUT_MS = 45_000;

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

async function postJson<TResponse>(
  path: string,
  body: unknown,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<TResponse> {
  let res: Response;
  try {
    res = await fetch(`${AGENT_SERVICE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: withTimeout(timeoutMs),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error(`agent-service ${path} timed out after ${timeoutMs}ms`);
    }
    throw new Error(`agent-service ${path} unreachable: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`agent-service ${path} failed (${res.status}): ${detail}`);
  }

  return res.json() as Promise<TResponse>;
}

async function getJson<TResponse>(
  path: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<TResponse> {
  let res: Response;
  try {
    res = await fetch(`${AGENT_SERVICE_URL}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: withTimeout(timeoutMs),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error(`agent-service ${path} timed out after ${timeoutMs}ms`);
    }
    throw new Error(`agent-service ${path} unreachable: ${err instanceof Error ? err.message : String(err)}`);
  }

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

export interface RewriteSceneRequest {
  sceneText: string;
  directorStyle: string;
  subtextRatio?: string;
  pacingBpm?: number;
  cameraMovement?: string;
}

export interface RewriteSceneResponse {
  rewritten_scene: string;
}

export function rewriteScene(req: RewriteSceneRequest) {
  return postJson<RewriteSceneResponse>("/script/rewrite", {
    scene_text: req.sceneText,
    director_style: req.directorStyle,
    subtext_ratio: req.subtextRatio ?? "moderate",
    pacing_bpm: req.pacingBpm ?? 80,
    camera_movement: req.cameraMovement ?? "Standard coverage",
  });
}

export interface MultiverseTakeOut {
  id: string;
  take_label: string;
  director_style: string;
  pov_character: string;
  tone: string;
  pacing_bpm: number;
  subtext_ratio: string;
  camera_movement: string;
  synopsis: string;
  rewritten_scene: string;
}

export interface MultiverseTakesRequest {
  sceneText: string;
  characters?: string[];
  projectTitle?: string;
  count?: number;
  customDirection?: string;
}

export interface MultiverseTakesResponse {
  takes: MultiverseTakeOut[];
  _fallback?: boolean;
  _error?: string;
  _cached?: boolean;
}

export function generateMultiverseTakes(req: MultiverseTakesRequest) {
  return postJson<MultiverseTakesResponse>("/script/multiverse", {
    scene_text: req.sceneText,
    characters: req.characters || [],
    project_title: req.projectTitle || "Feature Film",
    count: req.count || 3,
    custom_direction: req.customDirection || "",
  });
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
  scenes?: any[];
  activeSceneId?: string;
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
    scenes: req.scenes ?? [],
    active_scene_id: req.activeSceneId ?? "",
  });
}

export interface ExecuteDirectiveRequest {
  userPrompt: string;
  projectTitle?: string;
  logline?: string;
  genre?: string;
  directorStyle?: string;
  screenplayText?: string;
  characters?: any[];
  nodes?: any[];
  edges?: any[];
  history?: any[];
  scenes?: any[];
  activeSceneId?: string;
  events?: any[];
}

export function executeShowrunnerDirective(req: ExecuteDirectiveRequest) {
  return postJson<any>("/showrunner/execute", {
    user_prompt: req.userPrompt,
    project_title: req.projectTitle ?? "",
    logline: req.logline ?? "",
    genre: req.genre ?? "",
    director_style: req.directorStyle ?? "",
    screenplay_text: req.screenplayText ?? "",
    characters: req.characters ?? [],
    nodes: req.nodes ?? [],
    edges: req.edges ?? [],
    history: req.history ?? [],
    scenes: req.scenes ?? [],
    active_scene_id: req.activeSceneId ?? "",
    events: req.events ?? [],
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
  _fallback?: boolean;
  _error?: string;
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

export interface CharacterSynthesizeRequest {
  name: string;
  base_archetype: string;
  dream_actor: string;
  personality_dials?: Record<string, unknown>;
  behavioral_tics?: string[];
  additional_notes?: string;
}

export interface CharacterSynthesizeResponse {
  name: string;
  archetype: string;
  bio: string;
  dream_actor_comp: string;
  casting_reasoning?: string;
  alternate_casting_comp?: string;
  speech_style: string;
  subtext_ratio: string;
  flaw_and_blindspot: string;
  behavioral_tics: string[];
  suggested_tts_voice: string;
}

export function synthesizeCharacter(req: CharacterSynthesizeRequest) {
  return postJson<CharacterSynthesizeResponse>("/character/synthesize", req);
}

export interface EnsembleCharacter {
  name: string;
  role: string;
  archetype: string;
  dreamActorComp?: string;
  castingReasoning?: string;
  speechStyle: string;
  subtextRatio: string;
  confidence: number;
  verbalPacing: number;
  objective: string;
  quirks: string[];
}

export interface EnsembleSynthesizeRequest {
  genre?: string;
  premise?: string;
}

export interface EnsembleSynthesizeResponse {
  characters: EnsembleCharacter[];
}

export function synthesizeEnsemble(req: EnsembleSynthesizeRequest) {
  return postJson<EnsembleSynthesizeResponse>("/character/synthesize_ensemble", req);
}

export interface ChemistryTestRequest {
  char_a_name: string;
  char_a_dna: string;
  char_b_name: string;
  char_b_dna: string;
  scenario?: string;
}

export interface ChemistryTestResponse {
  scenario: string;
  micro_scene: string;
}

export function testChemistry(req: ChemistryTestRequest) {
  return postJson<ChemistryTestResponse>("/character/chemistry", req);
}

export interface TuneDialogueRequest {
  character_name: string;
  speech_style: string;
  subtext_ratio: string;
  raw_dialogue: string;
}

export interface TuneDialogueResponse {
  character_name: string;
  tuned_dialogue: string;
}

export function tuneDialogue(req: TuneDialogueRequest) {
  return postJson<TuneDialogueResponse>("/character/tune_dialogue", req);
}

export interface StyleExtractRequest {
  video_url: string;
  timestamp_range?: string;
  genre?: string;
  director_notes?: string;
}

export interface StyleExtractResponse {
  visual_palette: string[];
  lighting_style: string;
  camera_motion: string;
  editing_rhythm: string;
  sound_and_acoustics: string;
  imagen3_prompt: string;
}

export function extractStyle(req: StyleExtractRequest) {
  return postJson<StyleExtractResponse>("/style/extract", req);
}

export interface LocationScoutRequest {
  scene_description: string;
  characters?: string[];
  genre?: string;
}

export interface PrecedentComp {
  film: string;
  director: string;
  scene_comparison: string;
  lens_and_blocking_technique: string;
}

export interface CameraPackage {
  cam_a: string;
  cam_b: string;
  cam_c: string;
}

export interface LocationScoutResponse {
  film_precedents: PrecedentComp[];
  location_aesthetic: string;
  practical_lighting: string;
  camera_package: CameraPackage;
  imagen3_prompt: string;
}

export function scoutLocation(req: LocationScoutRequest) {
  return postJson<LocationScoutResponse>("/location/scout", req);
}

export interface TerritoryScore {
  country_code: string;
  country_name: string;
  market_fit_score: number;
  commercial_appetite: string;
  cultural_friction: string;
  actionable_fix: string;
}

export interface MarketPredictResponse {
  overall_global_score: number;
  territories: TerritoryScore[];
  clickhouse_query_executed: string;
}

export function predictMarket(genre: string, logline: string, targetTerritories?: string[], activeLevers?: string[]) {
  return postJson<MarketPredictResponse>("/market/predict", {
    genre,
    logline,
    target_territories: targetTerritories || [],
    active_levers: activeLevers || [],
  });
}

export interface GenerateMediaImageResponse {
  image_url: string;
  prompt: string;
  model: string;
}

export function generateMediaImage(prompt: string, aspectRatio = "16:9") {
  return postJson<GenerateMediaImageResponse>("/media/image", { prompt, aspect_ratio: aspectRatio });
}

export interface GenerateMediaTTSResponse {
  audio_url: string;
  speaker: string;
  voice_name: string;
  duration_estimate_sec: number;
  dsp_applied?: Record<string, unknown>;
}

export interface GenerateMediaTTSOptions {
  text: string;
  speaker?: string;
  voiceName?: string;
  deliveryStyle?: string;
  speed?: number;
  pitchFine?: number;
  formantShift?: number;
  reverbRoom?: string;
  reverbSend?: number;
}

export function generateMediaTTS(
  textOrReq: string | GenerateMediaTTSOptions,
  speaker?: string,
  voiceName?: string
) {
  if (typeof textOrReq === "string") {
    return postJson<GenerateMediaTTSResponse>("/media/tts", { text: textOrReq, speaker, voice_name: voiceName });
  }
  return postJson<GenerateMediaTTSResponse>("/media/tts", {
    text: textOrReq.text,
    speaker: textOrReq.speaker,
    voice_name: textOrReq.voiceName,
    delivery_style: textOrReq.deliveryStyle,
    speed: textOrReq.speed,
    pitch_fine: textOrReq.pitchFine,
    formant_shift: textOrReq.formantShift,
    reverb_room: textOrReq.reverbRoom,
    reverb_send: textOrReq.reverbSend,
  });
}

export interface GenerateMediaVideoResponse {
  operation_name: string;
  prompt: string;
  status: string;
  video_url?: string;
}

export function generateMediaVideo(
  prompt: string,
  durationSeconds = 5,
  stylePreset = "35mm Anamorphic Film",
  imageUrl?: string,
  characterName?: string,
  aspectRatio?: string
) {
  return postJson<GenerateMediaVideoResponse>("/media/video", {
    prompt,
    duration_seconds: durationSeconds,
    style_preset: stylePreset,
    image_url: imageUrl,
    character_name: characterName,
    aspect_ratio: aspectRatio,
  });
}

export function getVideoStatus(operationName: string) {
  return getJson<{ status: string; video_url?: string; error?: string }>(
    `/media/video/status?operation_name=${encodeURIComponent(operationName)}`
  );
}

export interface ContinuityIssue {
  id: string;
  severity: "critical" | "warning" | "minor";
  issue_type: "knowledge_breach" | "timeline_inconsistency" | "dropped_thread" | "logic_contradiction";
  character: string;
  scene_ref: string;
  dialogue_citation: string;
  clickhouse_fact_contradicted: string;
  explanation: string;
  suggested_fix: string;
}

export interface ContinuityCheckResponse {
  overall_continuity_score: number;
  total_issues: number;
  clickhouse_events_analyzed: number;
  verdict_summary: string;
  clickhouse_query_executed: string;
  issues: ContinuityIssue[];
  _fallback?: boolean;
  _error?: string;
  _cached?: boolean;
}

export function checkContinuity(
  projectId: string,
  screenplayText: string,
  characters: string[] = [],
  scenes: any[] = []
) {
  return postJson<ContinuityCheckResponse>("/continuity/check", {
    project_id: projectId,
    screenplay_text: screenplayText,
    characters,
    scenes,
  });
}

export interface ShotItem {
  shot_number: number;
  shot_type: string;
  lens: string;
  angle: string;
  camera_movement: string;
  blocking_notes: string;
  lighting_setup: string;
  dramatic_intent: string;
  imagen_prompt: string;
  estimated_duration_sec: number;
}

export interface ShotlistResponse {
  scene_title: string;
  director_style: string;
  visual_rhythm: string;
  aspect_ratio: string;
  color_temperature: string;
  shots: ShotItem[];
  _fallback?: boolean;
  _error?: string;
  _cached?: boolean;
}

export function generateShotlist(req: {
  sceneText: string;
  sceneTitle?: string;
  directorStyle?: string;
  characters?: string[];
}) {
  return postJson<ShotlistResponse>("/shotlist/generate", {
    scene_text: req.sceneText,
    scene_title: req.sceneTitle || "INT. SCENE - NIGHT",
    director_style: req.directorStyle || "David Fincher / Neo-Noir Precision",
    characters: req.characters || [],
  });
}

export interface StripboardSceneInput {
  scene_number: string;
  setting: string;
  time_of_day: string;
  location: string;
  summary?: string;
  screenplay_text?: string;
}

export interface StripboardBreakdownRequest {
  project_title: string;
  genre: string;
  scenes?: StripboardSceneInput[];
  raw_screenplay?: string;
}

export interface SceneProductionBreakdown {
  scene_number: string;
  stunts: string;
  stunt_tier: "None" | "Low" | "Moderate" | "High";
  practical_fx: string;
  vfx_tier: "Class A" | "Class B" | "Class C" | "None";
  special_equipment: string;
  permits_and_hazards: string;
  complexity_rating: number;
  production_notes: string;
}

export interface StripboardBreakdownResponse {
  total_shoot_days: number;
  estimated_budget_multiplier: number;
  production_summary: string;
  breakdown: SceneProductionBreakdown[];
  _fallback?: boolean;
  _error?: string;
  _cached?: boolean;
}

export function generateStripboardBreakdown(req: StripboardBreakdownRequest) {
  return postJson<StripboardBreakdownResponse>("/production/stripboard-breakdown", req);
}

export interface SceneResearchInput {
  scene_id: string;
  scene_number: number;
  title: string;
  slugline: string;
  location: string;
  summary?: string;
  shoot_region?: string;
  location_budget?: number;
}

export interface LocationResearchRequest {
  project_title: string;
  genre?: string;
  production_base?: string;
  currency?: SupportedCurrency;
  budget?: number;
  budget_cap_policy?: BudgetCapPolicy;
  scenes?: SceneResearchInput[];
}

export interface SceneResearchResult {
  scene_id: string;
  scene_number: number;
  candidates: LocationCandidate[];
}

export interface LocationResearchResponse {
  scenes: SceneResearchResult[];
  clusters: LocationCluster[];
  _fallback?: boolean;
  _disclosure?: string;
  _error?: string;
}

export interface LocationQARequest {
  candidate_id: string;
  candidate_name: string;
  region: string;
  category: string;
  question: string;
  project_title?: string;
}

export interface LocationQAResponse {
  answer: string;
  sources: Array<{ title: string; url: string }>;
  search_grounded: boolean;
  suggested_followups?: string[];
  _fallback?: boolean;
  _disclosure?: string;
}

export function researchLocations(req: LocationResearchRequest) {
  return postJson<LocationResearchResponse>("/location/research", req, 60_000);
}

export function askLocationQA(req: LocationQARequest) {
  return postJson<LocationQAResponse>("/location/qa", req, 45_000);
}
