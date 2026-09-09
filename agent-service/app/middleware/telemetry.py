"""Telemetry Middleware — Intercepts and records request throughput, HTTP status,
and response duration metrics for Prometheus and Grafana dashboards.
"""

from __future__ import annotations

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.services.observability import (
    HTTP_REQUEST_DURATION_SECONDS,
    HTTP_REQUESTS_TOTAL,
)


class StudioTelemetryMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        endpoint = request.url.path
        method = request.method

        try:
            response = await call_next(request)
            status_code = str(response.status_code)
        except Exception:
            status_code = "500"
            duration = time.time() - start_time
            HTTP_REQUEST_DURATION_SECONDS.labels(method=method, endpoint=endpoint).observe(duration)
            HTTP_REQUESTS_TOTAL.labels(method=method, endpoint=endpoint, status=status_code).inc()
            raise

        duration = time.time() - start_time
        HTTP_REQUEST_DURATION_SECONDS.labels(method=method, endpoint=endpoint).observe(duration)
        HTTP_REQUESTS_TOTAL.labels(method=method, endpoint=endpoint, status=status_code).inc()

        return response
