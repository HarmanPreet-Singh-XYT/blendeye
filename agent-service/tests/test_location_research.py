from fastapi.testclient import TestClient

from app.agents.location_qa import generate_fallback_location_qa
from app.agents.location_researcher import (
    compute_deterministic_rank_score,
    generate_fallback_location_research,
)
from app.main import app


def test_compute_deterministic_rank_score():
    # 0.35*budget_fit + 0.30*creative_fit + 0.25*shootability + 0.10*consolidation_bonus
    breakdown = {
        "budget_fit": 1.0,
        "creative_fit": 1.0,
        "shootability": 1.0,
        "consolidation_bonus": 1.0,
    }
    score = compute_deterministic_rank_score(breakdown)
    assert score == 1.0

    breakdown_half = {
        "budget_fit": 0.5,
        "creative_fit": 0.5,
        "shootability": 0.5,
        "consolidation_bonus": 0.5,
    }
    score_half = compute_deterministic_rank_score(breakdown_half)
    assert score_half == 0.5


def test_generate_fallback_location_research():
    scenes = [
        {
            "scene_id": "sc-01",
            "scene_number": 1,
            "title": "Vault Infiltration",
            "location": "Bank Vault",
            "shoot_region": "London, UK",
            "location_budget": 25000,
        },
        {
            "scene_id": "sc-02",
            "scene_number": 2,
            "title": "Perimeter Chase",
            "location": "Waterfront Dock",
            "shoot_region": "London, UK",
            "location_budget": 20000,
        },
    ]

    result = generate_fallback_location_research(
        project_title="London Heist",
        genre="Heist Thriller",
        scenes=scenes,
        production_base="London, UK",
        currency="GBP",
        total_budget=500000.0,
    )

    assert result["_fallback"] is True
    assert len(result["scenes"]) == 2
    assert len(result["clusters"]) == 1

    cand0 = result["scenes"][0]["candidates"][0]
    assert "London" in cand0["name"]
    assert cand0["estimated_cost"]["currency"] == "GBP"
    assert cand0["rank_score"] > 0.0


def test_generate_fallback_location_qa():
    qa = generate_fallback_location_qa(
        candidate_name="Spring Street Vaults",
        region="Los Angeles, CA",
        category="vault",
        question="What are permit fees and curfew hours?",
    )
    assert qa["_fallback"] is True
    assert "FilmLA" in qa["answer"] or "permit" in qa["answer"].lower()
    assert len(qa["sources"]) > 0
    assert len(qa["suggested_followups"]) > 0


def test_api_location_research_and_qa_endpoints():
    client = TestClient(app)
    # Test research
    res = client.post(
        "/location/research",
        json={
            "project_title": "Unit Test Project",
            "genre": "Thriller",
            "production_base": "Vancouver, BC",
            "currency": "CAD",
            "budget": 600000,
            "budget_cap_policy": "advisory",
            "scenes": [
                {
                    "scene_id": "sc-01",
                    "scene_number": 1,
                    "title": "Opening Test",
                    "slugline": "INT. VAULT - NIGHT",
                    "location": "Vault",
                    "shoot_region": "Vancouver, BC",
                    "location_budget": 20000,
                }
            ],
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["scenes"]) >= 1

    # Test QA
    res_qa = client.post(
        "/location/qa",
        json={
            "candidate_id": "loc_01",
            "candidate_name": "Vancouver Waterfront Terminal",
            "region": "Vancouver, BC",
            "category": "industrial-dock",
            "question": "What are the permit requirements?",
            "project_title": "Unit Test Project",
        },
    )
    assert res_qa.status_code == 200
    data_qa = res_qa.json()
    assert len(data_qa["answer"]) > 20
