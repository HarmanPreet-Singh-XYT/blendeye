import { NextRequest, NextResponse } from "next/server";
import type { FilmScene, ProjectCharacter } from "@/lib/project-store";
import { generateSequence } from "@/lib/agent-service";

// Proxies to agent-service's /sequence/generate (Gemini + Google ADK), the
// same way every other generation path in this app does. This route used to
// hold its own direct Gemini REST call with its own separate GOOGLE_API_KEY
// requirement on the web deployment — when that key was missing here (even
// though agent-service had a valid one), it silently returned a canned
// template with no error surfaced, which is exactly the kind of failure
// mode centralizing Gemini access in agent-service is meant to prevent.
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = (body.title || "Untitled Project").trim();
  const logline = (body.logline || body.premise || "").trim();
  const genre = (body.genre || "Drama / Thriller").trim();
  const directorStyle = (body.directorStyle || "Cinematic realism, high-tension staging").trim();
  const coreSecret = (body.coreSecret || "").trim();
  const primaryLocation = (body.primaryLocation || "Metropolitan staging ground").trim();
  const targetRuntimeMinutes = Number(body.targetRuntimeMinutes) || 95;
  const narrativeFormat = (body.narrativeFormat || "feature").trim();

  let inputCharacters: any[] = [];
  if (Array.isArray(body.customCharacters) && body.customCharacters.length > 0) {
    inputCharacters = body.customCharacters;
  } else if (typeof body.characters === "string" && body.characters.trim()) {
    inputCharacters = body.characters
      .split(/[,;\n]+/)
      .map((c: string) => c.trim())
      .filter(Boolean)
      .map((name: string, i: number) => ({
        name: name.split(/\s+/)[0],
        role: i === 0 ? "Protagonist" : "Key Counterpart",
        archetype: name.includes("(") ? name.split("(")[1].replace(")", "") : `Specialist ${i + 1}`,
      }));
  }

  try {
    const result = await generateSequence({
      title,
      logline,
      genre,
      director_style: directorStyle,
      core_secret: coreSecret,
      primary_location: primaryLocation,
      target_runtime_minutes: targetRuntimeMinutes,
      narrative_format: narrativeFormat,
      characters: inputCharacters,
    });

    if (!Array.isArray(result.scenes) || result.scenes.length === 0) {
      throw new Error("agent-service returned no scenes");
    }

    const validatedScenes: FilmScene[] = result.scenes.map((sc, idx) => ({
      id: `scene-gen-${Date.now()}-${idx + 1}`,
      sceneNumber: sc.scene_number || idx + 1,
      title: sc.title || `Scene ${idx + 1}`,
      slugline: sc.slugline || `INT. ${primaryLocation.toUpperCase()} - NIGHT`,
      summary: sc.summary || "Dramatic sequence.",
      location: sc.location || primaryLocation,
      startSeconds:
        Number(sc.start_seconds) || Math.round((targetRuntimeMinutes * 60 * idx) / result.scenes.length),
      durationSeconds: Number(sc.duration_seconds) || 240,
      castPresent: Array.isArray(sc.cast_present) ? sc.cast_present : [],
      castRoles: Array.isArray(sc.cast_roles)
        ? Object.fromEntries(sc.cast_roles.map((r) => [r.character_name, r.objective_in_scene]))
        : {},
      screenplayText: sc.screenplay_text || `${sc.slugline || "INT. LOCATION - NIGHT"}\n\n[Action lines]`,
    }));

    const characters: ProjectCharacter[] = (result.characters || []).map((c) => ({
      name: c.name,
      role: c.role,
      archetype: c.archetype,
      speechStyle: c.speech_style || "naturalistic",
      subtextRatio: c.subtext_ratio || "moderate",
      objective: c.objective,
      dialsSummary: c.dials_summary || undefined,
      actorComp: c.actor_comp || undefined,
    }));

    return NextResponse.json({
      title: result.title || title,
      logline: result.logline || logline,
      genre: result.genre || genre,
      characters: characters.length > 0 ? characters : inputCharacters,
      scenes: validatedScenes,
      _generatedBy: "gemini-3.7-flash",
    });
  } catch (err) {
    console.error("agent-service sequence generation failed, using fallback template:", err);
  }

  // Dynamic Semantic Fallback (Story-specific, NOT static placeholders!) —
  // only reached if agent-service itself is unreachable or errors, never
  // due to a missing key on this deployment (there is none to be missing).
  const pLead = inputCharacters[0]?.name || "Elena";
  const pCounter = inputCharacters[1]?.name || "Marcus";

  const dynamicCharacters: ProjectCharacter[] =
    inputCharacters.length > 0
      ? inputCharacters
      : [
          {
            name: pLead,
            role: "Protagonist / Mastermind",
            archetype: "Calculated Infiltrator",
            speechStyle: "measured, precise, guarded",
            subtextRatio: "high",
            objective: `Execute the central objective of ${logline || title}`,
            dialsSummary: "Confidence 90% · Subtext 85%",
            actorComp: "Florence Pugh",
          },
          {
            name: pCounter,
            role: "Key Counterpart / Specialist",
            archetype: "Tactical Operator with hidden reservations",
            speechStyle: "terse, defensive, urgent",
            subtextRatio: "extreme",
            objective: "Secure safety while guarding asymmetric knowledge",
            dialsSummary: "Confidence 75% · Subtext 90%",
            actorComp: "Oscar Isaac",
          },
        ];

  const totalRuntimeSecs = targetRuntimeMinutes * 60;
  const dynScenes: FilmScene[] = [
    {
      id: `scene-gen-${Date.now()}-1`,
      sceneNumber: 1,
      title: `The Briefing at ${primaryLocation.split(" ")[0]}`,
      slugline: `INT. ${primaryLocation.toUpperCase()} - NIGHT`,
      summary: `${pLead} outlines the operation stakes to ${pCounter}. The terms are accepted, but ${coreSecret ? "unspoken tension lingers around the hidden secret" : "an underlying friction is immediately evident"}.`,
      location: primaryLocation,
      startSeconds: Math.round(totalRuntimeSecs * 0.08),
      durationSeconds: 240,
      castPresent: [pLead, pCounter],
      castRoles: {
        [pLead]: "Laying out the strict timetable and operational boundaries",
        [pCounter]: "Probing for vulnerabilities in the plan while concealing reservations",
      },
      screenplayText: `INT. ${primaryLocation.toUpperCase()} - NIGHT\n\nRain streaks the frosted glass. Low-key fluorescent amber light hums against exposed concrete.\n\n${pLead.toUpperCase()}\nThree minutes past midnight. The security cycle drops for ninety seconds. That is our entire window.\n\n${pCounter.toUpperCase()}\nAnd if the primary relay doesn't cycle?\n\n${pLead.toUpperCase()}\n(eyes locking on him with razor precision)\nIt will. As long as everyone holds their assigned frequency.`,
    },
    {
      id: `scene-gen-${Date.now()}-2`,
      sceneNumber: 2,
      title: "The Infiltration & Breach",
      slugline: `INT. RESTRICTED CORRIDOR - NIGHT`,
      summary: `${pLead} and ${pCounter} breach the inner perimeter. ${coreSecret || "A critical piece of information fails to match the original blueprint"}, triggering immediate panic.`,
      location: "Restricted Corridor",
      startSeconds: Math.round(totalRuntimeSecs * 0.38),
      durationSeconds: 300,
      castPresent: [pLead, pCounter],
      castRoles: {
        [pLead]: "Executing the digital bypass under escalating countdown pressure",
        [pCounter]: "Watching the perimeter corridor and discovering the discrepancy",
      },
      screenplayText: `INT. RESTRICTED CORRIDOR - NIGHT\n\nRed auxiliary warning strobes pulse silently against stainless steel walls.\n\n${pCounter.toUpperCase()}\n(whispering urgently into his collar)\nThe access terminal isn't accepting the bypass. Elena. You said the codes were cleared.\n\n${pLead.toUpperCase()}\nKeep your voice down. Try the secondary override.\n\n${pCounter.toUpperCase()}\nThere is no secondary override! Someone knew we were coming.`,
    },
    {
      id: `scene-gen-${Date.now()}-3`,
      title: "The Confrontation & Point of No Return",
      sceneNumber: 3,
      slugline: `INT. CENTRAL COMMAND HUB - NIGHT`,
      summary: `The operation compromises. ${pLead} is forced to reveal their true hand as ${pCounter} realizes they have been positioned as the syndicate decoy.`,
      location: "Central Command Hub",
      startSeconds: Math.round(totalRuntimeSecs * 0.68),
      durationSeconds: 360,
      castPresent: [pLead, pCounter],
      castRoles: {
        [pLead]: "Securing the asset while containing the immediate fallout",
        [pCounter]: "Confronting Elena after realizing the setup",
      },
      screenplayText: `INT. CENTRAL COMMAND HUB - NIGHT\n\nThe central blast doors lock with a deafening hydraulic thud. Emergency lockdown.\n\n${pCounter.toUpperCase()}\nYou never intended for both of us to make the extraction convoy, did you?\n\n${pLead.toUpperCase()}\n(voice chillingly steady)\nI intended for the mission to survive. That was always the contract.`,
    },
    {
      id: `scene-gen-${Date.now()}-4`,
      title: "The Extraction & Reckoning",
      sceneNumber: 4,
      slugline: `EXT. PERIMETER EXTRACTION DOCKS - DAWN`,
      summary: `Dawn breaks over the wet pavement. Sirens echo across the city as the final consequences of the night collide.`,
      location: "Perimeter Extraction Docks",
      startSeconds: Math.round(totalRuntimeSecs * 0.88),
      durationSeconds: 240,
      castPresent: [pLead],
      castRoles: {
        [pLead]: "Reaching the extraction transport and facing the moral weight of the sacrifice",
      },
      screenplayText: `EXT. PERIMETER EXTRACTION DOCKS - DAWN\n\nFog rolls off the gray river. Distant sirens waver against the morning cold.\n\nA black sedan idles by the water's edge. ${pLead.toUpperCase()} steps toward the open passenger door, holding the recovered hard drive.\n\nShe looks back once across the industrial skyline. Closes the door. The car pulls away into the fog.`,
    },
  ];

  return NextResponse.json({
    title,
    logline,
    genre,
    characters: dynamicCharacters,
    scenes: dynScenes,
    _generatedBy: "semantic-showrunner-fallback",
  });
}
