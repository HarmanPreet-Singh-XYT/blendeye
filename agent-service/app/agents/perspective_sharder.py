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
You are a script continuity analyst. You will be given either a single screenplay
scene, or a FULL multi-scene script where each scene is delimited by a marker line
of the form:

=== SCENE <number>: <title> (starts at <seconds>s) ===

When these markers are present, treat the whole input as ONE continuous story
timeline, not isolated scenes. The "(starts at Xs)" value on each marker is that
scene's actual absolute start time in seconds since story start — you MUST anchor
that scene's events to start at or after that offset, converted to HH:MM:SS, so
timestamps are consistent and strictly increasing across scene boundaries. A fact
established in an earlier scene remains true and known (for characters who learned
it) in every later scene, unless the script explicitly shows it being forgotten,
contradicted, or hidden again — carry known_fact events forward as needed so a
character's knowledge state is cumulative across the whole script, not reset per
scene. If no scene markers are present, treat the input as a single scene starting
at 00:00:00.

Analyze the full input and:
1. Provide a concise overall title and a 1-2 sentence synopsis (if multiple scenes are present, summarize the throughline, e.g. the central secret/reveal).
2. Identify all characters appearing anywhere in the input with their archetypes, speech styles, and subtext levels.
3. Decompose the full input into a flat list of timestamped events for each character, tracking:
   - known_fact: something this character witnessed or learned by this point in the story, stated as a short factual sentence.
   - unaware_of: something relevant that this character did NOT witness and has no way of knowing yet — including things other characters know, or events that occurred off-screen. For every named character, identify at least one fact that OTHER characters know but THIS character does NOT. This information firewall is essential.
   - location: where the character physically is at that timestamp.
   - objective: what the character is actively trying to do at that timestamp.

Assign HH:MM:SS story-timestamps anchored to each scene's actual start offset (see above). Within a scene, progress timestamps forward by a few minutes as it plays out. Do not cluster all events at one timestamp, and do not let a later scene's events use an earlier timestamp than a prior scene's events.

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
