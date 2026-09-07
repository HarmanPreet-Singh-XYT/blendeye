import { NextRequest, NextResponse } from "next/server";
import { generateShotlist } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sceneText = typeof body?.scene_text === "string" ? body.scene_text.trim() : "";
  const sceneTitle = typeof body?.scene_title === "string" ? body.scene_title : "INT. SCENE - NIGHT";
  const directorStyle = typeof body?.director_style === "string" ? body.director_style : "David Fincher / Neo-Noir Precision";
  const characters = Array.isArray(body?.characters) ? body.characters : [];
  const targetTotalDurationSec = typeof body?.target_total_duration_sec === "number" ? body.target_total_duration_sec : undefined;
  const cameraMotion = typeof body?.camera_motion === "string" ? body.camera_motion : undefined;
  const stylePreset = typeof body?.style_preset === "string" ? body.style_preset : undefined;
  const aspectRatio = typeof body?.aspect_ratio === "string" ? body.aspect_ratio : undefined;
  const charactersDetail = Array.isArray(body?.characters_detail) ? body.characters_detail : undefined;
  const location = body?.location && typeof body.location === "object" ? body.location : undefined;

  if (!sceneText) {
    return NextResponse.json({ error: "scene_text is required" }, { status: 400 });
  }

  const payload = {
    sceneText,
    sceneTitle,
    directorStyle,
    characters,
    targetTotalDurationSec,
    cameraMotion,
    stylePreset,
    aspectRatio,
    charactersDetail,
    location,
  };

  try {
    const cached = await getCachedGeneration<any>("shotlist", payload);
    if (cached && Array.isArray(cached.shots) && cached.shots.length > 0) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateShotlist(payload);
    if (result && Array.isArray(result.shots) && result.shots.length > 0) {
      await setCachedGeneration("shotlist", payload, result);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const charA = characters[0] || "Marcus";
    const charB = characters[1] || "Elena";

    return NextResponse.json({
      scene_title: sceneTitle,
      director_style: directorStyle,
      visual_rhythm: "Calculated neo-noir tension; static frames escalating into kinetic close-ups",
      aspect_ratio: "2.39:1 Anamorphic",
      color_temperature: "4300K Cold Cyan & Deep Tungsten",
      shots: [
        {
          shot_number: 1,
          shot_type: "Wide Establishing Master",
          lens: "24mm Anamorphic Prime",
          angle: "Eye-Level Center Axis",
          camera_movement: "Slow creeping track forward (2mm/sec)",
          blocking_notes: `${charB} stands dead center facing the vault steel door. ${charA} enters frame left at 02:40, stopping at terminal perimeter.`,
          lighting_setup: "Overhead flickering 4300K cyan tube fixture; deep silhouettes on periphery.",
          dramatic_intent: `Establish spatial claustrophobia and the power asymmetry between ${charB} and ${charA}.`,
          imagen_prompt: `Cinematic wide establishing shot in bank vault. Cold cyan lighting, two silhouetted figures ${charA} and ${charB} facing a massive bank vault safe door. 35mm anamorphic scope, film grain.`,
          estimated_duration_sec: 8,
        },
        {
          shot_number: 2,
          shot_type: "Medium Over-the-Shoulder",
          lens: "50mm T1.3 Master Prime",
          angle: "Slight Low Angle",
          camera_movement: "Locked off, rigid tripod",
          blocking_notes: `Looking past ${charA}'s tense shoulder into ${charB}'s unblinking profile as she holds the bypass key.`,
          lighting_setup: "Side-lit with warm tungsten spill from the security panel contrast against cold background.",
          dramatic_intent: `Force audience into ${charA}'s subjective vulnerability as he realizes the setup.`,
          imagen_prompt: "Cinematic medium over-the-shoulder shot looking past a man's shoulder at a calculating woman holding a keycard. Moody shadow, shallow depth of field, photoreal film still.",
          estimated_duration_sec: 6,
        },
        {
          shot_number: 3,
          shot_type: "Extreme Close-Up Insert",
          lens: "85mm Macro Prime",
          angle: "Top-Down 45 deg",
          camera_movement: "Static macro lock",
          blocking_notes: `${charA}'s fingers trembling as he inspects the empty keycard slot on the electronic lock.`,
          lighting_setup: "High-contrast specular reflection off brushed titanium safe surface.",
          dramatic_intent: "Visceral tangible evidence that escape has been compromised.",
          imagen_prompt: "Macro close up shot of trembling hand touching a brushed titanium electronic keypad in shadows. Cinematic lighting, photoreal 35mm.",
          estimated_duration_sec: 4,
        },
        {
          shot_number: 4,
          shot_type: "Tight Close-Up Reaction",
          lens: "85mm Portrait Anamorphic",
          angle: "Direct Eye-Level",
          camera_movement: "Slow push-in concluding in sudden snap rack focus",
          blocking_notes: `${charB} turns head 15 degrees toward ${charA}, expression completely devoid of remorse.`,
          lighting_setup: "Edge rim light in icy cyan; eye catchlight pinpoint reflection.",
          dramatic_intent: "Confirm the emotional betrayal without words before the klaxon sounds.",
          imagen_prompt: "Cinematic tight close up portrait of an enigmatic woman in shadows, cold calculating eyes, subtle blue rim lighting, 35mm anamorphic film.",
          estimated_duration_sec: 7,
        },
      ],
      _fallback: true,
      _error: message,
    });
  }
}
