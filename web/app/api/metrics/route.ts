import { NextResponse } from "next/server";

export async function GET() {
  const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL ?? "http://localhost:8000";

  try {
    const res = await fetch(`${AGENT_SERVICE_URL}/metrics`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Return mock metrics if sidecar is starting
  }

  return NextResponse.json({
    studio: "Agentic Cinema Executive Backlot",
    partner_integrations: ["ClickHouse Cloud"],
    mcp_servers: {
      clickhouse_mcp: "unreachable",
      state: "degraded",
    },
    telemetry: {
      uptime_seconds: Math.floor(Date.now() / 1000),
    },
    _fallback: true,
    _error: "agent-service unreachable",
  });
}
