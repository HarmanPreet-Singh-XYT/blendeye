import type { Node, Edge } from "@xyflow/react";
import type { ProjectCharacter, FilmScene, ScoreTake, TimelineMoment } from "@/lib/project-store";
import type { StoryEventMarker } from "@/components/cinema/timeline-scrubber";
import type { StudioAction, CommanderExecutionResponse } from "@/lib/studio-actions";
import { autoTidyBacklot } from "@/lib/backlot-layout";
import { StudioVersionControl } from "@/lib/version-control";
import { getLocalAssets, saveLocalAsset, type CinemaAsset } from "@/lib/asset-store";

export interface CommanderContext {
  nodes?: Node[];
  edges?: Edge[];
  characters: ProjectCharacter[];
  screenplayText?: string;
  sceneTitle?: string;
  sceneSummary?: string;
  genre?: string;
  projectId?: string;
  projectTitle?: string;
  premise?: string;
  directorStyle?: string;
  vcs?: StudioVersionControl | null;
  scenes?: FilmScene[];
  activeSceneId?: string;
  events?: StoryEventMarker[];
}

export interface CommanderCallbacks {
  setNodes?: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>;
  setCharacters?: React.Dispatch<React.SetStateAction<ProjectCharacter[]>>;
  setScreenplayText?: (text: string) => void;
  setSceneTitle?: (title: string) => void;
  setSceneSummary?: (summary: string) => void;
  setProjectTitle?: (title: string) => void;
  setGenre?: (genre: string) => void;
  setPremise?: (premise: string) => void;
  setDirectorStyle?: (style: string) => void;
  saveProject?: (patch: Record<string, any>) => void;
  recordTakeChange?: (summary: string, category: any, custom?: any) => void;
  setScenes?: (scenes: FilmScene[]) => void;
  setActiveSceneId?: (id: string) => void;
  setEvents?: (events: StoryEventMarker[]) => void;
  switchView?: (tab?: string, subview?: string) => void;
  openAssetHub?: () => void;
}

/**
 * Execute an array of CRUD actions dispatched by the Centralized Studio AI Commander
 */
export function executeStudioActions(
  actions: StudioAction[],
  ctx: CommanderContext,
  cb: CommanderCallbacks
): { executedCount: number; summaries: string[] } {
  const summaries: string[] = [];

  let currentNodes = ctx.nodes ? [...ctx.nodes] : [];
  let currentEdges = ctx.edges ? [...ctx.edges] : [];
  let currentCharacters = ctx.characters ? [...ctx.characters] : [];
  let currentScreenplay = ctx.screenplayText || "";
  let currentTitle = ctx.sceneTitle || "";
  let currentSummary = ctx.sceneSummary || "";
  let currentScenes = ctx.scenes ? [...ctx.scenes] : [];
  let currentActiveSceneId = ctx.activeSceneId;
  let currentEvents = ctx.events ? [...ctx.events] : [];

  let nodesChanged = false;
  let edgesChanged = false;
  let charsChanged = false;
  let scriptChanged = false;
  let metaChanged = false;
  let scenesChanged = false;
  let eventsChanged = false;

  for (const action of actions) {
    switch (action.type) {
      case "create_character": {
        const charName = action.name.trim();
        const exists = currentCharacters.some(
          (c) => c.name.toLowerCase() === charName.toLowerCase()
        );
        if (!exists) {
          const newChar: ProjectCharacter = {
            name: charName,
            role: action.role || "Supporting Role",
            archetype: action.archetype || "Key Dynamic",
            speechStyle: action.speechStyle || "naturalistic",
            subtextRatio: action.subtextRatio || "high",
            confidence: action.confidence ?? 70,
            verbalPacing: action.verbalPacing ?? 60,
            personalityPreset: action.personalityPreset || "Balanced Professional",
            actorComp: action.actorComp || `${charName} Prototype`,
            objective: action.objective || "Navigate the unfolding dramatic crisis",
          };
          currentCharacters.push(newChar);
          charsChanged = true;

          // Also spawn corresponding Actor + Personality Nodes on backlot canvas
          const actorNodeId = `node-actor-${charName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          const personalityNodeId = `node-pers-${charName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

          currentNodes.push({
            id: actorNodeId,
            type: "actor",
            position: { x: 460, y: 80 + currentCharacters.length * 200 },
            data: {
              name: newChar.name,
              archetype: newChar.archetype,
              actorComp: newChar.actorComp,
              objective: newChar.objective,
            },
          });

          currentNodes.push({
            id: personalityNodeId,
            type: "personality",
            position: { x: 460, y: 80 + currentCharacters.length * 200 + 130 },
            data: {
              presetName: newChar.personalityPreset,
              confidence: newChar.confidence,
              verbalPacing: newChar.verbalPacing,
              subtextRatio: newChar.subtextRatio,
            },
          });

          // Wire personality to actor
          currentEdges.push({
            id: `e-${personalityNodeId}-${actorNodeId}-${Date.now().toString(36)}`,
            source: personalityNodeId,
            target: actorNodeId,
            type: "deletable",
            animated: true,
            data: { relationship: "Mindset" },
          });

          nodesChanged = true;
          edgesChanged = true;
          summaries.push(`Created character "${charName}" and spawned backlot actor nodes`);
        }
        break;
      }

      case "update_character": {
        const idx = currentCharacters.findIndex(
          (c) => c.name.toLowerCase() === action.name.toLowerCase()
        );
        if (idx !== -1) {
          currentCharacters[idx] = { ...currentCharacters[idx], ...action.patch };
          charsChanged = true;

          // Also update corresponding node data on canvas
          const targetCharName = currentCharacters[idx].name;
          currentNodes = currentNodes.map((n) => {
            if (n.type === "actor" && (n.data as any)?.name?.toLowerCase() === targetCharName.toLowerCase()) {
              return {
                ...n,
                data: {
                  ...n.data,
                  archetype: action.patch.archetype ?? (n.data as any).archetype,
                  actorComp: action.patch.actorComp ?? (n.data as any).actorComp,
                  objective: action.patch.objective ?? (n.data as any).objective,
                },
              };
            }
            if (n.type === "personality" && n.id.includes(targetCharName.toLowerCase())) {
              return {
                ...n,
                data: {
                  ...n.data,
                  confidence: action.patch.confidence ?? (n.data as any).confidence,
                  verbalPacing: action.patch.verbalPacing ?? (n.data as any).verbalPacing,
                  subtextRatio: action.patch.subtextRatio ?? (n.data as any).subtextRatio,
                },
              };
            }
            return n;
          });
          nodesChanged = true;
          summaries.push(`Updated character "${action.name}" traits and canvas dials`);
        }
        break;
      }

      case "delete_character": {
        const targetName = action.name.toLowerCase();
        currentCharacters = currentCharacters.filter(
          (c) => c.name.toLowerCase() !== targetName
        );
        charsChanged = true;

        // Remove associated nodes and wires
        const removedNodeIds = new Set<string>();
        currentNodes = currentNodes.filter((n) => {
          const match =
            ((n.data as any)?.name && (n.data as any)?.name.toLowerCase() === targetName) ||
            n.id.includes(targetName);
          if (match) removedNodeIds.add(n.id);
          return !match;
        });

        currentEdges = currentEdges.filter(
          (e) => !removedNodeIds.has(e.source) && !removedNodeIds.has(e.target)
        );

        nodesChanged = true;
        edgesChanged = true;
        summaries.push(`Removed character "${action.name}" and cleared associated nodes`);
        break;
      }

      case "replace_character": {
        const targetName = action.name.toLowerCase().trim();
        const idx = currentCharacters.findIndex(
          (c) => c.name.toLowerCase() === targetName
        );
        const rep = action.replacement || {};
        const newName = rep.name ? rep.name.trim() : action.name;

        const replacedChar: ProjectCharacter = {
          name: newName,
          role: rep.role || (idx !== -1 ? currentCharacters[idx].role : "Key Dynamic"),
          archetype: rep.archetype || (idx !== -1 ? currentCharacters[idx].archetype : "Dynamic Specialist"),
          speechStyle: rep.speechStyle || (idx !== -1 ? currentCharacters[idx].speechStyle : "naturalistic"),
          subtextRatio: rep.subtextRatio || (idx !== -1 ? currentCharacters[idx].subtextRatio : "high"),
          confidence: typeof rep.confidence === "number" ? rep.confidence : (idx !== -1 ? (currentCharacters[idx].confidence ?? 75) : 75),
          verbalPacing: typeof rep.verbalPacing === "number" ? rep.verbalPacing : (idx !== -1 ? (currentCharacters[idx].verbalPacing ?? 65) : 65),
          personalityPreset: rep.personalityPreset || (idx !== -1 ? currentCharacters[idx].personalityPreset : "Balanced Professional"),
          actorComp: rep.actorComp || `${newName} Prototype`,
          objective: rep.objective || (idx !== -1 ? currentCharacters[idx].objective : "Navigate the unfolding dramatic crisis"),
          quirks: Array.isArray(rep.quirks) ? rep.quirks : (idx !== -1 ? currentCharacters[idx].quirks : ["Observant"]),
        };

        if (idx !== -1) {
          currentCharacters[idx] = replacedChar;
        } else {
          currentCharacters.push(replacedChar);
        }
        charsChanged = true;

        // Update or recreate corresponding nodes on backlot canvas
        let foundNode = false;
        currentNodes = currentNodes.map((n) => {
          if (n.type === "actor" && (n.data as any)?.name?.toLowerCase() === targetName) {
            foundNode = true;
            return {
              ...n,
              data: {
                ...n.data,
                name: replacedChar.name,
                archetype: replacedChar.archetype,
                actorComp: replacedChar.actorComp,
                objective: replacedChar.objective,
              },
            };
          }
          if (n.type === "personality" && n.id.includes(targetName)) {
            return {
              ...n,
              data: {
                ...n.data,
                presetName: replacedChar.personalityPreset,
                confidence: replacedChar.confidence,
                verbalPacing: replacedChar.verbalPacing,
                subtextRatio: replacedChar.subtextRatio,
              },
            };
          }
          return n;
        });

        if (!foundNode) {
          const actorNodeId = `node-actor-${newName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          const personalityNodeId = `node-pers-${newName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          currentNodes.push({
            id: actorNodeId,
            type: "actor",
            position: { x: 460, y: 80 + currentCharacters.length * 200 },
            data: {
              name: replacedChar.name,
              archetype: replacedChar.archetype,
              actorComp: replacedChar.actorComp,
              objective: replacedChar.objective,
            },
          });
          currentNodes.push({
            id: personalityNodeId,
            type: "personality",
            position: { x: 460, y: 80 + currentCharacters.length * 200 + 130 },
            data: {
              presetName: replacedChar.personalityPreset,
              confidence: replacedChar.confidence,
              verbalPacing: replacedChar.verbalPacing,
              subtextRatio: replacedChar.subtextRatio,
            },
          });
          currentEdges.push({
            id: `e-${personalityNodeId}-${actorNodeId}-${Date.now().toString(36)}`,
            source: personalityNodeId,
            target: actorNodeId,
            type: "deletable",
            animated: true,
            data: { relationship: "Mindset" },
          });
          edgesChanged = true;
        }

        nodesChanged = true;
        summaries.push(`Replaced character "${action.name}" with "${newName}" (${replacedChar.role})`);
        break;
      }

      case "create_node": {
        const newId = `node-${action.nodeType}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
        const pos = action.position || {
          x: 200 + Math.floor(Math.random() * 120),
          y: 200 + Math.floor(Math.random() * 120),
        };

        const defaultDataMap: Record<string, any> = {
          clip: {
            title: action.title || "Cinema Reference Clip",
            url: "reference-cut.mp4",
            timestampRange: "00:30 - 01:45",
            lightingStyle: "High-contrast chiaroscuro",
            palette: ["#f59e0b", "#0f172a", "#38bdf8"],
            pacing: "Rapid dynamic",
          },
          note: {
            noteType: action.title || "Director Directive",
            content: (action.data as any)?.content || "Narrative beat injection.",
          },
          storyboard: {
            prompt: action.title || "Key cinematic frame visualization",
            shotType: "2.39:1 Anamorphic Scope",
            lighting: "Volumetric rim light",
          },
          floorplan: {
            sceneTitle: currentTitle || "Production Set",
            cameraCount: 3,
          },
          tensionCurve: {
            actCount: 3,
            peakTension: 88,
          },
          tableRead: {
            screenplayText: currentScreenplay,
          },
          market: {
            genre: ctx.genre,
          },
        };

        const nodeData = {
          ...(defaultDataMap[action.nodeType] || {}),
          ...(action.data || {}),
        };

        currentNodes.push({
          id: newId,
          type: action.nodeType,
          position: pos,
          data: nodeData,
        });
        nodesChanged = true;
        summaries.push(`Spawned ${action.nodeType} node ("${action.title || newId}")`);
        break;
      }

      case "delete_node": {
        const targetId = action.nodeId;
        // Search by ID or title
        const found = currentNodes.find(
          (n) =>
            n.id === targetId ||
            (n.data as any)?.title?.toLowerCase() === targetId.toLowerCase() ||
            (n.data as any)?.name?.toLowerCase() === targetId.toLowerCase()
        );

        if (found) {
          currentNodes = currentNodes.filter((n) => n.id !== found.id);
          currentEdges = currentEdges.filter(
            (e) => e.source !== found.id && e.target !== found.id
          );
          nodesChanged = true;
          edgesChanged = true;
          summaries.push(`Deleted node "${found.id}" and disconnected attached wires`);
        }
        break;
      }

      case "update_node_data": {
        const target = currentNodes.find(
          (n) =>
            n.id === action.nodeId ||
            (n.data as any)?.name?.toLowerCase() === action.nodeId.toLowerCase() ||
            (n.data as any)?.title?.toLowerCase() === action.nodeId.toLowerCase()
        );
        if (target) {
          currentNodes = currentNodes.map((n) =>
            n.id === target.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    ...action.patch,
                  },
                }
              : n
          );
          nodesChanged = true;
          summaries.push(`Updated parameters for node "${target.id}"`);
        }
        break;
      }

      case "connect_nodes": {
        // Find source & target by ID or name
        const sourceNode = currentNodes.find(
          (n) =>
            n.id === action.source ||
            (n.data as any)?.name?.toLowerCase() === action.source.toLowerCase() ||
            (n.data as any)?.title?.toLowerCase() === action.source.toLowerCase()
        );
        const targetNode = currentNodes.find(
          (n) =>
            n.id === action.target ||
            (n.data as any)?.name?.toLowerCase() === action.target.toLowerCase() ||
            (n.data as any)?.title?.toLowerCase() === action.target.toLowerCase()
        );

        if (sourceNode && targetNode && sourceNode.id !== targetNode.id) {
          const exists = currentEdges.some(
            (e) =>
              (e.source === sourceNode.id && e.target === targetNode.id) ||
              (e.source === targetNode.id && e.target === sourceNode.id)
          );

          if (!exists) {
            currentEdges.push({
              id: `e-${sourceNode.id}-${targetNode.id}-${Date.now().toString(36)}`,
              source: sourceNode.id,
              target: targetNode.id,
              sourceHandle: action.sourceHandle || null,
              targetHandle: action.targetHandle || null,
              type: "deletable",
              animated: true,
              data: {
                relationship: action.relationship || "Friction",
              },
            });
            edgesChanged = true;
            summaries.push(
              `Wired "${sourceNode.id}" → "${targetNode.id}" (${action.relationship || "Connection"})`
            );
          }
        }
        break;
      }

      case "sever_wire": {
        if (action.edgeId) {
          currentEdges = currentEdges.filter((e) => e.id !== action.edgeId);
          edgesChanged = true;
          summaries.push(`Severed wire "${action.edgeId}"`);
        } else if (action.source && action.target) {
          const s = action.source.toLowerCase();
          const t = action.target.toLowerCase();
          const prevLen = currentEdges.length;
          currentEdges = currentEdges.filter((e) => {
            const match =
              (e.source.toLowerCase().includes(s) && e.target.toLowerCase().includes(t)) ||
              (e.source.toLowerCase().includes(t) && e.target.toLowerCase().includes(s));
            return !match;
          });
          if (currentEdges.length !== prevLen) {
            edgesChanged = true;
            summaries.push(`Severed wire connecting "${action.source}" and "${action.target}"`);
          }
        }
        break;
      }

      case "update_screenplay": {
        currentScreenplay = action.screenplayText;
        scriptChanged = true;
        summaries.push(`Updated screenplay draft (${action.summary || "Full rewrite/revision"})`);
        break;
      }

      case "update_scene_meta": {
        if (action.title) {
          currentTitle = action.title;
          metaChanged = true;
        }
        if (action.stakes) {
          currentSummary = action.stakes;
          metaChanged = true;
        }
        summaries.push(`Updated scene title/stakes: "${currentTitle}"`);
        break;
      }

      case "update_project_meta": {
        const patch = action.patch || {};
        if (patch.title) {
          cb.setProjectTitle?.(patch.title);
          summaries.push(`Updated project title to "${patch.title}"`);
        }
        if (patch.genre) {
          cb.setGenre?.(patch.genre);
          summaries.push(`Updated project genre to "${patch.genre}"`);
        }
        if (patch.logline || patch.premise) {
          const p = patch.premise || patch.logline || "";
          cb.setPremise?.(p);
          summaries.push(`Updated project premise/logline`);
        }
        if (patch.directorStyle) {
          cb.setDirectorStyle?.(patch.directorStyle);
          summaries.push(`Updated director style to "${patch.directorStyle}"`);
        }
        cb.saveProject?.({
          title: patch.title,
          genre: patch.genre,
          premise: patch.premise || patch.logline,
          directorStyle: patch.directorStyle,
          narrativeFormat: patch.narrativeFormat,
          targetRuntimeMinutes: patch.targetRuntimeMinutes,
          primaryLocation: patch.primaryLocation,
        });
        break;
      }

      case "auto_tidy_backlot": {
        currentNodes = autoTidyBacklot(currentNodes);
        nodesChanged = true;
        summaries.push("Auto-aligned backlot nodes into neat production workflow lanes");
        break;
      }

      case "create_take_milestone": {
        ctx.vcs?.createMilestone(action.title, action.description);
        summaries.push(`Locked milestone take: "${action.title}"`);
        break;
      }

      case "create_scene": {
        const nextSceneNumber = currentScenes.length + 1;
        const newSceneId = `scene-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
        const duration = action.durationSeconds || 180;
        const newScene: FilmScene = {
          id: newSceneId,
          sceneNumber: nextSceneNumber,
          title: action.title || `Scene ${nextSceneNumber}`,
          slugline: action.slugline || "INT. SCENE LOCATION - DAY",
          summary: action.summary || "New dramatic beat created by Studio Showrunner.",
          location: action.location || "Studio Location",
          durationSeconds: duration,
          startSeconds: 0,
          castPresent: Array.isArray(action.castPresent) && action.castPresent.length > 0
            ? action.castPresent
            : currentCharacters.slice(0, 2).map((c) => c.name),
          castRoles: {},
          screenplayText:
            action.screenplayText ||
            `${action.slugline || "INT. SCENE LOCATION - DAY"}\n\n[Action description]\n\n${currentCharacters[0]?.name || "CHARACTER"}\n(beat)\nDialogue goes here.`,
        };

        let insertIdx = currentScenes.length;
        if (action.position === "start") {
          insertIdx = 0;
        } else if (typeof action.position === "number") {
          insertIdx = Math.max(0, Math.min(action.position - 1, currentScenes.length));
        }

        currentScenes.splice(insertIdx, 0, newScene);

        // Re-index all scenes
        let cursor = 0;
        currentScenes = currentScenes.map((s, idx) => {
          const updated = { ...s, sceneNumber: idx + 1, startSeconds: cursor };
          cursor += s.durationSeconds || 180;
          return updated;
        });

        currentActiveSceneId = newScene.id;
        scenesChanged = true;
        summaries.push(`Created Scene ${newScene.sceneNumber}: "${newScene.title}" (${newScene.slugline})`);
        break;
      }

      case "delete_scene": {
        if (currentScenes.length <= 1) {
          summaries.push(`Cannot delete only remaining scene in project`);
          break;
        }

        const ident = String(action.sceneIdentifier).toLowerCase().trim();
        const numIdent = parseInt(ident, 10);

        const targetIdx = currentScenes.findIndex((s, idx) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        if (targetIdx !== -1) {
          const removed = currentScenes[targetIdx];
          currentScenes.splice(targetIdx, 1);

          let cursor = 0;
          currentScenes = currentScenes.map((s, idx) => {
            const updated = { ...s, sceneNumber: idx + 1, startSeconds: cursor };
            cursor += s.durationSeconds || 180;
            return updated;
          });

          if (currentActiveSceneId === removed.id) {
            currentActiveSceneId = currentScenes[0]?.id;
          }

          scenesChanged = true;
          summaries.push(`Deleted Scene ${targetIdx + 1}: "${removed.title}"`);
        }
        break;
      }

      case "replace_scene": {
        const ident = String(action.sceneIdentifier).toLowerCase().trim();
        const numIdent = parseInt(ident, 10);

        let targetIdx = currentScenes.findIndex((s, idx) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        // Fallback: If only 1 scene and targetIdx not found, target that single scene
        if (targetIdx === -1 && currentScenes.length === 1) {
          targetIdx = 0;
        }

        if (targetIdx !== -1) {
          const oldScene = currentScenes[targetIdx];
          const rep = action.replacement || {};
          const duration = rep.durationSeconds || oldScene.durationSeconds || 180;
          const updatedScene: FilmScene = {
            ...oldScene,
            ...rep,
            title: rep.title || oldScene.title,
            slugline: rep.slugline || oldScene.slugline,
            summary: rep.summary || oldScene.summary,
            location: rep.location || oldScene.location || "Studio Location",
            durationSeconds: duration,
            castPresent: Array.isArray(rep.castPresent) && rep.castPresent.length > 0
              ? rep.castPresent
              : oldScene.castPresent,
            screenplayText: rep.screenplayText !== undefined
              ? rep.screenplayText
              : oldScene.screenplayText,
          };

          currentScenes[targetIdx] = updatedScene;

          // Re-index sequence timestamps
          let cursor = 0;
          currentScenes = currentScenes.map((s, idx) => {
            const reindexed = { ...s, sceneNumber: idx + 1, startSeconds: cursor };
            cursor += s.durationSeconds || 180;
            return reindexed;
          });

          if (currentScenes[targetIdx].id === currentActiveSceneId) {
            currentTitle = updatedScene.title;
            currentSummary = updatedScene.summary;
            currentScreenplay = updatedScene.screenplayText;
            metaChanged = true;
            scriptChanged = true;
          }

          scenesChanged = true;
          summaries.push(`Replaced Scene ${targetIdx + 1}: "${oldScene.title}" → "${updatedScene.title}"`);
        } else {
          summaries.push(`Could not find scene matching "${action.sceneIdentifier}" to replace`);
        }
        break;
      }

      case "reorder_scenes": {
        if (Array.isArray(action.sceneOrder) && action.sceneOrder.length > 0) {
          const orderMap = new Map<string, number>();
          action.sceneOrder.forEach((item, orderIdx) => {
            orderMap.set(String(item).toLowerCase().trim(), orderIdx);
            const n = parseInt(String(item), 10);
            if (!isNaN(n)) orderMap.set(String(n), orderIdx);
          });

          const reordered = [...currentScenes].sort((a, b) => {
            const aKey1 = String(a.sceneNumber);
            const aKey2 = a.id.toLowerCase();
            const aKey3 = a.title.toLowerCase();
            const bKey1 = String(b.sceneNumber);
            const bKey2 = b.id.toLowerCase();
            const bKey3 = b.title.toLowerCase();

            const orderA = orderMap.get(aKey1) ?? orderMap.get(aKey2) ?? orderMap.get(aKey3) ?? 999;
            const orderB = orderMap.get(bKey1) ?? orderMap.get(bKey2) ?? orderMap.get(bKey3) ?? 999;
            return orderA - orderB;
          });

          let cursor = 0;
          currentScenes = reordered.map((s, idx) => {
            const updated = { ...s, sceneNumber: idx + 1, startSeconds: cursor };
            cursor += s.durationSeconds || 180;
            return updated;
          });

          scenesChanged = true;
          summaries.push(`Reordered sequence reel into ${currentScenes.length} scenes`);
        }
        break;
      }

      case "move_scene": {
        const ident = String(action.sceneIdentifier).toLowerCase().trim();
        const numIdent = parseInt(ident, 10);
        const idx = currentScenes.findIndex((s, i) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || i + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        if (idx !== -1) {
          let destIdx = idx;
          if (typeof action.targetIndex === "number") {
            destIdx = Math.max(0, Math.min(action.targetIndex, currentScenes.length - 1));
          } else if (action.direction === "up") {
            destIdx = Math.max(0, idx - 1);
          } else if (action.direction === "down") {
            destIdx = Math.min(currentScenes.length - 1, idx + 1);
          }

          if (destIdx !== idx) {
            const [moved] = currentScenes.splice(idx, 1);
            currentScenes.splice(destIdx, 0, moved);

            let cursor = 0;
            currentScenes = currentScenes.map((s, i) => {
              const updated = { ...s, sceneNumber: i + 1, startSeconds: cursor };
              cursor += s.durationSeconds || 180;
              return updated;
            });

            scenesChanged = true;
            summaries.push(`Moved "${moved.title}" to Scene ${destIdx + 1}`);
          }
        }
        break;
      }

      case "update_scene": {
        const ident = String(action.sceneIdentifier).toLowerCase().trim();
        const numIdent = parseInt(ident, 10);
        const idx = currentScenes.findIndex((s, i) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || i + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        if (idx !== -1 && action.patch) {
          currentScenes[idx] = {
            ...currentScenes[idx],
            ...action.patch,
          };

          if (currentScenes[idx].id === currentActiveSceneId) {
            if (action.patch.title) {
              currentTitle = action.patch.title;
              metaChanged = true;
            }
            if (action.patch.summary) {
              currentSummary = action.patch.summary;
              metaChanged = true;
            }
            if (action.patch.screenplayText) {
              currentScreenplay = action.patch.screenplayText;
              scriptChanged = true;
            }
          }

          scenesChanged = true;
          summaries.push(`Updated Scene ${currentScenes[idx].sceneNumber}: "${currentScenes[idx].title}"`);
        }
        break;
      }

      case "create_story_event": {
        const newEvent: StoryEventMarker = {
          atSeconds: typeof action.atSeconds === "number" ? action.atSeconds : 0,
          characterName: action.characterName || (currentCharacters[0]?.name || "Character"),
          eventType: action.eventType || "known_fact",
        };
        currentEvents.push(newEvent);
        currentEvents.sort((a, b) => a.atSeconds - b.atSeconds);
        eventsChanged = true;
        summaries.push(`Created story event for "${newEvent.characterName}" at ${newEvent.atSeconds}s (${newEvent.eventType})`);
        break;
      }

      case "delete_story_event": {
        const ident = String(action.identifier).toLowerCase().trim();
        const numIdent = parseInt(ident, 10);
        const prevLen = currentEvents.length;
        currentEvents = currentEvents.filter((ev, idx) => {
          if (!isNaN(numIdent) && (ev.atSeconds === numIdent || idx === numIdent)) return false;
          if (ev.characterName.toLowerCase() === ident) return false;
          if (ev.eventType.toLowerCase() === ident) return false;
          return true;
        });
        if (currentEvents.length < prevLen) {
          eventsChanged = true;
          summaries.push(`Deleted story event matching "${action.identifier}"`);
        } else {
          summaries.push(`Could not find story event matching "${action.identifier}" to delete`);
        }
        break;
      }

      case "replace_story_event": {
        const ident = String(action.identifier).toLowerCase().trim();
        const numIdent = parseInt(ident, 10);
        const idx = currentEvents.findIndex((ev, i) => {
          if (!isNaN(numIdent) && (ev.atSeconds === numIdent || i === numIdent)) return true;
          if (ev.characterName.toLowerCase() === ident) return true;
          return false;
        });

        if (idx !== -1) {
          const old = currentEvents[idx];
          currentEvents[idx] = {
            atSeconds: typeof action.replacement.atSeconds === "number" ? action.replacement.atSeconds : old.atSeconds,
            characterName: action.replacement.characterName || old.characterName,
            eventType: action.replacement.eventType || old.eventType,
          };
          currentEvents.sort((a, b) => a.atSeconds - b.atSeconds);
          eventsChanged = true;
          summaries.push(`Replaced story event at ${currentEvents[idx].atSeconds}s for "${currentEvents[idx].characterName}"`);
        } else {
          summaries.push(`Could not find story event matching "${action.identifier}" to replace`);
        }
        break;
      }

      case "lock_location": {
        const ident = String(action.sceneIdentifier).toLowerCase().trim();
        const numIdent = parseInt(ident, 10);
        const targetIdx = currentScenes.findIndex((s, idx) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        if (targetIdx !== -1) {
          const sc = currentScenes[targetIdx];
          const candId = action.candidateId;
          const locName = action.locationName?.trim();
          let matchedCand = sc.locationCandidates?.find((c) => {
            if (candId && c.candidate_id === candId) return true;
            if (locName && c.name.toLowerCase().includes(locName.toLowerCase())) return true;
            return false;
          });

          if (!matchedCand && locName) {
            const newCandId = `cand-${Date.now()}`;
            matchedCand = {
              candidate_id: newCandId,
              name: locName,
              region: sc.shootRegion || "Production Base",
              category: "practical",
              rank_score: 0.95,
              score_breakdown: { budget_fit: 0.9, creative_fit: 0.95, shootability: 0.9, consolidation_bonus: 0.8 },
              estimated_cost: { day_rate: 2500, permit_fee: 400, currency: "USD", notes: "Added by Showrunner directive." },
              shared_with_scenes: [sc.id],
              film_precedents: [],
              practical_notes: "Locked by Showrunner directive.",
              sources: [],
              search_grounded: false,
            };
            sc.locationCandidates = [matchedCand, ...(sc.locationCandidates || [])];
          }

          if (matchedCand) {
            currentScenes[targetIdx] = {
              ...sc,
              selectedLocationCandidateId: matchedCand.candidate_id,
              location: matchedCand.name,
            };
            scenesChanged = true;
            summaries.push(`Locked location "${matchedCand.name}" for Scene ${sc.sceneNumber}`);
          } else if (sc.locationCandidates && sc.locationCandidates.length > 0) {
            const defaultCand = sc.locationCandidates[0];
            currentScenes[targetIdx] = {
              ...sc,
              selectedLocationCandidateId: defaultCand.candidate_id,
              location: defaultCand.name,
            };
            scenesChanged = true;
            summaries.push(`Locked top location candidate "${defaultCand.name}" for Scene ${sc.sceneNumber}`);
          } else {
            summaries.push(`No candidates available to lock for Scene ${sc.sceneNumber}`);
          }
        } else {
          summaries.push(`Could not find scene matching "${action.sceneIdentifier}" to lock location`);
        }
        break;
      }

      case "unlock_location": {
        const ident = String(action.sceneIdentifier).toLowerCase().trim();
        const numIdent = parseInt(ident, 10);
        const targetIdx = currentScenes.findIndex((s, idx) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        if (targetIdx !== -1) {
          const sc = currentScenes[targetIdx];
          currentScenes[targetIdx] = {
            ...sc,
            selectedLocationCandidateId: undefined,
          };
          scenesChanged = true;
          summaries.push(`Unlocked location for Scene ${sc.sceneNumber}`);
        } else {
          summaries.push(`Could not find scene matching "${action.sceneIdentifier}" to unlock location`);
        }
        break;
      }

      case "set_scene_location": {
        const ident = String(action.sceneIdentifier).toLowerCase().trim();
        const numIdent = parseInt(ident, 10);
        const targetIdx = currentScenes.findIndex((s, idx) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        if (targetIdx !== -1) {
          const sc = currentScenes[targetIdx];
          currentScenes[targetIdx] = {
            ...sc,
            location: action.location || sc.location,
            shootRegion: action.shootRegion !== undefined ? action.shootRegion : sc.shootRegion,
            locationBudget: typeof action.locationBudget === "number" ? action.locationBudget : sc.locationBudget,
          };
          scenesChanged = true;
          summaries.push(`Updated location for Scene ${sc.sceneNumber} to "${action.location}"${action.shootRegion ? ` in ${action.shootRegion}` : ""}`);
        } else {
          summaries.push(`Could not find scene matching "${action.sceneIdentifier}" to set location`);
        }
        break;
      }

      case "add_location_candidate": {
        const ident = String(action.sceneIdentifier).toLowerCase().trim();
        const numIdent = parseInt(ident, 10);
        const targetIdx = currentScenes.findIndex((s, idx) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        if (targetIdx !== -1) {
          const sc = currentScenes[targetIdx];
          const cand = action.candidate;
          const candId = `cand-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
          const newCand = {
            candidate_id: candId,
            name: cand.name || "Custom Scouted Venue",
            category: cand.category || "practical",
            region: cand.region || sc.shootRegion || "Production Base",
            rank_score: 0.93,
            score_breakdown: { budget_fit: 0.9, creative_fit: 0.94, shootability: 0.92, consolidation_bonus: 0.85 },
            estimated_cost: {
              day_rate: cand.day_rate || 2500,
              permit_fee: cand.permit_fee || 400,
              currency: "USD" as const,
              notes: cand.practical_notes || "Configured via Showrunner Directive.",
            },
            film_precedents: cand.film_precedent ? [{ film: cand.film_precedent, director: cand.director || "Director Comp", why: cand.why || "Cinematic visual precedent" }] : [],
            practical_notes: cand.practical_notes || "Production venue added by Showrunner AI.",
            sources: [],
            search_grounded: false,
            environment_type: cand.environment_type || "practical",
            stage_specs: cand.stage_specs as any,
            shared_with_scenes: [sc.id],
          };

          const existing = sc.locationCandidates || [];
          const autoLock = cand.auto_lock ?? true;
          currentScenes[targetIdx] = {
            ...sc,
            locationCandidates: [newCand, ...existing],
            selectedLocationCandidateId: autoLock ? candId : sc.selectedLocationCandidateId,
            location: autoLock ? newCand.name : sc.location,
          };
          scenesChanged = true;
          summaries.push(`Added location candidate "${newCand.name}" to Scene ${sc.sceneNumber}${autoLock ? " (locked)" : ""}`);
        } else {
          summaries.push(`Could not find scene matching "${action.sceneIdentifier}" to add location candidate`);
        }
        break;
      }

      case "set_location_budget": {
        if (action.sceneIdentifier !== undefined) {
          const ident = String(action.sceneIdentifier).toLowerCase().trim();
          const numIdent = parseInt(ident, 10);
          const targetIdx = currentScenes.findIndex((s, idx) => {
            if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
            if (s.id.toLowerCase() === ident) return true;
            if (s.title.toLowerCase().includes(ident)) return true;
            return false;
          });

          if (targetIdx !== -1) {
            const sc = currentScenes[targetIdx];
            currentScenes[targetIdx] = {
              ...sc,
              locationBudget: typeof action.budget === "number" ? action.budget : sc.locationBudget,
            };
            scenesChanged = true;
            summaries.push(`Set location budget for Scene ${sc.sceneNumber} to $${action.budget?.toLocaleString()}`);
          }
        }
        if (typeof action.locationsPct === "number") {
          cb.saveProject?.({
            budgetAllocation: {
              locationsPct: action.locationsPct,
            },
          });
          summaries.push(`Updated project location budget allocation to ${action.locationsPct}%`);
        }
        break;
      }

      case "set_shoot_region": {
        const region = action.shootRegion.trim();
        if (action.sceneIdentifier !== undefined) {
          const ident = String(action.sceneIdentifier).toLowerCase().trim();
          const numIdent = parseInt(ident, 10);
          const targetIdx = currentScenes.findIndex((s, idx) => {
            if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
            if (s.id.toLowerCase() === ident) return true;
            if (s.title.toLowerCase().includes(ident)) return true;
            return false;
          });
          if (targetIdx !== -1) {
            currentScenes[targetIdx] = {
              ...currentScenes[targetIdx],
              shootRegion: region,
            };
            scenesChanged = true;
            summaries.push(`Set shoot region for Scene ${currentScenes[targetIdx].sceneNumber} to "${region}"`);
          }
        } else {
          cb.saveProject?.({ shootRegion: region });
          summaries.push(`Set project production base shoot region to "${region}"`);
        }
        break;
      }

      case "create_score_take": {
        const ident = action.sceneIdentifier !== undefined ? String(action.sceneIdentifier).toLowerCase().trim() : (currentActiveSceneId || "").toLowerCase();
        const numIdent = parseInt(ident, 10);
        let targetIdx = currentScenes.findIndex((s, idx) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        if (targetIdx === -1 && currentScenes.length > 0) {
          targetIdx = 0;
        }

        if (targetIdx !== -1) {
          const sc = currentScenes[targetIdx];
          const existingTakes = sc.scoreTakes || [];
          const nextTakeNum = existingTakes.length + 1;
          const dur = action.durationSec || 30;
          const modelName = action.model || (dur > 30 ? "Lyria 3 Pro" : "Lyria 3 Clip");

          const newTake: ScoreTake = {
            id: `score-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            sceneId: sc.id,
            takeNumber: nextTakeNum,
            title: action.title || `${sc.title} — ${modelName} Cue ${String(nextTakeNum).padStart(2, "0")}`,
            prompt: action.prompt || "Atmospheric cinematic score with emotional depth",
            durationMode: dur > 30 ? "pro" : "clip",
            durationSec: dur,
            createdAt: Date.now(),
            audioUrl: action.audioUrl || "/audio/demo-score.wav",
            lyricsText: action.lyricsText,
            isMaster: action.isMaster ?? (existingTakes.length === 0),
            scoreType: action.scoreType || "score",
            instruments: action.instruments,
            dynamicArc: action.dynamicArc,
            model: modelName,
          };

          const updatedTakes = [newTake, ...existingTakes];
          currentScenes[targetIdx] = {
            ...sc,
            activeScoreUrl: newTake.isMaster ? newTake.audioUrl : (sc.activeScoreUrl || newTake.audioUrl),
            scoreTakes: updatedTakes,
          };
          scenesChanged = true;
          summaries.push(`Generated ${modelName} score take for Scene ${sc.sceneNumber}: "${newTake.title}" (${dur}s)`);
        } else {
          summaries.push(`No scene available to attach score take`);
        }
        break;
      }

      case "set_master_score": {
        const ident = action.sceneIdentifier !== undefined ? String(action.sceneIdentifier).toLowerCase().trim() : (currentActiveSceneId || "").toLowerCase();
        const numIdent = parseInt(ident, 10);
        const targetIdx = currentScenes.findIndex((s, idx) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        if (targetIdx !== -1) {
          const sc = currentScenes[targetIdx];
          const takes = (sc.scoreTakes || []).map((t) => {
            const isMatch =
              (typeof action.takeNumber === "number" && t.takeNumber === action.takeNumber) ||
              (action.takeId && t.id === action.takeId);
            return { ...t, isMaster: Boolean(isMatch) };
          });
          const masterTake = takes.find((t) => t.isMaster);
          currentScenes[targetIdx] = {
            ...sc,
            activeScoreUrl: masterTake ? masterTake.audioUrl : sc.activeScoreUrl,
            scoreTakes: takes,
          };
          scenesChanged = true;
          summaries.push(`Locked master score take for Scene ${sc.sceneNumber}${masterTake ? ` ("${masterTake.title}")` : ""}`);
        } else {
          summaries.push(`Could not find scene matching "${action.sceneIdentifier}" to set master score`);
        }
        break;
      }

      case "delete_score_take": {
        const ident = action.sceneIdentifier !== undefined ? String(action.sceneIdentifier).toLowerCase().trim() : (currentActiveSceneId || "").toLowerCase();
        const numIdent = parseInt(ident, 10);
        const targetIdx = currentScenes.findIndex((s, idx) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        if (targetIdx !== -1) {
          const sc = currentScenes[targetIdx];
          const filteredTakes = (sc.scoreTakes || []).filter((t) => {
            if (typeof action.takeNumber === "number" && t.takeNumber === action.takeNumber) return false;
            if (action.takeId && t.id === action.takeId) return false;
            return true;
          });
          currentScenes[targetIdx] = {
            ...sc,
            scoreTakes: filteredTakes,
            activeScoreUrl: filteredTakes.find((t) => t.isMaster)?.audioUrl || filteredTakes[0]?.audioUrl,
          };
          scenesChanged = true;
          summaries.push(`Deleted score take from Scene ${sc.sceneNumber}`);
        } else {
          summaries.push(`Could not find scene matching "${action.sceneIdentifier}" to delete score take`);
        }
        break;
      }

      case "attach_asset": {
        const localAssets = getLocalAssets();
        const searchTerm = (action.assetName || action.assetId || "").toLowerCase().trim();
        const matchedAsset = localAssets.find(
          (a) =>
            a.id.toLowerCase() === searchTerm ||
            a.name.toLowerCase().includes(searchTerm) ||
            a.tags?.some((t) => t.toLowerCase() === searchTerm)
        );

        if (!matchedAsset) {
          summaries.push(`Could not find asset matching "${action.assetName || action.assetId}" in Asset Hub`);
          break;
        }

        if (action.targetType === "character") {
          const charIdent = String(action.targetIdentifier || "").toLowerCase().trim();
          const targetCharIdx = currentCharacters.findIndex(
            (c) => c.name.toLowerCase() === charIdent || c.name.toLowerCase().includes(charIdent)
          );
          if (targetCharIdx !== -1) {
            if (action.role === "body") {
              currentCharacters[targetCharIdx] = {
                ...currentCharacters[targetCharIdx],
                fullBodyImageUrl: matchedAsset.url,
              };
            } else {
              currentCharacters[targetCharIdx] = {
                ...currentCharacters[targetCharIdx],
                imageUrl: matchedAsset.url,
              };
            }
            charsChanged = true;
            summaries.push(`Attached asset "${matchedAsset.name}" to character ${currentCharacters[targetCharIdx].name} (${action.role || "headshot"})`);
          } else {
            summaries.push(`Character "${action.targetIdentifier}" not found to attach asset`);
          }
        } else if (action.targetType === "score_moodboard") {
          const scIdent = action.targetIdentifier !== undefined ? String(action.targetIdentifier).toLowerCase().trim() : (currentActiveSceneId || "").toLowerCase();
          const numIdent = parseInt(scIdent, 10);
          const targetIdx = currentScenes.findIndex((s, idx) => {
            if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
            if (s.id.toLowerCase() === scIdent) return true;
            return false;
          });
          if (targetIdx !== -1) {
            const sc = currentScenes[targetIdx];
            const existing = (sc as any).scoreMoodboardAssets || [];
            currentScenes[targetIdx] = {
              ...sc,
              scoreMoodboardAssets: Array.from(new Set([...existing, matchedAsset.id])),
            } as any;
            scenesChanged = true;
            summaries.push(`Linked asset "${matchedAsset.name}" as Lyria 3 moodboard conditioning for Scene ${sc.sceneNumber}`);
          }
        } else {
          // Target is Scene
          const scIdent = action.targetIdentifier !== undefined ? String(action.targetIdentifier).toLowerCase().trim() : (currentActiveSceneId || "").toLowerCase();
          const numIdent = parseInt(scIdent, 10);
          const targetIdx = currentScenes.findIndex((s, idx) => {
            if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
            if (s.id.toLowerCase() === scIdent) return true;
            if (s.title.toLowerCase().includes(scIdent)) return true;
            return false;
          });

          if (targetIdx !== -1) {
            const sc = currentScenes[targetIdx];
            const existingImages = sc.sceneImages || [];
            currentScenes[targetIdx] = {
              ...sc,
              preview_image_url: sc.preview_image_url || matchedAsset.url,
              sceneImages: [
                {
                  id: `img-${Date.now()}`,
                  url: matchedAsset.url,
                  prompt: `Reference plate: ${matchedAsset.name}`,
                  createdAt: Date.now(),
                  title: matchedAsset.name,
                  source: "custom",
                },
                ...existingImages,
              ],
            };
            scenesChanged = true;
            summaries.push(`Attached asset "${matchedAsset.name}" as visual reference for Scene ${sc.sceneNumber}`);
          } else {
            summaries.push(`Scene "${action.targetIdentifier}" not found to attach asset`);
          }
        }
        break;
      }

      case "create_asset_record": {
        const newAsset: CinemaAsset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: action.name,
          category: action.category as any,
          type: action.category === "video" ? "video" : action.category === "audio" ? "audio" : "image",
          url: action.url,
          thumbnailUrl: action.url,
          tags: action.tags || ["showrunner-created"],
          metadata: action.metadata || { generator: "Showrunner AI Directive" },
          createdAt: Date.now(),
        };
        saveLocalAsset(newAsset);
        summaries.push(`Cataloged new ${action.category} asset "${action.name}" in Asset Hub`);
        break;
      }

      case "generate_timeline_moment": {
        const ident = action.sceneIdentifier !== undefined ? String(action.sceneIdentifier).toLowerCase().trim() : (currentActiveSceneId || "").toLowerCase();
        const numIdent = parseInt(ident, 10);
        let targetIdx = currentScenes.findIndex((s, idx) => {
          if (!isNaN(numIdent) && (s.sceneNumber === numIdent || idx + 1 === numIdent)) return true;
          if (s.id.toLowerCase() === ident) return true;
          if (s.title.toLowerCase().includes(ident)) return true;
          return false;
        });

        if (targetIdx === -1 && currentScenes.length > 0) targetIdx = 0;

        if (targetIdx !== -1) {
          const sc = currentScenes[targetIdx];
          const timeSec = typeof action.timestampSec === "number" ? action.timestampSec : 0;
          const mins = Math.floor(timeSec / 60);
          const secs = String(Math.floor(timeSec % 60)).padStart(2, "0");

          const newMoment: TimelineMoment = {
            id: `moment-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            timestampSec: timeSec,
            imageUrl: action.imageUrl || "/assets/locations/ai_vault_plate.jpg",
            prompt: action.prompt || `Cinematic moment at ${timeSec}s in ${sc.title}: ${sc.summary}`,
            createdAt: Date.now(),
            styleId: action.stylePreset || "anamorphic_35mm",
            framingId: action.cameraFraming || "wide_master",
            label: action.label || `Still @ ${mins}:${secs} · ${action.cameraFraming || "Master"}`,
          };

          currentScenes[targetIdx] = {
            ...sc,
            timelineMoments: [...(sc.timelineMoments || []), newMoment],
          };
          scenesChanged = true;
          summaries.push(`Generated and staged timeline still for Scene ${sc.sceneNumber} at ${mins}:${secs}`);
        } else {
          summaries.push(`No scene found to attach timeline still`);
        }
        break;
      }

      case "switch_view": {
        cb.switchView?.(action.tab, action.subview);
        summaries.push(`Navigated studio view to ${action.subview ? `"${action.subview}" sub-view` : `"${action.tab}" tab`}`);
        break;
      }
    }
  }

  // Batch commit state updates
  if (nodesChanged) cb.setNodes?.(currentNodes);
  if (edgesChanged) cb.setEdges?.(currentEdges);
  if (charsChanged) cb.setCharacters?.(currentCharacters);
  if (scriptChanged) cb.setScreenplayText?.(currentScreenplay);
  if (metaChanged) {
    cb.setSceneTitle?.(currentTitle);
    cb.setSceneSummary?.(currentSummary);
  }
  if (scenesChanged) {
    cb.setScenes?.(currentScenes);
    if (currentActiveSceneId) cb.setActiveSceneId?.(currentActiveSceneId);
  }
  if (eventsChanged) {
    cb.setEvents?.(currentEvents);
  }

  // Save to persistence
  cb.saveProject?.({
    characters: charsChanged ? currentCharacters : undefined,
    screenplayText: scriptChanged ? currentScreenplay : undefined,
    sceneTitle: metaChanged ? currentTitle : undefined,
    sceneSummary: metaChanged ? currentSummary : undefined,
    scenes: scenesChanged ? currentScenes : undefined,
    activeSceneId: scenesChanged ? currentActiveSceneId : undefined,
    initialEvents: eventsChanged ? currentEvents : undefined,
  });

  // Record Take in Version Control
  if (summaries.length > 0 && cb.recordTakeChange) {
    const summaryHeadline = `AI Executive: ${summaries[0]}${summaries.length > 1 ? ` (+${summaries.length - 1} actions)` : ""}`;
    cb.recordTakeChange(summaryHeadline, "parameter", {
      nodes: currentNodes,
      edges: currentEdges,
      characters: currentCharacters,
      screenplayText: currentScreenplay,
      sceneTitle: currentTitle,
      sceneSummary: currentSummary,
    });
  }

  return {
    executedCount: summaries.length,
    summaries,
  };
}

