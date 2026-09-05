"use client";

import * as React from "react";
import { SlateLabel } from "@/components/cinema/slate-label";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Database, X, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  className?: string;
}

export function ClickHouseInspector({
  logs,
  lastSql,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose,
  className,
}: ClickHouseInspectorProps) {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (isControlled && controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const handleCopySql = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!isOpen && isControlled) {
    return null;
  }

  return (
    <div
      className={cn(
        "border-t border-border bg-card/98 backdrop-blur-md shadow-2xl transition-all duration-300 overflow-hidden shrink-0 z-30",
        isOpen ? "h-64" : "h-10",
        className
      )}
    >
      {/* ClickHouse Header bar */}
      <div className="w-full h-10 px-4 flex items-center justify-between border-b border-border/60 bg-secondary/20">
        <div
          onClick={handleToggle}
          className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
        >
          <Database className="h-3.5 w-3.5 text-accent shrink-0" />
          <SlateLabel>ClickHouse Story Event Engine</SlateLabel>
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] h-4 py-0 px-1.5 font-mono"
          >
            Live · story_events
          </Badge>
          {lastSql && (
            <span className="hidden md:inline font-mono text-[11px] text-muted-foreground truncate max-w-md">
              {lastSql.replace(/\s+/g, " ").slice(0, 70)}...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-[11px] text-muted-foreground">
            {logs.length} {logs.length === 1 ? "query" : "queries"} executed
          </span>
          <button
            type="button"
            onClick={handleToggle}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer ml-1"
              title="Close Telemetry Panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Query Log Feed */}
      {isOpen && (
        <div className="h-[calc(100%-2.5rem)] overflow-y-auto p-3 space-y-2 bg-background/50 font-mono text-xs select-text">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs">
              No queries logged yet. Scrub the timeline or interrogate a character in Plan mode to see live ClickHouse queries.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors space-y-1 group relative"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-accent/20 text-accent font-semibold font-mono">
                      {log.type}
                    </span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.durationMs !== undefined && (
                      <span className="text-emerald-400 font-semibold font-mono">{log.durationMs}ms</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopySql(log.id, log.sql)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-opacity cursor-pointer"
                      title="Copy SQL Query"
                    >
                      {copiedId === log.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <pre className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[11px] select-all font-mono">
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
