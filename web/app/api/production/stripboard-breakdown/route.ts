import { NextRequest, NextResponse } from "next/server";
import { generateStripboardBreakdown, type StripboardBreakdownRequest } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload: StripboardBreakdownRequest = {
    project_title: body?.project_title || "Vault Heist",
    genre: body?.genre || "Sci-Fi / Thriller",
    scenes: Array.isArray(body?.scenes) ? body.scenes : [],
    raw_screenplay: typeof body?.raw_screenplay === "string" ? body.raw_screenplay : "",
  };

  try {
    const cached = await getCachedGeneration<any>("stripboard-breakdown", payload);
    if (cached && Array.isArray(cached.breakdown) && cached.breakdown.length > 0) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateStripboardBreakdown(payload);
    if (result && Array.isArray(result.breakdown) && result.breakdown.length > 0) {
      await setCachedGeneration("stripboard-breakdown", payload, result);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    // Contextual fallback breakdown
    const scenes = payload.scenes || [];
    const breakdown = scenes.map((s, idx) => {
      const txt = `${s.location} ${s.summary || ""} ${s.screenplay_text || ""}`.toLowerCase();
      const hasAction = /fight|crash|explosion|blast|gun|breach|run|jump|fall|wire/.test(txt);
      const hasAtm = /smoke|fog|steam|rain|fire|amber|strobe|haze/.test(txt);
      const hasVfx = /screen|interface|hologram|space|outer|hull|drone|laser/.test(txt);

      return {
        scene_number: s.scene_number || String(idx + 1).padStart(2, "0"),
        stunts: hasAction ? "Stunt double fall & wire-assisted grapple" : "Controlled physical blocking",
        stunt_tier: (hasAction ? "High" : "Low") as "None" | "Low" | "Moderate" | "High",
        practical_fx: hasAtm ? "Pressurized atmospheric haze & practical amber emergency strobe" : "Subtle atmospheric haze",
        vfx_tier: (hasVfx ? (hasAction ? "Class A" : "Class B") : "Class C") as "Class A" | "Class B" | "Class C" | "None",
        special_equipment: hasAction ? "Technocrane 30 + Cooke Anamorphic /i Prime" : "Ronin 4D Steadicam + 35mm Prime",
        permits_and_hazards: hasAction ? "High-impact fall pads, on-set safety medic" : "Standard interior stage permit",
        complexity_rating: hasAction ? 4 : 2,
        production_notes: hasAction ? "Mandatory safety briefing before rigging tests." : "Direct dialogue coverage; prioritize acoustic isolation.",
      };
    });

    if (breakdown.length === 0) {
      breakdown.push(
        {
          scene_number: "01",
          stunts: "Zero-G wire rigging & tactical disarm fall",
          stunt_tier: "Moderate",
          practical_fx: "Depressurization fog, pulsed amber strobe",
          vfx_tier: "Class B",
          special_equipment: "Technocrane 30 + Master Prime Anamorphics",
          permits_and_hazards: "Confined space ventilation safety clearance",
          complexity_rating: 3,
          production_notes: "Pre-light bulkhead rig during morning crew call.",
        },
        {
          scene_number: "02",
          stunts: "Precision hand-to-hand grapple against console",
          stunt_tier: "Low",
          practical_fx: "Sparks discharge, hydraulic steam valve release",
          vfx_tier: "Class C",
          special_equipment: "Ronin 4D Steadicam + Macro Probe Lens",
          permits_and_hazards: "Pyrotechnic spark squib certification",
          complexity_rating: 2,
          production_notes: "Ensure electrical grounding on console deck.",
        }
      );
    }

    return NextResponse.json({
      total_shoot_days: Math.max(Math.ceil(breakdown.length / 2), 2),
      estimated_budget_multiplier: 1.25,
      production_summary: `AD Shooting logistics calibrated for ${payload.project_title} (${breakdown.length} scenes analyzed).`,
      breakdown,
      _fallback: true,
      _error: message,
    });
  }
}
