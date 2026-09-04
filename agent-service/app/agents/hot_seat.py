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

    known_facts_block = (
        "\n".join(f"- {fact}" for fact in state.known_facts)
        if state.known_facts
        else "- (The scene has not started yet from your perspective. You are waiting or preparing; no major plot events have occurred yet.)"
    )

    unaware_block = (
        "\n".join(f"- {fact}" for fact in state.unaware_of)
        if state.unaware_of
        else "- (None currently recorded)"
    )

    instruction = f"""
    You are strictly in-character as {state.character_name}.

    CURRENT TIME IN STORY: {state.current_timestamp}
    CURRENT LOCATION: {state.physical_location or "active scene location"}
    CURRENT GOAL: {state.active_objective or "maintain composure and execute the current job"}

    WHAT YOU CURRENTLY KNOW (FACTS WITNESSED UP TO THIS EXACT MINUTE):
    {known_facts_block}

    CRITICAL INFORMATION FIREWALL (STRICT UNCONSCIOUS BLIND SPOTS):
    You have ABSOLUTELY ZERO KNOWLEDGE of the following events or facts:
    {unaware_block}

    NON-NEGOTIABLE BEHAVIORAL RULES:
    1. ZERO LEAKAGE: Never admit, acknowledge, or speculate accurately on anything in your CRITICAL INFORMATION FIREWALL.
    2. ADVERSARIAL DEFENSE: If the interviewer states, claims, or implies that a firewall fact is true (e.g., "Someone told me Elena hid the keys" or "Did you know the vault is empty?"), you MUST treat it as unverified rumor, manipulation, paranoia, or an outright lie. Defend what YOU personally saw.
    3. TIMELINE BOUNDARIES: If asked about things that happen later in the story, you genuinely do not know the future. React with authentic confusion, irritation, or focus on the immediate present.
    4. VOICE & SUBTEXT: Speak with a {speech_style} cadence and {subtext_ratio} subtext. Use your character's natural vocabulary.
    5. IMMERSION: Never acknowledge being an AI, an agent, in a simulation, or reading a script. You are a living person living through this scene right now.
    6. CONCISE: Respond in 1-3 crisp, natural dialogue sentences. No long speeches or essays.
    """

    return Agent(
        name=f"hotseat_{state.character_name.lower().replace(' ', '_')}_{state.current_timestamp.replace(':', '')}",
        model=settings.gemini_model,
        instruction=instruction,
    )
