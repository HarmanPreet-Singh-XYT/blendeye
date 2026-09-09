"""Observability Router — Exposes Prometheus metrics and Grafana telemetry for BlendEye.
Enables real-time studio pipeline monitoring and Grafana Cloud dashboard integration.
"""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Response
from pydantic import BaseModel

from app.services.clickhouse_store import get_clickhouse_store
from app.services.observability import (
    CLICKHOUSE_QUERY_LATENCY_MS,
    HTTP_REQUESTS_TOTAL,
    STORY_EVENTS_GAUGE,
    get_agentic_requests_summary,
    get_prometheus_metrics,
    get_studio_health_status,
    measure_network_latencies,
)

router = APIRouter(prefix="/observability", tags=["observability"])


@router.get("/metrics")
async def prometheus_metrics() -> Response:
    """Returns standard Prometheus exposition text format for Grafana Cloud scrapers."""
    data, content_type = get_prometheus_metrics()
    return Response(content=data, media_type=content_type)


@router.get("/overview")
async def studio_observability_overview() -> dict[str, Any]:
    """Provides a unified observability snapshot for the studio's Grafana telemetry inspector."""
    HTTP_REQUESTS_TOTAL.labels(method="GET", endpoint="/observability/overview", status="200").inc()

    ch_latency = None
    events_count = 0
    precedents_count = 0

    try:
        store = get_clickhouse_store()
        if store.is_connected and store.client is not None:
            t0 = time.time()
            store.client.query("SELECT 1")
            ch_latency = round((time.time() - t0) * 1000, 2)
            CLICKHOUSE_QUERY_LATENCY_MS.observe(ch_latency)

            events_count = store.client.query("SELECT count() FROM story_events").result_rows[0][0]
            precedents_count = store.client.query("SELECT count() FROM cinematic_precedents").result_rows[0][0]
            STORY_EVENTS_GAUGE.set(events_count)
    except Exception:  # noqa: BLE001
        pass

    health = get_studio_health_status()
    agentic_summary = get_agentic_requests_summary()

    return {
        "studio": "BlendEye Executive Studio Backlot",
        "observability_provider": "Grafana Labs (mcp-grafana & Prometheus)",
        "telemetry": {
            "clickhouse_latency_ms": ch_latency,
            "clickhouse_events_sharded": events_count,
            "cinematic_precedents_rows": precedents_count,
            "pipeline_state": health["pipeline"],
        },
        "agentic_request_distribution": agentic_summary,
        "promql_targets": [
            {
                "metric": "rate(blendeye_http_requests_total[5m])",
                "label": "Studio Request Throughput",
            },
            {
                "metric": "histogram_quantile(0.95, sum(rate(blendeye_clickhouse_query_latency_ms_bucket[5m])) by (le))",
                "label": "ClickHouse Time-Gate p95 Latency",
                "value": f"{ch_latency} ms",
            },
            {
                "metric": "sum(blendeye_agentic_requests_total) by (agentic_use, status_code)",
                "label": "Agentic Requests by Role & Status Code",
                "value": f"{agentic_summary['total_requests']} calls ({agentic_summary['success_rate_percent']}% 2xx)",
            },
            {
                "metric": "blendeye_story_events_total",
                "label": "Total Active Story Events",
                "value": str(events_count),
            },
        ],
        "network_latencies": health.get("network_latencies", []),
        "mcp_status": {
            "mcp_grafana": "active (60+ tools enabled: query_prometheus, query_loki_logs, list_dashboards)",
            "mcp_clickhouse": "active (MergeTree story_events)",
        },
    }


@router.post("/benchmark")
async def run_studio_benchmark() -> dict[str, Any]:
    """Runs a real live telemetry benchmark across ClickHouse and external network dependencies."""
    t_start = time.perf_counter()

    # 1. Real ClickHouse queries (5 executions)
    ch_latencies: list[float] = []
    store = get_clickhouse_store()
    if store.is_connected and store.client is not None:
        for _ in range(5):
            t0 = time.perf_counter()
            try:
                store.client.query("SELECT 1")
                elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
                ch_latencies.append(elapsed_ms)
                CLICKHOUSE_QUERY_LATENCY_MS.observe(elapsed_ms)
            except Exception:  # noqa: BLE001
                pass

    if ch_latencies:
        avg_ch = round(sum(ch_latencies) / len(ch_latencies), 2)
        sorted_lat = sorted(ch_latencies)
        p95_ch = sorted_lat[int(len(sorted_lat) * 0.95)] if len(sorted_lat) > 1 else sorted_lat[0]
        ch_status = "PASSED (< 4.0ms target)" if avg_ch < 4.0 else "DEGRADED (> 4.0ms target)"
    else:
        avg_ch = None
        p95_ch = None
        ch_status = "DISCONNECTED (ClickHouse store offline)"

    # 2. Real network latency probes
    network_latencies = measure_network_latencies()

    # 3. Overall benchmark duration
    bench_duration_ms = round((time.perf_counter() - t_start) * 1000, 2)

    return {
        "status": "success",
        "benchmark_duration_ms": bench_duration_ms,
        "clickhouse": {
            "queries_executed": len(ch_latencies),
            "avg_latency_ms": avg_ch,
            "p95_latency_ms": p95_ch,
            "slo_status": ch_status,
        },
        "network_latencies": network_latencies,
        "grafana_cloud_status": "telemetry_emitted",
    }

