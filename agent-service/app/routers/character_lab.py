from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents.character_lab import (
    build_character_synthesizer_agent,
    build_chemistry_bench_agent,
    build_dialogue_tuner_agent,
    build_ensemble_synthesizer_agent,
)
from app.agents.runner import run_agent_once

router = APIRouter(prefix="/character", tags=["character-lab"])


class CharacterSynthesizeRequest(BaseModel):
    name: str = "Marcus Vance"
    base_archetype: str = "Tense getaway driver"
    dream_actor: str = "Willem Dafoe in The Lighthouse"
    personality_dials: dict[str, Any] = Field(
        default_factory=lambda: {
            "confidence": 0.45,
            "verbal_speed": "rapid-staccato",
            "sarcasm_ratio": 0.70,
        }
    )
    behavioral_tics: list[str] = Field(
        default_factory=lambda: ["Fidgets with silver zippo", "Avoids direct eye contact"]
    )
    additional_notes: str = ""


class CharacterSynthesizeResponse(BaseModel):
    name: str
    archetype: str
    bio: str
    dream_actor_comp: str
    speech_style: str
    subtext_ratio: str
    flaw_and_blindspot: str
    behavioral_tics: list[str]
    suggested_tts_voice: str


@router.post("/synthesize", response_model=CharacterSynthesizeResponse)
async def synthesize_character(req: CharacterSynthesizeRequest):
    agent = build_character_synthesizer_agent()
    prompt = (
        f"Synthesize character DNA:\n"
        f"Name: {req.name}\n"
        f"Base Archetype: {req.base_archetype}\n"
        f"Dream Actor Comp: {req.dream_actor}\n"
        f"Personality Dials: {json.dumps(req.personality_dials)}\n"
        f"Behavioral Tics: {', '.join(req.behavioral_tics)}\n"
        f"Additional Notes: {req.additional_notes}\n"
    )

    raw_output = await run_agent_once(agent, prompt, app_name="character-synthesizer")
    cleaned = raw_output.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        cleaned = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])

    try:
        data = json.loads(cleaned)
        return CharacterSynthesizeResponse(**data)
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        # Graceful fallback response
        return CharacterSynthesizeResponse(
            name=req.name,
            archetype=req.base_archetype,
            bio=f"{req.name} is driven by survival in an unforgiving high-stakes environment.",
            dream_actor_comp=req.dream_actor,
            speech_style="terse, staccato, guarded",
            subtext_ratio="high (rarely says what they mean)",
            flaw_and_blindspot="Paranoid distrust of close allies",
            behavioral_tics=req.behavioral_tics or ["Fidgets with lighter"],
            suggested_tts_voice="Fenrir",
        )


class EnsembleCharacter(BaseModel):
    name: str
    role: str
    archetype: str
    speechStyle: str
    subtextRatio: str
    confidence: int = 80
    verbalPacing: int = 75
    objective: str
    quirks: list[str] = Field(default_factory=list)


class EnsembleSynthesizeRequest(BaseModel):
    genre: str = ""
    premise: str = ""


class EnsembleSynthesizeResponse(BaseModel):
    characters: list[EnsembleCharacter]


@router.post("/synthesize_ensemble", response_model=EnsembleSynthesizeResponse)
async def synthesize_ensemble(req: EnsembleSynthesizeRequest):
    agent = build_ensemble_synthesizer_agent()
    prompt = (
        f"Genre: {req.genre or 'Drama / Thriller'}\n"
        f"Premise / Logline: {req.premise or 'A high-stakes confrontation between two people with conflicting objectives.'}\n"
    )

    raw_output = await run_agent_once(agent, prompt, app_name="ensemble-synthesizer")
    cleaned = raw_output.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        cleaned = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])

    data = json.loads(cleaned)
    return EnsembleSynthesizeResponse(**data)


class ChemistryTestRequest(BaseModel):
    char_a_name: str
    char_a_dna: str
    char_b_name: str
    char_b_dna: str
    scenario: str = "Stuck in a broken service elevator with a ticking delivery countdown"


class ChemistryTestResponse(BaseModel):
    scenario: str
    micro_scene: str


@router.post("/chemistry", response_model=ChemistryTestResponse)
async def test_chemistry(req: ChemistryTestRequest):
    agent = build_chemistry_bench_agent()
    prompt = (
        f"CHARACTER A:\nName: {req.char_a_name}\nDNA: {req.char_a_dna}\n\n"
        f"CHARACTER B:\nName: {req.char_b_name}\nDNA: {req.char_b_dna}\n\n"
        f"ENVIRONMENTAL SCENARIO:\n{req.scenario}\n\n"
        f"Write a 1-page high-friction chemistry test scene showing their distinct cadences clashing."
    )

    micro_scene = await run_agent_once(agent, prompt, app_name="chemistry-bench")
    return ChemistryTestResponse(scenario=req.scenario, micro_scene=micro_scene.strip())


class TuneDialogueRequest(BaseModel):
    character_name: str
    speech_style: str
    subtext_ratio: str
    raw_dialogue: str


class TuneDialogueResponse(BaseModel):
    character_name: str
    tuned_dialogue: str


@router.post("/tune_dialogue", response_model=TuneDialogueResponse)
async def tune_dialogue(req: TuneDialogueRequest):
    agent = build_dialogue_tuner_agent()
    prompt = (
        f"Character: {req.character_name}\n"
        f"Speech Style: {req.speech_style}\n"
        f"Subtext Level: {req.subtext_ratio}\n"
        f"Raw Dialogue to Polish:\n{req.raw_dialogue}\n"
    )

    tuned = await run_agent_once(agent, prompt, app_name="dialogue-tuner")
    return TuneDialogueResponse(character_name=req.character_name, tuned_dialogue=tuned.strip())
