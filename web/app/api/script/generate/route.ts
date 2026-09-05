import { NextRequest, NextResponse } from "next/server";
import { generateScript } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const premise = typeof body?.premise === "string" ? body.premise.trim() : "";

  if (!premise) {
    return NextResponse.json({ error: "premise is required" }, { status: 400 });
  }

  try {
    const cached = await getCachedGeneration<{ screenplay_text: string }>("script", { premise });
    if (cached && cached.screenplay_text) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateScript(premise);
    if (result && result.screenplay_text) {
      await setCachedGeneration("script", { premise }, result);
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "generation failed" },
      { status: 502 }
    );
  }
}
