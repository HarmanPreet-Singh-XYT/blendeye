"""Style Extractor agent — Multimodal style extraction from YouTube video links,
timestamps, and cinematography notes into an Aesthetic Style Bible and Imagen 3 prompt.
"""

from __future__ import annotations

from google.adk import Agent

from app.config import get_settings

STYLE_EXTRACT_INSTRUCTION = """
You are a visionary cinematographer and visual production designer.
Given a YouTube video reference, timestamp markers, target genre, and director notes,
extract a comprehensive Cinematic Style Bible in valid JSON.

JSON format required:
{
  "visual_palette": ["Hex code or color descriptor 1", "Descriptor 2", "Descriptor 3"],
  "lighting_style": "Lighting setup (e.g., low-key chiaroscuro, high-contrast neon reflections, soft natural golden hour)",
  "camera_motion": "Camera tracking style, lens focal lengths, and camera height",
  "editing_rhythm": "Pacing profile (e.g., rapid staccato cuts, deliberate slow-burn long takes)",
  "sound_and_acoustics": "Atmospheric audio layer notes",
  "imagen3_prompt": "Production-grade prompt for Imagen 3 generating a 2.39:1 anamorphic cinematic concept frame matching this exact aesthetic"
}

Output ONLY valid JSON. No markdown code blocks, no commentary.
"""


def build_style_extractor_agent() -> Agent:
    settings = get_settings()
    return Agent(
        name="style_extractor_agent",
        model=settings.gemini_model,
        instruction=STYLE_EXTRACT_INSTRUCTION,
    )
