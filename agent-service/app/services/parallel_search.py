"""Parallel Web Systems Service — High-performance web intelligence and search grounding.
Powers real-time location scouting, municipal permit lookups, soundstage specs,
and cinematic box office precedent research via the official `parallel-web` SDK.
Satisfies the Parallel Partner Track requirement for runtime Search API execution.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from parallel import Parallel

from app.config import get_settings

logger = logging.getLogger(__name__)

_parallel_client: Parallel | None = None


def get_parallel_client() -> Parallel | None:
    """Returns a singleton instance of the Parallel client if an API key is configured."""
    global _parallel_client  # noqa: PLW0603
    if _parallel_client is not None:
        return _parallel_client

    settings = get_settings()
    api_key = settings.parallel_api_key or os.environ.get("PARALLEL_API_KEY", "")
    if not api_key:
        logger.warning("PARALLEL_API_KEY is not configured. Parallel search will be bypassed.")
        return None

    try:
        _parallel_client = Parallel(api_key=api_key)
        logger.info("Parallel Web Systems client initialized successfully.")
        return _parallel_client
    except Exception as e:  # noqa: BLE001
        logger.error("Failed to initialize Parallel client: %s", e)
        return None


def search_parallel(
    query: str,
    *,
    num_results: int = 5,
) -> list[dict[str, Any]]:
    """Executes a real-time web search query using the official Parallel Search API.
    Returns normalized search result dictionaries containing title, url, excerpts, and publish_date.
    """
    client = get_parallel_client()
    if not client:
        return []

    try:
        logger.info("Dispatching runtime search to Parallel API for query: '%s'", query)
        response = client.search(search_queries=[query])
        results: list[dict[str, Any]] = []

        raw_results = getattr(response, "results", None) or []
        for item in raw_results[:num_results]:
            url = getattr(item, "url", "")
            title = getattr(item, "title", "")
            publish_date = getattr(item, "publish_date", None)
            excerpts = getattr(item, "excerpts", []) or []

            results.append({
                "title": title.strip() if title else url,
                "url": url,
                "publish_date": publish_date,
                "excerpts": excerpts[:3],
                "source_engine": "parallel-web",
            })

        logger.info("Parallel API returned %d results for '%s'", len(results), query)
        return results

    except Exception as e:  # noqa: BLE001
        logger.error("Parallel API search failed for query '%s': %s", query, e)
        return []


def search_filming_locations(
    location_name: str,
    region: str,
    category: str = "filming location",
) -> list[dict[str, Any]]:
    """Specialized helper to search real-world venues, film offices, and permit guidelines
    in the targeted region using Parallel Web Systems.
    """
    query = f"{region} {location_name} {category} soundstage film permit specs"
    return search_parallel(query, num_results=4)
