import { NextRequest, NextResponse } from "next/server";
import { generateMediaImage } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt;
    const aspectRatio = body.aspect_ratio || "16:9";

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const result = await generateMediaImage(prompt, aspectRatio);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Media image generation proxy error:", message);

    // If agent-service is unreachable or rate-limited, provide an elegant high-quality cinematic SVG fallback
    const encodedPrompt = encodeURIComponent("16:9 Cinematic Anamorphic Frame");
    return NextResponse.json({
      image_url: `https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1280&q=80`,
      prompt: "Cinematic establishing shot",
      model: "imagen-3.0-fallback",
      _fallback: true,
      _error: message,
    });
  }
}
