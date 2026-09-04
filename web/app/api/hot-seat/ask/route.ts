import { NextRequest, NextResponse } from "next/server";
import { askHotSeat, type HotSeatTurnIn } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { projectId, characterName, currentTimestamp, question } = body ?? {};

  if (
    typeof projectId !== "string" ||
    typeof characterName !== "string" ||
    typeof currentTimestamp !== "string" ||
    typeof question !== "string" ||
    !projectId ||
    !characterName ||
    !currentTimestamp ||
    !question.trim()
  ) {
    return NextResponse.json(
      { error: "projectId, characterName, currentTimestamp, and question are required" },
      { status: 400 }
    );
  }

  try {
    const result = await askHotSeat({
      projectId,
      characterName,
      currentTimestamp,
      question: question.trim(),
      physicalLocation: body?.physicalLocation,
      activeObjective: body?.activeObjective,
      speechStyle: body?.speechStyle,
      subtextRatio: body?.subtextRatio,
      priorTurns: Array.isArray(body?.priorTurns) ? (body.priorTurns as HotSeatTurnIn[]) : [],
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "hot-seat request failed" },
      { status: 502 }
    );
  }
}
