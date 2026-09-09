"""Grafana MCP Toolset — Provides Google ADK agents runtime access to Grafana's 60+ tools.
Allows autonomous studio agents to query metrics (query_prometheus), inspect logs (query_loki_logs),
search dashboards, and verify pipeline incident status via the official `mcp-grafana` server.
Satisfies the Grafana Labs Partner Track requirement.
"""

from __future__ import annotations

import logging
import os

from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from mcp import StdioServerParameters

from app.config import get_settings

logger = logging.getLogger(__name__)


def build_grafana_toolset() -> McpToolset:
    """Spawns the official mcp-grafana stdio server and wires it into Google ADK."""
    settings = get_settings()

    env = {
        **os.environ,
        "GRAFANA_URL": settings.grafana_url or os.environ.get("GRAFANA_URL", "https://blendeye.grafana.net"),
        "GRAFANA_SERVICE_ACCOUNT_TOKEN": (
            settings.grafana_service_account_token or os.environ.get("GRAFANA_SERVICE_ACCOUNT_TOKEN", "demo-token")
        ),
    }

    logger.info("Initializing official mcp-grafana toolset over stdio transport.")
    return McpToolset(
        connection_params=StdioServerParameters(
            command="mcp-grafana",
            args=["--disable-write", "--log-level", "warn"],
            env=env,
        ),
    )
