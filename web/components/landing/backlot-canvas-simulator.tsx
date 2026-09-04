"use client";

import * as React from "react";
import Image from "next/image";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeProps,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Sparkles,
  FileText,
  User,
  Sliders,
  Camera,
  Activity,
  Database,
  ArrowRight,
  Maximize2,
  CheckCircle2,
  Settings2,
  Zap,
  Lightbulb,
  Compass,
} from "lucide-react";

// ==========================================
// Custom React Flow Node Components
// ==========================================

// 1. Inspiration / Logline Node
function InspirationCanvasNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`w-72 rounded-xl border bg-card/95 backdrop-blur p-4 shadow-xl transition-all ${
        selected ? "border-cyan-400 ring-2 ring-cyan-400/40" : "border-border hover:border-cyan-500/50"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Lightbulb className="h-3.5 w-3.5" />
          </div>
          <div>
            <SlateLabel>Inspiration Node</SlateLabel>
            <h4 className="text-xs font-bold text-foreground">Directing Prompt</h4>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] border-cyan-500/40 bg-cyan-500/10 text-cyan-300">
          Source
        </Badge>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        &ldquo;A 3-person crew breaches an underground vault. At 00:34:00, Marcus discovers the exit keys are missing and Elena is hiding something.&rdquo;
      </p>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="prompt-out"
        className="!h-3 !w-3 !bg-cyan-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />
    </div>
  );
}

// 2. Master Screenplay Node
function ScriptCanvasNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`w-80 rounded-xl border bg-card/95 backdrop-blur p-4 shadow-xl transition-all ${
        selected ? "border-accent ring-2 ring-accent/40" : "border-border hover:border-accent/50"
      }`}
    >
      {/* Input Handle from Prompt */}
      <Handle
        type="target"
        position={Position.Left}
        id="script-in"
        className="!h-3 !w-3 !bg-cyan-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <div>
            <SlateLabel>Screenplay Master</SlateLabel>
            <h4 className="text-xs font-bold text-foreground">The Vault — Scene 04</h4>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] border-success/40 bg-success/15 text-success">
          Ready
        </Badge>
      </div>

      <div className="p-2.5 rounded bg-background/90 border border-border/60 font-mono text-[10px] space-y-1">
        <span className="text-foreground font-bold block">INT. UNDERGROUND VAULT - NIGHT</span>
        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
          MARCUS: They&apos;re not here. Elena. The bypass keys. They&apos;re not in the bag.
        </p>
        <div className="text-accent text-[9px] pt-1">3 Characters · 90-Min Timeline Sync</div>
      </div>

      {/* Output Handles to Downstream Nodes */}
      <Handle
        type="source"
        position={Position.Right}
        id="script-out-char"
        style={{ top: "30%" }}
        className="!h-3 !w-3 !bg-accent !border-2 !border-background hover:!scale-125 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="script-out-vis"
        style={{ top: "70%" }}
        className="!h-3 !w-3 !bg-emerald-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />
    </div>
  );
}

// 3. Marcus DNA Node
function MarcusCanvasNode({ data, selected }: NodeProps) {
  const paranoia = (data?.paranoia as number) || 85;
  const sarcasm = (data?.sarcasm as number) || 60;

  return (
    <div
      className={`w-72 rounded-xl border bg-card/95 backdrop-blur p-4 shadow-xl transition-all ${
        selected ? "border-amber-400 ring-2 ring-amber-400/40" : "border-border hover:border-amber-500/50"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="marcus-in"
        className="!h-3 !w-3 !bg-accent !border-2 !border-background hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs font-mono">
            M
          </div>
          <div>
            <SlateLabel>Character DNA Dial</SlateLabel>
            <h4 className="text-xs font-bold text-foreground">Marcus Vance</h4>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] border-accent/40 bg-accent/15 text-accent">
          Hot Seat Ready
        </Badge>
      </div>

      <div className="space-y-2 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Paranoia Index:</span>
            <span className="text-accent font-bold">{paranoia}%</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-accent h-full rounded-full" style={{ width: `${paranoia}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Defensive Sarcasm:</span>
            <span className="text-cyan-400 font-bold">{sarcasm}%</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${sarcasm}%` }} />
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="marcus-out"
        className="!h-3 !w-3 !bg-amber-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />
    </div>
  );
}

// 4. Elena DNA Node
function ElenaCanvasNode({ data, selected }: NodeProps) {
  const poise = (data?.poise as number) || 95;
  const deception = (data?.deception as number) || 90;

  return (
    <div
      className={`w-72 rounded-xl border bg-card/95 backdrop-blur p-4 shadow-xl transition-all ${
        selected ? "border-purple-400 ring-2 ring-purple-400/40" : "border-border hover:border-purple-500/50"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="elena-in"
        className="!h-3 !w-3 !bg-accent !border-2 !border-background hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs font-mono">
            E
          </div>
          <div>
            <SlateLabel>Character DNA Dial</SlateLabel>
            <h4 className="text-xs font-bold text-foreground">Elena Ramos</h4>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] border-purple-500/40 bg-purple-500/15 text-purple-300">
          Mastermind
        </Badge>
      </div>

      <div className="space-y-2 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Calculated Poise:</span>
            <span className="text-purple-400 font-bold">{poise}%</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full" style={{ width: `${poise}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Subtext Deception:</span>
            <span className="text-rose-400 font-bold">{deception}%</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-400 h-full rounded-full" style={{ width: `${deception}%` }} />
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="elena-out"
        className="!h-3 !w-3 !bg-purple-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />
    </div>
  );
}

// 5. 2.39:1 Storyboard Frame Node
function StoryboardCanvasNode({ data, selected }: NodeProps) {
  const lens = (data?.lens as string) || "Panavision C-Series 40mm";

  return (
    <div
      className={`w-84 rounded-xl border bg-card/95 backdrop-blur p-4 shadow-xl transition-all ${
        selected ? "border-accent ring-2 ring-accent/40" : "border-border hover:border-accent/50"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="storyboard-in"
        className="!h-3 !w-3 !bg-emerald-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <div>
            <SlateLabel>2.39:1 Storyboard Frame</SlateLabel>
            <h4 className="text-xs font-bold text-foreground">Anamorphic Preview</h4>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] border-accent/40 text-accent bg-accent/10">
          Scope Lens
        </Badge>
      </div>

      {/* 2.39:1 Scope Visual Image Preview */}
      <div className="relative w-full aspect-[2.39/1] rounded-lg overflow-hidden border border-border shadow-inner bg-black">
        <Image
          src="/cinema/vault_heist.jpg"
          alt="The Vault Heist Scene 04 Storyboard Frame"
          fill
          className="object-cover"
          sizes="320px"
        />
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur font-mono text-[9px] text-accent border border-accent/30">
          REC · 00:34:00
        </div>
        <div className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur font-mono text-[9px] text-muted-foreground border border-border">
          {lens}
        </div>
      </div>

      <div className="pt-2 text-[10px] font-mono text-muted-foreground flex justify-between">
        <span>Grading: Cyan-Amber</span>
        <span className="text-accent">Atmosphere: Volumetric Haze</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="storyboard-out"
        className="!h-3 !w-3 !bg-accent !border-2 !border-background hover:!scale-125 transition-transform"
      />
    </div>
  );
}

// 6. 2D Floor Plan Stage Node
function FloorPlanCanvasNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`w-72 rounded-xl border bg-card/95 backdrop-blur p-4 shadow-xl transition-all ${
        selected ? "border-emerald-400 ring-2 ring-emerald-400/40" : "border-border hover:border-emerald-500/50"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="floorplan-in"
        className="!h-3 !w-3 !bg-emerald-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <div>
            <SlateLabel>Stage Blocking</SlateLabel>
            <h4 className="text-xs font-bold text-foreground">2D Floor Plan</h4>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-300 bg-emerald-500/10">
          3 Cameras
        </Badge>
      </div>

      {/* Mini Blueprint Schematic Visual */}
      <div className="h-24 w-full rounded border border-border/70 bg-black/80 p-1 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 200 80">
          <rect width="200" height="80" fill="#0c0d10" />
          {/* Safe door */}
          <rect x="15" y="15" width="10" height="50" fill="#2a2d33" stroke="#5fa88a" strokeWidth="1" />
          {/* Marcus */}
          <circle cx="65" cy="40" r="5" fill="#d4a054" />
          <text x="55" y="55" fill="#d4a054" fontSize="7" fontFamily="monospace">Marcus</text>
          {/* Elena */}
          <circle cx="115" cy="40" r="5" fill="#a855f7" />
          <text x="108" y="55" fill="#a855f7" fontSize="7" fontFamily="monospace">Elena</text>
          {/* Cam A */}
          <polygon points="160,40 115,30 115,50" fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" strokeWidth="0.8" />
          <circle cx="160" cy="40" r="4" fill="#06b6d4" />
          <text x="150" y="60" fill="#06b6d4" fontSize="7" fontFamily="monospace">Cam A</text>
        </svg>
      </div>

      <div className="pt-2 text-[10px] font-mono text-muted-foreground flex justify-between">
        <span>Sightline: 28°</span>
        <span className="text-emerald-400">Coverage: 100%</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="floorplan-out"
        className="!h-3 !w-3 !bg-emerald-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />
    </div>
  );
}

// 7. ClickHouse Event Sharder Node
function ClickHouseCanvasNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`w-80 rounded-xl border bg-card/95 backdrop-blur p-4 shadow-xl transition-all ${
        selected ? "border-emerald-400 ring-2 ring-emerald-400/40" : "border-border hover:border-emerald-500/50"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="ch-in-marcus"
        style={{ top: "30%" }}
        className="!h-3 !w-3 !bg-amber-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="ch-in-vis"
        style={{ top: "70%" }}
        className="!h-3 !w-3 !bg-emerald-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Database className="h-3.5 w-3.5" />
          </div>
          <div>
            <SlateLabel>ClickHouse Sharder</SlateLabel>
            <h4 className="text-xs font-bold text-foreground">Time-Gated Event Stream</h4>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] border-success/40 bg-success/15 text-success">
          1.4 ms
        </Badge>
      </div>

      <div className="p-2.5 rounded bg-black/80 border border-border/60 font-mono text-[10px] space-y-1">
        <div className="text-muted-foreground">ORDER BY (project, char, time)</div>
        <div className="text-success font-semibold">WHERE event_timestamp &lt;= 00:34:00</div>
        <div className="text-accent">Firewall: 100% Zero-Leak Enforced</div>
      </div>
    </div>
  );
}

// Register React Flow Node Types
const nodeTypes = {
  inspirationNode: InspirationCanvasNode,
  scriptNode: ScriptCanvasNode,
  marcusNode: MarcusCanvasNode,
  elenaNode: ElenaCanvasNode,
  storyboardNode: StoryboardCanvasNode,
  floorplanNode: FloorPlanCanvasNode,
  clickhouseNode: ClickHouseCanvasNode,
};

// ==========================================
// Pre-configured Blueprint Nodes & Edges
// ==========================================

const initialNodes: Node[] = [
  {
    id: "node-prompt",
    type: "inspirationNode",
    position: { x: 30, y: 160 },
    data: {},
  },
  {
    id: "node-script",
    type: "scriptNode",
    position: { x: 370, y: 120 },
    data: {},
  },
  {
    id: "node-marcus",
    type: "marcusNode",
    position: { x: 740, y: 20 },
    data: { paranoia: 85, sarcasm: 60 },
  },
  {
    id: "node-elena",
    type: "elenaNode",
    position: { x: 740, y: 260 },
    data: { poise: 95, deception: 90 },
  },
  {
    id: "node-storyboard",
    type: "storyboardNode",
    position: { x: 1080, y: 40 },
    data: { lens: "Panavision C-Series 40mm" },
  },
  {
    id: "node-floorplan",
    type: "floorplanNode",
    position: { x: 1080, y: 320 },
    data: {},
  },
  {
    id: "node-clickhouse",
    type: "clickhouseNode",
    position: { x: 1470, y: 170 },
    data: {},
  },
];

const initialEdges: Edge[] = [
  {
    id: "e-prompt-script",
    source: "node-prompt",
    sourceHandle: "prompt-out",
    target: "node-script",
    targetHandle: "script-in",
    animated: true,
    style: { stroke: "#06b6d4", strokeWidth: 2 },
    label: "Directing Logline",
    labelStyle: { fill: "#06b6d4", fontFamily: "monospace", fontSize: 10 },
  },
  {
    id: "e-script-marcus",
    source: "node-script",
    sourceHandle: "script-out-char",
    target: "node-marcus",
    targetHandle: "marcus-in",
    animated: true,
    style: { stroke: "#d4a054", strokeWidth: 2 },
    label: "Character Shard",
    labelStyle: { fill: "#d4a054", fontFamily: "monospace", fontSize: 10 },
  },
  {
    id: "e-script-elena",
    source: "node-script",
    sourceHandle: "script-out-char",
    target: "node-elena",
    targetHandle: "elena-in",
    animated: true,
    style: { stroke: "#a855f7", strokeWidth: 2 },
    label: "Character Shard",
    labelStyle: { fill: "#a855f7", fontFamily: "monospace", fontSize: 10 },
  },
  {
    id: "e-script-storyboard",
    source: "node-script",
    sourceHandle: "script-out-vis",
    target: "node-storyboard",
    targetHandle: "storyboard-in",
    animated: true,
    style: { stroke: "#5fa88a", strokeWidth: 2 },
    label: "Visual Cues",
    labelStyle: { fill: "#5fa88a", fontFamily: "monospace", fontSize: 10 },
  },
  {
    id: "e-script-floorplan",
    source: "node-script",
    sourceHandle: "script-out-vis",
    target: "node-floorplan",
    targetHandle: "floorplan-in",
    animated: true,
    style: { stroke: "#5fa88a", strokeWidth: 2 },
    label: "Stage Blocking",
    labelStyle: { fill: "#5fa88a", fontFamily: "monospace", fontSize: 10 },
  },
  {
    id: "e-marcus-clickhouse",
    source: "node-marcus",
    sourceHandle: "marcus-out",
    target: "node-clickhouse",
    targetHandle: "ch-in-marcus",
    animated: true,
    style: { stroke: "#d4a054", strokeWidth: 2 },
    label: "Memory Events",
    labelStyle: { fill: "#d4a054", fontFamily: "monospace", fontSize: 10 },
  },
  {
    id: "e-storyboard-clickhouse",
    source: "node-storyboard",
    sourceHandle: "storyboard-out",
    target: "node-clickhouse",
    targetHandle: "ch-in-vis",
    animated: true,
    style: { stroke: "#06b6d4", strokeWidth: 2 },
    label: "Event Telemetry",
    labelStyle: { fill: "#06b6d4", fontFamily: "monospace", fontSize: 10 },
  },
];

export function BacklotCanvasSimulator() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string>("node-storyboard");

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  return (
    <div id="canvas-backlot" className="w-full space-y-6 pt-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <SlateLabel>Unreal-Style Blueprint Canvas</SlateLabel>
          <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">
            Modular Visual Backlot Node Network
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
            A live node graph powered by <code className="text-accent font-mono text-[11px]">@xyflow/react</code>. Pan, zoom, and drag nodes to explore how screenplays wire into character DNA dials, 2.39:1 scope storyboards, and ClickHouse event shards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-xs font-mono py-1">
            7 Active Blueprint Nodes
          </Badge>
          <Badge variant="outline" className="border-border text-muted-foreground text-xs font-mono py-1 hidden sm:inline-flex">
            Interactive Drag &amp; Pan Enabled
          </Badge>
        </div>
      </div>

      {/* Real React Flow Canvas Wrapper */}
      <div className="relative w-full rounded-2xl border border-border bg-card/95 overflow-hidden shadow-2xl cinema-glow-cyan">
        {/* Canvas Toolbar Header */}
        <div className="h-12 border-b border-border bg-secondary/60 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Production Graph: The Vault Heist · Scene 04
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
              Quick Focus:
            </span>
            <div className="flex gap-1">
              {[
                { id: "node-script", label: "Master Script" },
                { id: "node-marcus", label: "Marcus DNA" },
                { id: "node-storyboard", label: "2.39:1 Storyboard" },
                { id: "node-clickhouse", label: "ClickHouse" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedNodeId(btn.id)}
                  className={`text-[11px] px-2.5 py-1 rounded font-mono transition-all ${
                    selectedNodeId === btn.id
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold"
                      : "bg-secondary/70 text-muted-foreground hover:text-foreground border border-border/60"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real ReactFlow Canvas */}
        <div className="relative w-full h-[580px] bg-[#0c0d10]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.2}
              color="#2a2d33"
            />
            <Controls
              className="!bg-card !border-border !rounded-lg !text-foreground !shadow-xl"
              showInteractive={false}
            />
            <MiniMap
              nodeStrokeColor="#2a2d33"
              nodeColor="#15171b"
              className="!bg-card/90 !border !border-border !rounded-lg !shadow-xl hidden md:block"
              maskColor="rgba(12, 13, 16, 0.75)"
            />
          </ReactFlow>
        </div>

        {/* Node Inspector Bottom Drawer */}
        <div className="p-3.5 bg-secondary/80 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Settings2 className="h-4 w-4 text-accent shrink-0" />
            <span className="text-muted-foreground font-mono">Selected Node:</span>
            <span className="font-heading font-bold text-foreground">
              {selectedNodeId === "node-prompt" && "Inspiration Directing Prompt Node"}
              {selectedNodeId === "node-script" && "Master Screenplay Node (Scene 04)"}
              {selectedNodeId === "node-marcus" && "Marcus Vance Character DNA & Paranoia Dials"}
              {selectedNodeId === "node-elena" && "Elena Ramos Character DNA & Syndicate Deal"}
              {selectedNodeId === "node-storyboard" && "2.39:1 Scope Visual Storyboard Frame"}
              {selectedNodeId === "node-floorplan" && "2D Stage Architectural Blocking Node"}
              {selectedNodeId === "node-clickhouse" && "ClickHouse Time-Gated Memory Sharder"}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-muted-foreground">Drag to rearrange · Scroll to zoom</span>
            <Badge variant="outline" className="border-success/40 text-success bg-success/10 text-[10px]">
              Live @xyflow/react Graph
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
