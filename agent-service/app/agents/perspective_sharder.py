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


class PerspectiveShardResult(BaseModel):
    events: list[ShardedEvent]


INSTRUCTION = """
You are a script continuity analyst. Given a screenplay scene, decompose it
into a flat list of timestamped events, one per character, tracking:

- known_fact: something this character has witnessed or learned by this
  point in the story, stated as a short factual sentence.
- unaware_of: something relevant that happened in the scene that this
  character did NOT witness and has no way of knowing yet — including
  things other characters know, or events that occurred off-screen from
  this character's point of view. This is the important one: for every
  named character, look for at least one fact that OTHER characters in the
  scene know but THIS character does not. That asymmetry is the entire
  point of this task.
- location: where the character physically is at that timestamp.
- objective: what the character is actively trying to do at that timestamp.

Assign a plausible HH:MM:SS story-timestamp to each event based on the
scene's internal pacing (assume the scene starts at a reasonable point in a
feature-length runtime, e.g. 00:25:00, and events progress forward by a few
minutes each as the scene plays out — do not cluster everything at one
timestamp).

Cover every named character who appears or is referenced in the scene.
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
