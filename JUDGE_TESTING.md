# Judge Testing Guide — BlendEye

A 5-minute walkthrough to verify the ClickHouse time-gate mechanic and Google Cloud AI integrations live, without reading source code.

**Live app:** [blendeye.harmanita.com](https://blendeye.harmanita.com)
**Track:** ClickHouse Partner Track

---

## 1. Verify the ClickHouse Time-Gate (core mechanic, ~3 min)

This is the centerpiece: character knowledge is stored in ClickHouse as timestamped events, and every timeline scrub / Hot Seat question re-queries ClickHouse live — it is not simulated or hardcoded per timestamp.

1. Open [blendeye.harmanita.com](https://blendeye.harmanita.com) and enter the **"The Vault Heist"** benchmark production (visible on the Slate Hub / dashboard).
2. Go to the **Simulation** tab → **Character Interrogation** (Hot Seat).
3. Select **Marcus**. Scrub the timeline to **`00:34:00`**.
4. Ask: *"Do you know who has the vault keys?"*
   - Expect: Marcus answers with honest confidence — he believes the keys are safe in his vest. No knowledge of any betrayal.
5. Drag the scrubber forward to **`00:52:00`**.
   - Watch the **Knowledge Firewall strip** above the chat update — this reflects a live ClickHouse query, not a page reload.
6. Ask the **identical** question again: *"Do you know who has the vault keys?"*
   - Expect: Marcus's answer now reflects Elena's betrayal — a different answer to the same question, driven purely by the timestamp.
7. Open the **ClickHouse Query Inspector** (visible near the Hot Seat panel) to see the actual SQL executed against `story_events` and its real latency (typically 1–4ms).

If you want to see this pipeline built from scratch instead of using the pre-loaded benchmark, see **Section 3**.

---

## 2. Verify ClickHouse via the official MCP server (track requirement)

Separately from the direct time-gate queries above, ClickHouse is also wired as a **live agent tool** via the official `mcp-clickhouse` server — satisfying the track's requirement that ClickHouse be used "via the official ClickHouse MCP server" at runtime, not just a driver call made on the agent's behalf.

1. From the same project, open **Showrunner AI**.
2. Ask something requiring commercial grounding, e.g.: *"Is a mid-heist betrayal like this commercially proven? Any precedent?"*
3. Expect: the Showrunner cites a real precedent (e.g. *Heat*, *Sicario*) pulled from the `cinematic_precedents` ClickHouse table — this is the agent itself issuing a ClickHouse query as a tool call mid-conversation, via `agent-service/app/services/clickhouse_mcp.py`.

**Code reference:** `app/services/clickhouse_mcp.py` (MCP toolset) is attached to the agent in `app/agents/showrunner.py`. The direct-driver time-gate path lives in `app/services/clickhouse_store.py`.

---

## 3. Build the pipeline from scratch (optional, ~5 min)

To confirm the full pipeline — Gemini screenplay generation → Perspective Sharder → ClickHouse — works end-to-end on a project you create yourself, not just the pre-loaded benchmark:

1. Click **New Project** and fill in a title, logline, genre, director style, 2–3 characters, and a **Core Secret** (e.g. "Character B has secretly betrayed Character A, who doesn't find out until midway through the story").
2. Generate. Gemini 3.7 Flash writes the screenplay live (`google-genai`, called in `app/routers/media.py` / `app/agents/*.py`), and the Perspective Sharder automatically shards it into ClickHouse (`/api/sharding/shard`) once generation completes.
3. Go to **Simulation → Character Interrogation**, select a character, and repeat the before/after scrub test from Section 1 using your own story's secret.
4. If the Knowledge Firewall ever shows "No established knowledge yet at this timestamp" for a scene that should have events, open the **Screenplay Reader** (click a Script node → "Open Full Screenplay Reader"), switch to **Edit Master**, and click **"Save & Re-shard"** to force a fresh ClickHouse write — useful if a script was hand-edited after generation.

---

## 4. Google Cloud AI — where it's actually called

| Feature | Model | Code |
| :--- | :--- | :--- |
| Screenplay generation, Hot Seat, Showrunner | `gemini-3.7-flash` via `google-genai` / `google-adk` | `app/agents/*.py`, `app/routers/media.py` |
| Multi-speaker audio table read | `gemini-3.1-flash-tts-preview` | `app/routers/media.py` |
| Video generation (chained shots) | `veo-3.1-fast-generate-preview` | `app/services/video_sequencer.py` |
| Storyboard / concept art | `gemini-3.1-flash-image` | `app/routers/media.py` |

No other AI vendor SDK is imported anywhere in this repository.

---

## Notes

- Production ClickHouse runs on **ClickHouse Cloud** (not local Docker) — the `blendeye.harmanita.com` deployment queries a real hosted cluster.
- If a fresh custom project's Knowledge Firewall appears empty immediately after generation, use the **"Save & Re-shard"** button described in Section 3, step 4 — this manually re-triggers the same ClickHouse write path.
