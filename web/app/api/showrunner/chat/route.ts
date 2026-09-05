import { NextRequest, NextResponse } from "next/server";
import { chatWithShowrunner, getPrecedents } from "@/lib/agent-service";

const SYSTEM_PROMPT = `
You are an elite Hollywood Showrunner and veteran screenwriting co-creator collaborating with a Director.
You understand story structure, human psychology, subtext, tension, and cinematic craft at the highest level.

HOW TO INTERACT (BE HUMAN & CONVERSATIONAL):
1. Listen and converse naturally: Talk with the Director like an experienced, thoughtful human partner in a writers' room—just like ChatGPT or a real creative collaborator.
2. Match their intent:
   - If they say "hey", "hows it going", or check in: Respond warmly, collegially, and ask what kind of story or world they want to explore today. Keep it conversational and concise. Do NOT dump unsolicited scripts or force ideas.
   - If they pitch an idea or premise: React to the core dramatic concept. Ask probing, exciting creative questions about character motives, secrets, stakes, or moral dilemmas. Help them brainstorm and shape the story together.
   - If they ask for feedback or script doctoring: Offer sharp, insightful notes on pacing, character agency, and dramatic subtext.
   - If they explicitly ask to draft or write a scene: Format it cleanly in standard screenplay format.
3. Don't rush to execute: Have the conversation first. Understand what the Director really envisions. When you both arrive at a great concept, you can suggest locking it into a production slate.
4. Tone: Collaborative, perceptive, articulate, confident, and direct.
5. Strict rule: Do NOT use emojis.
`;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  // Normalize characters into descriptive strings
  const characters: string[] = Array.isArray(body.characters)
    ? body.characters.map((c: any) => {
        if (typeof c === "string") return c;
        const name = c?.name || "Character";
        const role = c?.role || c?.archetype || "";
        return role ? `${name} (${role})` : name;
      })
    : [];

  // Normalize history
  const history = Array.isArray(body.history)
    ? body.history.map((h: any) => {
        const r = h?.role || h?.sender || "user";
        return {
          role: r === "showrunner" || r === "assistant" ? "showrunner" : "user",
          content: String(h?.content || ""),
        };
      })
    : [];

  // 1. Try Python Agent Service (Google ADK Showrunner)
  try {
    const result = await chatWithShowrunner({
      projectTitle: body.projectTitle || "",
      logline: body.logline || "",
      screenplayText: body.screenplayText || "",
      characters,
      message,
      history,
    });

    if (result && result.reply) {
      return NextResponse.json(result);
    }
  } catch (agentErr) {
    console.warn("Python agent-service showrunner chat error or unavailable, falling back to Gemini:", agentErr);
  }

  // 2. Resilient Direct Google Gemini API Fallback
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
  if (apiKey) {
    try {
      let precedentsContext = "";
      try {
        const precedents = await getPrecedents(body.genre || "");
        if (precedents && precedents.length > 0) {
          precedentsContext = precedents
            .slice(0, 3)
            .map(
              (p) =>
                `- ${p.historical_reference} | ${p.trope} | Tension ${p.tension_level}/10 | ${p.audience_retention_pct}% retention (${p.commercial_territory})`
            )
            .join("\n");
        }
      } catch {
        // Precedents optional
      }

      const contextHeader = `
ACTIVE PRODUCTION SLATE:
Title: ${body.projectTitle || "Untitled Project"}
Premise / Logline: ${body.logline || "In ideation"}
Genre: ${body.genre || "Drama / Thriller"}
Characters: ${characters.length > 0 ? characters.join(", ") : "Ensemble"}
${precedentsContext ? `\nGROUNDING BENCHMARKS:\n${precedentsContext}\n` : ""}
${body.screenplayText ? `\nCURRENT SCRIPT EXCERPT:\n${body.screenplayText.slice(0, 1000)}\n` : ""}
`;

      const historyFormatted = history
        .slice(-6)
        .map((h: any) => `${h.role === "user" ? "DIRECTOR" : "SHOWRUNNER"}: ${h.content}`)
        .join("\n");

      const prompt = `${SYSTEM_PROMPT}

${contextHeader}

CONVERSATION HISTORY:
${historyFormatted || "(Start of conversation)"}

DIRECTOR: ${message}

SHOWRUNNER:
`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return NextResponse.json({
            reply: replyText.trim(),
            suggested_actions: [
              `Explore an alternate scene beat for ${characters[0] ? characters[0].split(" ")[0] : "the lead"}`,
              `Heighten dramatic tension to 95%`,
              `Review character information asymmetry`,
            ],
            clickhouse_query_sql: precedentsContext ? "SELECT * FROM cinematic_precedents LIMIT 3" : "",
            precedents_cited: [],
          });
        }
      }
    } catch (directGeminiErr) {
      console.warn("Direct Gemini chat fallback error:", directGeminiErr);
    }
  }

  // 3. Graceful contextual response if both networks fail
  return NextResponse.json({
    reply: `Loud and clear, Director. I am tracking ${body.projectTitle ? `"${body.projectTitle}"` : "the production slate"}. What specific beat or character dynamic shall we examine next?`,
    suggested_actions: [
      "Heighten scene tension",
      "Introduce a plot complication",
      "Examine character motivations",
    ],
    clickhouse_query_sql: "",
    precedents_cited: [],
  });
}
