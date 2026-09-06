from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents.runner import run_agent_once
from app.agents.shotlist_generator import build_shotlist_agent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/shotlist", tags=["shotlist"])


class ShotItem(BaseModel):
    shot_number: int
    shot_type: str
    lens: str
    angle: str
    camera_movement: str
    blocking_notes: str
    lighting_setup: str
    dramatic_intent: str
    imagen_prompt: str
    estimated_duration_sec: int = 6


class ShotlistRequest(BaseModel):
    scene_text: str
    scene_title: str = "INT. REINFORCED CHAMBER - NIGHT"
    director_style: str = "David Fincher / Neo-Noir Precision"
    characters: list[str] = Field(default_factory=list)


class ShotlistResponse(BaseModel):
    scene_title: str
    director_style: str
    visual_rhythm: str
    aspect_ratio: str
    color_temperature: str
    shots: list[ShotItem]


@router.post("/generate", response_model=ShotlistResponse)
async def generate_shotlist(req: ShotlistRequest) -> ShotlistResponse:
    char_str = ", ".join(req.characters) if req.characters else "Marcus, Elena"
    prompt = (
        f"SCENE TITLE: {req.scene_title}\n"
        f"DIRECTOR STYLE: {req.director_style}\n"
        f"CHARACTERS PRESENT: {char_str}\n\n"
        f"SCREENPLAY TEXT:\n\n{req.scene_text}\n\n"
        f"Generate a cinematic sequence of 4-6 camera shots with blocking notes, lens specs, and Imagen 3 prompts."
    )

    agent = build_shotlist_agent()
    raw_output = await run_agent_once(agent, prompt, app_name="shotlist-generator")

    cleaned = raw_output.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        cleaned = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])

    try:
        data = json.loads(cleaned)
        shots_raw = data.get("shots", [])
        parsed_shots = [ShotItem(**s) for s in shots_raw]
        return ShotlistResponse(
            scene_title=data.get("scene_title", req.scene_title),
            director_style=data.get("director_style", req.director_style),
            visual_rhythm=data.get("visual_rhythm", "Deliberate tension with sharp conversational cuts"),
            aspect_ratio=data.get("aspect_ratio", "2.39:1 Anamorphic"),
            color_temperature=data.get("color_temperature", "4300K Cyan and Tungsten"),
            shots=parsed_shots,
        )
    except Exception as e:
        logger.warning("Failed to parse Shotlist JSON from Gemini output: %s", e)

    charA = req.characters[0] if req.characters else "Marcus"
    charB = req.characters[1] if len(req.characters) > 1 else "Elena"
    return ShotlistResponse(
        scene_title=req.scene_title,
        director_style=req.director_style,
        visual_rhythm="Calculated neo-noir tension; static frames escalating into kinetic close-ups",
        aspect_ratio="2.39:1 Anamorphic",
        color_temperature="4300K Cold Cyan & Deep Tungsten",
        shots=[
            ShotItem(
                shot_number=1,
                shot_type="Wide Establishing Master",
                lens="24mm Anamorphic Prime",
                angle="Eye-Level Center Axis",
                camera_movement="Slow creeping track forward (2mm/sec)",
                blocking_notes=f"{charB} stands dead center facing the vault steel door. {charA} enters frame left at 02:40, stopping at terminal perimeter.",
                lighting_setup="Overhead flickering 4300K cyan tube fixture; deep silhouettes on periphery.",
                dramatic_intent=f"Establish spatial claustrophobia and the power asymmetry between {charB} and {charA}.",
                imagen_prompt=f"Cinematic wide establishing shot in bank vault. Cold cyan lighting, two silhouetted figures {charA} and {charB} facing a massive bank vault safe door. 35mm anamorphic scope, film grain.",
                estimated_duration_sec=8,
            ),
            ShotItem(
                shot_number=2,
                shot_type="Medium Over-the-Shoulder",
                lens="50mm T1.3 Master Prime",
                angle="Slight Low Angle",
                camera_movement="Locked off, rigid tripod",
                blocking_notes=f"Looking past {charA}'s tense shoulder into {charB}'s unblinking profile as she holds the bypass key.",
                lighting_setup="Side-lit with warm tungsten spill from the security panel contrast against cold background.",
                dramatic_intent=f"Force audience into {charA}'s subjective vulnerability as he realizes the setup.",
                imagen_prompt=f"Cinematic medium over-the-shoulder shot looking past a man's shoulder at a calculating woman holding a keycard. Moody shadow, shallow depth of field, photoreal film still.",
                estimated_duration_sec=6,
            ),
            ShotItem(
                shot_number=3,
                shot_type="Extreme Close-Up Insert",
                lens="85mm Macro Prime",
                angle="Top-Down 45 deg",
                camera_movement="Static macro lock",
                blocking_notes=f"{charA}'s fingers trembling as he inspects the empty keycard slot on the electronic lock.",
                lighting_setup="High-contrast specular reflection off brushed titanium safe surface.",
                dramatic_intent="Visceral tangible evidence that escape has been compromised.",
                imagen_prompt="Macro close up shot of trembling hand touching a brushed titanium electronic keypad in shadows. Cinematic lighting, photoreal 35mm.",
                estimated_duration_sec=4,
            ),
            ShotItem(
                shot_number=4,
                shot_type="Tight Close-Up Reaction",
                lens="85mm Portrait Anamorphic",
                angle="Direct Eye-Level",
                camera_movement="Slow push-in concluding in sudden snap rack focus",
                blocking_notes=f"{charB} turns head 15 degrees toward {charA}, expression completely devoid of remorse.",
                lighting_setup="Edge rim light in icy cyan; eye catchlight pinpoint reflection.",
                dramatic_intent="Confirm the emotional betrayal without words before the klaxon sounds.",
                imagen_prompt=f"Cinematic tight close up portrait of an enigmatic woman in shadows, cold calculating eyes, subtle blue rim lighting, 35mm anamorphic film.",
                estimated_duration_sec=7,
            ),
        ],
    )
