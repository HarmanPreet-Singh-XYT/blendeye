import { NextRequest, NextResponse } from "next/server";
import { extractStyle } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await extractStyle(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      visual_palette: ["#0b132b", "#1c2541", "#3a506b", "#e09f3e", "#d62828"],
      lighting_style: "Low-key chiaroscuro, sodium-vapor kicker, high shadow contrast",
      camera_motion: "24mm anamorphic wide slow dolly tracking through rain-swept corridor",
      editing_rhythm: "Deliberate 4-second takes holding on micro-reactions before cutting",
      sound_and_acoustics: "Low industrial mechanical hum, distant sirens, wet tire hiss",
      imagen3_prompt: "2.39:1 anamorphic cinematography, rain-slicked industrial dry dock, deep shadows, amber sodium-vapor backlight, photoreal 35mm film grain",
      _fallback: true,
      _error: message,
    });
  }
}
