import { NextRequest, NextResponse } from "next/server";
import { generateMediaVideo } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, duration_seconds, style_preset } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const result = await generateMediaVideo(prompt, duration_seconds, style_preset);
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
