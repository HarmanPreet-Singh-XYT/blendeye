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
4. {"type": "replace_character", "name": "Old Name", "replacement": {"name": "New Name", "role": "...", "archetype": "...", "confidence": 85, "verbalPacing": 70, "objective": "..."}}
5. {"type": "create_node", "nodeType": "clip"|"note"|"actor"|"personality"|"quirks"|"scene"|"script"|"chemistry"|"storyboard"|"floorplan"|"tensionCurve"|"tableRead"|"market", "title": "...", "data": {...}}
6. {"type": "delete_node", "nodeId": "nodeId or name"}
7. {"type": "update_node_data", "nodeId": "nodeId or name", "patch": {...}}
8. {"type": "connect_nodes", "source": "nodeId or name", "target": "nodeId or name", "relationship": "Friction"|"Alliance"|"Rivalry"|"Mentor"|"Style Sync"|"Plot Seed"}
9. {"type": "sever_wire", "source": "nodeId or name", "target": "nodeId or name"}
10. {"type": "update_screenplay", "screenplayText": "...", "summary": "..."}
11. {"type": "update_scene_meta", "title": "...", "stakes": "..."}
12. {"type": "update_project_meta", "patch": {"title": "...", "logline": "...", "genre": "...", "directorStyle": "...", "narrativeFormat": "feature"|"pilot"|"short", "targetRuntimeMinutes": 110}}
13. {"type": "auto_tidy_backlot"}
14. {"type": "create_take_milestone", "title": "Milestone Title", "description": "..."}
15. {"type": "create_scene", "title": "Scene Title", "slugline": "INT/EXT. LOCATION - DAY/NIGHT", "summary": "Dramatic stakes & narrative progression", "location": "Location Name", "castPresent": ["Character 1", "Character 2"], "durationSeconds": 180, "position": "end"|"start"|number, "screenplayText": "Screenplay content..."}
16. {"type": "delete_scene", "sceneIdentifier": 2 (sceneNumber) | "scene-id" | "Scene Title"}
17. {"type": "replace_scene", "sceneIdentifier": 2 (sceneNumber) | "scene-id" | "Scene Title", "replacement": {"title": "...", "slugline": "...", "summary": "...", "location": "...", "durationSeconds": 180, "castPresent": ["..."], "screenplayText": "..."}}
18. {"type": "reorder_scenes", "sceneOrder": [2, 1, 3] (new chronological order of scene numbers, IDs, or titles)}
19. {"type": "move_scene", "sceneIdentifier": 2, "targetIndex": 0, "direction": "up"|"down"}
20. {"type": "update_scene", "sceneIdentifier": 2, "patch": {"title": "...", "slugline": "...", "summary": "...", "location": "...", "durationSeconds": 180, "castPresent": ["..."], "screenplayText": "..."}}
21. {"type": "create_story_event", "atSeconds": 120, "characterName": "Elena", "eventType": "known_fact"|"unaware_of"|"location"|"objective"}
22. {"type": "delete_story_event", "identifier": 120 (atSeconds) | "Elena" | "objective"}
23. {"type": "replace_story_event", "identifier": 120, "replacement": {"atSeconds": 150, "characterName": "Elena", "eventType": "objective"}}
24. {"type": "lock_location", "sceneIdentifier": 2 (sceneNumber) | "scene-id" | "Scene Title", "locationName": "Venue Name", "candidateId": "optional-candidate-id"}
25. {"type": "unlock_location", "sceneIdentifier": 2 (sceneNumber) | "scene-id"}
26. {"type": "set_scene_location", "sceneIdentifier": 2, "location": "New Location Setting", "shootRegion": "City/Region", "locationBudget": 12000}
27. {"type": "add_location_candidate", "sceneIdentifier": 2, "candidate": {"name": "Venue Name", "category": "practical"|"warehouse"|"rooftop"|"vault"|"studio"|"historic", "region": "City/State", "day_rate": 2500, "permit_fee": 400, "film_precedent": "Movie Title", "director": "Director Name", "why": "Why it fits", "practical_notes": "...", "environment_type": "practical"|"studio_stage"|"green_screen", "auto_lock": true}}
28. {"type": "set_location_budget", "sceneIdentifier": optional 2, "budget": 15000, "locationsPct": 20}
29. {"type": "set_shoot_region", "shootRegion": "New York, NY" | "London, UK" | "Los Angeles, CA", "sceneIdentifier": optional 2}
30. {"type": "create_score_take", "sceneIdentifier": 2, "title": "Score Cue", "prompt": "Tense cinematic strings", "durationSec": 30|60|90, "scoreType": "score"|"source"|"vocal", "model": "Lyria 3 Pro"|"Lyria 3 Clip", "instruments": ["Strings", "Synth Bass"], "dynamicArc": "slow-burn"|"crescendo"|"staccato", "lyricsText": "Optional vocal lyrics..."}
31. {"type": "set_master_score", "sceneIdentifier": 2, "takeNumber": 1}
32. {"type": "delete_score_take", "sceneIdentifier": 2, "takeNumber": 1}
33. {"type": "attach_asset", "assetName": "Sub-Level Concrete Vault", "targetType": "scene"|"character"|"score_moodboard", "targetIdentifier": 2|"Marcus", "role": "plate"|"face"|"body"|"moodboard"}
34. {"type": "create_asset_record", "name": "Asset Name", "category": "location"|"character_face"|"character_body"|"style"|"video"|"audio"|"map", "url": "/assets/...", "tags": ["tag1", "tag2"]}
35. {"type": "generate_timeline_moment", "sceneIdentifier": 2, "timestampSec": 45, "prompt": "Marcus confronting Elena under harsh neon rim lighting", "stylePreset": "anamorphic_35mm", "cameraFraming": "wide_master"}
36. {"type": "switch_view", "tab": "planning"|"simulation"|"generation"|"showrunner", "subview": "canvas"|"timeline"|"score"|"video"|"location"|"floorplan"|"assets"}

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
        directorStyle: project.directorStyle,
        screenplayText: project.screenplayText,
        characters: project.characters,
        nodes: project.nodes,
        edges: project.edges,
        history,
        scenes: project.scenes,
        activeSceneId: project.activeSceneId,
        events: project.events,
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
            (s: any, idx: number) => {
              const scriptText = (s.screenplayText || "").trim();
              const scriptSnip = scriptText.length > 250 ? scriptText.slice(0, 250) + "..." : (scriptText || "(No script drafted)");
              const locked = s.locationCandidates?.find((c: any) => c.candidate_id === s.selectedLocationCandidateId);
              const locInfo = locked
                ? `Locked Venue: "${locked.name}" ($${(locked.estimated_cost?.day_rate || 0).toLocaleString()}/day, ${locked.region || s.shootRegion || "Production Base"})`
                : `Setting: "${s.location || "TBD"}" (Region: ${s.shootRegion || project.shootRegion || "Base"}, Budget: $${s.locationBudget ? s.locationBudget.toLocaleString() : "Default"}, Scouted Candidates: ${s.locationCandidates?.length || 0})`;
              const momentsCount = s.timelineMoments?.length || 0;
              const scoresCount = s.scoreTakes?.length || 0;
              const activeScore = s.scoreTakes?.find((t: any) => t.isMaster) || s.scoreTakes?.[0];
              const scoreInfo = scoresCount > 0 ? `${scoresCount} score takes (Active: "${activeScore?.title || "Score"}", ${activeScore?.model || "Lyria 3"})` : "No score composed";
              return `  - Scene ${s.sceneNumber || idx + 1}: "${s.title || "Scene"}" (${s.slugline || ""}) | Duration: ${s.durationSeconds || 120}s | Cast: ${(s.castPresent || []).join(", ") || "None"} | Stakes: ${s.summary || "N/A"}${s.id === project.activeSceneId ? " [CURRENT ACTIVE SCENE]" : ""}\n    Location: ${locInfo}\n    Audio & Visual Staging: [Timeline Moments: ${momentsCount} generated stills] | [Music: ${scoreInfo}]\n    Script snippet: "${scriptSnip.replace(/\n/g, ' ')}"`;
            }
          )
          .join("\n")
      : "  - Single scene project";

    const eventsList = Array.isArray(project.events) ? project.events : [];
    const eventsContext = eventsList.length > 0
      ? eventsList
          .map((e: any) => `  - Beat at ${e.atSeconds || 0}s: ${e.characterName || "Character"} (${e.eventType || "event"})`)
          .join("\n")
      : "  - No story beat markers";

    const assetsList = Array.isArray(project.assets) ? project.assets : [];
    const assetsContext = assetsList.length > 0
      ? assetsList.slice(0, 12).map((a: any) => `  - "${a.name}" [Category: ${a.category}] [Tags: ${(a.tags || []).join(", ")}]`).join("\n")
      : "  - Seeded plates & character portraits available in Asset Hub";

    // Build comprehensive project context for Gemini
    const projectContext = `
CURRENT PROJECT CONTEXT:
- Title: ${project.title || "Untitled"}
- Genre: ${project.genre || "Drama"}
- Premise: ${project.premise || "N/A"}
- Director Style: ${project.directorStyle || "Cinematic"}
- Production Base Shoot Region: ${project.shootRegion || "Los Angeles, CA"}
- Budget & Allocation: $${(project.budget || 250000).toLocaleString()} (Locations: ${project.budgetAllocation?.locationsPct ?? 15}%)
- Active Scene Title: ${project.sceneTitle || "Scene 01"}
- Active Scene Stakes: ${project.sceneSummary || "N/A"}
- Characters: ${(project.characters || []).map((c: any) => `${c.name} (${c.archetype}, ${c.role})`).join(", ") || "None"}
- Multi-Scene Sequence Reel (with locations, music cues & timeline moments):
${scenesContext}
- Available Studio Assets (Asset Hub):
${assetsContext}
- Timeline Story Beats:
${eventsContext}
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

    // Replace scene
    const replaceSceneMatch = userPrompt.match(/(?:replace)\s+(?:scene\s+)?(\d+|[a-zA-Z0-9_-]+)\s+(?:with\s+)?(.+)/i);
    if (replaceSceneMatch) {
      const sceneId = replaceSceneMatch[1];
      const desc = replaceSceneMatch[2].trim();
      localActions.push({
        type: "replace_scene",
        sceneIdentifier: !isNaN(parseInt(sceneId, 10)) ? parseInt(sceneId, 10) : sceneId,
        replacement: {
          title: desc.length > 30 ? desc.slice(0, 30) + "..." : desc,
          summary: desc,
          slugline: `INT/EXT. ${desc.toUpperCase().slice(0, 20)} - NIGHT`,
          screenplayText: `INT/EXT. LOCATION - NIGHT\n\n[Action: ${desc}]\n\nCHARACTER\n(determined)\nWe move now.`,
        },
      });
      thought += `Replaced scene ${sceneId} with "${desc}". `;
      reply = `Replaced Scene ${sceneId} with the new dramatic beat: "${desc}".`;
    }

    // Delete scene
    const deleteSceneMatch = userPrompt.match(/(?:delete|remove)\s+scene\s+(\d+|[a-zA-Z0-9_-]+)/i);
    if (deleteSceneMatch && !replaceSceneMatch) {
      const sceneId = deleteSceneMatch[1];
      localActions.push({
        type: "delete_scene",
        sceneIdentifier: !isNaN(parseInt(sceneId, 10)) ? parseInt(sceneId, 10) : sceneId,
      });
      thought += `Deleted scene ${sceneId}. `;
      reply = `Deleted Scene ${sceneId} from the sequence reel.`;
    }

    // Replace character
    const replaceCharMatch = userPrompt.match(/(?:replace)\s+(?:character\s+)?([A-Za-z0-9_-]+)\s+with\s+([A-Za-z0-9_-]+)/i);
    if (replaceCharMatch) {
      const oldName = replaceCharMatch[1];
      const newName = replaceCharMatch[2];
      localActions.push({
        type: "replace_character",
        name: oldName,
        replacement: {
          name: newName,
          role: "Dynamic Specialist",
          archetype: "Strategic Operator",
          confidence: 80,
          verbalPacing: 70,
        },
      });
      thought += `Replaced character "${oldName}" with "${newName}". `;
      reply = `Replaced character **${oldName}** with **${newName}** and updated backlot nodes.`;
    }

    // Delete character
    const deleteCharMatch = userPrompt.match(/(?:delete|remove)\s+(?:character\s+)?([A-Za-z0-9_-]+)/i);
    if (deleteCharMatch && !promptLower.includes("scene") && !replaceCharMatch) {
      const charName = deleteCharMatch[1];
      localActions.push({
        type: "delete_character",
        name: charName,
      });
      thought += `Removed character "${charName}". `;
      reply = `Removed character **${charName}** and cleared associated backlot nodes.`;
    }

    // Project metadata changes
    const titleMatch = userPrompt.match(/(?:change|set|update)\s+(?:project\s+|film\s+|movie\s+)?title\s+to\s+["']?([^"'\n.]+)["']?/i);
    const genreMatch = userPrompt.match(/(?:change|set|update)\s+(?:project\s+|film\s+|movie\s+)?genre\s+to\s+["']?([^"'\n.]+)["']?/i);
    if (titleMatch || genreMatch) {
      const metaPatch: any = {};
      if (titleMatch) metaPatch.title = titleMatch[1].trim();
      if (genreMatch) metaPatch.genre = genreMatch[1].trim();
      localActions.push({
        type: "update_project_meta",
        patch: metaPatch,
      });
      thought += `Updated project metadata. `;
      reply = `Updated project configuration${metaPatch.title ? ` (Title: "${metaPatch.title}")` : ""}${metaPatch.genre ? ` (Genre: "${metaPatch.genre}")` : ""}.`;
    }

    // Lyria 3 score take command
    if (promptLower.includes("score") || promptLower.includes("music") || promptLower.includes("soundtrack") || promptLower.includes("lyria")) {
      const sceneNumMatch = userPrompt.match(/(?:scene\s+)(\d+)/i);
      const sceneNum = sceneNumMatch ? parseInt(sceneNumMatch[1], 10) : undefined;
      const isPro = promptLower.includes("pro") || promptLower.includes("60") || promptLower.includes("full");
      localActions.push({
        type: "create_score_take",
        sceneIdentifier: sceneNum,
        title: `Lyria 3 Cinematic Score Cue`,
        prompt: `High-tension orchestral strings and sub-bass pulse tailored for dramatic cinema`,
        durationSec: isPro ? 60 : 30,
        model: isPro ? "Lyria 3 Pro" : "Lyria 3 Clip",
        scoreType: promptLower.includes("vocal") ? "vocal" : promptLower.includes("source") ? "source" : "score",
        dynamicArc: "Slow-burn escalation to peak climax",
        instruments: ["Cinematic Strings", "Synthesizer", "Sub-Bass"],
      });
      thought += `Generated Lyria 3 score cue take${sceneNum ? ` for Scene ${sceneNum}` : ""}. `;
      reply = `Composed and attached a new **${isPro ? "Lyria 3 Pro (60s)" : "Lyria 3 Clip (30s)"}** cinematic score take with dynamic arc and orchestral instruments.`;
    }

    // Timeline image generation command
    if (promptLower.includes("timeline") || (promptLower.includes("frame") && promptLower.includes("at")) || promptLower.includes("still")) {
      const timeMatch = userPrompt.match(/(\d+)\s*(?:s|sec|seconds)?/i);
      const timeSec = timeMatch ? parseInt(timeMatch[1], 10) : 30;
      const sceneNumMatch = userPrompt.match(/(?:scene\s+)(\d+)/i);
      const sceneNum = sceneNumMatch ? parseInt(sceneNumMatch[1], 10) : undefined;
      localActions.push({
        type: "generate_timeline_moment",
        sceneIdentifier: sceneNum || 1,
        timestampSec: timeSec,
        prompt: `Cinematic anamorphic widescreen film still captured at ${timeSec}s: high atmospheric tension, volumetric lighting`,
        stylePreset: "anamorphic_35mm",
        cameraFraming: "wide_master",
      });
      thought += `Staged timeline keyframe moment at ${timeSec}s. `;
      reply = `Generated and staged a 35mm anamorphic timeline still at **${timeSec}s** on the sequence reel.`;
    }

    // Asset attachment command
    if (promptLower.includes("attach") || promptLower.includes("link asset") || promptLower.includes("use asset")) {
      const isChar = promptLower.includes("character") || promptLower.includes("marcus") || promptLower.includes("elena");
      localActions.push({
        type: "attach_asset",
        assetName: promptLower.includes("vault") ? "Sub-Level Concrete Vault" : promptLower.includes("pier") ? "Rain-Slicked Pier Docks" : "Marcus — Chiaroscuro",
        targetType: isChar ? "character" : "scene",
        targetIdentifier: isChar ? (promptLower.includes("elena") ? "Elena" : "Marcus") : 1,
        role: isChar ? "face" : "plate",
      });
      thought += `Linked asset to ${isChar ? "character" : "scene"}. `;
      reply = `Attached reference plate asset from Asset Hub to ${isChar ? "character profile" : "Scene 1 visual board"}.`;
    }

    // View switching command
    if (promptLower.includes("open") || promptLower.includes("switch") || promptLower.includes("go to") || promptLower.includes("show")) {
      if (promptLower.includes("score") || promptLower.includes("music") || promptLower.includes("audio")) {
        localActions.push({ type: "switch_view", tab: "simulation", subview: "score" });
        thought += `Navigated to score studio. `;
        reply = `Switched workspace to the **Lyria 3 Music Score Studio**.`;
      } else if (promptLower.includes("timeline")) {
        localActions.push({ type: "switch_view", tab: "generation", subview: "timeline" });
        thought += `Navigated to timeline canvas. `;
        reply = `Switched workspace to the **Scene Timeline Canvas**.`;
      } else if (promptLower.includes("asset")) {
        localActions.push({ type: "switch_view", tab: "planning", subview: "assets" });
        thought += `Navigated to asset hub. `;
        reply = `Switched workspace to the **Studio Asset Hub**.`;
      }
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
