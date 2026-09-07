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

import logging

logger = logging.getLogger(__name__)

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
        self._client = None
        self._memory_events: list[StoryEvent] = []
        try:
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
        except Exception as e:
            logger.warning("ClickHouse unavailable, activating memory fallback store: %s", e)
            self._client = None

    @property
    def is_connected(self) -> bool:
        return self._client is not None

    @property
    def client(self):
        """Public accessor for callers that need to run ad hoc queries
        (e.g. /metrics telemetry, market-viability precedent lookups)
        without duplicating the store's connection setup.
        """
        return self._client

    def insert_events(self, events: list[StoryEvent]) -> None:
        if not events:
            return
        if self._client:
            try:
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
                return
            except Exception as e:
                logger.warning("ClickHouse insert failed, falling back to memory: %s", e)
        self._memory_events.extend(events)

    def knowledge_state(
        self, project_id: str, character_name: str, at_timestamp: str
    ) -> dict[str, list[str]]:
        """The time-gate query: everything this character knows at or before
        `at_timestamp`, split into known_facts vs. unaware_of. This is the
        exact query underlying the timeline scrubber's core mechanic.
        """
        if self._client:
            try:
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
            except Exception as e:
                logger.warning("ClickHouse knowledge_state query failed: %s", e)

        # In-memory fallback
        known_facts = []
        unaware_of = []
        for e in sorted(self._memory_events, key=lambda x: x.event_timestamp):
            if (
                e.project_id == project_id
                and e.character_name == character_name
                and e.event_timestamp <= at_timestamp
            ):
                if e.event_type == "known_fact":
                    known_facts.append(e.content)
                elif e.event_type == "unaware_of":
                    unaware_of.append(e.content)
        return {"known_facts": known_facts, "unaware_of": unaware_of}

    def events_for_project(self, project_id: str) -> list[StoryEvent]:
        if self._client:
            try:
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
            except Exception as e:
                logger.warning("ClickHouse events_for_project query failed: %s", e)

        return [
            e for e in sorted(self._memory_events, key=lambda x: x.event_timestamp)
            if e.project_id == project_id
        ]

    def clear_project_events(self, project_id: str) -> None:
        """Deletes prior events for a project to ensure idempotent re-sharding."""
        if self._client:
            try:
                self._client.command(
                    "ALTER TABLE story_events DELETE WHERE project_id = {project_id:String}",
                    parameters={"project_id": project_id},
                )
            except Exception as e:
                logger.warning("ClickHouse clear_project_events command failed: %s", e)
        self._memory_events = [e for e in self._memory_events if e.project_id != project_id]

    def get_cinematic_precedents(self, genre: str = "") -> list[dict]:
        """Queries ClickHouse cinematic_precedents table for grounding flourish with hybrid genre fallback."""
        base_query = "SELECT genre, trope, historical_reference, tension_level, commercial_territory, audience_retention_pct, precedent_example FROM cinematic_precedents"
        if genre:
            try:
                result = self._client.query(
                    f"{base_query} WHERE genre LIKE {{genre:String}} ORDER BY audience_retention_pct DESC",
                    parameters={"genre": f"%{genre}%"},
                )
                if result.result_rows:
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
            except Exception:
                pass

            # Fallback to token matching for composite / hybrid genres
            tokens = [t.strip() for t in genre.replace("/", " ").replace("-", " ").split() if len(t.strip()) >= 4]
            for tok in tokens:
                try:
                    result = self._client.query(
                        f"{base_query} WHERE genre LIKE {{tok:String}} ORDER BY audience_retention_pct DESC",
                        parameters={"tok": f"%{tok}%"},
                    )
                    if result.result_rows:
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
                except Exception:
                    pass

        try:
            result = self._client.query(f"{base_query} ORDER BY audience_retention_pct DESC")
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
        except Exception:
            return []




@lru_cache
def get_clickhouse_store() -> ClickHouseStore:
    return ClickHouseStore()
