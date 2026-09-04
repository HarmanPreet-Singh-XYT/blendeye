"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "@/components/cinema/graph-nodes";

/**
 * StoryCanvas — the node graph's themed shell. React Flow ships a light,
 * generic-flowchart default look (white controls, blue selection, gray
 * dashed edges); every one of those is overridden here so the canvas reads
 * as part of the same production tool as the rest of the app, not an
 * embedded third-party widget.
 *
 * Edge styling: an animated dash on `generating` edges (data flowing into
 * a node that's actively producing output) vs. a solid accent-muted line
 * once settled — the edge state doubles as a lightweight progress signal
 * across the whole graph, not just within one node.
 */
function StoryCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  extraNodeTypes,
  children,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: React.ComponentProps<typeof ReactFlow>["onNodesChange"];
  onEdgesChange?: React.ComponentProps<typeof ReactFlow>["onEdgesChange"];
  onConnect?: React.ComponentProps<typeof ReactFlow>["onConnect"];
  onNodeClick?: React.ComponentProps<typeof ReactFlow>["onNodeClick"];
  extraNodeTypes?: NodeTypes;
  children?: React.ReactNode;
}) {
  return (
    <div className="story-canvas relative h-full w-full overflow-hidden rounded-xl border border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={{ ...nodeTypes, ...extraNodeTypes }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "var(--border)", strokeWidth: 1.5 },
        }}
        fitView
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border)"
        />
        <Controls
          showInteractive={false}
          className="!rounded-lg !border !border-border !bg-card !shadow-lg [&_button]:!border-border [&_button]:!bg-card [&_button]:!fill-foreground [&_button:hover]:!bg-secondary"
        />
        <MiniMap
          pannable
          zoomable
          className="!rounded-lg !border !border-border !bg-card"
          maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
          nodeColor="var(--muted)"
          nodeStrokeColor="var(--border)"
        />
        {children}
      </ReactFlow>

      {/* Edge / handle theming that React Flow doesn't expose as props */}
      <style>{`
        .story-canvas .react-flow__edge-path {
          stroke: var(--border);
        }
        .story-canvas .react-flow__edge.selected .react-flow__edge-path,
        .story-canvas .react-flow__edge:hover .react-flow__edge-path {
          stroke: var(--accent);
        }
        .story-canvas .react-flow__edge.generating .react-flow__edge-path {
          stroke: var(--accent);
          stroke-dasharray: 4 3;
          animation: story-canvas-flow 0.6s linear infinite;
        }
        @keyframes story-canvas-flow {
          to { stroke-dashoffset: -7; }
        }
        .story-canvas .react-flow__attribution { display: none; }
      `}</style>
    </div>
  );
}

export { StoryCanvas };
