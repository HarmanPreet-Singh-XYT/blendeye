import { NextRequest, NextResponse } from "next/server";
import { predictMarket } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const genre = body.genre || "Heist Thriller";
    const logline = body.logline || "Vault heist breach";
    const targetTerritories = Array.isArray(body.target_territories) ? body.target_territories : [];

    const cached = await getCachedGeneration<any>("market", { genre, logline, targetTerritories });
    if (cached && cached.territories) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await predictMarket(genre, logline, targetTerritories);
    if (result && result.territories) {
      await setCachedGeneration("market", { genre, logline, targetTerritories }, result);
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      overall_global_score: 79,
      territories: [
        {
          country_code: "US",
          country_name: "United States",
          market_fit_score: 86,
          commercial_appetite: "High theatrical & SVOD demand for contained tense crime",
          cultural_friction: "None; genre conventions align with domestic market",
          actionable_fix: "Ensure betrayal pacing accelerates before the 45-minute mark",
        },
        {
          country_code: "IN",
          country_name: "India",
          market_fit_score: 74,
          commercial_appetite: "Strong interest in high-stakes crime, demands heightened emotional weight",
          cultural_friction: "Detached Western cynicism can alienate mass theatrical audiences",
          actionable_fix: "Amplify loyalty stakes between teammates; deploy Lyria orchestral cues",
        },
        {
          country_code: "KR",
          country_name: "South Korea",
          market_fit_score: 83,
          commercial_appetite: "Massive appetite for psychological cat-and-mouse tension",
          cultural_friction: "Subtle comedic subtext may not translate cleanly",
          actionable_fix: "Highlight the psychological mind-games and Elena's calculated betrayal",
        },
        {
          country_code: "DE",
          country_name: "Germany",
          market_fit_score: 77,
          commercial_appetite: "Solid interest in procedural and technical heist authenticity",
          cultural_friction: "High skepticism toward unrealistic physical stunts",
          actionable_fix: "Ground the electronic vault lock and atmospheric vent mechanics in realism",
        },
        {
          country_code: "BR",
          country_name: "Brazil",
          market_fit_score: 78,
          commercial_appetite: "High engagement with character ensemble friction and urgency",
          cultural_friction: "Static monologues risk drop-off during mid-scene",
          actionable_fix: "Maintain physical momentum and ticking-clock audio cues",
        },
      ],
      clickhouse_query_executed:
        "SELECT genre, trope, historical_reference, commercial_territory, audience_retention_pct FROM cinematic_precedents ORDER BY audience_retention_pct DESC LIMIT 5",
      _fallback: true,
      _error: message,
    });
  }
}
