import { NextRequest, NextResponse } from "next/server";
import { synthesizeEnsemble } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await synthesizeEnsemble(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      characters: [
        {
          name: "Elena Vance",
          role: "Lead Protagonist",
          archetype: "Hardened Investigative Reporter",
          dreamActorComp: "Florence Pugh in Oppenheimer",
          castingReasoning: "Combines fierce intellectual tenacity with brittle vulnerability, matching 82% confidence and razor-sharp cross-examination cadence.",
          speechStyle: "Direct, rapid cadence, asks questions as weapons",
          subtextRatio: "moderate",
          confidence: 82,
          verbalPacing: 80,
          objective: "Expose the truth behind the crisis before sunrise",
          quirks: ["Taps voice recorder rhythmically", "Speaks before others finish"],
        },
        {
          name: "Director Cole Bennett",
          role: "Antagonist",
          archetype: "Bureaucratic Fixer",
          dreamActorComp: "Mark Rylance in Bridge of Spies",
          castingReasoning: "Quiet stillness and modulated micro-pauses radiate menacing institutional control, balancing high subtext with low surface agitation.",
          speechStyle: "Measured, bureaucratic double-speak, soft-spoken",
          subtextRatio: "extreme",
          confidence: 90,
          verbalPacing: 45,
          objective: "Contain the information leak and neutralize public exposure at all costs",
          quirks: ["Polishes spectacles during high tension", "Never raises voice"],
        },
      ],
      _fallback: true,
      _error: message,
    });
  }
}
