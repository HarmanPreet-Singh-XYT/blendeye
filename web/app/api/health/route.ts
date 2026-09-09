import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const agentServiceUrl = process.env.AGENT_SERVICE_URL;
  const isProd = process.env.NODE_ENV === "production";
  const effectiveUrl = agentServiceUrl || (!isProd ? "http://localhost:8000" : null);

  if (!effectiveUrl) {
    return NextResponse.json({
      status: "skipped",
      message: "AGENT_SERVICE_URL not configured",
    });
  }

  try {
    const controller = new AbortController();
    // 15-second timeout to allow sleeping containers (e.g. Render, Cloud Run) to wake up
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${effectiveUrl}/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        status: "healthy",
        woke: true,
        sidecar: data,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({
      status: "degraded",
      code: res.status,
      message: "Agent service returned non-200 status",
      timestamp: Date.now(),
    });
  } catch (err: any) {
    // Non-blocking: during cold start the service may take a few seconds to boot
    return NextResponse.json({
      status: "warming_up",
      message: err?.message || "Agent service ping dispatched; warming up cold start",
      timestamp: Date.now(),
    });
  }
}
