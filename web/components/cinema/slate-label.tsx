import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SlateLabel — a corner burn-in tag like a production slate or workprint
 * frame counter. Use on FilmCard headers, generated media, and anywhere
 * that benefits from reading as "this came out of a real production
 * pipeline" (e.g. "SCENE 04 / TAKE 2", "FRAME 0142").
 */
function SlateLabel({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span className={cn("slate-label", className)} {...props}>
      {children}
    </span>
  );
}

export { SlateLabel };
