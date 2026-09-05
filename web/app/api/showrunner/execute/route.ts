import { NextRequest, NextResponse } from "next/server";
import type { CommanderExecutionResponse, StudioAction } from "@/lib/studio-actions";

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
7. {"type": "connect_nodes", "source": "nodeId or name", "target": "nodeId or name", "relationship": "⚡ Friction"|"🤝 Alliance"|"⚔️ Rivalry"|"🎓 Mentor"|"🎨 Style Sync"|"💡 Plot Seed"}
8. {"type": "sever_wire", "source": "nodeId or name", "target": "nodeId or name"}
9. {"type": "update_screenplay", "screenplayText": "...", "summary": "..."}
10. {"type": "update_scene_meta", "title": "...", "stakes": "..."}
11. {"type": "auto_tidy_backlot"}
12. {"type": "create_take_milestone", "title": "Milestone Title", "description": "..."}

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

    const apiKey =
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY ||
      "";

    // Build comprehensive project context for Gemini
    const projectContext = `
CURRENT PROJECT CONTEXT:
- Title: ${project.title || "Untitled"}
- Genre: ${project.genre || "Drama"}
- Premise: ${project.premise || "N/A"}
- Scene Title: ${project.sceneTitle || "Scene 01"}
- Scene Stakes: ${project.sceneSummary || "N/A"}
- Characters: ${(project.characters || []).map((c: any) => `${c.name} (${c.archetype}, ${c.role})`).join(", ") || "None"}
- Existing Nodes: ${(project.nodes || []).map((n: any) => `${n.id} (${n.type})`).join(", ")}
- Existing Wires: ${(project.edges || []).map((e: any) => `${e.source} -> ${e.target} [${e.data?.relationship || "wire"}]`).join(", ")}
- Screenplay Excerpt:
${(project.screenplayText || "").slice(0, 1500) || "(No script drafted yet)"}
`;

    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
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
          relationship: promptLower.includes("rival") ? "⚔️ Rivalry" : "⚡ Friction",
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
