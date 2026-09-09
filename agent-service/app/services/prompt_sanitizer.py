"""Prompt sanitizer to protect video and image generation from Google RAI filters.

Google Veo 3.1 and Imagen 3 / Gemini Image have strict Responsible AI (RAI) filters
that automatically block or silently discard generations mentioning real living people,
celebrities, famous actors, or explicit 'likeness of / resembling [Actor]' phrases.

This module provides robust sanitization to strip or convert celebrity actor comps
and real-person likeness references into generic, evocative cinematic visual descriptors.
"""

from __future__ import annotations

import re

# Comprehensive list of commonly referenced actors/celebrities in casting comps
KNOWN_CELEBRITIES = [
    # Top modern/contemporary actors frequently used as reference comps
    "Florence Pugh", "Jake Gyllenhaal", "Cillian Murphy", "Oscar Isaac", "Zendaya",
    "Timothée Chalamet", "Timothee Chalamet", "Austin Butler", "Ana de Armas",
    "Margot Robbie", "Ryan Gosling", "Emma Stone", "Christian Bale", "Leonardo DiCaprio",
    "Brad Pitt", "Tom Cruise", "Keanu Reeves", "Joaquin Phoenix", "Willem Dafoe",
    "Daniel Craig", "Idris Elba", "Tom Hardy", "Michael B. Jordan", "Michael B Jordan",
    "Pedro Pascal", "Adam Driver", "Robert Pattinson", "Paul Mescal", "Barry Keoghan",
    "Andrew Garfield", "Benedict Cumberbatch", "Tom Hiddleston", "Sebastian Stan",
    "Chris Evans", "Chris Hemsworth", "Chris Pratt", "Mark Ruffalo", "Jeremy Strong",
    "Matthew McConaughey", "Woody Harrelson", "Javier Bardem", "Mads Mikkelsen",
    "Hugh Jackman", "Matt Damon", "Ben Affleck", "George Clooney", "Denzel Washington",
    "Morgan Freeman", "Samuel L. Jackson", "Samuel L Jackson", "Anthony Hopkins",
    "Gary Oldman", "Al Pacino", "Robert De Niro", "Harrison Ford", "Jeff Bridges",
    "Bryan Cranston", "Aaron Paul", "David Fincher", "Christopher Nolan",
    "Denis Villeneuve", "Quentin Tarantino", "Martin Scorsese",
    # Female actors frequently used as comps
    "Anya Taylor-Joy", "Anya Taylor Joy", "Saoirse Ronan", "Mia Goth", "Hunter Schafer",
    "Sydney Sweeney", "Elizabeth Debicki", "Cate Blanchett", "Tilda Swinton",
    "Charlize Theron", "Scarlett Johansson", "Emily Blunt", "Rebecca Ferguson",
    "Jessica Chastain", "Amy Adams", "Rooney Mara", "Carey Mulligan", "Rosamund Pike",
    "Zoe Saldana", "Lupita Nyong'o", "Lupita Nyongo", "Viola Davis", "Angela Bassett",
    "Natalie Portman", "Anne Hathaway", "Marion Cotillard", "Eva Green", "Lea Seydoux",
    "Léa Seydoux", "Gillian Anderson", "Olivia Colman", "Kate Winslet", "Nicole Kidman",
    "Julianne Moore", "Michelle Yeoh", "Sigourney Weaver", "Meryl Streep", "Jodie Foster",
    "Helena Bonham Carter", "Gwendoline Christie", "Elizabeth Olsen", "Dakota Johnson",
]

# Build regex pattern for celebrity names (case-insensitive)
_CELEB_PATTERN = re.compile(
    r"\b(?:" + "|".join(re.escape(name) for name in sorted(KNOWN_CELEBRITIES, key=len, reverse=True)) + r")\b",
    re.IGNORECASE,
)

# Regexes for explicit likeness and comp phrases
_LIKENESS_PATTERNS = [
    # E.g. (facial likeness and bone structure strongly echoing Florence Pugh)
    # E.g. (facial likeness and bone structure strongly echoing Jake Gyllenhaal (Nightcrawler / Prisoners))
    re.compile(
        r"\((?:facial\s+)?likeness\s+(?:and\s+bone\s+structure\s+)?(?:strongly\s+)?echoing\s+[^)]+\)",
        re.IGNORECASE,
    ),
    # E.g. (likeness resembling Florence Pugh) or Likeness resembling Jake Gyllenhaal.
    re.compile(
        r"\(?likeness\s+resembling\s+[^).,;\n]+(?:\s*\([^)]*\))?\)?",
        re.IGNORECASE,
    ),
    # E.g. (facial likeness resembling Florence Pugh) or Facial likeness resembling Florence Pugh.
    re.compile(
        r"\(?facial\s+likeness\s+resembling\s+[^).,;\n]+(?:\s*\([^)]*\))?\)?",
        re.IGNORECASE,
    ),
    # E.g. (resembling Florence Pugh, intense energy) or (resembling past role, expressive energy)
    re.compile(
        r"\(resembling\s+[^)]+\)",
        re.IGNORECASE,
    ),
    # E.g. "looks like [Name]" or "looking like [Name]"
    re.compile(
        r"\b(?:looks?|looking)\s+like\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b",
    ),
    # E.g. "in the style of [Name]" or "style of [Name]"
    re.compile(
        r"\b(?:in\s+the\s+style\s+of|style\s+of)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b",
        re.IGNORECASE,
    ),
    # E.g. "dream actor comp: [Name]" or "actor comp: [Name]" or "comp: [Name]"
    re.compile(
        r"\b(?:dream\s+actor\s+comp|actor\s+comp|talent\s+comp|dream\s+actor|comp)\s*:\s*[^,.;\n]+",
        re.IGNORECASE,
    ),
    # E.g. "likeness: [Name]"
    re.compile(
        r"\blikeness\s*:\s*[^,.;)\n]+",
        re.IGNORECASE,
    ),
]


def sanitize_veo_prompt(prompt: str, character_name: str | None = None) -> str:
    """Sanitize prompt text and character name before dispatching to Google Veo 3.1.

    Removes any celebrity names, actor likeness statements, or comp phrasing that
    would trigger Google's Responsible-AI (RAI) filters on real person generation.
    """
    if not prompt:
        return ""

    sanitized = prompt

    # 1. Remove explicit likeness / comp parentheticals and clauses
    for pattern in _LIKENESS_PATTERNS:
        sanitized = pattern.sub("", sanitized)

    # 2. Strip any remaining known celebrity names
    sanitized = _CELEB_PATTERN.sub("a cinematic protagonist with striking features", sanitized)

    # 3. Clean up any empty parentheses, double punctuation, and ragged whitespace
    sanitized = re.sub(r"\(\s*\)", "", sanitized)
    sanitized = re.sub(r"\[\s*\]", "", sanitized)
    sanitized = re.sub(r"\s+([,.:;])", r"\1", sanitized)
    sanitized = re.sub(r",\s*,+", ",", sanitized)
    sanitized = re.sub(r",\s*\.", ".", sanitized)
    sanitized = re.sub(r"\.\s*\.+", ".", sanitized)
    sanitized = re.sub(r":\s*:", ":", sanitized)
    sanitized = re.sub(r"\s+", " ", sanitized).strip()
    # Remove dangling commas at start or end
    sanitized = re.sub(r"^[,;.\s]+", "", sanitized)
    sanitized = re.sub(r"[,;:\s]+$", "", sanitized)

    return sanitized


def sanitize_character_name_for_veo(name: str | None) -> str | None:
    """Ensure a character's name itself isn't a celebrity name before passing to Veo."""
    if not name:
        return None
    cleaned = _CELEB_PATTERN.sub("", name).strip()
    return cleaned if cleaned else "The protagonist"
