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


class HotSeatAskResponse(BaseModel):
    answer: str
    known_facts: list[KnowledgeFactOut]


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

    return HotSeatAskResponse(answer=answer, known_facts=known_facts_out)
