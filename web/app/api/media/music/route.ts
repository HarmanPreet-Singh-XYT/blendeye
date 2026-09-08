import { NextRequest, NextResponse } from "next/server";
import { generateMediaMusic } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";
import { persistLocalMediaToBucket, persistDataUriToBucket } from "@/lib/media-storage-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, duration_mode, duration_seconds, image_url, image_urls, lyrics, language, response_modalities } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const durationSeconds = duration_seconds ? parseFloat(duration_seconds) : undefined;
    const durationMode = durationSeconds ? (durationSeconds > 30 ? "pro" : "clip") : (duration_mode === "pro" ? "pro" : "clip");

    const cachePayload = {
      prompt: prompt.trim(),
      duration_mode: durationMode,
      duration_seconds: durationSeconds || null,
      image_url: image_url || null,
      image_urls: image_urls || [],
      lyrics: lyrics ? lyrics.trim() : null,
      language: language || "English",
      response_modalities: response_modalities || ["AUDIO", "TEXT"],
    };

    const cached = await getCachedGeneration<any>("music", cachePayload);
    if (cached && (cached.audio_url || cached.lyrics_text)) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateMediaMusic({
      prompt: prompt.trim(),
      durationMode,
      durationSeconds,
      imageUrl: image_url,
      imageUrls: image_urls,
      lyrics,
      language,
      responseModalities: response_modalities,
    });

    if (result && result.audio_url) {
      if (result.audio_url.startsWith("data:")) {
        const { publicUrl } = await persistDataUriToBucket(result.audio_url, {
          name: `Score: ${prompt.slice(0, 40)}`,
          category: "audio",
          targetFolder: "audio/scores",
          tags: ["lyria-3", "music-score", "ai-generated"],
          metadata: {
            prompt,
            durationMode,
            lyrics,
          },
        });
        if (publicUrl) {
          result.audio_url = publicUrl;
        }
      } else if (!result.audio_url.startsWith("http")) {
        const { publicUrl } = await persistLocalMediaToBucket(result.audio_url, {
          name: `Score: ${prompt.slice(0, 40)}`,
          category: "audio",
          targetFolder: "audio/scores",
          tags: ["lyria-3", "music-score", "ai-generated"],
          metadata: {
            prompt,
            durationMode,
            lyrics,
          },
        });
        if (publicUrl) {
          result.audio_url = publicUrl;
        }
      }
      await setCachedGeneration("music", cachePayload, result);
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Music generation proxy error:", message);

    return NextResponse.json(
      {
        audio_url: "/audio/demo-score.wav",
        prompt: "Cinematic Ambient Scene Score",
        model: "lyria-3-clip-preview-fallback",
        duration_mode: "clip",
        lyrics_text: "Instrumental Cinematic Score",
        duration_estimate_sec: 12.0,
        fallback: true,
        _fallback: true,
      },
      { status: 200 }
    );
  }
}
