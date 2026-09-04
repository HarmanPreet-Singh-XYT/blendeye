import { NextRequest, NextResponse } from "next/server";
import { getKnowledgeState } from "@/lib/agent-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || searchParams.get("project_id");
  const characterName = searchParams.get("characterName") || searchParams.get("character_name");
  const currentTimestamp = searchParams.get("currentTimestamp") || searchParams.get("current_timestamp");

  if (!projectId || !characterName || !currentTimestamp) {
    return NextResponse.json(
      { error: "projectId, characterName, and currentTimestamp are required" },
      { status: 400 }
    );
  }

  try {
    const result = await getKnowledgeState(projectId, characterName, currentTimestamp);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed to fetch knowledge state" },
      { status: 502 }
    );
  }
}
