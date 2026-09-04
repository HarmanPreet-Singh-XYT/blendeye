# 3-Minute Demo Video Recording Script — Agentic Cinema

> **Target Length:** Exactly 2:50 – 3:00 (English, Public on YouTube/Vimeo)
> **Goal:** Deliver an unforgettable demo highlighting the ClickHouse time-gate centerpiece.

---

## ⏱️ Timeline Breakdown

### 0:00 – 0:30 | The Hook & Problem (Film Slate Hub)
* **Screen**: Open [http://localhost:3000](http://localhost:3000). Show the **Production Slate Hub**.
* **Voiceover**:
  > *"Every screenwriter and director battles the same problem: character omniscience. When you draft a script, characters often sound like they've read the ending. They lack the real blind spots, secrets, and authentic ignorance of a person acting in the dark.*
  >
  > *This is Agentic Cinema — an interactive writers' room where you build a movie on an interactive node graph, scrub a timeline to any minute of the story, and interrogate any character live. They only know what they'd know at that exact minute, backed by a ClickHouse story event engine and Gemini 3.7 Flash."*
* **Action**: Click on **"Enter Writers' Room"** on the *The Vault Heist* slate card.

---

### 0:30 – 1:00 | The Writers' Room & Screenplay Generation
* **Screen**: The app navigates into `/studio/vault-heist-demo`.
* **Voiceover**:
  > *"Here in the Writers' Room, Gemini 3.7 has generated our master screenplay scene. In 'The Vault', our crew has breached a sub-basement bank vault, but Marcus realizes the exit keys are missing.*
  >
  > *Behind the scenes, our Perspective Sharder has analyzed the scene and sharded per-character events into ClickHouse — establishing exactly who witnessed what, who is unaware of what, and who is lying."*
* **Action**:
  - Pan across the React Flow graph: show **Inspiration Node** → **Scene Node** → **Character Nodes** (Marcus, Elena, Teo) → **Storyboard Node** (2.39:1 anamorphic frame).
  - Click the **Screenplay** tab to flash the formatted script lines.

---

### 1:00 – 2:15 | The Centerpiece: ClickHouse Time-Gated Interrogation
* **Screen**: The **Hot Seat** tab with Marcus selected.
* **Voiceover**:
  > *"Now, let's look at the centerpiece. Watch Marcus at story minute 34."*
* **Action**:
  - Show the Timeline Scrubber at **`00:34:00`**.
  - Point to the **Knowledge Firewall Strip**:
    - `✓ Marcus verified he had sub-level bypass keys`
    - `⊘ Critical Firewall: Elena secretly slipped exit keys into exhaust duct`
  - Click suggested question: *"Do you know who has the vault keys?"*
  - **Marcus responds**: *"I've got the sub-level bypass right here in my vest. Safe and sound... Why, is someone saying they're missing?"*
* **Voiceover**:
  > *"He genuinely doesn't know. He defends his bag with honest ignorance.*
  > *Now watch what happens when we scrub forward in time."*
* **Action**:
  - Drag the Timeline Scrubber to **`00:52:00`** (The Betrayal).
  - Notice the Knowledge Strip update instantly.
  - Ask the exact same question again: *"Do you know who has the vault keys?"*
  - **Marcus responds**: *"I had the keys right here in my vest. But Elena's on the other side of that blast door refusing to turn the release. She set this whole thing up!"*
* **Voiceover**:
  > *"His entire reality shifted because ClickHouse re-queried story events where timestamp is less than or equal to 52 minutes."*
* **Action**:
  - Expand the **ClickHouse Query Inspector** at the bottom of the screen.
  - Show the live SQL query: `SELECT event_type, content FROM story_events WHERE timestamp <= '00:52:00'` executing in **2ms**.

---

### 2:15 – 2:45 | Showrunner AI & Multiverse Film Fusion
* **Screen**: Switch to the **Showrunner AI** tab, then click **Film Fusion**.
* **Voiceover**:
  > *"We also built an omniscient Showrunner AI co-pilot. When we ask for dramatic critique, it doesn't just guess — it queries ClickHouse for real cinematic precedents and audience retention metrics.*
  >
  > *And with our Layer 4b Film Fusion engine, you can take two completely different stories — like our heist movie and a deep-space airlock thriller — and Gemini plus ClickHouse will reconcile their timelines, remap character roles, and generate a unified crossover."*
* **Action**:
  - Click **Film Fusion** in the top bar.
  - Show the reconciled crossover modal (*"Dead Orbit Vault"* with Marcus, Elena, Vance, and Ray).

---

### 2:45 – 3:00 | Conclusion & Architecture Wrap-up
* **Screen**: Return to the Story Canvas overview.
* **Voiceover**:
  > *"Built with Google Cloud's Gemini 3.7 Flash via ADK, Next.js, and ClickHouse as the ultra-fast story event data plane.*
  > *Agentic Cinema gives filmmakers the power to test story continuity and interrogate characters with genuine, time-gated authenticity.*
  > *Thank you!"*
