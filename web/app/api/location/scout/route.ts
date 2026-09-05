import { NextRequest, NextResponse } from "next/server";
import { scoutLocation } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const cached = await getCachedGeneration<any>("scout", body);
    if (cached && (cached.film_precedents || cached.location_aesthetic)) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await scoutLocation(body);
    if (result) {
      await setCachedGeneration("scout", body, result);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      film_precedents: [
        {
          film: "Heat (1995)",
          director: "Michael Mann",
          scene_comparison: "Diner confrontation where two opposing forces sit across a narrow table with subtext masking lethal intent.",
          lens_and_blocking_technique: "85mm telephoto compression, tight profile over-the-shoulder, strict 180-degree rule.",
        },
        {
          film: "Thief (1981)",
          director: "Michael Mann",
          scene_comparison: "Midnight industrial dry dock negotiation under towering sodium-vapor lights.",
          lens_and_blocking_technique: "Wide 24mm anamorphic lens emphasizing human vulnerability against massive steel architecture.",
        },
      ],
      location_aesthetic: "Decommissioned maritime shipping container terminal with corrugated rusted walls and rain-slicked concrete.",
      practical_lighting: "Overhead tower flood halogens casting stark downward shadows with blue emergency beacons in background.",
      camera_package: {
        cam_a: "50mm Anamorphic Prime on Protagonist (Medium)",
        cam_b: "85mm Telephoto on Antagonist (Tight Close-Up)",
        cam_c: "24mm Ultra-Wide Tracking Crane across warehouse floor",
      },
      imagen3_prompt: "2.39:1 anamorphic frame, rusted shipping container terminal at midnight, overhead halogen glare, rain puddles reflecting emergency beacons, high cinematic tension",
      _fallback: true,
      _error: message,
    });
  }
}
