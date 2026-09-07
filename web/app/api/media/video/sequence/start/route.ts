import { NextRequest, NextResponse } from "next/server";
import { startVideoSequence, type SequenceShotInput } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sceneId = typeof body?.scene_id === "string" ? body.scene_id : "";
  const shots: SequenceShotInput[] = Array.isArray(body?.shots) ? body.shots : [];
  const referenceImages: Record<string, string> =
    body?.reference_images && typeof body.reference_images === "object" ? body.reference_images : {};

  if (!sceneId) {
    return NextResponse.json({ error: "scene_id is required" }, { status: 400 });
  }
  if (!shots.length) {
    return NextResponse.json({ error: "shots must be a non-empty array" }, { status: 400 });
  }

  try {
    const result = await startVideoSequence(sceneId, shots, referenceImages);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
