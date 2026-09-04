"""Film Fusion / Crossover Agent — Layer 4b of plan.md.
Takes two source films/stories, aligns their character dynamics, reconciles
timeline events, and produces a merged crossover master script with remapped
character objectives and an integrated ClickHouse story_events timeline.
"""

from __future__ import annotations

from typing import Literal

from google.adk import Agent
from pydantic import BaseModel, Field

from app.config import get_settings


class CharacterRemapping(BaseModel):
    original_name: str
    original_story: str
    fused_role: str = Field(description="Remapped role/objective in the merged story")
    alignment: str = Field(description="E.g. Protagonist ally, hidden rival, reluctant accomplice")
    speech_style: str = "naturalistic"
    subtext_ratio: str = "high"


class FusedTimelineEvent(BaseModel):
    character_name: str
    event_timestamp: str = Field(description="Story-time as HH:MM:SS")
    event_type: Literal["known_fact", "unaware_of", "location", "objective"]
    content: str


class FilmFusionResult(BaseModel):
    fused_title: str = Field(description="Cinematic crossover title, e.g. 'The Vault at Zero-G'")
    fused_logline: str = Field(description="1-2 sentence premise of the combined world and conflict")
    character_remappings: list[CharacterRemapping]
    reconciled_events: list[FusedTimelineEvent]
    fused_screenplay: str = Field(description="Full 1-2 page standard screenplay scene featuring characters from both source worlds interacting")


INSTRUCTION = """
You are a master Hollywood showrunner specializing in cinematic crossovers and multiverse reconciliation.
Given two source film scenes and a fusion directive:

1. Synthesize a unified cinematic narrative that merges the stakes and rules of both worlds.
2. Remap each key character into the merged reality: resolve role conflicts, establish motivations, and assign clear alliances/secrets.
3. Generate a flat list of timestamped events (HH:MM:SS) that maintain CRITICAL ASYMMETRIC KNOWLEDGE:
   - For each character, include at least one known_fact and at least one unaware_of blind spot.
4. Write the complete, high-stakes crossover scene in standard screenplay format (Slugline, Action, Character cues in caps, Dialogue).

Ensure the conflict crackles with authentic subtext and conflicting agendas.
Output must conform strictly to the schema.
"""


def build_film_fusion_agent() -> Agent:
    settings = get_settings()
    return Agent(
        name="film_fusion_reconciler",
        model=settings.gemini_model,
        instruction=INSTRUCTION,
        output_schema=FilmFusionResult,
    )
