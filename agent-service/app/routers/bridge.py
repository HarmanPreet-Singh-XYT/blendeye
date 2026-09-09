import re

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents.bridge_scene_generator import BridgeSceneResult, build_bridge_scene_agent
from app.agents.runner import run_agent_once

router = APIRouter(prefix="/bridge", tags=["bridge"])


def _clean_json_str(raw: str) -> str:
    text = raw.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


class SceneRef(BaseModel):
    title: str
    slugline: str
    summary: str
    screenplay_text: str = ""
    cast_present: list[str] = Field(default_factory=list)


class GenerateBridgeRequest(BaseModel):
    premise: str = ""
    prev_scene: SceneRef
    next_scene: SceneRef
    characters: list[dict] = Field(default_factory=list)
    user_prompt: str = ""
    target_duration_seconds: int = 0


def _build_prompt(body: GenerateBridgeRequest) -> str:
    cast_names = ", ".join(c.get("name", "") for c in body.characters if c.get("name")) or "Core Crew"
    duration = body.target_duration_seconds if body.target_duration_seconds > 0 else 180

    guidance = ""
    if body.user_prompt.strip():
        guidance = (
            f"\nDIRECTOR'S SPECIFIC GUIDANCE / PROMPT:\n\"{body.user_prompt.strip()}\"\n"
            "CRITICAL: You must realize and reflect the director's specific creative "
            "direction above while bridging the scenes.\n"
        )

    return f"""
PREVIOUS SCENE:
Title: {body.prev_scene.title}
Slugline: {body.prev_scene.slugline}
Summary: {body.prev_scene.summary}

NEXT SCENE:
Title: {body.next_scene.title}
Slugline: {body.next_scene.slugline}
Summary: {body.next_scene.summary}

OVERALL FILM PREMISE:
{body.premise}

AVAILABLE CAST:
{cast_names}
{guidance}
Target duration for the bridge scene: {duration} seconds.
"""


@router.post("/generate", response_model=BridgeSceneResult)
async def generate_bridge(body: GenerateBridgeRequest) -> BridgeSceneResult:
    agent = build_bridge_scene_agent()
    raw = await run_agent_once(agent, _build_prompt(body), app_name="bridge-scene-generator")
    cleaned = _clean_json_str(raw)
    return BridgeSceneResult.model_validate_json(cleaned)
