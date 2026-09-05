import { NextRequest, NextResponse } from "next/server";
import { generateMediaTTS } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, speaker, voice_name } = body;

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const result = await generateMediaTTS(text, speaker, voice_name);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Media TTS synthesis proxy error:", message);

    return NextResponse.json(
      {
        audio_url: "",
        speaker: "NARRATOR",
        voice_name: "fallback",
        duration_estimate_sec: 1.0,
        _fallback: true,
        _error: message,
      },
      { status: 200 }
    );
  }
}
