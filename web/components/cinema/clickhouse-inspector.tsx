"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Database } from "lucide-react";

export interface ClickHouseQueryLog {
  id: string;
  timestamp: string;
  sql: string;
  durationMs?: number;
  type: "scrub" | "interrogate" | "insert" | "events" | "precedents";
}

interface ClickHouseInspectorProps {
  logs: ClickHouseQueryLog[];
  lastSql?: string;
  className?: string;
}

export function ClickHouseInspector({
  logs,
  lastSql,
  className,
}: ClickHouseInspectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div
      className={`rounded-xl border border-border bg-card/95 backdrop-blur shadow-xl transition-all duration-300 overflow-hidden ${
        isOpen ? "h-64" : "h-11"
      } ${className ?? ""}`}
    >
      {/* ClickHouse Header bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-4 flex items-center justify-between border-b border-border/60 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Database className="h-4 w-4 text-accent" />
          <SlateLabel>ClickHouse Story Event Engine</SlateLabel>
          <Badge
            variant="outline"
            className="border-success/40 bg-success/10 text-success text-[10px] h-5 py-0 px-2"
          >
            Live · story_events
          </Badge>
          {lastSql && (
            <span className="hidden md:inline font-mono text-[11px] text-muted-foreground truncate max-w-md">
              {lastSql.replace(/\s+/g, " ").slice(0, 70)}...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {logs.length} {logs.length === 1 ? "query" : "queries"} executed
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Query Log Feed */}
      {isOpen && (
        <div className="h-[calc(100%-2.75rem)] overflow-y-auto p-3 space-y-2 bg-background/50 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No queries logged yet. Scrub the timeline or interrogate a character to see live ClickHouse telemetry.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-accent/20 text-accent font-semibold">
                      {log.type}
                    </span>
                    <span>{log.timestamp}</span>
                  </div>
                  {log.durationMs !== undefined && (
                    <span className="text-success font-semibold">{log.durationMs}ms</span>
                  )}
                </div>
                <pre className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[11px] select-all">
                  {log.sql}
                </pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
