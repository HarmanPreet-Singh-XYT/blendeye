"""Multiverse Alternate Takes — Layer: re-drafts a scene under a different
director style while preserving plot facts, character names, and stakes.
Sibling to script_generator.py (same single-turn, no-tools shape) but the
instruction is parameterized per-call with the requested director style
instead of being fixed, since the whole point of this feature is that each
of the 3 takes must actually differ.
"""

from __future__ import annotations

from google.adk import Agent

from app.config import get_settings

INSTRUCTION_TEMPLATE = """
You are a professional screenwriter doing a stylistic pass on an existing
scene. You will be given the current scene text and a target director style.

Rewrite the scene fully in that style — vary tone, pacing, camera direction
implied by the action lines, and dialogue rhythm to match. Do NOT change:
- the character names
- the core plot facts and outcome of the scene
- the location/setting implied by the original slugline

Target director style: {director_style}
Target subtext ratio: {subtext_ratio} (higher = more said between the lines,
lower = more direct/blunt dialogue)
Target pacing: {pacing_bpm} BPM (higher = faster, more urgent scene rhythm)
Camera movement note to reflect in action lines: {camera_movement}

Output ONLY the rewritten screenplay scene text (slugline, action lines,
dialogue). No preamble, no commentary, no markdown formatting.
"""


def build_scene_rewriter_agent(
    director_style: str,
    subtext_ratio: str,
    pacing_bpm: int,
    camera_movement: str,
) -> Agent:
    settings = get_settings()
    return Agent(
        name="multiverse_scene_rewriter",
        model=settings.gemini_model,
        instruction=INSTRUCTION_TEMPLATE.format(
            director_style=director_style,
            subtext_ratio=subtext_ratio,
            pacing_bpm=pacing_bpm,
            camera_movement=camera_movement,
        ),
    )
