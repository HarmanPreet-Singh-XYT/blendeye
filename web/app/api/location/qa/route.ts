import { NextRequest, NextResponse } from "next/server";
import { askLocationQA } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await askLocationQA(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      answer: "Unable to connect to live location QA agent. Please verify that agent-service is running.",
      sources: [],
      search_grounded: false,
      suggested_followups: [],
      _fallback: true,
      _error: message,
    });
  }
}
