"use client";

import * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  resizeTargetMinimumSize = { coarse: 28, fine: 16 },
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      resizeTargetMinimumSize={resizeTargetMinimumSize}
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

function normalizeSize(size: number | string | undefined): number | string | undefined {
  if (size === undefined) return undefined;
  if (typeof size === "number") {
    // In shadcn conventions, size numbers between 0 and 100 represent percentages.
    // In react-resizable-panels v4, numbers are interpreted as raw pixels unless given '%'.
    return size <= 100 ? `${size}%` : `${size}px`;
  }
  return size;
}

function ResizablePanel({
  defaultSize,
  minSize,
  maxSize,
  collapsedSize,
  ...props
}: ResizablePrimitive.PanelProps) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      defaultSize={normalizeSize(defaultSize)}
      minSize={normalizeSize(minSize)}
      maxSize={normalizeSize(maxSize)}
      collapsedSize={normalizeSize(collapsedSize)}
      {...props}
    />
  );
}

function ResizableHandle({
  withHandle = true,
  className,
  onPointerDown,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
}) {
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Acquire pointer capture immediately to prevent dragging events from being lost or hijacked by canvas / nodes
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // Disable text selection and prevent dragging side-effects on window
    const originalUserSelect = document.body.style.userSelect;
    const originalWebkitUserSelect = document.body.style.webkitUserSelect;
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    const cleanUp = () => {
      document.body.style.userSelect = originalUserSelect;
      document.body.style.webkitUserSelect = originalWebkitUserSelect;
      window.removeEventListener("pointerup", cleanUp);
      window.removeEventListener("pointercancel", cleanUp);
    };
    window.addEventListener("pointerup", cleanUp);
    window.addEventListener("pointercancel", cleanUp);

    onPointerDown?.(e);
  };

  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      onPointerDown={handlePointerDown}
      className={cn(
        "group relative flex items-center justify-center bg-border/80 transition-colors z-20 select-none touch-none",
        "hover:bg-accent/80 active:bg-accent data-[separator=active]:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
        // Horizontal divider (separates top rows from bottom dock)
        "[&[aria-orientation=horizontal]]:h-2 [&[aria-orientation=horizontal]]:w-full [&[aria-orientation=horizontal]]:cursor-row-resize",
        "[&[aria-orientation=horizontal]]:before:absolute [&[aria-orientation=horizontal]]:before:-top-2 [&[aria-orientation=horizontal]]:before:-bottom-2 [&[aria-orientation=horizontal]]:before:inset-x-0 [&[aria-orientation=horizontal]]:before:z-10",
        // Vertical divider (separates canvas from sidebar)
        "[&[aria-orientation=vertical]]:w-2 [&[aria-orientation=vertical]]:h-full [&[aria-orientation=vertical]]:cursor-col-resize",
        "[&[aria-orientation=vertical]]:before:absolute [&[aria-orientation=vertical]]:before:-left-2 [&[aria-orientation=vertical]]:before:-right-2 [&[aria-orientation=vertical]]:before:inset-y-0 [&[aria-orientation=vertical]]:before:z-10",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="pointer-events-none z-30 flex items-center justify-center rounded-sm bg-secondary border border-border px-1.5 py-0.5 shadow-sm transition-transform group-hover:scale-110 group-hover:border-accent">
          {/* Grip indicator: 3 dots aligned according to orientation */}
          <div className="flex items-center gap-0.5 [[aria-orientation=vertical]_&]:flex-col">
            <span className="h-1 w-1 rounded-full bg-muted-foreground/70 group-hover:bg-accent-foreground" />
            <span className="h-1 w-1 rounded-full bg-muted-foreground/70 group-hover:bg-accent-foreground" />
            <span className="h-1 w-1 rounded-full bg-muted-foreground/70 group-hover:bg-accent-foreground" />
          </div>
        </div>
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
