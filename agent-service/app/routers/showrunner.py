from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents.runner import run_agent_once
from app.agents.showrunner import build_showrunner_agent
from app.services.clickhouse_store import get_clickhouse_store

router = APIRouter(prefix="/showrunner", tags=["showrunner"])


class ShowrunnerMessage(BaseModel):
    role: str  # "user" | "showrunner"
    content: str


class ShowrunnerChatRequest(BaseModel):
    project_title: str = ""
    logline: str = ""
    screenplay_text: str = ""
    characters: list[str] = []
    message: str
    history: list[ShowrunnerMessage] = []


class PrecedentItem(BaseModel):
    genre: str
    trope: str
    historical_reference: str
    tension_level: int
    commercial_territory: str
    audience_retention_pct: float
    precedent_example: str


class ShowrunnerChatResponse(BaseModel):
    reply: str
    suggested_actions: list[str] = Field(default_factory=list)
    clickhouse_query_sql: str = ""
    precedents_cited: list[PrecedentItem] = Field(default_factory=list)


@router.get("/precedents", response_model=list[PrecedentItem])
async def get_precedents(genre: str = "") -> list[PrecedentItem]:
    store = get_clickhouse_store()
    raw = store.get_cinematic_precedents(genre)
    return [PrecedentItem(**item) for item in raw]


@router.post("/chat", response_model=ShowrunnerChatResponse)
async def chat_with_showrunner(body: ShowrunnerChatRequest) -> ShowrunnerChatResponse:
    agent = build_showrunner_agent()
    store = get_clickhouse_store()

    # Query ClickHouse for cinematic precedents & box office metrics (Grounding Flourish)
    sql_executed = "SELECT genre, trope, historical_reference, tension_level, commercial_territory, audience_retention_pct, precedent_example FROM cinematic_precedents ORDER BY audience_retention_pct DESC;"
    raw_precedents = store.get_cinematic_precedents()
    precedents = [PrecedentItem(**p) for p in raw_precedents]

    precedent_context = "\n".join(
        f"- Reference: {p.historical_reference} | Trope: {p.trope} | Tension: {p.tension_level}/10 | Retention: {p.audience_retention_pct}% ({p.commercial_territory})\n  Notes: {p.precedent_example}"
        for p in precedents[:3]
    )

    context_header = f"""
PROJECT CONTEXT:
Title: {body.project_title or "Untitled Feature"}
Logline: {body.logline or "Unspecified"}
Characters: {", ".join(body.characters) if body.characters else "Ensemble"}

CLICKHOUSE GROUNDING TELEMETRY (REAL CINEMATIC PRECEDENTS & RETENTION BENCHMARKS):
{precedent_context}

CURRENT SCRIPT EXCERPT:
{body.screenplay_text or "(No script drafted yet)"}
---
"""

    history_text = "\n".join(
        f"{'DIRECTOR' if msg.role == 'user' else 'SHOWRUNNER'}: {msg.content}"
        for msg in body.history[-6:]
    )

    full_prompt = f"{context_header}\nCONVERSATION HISTORY:\n{history_text}\n\nDIRECTOR: {body.message}\nSHOWRUNNER:"

    reply = await run_agent_once(agent, full_prompt, app_name="writers-room-showrunner")

    suggestions = [
        "How can we heighten Elena's subtext in this scene?",
        "Check continuity: What does Marcus witness directly?",
        "Draft an alternate climax with an earlier betrayal",
    ]

    return ShowrunnerChatResponse(
        reply=reply,
        suggested_actions=suggestions,
        clickhouse_query_sql=sql_executed,
        precedents_cited=precedents[:3],
    )

