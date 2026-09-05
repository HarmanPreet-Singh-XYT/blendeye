import { NextRequest, NextResponse } from "next/server";
import { generateMediaTTS } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, speaker, voice_name } = body;

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const cachePayload = {
      text: text.trim(),
      speaker: (speaker || "NARRATOR").trim().toUpperCase(),
      voice_name: voice_name || "default",
    };

    const cached = await getCachedGeneration<any>("tts", cachePayload);
    if (cached && cached.audio_url) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateMediaTTS(text, speaker, voice_name);
    if (result && result.audio_url) {
      await setCachedGeneration("tts", cachePayload, result);
    }
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
