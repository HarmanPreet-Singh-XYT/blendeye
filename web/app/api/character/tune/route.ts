import { NextRequest, NextResponse } from "next/server";
import { tuneDialogue } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await tuneDialogue(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      character_name: "Character",
      tuned_dialogue: "(guarded, eyes fixed on the exit)\nCheck the perimeter yourself if you're so certain. I know what I saw.",
      _fallback: true,
      _error: message,
    });
  }
}
