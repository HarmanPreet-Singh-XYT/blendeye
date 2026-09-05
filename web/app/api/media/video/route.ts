import { NextRequest, NextResponse } from "next/server";
import { generateMediaVideo } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, duration_seconds, style_preset, image_url, character_name, aspect_ratio } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Veo 3.1 only supports these two render ratios; anything else falls back to 16:9.
    const resolvedAspectRatio = aspect_ratio === "9:16" ? "9:16" : "16:9";

    const cachePayload = {
      prompt: prompt.trim(),
      duration_seconds: duration_seconds || 5,
      style_preset: style_preset || "35mm Anamorphic Film",
      image_url: image_url || null,
      character_name: character_name || null,
      aspect_ratio: resolvedAspectRatio,
    };

    const cached = await getCachedGeneration<any>("video", cachePayload);
    if (cached && (cached.video_url || cached.status === "completed")) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateMediaVideo(
      prompt,
      duration_seconds,
      style_preset,
      image_url,
      character_name,
      resolvedAspectRatio
    );
    if (result && (result.video_url || result.status === "completed")) {
      await setCachedGeneration("video", cachePayload, result);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Veo video generation error:", message);

    return NextResponse.json(
      {
        operation_name: null,
        status: "error",
        error: message,
      },
      { status: 502 }
    );
  }
}
