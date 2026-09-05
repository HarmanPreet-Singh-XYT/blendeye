import { NextRequest, NextResponse } from "next/server";
import { fuseFilms } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.title_a || !body?.script_a || !body?.title_b || !body?.script_b) {
    return NextResponse.json(
      { error: "title_a, script_a, title_b, and script_b are required" },
      { status: 400 }
    );
  }

  try {
    const result = await fuseFilms({
      title_a: body.title_a,
      script_a: body.script_a,
      title_b: body.title_b,
      script_b: body.script_b,
      fusion_directive: body.fusion_directive,
      fusion_project_id: body.fusion_project_id || "fusion-crossover-demo",
    });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("Film fusion backend unreachable, using demo crossover fallback:", message);
    return NextResponse.json({
      fusion_project_id: body.fusion_project_id || "fusion-crossover-demo",
      fused_title: `${body.title_a || "Alpha"} × ${body.title_b || "Beta"}: Convergence`,
      fused_logline: `When the characters from ${body.title_a || "Alpha"} collide with the world of ${body.title_b || "Beta"}, secrets unravel under extreme pressure.`,
      character_remappings: [
        {
          original_name: "Elena",
          original_story: body.title_a || "Source Alpha",
          fused_role: "Infiltrator Specialist",
          alignment: "Chaotic Neutral",
          speech_style: "Guarded, high subtext, sharp cues",
          subtext_ratio: "very high",
        },
        {
          original_name: "Marcus",
          original_story: body.title_b || "Source Beta",
          fused_role: "Station Commander",
          alignment: "Lawful Good",
          speech_style: "Authoritative, blunt, strained",
          subtext_ratio: "medium",
        },
      ],
      reconciled_events: [
        {
          character_name: "Elena",
          event_timestamp: "00:15:00",
          event_type: "known_fact",
          content: "Elena possesses the encrypted decryption bypass.",
        },
        {
          character_name: "Marcus",
          event_timestamp: "00:15:00",
          event_type: "unaware_of",
          content: "Marcus assumes the lockdown was triggered by an external breach.",
        },
      ],
      fused_screenplay: `INT. COMPROMISED FACILITY - CONTINUOUS\n\nRed emergency illumination bathes the corridor. Steam vents with rhythmic hisses.\n\nMARCUS\n(weapon drawn, voice taut)\nStep into the light. Identify your unit.\n\nELENA\n(cool, steady subtext)\nYou already know who I am, Commander. The question is whether you've checked your telemetry logs in the last forty seconds.\n\nMARCUS\nThe logs are clean.\n\nELENA\nThen someone erased them before you took command.\n`,
      events_written_to_clickhouse: 2,
      _fallback: true,
      _error: message,
    });
  }
}
