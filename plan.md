# Execution Plan — 6 Days to Submission

**Deadline:** 2026-09-08/09 (contest closes 2026-09-09, 2:00 PM PT). Today: 2026-09-03.
**Track:** ClickHouse. **Goal:** a 3-minute demo video with one unforgettable moment, backed by
a submission that clears Stage One (real runtime ClickHouse + Google Cloud AI usage, public
repo with OSS license, hosted URL).

Full product context: `idea.md`. Deferred features: `idea-full-vision.md`.

---

## Guiding principle: layered build, graceful degradation

Each layer below is independently demoable. If a layer runs late, the layer below it becomes
the fallback for the video — nothing above Layer 0 is load-bearing for eligibility, and Layer 5
(polish) is protected even if it means cutting Layer 3 or 4 early. Decide per-layer cut/keep by
its checkpoint date; don't let indecision eat into Layer 5 time.

---

## Layer 0 — Static spine (Day 1, non-negotiable, insurance policy)

Node graph UI (React Flow) with one hardcoded/seeded scene, hardcoded character states,
hardcoded timeline scrub behavior driven by static data. No live generation yet.

**Why first:** this alone is the worst-case fallback demo. If everything above it fails, a
scripted walkthrough of Layer 0 with pre-baked data still looks like a real product on video —
judges watching a video cannot distinguish "computed live" from "computed earlier and replayed."

**Checkpoint (end of Day 1):** can click through graph → script → scrub timeline → see a
character's knowledge state change, all from static fixtures.

---

## Layer 1 — Real generation (Days 1–2)

Next.js API route → Python/ADK sidecar → Gemini generates a master script from user input
(a scene premise / short prompt). Written into Supabase.

**Checkpoint:** typing a premise produces a real generated scene, replacing Layer 0's fixture.

**Cut fallback:** if slipping past Day 2, keep Layer 0's seeded script as *the* demo scene
permanently — nobody watching the final video can tell the difference.

---

## Layer 2 — Perspective Sharding + ClickHouse Story Event Engine + Time-Gate (Days 2–4)

**This is the centerpiece. Most build time and all polish time goes here.**

1. Perspective Sharder agent: ingests the master script, derives per-character events
   (timestamp, location, known_facts, unaware_of) — auto-derived by the LLM, not
   hand-authored, so it isn't limited to one manually-tuned demo scene.
2. Events written to ClickHouse `story_events` table (schema below).
3. Timeline scrubber UI wired to a real query: on scrub to timestamp T, fetch
   `story_events WHERE character = ? AND timestamp <= T` from ClickHouse via the
   `mcp-clickhouse` server.
4. Hot-seat chat: Gemini/ADK agent instantiated per-request with the queried knowledge state
   as its context firewall (see `idea.md` Section 5 code).

**Checkpoint (end of Day 4):** scrub to Minute 34, ask a planted question, get a
knowledge-bounded wrong-but-honest answer; scrub to Minute 52, ask again, get the correct
answer. This exchange IS the product's pitch — budget real iteration time on making the
answers feel authored, not generic.

**Cut fallback — the one real risk-mitigation call in this plan:** if the live pipeline
(script → sharder → ClickHouse → time-gated chat) isn't reliable by Day 4, pre-generate and
store the sharded ClickHouse events for the one demo scene ahead of the recording session, and
only perform the scrub-and-ask interaction live/on-camera. The judges evaluate the video; a
video cannot distinguish a query that ran five minutes before recording from one that ran
during it. Do NOT let this pipeline's polish slip — it's the one thing this whole submission
is judged on.

### `story_events` schema (ClickHouse)

```sql
CREATE TABLE story_events (
    project_id String,
    character_name String,
    event_timestamp String,   -- story-time HH:MM:SS, sortable
    event_type Enum('known_fact', 'unaware_of', 'location', 'objective'),
    content String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (project_id, character_name, event_timestamp);
```

Query pattern powering the time-gate:

```sql
SELECT event_type, content
FROM story_events
WHERE project_id = {project_id:String}
  AND character_name = {character:String}
  AND event_timestamp <= {current_timestamp:String}
ORDER BY event_timestamp;
```

---

## Layer 3 — One visual payoff (Days 4–5)

Imagen 3 storyboard generation for the demo scene (16:9 frames). Chosen over the director's
floor plan node — more immediately legible as "cinematic" to a judge scanning quickly.

**Checkpoint:** clicking generate on the scene node produces storyboard frames in the graph.

**Cut fallback:** cut entirely without damage. The time-gate moment alone (Layer 2) carries
the video. This is the first thing to drop if Days 1–4 ran long.

---

## Layer 4 — ClickHouse grounding flourish (Day 5, only if Layers 0–2 are solid)

Second ClickHouse role: one live query against a small public box-office/territory dataset,
surfaced visibly during a hot-seat answer (e.g., character or narrator references something
grounded in real regional data). Additive on top of Layer 2's story-event engine — does not
replace it. See `idea.md` Section 3 / memory note `project-clickhouse-track-choice` for the
reasoning on why this is a second role, not the primary integration.

**Cut fallback:** cut entirely. Layer 2 alone already satisfies the ClickHouse track
requirement (real runtime MCP usage) — this layer is pure upside for "Quality of Idea" scoring,
not a requirement.

---

## Layer 4b — Film Fusion / Crossover (stretch goal only, Day 5, only if 0–4 are done early)

User picks 2+ films/scripts, describes how to combine them, agent matches characters across
sources, auto-connects compatible scenes, remaps roles that don't fit. Reuses the `story_events`
ClickHouse table from Layer 2 — each source is sharded independently, fusion is a reconciliation
pass over that same data (align timelines, detect character/role conflicts, remap) rather than
new infra.

**Explicitly not a Day 1–6 commitment.** Higher risk than the time-gate: matching tone and
characters across two different works is a fuzzy creative-judgment call with no clean
right/wrong check, unlike "does the character know X" which is easy to verify and demo
reliably. Only attempt this if Layers 0–3 are done with real time left on Day 5 — user decision
(2026-09-03): keep this strictly a stretch goal, do not split centerpiece build time with it.

**Cut fallback:** cut entirely, zero cost — it was never in the committed plan.

**Note on scope:** YouTube/video-essay ingestion (originally idea-full-vision.md's ingest
mechanism) is deprioritized to last/optional for this build — a filmmaker pitching original
work is unlikely to want visible sourcing from someone else's copyrighted video on camera, and
it raises IP/rights exposure given the hackathon's originality warranty (Official Rules §15).
Not worth build time or risk; user input for scene generation stays text-based (premise/prompt)
for this submission.

---

## Layer 5 — Polish + submission assembly (protected time block, Day 5 evening–Day 6)

**Never cut this. Cut Layer 3 or 4 earlier rather than raiding this time.**

- UI transitions, loading states, empty states — a judge's impression is more edit-quality than
  feature-count.
- Record the 3-minute demo video following the arc in `idea.md` Section 6. Multiple takes if
  needed; this is the single highest-leverage artifact in the whole submission.
- Write the text description (features, tech stack, data sources, learnings) — required field.
- Confirm repo is public, OSS license file present and detectable in the About section.
- Confirm the deployed URL works from a clean session (no dev-only env assumptions).
- Submit on Devpost with time to spare before 2026-09-09 2:00 PM PT — do not target the deadline
  itself as the submission time.

---

## Day-by-day summary

| Day | Focus | Checkpoint |
| --- | --- | --- |
| 1 | Layer 0 (static spine) + start Layer 1 | Clickable graph with seeded data works end-to-end |
| 2 | Finish Layer 1, start Layer 2 (sharder + ClickHouse schema) | Real script generation live |
| 3 | Layer 2 (time-gate wiring, hot-seat chat) | Scrub-and-ask works with real ClickHouse queries |
| 4 | Layer 2 polish + reliability decision point | Decide: live demo or pre-baked-data demo for recording |
| 5 | Layer 3 (storyboard) if time allows, then Layer 4 / 4b (grounding flourish / fusion stretch) if time allows | Visual payoff working OR consciously cut |
| 6 | Layer 5 only — polish, record video, assemble submission, submit early | Submitted on Devpost with buffer before deadline |

---

## Stack recap

- **Frontend/API:** Next.js (React Flow canvas, API routes)
- **Agent backend:** Python service using `google-adk` — Gemini 2.5 Flash agents, Imagen 3,
  Gemini TTS if time allows
- **App state:** Supabase (Postgres) — projects, node graph, script text, auth
- **Story event / time-gate data:** ClickHouse via `mcp-clickhouse` — `story_events` table +
  secondary public grounding dataset
- **Deploy:** hosted URL required by rules; Replit was considered but ruled out (would require
  Replit Agent in the dev workflow, conflicting with building via Claude Code) — use whatever
  standard host is fastest to stand up (Vercel for Next.js + a small Python host for the ADK
  sidecar).
