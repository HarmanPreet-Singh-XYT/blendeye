"""Character Perspective Sharder — Layer 2 of plan.md, and the piece that
makes the time-gate mechanic scale past one hand-tuned demo scene (see
idea.md Section 3 / project-scope-decisions memory: known_facts/unaware_of
must be auto-derived, not authored). Ingests a generated master script and
produces a flat list of timestamped per-character events, structured to
drop directly into ClickHouse's story_events table
(app/services/clickhouse_store.py).

Uses ADK's output_schema to force structured JSON output — this agent's
entire value is that its output is machine-consumable, not prose.
"""

from __future__ import annotations

from typing import Literal

from google.adk import Agent
from pydantic import BaseModel, Field

from app.config import get_settings


class ShardedEvent(BaseModel):
    character_name: str
    event_timestamp: str = Field(description="Story-time as HH:MM:SS")
    event_type: Literal["known_fact", "unaware_of", "location", "objective"]
    content: str


class CharacterProfile(BaseModel):
    name: str
    archetype: str = Field(description="Short archetype or role, e.g. 'Getaway driver, rattles easily'")
    speech_style: str = Field(default="naturalistic", description="Cadence, e.g. terse, fast, defensive")
    subtext_ratio: str = Field(default="moderate", description="Subtext level: low, moderate, high")


class PerspectiveShardResult(BaseModel):
    scene_title: str = Field(description="Short cinematic title for the scene, e.g. 'The Vault Break'")
    scene_summary: str = Field(description="1-2 sentence synopsis of what happens in the scene")
    characters: list[CharacterProfile] = Field(description="List of characters appearing in or referenced in the scene")
    events: list[ShardedEvent] = Field(description="Flat list of timestamped events across all characters")


INSTRUCTION = """
You are a script continuity analyst. Given a screenplay scene, analyze it and:
1. Provide a concise scene title and a 1-2 sentence synopsis.
2. Identify all characters appearing in the scene with their archetypes, speech styles, and subtext levels.
3. Decompose the scene into a flat list of timestamped events for each character, tracking:
   - known_fact: something this character witnessed or learned by this point in the story, stated as a short factual sentence.
   - unaware_of: something relevant that happened in the scene that this character did NOT witness and has no way of knowing yet — including things other characters know, or events that occurred off-screen. For every named character, identify at least one fact that OTHER characters know but THIS character does NOT. This information firewall is essential.
   - location: where the character physically is at that timestamp.
   - objective: what the character is actively trying to do at that timestamp.

Assign plausible HH:MM:SS story-timestamps to each event based on the scene's internal pacing (assume the scene starts at a reasonable point in a feature runtime, e.g. 00:25:00, and events progress forward by a few minutes each as the scene plays out, e.g. 00:28:00, 00:34:00, 00:42:00, 00:52:00). Do not cluster all events at one timestamp.

Output must conform exactly to the provided schema.
"""


def build_perspective_sharder_agent() -> Agent:
    settings = get_settings()
    return Agent(
        name="perspective_sharder",
        model=settings.gemini_model,
        instruction=INSTRUCTION,
        output_schema=PerspectiveShardResult,
    )
