import { NextRequest, NextResponse } from "next/server";
import { generateMediaImage } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  let promptStr = "";
  let aspectRatioStr = "16:9";

  try {
    const body = await req.json();
    promptStr = body.prompt || "";
    aspectRatioStr = body.aspect_ratio || "16:9";

    if (!promptStr) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const cachePayload = {
      prompt: promptStr.trim(),
      aspect_ratio: aspectRatioStr,
    };

    const cached = await getCachedGeneration<any>("image", cachePayload);
    if (cached && cached.image_url) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateMediaImage(promptStr, aspectRatioStr);
    if (result && result.image_url) {
      await setCachedGeneration("image", cachePayload, result);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Media image generation proxy error:", message);

    // If agent-service is unreachable or rate-limited, provide an elegant high-quality cinematic fallback tailored to the requested shot type
    const lowerPrompt = promptStr.toLowerCase();
    // Default fallback: AI-generated 16:9 widescreen landscape plate
    let fallbackUrl = "/assets/locations/ai_vault_plate.jpg";

    if (
      lowerPrompt.includes("full-body") ||
      lowerPrompt.includes("full body") ||
      lowerPrompt.includes("wardrobe") ||
      lowerPrompt.includes("costume") ||
      lowerPrompt.includes("stance") ||
      aspectRatioStr === "9:16"
    ) {
      // High quality cinematic full body character portrait (AI generated)
      fallbackUrl = "/assets/characters/ai_elena_fullbody.jpg";
    } else if (
      lowerPrompt.includes("portrait") ||
      lowerPrompt.includes("face") ||
      lowerPrompt.includes("headshot") ||
      lowerPrompt.includes("character") ||
      aspectRatioStr === "1:1" ||
      aspectRatioStr === "3:4"
    ) {
      // High quality cinematic dramatic face portrait (AI generated)
      fallbackUrl = lowerPrompt.includes("female") || lowerPrompt.includes("woman") || lowerPrompt.includes("elena")
        ? "/assets/characters/ai_elena_face.jpg"
        : "/assets/characters/ai_marcus_face.jpg";
    }

    return NextResponse.json({
      image_url: fallbackUrl,
      prompt: promptStr || "Cinematic character shot",
      model: "imagen-3.0-fallback",
      _fallback: true,
      _error: message,
    });
  }
}
