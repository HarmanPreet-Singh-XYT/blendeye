import { NextRequest, NextResponse } from "next/server";
import { generateMultiSpeakerTTS, type GenerateMultiSpeakerTTSOptions } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateMultiSpeakerTTSOptions;
    const { lines, scriptText, speakerA, voiceA, speakerB, voiceB } = body;

    if ((!lines || lines.length === 0) && !scriptText) {
      return NextResponse.json({ error: "Missing dialogue lines or scriptText" }, { status: 400 });
    }

    const cachePayload = {
      lines: lines?.map((l) => ({ speaker: l.speaker.toUpperCase(), text: l.text.trim() })),
      scriptText: scriptText?.trim(),
      speakerA,
      voiceA,
      speakerB,
      voiceB,
    };

    const cached = await getCachedGeneration<any>("tts_multi", cachePayload);
    if (cached && cached.audio_url) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateMultiSpeakerTTS({
      lines,
      scriptText,
      speakerA,
      voiceA,
      speakerB,
      voiceB,
    });

    if (result && result.audio_url) {
      await setCachedGeneration("tts_multi", cachePayload, result);
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Multi-speaker TTS synthesis proxy error:", message);

    return NextResponse.json(
      {
        audio_url: "",
        duration_estimate_sec: 0,
        speakers: [],
        voice_mapping: {},
        line_count: 0,
        _fallback: true,
        _error: message,
      },
      { status: 200 }
    );
  }
}
