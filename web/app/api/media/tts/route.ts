import { NextRequest, NextResponse } from "next/server";
import { generateMediaTTS } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";
import { persistDataUriToBucket } from "@/lib/media-storage-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      speaker,
      voice_name,
      delivery_style,
      speed,
      pitch_fine,
      formant_shift,
      reverb_room,
      reverb_send,
    } = body;

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const cachePayload = {
      text: text.trim(),
      speaker: (speaker || "NARRATOR").trim().toUpperCase(),
      voice_name: voice_name || "default",
      delivery_style,
      speed,
      pitch_fine,
      formant_shift,
      reverb_room,
      reverb_send,
    };

    const cached = await getCachedGeneration<any>("tts", cachePayload);
    if (cached && cached.audio_url) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateMediaTTS({
      text,
      speaker,
      voiceName: voice_name,
      deliveryStyle: delivery_style,
      speed,
      pitchFine: pitch_fine,
      formantShift: formant_shift,
      reverbRoom: reverb_room,
      reverbSend: reverb_send,
    });
    if (result && result.audio_url) {
      if (result.audio_url.startsWith("data:")) {
        const { publicUrl } = await persistDataUriToBucket(result.audio_url, {
          name: `TTS Line: ${speaker || "Narrator"}: ${text.slice(0, 30)}`,
          category: "audio",
          targetFolder: "audio/tts",
          mimeType: "audio/wav",
          tags: ["gemini-tts", "dialogue", "ai-generated"],
          metadata: {
            speaker,
            voiceName: voice_name,
            text,
          },
        });
        if (publicUrl) {
          result.audio_url = publicUrl;
        }
      }
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
