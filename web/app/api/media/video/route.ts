import { NextRequest, NextResponse } from "next/server";
import { generateMediaVideo } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, duration_seconds, style_preset } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const cachePayload = {
      prompt: prompt.trim(),
      duration_seconds: duration_seconds || 5,
      style_preset: style_preset || "35mm Anamorphic Film",
    };

    const cached = await getCachedGeneration<any>("video", cachePayload);
    if (cached && (cached.video_url || cached.status === "completed")) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateMediaVideo(prompt, duration_seconds, style_preset);
    if (result && (result.video_url || result.status === "completed")) {
      await setCachedGeneration("video", cachePayload, result);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Veo video generation error:", message);

    return NextResponse.json({
      operation_name: "demo-preview",
      prompt: "Cinematic establishing scene",
      status: "completed",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      _fallback: true,
      _error: message,
    });
  }
}
