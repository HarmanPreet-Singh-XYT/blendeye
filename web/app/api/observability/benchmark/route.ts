import { NextResponse } from "next/server";

export async function POST() {
  const agentServiceUrl = process.env.AGENT_SERVICE_URL;
  const isProd = process.env.NODE_ENV === "production";
  const effectiveUrl = agentServiceUrl || (!isProd ? "http://localhost:8000" : null);

  if (effectiveUrl) {
    try {
      const res = await fetch(`${effectiveUrl}/observability/benchmark`, {
        method: "POST",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend unreachable, probe directly from Next.js runtime
    }
  }

  // Direct probe for real network round-trip latencies without fake data
  const networkLatencies: Array<{
    network_type: string;
    service: string;
    destination: string;
    latency_ms: number | null;
    protocol: string;
    status: string;
  }> = [];

  const probeTarget = async (
    network_type: string,
    service: string,
    url: string | undefined,
    protocol: string
  ) => {
    if (!url) {
      networkLatencies.push({
        network_type,
        service,
        destination: "unconfigured",
        latency_ms: null,
        protocol,
        status: "unconfigured",
      });
      return;
    }
    const t0 = performance.now();
    try {
      const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(4000) });
      const elapsed = +(performance.now() - t0).toFixed(2);
      networkLatencies.push({
        network_type,
        service,
        destination: new URL(url).host,
        latency_ms: elapsed,
        protocol,
        status: res.ok || res.status < 500 ? "healthy" : `status ${res.status}`,
      });
    } catch {
      networkLatencies.push({
        network_type,
        service,
        destination: url,
        latency_ms: null,
        protocol,
        status: "unreachable",
      });
    }
  };

  await Promise.allSettled([
    probeTarget("storage_auth", "supabase_cloud", process.env.NEXT_PUBLIC_SUPABASE_URL, "HTTPS REST/Auth"),
    probeTarget("telemetry_ingest", "grafana_cloud", "https://fearlessimpatiens433.grafana.net", "HTTPS"),
    probeTarget("web_search", "parallel_web_api", "https://api.parallel.ai", "HTTPS /v1"),
  ]);

  return NextResponse.json({
    status: "success",
    benchmark_duration_ms: null,
    clickhouse: {
      queries_executed: 0,
      avg_latency_ms: null,
      p95_latency_ms: null,
      slo_status: "ClickHouse queries idle (agent service unqueried)",
    },
    network_latencies: networkLatencies,
    grafana_cloud_status: "probed",
  });
}

