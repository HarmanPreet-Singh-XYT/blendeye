"""ClickHouse MCP toolset — the piece that satisfies the hackathon's
ClickHouse track requirement literally: "actively use ClickHouse at runtime
via the official ClickHouse MCP server (mcp-clickhouse)". This launches the
official `mcp-clickhouse` console script as a stdio subprocess and wires it
into an ADK agent as a callable toolset, so an agent (e.g. the hot-seat
interrogator, per idea.md's grounding-flourish role) can issue real
ClickHouse queries as part of its own reasoning loop, not just have a
Python driver call made on its behalf outside the agent.

clickhouse_store.py (clickhouse-connect direct driver) remains the primary
path for the Story Event Engine's own reads/writes, since that traffic is
our own application logic, not agent tool-use — using MCP for literally
every internal query would be needless overhead. This module is reserved
for the case that actually matters for the track requirement: an agent
deciding, mid-conversation, to query ClickHouse itself.
"""

from __future__ import annotations

import os

from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from mcp import StdioServerParameters

from app.config import get_settings


def build_clickhouse_toolset() -> McpToolset:
    settings = get_settings()

    env = {
        **os.environ,
        "CLICKHOUSE_HOST": settings.clickhouse_host,
        "CLICKHOUSE_PORT": str(settings.clickhouse_port),
        "CLICKHOUSE_USER": settings.clickhouse_user,
        "CLICKHOUSE_PASSWORD": settings.clickhouse_password,
        "CLICKHOUSE_DATABASE": settings.clickhouse_database,
        "CLICKHOUSE_SECURE": str(settings.clickhouse_secure).lower(),
        # Agent-driven queries are read-only by design — writes to
        # story_events go through clickhouse_store.py's direct driver path
        # under our own application logic, never through agent tool-use.
        "CLICKHOUSE_ALLOW_WRITE_ACCESS": "false",
    }

    return McpToolset(
        connection_params=StdioServerParameters(
            command="mcp-clickhouse",
            args=[],
            env=env,
        ),
    )
