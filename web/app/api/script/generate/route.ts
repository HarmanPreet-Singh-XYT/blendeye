import { NextRequest, NextResponse } from "next/server";
import { generateScript } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const premise = typeof body?.premise === "string" ? body.premise.trim() : "";

  if (!premise) {
    return NextResponse.json({ error: "premise is required" }, { status: 400 });
  }

  try {
    const result = await generateScript(premise);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "generation failed" },
      { status: 502 }
    );
  }
}
