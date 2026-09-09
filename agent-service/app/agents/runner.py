"""Shared helper for invoking an ADK agent once and collecting its final
text response. This service is stateless (see plan.md's Next.js/Python
split) — every call gets a fresh InMemoryRunner and a throwaway session,
nothing persists between requests. Postgres/Supabase is Next.js's job;
ClickHouse is the Story Event Engine's job (clickhouse_store.py); this
process holds no state of its own.
"""

from __future__ import annotations

import json
import re
import uuid
from typing import Any

from google.adk.agents import BaseAgent
from google.adk.runners import InMemoryRunner
from google.genai import types


def parse_json_from_llm(text: str) -> Any:
    """Robust JSON parser for LLM outputs.
    Handles markdown fences, unescaped newlines/tabs inside string literals (strict=False),
    trailing commas, and conversational preamble/postscript text.
    """
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        cleaned = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])
        cleaned = cleaned.strip()

    # Attempt 1: Direct parse with strict=False (allows raw newlines/tabs inside strings)
    try:
        return json.loads(cleaned, strict=False)
    except Exception:
        pass

    # Attempt 2: Extract top-level { ... } or [ ... ] block
    match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", cleaned)
    if match:
        extracted = match.group(0).strip()
        try:
            return json.loads(extracted, strict=False)
        except Exception:
            pass
        # Remove trailing commas before closing braces/brackets
        no_trailing_commas = re.sub(r",\s*([\]}])", r"\1", extracted)
        try:
            return json.loads(no_trailing_commas, strict=False)
        except Exception:
            pass

    # Attempt 3: Strip trailing commas from full cleaned string
    no_trailing_commas = re.sub(r",\s*([\]}])", r"\1", cleaned)
    try:
        return json.loads(no_trailing_commas, strict=False)
    except Exception:
        pass

    # Attempt 4: Clean non-printable control characters
    sanitized = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", cleaned)
    return json.loads(sanitized, strict=False)


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

