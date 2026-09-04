"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SlateLabel } from "@/components/cinema/slate-label";

interface ScreenplayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  summary?: string;
  screenplayText: string;
}

export function ScreenplayDialog({
  open,
  onOpenChange,
  title,
  summary,
  screenplayText,
}: ScreenplayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-5 border-b border-border bg-secondary/30">
          <div className="flex flex-col gap-1">
            <SlateLabel>Production Screenplay · Master Script</SlateLabel>
            <DialogTitle className="text-xl font-heading">{title}</DialogTitle>
            {summary && (
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {summary}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-background font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-accent/30 selection:text-accent-foreground text-foreground/90">
          {screenplayText || "No screenplay generated yet."}
        </div>
      </DialogContent>
    </Dialog>
  );
}
