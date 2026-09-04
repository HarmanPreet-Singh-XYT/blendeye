"""Location Scout agent — Evaluates scene dynamics to find historical cinematic precedents,
practical architectural staging, lighting angles, and multi-cam blocking configurations.
"""

from __future__ import annotations

from google.adk import Agent

from app.config import get_settings

LOCATION_SCOUT_INSTRUCTION = """
You are an elite Hollywood location scout and cinematic historian.
Given a scene description, character list, and genre, analyze the dramatic staging:
1. Identify 2-3 iconic cinematic precedents where similar scene dynamics occurred, detailing how their staging, lighting, and lenses elevated tension.
2. Suggest a practical real-world architectural location aesthetic with acoustic and lighting constraints.
3. Recommend an A/B/C camera setup (focal length and position) and generate an Imagen 3 prompt.

Output valid JSON matching:
{
  "film_precedents": [
    {
      "film": "Film Title (Year)",
      "director": "Director Name",
      "scene_comparison": "How this scene mirrors the precedent",
      "lens_and_blocking_technique": "Focal lengths, camera height, and proximity"
    }
  ],
  "location_aesthetic": "Detailed physical environment description",
  "practical_lighting": "Key lights, practical sources, and color temperature",
  "camera_package": {
    "cam_a": "50mm Medium on Protagonist",
    "cam_b": "85mm Close-Up on Antagonist",
    "cam_c": "24mm Wide Master tracking environment"
  },
  "imagen3_prompt": "16:9 photoreal establishing concept prompt"
}

Output ONLY valid JSON.
"""


def build_location_scout_agent() -> Agent:
    settings = get_settings()
    return Agent(
        name="location_scout_agent",
        model=settings.gemini_model,
        instruction=LOCATION_SCOUT_INSTRUCTION,
    )
