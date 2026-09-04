import re
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents.film_fusion import (
    CharacterRemapping,
    FilmFusionResult,
    FusedTimelineEvent,
    build_film_fusion_agent,
)
from app.agents.runner import run_agent_once
from app.services.clickhouse_store import StoryEvent, get_clickhouse_store

router = APIRouter(prefix="/fusion", tags=["fusion"])


class FilmFusionRequest(BaseModel):
    title_a: str
    script_a: str
    title_b: str
    script_b: str
    fusion_directive: str = Field(
        default="Combine these two worlds into a high-stakes crossover scene where the characters' secrets clash directly."
    )
    fusion_project_id: str = "fusion-crossover-demo"


class FilmFusionResponse(BaseModel):
    fusion_project_id: str
    fused_title: str
    fused_logline: str
    character_remappings: list[CharacterRemapping]
    reconciled_events: list[FusedTimelineEvent]
    fused_screenplay: str
    events_written_to_clickhouse: int


def _clean_json_str(raw: str) -> str:
    text = raw.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


@router.post("/fuse", response_model=FilmFusionResponse)
async def fuse_films(body: FilmFusionRequest) -> FilmFusionResponse:
    prompt = f"""
SOURCE STORY A:
Title: {body.title_a}
Screenplay Excerpt:
{body.script_a}

SOURCE STORY B:
Title: {body.title_b}
Screenplay Excerpt:
{body.script_b}

FUSION DIRECTIVE:
{body.fusion_directive}
"""

    agent = build_film_fusion_agent()
    raw = await run_agent_once(agent, prompt, app_name="film-fusion-reconciler")
    cleaned = _clean_json_str(raw)
    parsed = FilmFusionResult.model_validate_json(cleaned)

    # Convert to ClickHouse StoryEvents
    store_events = [
        StoryEvent(
            project_id=body.fusion_project_id,
            character_name=e.character_name,
            event_timestamp=e.event_timestamp,
            event_type=e.event_type,
            content=e.content,
        )
        for e in parsed.reconciled_events
    ]

    store = get_clickhouse_store()
    store.clear_project_events(body.fusion_project_id)
    store.insert_events(store_events)

    return FilmFusionResponse(
        fusion_project_id=body.fusion_project_id,
        fused_title=parsed.fused_title,
        fused_logline=parsed.fused_logline,
        character_remappings=parsed.character_remappings,
        reconciled_events=parsed.reconciled_events,
        fused_screenplay=parsed.fused_screenplay,
        events_written_to_clickhouse=len(store_events),
    )
