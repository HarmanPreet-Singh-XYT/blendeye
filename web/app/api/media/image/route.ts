import { NextRequest, NextResponse } from "next/server";
import { generateMediaImage } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";
import { persistDataUriToBucket } from "@/lib/media-storage-service";

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
      if (result.image_url.startsWith("data:")) {
        const lower = promptStr.toLowerCase();
        const category = lower.includes("portrait") || lower.includes("face") || lower.includes("headshot")
          ? "character_face"
          : lower.includes("wardrobe") || lower.includes("full body") || lower.includes("full-body")
          ? "character_body"
          : lower.includes("location") || lower.includes("plate") || lower.includes("building")
          ? "location"
          : "general";

        const { publicUrl } = await persistDataUriToBucket(result.image_url, {
          name: `Image: ${promptStr.slice(0, 40)}`,
          category,
          targetFolder: "images",
          tags: ["ai-generated", "imagen-3", category],
          metadata: {
            prompt: promptStr,
            aspect_ratio: aspectRatioStr,
            model: result.model,
          },
        });
        if (publicUrl) {
          result.image_url = publicUrl;
        }
      }
      await setCachedGeneration("image", cachePayload, result);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Media image generation proxy error:", message);

    // If agent-service is unreachable or rate-limited, provide an elegant high-quality cinematic fallback tailored to the requested shot type
    const lowerPrompt = promptStr.toLowerCase();
    // Default fallback: AI-generated 16:9 widescreen landscape plate (Aethelgard Singularity)
    let fallbackUrl =
      "https://vcbclecweorugfucdubm.supabase.co/storage/v1/object/public/cinema_assets/images/images_1788919223537_jn3px0a0.jpg";

    if (
      lowerPrompt.includes("full-body") ||
      lowerPrompt.includes("full body") ||
      lowerPrompt.includes("wardrobe") ||
      lowerPrompt.includes("costume") ||
      lowerPrompt.includes("stance") ||
      aspectRatioStr === "9:16"
    ) {
      // High quality cinematic full body character portrait (AI generated)
      fallbackUrl =
        lowerPrompt.includes("maya") || lowerPrompt.includes("woman") || lowerPrompt.includes("female")
          ? "https://vcbclecweorugfucdubm.supabase.co/storage/v1/object/public/cinema_assets/images/images_1788921623508_803l91ok.jpg"
          : "https://vcbclecweorugfucdubm.supabase.co/storage/v1/object/public/cinema_assets/images/images_1788921611037_ftq4f1u4.jpg";
    } else if (
      lowerPrompt.includes("portrait") ||
      lowerPrompt.includes("face") ||
      lowerPrompt.includes("headshot") ||
      lowerPrompt.includes("character") ||
      aspectRatioStr === "1:1" ||
      aspectRatioStr === "3:4"
    ) {
      // High quality cinematic dramatic face portrait (AI generated)
      fallbackUrl =
        lowerPrompt.includes("female") || lowerPrompt.includes("woman") || lowerPrompt.includes("maya")
          ? "https://vcbclecweorugfucdubm.supabase.co/storage/v1/object/public/cinema_assets/images/images_1788918418168_e5m5km6h.jpg"
          : lowerPrompt.includes("aura") || lowerPrompt.includes("ai")
          ? "https://vcbclecweorugfucdubm.supabase.co/storage/v1/object/public/cinema_assets/images/images_1788918467328_l0ezdzsw.jpg"
          : "https://vcbclecweorugfucdubm.supabase.co/storage/v1/object/public/cinema_assets/images/images_1788918378432_6y3nizvf.jpg";
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
