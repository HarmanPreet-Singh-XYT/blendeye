# Devpost Submission — Agentic Cinema

> **Google Cloud Agentic Cinema Hackathon** — ClickHouse Partner Track
> **Project Name:** Agentic Cinema
> **Tagline:** The Writers' Room That Knows What Your Characters Know.

---

## 🎬 Inspiration
In traditional filmmaking and television writers' rooms, writers constantly battle **continuity leaks** and **unearned character knowledge**. When screenwriters write scenes, characters often sound like they've read the end of the script: they react with subtle omniscience, hint at twists they shouldn't know, or lack the genuine paranoia of someone acting in the dark.

We asked: **What if you could build a movie on an interactive node graph, scrub a timeline to any exact minute of the story, and interrogate any character live — and they genuinely only know what they would know at that exact moment?**

Ask Marcus at Minute 34 where the vault keys are, and he defends his canvas bag with honest ignorance. Scrub to Minute 52 after the betrayal, and his entire reality shifts. That became the core obsession behind **Agentic Cinema**.

---

## 💡 What It Does
Agentic Cinema is an end-to-end interactive writers' room studio consisting of:

1. **Film Production Slate Hub**: Browse curated benchmark productions (*The Vault Heist*, *Deep Space Airlock*) or launch custom slates with custom premises, genres, and cast rosters.
2. **Interactive Story Canvas (React Flow)**: An intuitive cinematic node graph displaying:
   - **Inspiration Node**: Directing prompt / logline.
   - **Scene Master Node**: Script overview, synopsis, and Hollywood-formatted screenplay reader.
   - **Character Perspective Nodes**: Visual cast roster with live status badges.
   - **Storyboard Visual Node**: 2.39:1 Anamorphic Scope widescreen preview detailing camera lens, atmosphere grading, and lighting cues.
3. **The Centerpiece: ClickHouse Time-Gate Engine**:
   - As you drag the **Timeline Scrubber** across the 90-minute runtime, ClickHouse executes real-time queries (`WHERE character = ? AND event_timestamp <= ?`).
   - The **Knowledge State Strip** updates instantly, showing verified **Known Facts** vs. **Critical Firewall Ignorance**.
4. **The Interrogation Chamber (Hot Seat)**:
   - Interrogate any character live using screenplay-style dialogue blocks.
   - Characters are bounded by strict information firewalls. If the interviewer tries to trick them with future facts, they treat it as unverified hearsay or paranoia.
5. **Centralized Showrunner AI**:
   - An omniscient co-writer and script supervisor capable of critiquing dramatic tension, adjusting subtext, suggesting reversals, and citing commercial territory precedents.
6. **Film Fusion / Multiverse Crossover Engine (Layer 4b)**:
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

---

## 🏆 Accomplishments That We're Proud Of
- **Genuine Knowledge Firewalls**: Achieving genuine character ignorance that feels natural, witty, and loyal to character flaws rather than robotic refusals.
- **The "Scrubbing Revelation" Moment**: Moving the slider from 00:34:00 to 00:52:00 and seeing Marcus go from defending his keys to unmasking Elena's betrayal in the hot seat.
- **Film Fusion Crossover Engine**: Taking two separate films and having Gemini and ClickHouse automatically reconcile their conflicting timelines into a unified story graph.
- **Cinema-First Aesthetic**: Custom filmstrips, sprocket borders, and 2.39:1 anamorphic framing that make the app feel like a real high-end production tool.

---

## 🚀 What's Next for Agentic Cinema
- **Live Bidirectional Voice Rehearsal**: Integrating Gemini Live WebSockets for spoken dialogue practice with time-gated characters.
- **Director's Floor Plan / 3D Blocking**: Auto-deriving character spatial coordinates from ClickHouse location events into interactive stage floor plans.
- **Full Feature Screenplay Export**: One-click Final Draft (.fdx) and PDF production export.
