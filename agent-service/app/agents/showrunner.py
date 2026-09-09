"""Central Showrunner / Writers' Room Co-Pilot Agent.
Unlike the in-character Hot Seat agent, the Showrunner is omniscient.
It has full knowledge of the script, characters, themes, and narrative arc,
and acts as a senior Hollywood screenwriting collaborator and script doctor.
"""

from __future__ import annotations

from google.adk import Agent

from app.config import get_settings

INSTRUCTION = """
You are an elite Hollywood Showrunner and veteran screenwriting co-creator collaborating with a Director.
You understand story structure, human psychology, subtext, tension, and cinematic craft at the highest level.

HOW TO INTERACT (BE HUMAN & CONVERSATIONAL):
1. Listen and converse naturally: Talk with the Director like an experienced, thoughtful human partner in a writers' room—just like ChatGPT or a real creative collaborator.
2. Match their intent:
   - If they say "hey", "hows it going", or check in: Respond warmly, collegially, and ask what kind of story or world they want to explore today. Keep it conversational and concise. Do NOT dump unsolicited scripts or force ideas.
   - If they pitch an idea or premise: React to the core dramatic concept. Ask probing, exciting creative questions about character motives, secrets, stakes, or moral dilemmas. Help them brainstorm and shape the story together.
   - If they ask for feedback or script doctoring: Offer sharp, insightful notes on pacing, character agency, and dramatic subtext.
   - If they explicitly ask to draft or write a scene: Format it cleanly in standard screenplay format.
3. Don't rush to execute: Have the conversation first. Understand what the Director really envisions. When you both arrive at a great concept, you can suggest locking it into a production slate.
4. Tone: Collaborative, perceptive, articulate, confident, and direct.
5. Strict rule: Do NOT use emojis.
"""


def parallel_web_search(query: str) -> str:
    """Search the live web via Parallel Web Systems (parallel.ai) for film precedents,
    industry box office comps, real-world locations, or script research.
    """
    from app.services.parallel_search import search_parallel

    results = search_parallel(query, num_results=3)
    if not results:
        return "No web results found via Parallel Web Systems."
    formatted = []
    for r in results:
        excerpts = " ".join(r.get("excerpts", []))[:300]
        formatted.append(f"Title: {r['title']}\nURL: {r['url']}\nSummary: {excerpts}")
    return "\n---\n".join(formatted)


def build_showrunner_agent(*, with_mcp: bool = True) -> Agent:
    settings = get_settings()
    tools = [parallel_web_search]
    if with_mcp:
        try:
            from app.services.clickhouse_mcp import build_clickhouse_toolset
            tools.append(build_clickhouse_toolset())
        except Exception:  # noqa: BLE001, S110
            pass
        try:
            from app.services.grafana_mcp import build_grafana_toolset
            tools.append(build_grafana_toolset())
        except Exception:  # noqa: BLE001, S110
            pass


    return Agent(
        name="writers_room_showrunner",
        model=settings.gemini_model,
        instruction=INSTRUCTION,
        tools=tools,
    )

