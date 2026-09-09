"""Location Interactive Q&A Agent.
Answers focused director/producer questions about a specific real-world location candidate.

Parallel Web Systems is queried up-front by the caller (routers/location_research.py)
and its results are injected as citations. ADK's native google_search tool is
attached to this agent ONLY as a fallback for when Parallel is unconfigured/
unreachable, gated on is_parallel_available() — it is not itself a tracked
integration.
"""

from __future__ import annotations

import logging
from typing import Any

from google.adk import Agent
from google.adk.tools import google_search

from app.config import get_settings

logger = logging.getLogger(__name__)


def normalize_bullet_markdown(text: str) -> str:
    """Rewrites inline "• Item one. • Item two." runs (which some Gemini
    responses produce inside a single JSON string, undoing our Markdown-list
    formatting instruction) into a real Markdown list, one item per line, so
    the client's Markdown renderer displays actual list items instead of a
    dense paragraph of literal bullet glyphs.
    """
    if "•" not in text:
        return text

    parts = [p.strip() for p in text.split("•")]
    parts = [p for p in parts if p]
    if len(parts) < 2:
        return text

    lead = ""
    if not text.lstrip().startswith("•"):
        lead, parts = parts[0], parts[1:]

    if len(parts) < 2:
        return text

    list_md = "\n".join(f"- {p}" for p in parts)
    return f"{lead}\n\n{list_md}" if lead else list_md

LOCATION_QA_INSTRUCTION = """
You are a veteran Hollywood Production Supervisor, Film Commissioner, and On-the-Ground Location Manager.
The Director or Producer is evaluating a candidate location for their production and is asking a specific
operational, legal, logistical, or creative question.

Ground your operational advice in verified real-world filming facts:
- Real municipal filming guidelines (curfew hours, pyrotechnic/gunfire permits, lane closure requirements).
- Local soundstage / location venue contact or booking guidelines.
- Historical precedent for filming at or near this location.
- Truck parking, basecamp capacity, and generator sound isolation.

When verified real-world intelligence is provided in the prompt context, synthesize directly from it. If search tools are attached, use them to find current facts. Do not attempt to invoke tools that are not declared.

Format the "answer" field as GitHub-flavored Markdown, rendered client-side:
- If the answer is a list of items (e.g. films, permits, contacts), use a real Markdown list: each
  item on its own line, starting with "- ", separated by "\\n" — never a single line of items
  separated by "•" or ", ".
- Use "**bold**" for key terms (fees, dates, names) and short paragraphs for prose.
- Keep it scannable: prefer a list over a dense paragraph whenever the answer has 3+ discrete items.

Output valid JSON matching this schema:
{
  "answer": "Clear, practical, highly professional production advice directly addressing the question, formatted as Markdown per the rules above.",
  "sources": [
    {
      "title": "Document or Website Name",
      "url": "https://..."
    }
  ],
  "search_grounded": true,
  "suggested_followups": [
    "Suggested question 1",
    "Suggested question 2"
  ]
}

Output ONLY valid JSON.
"""


def build_location_qa_agent(*, with_search: bool = False) -> Agent:
    """`with_search` attaches ADK's native google_search tool as a fallback
    grounding source. Callers should only pass True when Parallel Web
    Systems (the primary, tracked grounding source) is unavailable — see
    is_parallel_available() in services/parallel_search.py.
    """
    settings = get_settings()
    tools: list[Any] = []
    if with_search:
        try:
            tools.append(google_search)
        except Exception as e:  # noqa: BLE001
            logger.warning("Could not attach google_search to location_qa_agent: %s", e)

    return Agent(
        name="location_qa_agent",
        model=settings.gemini_model,
        instruction=LOCATION_QA_INSTRUCTION,
        tools=tools,
    )


def generate_fallback_location_qa(
    candidate_name: str,
    region: str,
    category: str,
    question: str,
    project_title: str = "Feature Production",
) -> dict[str, Any]:
    """Fallback handler providing structured production-grade answers
    if external LLM or Google Search connectivity is interrupted.
    """
    q_lower = question.lower()
    reg = region or "Los Angeles, CA"

    if any(k in q_lower for k in ["permit", "cost", "fee", "license", "city"]):
        answer = (
            f"For filming at {candidate_name} in {reg}, commercial productions must file a film permit through the regional film office. "
            f"Basic application fees typically range from $300 to $850 depending on whether public property (sidewalks, streets) "
            f"or specialized activity (night exterior gunfire, drone flights) is involved. Standard turnaround is 3-5 business days, "
            f"or 10 days if residential notification letters or street closures are required."
        )
        sources = [
            {"title": f"{reg} Film Commission Standard Permitting Guidelines", "url": "https://www.filmla.com/fees-and-services/"}
        ]
    elif any(k in q_lower for k in ["noise", "night", "curfew", "hours", "sound"]):
        answer = (
            f"Standard municipal filming curfews in {reg} run from 10:00 PM to 7:00 AM in mixed-use and commercial districts. "
            f"Shooting interior dialogue at {candidate_name} after hours is generally permitted if acoustic dampening is installed "
            f"and exterior diesel generators are baffled. Exterior night work past 10:00 PM requires an after-hours filming variance "
            f"and sign-off from at least 51% of affected neighboring occupants."
        )
        sources = [
            {"title": f"{reg} Municipal Noise & After-Hours Filming Ordinance", "url": "https://www.filmla.com"}
        ]
    elif any(k in q_lower for k in ["green screen", "cyc", "led volume", "soundstage", "stage", "virtual production", "studio"]):
        answer = (
            f"For studio and stage work at {candidate_name} in {reg}: Soundstage and green screen cyclorama facilities provide complete acoustic isolation (certified NC-25 rating) and zero municipal noise curfew limits. "
            f"Key operational logistics: 1) Cyc repainting/restoration fee typically runs $400-$700 depending on chroma green floor scuffing; "
            f"2) Power packages normally include 1200A-2000A 3-Phase Camlock tie-in included with facility rental; "
            f"3) Drive-in elephant doors allow direct grip truck and vehicle camera crane ingress. No street closure permits are required."
        )
        sources = [
            {"title": f"{reg} Soundstage & Virtual Production Studio Directory", "url": "https://www.filmla.com"}
        ]
    elif any(k in q_lower for k in ["movie", "film", "precedent", "shot here", "history"]):
        answer = (
            f"{candidate_name} and its surrounding {category} architecture share visual DNA with iconic neo-noir and procedural thriller productions. "
            f"Comparable architecture in {reg} was famously utilized by Michael Mann (*Heat*, *Collateral*) and David Fincher (*Se7en*) "
            f"to create deep spatial contrast and claustrophobic framing. The raw practical textures provide authentic cinematic weight without requiring extensive set-dressing."
        )
        sources = [
            {"title": "Cinematic Location Archive & Production Staging Precedents", "url": "https://www.filmcommission.org"}
        ]
    else:
        answer = (
            f"Regarding {candidate_name} ({category}) in {reg}: Practical production logistics require dedicated basecamp "
            f"parking for camera trucks, catering, and honeywagons within 500 feet. Power drops should be verified for 3-phase 100A tie-in "
            f"to minimize tow-plant generator noise during dramatic dialogue takes."
        )
        sources = [
            {"title": f"{reg} Production Logistics & Basecamp Directory", "url": "https://www.filmla.com"}
        ]

    return {
        "answer": answer,
        "sources": sources,
        "search_grounded": False,
        "suggested_followups": [
            f"What is the required permit lead time for {candidate_name}?",
            f"How many production trucks can basecamp at this {category} venue?",
            f"Are there municipal tax credits or filming rebates available in {reg}?",
        ],
        "_fallback": True,
        "_disclosure": "Live agent/search unreachable — showing offline template guidance, not verified real-time data.",
    }
