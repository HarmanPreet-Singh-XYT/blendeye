import re

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents.runner import run_agent_once
from app.agents.sequence_generator import (
    SequenceCharacter,
    SequenceGenerationResult,
    SequenceScene,
    build_sequence_generator_agent,
)

router = APIRouter(prefix="/sequence", tags=["sequence"])


def _clean_json_str(raw: str) -> str:
    """Strips markdown code fences if present, matching sharding.py's parser."""
    text = raw.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


class GenerateSequenceRequest(BaseModel):
    title: str = "Untitled Project"
    logline: str = ""
    genre: str = "Drama / Thriller"
    director_style: str = "Cinematic realism, high-tension staging"
    core_secret: str = ""
    primary_location: str = "Metropolitan staging ground"
    target_runtime_minutes: int = 95
    narrative_format: str = "feature"
    characters: list[dict] = Field(default_factory=list, description="Pre-authored characters, if any, e.g. [{name, role, archetype}]")


class GenerateSequenceResponse(BaseModel):
    title: str
    logline: str
    genre: str
    characters: list[SequenceCharacter]
    scenes: list[SequenceScene]


def _build_prompt(body: GenerateSequenceRequest) -> str:
    if body.characters:
        char_lines = "\n".join(
            f"- {c.get('name', 'Unnamed')} ({c.get('role') or c.get('archetype') or 'Character'})"
            for c in body.characters
        )
    else:
        char_lines = "Synthesize 2-3 compelling lead characters appropriate for this premise."

    return f"""
DIRECTOR'S PRODUCTION SPECIFICATION:
Title: "{body.title}"
Logline / Premise: "{body.logline}"
Genre: {body.genre}
Target Runtime: {body.target_runtime_minutes} minutes ({body.narrative_format})
Director Tone & Style: Style of {body.director_style}
Core Dramatic Secret / Asymmetric Knowledge: {body.core_secret or "Critical secret is withheld until the midpoint"}
Primary Setting / World: {body.primary_location}
Cast:
{char_lines}
"""


@router.post("/generate", response_model=GenerateSequenceResponse)
async def generate_sequence(body: GenerateSequenceRequest) -> GenerateSequenceResponse:
    agent = build_sequence_generator_agent()
    raw = await run_agent_once(agent, _build_prompt(body), app_name="sequence-generator")
    cleaned = _clean_json_str(raw)
    parsed = SequenceGenerationResult.model_validate_json(cleaned)

    return GenerateSequenceResponse(
        title=parsed.title or body.title,
        logline=parsed.logline or body.logline,
        genre=parsed.genre or body.genre,
        characters=parsed.characters,
        scenes=parsed.scenes,
    )
