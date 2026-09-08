import type { ProjectCharacter, FilmScene } from "@/lib/project-store";

export type StudioActionType =
  | "create_node"
  | "delete_node"
  | "update_node_data"
  | "connect_nodes"
  | "sever_wire"
  | "create_character"
  | "update_character"
  | "delete_character"
  | "replace_character"
  | "update_screenplay"
  | "update_scene_meta"
  | "update_project_meta"
  | "auto_tidy_backlot"
  | "create_take_milestone"
  | "create_scene"
  | "delete_scene"
  | "replace_scene"
  | "reorder_scenes"
  | "move_scene"
  | "update_scene"
  | "create_story_event"
  | "delete_story_event"
  | "replace_story_event"
  | "lock_location"
  | "unlock_location"
  | "set_scene_location"
  | "add_location_candidate"
  | "set_location_budget"
  | "set_shoot_region"
  | "create_score_take"
  | "set_master_score"
  | "delete_score_take"
  | "attach_asset"
  | "create_asset_record"
  | "generate_timeline_moment"
  | "switch_view";

export interface CreateNodeAction {
  type: "create_node";
  nodeType:
    | "clip"
    | "note"
    | "actor"
    | "personality"
    | "quirks"
    | "scene"
    | "script"
    | "chemistry"
    | "storyboard"
    | "floorplan"
    | "tensionCurve"
    | "tableRead"
    | "market"
    | "location";
  title?: string;
  data?: Record<string, any>;
  position?: { x: number; y: number };
}

export interface DeleteNodeAction {
  type: "delete_node";
  nodeId: string;
}

export interface UpdateNodeDataAction {
  type: "update_node_data";
  nodeId: string;
  patch: Record<string, any>;
}

export interface ConnectNodesAction {
  type: "connect_nodes";
  source: string; // Node ID or character name
  target: string; // Node ID or character name
  sourceHandle?: string | null;
  targetHandle?: string | null;
  relationship?: string; // e.g. "Friction", "Alliance", "Rivalry", "Mentor"
}

export interface SeverWireAction {
  type: "sever_wire";
  edgeId?: string;
  source?: string;
  target?: string;
}

export interface CreateCharacterAction {
  type: "create_character";
  name: string;
  role: string;
  archetype: string;
  speechStyle?: string;
  subtextRatio?: string;
  personalityPreset?: string;
  confidence?: number;
  verbalPacing?: number;
  objective?: string;
  actorComp?: string;
}

export interface UpdateCharacterAction {
  type: "update_character";
  name: string;
  patch: Partial<ProjectCharacter>;
}

export interface DeleteCharacterAction {
  type: "delete_character";
  name: string;
}

export interface ReplaceCharacterAction {
  type: "replace_character";
  name: string;
  replacement: Partial<ProjectCharacter>;
}

export interface UpdateScreenplayAction {
  type: "update_screenplay";
  screenplayText: string;
  summary?: string;
}

export interface UpdateSceneMetaAction {
  type: "update_scene_meta";
  title?: string;
  stakes?: string;
  genre?: string;
}

export interface UpdateProjectMetaAction {
  type: "update_project_meta";
  patch: {
    title?: string;
    logline?: string;
    premise?: string;
    genre?: string;
    directorStyle?: string;
    narrativeFormat?: string;
    targetRuntimeMinutes?: number;
    primaryLocation?: string;
  };
}

export interface AutoTidyBacklotAction {
  type: "auto_tidy_backlot";
}

export interface CreateTakeMilestoneAction {
  type: "create_take_milestone";
  title: string;
  description?: string;
}

export interface CreateSceneAction {
  type: "create_scene";
  title: string;
  slugline?: string;
  summary?: string;
  location?: string;
  castPresent?: string[];
  durationSeconds?: number;
  position?: "end" | "start" | number;
  screenplayText?: string;
}

export interface DeleteSceneAction {
  type: "delete_scene";
  sceneIdentifier: number | string;
}

export interface ReplaceSceneAction {
  type: "replace_scene";
  sceneIdentifier: number | string;
  replacement: Partial<FilmScene>;
}

export interface ReorderScenesAction {
  type: "reorder_scenes";
  sceneOrder: Array<number | string>;
}

export interface MoveSceneAction {
  type: "move_scene";
  sceneIdentifier: number | string;
  targetIndex?: number;
  direction?: "up" | "down";
}

export interface UpdateSceneAction {
  type: "update_scene";
  sceneIdentifier: number | string;
  patch: Partial<FilmScene>;
}

export interface CreateStoryEventAction {
  type: "create_story_event";
  atSeconds: number;
  characterName: string;
  eventType: "known_fact" | "unaware_of" | "location" | "objective";
}

export interface DeleteStoryEventAction {
  type: "delete_story_event";
  identifier: number | string;
}

export interface ReplaceStoryEventAction {
  type: "replace_story_event";
  identifier: number | string;
  replacement: {
    atSeconds?: number;
    characterName?: string;
    eventType?: "known_fact" | "unaware_of" | "location" | "objective";
  };
}

export interface LockLocationAction {
  type: "lock_location";
  sceneIdentifier: number | string;
  candidateId?: string;
  locationName?: string;
}

export interface UnlockLocationAction {
  type: "unlock_location";
  sceneIdentifier: number | string;
}

export interface SetSceneLocationAction {
  type: "set_scene_location";
  sceneIdentifier: number | string;
  location: string;
  shootRegion?: string;
  locationBudget?: number;
}

export interface AddLocationCandidateAction {
  type: "add_location_candidate";
  sceneIdentifier: number | string;
  candidate: {
    name: string;
    category?: string;
    region?: string;
    day_rate?: number;
    permit_fee?: number;
    film_precedent?: string;
    director?: string;
    why?: string;
    practical_notes?: string;
    environment_type?: "practical" | "studio_stage" | "green_screen" | "virtual_production";
    stage_specs?: Record<string, any>;
    auto_lock?: boolean;
  };
}

export interface SetLocationBudgetAction {
  type: "set_location_budget";
  sceneIdentifier?: number | string;
  budget?: number;
  locationsPct?: number;
}

export interface SetShootRegionAction {
  type: "set_shoot_region";
  shootRegion: string;
  sceneIdentifier?: number | string;
}

export interface CreateScoreTakeAction {
  type: "create_score_take";
  sceneIdentifier?: string | number;
  title?: string;
  prompt?: string;
  durationSec?: number;
  scoreType?: "score" | "source" | "vocal";
  audioUrl?: string;
  lyricsText?: string;
  isMaster?: boolean;
  instruments?: string[];
  dynamicArc?: string;
  model?: string;
}

export interface SetMasterScoreAction {
  type: "set_master_score";
  sceneIdentifier?: string | number;
  takeNumber?: number;
  takeId?: string;
}

export interface DeleteScoreTakeAction {
  type: "delete_score_take";
  sceneIdentifier?: string | number;
  takeNumber?: number;
  takeId?: string;
}

export interface AttachAssetAction {
  type: "attach_asset";
  assetId?: string;
  assetName?: string;
  targetType: "scene" | "character" | "score_moodboard" | "general";
  targetIdentifier?: string | number;
  role?: "face" | "body" | "plate" | "style" | "moodboard";
}

export interface CreateAssetRecordAction {
  type: "create_asset_record";
  name: string;
  category: "map" | "character_face" | "character_body" | "location" | "style" | "video" | "audio" | "general";
  url: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface GenerateTimelineMomentAction {
  type: "generate_timeline_moment";
  sceneIdentifier: string | number;
  timestampSec: number;
  prompt?: string;
  stylePreset?: string;
  cameraFraming?: string;
  label?: string;
  imageUrl?: string;
}

export interface SwitchViewAction {
  type: "switch_view";
  tab?: "planning" | "simulation" | "generation" | "showrunner";
  subview?: "canvas" | "timeline" | "score" | "video" | "location" | "floorplan" | "assets";
}

export type StudioAction =
  | CreateNodeAction
  | DeleteNodeAction
  | UpdateNodeDataAction
  | ConnectNodesAction
  | SeverWireAction
  | CreateCharacterAction
  | UpdateCharacterAction
  | DeleteCharacterAction
  | ReplaceCharacterAction
  | UpdateScreenplayAction
  | UpdateSceneMetaAction
  | UpdateProjectMetaAction
  | AutoTidyBacklotAction
  | CreateTakeMilestoneAction
  | CreateSceneAction
  | DeleteSceneAction
  | ReplaceSceneAction
  | ReorderScenesAction
  | MoveSceneAction
  | UpdateSceneAction
  | CreateStoryEventAction
  | DeleteStoryEventAction
  | ReplaceStoryEventAction
  | LockLocationAction
  | UnlockLocationAction
  | SetSceneLocationAction
  | AddLocationCandidateAction
  | SetLocationBudgetAction
  | SetShootRegionAction
  | CreateScoreTakeAction
  | SetMasterScoreAction
  | DeleteScoreTakeAction
  | AttachAssetAction
  | CreateAssetRecordAction
  | GenerateTimelineMomentAction
  | SwitchViewAction;

export interface CitedPrecedent {
  genre: string;
  trope: string;
  historical_reference: string;
  tension_level: number;
  commercial_territory: string;
  audience_retention_pct: number;
  precedent_example: string;
}

export interface CommanderExecutionResponse {
  thought_process: string;
  assistant_message: string;
  actions: StudioAction[];
  execution_summary?: string[];
  precedents_cited?: CitedPrecedent[];
  clickhouse_query_sql?: string;
  _fallback?: boolean;
  _error?: string;
}
