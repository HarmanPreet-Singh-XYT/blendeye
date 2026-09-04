from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import hot_seat, script, sharding, showrunner


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ClickHouse connects lazily on first use (see get_clickhouse_store),
    # not here — this lets /script/generate and other ClickHouse-independent
    # endpoints run even before ClickHouse credentials are provisioned,
    # which matters in early local dev. Endpoints that need the store
    # (sharding, hot-seat) will surface a clear connection error on their
    # own first call instead of taking down the whole process at boot.
    yield


settings = get_settings()

app = FastAPI(
    title="Agentic Cinema — Agent Service",
    description=(
        "Stateless Gemini/ADK sidecar. Handles script generation, "
        "perspective sharding, and time-gated hot-seat interrogation. "
        "Next.js owns Postgres/Supabase; this service owns Gemini/ADK "
        "calls and the ClickHouse story_events store."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(script.router)
app.include_router(sharding.router)
app.include_router(hot_seat.router)
app.include_router(showrunner.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}
