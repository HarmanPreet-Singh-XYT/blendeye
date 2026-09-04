from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents.runner import run_agent_once
from app.agents.showrunner import build_showrunner_agent

router = APIRouter(prefix="/showrunner", tags=["showrunner"])


class ShowrunnerMessage(BaseModel):
    role: str  # "user" | "showrunner"
    content: str


class ShowrunnerChatRequest(BaseModel):
    project_title: str = ""
    logline: str = ""
    screenplay_text: str = ""
    characters: list[str] = []
    message: str
    history: list[ShowrunnerMessage] = []


class ShowrunnerChatResponse(BaseModel):
    reply: str
    suggested_actions: list[str] = Field(default_factory=list)


@router.post("/chat", response_model=ShowrunnerChatResponse)
async def chat_with_showrunner(body: ShowrunnerChatRequest) -> ShowrunnerChatResponse:
    agent = build_showrunner_agent()

    context_header = f"""
PROJECT CONTEXT:
Title: {body.project_title or "Untitled Feature"}
Logline: {body.logline or "Unspecified"}
Characters: {", ".join(body.characters) if body.characters else "Ensemble"}

CURRENT SCRIPT EXCERPT:
{body.screenplay_text or "(No script drafted yet)"}
---
"""

    history_text = "\n".join(
        f"{'DIRECTOR' if msg.role == 'user' else 'SHOWRUNNER'}: {msg.content}"
        for msg in body.history[-6:]
    )

    full_prompt = f"{context_header}\nCONVERSATION HISTORY:\n{history_text}\n\nDIRECTOR: {body.message}\nSHOWRUNNER:"

    reply = await run_agent_once(agent, full_prompt, app_name="writers-room-showrunner")

    # Generate context-relevant suggested director quick-actions
    suggestions = [
        "How can we heighten Elena's subtext in this scene?",
        "Check continuity: What does Marcus witness directly?",
        "Draft an alternate climax with an earlier betrayal",
    ]

    return ShowrunnerChatResponse(reply=reply, suggested_actions=suggestions)
