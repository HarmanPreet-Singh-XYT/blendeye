# Agentic Cinema — Web Frontend

Next.js 16 (App Router) web application for **Agentic Cinema**, featuring the interactive cinematic writers' room canvas, director pre-production workbench, and real-time integration with the Python agent service and ClickHouse.

See the root [README.md](../README.md) for the full product vision, architecture diagram, and feature catalog.

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the following variables:

```env
AGENT_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to open the Studio.

---

## 🛠️ Key Libraries & Technologies

- **Framework**: Next.js 16 (App Router, Turbopack) & React 19
- **Canvas / Node Graph**: `@xyflow/react` (React Flow)
- **Styling**: Tailwind CSS v4, `shadcn/ui`, `lucide-react`
- **Data Visualization**: `recharts` (Tension Curves), `d3-geo` & `topojson-client` (Global Territory Box Office Heatmap)
- **Persistence**: Supabase Client SDK (`@supabase/supabase-js`) & local fallback storage
