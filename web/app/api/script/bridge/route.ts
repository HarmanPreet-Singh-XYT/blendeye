import { NextRequest, NextResponse } from "next/server";

interface BridgeRequestBody {
  projectId?: string;
  premise: string;
  prevScene: {
    title: string;
    slugline: string;
    summary: string;
    screenplayText?: string;
    castPresent?: string[];
  };
  nextScene: {
    title: string;
    slugline: string;
    summary: string;
    screenplayText?: string;
    castPresent?: string[];
  };
  characters?: Array<{ name: string; archetype?: string }>;
  userPrompt?: string;
  targetDurationSeconds?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BridgeRequestBody;
    const { premise, prevScene, nextScene, characters = [], userPrompt, targetDurationSeconds } = body;

    if (!prevScene || !nextScene) {
      return NextResponse.json(
        { error: "Both prevScene and nextScene are required to generate a bridge" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
    const castNames = characters.map((c) => c.name).join(", ") || "Core Crew";

    if (apiKey) {
      try {
        const prompt = `You are an elite Hollywood script supervisor and screenwriter.
We have two disconnected scenes in a feature screenplay:

PREVIOUS SCENE:
Title: ${prevScene.title}
Slugline: ${prevScene.slugline}
Summary: ${prevScene.summary}

NEXT SCENE:
Title: ${nextScene.title}
Slugline: ${nextScene.slugline}
Summary: ${nextScene.summary}

OVERALL FILM PREMISE:
${premise}

AVAILABLE CAST:
${castNames}
${userPrompt?.trim() ? `\nDIRECTOR'S SPECIFIC GUIDANCE / PROMPT:
"${userPrompt.trim()}"
CRITICAL: You must realize and reflect the director's specific creative direction above while bridging the scenes.\n` : ""}
TASK:
Write a transitional "Bridge Scene" that logically and dramatically connects the previous scene to the next scene${userPrompt?.trim() ? ` following the director's creative guidance` : ""}.
It should solve narrative logistics (e.g. travel, preparation, surveillance, close call, or escalating tension).

Return pure valid JSON with this exact schema:
{
  "title": "Short punchy title (e.g. Infiltration Transit)",
  "slugline": "Standard screenplay slugline (e.g. INT. SERVICE CORRIDOR - NIGHT)",
  "location": "Location name",
  "summary": "2-3 sentence synopsis of the bridge moment",
  "castPresent": ["Names of characters in this bridge scene"],
  "durationSeconds": ${targetDurationSeconds && targetDurationSeconds > 0 ? targetDurationSeconds : 180},
  "screenplayText": "Formatted screenplay with slugline, action lines, and dialogue"
}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
          const parsed = JSON.parse(rawText);

          return NextResponse.json({
            title: parsed.title || "The Connecting Beat",
            slugline: parsed.slugline || "INT. TRANSIT CORRIDOR - NIGHT",
            location: parsed.location || "Transit Corridor",
            summary: parsed.summary || "A transitional beat connecting the sequences.",
            castPresent: Array.isArray(parsed.castPresent) ? parsed.castPresent : [characters[0]?.name || "Lead"],
            durationSeconds: parsed.durationSeconds || 180,
            screenplayText: parsed.screenplayText || `${parsed.slugline || "INT. TRANSIT CORRIDOR - NIGHT"}\n\nThe crew navigates the tight corridor in silence.`,
            isBridge: true,
          });
        }
      } catch (aiErr) {
        console.warn("[BridgeSceneAPI] Gemini call error, falling back to procedural bridge:", aiErr);
      }
    }

    // Smart Fallback when offline or no API key
    const fallbackTitle = userPrompt?.trim()
      ? userPrompt.trim().length > 35
        ? `${userPrompt.trim().slice(0, 32)}...`
        : userPrompt.trim()
      : "Transitional Escalation";
    const fallbackSummary = userPrompt?.trim()
      ? `Transitional bridge linking "${prevScene.title}" and "${nextScene.title}". Directed focus: ${userPrompt.trim()}`
      : `Transitional bridge linking "${prevScene.title}" and "${nextScene.title}". Tension escalates as logistics are prepped.`;
    const fallbackDuration = targetDurationSeconds && targetDurationSeconds > 0 ? targetDurationSeconds : 180;

    return NextResponse.json({
      _fallback: true,
      title: fallbackTitle,
      slugline: "INT. SERVICE ACCESS CORRIDOR - NIGHT",
      location: "Service Access Corridor",
      summary: fallbackSummary,
      castPresent: prevScene.castPresent || [characters[0]?.name || "Marcus"],
      durationSeconds: fallbackDuration,
      isBridge: true,
      screenplayText: `INT. SERVICE ACCESS CORRIDOR - NIGHT

${userPrompt?.trim() ? `[DIRECTOR'S NOTE: ${userPrompt.trim()}]\n\n` : ""}Distant mechanical hum. Emergency strobe pulses amber through exhaust steam.

The crew moves in synchronized silence, checking comm links and verifying line-of-sight before breaching the next threshold.

MARCUS
(whispering into radio)
Clear. Keep your cadence steady.

ELENA
Two minutes to checkpoint. Move.`,
    });
  } catch (err) {
    console.error("[BridgeSceneAPI] Error generating bridge:", err);
    return NextResponse.json(
      {
        _fallback: true,
        title: "Transitional Passage",
        slugline: "INT. CONNECTING CORRIDOR - NIGHT",
        location: "Connecting Corridor",
        summary: "A connective sequence maintaining story pacing and spatial logic.",
        castPresent: ["Lead"],
        durationSeconds: 180,
        isBridge: true,
        screenplayText: "INT. CONNECTING CORRIDOR - NIGHT\n\nShadows stretch as the characters transition between positions.",
      },
      { status: 200 }
    );
  }
}
