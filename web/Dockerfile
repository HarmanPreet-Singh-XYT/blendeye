# syntax=docker/dockerfile:1

FROM node:22-slim AS base
WORKDIR /app

# --- deps: install with full lockfile fidelity, cached separately from source ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- build: compile the standalone Next.js server bundle ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- runtime: minimal image, only the standalone output + static assets ---
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 999 nodejs \
  && useradd --system --create-home --uid 998 --gid nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
