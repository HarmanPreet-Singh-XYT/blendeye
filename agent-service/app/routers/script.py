from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.runner import run_agent_once
from app.agents.script_generator import build_script_generator_agent

router = APIRouter(prefix="/script", tags=["script"])


class GenerateScriptRequest(BaseModel):
    premise: str


class GenerateScriptResponse(BaseModel):
    screenplay_text: str


@router.post("/generate", response_model=GenerateScriptResponse)
async def generate_script(body: GenerateScriptRequest) -> GenerateScriptResponse:
    agent = build_script_generator_agent()
    text = await run_agent_once(agent, body.premise, app_name="script-generator")
    return GenerateScriptResponse(screenplay_text=text)
