# Agentic Cinema

A writers'-room tool where you scrub a story's timeline and interrogate any
character live — they only know what they'd know at that exact minute. Built
for the Google Cloud Agentic Cinema Hackathon (ClickHouse partner track).

See `idea.md` for the product spec and `plan.md` for the build plan.

## Structure

- `web/` — Next.js frontend + API routes (owns Postgres/Supabase writes)
- `agent-service/` — Python/FastAPI sidecar (owns Gemini/ADK calls and the
  ClickHouse `story_events` store)

Each has its own README with full setup details.

## Local development (recommended)

Only ClickHouse runs in Docker — it's infra, not app code, so it's the one
piece that benefits from staying containerized. `web` and `agent-service`
change constantly while you're building; run both natively with their own
fast dev servers (`npm run dev`, `uv run uvicorn --reload`) rather than
rebuilding a container on every edit.

```bash
cp .env.example .env   # sets a local ClickHouse dev password
docker compose up -d clickhouse

# in agent-service/: cp .env.example .env, fill in GOOGLE_API_KEY,
# match CLICKHOUSE_PASSWORD to the root .env, then:
cd agent-service && uv sync && uv run uvicorn app.main:app --reload --port 8000

# in web/: cp .env.example .env, then:
cd web && npm ci && npm run dev
```

- `agent-service` → http://localhost:8000 (`/docs` for the OpenAPI schema)
- `web` → http://localhost:3000
- ClickHouse HTTP interface → http://localhost:8123

## Run everything in Docker (deploy-style, not for active dev)

Builds both services into images and runs the full stack containerized —
useful for confirming the deploy path works, or if you'd rather not install
Node/Python locally. Slower edit-reload loop than the native setup above.

```bash
docker compose --profile full up --build
```

`web` waits for `agent-service`'s healthcheck before starting, and reaches
it over the compose network at `http://agent-service:8000` (not
`localhost` — that only matters inside `web`'s own container).

## License

MIT — see `LICENSE`.
