import { NextRequest, NextResponse } from "next/server";
import { generateMultiverseTakes, MultiverseTakesRequest } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sceneText = typeof body?.scene_text === "string" ? body.scene_text.trim() : "";
  const characters = Array.isArray(body?.characters) ? body.characters : [];
  const projectTitle = typeof body?.project_title === "string" ? body.project_title : "Feature Film";
  const count = typeof body?.count === "number" ? body.count : 3;
  const customDirection = typeof body?.custom_direction === "string" ? body.custom_direction.trim() : "";

  if (!sceneText) {
    return NextResponse.json({ error: "scene_text is required" }, { status: 400 });
  }

  const payload: MultiverseTakesRequest = {
    sceneText,
    characters,
    projectTitle,
    count,
    customDirection,
  };

  try {
    const cached = await getCachedGeneration<any>("multiverse-takes", payload);
    if (cached && Array.isArray(cached.takes) && cached.takes.length > 0) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateMultiverseTakes(payload);
    if (result && Array.isArray(result.takes) && result.takes.length > 0) {
      await setCachedGeneration("multiverse-takes", payload, result);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const charA = characters[0] || "Marcus";
    const charB = characters[1] || "Elena";

    return NextResponse.json({
      takes: [
        {
          id: "take-psychological",
          take_label: `Take A · Psychological Slow-Burn (POV: ${charB})`,
          director_style: "A24 / Atmospheric Dread — lingering silences, restrained micro-performances",
          pov_character: charB,
          tone: "Psychological Dread",
          pacing_bpm: 58,
          subtext_ratio: "92% Subtext",
          camera_movement: "Lingering 50mm Prime · Shallow Depth of Field",
          synopsis: `A slower, quieter cut where ${charB} wields silence as a tactical weapon against ${charA}.`,
          rewritten_scene: `INT. SECURE VAULT - NIGHT\n\nWater drips in measured silence. ${charB.toUpperCase()} stands motionless before the titanium vault bulkhead.\n\n${charA.toUpperCase()}\nYou had the passcode before we even crossed the perimeter.\n\n${charB.toUpperCase()} doesn't turn around.\n\n${charB.toUpperCase()}\nI had what you needed to know to get us this far. That isn't the same thing.`,
        },
        {
          id: "take-neonoir",
          take_label: `Take B · Neo-Noir Procedural (POV: ${charA})`,
          director_style: "David Fincher / Michael Mann Precision — razor-sharp dialogue, cold procedural confrontation",
          pov_character: charA,
          tone: "Cold Tactical",
          pacing_bpm: 92,
          subtext_ratio: "78% Subtext",
          camera_movement: "35mm Anamorphic Master · Razor Whip-Pans · Cyan Cold Fill",
          synopsis: `A harder-edged cut with forensic accusations and physical timeline evidence on the table.`,
          rewritten_scene: `INT. SECURE VAULT - NIGHT\n\nA forensic chronograph blinks 02:44:19.\n\n${charA.toUpperCase()}\nThe security grid transponder was keyed to your badge at 02:15. You verified the corridor yourself.\n\n${charB.toUpperCase()}\nWe have 140 seconds before auxiliary sweeps cycle. Stop auditing the past and cut the relay.`,
        },
        {
          id: "take-kinetic",
          take_label: "Take C · Visceral Ticking-Clock (Shared Urgency)",
          director_style: "Denis Villeneuve / Christopher Nolan Urgency — kinetic velocity, escalating physical danger",
          pov_character: "Shared",
          tone: "Visceral Urgency",
          pacing_bpm: 128,
          subtext_ratio: "45% Subtext",
          camera_movement: "Handheld Steadicam · Kinetic Dutch Angles · Strobe Warning Lights",
          synopsis: "A high-velocity cut where the perimeter collapse forces immediate physical improvisation.",
          rewritten_scene: `INT. SECURE VAULT - NIGHT\n\nRED EMERGENCY STROBES BLIND THE ROOM. Air pressure plummets.\n\n${charA.toUpperCase()} throws his weight against the manual lock.\n\n${charA.toUpperCase()}\nThe bulkhead is dropping! Cut the relay now!\n\n${charB.toUpperCase()} yanks the severed fiber optic bundle with bare hands.\n\n${charB.toUpperCase()}\nStop yelling and pull!`,
        },
      ],
      _fallback: true,
      _error: message,
    });
  }
}
