import { NextRequest, NextResponse } from "next/server";
import { generateBridgeScene } from "@/lib/agent-service";

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

// Proxies to agent-service's /bridge/generate, same pattern as every other
// generation path — this route used to hold its own direct Gemini REST call
// with no agent-service fallback at all, so a missing GOOGLE_API_KEY on the
// web deployment meant silently returning a hardcoded "Marcus"/"Elena"
// bridge scene regardless of the actual project.
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

    try {
      const result = await generateBridgeScene({
        premise,
        prev_scene: {
          title: prevScene.title,
          slugline: prevScene.slugline,
          summary: prevScene.summary,
          screenplay_text: prevScene.screenplayText,
          cast_present: prevScene.castPresent,
        },
        next_scene: {
          title: nextScene.title,
          slugline: nextScene.slugline,
          summary: nextScene.summary,
          screenplay_text: nextScene.screenplayText,
          cast_present: nextScene.castPresent,
        },
        characters,
        user_prompt: userPrompt,
        target_duration_seconds: targetDurationSeconds,
      });

      return NextResponse.json({
        title: result.title || "The Connecting Beat",
        slugline: result.slugline || "INT. TRANSIT CORRIDOR - NIGHT",
        location: result.location || "Transit Corridor",
        summary: result.summary || "A transitional beat connecting the sequences.",
        castPresent: Array.isArray(result.cast_present) && result.cast_present.length > 0
          ? result.cast_present
          : [characters[0]?.name || "Lead"],
        durationSeconds: result.duration_seconds || 180,
        screenplayText:
          result.screenplay_text ||
          `${result.slugline || "INT. TRANSIT CORRIDOR - NIGHT"}\n\nThe crew navigates the tight corridor in silence.`,
        isBridge: true,
      });
    } catch (agentErr) {
      console.error("[BridgeSceneAPI] agent-service call failed, using fallback:", agentErr);
    }

    // Smart Fallback when agent-service is unreachable
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
