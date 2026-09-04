import { NextRequest, NextResponse } from "next/server";
import { chatWithShowrunner } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    const result = await chatWithShowrunner({
      projectTitle: body.projectTitle,
      logline: body.logline,
      screenplayText: body.screenplayText,
      characters: body.characters,
      message,
      history: body.history ?? [],
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "showrunner chat failed" },
      { status: 502 }
    );
  }
}
