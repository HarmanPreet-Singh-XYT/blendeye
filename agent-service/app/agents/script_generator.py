"""Master script generation — Layer 1 of plan.md. Takes a scene premise and
produces a screenplay-formatted scene. This is intentionally the simplest
agent in the service: single-turn, no tools, no state. Its output feeds the
Perspective Sharder (perspective_sharder.py), which is where the real
complexity (auto-deriving per-character knowledge state) lives.
"""

from __future__ import annotations

from google.adk import Agent

from app.config import get_settings

INSTRUCTION = """
You are a professional screenwriter. Given a scene premise, write a single
scene in standard screenplay format: a slugline (INT./EXT. LOCATION - TIME),
action lines, and dialogue with character names in caps above their lines.

Requirements:
- Introduce 2-4 named characters with distinct voices.
- Include at least one concrete fact that only some characters witness
  directly (this matters for downstream perspective-sharding — the scene
  needs asymmetric knowledge between characters to be useful).
- Keep it to roughly 1-2 pages of screenplay text.
- Output ONLY the screenplay text. No preamble, no commentary.
"""


def build_script_generator_agent() -> Agent:
    settings = get_settings()
    return Agent(
        name="master_script_generator",
        model=settings.gemini_model,
        instruction=INSTRUCTION,
    )
