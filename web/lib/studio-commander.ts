import type { Node, Edge } from "@xyflow/react";
import type { ProjectCharacter } from "@/lib/project-store";
import type { StudioAction, CommanderExecutionResponse } from "@/lib/studio-actions";
import { autoTidyBacklot } from "@/lib/backlot-layout";
import { StudioVersionControl } from "@/lib/version-control";

export interface CommanderContext {
  nodes: Node[];
  edges: Edge[];
  characters: ProjectCharacter[];
  screenplayText: string;
  sceneTitle: string;
  sceneSummary: string;
  genre: string;
  projectId: string;
  vcs: StudioVersionControl | null;
}

export interface CommanderCallbacks {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setCharacters: React.Dispatch<React.SetStateAction<ProjectCharacter[]>>;
  setScreenplayText: (text: string) => void;
  setSceneTitle: (title: string) => void;
  setSceneSummary: (summary: string) => void;
  saveProject: (patch: Record<string, any>) => void;
  recordTakeChange: (summary: string, category: any, custom?: any) => void;
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

  let currentNodes = [...ctx.nodes];
  let currentEdges = [...ctx.edges];
  let currentCharacters = [...ctx.characters];
  let currentScreenplay = ctx.screenplayText;
  let currentTitle = ctx.sceneTitle;
  let currentSummary = ctx.sceneSummary;

  let nodesChanged = false;
  let edgesChanged = false;
  let charsChanged = false;
  let scriptChanged = false;
  let metaChanged = false;

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
    }
  }

  // Batch commit state updates
  if (nodesChanged) cb.setNodes(currentNodes);
  if (edgesChanged) cb.setEdges(currentEdges);
  if (charsChanged) cb.setCharacters(currentCharacters);
  if (scriptChanged) cb.setScreenplayText(currentScreenplay);
  if (metaChanged) {
    cb.setSceneTitle(currentTitle);
    cb.setSceneSummary(currentSummary);
  }

  // Save to persistence
  cb.saveProject({
    characters: charsChanged ? currentCharacters : undefined,
    screenplayText: scriptChanged ? currentScreenplay : undefined,
    sceneTitle: metaChanged ? currentTitle : undefined,
    sceneSummary: metaChanged ? currentSummary : undefined,
  });

  // Record Take in Version Control
  if (summaries.length > 0) {
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

