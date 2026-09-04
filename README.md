# Agentic Cinema

A writers'-room tool where you scrub a story's timeline and interrogate any
character live — they only know what they'd know at that exact minute. Built
for the Google Cloud Agentic Cinema Hackathon (ClickHouse partner track).

See `idea.md` for the product spec and `plan.md` for the build plan.

## Structure

- `web/` — Next.js frontend + API routes (owns Postgres/Supabase writes)
- `agent-service/` — Python/FastAPI sidecar (owns Gemini/ADK calls and the
  ClickHouse `story_events` store)

Each has its own README with non-Docker setup instructions.

## Run everything with Docker

```bash
cp .env.example .env   # fill in GOOGLE_API_KEY and CLICKHOUSE_* at minimum
docker compose up --build
```

- `web` → http://localhost:3000
- `agent-service` → http://localhost:8000 (`/docs` for the OpenAPI schema)

`web` waits for `agent-service`'s healthcheck before starting, and reaches
it over the compose network at `http://agent-service:8000` (not
`localhost` — that only matters inside `web`'s own container).

## Run without Docker

See `web/README.md` and `agent-service/README.md` — both use their
respective package managers' native reproducible-install commands
(`npm ci` / `uv sync`), no Docker required for local development.

## License

MIT — see `LICENSE`.
