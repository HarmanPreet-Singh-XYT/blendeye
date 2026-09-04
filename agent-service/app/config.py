from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Env-driven config. This service is stateless — no database URL here;
    Postgres/Supabase writes are owned by Next.js. Only the two things this
    sidecar actually needs at runtime: Gemini access and ClickHouse access.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Gemini / Google Cloud — required per hackathon rules (Google Cloud AI
    # only). GOOGLE_GENAI_USE_VERTEXAI toggles Vertex AI vs. AI Studio auth;
    # ADK respects the same env vars, no extra wiring needed on our side.
    google_api_key: str = ""
    google_genai_use_vertexai: bool = False
    google_cloud_project: str = ""
    google_cloud_location: str = "us-central1"
    gemini_model: str = "gemini-2.5-flash"

    # ClickHouse — the required partner track integration. Story Event
    # Engine (see plan.md Layer 2) reads/writes here via mcp-clickhouse.
    clickhouse_host: str = "localhost"
    clickhouse_port: int = 8443
    clickhouse_user: str = "default"
    clickhouse_password: str = ""
    clickhouse_database: str = "default"
    clickhouse_secure: bool = True

    # CORS — only the Next.js frontend calls this service.
    allowed_origins: list[str] = ["http://localhost:3000"]

    environment: str = "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()
