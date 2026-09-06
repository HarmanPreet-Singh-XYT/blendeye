import { NextRequest, NextResponse } from "next/server";
import { synthesizeEnsemble } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await synthesizeEnsemble(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ characters: [], _fallback: true, _error: message });
  }
}
