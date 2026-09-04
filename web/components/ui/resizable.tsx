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
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "group relative flex items-center justify-center bg-border/70 transition-all hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent select-none",
        // Horizontal divider (separates top and bottom rows)
        "aria-[orientation=horizontal]:h-2 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize aria-[orientation=horizontal]:after:absolute aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:-top-1.5 aria-[orientation=horizontal]:after:-bottom-1.5",
        // Vertical divider (separates left and right columns)
        "aria-[orientation=vertical]:w-2 aria-[orientation=vertical]:h-full aria-[orientation=vertical]:cursor-col-resize aria-[orientation=vertical]:after:absolute aria-[orientation=vertical]:after:inset-y-0 aria-[orientation=vertical]:after:-left-1.5 aria-[orientation=vertical]:after:-right-1.5",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-20 flex items-center justify-center rounded-sm bg-secondary border border-border px-1 py-0.5 shadow-sm transition-transform group-hover:scale-110 group-hover:border-accent">
          {/* Grip pill that adjusts orientation */}
          <div className="h-1 w-6 rounded-full bg-muted-foreground/70 group-hover:bg-accent-foreground [[aria-orientation=vertical]_&]:h-6 [[aria-orientation=vertical]_&]:w-1" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
