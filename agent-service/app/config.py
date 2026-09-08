import json
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# pydantic-settings' env_file loading only populates the Settings object
# below — it does NOT export values into os.environ. google-genai's Client
# (which ADK's Agent uses under the hood) reads GOOGLE_API_KEY straight
# from os.environ itself, independent of anything Settings parses. Without
# this, GOOGLE_API_KEY silently never reaches the actual Gemini client even
# though Settings.google_api_key is populated correctly — the two are
# unrelated pipes. Loading .env into the real process environment here
# closes that gap; safe to call before pydantic-settings does its own
# (separate) parse of the same file below.
load_dotenv()


class Settings(BaseSettings):
    """Env-driven config. This service is stateless — no database URL here;
    Postgres/Supabase writes are owned by Next.js. Only the two things this
    sidecar actually needs at runtime: Gemini access and ClickHouse access.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Gemini / Google Cloud — required per hackathon rules (Google Cloud AI
    # only). GOOGLE_GENAI_USE_VERTEXAI toggles Vertex AI vs. AI Studio auth.
    # NOTE: google-genai's Client reads GOOGLE_API_KEY etc. directly from
    # os.environ (see load_dotenv() above), not from this Settings object —
    # these fields exist for our own code (e.g. clickhouse_mcp.py building
    # a subprocess env) and validation, not because ADK consults them.
    google_api_key: str = ""
    google_genai_use_vertexai: bool = False
    google_cloud_project: str = ""
    google_cloud_location: str = "us-central1"
    gemini_model: str = "gemini-3.7-flash"

    # ClickHouse — the required partner track integration. Story Event
    # Engine (see plan.md Layer 2) reads/writes here via mcp-clickhouse.
    # Defaults below target a local self-hosted container (see root
    # docker-compose.yml's `clickhouse` service: HTTP port 8123, no TLS).
    # Point at ClickHouse Cloud instead by overriding host/port 8443/
    # secure=true in your .env — Cloud's default HTTPS port, unlike the
    # self-hosted container's plain HTTP port.
    clickhouse_host: str = "localhost"
    clickhouse_port: int = 8123
    clickhouse_user: str = "default"
    clickhouse_password: str = ""
    clickhouse_database: str = "default"
    clickhouse_secure: bool = False

    # CORS — only the Next.js frontend calls this service.
    allowed_origins: str | list[str] = ["http://localhost:3000"]

    @field_validator("allowed_origins", mode="after")
    @classmethod
    def parse_allowed_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v_clean = v.strip()
            if v_clean in ("*", "[*]", "['*']", '["*"]'):
                return ["*"]
            if v_clean.startswith("[") and v_clean.endswith("]"):
                try:
                    parsed = json.loads(v_clean)
                    if isinstance(parsed, list):
                        return [str(x).strip() for x in parsed]
                except Exception:
                    v_clean = v_clean[1:-1]
            return [origin.strip().strip("'").strip('"') for origin in v_clean.split(",") if origin.strip()]
        return ["*"]

    environment: str = "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()
