"use client";

import * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle = true,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "group relative flex items-center justify-center bg-border/80 transition-colors z-20 select-none",
        "hover:bg-accent/80 active:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
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
