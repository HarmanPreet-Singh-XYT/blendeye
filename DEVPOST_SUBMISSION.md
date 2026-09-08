# Devpost Submission — BlendEye

> **Google Cloud Agentic Cinema Hackathon** — ClickHouse Partner Track
> **Project Name:** BlendEye
> **Tagline:** The Writers' Room That Knows What Your Characters Know.

---

## 🎬 Inspiration
In traditional filmmaking and television writers' rooms, writers constantly battle **continuity leaks** and **unearned character knowledge**. When screenwriters write scenes, characters often sound like they've read the end of the script: they react with subtle omniscience, hint at twists they shouldn't know, or lack the genuine paranoia of someone acting in the dark.

We asked: **What if you could build a movie on an interactive node graph, scrub a timeline to any exact minute of the story, and interrogate any character live — and they genuinely only know what they would know at that exact moment?**

Ask Marcus at Minute 34 where the vault keys are, and he defends his canvas bag with honest ignorance. Scrub to Minute 52 after the betrayal, and his entire reality shifts. That became the core obsession behind **BlendEye**.

---

## 💡 What It Does
BlendEye is an end-to-end interactive writers' room studio consisting of:

1. **Film Production Slate Hub**: Browse curated benchmark productions (*The Vault Heist*, *Deep Space Airlock*) or launch custom slates with custom premises, genres, and cast rosters.
2. **Interactive Story Canvas (React Flow)**: An intuitive cinematic node graph displaying:
   - **Inspiration Node**: Directing prompt / logline.
   - **Scene Master Node**: Script overview, synopsis, and Hollywood-formatted screenplay reader.
   - **Character Perspective Nodes**: Visual cast roster with live status badges.
   - **Storyboard Visual Node**: 2.39:1 Anamorphic Scope widescreen preview detailing camera lens, atmosphere grading, and lighting cues.
   - **Director's 2D Floor Plan Node**: Interactive stage blocking schematic linked directly to the scene.
3. **The Centerpiece: ClickHouse Time-Gate Engine**:
   - As you drag the **Timeline Scrubber** across the 90-minute runtime, ClickHouse executes real-time queries (`WHERE character = ? AND event_timestamp <= ?`).
   - The **Knowledge State Strip** updates instantly, showing verified **Known Facts** vs. **Critical Firewall Ignorance**.
4. **The Interrogation Chamber (Hot Seat)**:
   - Interrogate any character live using screenplay-style dialogue blocks.
   - Characters are bounded by strict information firewalls. If the interviewer tries to trick them with future facts, they treat it as unverified hearsay or paranoia.
   - **"Insert into Script" Micro-Interaction**: One-click insertion of improvised character dialogue directly into the screenplay draft.
5. **Centralized Showrunner AI**:
   - An omniscient co-writer and script supervisor capable of critiquing dramatic tension, adjusting subtext, suggesting reversals, and citing commercial territory precedents.
6. **Audio Table Read Simulation**:
   - Multi-speaker voice synthesis playback with distinct character pitch, speed controls, audio visualizer, and synchronized line highlighting.
7. **The Director's Deck (Advanced Pre-Production Suite)**:
   - **2D Floor Plan & Spatial Blocking**: Architectural overhead camera blocking (Wide Master, OTS, Intimate Close-up), lens focal lengths, practical lighting, and actor sightline vectors.
   - **Dramatic Tension & Pacing Curve Graph**: 3-act narrative intensity graph plotting scene tension beats and character POV tension against the timeline.
   - **Global Territory Heatmap & Box Office Intelligence**: Precedent distribution analysis queried from ClickHouse `cinematic_precedents` (Heat, Sicario, Alien) with worldwide market projections.
   - **Production Stripboard & Shooting Logistics**: Hollywood shooting schedule strips (INT/EXT/DAY/NIGHT), page counts, cast calls, and budget estimation.
8. **Multiverse Alternate Takes Studio**:
   - 3 diverging takes per scene: *Psychological Slow-Burn (A24)*, *Neo-Noir Confrontation (Mann/Fincher)*, and *Visceral Ticking Clock (Nolan/Villeneuve)* with 1-click apply to production.
9. **Film Fusion / Multiverse Crossover Engine (Layer 4b)**:
   - Reconciles two different screenplays, re-maps conflicting character roles, and merges them into a unified ClickHouse time-gated story timeline.

---

## 🛠️ How We Built It

### Architecture & Tech Stack
- **Frontend**: Next.js 16 (App Router, Turbopack, Tailwind CSS v4, shadcn/ui, `@xyflow/react` React Flow). Custom cinema design system (sprocket edges, film grain, timecode typography, 2.39:1 letterbox frames, slate labels).
- **Backend**: Python 3.12 FastAPI microservice managed with `uv`.
- **AI Models & Framework**:
  - **Gemini 3.7 Flash** via the **Google GenAI / ADK** platform.
  - Used for Master Script Generation, Perspective Sharding, Dynamic Hot-Seat Interrogation Agents, Showrunner Script Doctoring, and Film Fusion Reconciliation.
- **Database Plane**:
  - **ClickHouse**: The primary data plane behind the time-gate mechanic.

---

## ⚡ ClickHouse Partner Track Integration (How ClickHouse Powers the Core)

ClickHouse is not a passive cache or compliance checkbox in this project — **it is the fundamental data structure enabling the product's centerpiece feature**:

### 1. The Story Event Engine (`story_events` Table)
```sql
CREATE TABLE story_events (
    project_id String,
    character_name String,
    event_timestamp String,   -- HH:MM:SS format, lexicographically sortable
    event_type Enum8('known_fact' = 1, 'unaware_of' = 2, 'location' = 3, 'objective' = 4),
    content String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (project_id, character_name, event_timestamp);
```

### 2. The Time-Gate Query Pattern
Every scrub on the timeline executes a sub-millisecond scan:
```sql
SELECT event_type, content
FROM story_events
WHERE project_id = {project_id:String}
  AND character_name = {character_name:String}
  AND event_timestamp <= {at_timestamp:String}
ORDER BY event_timestamp;
```
This isolates the character's memory boundary in real time without executing expensive LLM passes on timeline movement.

### 3. The Grounding Flourish (`cinematic_precedents` Table)
ClickHouse powers real-time commercial telemetry and audience retention benchmarks cited directly by the Showrunner AI:
```sql
SELECT genre, trope, historical_reference, tension_level, commercial_territory, audience_retention_pct, precedent_example
FROM cinematic_precedents
ORDER BY audience_retention_pct DESC;
```

### 4. Real-Time Query Inspector
A live console built directly into the UI shows judges and directors the exact ClickHouse SQL query being executed, latency (typically 1–4ms), and row counts.

## 🧗 Challenges We Ran Into
- **Compounding Visual & Narrative Drift in Video Sequences**: Generative video models like Veo 3.1 excel at 4–8 second single shots, but multi-shot scene sequences quickly degrade in consistency. We solved this by engineering a custom server-side `video_sequencer.py` that extracts the exact final frame of Shot $N$ via OpenCV/PIL and injects it as the conditioning image for Shot $N+1$, while locking each shot's prompt to an immutable, pre-computed continuity bible.
- **Preventing AI Omniscience "Leakage"**: LLMs naturally want to be helpful and predict answers. When an interrogator asks a leading question like *"Did Elena betray you with the keys?"*, unconstrained agents easily hallucinate the twist. By querying ClickHouse for explicit negative knowledge (`event_type = 'unaware_of'`) alongside known facts, we conditioned Gemini to treat future twists as absurd paranoia or unverified hearsay.
- **Upstream MCP Protocol Alignment**: Pairing Google ADK's `McpToolset` with the official `mcp-clickhouse` server required precise dependency harmonization across `mcp` 1.9.x, ensuring stdio sub-processes launch reliably inside containerized and native environments.

---

## 🔬 What We Learned (Findings & Insights)
- **High-Performance Columnar DBs are Built for Story Time**: Many developers treat vector databases as the default for AI memory. We discovered that for narrative timelines, ClickHouse's `MergeTree` ordered by `(project_id, character_name, event_timestamp)` is vastly superior to vector search: it delivers deterministic, sub-millisecond filtering without probabilistic retrieval errors or expensive re-embeddings.
- **Structured Sharding Unlocks Directorial Agency**: When a screenplay is generated, passing the raw script into a sharder agent that decomposes the text into structured temporal knowledge tuples transforms a static screenplay into an interactive, explorable virtual set.
- **Multi-Speaker TTS Changes Writing Dynamics**: Hearing two voices speak formatted dialogue with distinct timbre, cadence, and room acoustics immediately reveals clunky dialogue beats that look fine on a printed page.

---

## 🏆 Accomplishments That We're Proud Of
- **Genuine Knowledge Firewalls**: Achieving genuine character ignorance that feels natural, witty, and loyal to character flaws rather than robotic refusals.
- **The "Scrubbing Revelation" Moment**: Moving the slider from 00:34:00 to 00:52:00 and seeing Marcus go from defending his keys to unmasking Elena's betrayal in the hot seat.
- **Director's Deck Suite**: Full 2D architectural camera blocking, 3-act dramatic tension curves, global box office heatmaps, and Hollywood shooting stripboard.
- **Audio Table Read Simulation**: Multi-character vocal synthesis allowing writers to hear their dialogue spoken with character-specific cadence and subtext.
- **Film Fusion & Multiverse Takes**: Combining separate movie universes and hot-swapping between 3 distinct director takes with a single click.
- **Cinema-First Aesthetic**: Custom filmstrips, sprocket borders, and 2.39:1 anamorphic framing that make the app feel like a real high-end production tool.

---

## 🚀 What's Next for BlendEye
- **Live Duplex Voice Rehearsal**: Integrating Gemini Live WebSockets for real-time vocal table reads and improvised voice interrogation.
- **Unreal Engine 5 Previs Connector**: Exporting 2D floor plans directly into 3D virtual production stages.
- **Native Screenplay Export**: One-click Final Draft (.fdx), Fountain, and production PDF script packet generation.

