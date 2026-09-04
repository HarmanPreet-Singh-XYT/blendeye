import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FilmstripLoader — a horizontal strip of frame cells with a traveling
 * highlight, referencing film advancing through a projector gate. Use in
 * place of a generic Spinner wherever the product is actively generating
 * (script generation, sharding, storyboard frames) — functional progress
 * indicator, not decoration.
 */
function FilmstripLoader({
  frames = 8,
  className,
  label,
}: {
  frames?: number;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-[3px] rounded-md border border-border bg-secondary/40 p-[3px]">
        {Array.from({ length: frames }).map((_, i) => (
          <div
            key={i}
            className="h-6 flex-1 rounded-[2px] bg-muted"
            style={{
              animation: `filmstrip-pulse 1.4s ease-in-out infinite`,
              animationDelay: `${(i / frames) * 1.4}s`,
            }}
          />
        ))}
      </div>
      {label && (
        <span className="slate-label">{label}</span>
      )}
      <style>{`
        @keyframes filmstrip-pulse {
          0%, 100% { background-color: var(--muted); }
          50% { background-color: var(--accent); }
        }
      `}</style>
    </div>
  );
}

export { FilmstripLoader };
