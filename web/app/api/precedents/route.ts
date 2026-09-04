import { NextRequest, NextResponse } from "next/server";
import { getPrecedents } from "@/lib/agent-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre") || "";

  try {
    const result = await getPrecedents(genre);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed to fetch cinematic precedents" },
      { status: 502 }
    );
  }
}
