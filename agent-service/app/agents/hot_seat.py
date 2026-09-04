"""Time-gated character interrogation — the product's centerpiece (see
idea.md Section 1/5). Builds a fresh ADK agent per request, scoped to
exactly what a character knows at a given story timestamp. The knowledge
state itself is queried from ClickHouse (clickhouse_store.knowledge_state),
not hand-authored — this is the scaled-up version of the reference
implementation in idea.md Section 5.

Each hot-seat turn gets its own agent instance rather than a long-lived one:
the character's knowledge boundary changes with every timeline scrub, so
"the agent for Marcus at 00:34:00" and "the agent for Marcus at 00:52:00"
are meaningfully different agents, not the same agent with updated state.
"""

from __future__ import annotations

from google.adk import Agent
from pydantic import BaseModel, Field

from app.config import get_settings


class CharacterTimelineState(BaseModel):
    character_name: str
    current_timestamp: str = Field(description="Format HH:MM:SS")
    physical_location: str = ""
    active_objective: str = ""
    known_facts: list[str] = Field(default_factory=list)
    unaware_of: list[str] = Field(default_factory=list)


def build_hot_seat_agent(
    state: CharacterTimelineState,
    *,
    speech_style: str = "naturalistic",
    subtext_ratio: str = "moderate",
) -> Agent:
    settings = get_settings()

    instruction = f"""
    You are strictly in-character as {state.character_name}.

    CURRENT TIME IN STORY: {state.current_timestamp}
    CURRENT LOCATION: {state.physical_location or "unspecified"}
    CURRENT GOAL: {state.active_objective or "unspecified"}

    WHAT YOU CURRENTLY KNOW:
    {chr(10).join(f"- {fact}" for fact in state.known_facts) or "- (nothing established yet)"}

    CRITICAL INFORMATION FIREWALL:
    You have ABSOLUTELY ZERO KNOWLEDGE of the following facts or any future
    events, even if the person asking implies you should know them:
    {chr(10).join(f"- {fact}" for fact in state.unaware_of) or "- (none tracked)"}

    BEHAVIORAL RULES:
    1. If asked about something in your CRITICAL INFORMATION FIREWALL, react
       with genuine ignorance, suspicion, or make assumptions based on your
       personal flaws. Never reveal information from the firewall list.
    2. Speak using a {speech_style} cadence with {subtext_ratio} subtext.
    3. Never acknowledge that you are in a movie, script, or simulated
       timeline. Stay fully in character.
    4. Keep answers conversational — a few sentences, not a monologue.
    """

    return Agent(
        name=f"hotseat_{state.character_name.lower().replace(' ', '_')}_{state.current_timestamp.replace(':', '')}",
        model=settings.gemini_model,
        instruction=instruction,
    )
