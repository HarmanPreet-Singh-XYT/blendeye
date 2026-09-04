from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.perspective_sharder import (
    PerspectiveShardResult,
    build_perspective_sharder_agent,
)
from app.agents.runner import run_agent_once
from app.services.clickhouse_store import StoryEvent, get_clickhouse_store

router = APIRouter(prefix="/sharding", tags=["sharding"])


class ShardScriptRequest(BaseModel):
    project_id: str
    screenplay_text: str


class ShardScriptResponse(BaseModel):
    events_written: int
    events: list[StoryEvent]


@router.post("/shard", response_model=ShardScriptResponse)
async def shard_script(body: ShardScriptRequest) -> ShardScriptResponse:
    agent = build_perspective_sharder_agent()
    raw = await run_agent_once(agent, body.screenplay_text, app_name="perspective-sharder")
    parsed = PerspectiveShardResult.model_validate_json(raw)

    events = [
        StoryEvent(
            project_id=body.project_id,
            character_name=e.character_name,
            event_timestamp=e.event_timestamp,
            event_type=e.event_type,
            content=e.content,
        )
        for e in parsed.events
    ]

    store = get_clickhouse_store()
    store.insert_events(events)

    return ShardScriptResponse(events_written=len(events), events=events)
