import { NextRequest, NextResponse } from "next/server";
import type { CitedPrecedent, CommanderExecutionResponse, StudioAction } from "@/lib/studio-actions";
import { getPrecedents, executeShowrunnerDirective } from "@/lib/agent-service";

const SYSTEM_PROMPT = `
You are the Omniscient Studio Executive AI & Lead Showrunner for an elite Hollywood production studio.
You have FULL CREATIVE AND EXECUTIVE AUTHORITY over the entire film project.
You can modify, change, edit, remove, wire, and execute ANY CRUD operations across the project based on the director's vision.

AVAILABLE ACTIONS YOU CAN EMIT IN "actions":
1. {"type": "create_character", "name": "Name", "role": "Role", "archetype": "Archetype", "confidence": 0-100, "verbalPacing": 0-100, "subtextRatio": "high"|"low", "personalityPreset": "Preset", "objective": "Goal"}
2. {"type": "update_character", "name": "Name", "patch": {"confidence": 95, "verbalPacing": 80, "speechStyle": "...", "objective": "..."}}
3. {"type": "delete_character", "name": "Name"}
4. {"type": "create_node", "nodeType": "clip"|"note"|"actor"|"personality"|"quirks"|"scene"|"script"|"chemistry"|"storyboard"|"floorplan"|"tensionCurve"|"tableRead"|"market", "title": "...", "data": {...}}
5. {"type": "delete_node", "nodeId": "nodeId or name"}
6. {"type": "update_node_data", "nodeId": "nodeId or name", "patch": {...}}
7. {"type": "connect_nodes", "source": "nodeId or name", "target": "nodeId or name", "relationship": "Friction"|"Alliance"|"Rivalry"|"Mentor"|"Style Sync"|"Plot Seed"}
8. {"type": "sever_wire", "source": "nodeId or name", "target": "nodeId or name"}
9. {"type": "update_screenplay", "screenplayText": "...", "summary": "..."}
10. {"type": "update_scene_meta", "title": "...", "stakes": "..."}
11. {"type": "auto_tidy_backlot"}
12. {"type": "create_take_milestone", "title": "Milestone Title", "description": "..."}
13. {"type": "create_scene", "title": "Scene Title", "slugline": "INT/EXT. LOCATION - DAY/NIGHT", "summary": "Dramatic stakes & narrative progression", "location": "Location Name", "castPresent": ["Character 1", "Character 2"], "durationSeconds": 180, "position": "end"|"start"|number, "screenplayText": "Screenplay content..."}
14. {"type": "delete_scene", "sceneIdentifier": 2 (sceneNumber) | "scene-id" | "Scene Title"}
15. {"type": "reorder_scenes", "sceneOrder": [2, 1, 3] (new chronological order of scene numbers, IDs, or titles)}
16. {"type": "move_scene", "sceneIdentifier": 2, "targetIndex": 0, "direction": "up"|"down"}
17. {"type": "update_scene", "sceneIdentifier": 2, "patch": {"title": "...", "slugline": "...", "summary": "...", "location": "...", "durationSeconds": 180, "castPresent": ["..."], "screenplayText": "..."}}

OUTPUT FORMAT:
You MUST respond with a single, valid, raw JSON object matching:
{
  "thought_process": "Detailed step-by-step creative reasoning on what the director wants and why these changes serve the drama",
  "assistant_message": "Direct, collegial Hollywood executive response detailing the actions executed",
  "actions": [ ... list of action objects ... ]
}
Do NOT wrap in markdown quotes or backticks if possible, return clean parseable JSON.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userPrompt = typeof body?.userPrompt === "string" ? body.userPrompt.trim() : "";
    const project = body?.project || {};
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!userPrompt) {
      return NextResponse.json({ error: "userPrompt is required" }, { status: 400 });
    }

    // First: Delegate to Python agent-service's Google ADK Showrunner agent
    try {
      const pythonRes = await executeShowrunnerDirective({
        userPrompt,
        projectTitle: project.title,
        logline: project.premise,
        genre: project.genre,
        screenplayText: project.screenplayText,
        characters: project.characters,
        nodes: project.nodes,
        edges: project.edges,
        history,
        scenes: project.scenes,
        activeSceneId: project.activeSceneId,
      });

      if (pythonRes && (pythonRes.actions || pythonRes.assistant_message)) {
        return NextResponse.json(pythonRes);
      }
    } catch (agentErr) {
      console.warn("Python agent-service showrunner directive unavailable, falling back:", agentErr);
    }

    const apiKey =
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY ||
      "";

    // Ground the Executive AI in real ClickHouse cinematic precedent data —
    // the same `cinematic_precedents` table & query used by the market/territory
    // views, so the commander's creative reasoning is backed by real rows,
    // not an invented "studio_commander" telemetry string.
    const CLICKHOUSE_PRECEDENTS_SQL =
      "SELECT genre, trope, historical_reference, tension_level, commercial_territory, audience_retention_pct, precedent_example " +
      "FROM cinematic_precedents ORDER BY audience_retention_pct DESC LIMIT 3";
    let precedentsCited: CitedPrecedent[] = [];
    try {
      const allPrecedents = await getPrecedents(project.genre || "");
      precedentsCited = allPrecedents.slice(0, 3);
    } catch (precedentErr) {
      console.warn("Commander precedent grounding unavailable:", precedentErr);
    }

    const precedentContext = precedentsCited.length
      ? precedentsCited
          .map(
            (p) =>
              `- ${p.historical_reference} | ${p.trope} | Tension ${p.tension_level}/10 | ${p.audience_retention_pct}% retention (${p.commercial_territory})`
          )
          .join("\n")
      : "- No ClickHouse precedent rows available for this genre.";

    const scenesList = Array.isArray(project.scenes) ? project.scenes : [];
    const scenesContext = scenesList.length > 0
      ? scenesList
          .map(
            (s: any, idx: number) =>
              `  - Scene ${s.sceneNumber || idx + 1}: "${s.title || "Scene"}" (${s.slugline || ""}) | Duration: ${s.durationSeconds || 120}s | Cast: ${(s.castPresent || []).join(", ") || "None"} | Stakes: ${s.summary || "N/A"}${s.id === project.activeSceneId ? " [CURRENT ACTIVE SCENE]" : ""}`
          )
          .join("\n")
      : "  - Single scene project";

    // Build comprehensive project context for Gemini
    const projectContext = `
CURRENT PROJECT CONTEXT:
- Title: ${project.title || "Untitled"}
- Genre: ${project.genre || "Drama"}
- Premise: ${project.premise || "N/A"}
- Active Scene Title: ${project.sceneTitle || "Scene 01"}
- Active Scene Stakes: ${project.sceneSummary || "N/A"}
- Characters: ${(project.characters || []).map((c: any) => `${c.name} (${c.archetype}, ${c.role})`).join(", ") || "None"}
- Multi-Scene Sequence Reel:
${scenesContext}
- Existing Nodes: ${(project.nodes || []).map((n: any) => `${n.id} (${n.type})`).join(", ")}
- Existing Wires: ${(project.edges || []).map((e: any) => `${e.source} -> ${e.target} [${e.data?.relationship || "wire"}]`).join(", ")}
- Active Scene Screenplay Excerpt:
${(project.screenplayText || "").slice(0, 1500) || "(No script drafted yet)"}

CLICKHOUSE GROUNDING (real cinematic precedent benchmarks for this genre):
${precedentContext}
`;

    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`;
        const contents = [
          {
            role: "user",
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\n${projectContext}\n\nDIRECTOR'S COMMAND: "${userPrompt}"\n\nReturn strictly valid JSON:`,
              },
            ],
          },
        ];

        const geminiRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText) as CommanderExecutionResponse;
            parsed.precedents_cited = precedentsCited;
            parsed.clickhouse_query_sql = precedentsCited.length ? CLICKHOUSE_PRECEDENTS_SQL : undefined;
            return NextResponse.json(parsed);
          }
        }
      } catch (geminiErr) {
        console.warn("Direct Gemini call error, falling back to local reasoning:", geminiErr);
      }
    }

    // Fallback: Local Semantic Reasoning Engine
    const localActions: StudioAction[] = [];
    const promptLower = userPrompt.toLowerCase();

    let thought = `Analyzed director directive: "${userPrompt}". `;
    let reply = `Understood. Executing studio modifications based on your directive.`;

    // Character addition
    const addCharMatch = userPrompt.match(/(?:add|create|introduce)\s+(?:a\s+)?(?:character\s+)?(?:named\s+)?([A-Z][a-zA-Z0-9_-]+)/i);
    if (addCharMatch) {
      const name = addCharMatch[1];
      const role = promptLower.includes("rival") ? "Rival Antagonist" : promptLower.includes("ally") ? "Key Ally" : "Dynamic Specialist";
      const archetype = promptLower.includes("hacker") ? "Cyber Infiltrator" : promptLower.includes("rival") ? "Ruthless Competitor" : "Strategic Operator";

      localActions.push({
        type: "create_character",
        name,
        role,
        archetype,
        confidence: 85,
        verbalPacing: 75,
        subtextRatio: "high",
        objective: `Challenge existing power dynamics as ${role}`,
      });

      // If prompt also mentions wiring/linking
      if (promptLower.includes("wire") || promptLower.includes("connect") || promptLower.includes("link")) {
        const existingChar = project.characters?.[0]?.name || "Elena";
        localActions.push({
          type: "connect_nodes",
          source: `node-actor-${name.toLowerCase()}`,
          target: `node-actor-${existingChar.toLowerCase()}`,
          relationship: promptLower.includes("rival") ? "Rivalry" : "Friction",
        });
      }
      thought += `Created character ${name} with ${archetype} archetype and linked to scene dynamics. `;
      reply = `I have introduced **${name}** as a ${role}, spawned his actor and dial nodes on the canvas, and established his psychological stakes.`;
    }

    // Dial adjustment
    const dialMatch = userPrompt.match(/(?:set|crank|adjust|change)\s+([a-zA-Z]+)(?:'s)?\s+(confidence|pacing|subtext)\s+(?:to\s+)?(\d+)/i);
    if (dialMatch) {
      const charName = dialMatch[1];
      const val = parseInt(dialMatch[3], 10);
      const patch: any = {};
      if (dialMatch[2].toLowerCase().includes("confid")) patch.confidence = val;
      if (dialMatch[2].toLowerCase().includes("pacing")) patch.verbalPacing = val;
      if (dialMatch[2].toLowerCase().includes("subtext")) patch.subtextRatio = val > 75 ? "very high" : "high";

      localActions.push({
        type: "update_character",
        name: charName,
        patch,
      });
      thought += `Adjusted ${charName}'s ${dialMatch[2]} dial to ${val}%. `;
      reply = `Adjusted **${charName}'s** performance dials to ${val}%.`;
    }

    // Tidy backlot
    if (promptLower.includes("tidy") || promptLower.includes("align") || promptLower.includes("organize") || promptLower.includes("clean")) {
      localActions.push({ type: "auto_tidy_backlot" });
      thought += `Realigned canvas nodes into production workflow lanes. `;
      if (localActions.length === 1) {
        reply = `Reorganized the backlot canvas into aligned Hollywood production workflow columns.`;
      }
    }

    // Unlinking / Severing
    const unlinkMatch = userPrompt.match(/(?:unlink|sever|disconnect)\s+(?:between\s+)?([A-Za-z0-9_-]+)\s+(?:and|to|from)\s+([A-Za-z0-9_-]+)/i);
    if (unlinkMatch) {
      localActions.push({
        type: "sever_wire",
        source: unlinkMatch[1],
        target: unlinkMatch[2],
      });
      thought += `Severed wire between ${unlinkMatch[1]} and ${unlinkMatch[2]}. `;
      reply = `Severed the connection between **${unlinkMatch[1]}** and **${unlinkMatch[2]}**.`;
    }

    // Direct screenplay rewrite or beat injection
    if (promptLower.includes("rewrite") || promptLower.includes("add twist") || promptLower.includes("script")) {
      const currentText = project.screenplayText || "";
      const injectedBeat = `\n\nEXT. SERVICE SHAFT - SUDDEN BLACKOUT\n\nThe power cuts out abruptly. Volumetric red emergency strobes pulse against the steel grates.\n\nELENA\n(whispering with sharp subtext)\nSomeone just cut the main grid. We have sixty seconds.\n`;
      localActions.push({
        type: "update_screenplay",
        screenplayText: currentText + injectedBeat,
        summary: "Injected sudden power failure crisis beat into master draft",
      });
      thought += `Injected high-tension narrative beat into master screenplay draft. `;
      reply = `Rewrote the climax of the current scene to incorporate a high-stakes blackout twist.`;
    }

    const fallbackResponse: CommanderExecutionResponse = {
      thought_process: thought,
      assistant_message: reply,
      actions: localActions,
      precedents_cited: precedentsCited,
      clickhouse_query_sql: precedentsCited.length ? CLICKHOUSE_PRECEDENTS_SQL : undefined,
      _fallback: true,
    };

    return NextResponse.json(fallbackResponse);
  } catch (err) {
    console.error("Studio Commander execution error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Commander execution failed" },
      { status: 500 }
    );
  }
}
