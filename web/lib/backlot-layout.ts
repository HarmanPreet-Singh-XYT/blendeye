import type { Node } from "@xyflow/react";

export type ProductionLane =
  | "ingestion"
  | "characters"
  | "screenplay"
  | "director"
  | "distribution"
  | "extra";

export interface LaneConfig {
  id: ProductionLane;
  title: string;
  x: number;
  nodeTypes: string[];
}

export const PRODUCTION_LANES: LaneConfig[] = [
  {
    id: "ingestion",
    title: "1. Ingestion & Sources",
    x: 60,
    nodeTypes: ["clip", "note", "pdf"],
  },
  {
    id: "characters",
    title: "2. Character Lab",
    x: 460,
    nodeTypes: ["actor", "personality", "quirks", "characterCore"],
  },
  {
    id: "screenplay",
    title: "3. Screenplay & Dynamics",
    x: 880,
    nodeTypes: ["scene", "script", "chemistry"],
  },
  {
    id: "director",
    title: "4. Director Suite & Staging",
    x: 1300,
    nodeTypes: ["floorplan", "storyboard", "tensionCurve"],
  },
  {
    id: "distribution",
    title: "5. Distribution & Screening",
    x: 1720,
    nodeTypes: ["tableRead", "market"],
  },
];

export function autoTidyBacklot(nodes: Node[]): Node[] {
  const laneBuckets: Record<string, Node[]> = {
    ingestion: [],
    characters: [],
    screenplay: [],
    director: [],
    distribution: [],
    extra: [],
  };

  // Classify each node into its lane
  for (const node of nodes) {
    const nodeType = node.type || "note";
    const foundLane = PRODUCTION_LANES.find((l) => l.nodeTypes.includes(nodeType));
    if (foundLane) {
      laneBuckets[foundLane.id].push(node);
    } else {
      laneBuckets.extra.push(node);
    }
  }

  const updatedNodes: Node[] = [];

  // Arrange each lane in neat vertical stacks
  PRODUCTION_LANES.forEach((lane) => {
    const laneNodes = laneBuckets[lane.id];
    let currentY = 80;
    for (const n of laneNodes) {
      updatedNodes.push({
        ...n,
        position: {
          x: lane.x,
          y: currentY,
        },
      });
      // Spacing per node
      currentY += 230;
    }
  });

  // Handle any uncategorized nodes in an extra column
  if (laneBuckets.extra.length > 0) {
    let currentY = 80;
    for (const n of laneBuckets.extra) {
      updatedNodes.push({
        ...n,
        position: {
          x: 2140,
          y: currentY,
        },
      });
      currentY += 230;
    }
  }

  return updatedNodes;
}
