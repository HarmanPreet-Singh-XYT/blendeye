import { NextRequest, NextResponse } from "next/server";
import { testChemistry } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = {
      char_a_name: body.char_a_name || body.character_a?.name || "Marcus Vance",
      char_a_dna:
        body.char_a_dna ||
        body.character_a?.archetype ||
        body.character_a?.dna ||
        "Master safecracker, high paranoia",
      char_b_name: body.char_b_name || body.character_b?.name || "Elena Rostova",
      char_b_dna:
        body.char_b_dna ||
        body.character_b?.archetype ||
        body.character_b?.dna ||
        "Corrupt vault architect, ice-cold precision",
      scenario:
        body.scenario ||
        body.setting ||
        "Stuck in a service elevator with a ticking delivery countdown",
    };

    const cached = await getCachedGeneration<any>("chemistry", payload);
    if (cached && cached.micro_scene) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await testChemistry(payload);
    if (result && result.micro_scene) {
      await setCachedGeneration("chemistry", payload, result);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      scenario: "Stuck in an elevator with a ticking timer",
      micro_scene: `INT. SERVICE ELEVATOR - CONTINUOUS

The overhead fluorescent strips flicker and died. Only the amber emergency control lights pulse against the steel floor.

MARCUS
(tapping the panel with frantic rhythm)
We had five minutes. Now we have two and twenty-four inches of unyielding steel.

ELENA
(resting her back against the handrail, unblinking)
Stop hitting the toggle, Marcus. Noise attracts security, not salvation.

MARCUS
You planned this. Tell me right now you didn't trigger the breaker box.

ELENA
If I planned this, you wouldn't still have your canvas bag. Now breathe and hold the torch steady.`,
      _fallback: true,
      _error: message,
    });
  }
}
