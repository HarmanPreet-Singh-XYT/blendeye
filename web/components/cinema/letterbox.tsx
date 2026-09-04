import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Letterbox — true 2.39:1 scope framing for media surfaces (storyboards,
 * scene previews, generated frames). Use for anything that IS the visual
 * content of the film, not for UI chrome — AspectRatio (shadcn) is still
 * the right primitive for non-cinematic layout boxes.
 */
function Letterbox({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("letterbox", className)} {...props}>
      {children}
    </div>
  );
}

export { Letterbox };
