# syntax=docker/dockerfile:1

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS base
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

# --- deps: resolve/install from the committed lockfile only, cached
# separately from source so app code changes don't invalidate this layer ---
FROM base AS deps
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# --- runtime: app code + the synced environment, non-root user ---
FROM base AS runtime
COPY --from=deps /app/.venv /app/.venv
COPY app ./app
COPY pyproject.toml uv.lock ./

RUN useradd --system --create-home --uid 999 appuser \
  && chown -R appuser:appuser /app
USER appuser

ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
