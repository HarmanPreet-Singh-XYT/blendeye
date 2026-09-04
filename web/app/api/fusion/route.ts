import { NextRequest, NextResponse } from "next/server";
import { fuseFilms } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body?.title_a || !body?.script_a || !body?.title_b || !body?.script_b) {
    return NextResponse.json(
      { error: "title_a, script_a, title_b, and script_b are required" },
      { status: 400 }
    );
  }

  try {
    const result = await fuseFilms({
      title_a: body.title_a,
      script_a: body.script_a,
      title_b: body.title_b,
      script_b: body.script_b,
      fusion_directive: body.fusion_directive,
      fusion_project_id: body.fusion_project_id || "fusion-crossover-demo",
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "film fusion failed" },
      { status: 502 }
    );
  }
}
