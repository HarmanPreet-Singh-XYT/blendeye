"""Stripboard Analyzer Agent — Technical production breakdown for 1st AD & Line Producer.
Analyzes scene text for stunt rigging, atmospheric FX, VFX tiers, specialized equipment,
and shooting permits/hazards.
"""

from __future__ import annotations

from google.adk import Agent

from app.config import get_settings

STRIPBOARD_ANALYZER_INSTRUCTION = """
You are a veteran Hollywood First Assistant Director (1st AD) and Production Line Producer.
Analyze the provided scenes/screenplay text and generate an exhaustive technical production breakdown
for shooting logistics, stunt safety, VFX budget allocation, and call-sheet stripboarding.

For each scene in the slate, evaluate:
1. "scene_number": Scene identifier (e.g. "01", "02")
2. "stunts": Specific physical stunt choreography, falls, weapon disarms, or wirework (or "None")
3. "stunt_tier": "None" | "Low" | "Moderate" | "High"
4. "practical_fx": Physical atmospheric effects (e.g. "Amber strobe, depressurization fog, pressurized steam, squibs, sparks")
5. "vfx_tier": "Class A" (heavy CGI/digital doubles/creatures) | "Class B" (screen replacement, digital set extension) | "Class C" (wire removal/cleanup) | "None"
6. "special_equipment": Camera and grip gear required (e.g., Technocrane 30, Steadicam, 35mm Anamorphic, Snorkel Lens, High-Speed Phantom 4K, Underwater Housing)
7. "permits_and_hazards": Safety requirements, permits, or environmental hazards (e.g. "Confined space safety officer", "Pyrotechnic permit", "Night noise ordinance", "Elevated gantry safety harnesses")
8. "complexity_rating": 1 to 5 (1 = simple two-hander dialogue, 5 = massive multi-hazard action sequence)
9. "production_notes": 1 crisp, actionable line producer note for the AD department

Output ONLY valid JSON matching this exact schema (no markdown formatting, no preamble):
{
  "total_shoot_days": 3,
  "estimated_budget_multiplier": 1.25,
  "production_summary": "Concise 2-sentence executive summary of production footprint and high-risk technical shoot days.",
  "breakdown": [
    {
      "scene_number": "01",
      "stunts": "...",
      "stunt_tier": "None | Low | Moderate | High",
      "practical_fx": "...",
      "vfx_tier": "Class A | Class B | Class C | None",
      "special_equipment": "...",
      "permits_and_hazards": "...",
      "complexity_rating": 1,
      "production_notes": "..."
    }
  ]
}
"""


def build_stripboard_analyzer_agent() -> Agent:
    settings = get_settings()
    return Agent(
        name="stripboard_analyzer_agent",
        model=settings.gemini_model,
        instruction=STRIPBOARD_ANALYZER_INSTRUCTION,
    )
