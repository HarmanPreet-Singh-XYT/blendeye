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
  | "update_screenplay"
  | "update_scene_meta"
  | "auto_tidy_backlot"
  | "create_take_milestone"
  | "create_scene"
  | "delete_scene"
  | "reorder_scenes"
  | "move_scene"
  | "update_scene";

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
    | "market";
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

export type StudioAction =
  | CreateNodeAction
  | DeleteNodeAction
  | UpdateNodeDataAction
  | ConnectNodesAction
  | SeverWireAction
  | CreateCharacterAction
  | UpdateCharacterAction
  | DeleteCharacterAction
  | UpdateScreenplayAction
  | UpdateSceneMetaAction
  | AutoTidyBacklotAction
  | CreateTakeMilestoneAction
  | CreateSceneAction
  | DeleteSceneAction
  | ReorderScenesAction
  | MoveSceneAction
  | UpdateSceneAction;

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
