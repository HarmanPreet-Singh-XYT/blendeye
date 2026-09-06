from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.runner import run_agent_once
from app.agents.scene_rewriter import build_scene_rewriter_agent

router = APIRouter(prefix="/script", tags=["script"])


class RewriteSceneRequest(BaseModel):
    scene_text: str
    director_style: str
    subtext_ratio: str = "moderate"
    pacing_bpm: int = 80
    camera_movement: str = "Standard coverage"


class RewriteSceneResponse(BaseModel):
    rewritten_scene: str


@router.post("/rewrite", response_model=RewriteSceneResponse)
async def rewrite_scene(body: RewriteSceneRequest) -> RewriteSceneResponse:
    agent = build_scene_rewriter_agent(
        director_style=body.director_style,
        subtext_ratio=body.subtext_ratio,
        pacing_bpm=body.pacing_bpm,
        camera_movement=body.camera_movement,
    )
    prompt = f"CURRENT SCENE:\n\n{body.scene_text}"
    text = await run_agent_once(agent, prompt, app_name="scene-rewriter")
    return RewriteSceneResponse(rewritten_scene=text)
