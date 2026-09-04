import { NextRequest, NextResponse } from "next/server";
import { shardScript } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const projectId = typeof body?.projectId === "string" ? body.projectId : "";
  const screenplayText =
    typeof body?.screenplayText === "string" ? body.screenplayText.trim() : "";

  if (!projectId || !screenplayText) {
    return NextResponse.json(
      { error: "projectId and screenplayText are required" },
      { status: 400 }
    );
  }

  try {
    const result = await shardScript(projectId, screenplayText);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "sharding failed" },
      { status: 502 }
    );
  }
}
