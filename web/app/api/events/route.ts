import { NextRequest, NextResponse } from "next/server";
import { getProjectEvents } from "@/lib/agent-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || searchParams.get("project_id");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const result = await getProjectEvents(projectId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed to fetch project events" },
      { status: 502 }
    );
  }
}
