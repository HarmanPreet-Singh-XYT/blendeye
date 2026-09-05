import { NextRequest, NextResponse } from "next/server";
import { getVideoStatus } from "@/lib/agent-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const operationName = searchParams.get("operation_name");

  if (!operationName) {
    return NextResponse.json({ error: "Missing operation_name" }, { status: 400 });
  }

  try {
    const result = await getVideoStatus(operationName);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        status: "error",
        error: message,
        video_url: null,
      },
      { status: 502 }
    );
  }
}
