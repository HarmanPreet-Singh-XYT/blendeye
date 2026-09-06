import { NextRequest, NextResponse } from "next/server";
import { rewriteScene } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sceneText = typeof body?.scene_text === "string" ? body.scene_text.trim() : "";
  const directorStyle = typeof body?.director_style === "string" ? body.director_style.trim() : "";

  if (!sceneText || !directorStyle) {
    return NextResponse.json({ error: "scene_text and director_style are required" }, { status: 400 });
  }

  const payload = {
    sceneText,
    directorStyle,
    subtextRatio: body.subtext_ratio,
    pacingBpm: body.pacing_bpm,
    cameraMovement: body.camera_movement,
  };

  try {
    const cached = await getCachedGeneration<any>("scene-rewrite", payload);
    if (cached && cached.rewritten_scene) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await rewriteScene(payload);
    if (result && result.rewritten_scene) {
      await setCachedGeneration("scene-rewrite", payload, result);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      rewritten_scene: sceneText,
      _fallback: true,
      _error: message,
    });
  }
}
