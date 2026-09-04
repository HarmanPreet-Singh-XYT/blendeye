"""Shared helper for invoking an ADK agent once and collecting its final
text response. This service is stateless (see plan.md's Next.js/Python
split) — every call gets a fresh InMemoryRunner and a throwaway session,
nothing persists between requests. Postgres/Supabase is Next.js's job;
ClickHouse is the Story Event Engine's job (clickhouse_store.py); this
process holds no state of its own.
"""

from __future__ import annotations

import uuid

from google.adk.agents import BaseAgent
from google.adk.runners import InMemoryRunner
from google.genai import types


async def run_agent_once(agent: BaseAgent, prompt: str, *, app_name: str) -> str:
    """Runs `agent` with a single user turn and returns the concatenated
    text of its final response. One runner + one session per call — this
    is intentionally not optimized for multi-turn state, since multi-turn
    hot-seat conversations pass their own accumulated transcript back in
    as context on each request (see routers/hot_seat.py) rather than
    relying on ADK session memory across HTTP requests.
    """
    runner = InMemoryRunner(agent=agent, app_name=app_name)
    user_id = "agentic-cinema-user"
    session_id = str(uuid.uuid4())

    await runner.session_service.create_session(
        app_name=app_name, user_id=user_id, session_id=session_id
    )

    message = types.Content(role="user", parts=[types.Part(text=prompt)])

    final_text_parts: list[str] = []
    async for event in runner.run_async(
        user_id=user_id, session_id=session_id, new_message=message
    ):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    final_text_parts.append(part.text)

    return "".join(final_text_parts)
