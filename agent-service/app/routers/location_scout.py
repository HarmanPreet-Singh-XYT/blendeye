from __future__ import annotations

import json

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents.location_scout import build_location_scout_agent
from app.agents.runner import parse_json_from_llm, run_agent_once

router = APIRouter(prefix="/location", tags=["location-scout"])


class LocationScoutRequest(BaseModel):
    scene_description: str
    characters: list[str] = Field(default_factory=lambda: ["Marcus", "Elena"])
    genre: str = "Crime Heist Thriller"


class PrecedentComp(BaseModel):
    film: str
    director: str
    scene_comparison: str
    lens_and_blocking_technique: str


class CameraPackage(BaseModel):
    cam_a: str
    cam_b: str
    cam_c: str


class LocationScoutResponse(BaseModel):
    film_precedents: list[PrecedentComp]
    location_aesthetic: str
    practical_lighting: str
    camera_package: CameraPackage
    imagen3_prompt: str


@router.post("/scout", response_model=LocationScoutResponse)
async def scout_location(req: LocationScoutRequest):
    agent = build_location_scout_agent()
    prompt = (
        f"Scene Premise: {req.scene_description}\n"
        f"Characters Present: {', '.join(req.characters)}\n"
        f"Genre: {req.genre}\n"
    )

    raw_output = await run_agent_once(agent, prompt, app_name="location-scout")

    try:
        data = parse_json_from_llm(raw_output)
        return LocationScoutResponse(**data)
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        return LocationScoutResponse(
            film_precedents=[
                PrecedentComp(
                    film="Heat (1995)",
                    director="Michael Mann",
                    scene_comparison="Diner confrontation where two opposing forces sit across a narrow table, subtext masking deadly stakes.",
                    lens_and_blocking_technique="85mm long lens compression, eye-level over-the-shoulder, strict 180-degree rule adherence.",
                ),
                PrecedentComp(
                    film="Thief (1981)",
                    director="Michael Mann",
                    scene_comparison="Midnight industrial dry dock negotiation under harsh security halogens.",
                    lens_and_blocking_technique="Wide 24mm anamorphic lens emphasizing human vulnerability against massive steel structures.",
                ),
            ],
            location_aesthetic="Decommissioned maritime shipping container terminal with corrugated rusted walls and wet concrete slabs.",
            practical_lighting="Tower flood halogens providing harsh overhead top-light with deep eye socket shadows and blue auxiliary emergency beacons.",
            camera_package=CameraPackage(
                cam_a="50mm Anamorphic Prime on Marcus (Medium Close-Up)",
                cam_b="85mm Telephoto on Elena (Tight Profile Close-Up)",
                cam_c="24mm Ultra-Wide Tracking Crane across warehouse floor",
            ),
            imagen3_prompt="2.39:1 anamorphic frame, rusted shipping container terminal at midnight, overhead halogen glare, rain puddles reflecting emergency beacons, high cinematic tension",
        )
