"use client";

import * as React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeletableEdgeData extends Record<string, unknown> {
  onDelete?: (id: string) => void;
  label?: string;
  relationType?: string;
}

const CHARACTER_RELATIONS = [
  "⚡ Friction",
  "🤝 Alliance",
  "⚔️ Rivalry",
  "🎓 Mentor",
  "🕵️ Suspicion",
];

export function DeletableEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const { deleteElements, setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = React.useState(false);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const isCharacterRelation =
    (source?.includes("core") || source?.includes("char")) &&
    (target?.includes("core") || target?.includes("char"));

  const [currentRelation, setCurrentRelation] = React.useState<string>(() => {
    if (data?.relationType) return data.relationType as string;
    if (isCharacterRelation) return CHARACTER_RELATIONS[0];
    return "";
  });

  // Determine semantic label based on connected node IDs
  const semanticLabel = React.useMemo(() => {
    if (data?.label) return data.label as string;
    if (isCharacterRelation) return currentRelation;
    if (source?.includes("clip")) return "🎨 Style Sync";
    if (source?.includes("note")) return "💡 Plot Seed";
    if (source?.includes("scene") && target?.includes("script")) return "📜 Screenplay";
    if (source?.includes("scene") && target?.includes("scene")) return "🎬 Cut Flow";
    if (target?.includes("storyboard")) return "🖼️ 2.39:1 Concept";
    if (target?.includes("floorplan")) return "📐 Camera Blocking";
    if (target?.includes("tension")) return "📈 Audience EKG";
    if (target?.includes("tableread")) return "🎙️ TTS Audio";
    if (target?.includes("market")) return "🌐 ClickHouse Intel";
    if (target?.includes("chemistry")) return "🧪 Casting Bench";
    if (source?.includes("act")) return "🎭 Actor Comp";
    if (source?.includes("dial")) return "🎛️ Dials Sync";
    if (source?.includes("quirk")) return "✨ Behavioral Tic";
    return "";
  }, [data, source, target, isCharacterRelation, currentRelation]);

  const handleCycleRelation = (e: React.MouseEvent) => {
    if (!isCharacterRelation) return;
    e.stopPropagation();
    const curIdx = CHARACTER_RELATIONS.indexOf(currentRelation);
    const nextRelation = CHARACTER_RELATIONS[(curIdx + 1) % CHARACTER_RELATIONS.length];
    setCurrentRelation(nextRelation);
    setEdges((eds) =>
      eds.map((ed) => {
        if (ed.id === id) {
          return {
            ...ed,
            data: { ...ed.data, relationType: nextRelation },
          };
        }
        return ed;
      })
    );
  };

  const handleDelete = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (typeof data?.onDelete === "function") {
        (data.onDelete as (edgeId: string) => void)(id);
      } else {
        deleteElements({ edges: [{ id }] });
      }
    },
    [id, data, deleteElements]
  );

  const isActive = selected || isHovered;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: isActive ? 2.5 : (style.strokeWidth || 1.8),
          stroke: selected
            ? "var(--accent)"
            : isHovered
            ? "color-mix(in oklch, var(--accent) 80%, white)"
            : isCharacterRelation
            ? "#ec4899"
            : style.stroke || "var(--border)",
          transition: "stroke 0.15s ease, stroke-width 0.15s ease",
        }}
        markerEnd={markerEnd}
        interactionWidth={36}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan z-20"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center gap-1">
            {/* Semantic Relationship Pill Badge */}
            {semanticLabel && (
              <div
                onClick={isCharacterRelation ? handleCycleRelation : undefined}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-mono shadow-md backdrop-blur transition-all select-none",
                  isCharacterRelation
                    ? "border-pink-500/40 bg-pink-950/80 text-pink-300 hover:scale-105 cursor-pointer hover:border-pink-400"
                    : "border-border/80 bg-card/90 text-muted-foreground",
                  isActive && "border-accent/60 text-foreground scale-105"
                )}
                title={
                  isCharacterRelation
                    ? "Click to cycle relationship dynamic (Friction, Alliance, Rivalry...)"
                    : semanticLabel
                }
              >
                <span>{semanticLabel}</span>
              </div>
            )}

            {/* Unlink Button */}
            <button
              type="button"
              onClick={handleDelete}
              className={cn(
                "flex items-center justify-center rounded-full border shadow-xl backdrop-blur transition-all duration-150 cursor-pointer",
                isActive
                  ? "h-5 w-5 border-rose-500/80 bg-card/95 text-rose-400 opacity-100 scale-100 ring-2 ring-rose-500/30 hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:scale-110"
                  : "h-3.5 w-3.5 border-border/60 bg-card/80 text-muted-foreground opacity-0 hover:opacity-100 hover:scale-110"
              )}
              title="Unlink connection (Click to disconnect wire)"
            >
              <X className="h-2.5 w-2.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
