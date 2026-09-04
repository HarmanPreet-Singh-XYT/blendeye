"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Film, Sparkles } from "lucide-react";

export interface NewProjectFormData {
  title: string;
  logline: string;
  genre: string;
  characters: string;
}

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NewProjectFormData) => void;
  isSubmitting?: boolean;
}

const GENRE_OPTIONS = [
  "Heist / Crime Thriller",
  "Sci-Fi / Space Horror",
  "Neon Noir / Detective",
  "Psychological Suspense",
  "Espionage / Cold War",
];

export function NewProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: NewProjectDialogProps) {
  const [title, setTitle] = React.useState("");
  const [logline, setLogline] = React.useState("");
  const [genre, setGenre] = React.useState(GENRE_OPTIONS[0]);
  const [characters, setCharacters] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !logline.trim() || isSubmitting) return;
    onSubmit({ title, logline, genre, characters });
    setTitle("");
    setLogline("");
    setCharacters("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border p-6 overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-accent" />
              <SlateLabel>Production Setup · New Slate</SlateLabel>
            </div>
            <DialogTitle className="text-lg font-heading tracking-tight">
              Launch a New Feature Film Production
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the premise, tone, and character roster. The writers&apos; room AI will draft the master scene and shard individual perspectives into ClickHouse.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Project / Film Title <span className="text-accent">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Horizon, The Iron Courier..."
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Genre & Cinematic Tone
              </label>
              <div className="flex flex-wrap gap-1.5">
                {GENRE_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                      genre === g
                        ? "border-accent bg-accent/15 text-accent font-medium"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Core Premise / Opening Scene Beat <span className="text-accent">*</span>
              </label>
              <textarea
                value={logline}
                onChange={(e) => setLogline(e.target.value)}
                placeholder="Describe the central conflict, who is in the room, and what secret is being concealed..."
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent resize-none text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Named Characters (Optional)
              </label>
              <Input
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                placeholder="e.g. Vance (Commander), Ray (Saboteur), Nora (Witness)"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!title.trim() || !logline.trim() || isSubmitting}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isSubmitting ? "Spinning Writers' Room..." : "Launch Production"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
