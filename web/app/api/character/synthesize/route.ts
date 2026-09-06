import { NextRequest, NextResponse } from "next/server";
import { synthesizeCharacter } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await synthesizeCharacter(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // Fallback response for instant UX even before backend connects
    return NextResponse.json({
      name: "Synthesized Character",
      archetype: "Adaptive Protagonist",
      bio: "Forged under high-stakes conditions with conflicting loyalties.",
      dream_actor_comp: "Willem Dafoe in The Lighthouse",
      casting_reasoning: "Selected for manic, hyper-articulate screen presence that elevates terse subtext and unpredictable status shifts under pressure.",
      alternate_casting_comp: "Ben Foster in Hell or High Water (gritty psychological resilience)",
      speech_style: "Staccato, urgent, sharp subtext",
      subtext_ratio: "High",
      flaw_and_blindspot: "Paranoid self-reliance",
      behavioral_tics: ["Fidgets with lighter", "Avoids direct eye contact"],
      suggested_tts_voice: "Fenrir",
      _fallback: true,
      _error: message,
    });
  }
}
