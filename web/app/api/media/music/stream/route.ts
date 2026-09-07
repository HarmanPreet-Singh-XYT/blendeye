import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const agentServiceUrl = process.env.AGENT_SERVICE_URL;
    const isProd = process.env.NODE_ENV === "production";
    const effectiveUrl = agentServiceUrl || (!isProd ? "http://localhost:8000" : null);

    if (!effectiveUrl) {
      throw new Error("AGENT_SERVICE_URL not configured in production; activating simulated score stream.");
    }

    const response = await fetch(`${effectiveUrl}/media/music/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Upstream returned ${response.status}`);
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("Streaming proxy error, providing simulated stream:", message);

    // Fallback SSE stream if agent service is offline
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(`data: {"type": "status", "message": "Demo offline stream active"}\n\n`));
        const words = "Echoes in the quiet darkness, searching for a sign before the dawn.".split(" ");
        for (const w of words) {
          controller.enqueue(encoder.encode(`data: {"type": "text_delta", "text": "${w} "}\n\n`));
          await new Promise((r) => setTimeout(r, 60));
        }
        controller.enqueue(encoder.encode(`data: {"type": "done", "model": "lyria-3-clip-preview-sim", "duration_sec": 30, "fallback": true}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
}
