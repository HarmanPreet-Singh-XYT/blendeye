from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.hot_seat import CharacterTimelineState, build_hot_seat_agent
from app.agents.runner import run_agent_once
from app.services.clickhouse_store import get_clickhouse_store

router = APIRouter(prefix="/hot-seat", tags=["hot-seat"])


class HotSeatTurnIn(BaseModel):
    role: str  # "interviewer" | "character"
    content: str


class HotSeatAskRequest(BaseModel):
    project_id: str
    character_name: str
    current_timestamp: str  # HH:MM:SS
    question: str
    physical_location: str = ""
    active_objective: str = ""
    speech_style: str = "naturalistic"
    subtext_ratio: str = "moderate"
    # Prior turns in this conversation — passed back in on every request
    # since each hot-seat call is a fresh, stateless agent (see
    # agents/hot_seat.py). The frontend owns transcript state.
    prior_turns: list[HotSeatTurnIn] = []


class KnowledgeFactOut(BaseModel):
    content: str
    type: str  # "known_fact" | "unaware_of"


class KnowledgeStateResponse(BaseModel):
    character_name: str
    current_timestamp: str
    known_facts: list[KnowledgeFactOut]
    query_sql: str


class HotSeatAskResponse(BaseModel):
    answer: str
    known_facts: list[KnowledgeFactOut]
    is_within_firewall: bool = False
    query_sql: str = ""


def _format_query_sql(project_id: str, character_name: str, at_timestamp: str) -> str:
    return (
        f"SELECT event_type, content FROM story_events\n"
        f"WHERE project_id = '{project_id}'\n"
        f"  AND character_name = '{character_name}'\n"
        f"  AND event_timestamp <= '{at_timestamp}'\n"
        f"ORDER BY event_timestamp;"
    )


@router.get("/knowledge", response_model=KnowledgeStateResponse)
async def get_knowledge_state(
    project_id: str,
    character_name: str,
    current_timestamp: str,
) -> KnowledgeStateResponse:
    """Instant ClickHouse time-gate query: fetches known_facts and unaware_of
    firewall for a character at or before current_timestamp.
    Fires on timeline scrubber movement without calling an LLM.
    """
    store = get_clickhouse_store()
    knowledge = store.knowledge_state(
        project_id=project_id,
        character_name=character_name,
        at_timestamp=current_timestamp,
    )

    facts_out = [
        KnowledgeFactOut(content=f, type="known_fact") for f in knowledge["known_facts"]
    ] + [KnowledgeFactOut(content=f, type="unaware_of") for f in knowledge["unaware_of"]]

    return KnowledgeStateResponse(
        character_name=character_name,
        current_timestamp=current_timestamp,
        known_facts=facts_out,
        query_sql=_format_query_sql(project_id, character_name, current_timestamp),
    )


@router.post("/ask", response_model=HotSeatAskResponse)
async def ask_hot_seat(body: HotSeatAskRequest) -> HotSeatAskResponse:
    store = get_clickhouse_store()
    knowledge = store.knowledge_state(
        project_id=body.project_id,
        character_name=body.character_name,
        at_timestamp=body.current_timestamp,
    )

    state = CharacterTimelineState(
        character_name=body.character_name,
        current_timestamp=body.current_timestamp,
        physical_location=body.physical_location,
        active_objective=body.active_objective,
        known_facts=knowledge["known_facts"],
        unaware_of=knowledge["unaware_of"],
    )

    agent = build_hot_seat_agent(
        state, speech_style=body.speech_style, subtext_ratio=body.subtext_ratio
    )

    transcript = "\n".join(
        f"{'INTERVIEWER' if t.role == 'interviewer' else body.character_name.upper()}: {t.content}"
        for t in body.prior_turns
    )
    prompt = f"{transcript}\nINTERVIEWER: {body.question}" if transcript else body.question

    answer = await run_agent_once(agent, prompt, app_name="hot-seat")

    known_facts_out = [
        KnowledgeFactOut(content=f, type="known_fact") for f in knowledge["known_facts"]
    ] + [KnowledgeFactOut(content=f, type="unaware_of") for f in knowledge["unaware_of"]]

    # Detect if the question / answer triggered knowledge firewall constraints
    question_lower = body.question.lower()
    is_firewall = any(
        any(word in question_lower for word in item.lower().split() if len(word) > 4)
        for item in knowledge["unaware_of"]
    ) or len(knowledge["unaware_of"]) > 0

    return HotSeatAskResponse(
        answer=answer,
        known_facts=known_facts_out,
        is_within_firewall=is_firewall,
        query_sql=_format_query_sql(body.project_id, body.character_name, body.current_timestamp),
    )
