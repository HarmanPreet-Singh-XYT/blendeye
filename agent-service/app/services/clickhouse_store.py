"""Story Event Engine — ClickHouse-backed store for per-character timeline
events. This is the required ClickHouse partner-track integration and the
actual data plane behind the timeline scrubber's time-gate mechanic (see
idea.md Section 3, plan.md Layer 2).

Schema matches plan.md exactly:

    CREATE TABLE story_events (
        project_id String,
        character_name String,
        event_timestamp String,   -- story-time HH:MM:SS, sortable
        event_type Enum('known_fact', 'unaware_of', 'location', 'objective'),
        content String,
        created_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY (project_id, character_name, event_timestamp);

Uses the official clickhouse-connect client directly for the read/write path
used by every request, and separately exposes an MCP client entry point
(see mcp_client.py) for the "grounding flourish" role (plan.md Layer 4) that
needs to demonstrate actual mcp-clickhouse usage at runtime, not just a
direct SQL driver — the hackathon's ClickHouse track requirement is scoped
to real runtime use of the mcp-clickhouse server, so that path is kept
separate and explicit rather than folded silently into this driver.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

import clickhouse_connect
from pydantic import BaseModel

from app.config import get_settings

EventType = Literal["known_fact", "unaware_of", "location", "objective"]

_TABLE_DDL = """
CREATE TABLE IF NOT EXISTS story_events (
    project_id String,
    character_name String,
    event_timestamp String,
    event_type Enum8('known_fact' = 1, 'unaware_of' = 2, 'location' = 3, 'objective' = 4),
    content String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (project_id, character_name, event_timestamp)
"""


class StoryEvent(BaseModel):
    project_id: str
    character_name: str
    event_timestamp: str  # HH:MM:SS, sortable as a string by construction
    event_type: EventType
    content: str


class ClickHouseStore:
    def __init__(self) -> None:
        settings = get_settings()
        self._client = clickhouse_connect.get_client(
            host=settings.clickhouse_host,
            port=settings.clickhouse_port,
            username=settings.clickhouse_user,
            password=settings.clickhouse_password,
            database=settings.clickhouse_database,
            secure=settings.clickhouse_secure,
        )
        self._client.command(_TABLE_DDL)

    def insert_events(self, events: list[StoryEvent]) -> None:
        if not events:
            return
        self._client.insert(
            "story_events",
            [
                [e.project_id, e.character_name, e.event_timestamp, e.event_type, e.content]
                for e in events
            ],
            column_names=[
                "project_id",
                "character_name",
                "event_timestamp",
                "event_type",
                "content",
            ],
        )

    def knowledge_state(
        self, project_id: str, character_name: str, at_timestamp: str
    ) -> dict[str, list[str]]:
        """The time-gate query: everything this character knows at or before
        `at_timestamp`, split into known_facts vs. unaware_of. This is the
        exact query underlying the timeline scrubber's core mechanic.
        """
        result = self._client.query(
            """
            SELECT event_type, content
            FROM story_events
            WHERE project_id = {project_id:String}
              AND character_name = {character_name:String}
              AND event_timestamp <= {at_timestamp:String}
            ORDER BY event_timestamp
            """,
            parameters={
                "project_id": project_id,
                "character_name": character_name,
                "at_timestamp": at_timestamp,
            },
        )
        known_facts: list[str] = []
        unaware_of: list[str] = []
        for event_type, content in result.result_rows:
            if event_type == "known_fact":
                known_facts.append(content)
            elif event_type == "unaware_of":
                unaware_of.append(content)
        return {"known_facts": known_facts, "unaware_of": unaware_of}

    def events_for_project(self, project_id: str) -> list[StoryEvent]:
        result = self._client.query(
            """
            SELECT project_id, character_name, event_timestamp, event_type, content
            FROM story_events
            WHERE project_id = {project_id:String}
            ORDER BY event_timestamp
            """,
            parameters={"project_id": project_id},
        )
        return [
            StoryEvent(
                project_id=row[0],
                character_name=row[1],
                event_timestamp=row[2],
                event_type=row[3],
                content=row[4],
            )
            for row in result.result_rows
        ]

    def clear_project_events(self, project_id: str) -> None:
        """Deletes prior events for a project to ensure idempotent re-sharding."""
        self._client.command(
            "ALTER TABLE story_events DELETE WHERE project_id = {project_id:String}",
            parameters={"project_id": project_id},
        )

    def get_cinematic_precedents(self, genre: str = "") -> list[dict]:
        """Queries ClickHouse cinematic_precedents table for grounding flourish."""
        query = "SELECT genre, trope, historical_reference, tension_level, commercial_territory, audience_retention_pct, precedent_example FROM cinematic_precedents"
        params = {}
        if genre:
            query += " WHERE genre LIKE {genre:String}"
            params["genre"] = f"%{genre}%"
        query += " ORDER BY audience_retention_pct DESC"
        result = self._client.query(query, parameters=params)
        return [
            {
                "genre": row[0],
                "trope": row[1],
                "historical_reference": row[2],
                "tension_level": row[3],
                "commercial_territory": row[4],
                "audience_retention_pct": float(row[5]),
                "precedent_example": row[6],
            }
            for row in result.result_rows
        ]




@lru_cache
def get_clickhouse_store() -> ClickHouseStore:
    return ClickHouseStore()
