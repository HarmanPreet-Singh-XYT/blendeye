# Grafana Labs Studio Observability for BlendEye

This directory contains the production Grafana dashboard and setup configuration for BlendEye's Studio Observability.

## 📊 Pre-Built Dashboard (`blendeye-studio-dashboard.json`)

The dashboard monitors all critical asynchronous and real-time studio pipelines:
1. **Studio API Throughput**: Real-time request rate across script generation, media rendering, and chat agents (`blendeye_http_requests_total`).
2. **ClickHouse Sub-Millisecond Time-Gate Latency**: Live gauge with 4ms SLO threshold (`blendeye_clickhouse_query_latency_ms`).
3. **Active Sharded Story Events**: Real-time gauge of character knowledge tuples indexed in ClickHouse MergeTree tables.
4. **Google Veo 3.1 Video Sequencer Performance**: Render duration histograms across single and multi-shot takes.
5. **OpenCV Pixel-Anchoring Latency**: Speed of last-frame conditioning extraction for sequential video chaining.
6. **Gemini 3.1 Flash TTS Synthesis**: Multi-speaker voice generation duration with actor timbre mapping.
7. **Parallel Web Systems Search Yield**: Live query count for filming locations and soundstage permits.

---

## 🚀 1-Click Import into Grafana Cloud

1. Log into your [Grafana Cloud](https://grafana.com/products/cloud/) instance.
2. In the left navigation bar, click **Dashboards** ➔ **New** ➔ **Import**.
3. Click **Upload dashboard JSON file** and select `grafana/blendeye-studio-dashboard.json` (or paste the file contents).
4. Select your Prometheus data source from the dropdown.
5. Click **Import**!

---

## ⚡ Runtime MCP Server (`mcp-grafana`)

BlendEye includes the official `mcp-grafana` server running over stdio in `agent-service/app/services/grafana_mcp.py`.
The Showrunner / Studio Supervisor agent (`agent-service/app/agents/showrunner.py`) has direct access to 60+ tools to inspect logs, query Prometheus metrics, and triage active alerts.

Configure in `.env`:
```env
GRAFANA_URL=https://<your-stack>.grafana.net
GRAFANA_SERVICE_ACCOUNT_TOKEN=glsa_...
```
