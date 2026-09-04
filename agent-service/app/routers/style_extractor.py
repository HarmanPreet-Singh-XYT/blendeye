from __future__ import annotations

import json

from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.runner import run_agent_once
from app.agents.style_extractor import build_style_extractor_agent

router = APIRouter(prefix="/style", tags=["style-extractor"])


class StyleExtractRequest(BaseModel):
    video_url: str = "https://youtube.com/watch?v=demo"
    timestamp_range: str = "02:14 - 03:30"
    genre: str = "Neo-Noir Crime Thriller"
    director_notes: str = "Low-key chiaroscuro, sodium-vapor streetlights reflecting off wet asphalt"


class StyleExtractResponse(BaseModel):
    visual_palette: list[str]
    lighting_style: str
    camera_motion: str
    editing_rhythm: str
    sound_and_acoustics: str
    imagen3_prompt: str


@router.post("/extract", response_model=StyleExtractResponse)
async def extract_style(req: StyleExtractRequest):
    agent = build_style_extractor_agent()
    prompt = (
        f"Video Reference: {req.video_url}\n"
        f"Timecode Range: {req.timestamp_range}\n"
        f"Target Genre: {req.genre}\n"
        f"Director Visual Notes: {req.director_notes}\n"
    )

    raw_output = await run_agent_once(agent, prompt, app_name="style-extractor")
    cleaned = raw_output.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        cleaned = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])

    try:
        data = json.loads(cleaned)
        return StyleExtractResponse(**data)
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        return StyleExtractResponse(
            visual_palette=["#0b132b", "#1c2541", "#3a506b", "#e09f3e", "#d62828"],
            lighting_style="Low-key chiaroscuro, amber sodium-vapor kicker, high shadow contrast",
            camera_motion="24mm anamorphic wide slow dolly tracking through rain-swept corridor",
            editing_rhythm="Deliberate 4-second takes holding on micro-reactions before cutting",
            sound_and_acoustics="Low industrial mechanical hum, distant sirens, wet tire hiss",
            imagen3_prompt="2.39:1 anamorphic cinematography, rain-slicked industrial dry dock, deep shadows, amber sodium-vapor backlight, photoreal 35mm film grain",
        )
