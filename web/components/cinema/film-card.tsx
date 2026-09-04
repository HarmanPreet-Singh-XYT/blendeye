import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * FilmCard — the signature surface for scene/script/character nodes.
 * A Card with sprocket-perforated top/bottom edges and faint film grain,
 * referencing a physical film cell. Use this instead of bare Card for
 * anything that represents a piece of the production (scenes, characters,
 * storyboard frames) — reserve plain Card for incidental UI chrome.
 */
function FilmCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn("sprocket-edge film-grain py-6", className)}
      {...props}
    />
  );
}

export { FilmCard };
