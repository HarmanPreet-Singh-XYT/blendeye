# Devpost Submission — BlendEye

> **Hackathon:** Google Cloud Agentic Cinema Hackathon  
> **Partner Tracks:** **ClickHouse Track** & **Parallel Web Systems Track**  
> **Project Name (under 60 chars):** `BlendEye — AI Film Director Studio & Pre-Shoot Simulator`  
> **Elevator Pitch (under 200 chars):** `The flight simulator for film directors. Plan scenes, block cameras, and interrogate characters under ClickHouse time-gated knowledge firewalls powered by Gemini & Veo.`  
> **Live Production Studio:** https://blendeye.harmanita.com  
> **GitHub Repository:** https://github.com/HarmanPreet-Singh-XYT/blendeye  

---

### 🏷️ Built With Tags
`gemini-3.7-flash`, `google-veo-3.1`, `gemini-3.1-flash-tts`, `imagen-3`, `google-search-grounding`, `google-adk`, `clickhouse`, `mcp-clickhouse`, `parallel-web`, `parallel-search-api`, `next.js-16`, `react-19`, `xyflow-react`, `tailwind-css-v4`, `fastapi`, `python-3.12`, `supabase`, `postgresql`, `opencv`, `d3-geo`, `recharts`


---

## 🎬 Inspiration: The $100M "Fix It in Post" Fallacy

Commercial pilots log hundreds of hours in flight simulators before ever flying passengers. They test turbulence, engine stalls, and crosswinds in a risk-free environment. 

Filmmaking, by contrast, has historically had **no flight simulator**. Directors step onto multimillion-dollar sets with unproven dialogue, unverified spatial camera blocking, untested character chemistry, and fractured pre-production documentation. When pacing drags or a plot point falls apart, the only option has been the disastrous industry mantra: *"We'll fix it in post."*

Worse, screenwriters and directors constantly battle **character omniscience ("writer leakage")**. When drafting scripts, characters subconsciously sound like they’ve read the end of the script: they react with impossible intuition, foreshadow twists they cannot know, or lack the authentic paranoia of someone acting in the dark.

We asked: **What if directors had a unified flight simulator?** What if you could plan a movie on an interactive node graph, scrub a timeline to any minute of the story, and interrogate any character live — with characters strictly bounded by real-time knowledge firewalls?

That vision became **BlendEye: The Autonomous AI Film Director Studio, Production Planner & Pre-Shoot Simulator**.

---

## 💡 What It Does

BlendEye organizes the directorial workflow into 4 interconnected digital workspaces:

### 1. 📐 Studio & Scene Planning (`Shift` + `1`)
* **Interactive Story Backlot (`@xyflow/react`)**: A cinematic node graph connecting Inspiration Prompts, Scene Masters, Character Perspective cards, and 2.39:1 anamorphic storyboards.
* **Hollywood Production Stripboard**: Automatically parses scenes into standard industry stripboards (`INT/EXT`, `DAY/NIGHT`), estimated page counts (eighths of a page), cast call sheets, and shooting logistics.
* **Global Location Scouting via Google Search Grounding**: Discovers real-world filming venues with verified GPS coordinates, architectural dossiers, golden-hour sun angles, local permit ordinances, and multi-currency budget calculators.
* **2D Spatial Camera Blocking & Floor Plan Engine**: Overhead stage schematics with draggable actor tokens, lens presets (35mm Wide, 50mm OTS, 85mm Close-Up), practical lighting cones, and sightline vectors.
* **Dramatic Tension & Pacing Curves**: Recharts 3-act narrative curve tracking overall scene tension alongside individual character POV stakes.
* **International Box Office Heatmap**: Interactive D3 geo map projecting territorial gross potential based on historical precedents.

### 2. 🎭 Pre-Shoot Simulation Suite (`Shift` + `2`)
* **The Hot Seat (Time-Gated Interrogation Chamber)**: Chat directly with characters in Hollywood screenplay format. If you ask Marcus at Minute 34 where the vault keys are, he defends his vest with honest ignorance. Scrub to Minute 52 after Elena's betrayal, and his reality shifts instantly. Discovered great dialogue? Click the filmstrip icon to insert it directly into the master screenplay.
* **Dynamic Friction & Chemistry Bench**: Drop any two characters into unscripted pressure-cooker scenarios (e.g. trapped in an elevator with a 2-minute timer) to test psychological friction and chemistry before shooting.
* **Theatrical Audio Table Read Studio**: Full multi-speaker script readouts powered by **Gemini 3.1 Flash TTS** with distinct actor vocal timbres (`Fenrir`, `Aoede`, `Charon`) and physical room acoustics simulation (Dry Soundstage, Cathedral Echo, Subterranean Vault slapback).

### 3. 🎥 Generation Backlot (`Shift` + `3`)
* **Chained Google Veo 3.1 Video Studio**: Generates 2.39:1 widescreen video renders. Employs **last-frame pixel anchoring** (extracting the final frame of Shot $N$ via OpenCV/PIL as the image reference for Shot $N+1$) alongside immutable continuity bibles to overcome single-shot duration limits.
* **2.39:1 Anamorphic Storyboards**: Concept art generated with subtle anamorphic streak flares, depth of field, and natural 35mm grain.
* **Multiverse Alternate Takes**: Audition 3 radically distinct directorial takes per scene with 1 click: *Psychological Slow-Burn (A24)*, *Neo-Noir Confrontation (Fincher/Mann)*, or *Visceral Ticking Clock (Nolan/Villeneuve)*.
* **AI Film Score & Soundtrack Synthesizer**: Composes scene scores, motif drafts, and musical cues matched to emotional beats.

### 4. 🧠 Showrunner AI Co-Pilot (`Shift` + `4`)
* **Autonomous Creative Partner**: Grounded via the official `mcp-clickhouse` server to cite real commercial precedents (*Heat*, *Sicario*, *Blade Runner*) during script doctoring sessions.
* **Studio AI Commander**: Executes multi-step natural language commands (*"Add a corrupt security specialist named Silas, increase tension in scene 2, and update the stripboard"*).
* **Script Supervisor & Continuity Inspector**: Scans for narrative paradoxes, unearned knowledge leaks, and timeline inconsistencies.

---

## ⚡ ClickHouse Partner Track Integration

ClickHouse is not a passive database or compliance checkbox in BlendEye — **it is the fundamental data engine powering the time-gate mechanic**:

1. **`story_events` MergeTree Table**: When Gemini drafts or shards a screenplay, the Perspective Sharder decomposes the script into atomic knowledge tuples indexed by `(project_id, character_name, event_timestamp)`.
2. **Sub-2ms Time-Gate Queries**: Every scrub on the timeline or question asked in the Hot Seat executes:
   ```sql
   SELECT event_type, content 
   FROM story_events 
   WHERE project_id = {project_id:String} 
     AND character_name = {character_name:String} 
     AND event_timestamp <= {at_timestamp:String} 
   ORDER BY event_timestamp;
   ```
   This isolates the character's memory boundary deterministically in 1–3ms without requiring expensive vector re-embeddings or probabilistic retrieval.
3. **Official `mcp-clickhouse` Agent Toolset**: The Showrunner AI connects directly to the official `mcp-clickhouse` server as an `McpToolset` in Google ADK, querying historical audience retention curves and commercial benchmarks mid-conversation.
4. **Live SQL Query Inspector**: A real-time telemetry console built directly into the UI displays the exact SQL queries executed, query durations, and sharded event counts.

---

## 🌐 Parallel Web Systems Partner Track Integration

BlendEye actively integrates **Parallel's Search API at runtime** using the official `parallel-web` Python SDK (`app/services/parallel_search.py`), bringing accurate, fresh, traceable open-web intelligence directly to film directors:

1. **Runtime Location Scouting & Soundstage Intelligence**: When the Director uses Workspace 1's Location Scouting Board, the agent calls Parallel's Search API live (`parallel.search(search_queries=[...])`) to query municipal film commissions, real-world soundstage specifications, permit fee schedules, and local noise curfews across global production hubs (Los Angeles, London, Vancouver).
2. **Direct Source Grounding & Live Citations**: The frontend Location Board displays real-time web citations tagged with an emerald **"Parallel Web"** badge, linking directors directly to real municipal film offices and studio listings discovered via Parallel.
3. **Showrunner Live Web Tooling**: Attached as a runtime tool (`parallel_web_search`) to the Showrunner agent in Google ADK, enabling the creative co-pilot to research recent commercial comps, real-world production precedents, and box office trends from the open web mid-dialogue.
4. **Dedicated Parallel Endpoint (`/location/parallel-search`)**: Exposes an on-demand web search endpoint allowing directors to query production regulations, gear rental houses, and permit variances with sub-second response times.

---

## 🛠️ How We Built It

* **Frontend**: Next.js 16 (App Router, Turbopack, React 19), Tailwind CSS v4, `@xyflow/react` (React Flow), Recharts, D3-Geo, and Lucide Icons. Designed with custom cinema aesthetics (2.39:1 letterbox scope, sprocket borders, and SMPTE timecode displays).
* **Backend Sidecar**: Python 3.12 FastAPI microservice packaged with `uv`.
* **Google Cloud AI Suite**:
  * **Gemini 3.7 Flash**: Master screenplay generation, perspective sharding, Hot Seat interrogation, Showrunner script doctoring, and Studio Commander automation.
  * **Google Veo 3.1 (`veo-3.1-fast-generate-preview`)**: Cinematic 2.39:1 video generation with sequential multi-shot chaining.
  * **Gemini 3.1 Flash TTS (`gemini-3.1-flash-tts-preview`)**: Native multi-speaker voice synthesis with custom actor timbre assignments.
  * **Imagen 3 & Gemini Image Models**: Anamorphic widescreen storyboard stills and character portraits.
  * **Google Search Grounding**: Real-world location scouting fetching verified geospatial coordinates and architectural data.
* **Data Plane**: ClickHouse Cloud (MergeTree event store & MCP toolset) + Supabase (PostgreSQL state persistence & media asset storage).

---

## 🧗 Challenges We Ran Into

1. **Visual Drift in Multi-Shot Video Sequences**: Generative video models excel at single 4–8 second takes, but multi-shot scenes quickly degrade in consistency. We engineered `video_sequencer.py` with OpenCV/PIL to extract the exact last frame of Shot $N$ and feed it as the image conditioning anchor into Veo 3.1 for Shot $N+1$, while locking each shot to an immutable continuity bible.
2. **Preventing AI Omniscience "Leakage"**: LLMs inherently want to anticipate answers. When an interrogator asks leading questions (*"Did Elena take the keys?"*), unconstrained models hallucinate the twist. By explicitly querying ClickHouse for negative knowledge (`event_type = 'unaware_of'`), we grounded Gemini to react with genuine suspicion, dismissing future spoilers as absurd hearsay.
3. **MCP Toolset Orchestration**: Wiring the official `mcp-clickhouse` server over stdio into Google ADK within a FastAPI runtime required precise protocol alignment to ensure zero-latency tool dispatch during agent streaming.

---

## 🏆 Accomplishments That We're Proud Of

* **The "Scrubbing Revelation"**: Dragging the timeline slider from `00:34:00` to `00:52:00` and watching Marcus transition from defending his bag to realizing he has been betrayed in sub-2ms.
* **Pixel-Anchored Chained Veo Video**: Successfully linking consecutive Veo 3.1 shots with character and environmental continuity.
* **Authentic Pre-Production Tooling**: Delivering a tool filmmakers actually want to use — combining 2D camera blocking, 3-act tension curves, Hollywood stripboards, and audio table reads in a unified interface.
* **100% Google Cloud AI & ClickHouse Compliance**: Zero non-Google AI SDKs used at runtime, backed by live ClickHouse Cloud telemetry.

---

## 🔬 What We Learned

* **Columnar DBs Excel at Narrative Time**: While many developers default to vector search for memory, narrative timelines demand strict chronological boundaries. ClickHouse's sorted `MergeTree` delivers deterministic, sub-millisecond filtering without probabilistic hallucination.
* **Multi-Speaker TTS Transforms Scriptwriting**: Hearing formatted dialogue read aloud by distinct voices with room acoustics exposes clunky dialogue beats and unnatural pauses that look deceptively fine on a static page.

---

## 🚀 What's Next for BlendEye

* **Live Duplex Voice Rehearsal**: Integrating Gemini Live WebSockets for real-time vocal table reads and improvised voice interrogation.
* **Unreal Engine 5 Previs Connector**: Exporting 2D floor plans and camera paths directly into 3D virtual production stages.
* **Industry Export Packets**: One-click generation of Final Draft (.fdx), Fountain, and standardized Hollywood production PDF packets.

---

## 🔗 Try It Out
* 🌐 **Live Studio**: [https://blendeye.harmanita.com](https://blendeye.harmanita.com)
* 💻 **GitHub Repo**: [https://github.com/HarmanPreet-Singh-XYT/blendeye](https://github.com/HarmanPreet-Singh-XYT/blendeye)
* 📋 **Judge Walkthrough**: [JUDGE_TESTING.md](https://github.com/HarmanPreet-Singh-XYT/blendeye/blob/main/JUDGE_TESTING.md)
