import { NextRequest, NextResponse } from "next/server";
import { testChemistry } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await testChemistry(body);
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
