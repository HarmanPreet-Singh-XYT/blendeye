"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlateLabel } from "@/components/cinema/slate-label";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Database,
  Sparkles,
  RefreshCw,
  Check,
  ArrowRight,
  Clock,
  HelpCircle,
  FileText,
  User,
  Zap,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { notifyIfFallback } from "@/lib/fallback-notice";
import type { ContinuityIssue, ContinuityCheckResponse } from "@/lib/agent-service";

interface ContinuityCheckerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  screenplayText: string;
  characters?: Array<{ name: string }>;
  scenes?: any[];
  onApplyFix?: (fixedSnippet: string, originalCitation: string) => void;
}

export function ContinuityCheckerDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  screenplayText,
  characters = [],
  scenes = [],
  onApplyFix,
}: ContinuityCheckerDialogProps) {
  const [data, setData] = React.useState<ContinuityCheckResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"all" | "knowledge_breach" | "timeline" | "dropped">("all");
  const [appliedFixes, setAppliedFixes] = React.useState<Record<string, boolean>>({});

  const runAudit = React.useCallback(async () => {
    if (!screenplayText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/continuity/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          screenplay_text: screenplayText,
          characters: characters.map((c) => c.name),
          scenes,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setData(result);
        notifyIfFallback(result, "Continuity Audit");
      } else {
        const detail = await res.text().catch(() => "");
        toast.add({
          title: "Continuity check failed",
          description: detail || `Status ${res.status}`,
          type: "error",
        });
      }
    } catch (err) {
      toast.add({
        title: "Continuity check failed",
        description: err instanceof Error ? err.message : "Could not reach the audit backend.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, screenplayText, characters, scenes]);

  // Run audit on first open if no data
  React.useEffect(() => {
    if (open && !data) {
      runAudit();
    }
  }, [open, data, runAudit]);

  const issues = data?.issues || [];
  const filteredIssues = issues.filter((issue) => {
    if (activeTab === "all") return true;
    if (activeTab === "knowledge_breach") return issue.issue_type === "knowledge_breach";
    if (activeTab === "timeline") return issue.issue_type === "timeline_inconsistency" || issue.issue_type === "logic_contradiction";
    if (activeTab === "dropped") return issue.issue_type === "dropped_thread";
    return true;
  });

  const score = data?.overall_continuity_score ?? 85;
  const scoreColor = score >= 85 ? "text-emerald-400" : score >= 70 ? "text-amber-400" : "text-rose-400";
  const scoreBg = score >= 85 ? "bg-emerald-500/10 border-emerald-500/30" : score >= 70 ? "bg-amber-500/10 border-amber-500/30" : "bg-rose-500/10 border-rose-500/30";

  const handleFix = (issue: ContinuityIssue) => {
    if (onApplyFix && issue.suggested_fix) {
      onApplyFix(issue.suggested_fix, issue.dialogue_citation);
      setAppliedFixes((prev) => ({ ...prev, [issue.id]: true }));
      toast.add({
        title: "Continuity fix applied",
        description: `Applied correction for ${issue.character}: "${issue.suggested_fix.slice(0, 50)}..."`,
        type: "success",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 border-border bg-card">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-accent" />
              <DialogTitle className="font-heading text-lg">
                ClickHouse Continuity &amp; Plot-Hole Auditor · {projectTitle}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] text-accent border-accent/40 gap-1">
                <Database className="h-3 w-3" />
                ClickHouse Knowledge Firewalls Active
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Gemini audits your screenplay against immutable character knowledge states in ClickHouse, flagging asymmetric information leaks, timeline paradoxes, and unresolved narrative threads.
          </DialogDescription>
        </DialogHeader>

        {/* Top Metric & Grounding Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-2">
          <div className={`p-3 rounded-lg border flex items-center justify-between ${scoreBg}`}>
            <div>
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                Continuity Score
              </span>
              <span className={`text-2xl font-bold font-mono ${scoreColor}`}>
                {score}/100
              </span>
            </div>
            <ShieldCheck className={`h-8 w-8 ${scoreColor} opacity-80`} />
          </div>

          <div className="p-3 rounded-lg border border-border bg-secondary/20 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">Total Issues Flagged</span>
            <span className="text-xl font-bold font-mono text-foreground">
              {data?.total_issues ?? 0} Contradictions
            </span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-secondary/20 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">ClickHouse Events</span>
            <span className="text-xl font-bold font-mono text-cyan-400">
              {data?.clickhouse_events_analyzed ?? 0} Timeline Facts
            </span>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-secondary/20 flex flex-col justify-center">
            <Button
              size="sm"
              onClick={runAudit}
              disabled={isLoading}
              className="w-full text-xs font-semibold gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>{isLoading ? "Auditing Script..." : "Re-Run Forensic Audit"}</span>
            </Button>
          </div>
        </div>

        {/* Verdict Summary */}
        {data?.verdict_summary && (
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs flex items-start gap-2.5">
            <Zap className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground text-xs">Executive Continuity Verdict:</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{data.verdict_summary}</p>
            </div>
          </div>
        )}

        {/* Issue Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "all" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            All Issues ({issues.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("knowledge_breach")}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "knowledge_breach" ? "bg-rose-500 text-white" : "text-rose-400 hover:bg-rose-500/10"
            }`}
          >
            Knowledge Breaches ({issues.filter((i) => i.issue_type === "knowledge_breach").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "timeline" ? "bg-amber-500 text-white" : "text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            Timeline &amp; Logic ({issues.filter((i) => i.issue_type === "timeline_inconsistency" || i.issue_type === "logic_contradiction").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dropped")}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "dropped" ? "bg-cyan-500 text-white" : "text-cyan-400 hover:bg-cyan-500/10"
            }`}
          >
            Dropped Threads ({issues.filter((i) => i.issue_type === "dropped_thread").length})
          </button>
        </div>

        {/* Issue Cards List */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
          {isLoading && (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin text-accent" />
              <span className="text-xs font-mono">Cross-referencing dialogue against ClickHouse story_events…</span>
            </div>
          )}

          {!isLoading && filteredIssues.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="h-7 w-7 text-emerald-400" />
              <span className="text-xs font-semibold text-foreground">Zero Continuity Violations Detected</span>
              <span className="text-[11px]">Character knowledge states perfectly respect asymmetric firewalls.</span>
            </div>
          )}

          {!isLoading &&
            filteredIssues.map((issue) => {
              const isApplied = appliedFixes[issue.id];
              const isCrit = issue.severity === "critical";
              const isWarn = issue.severity === "warning";
              const borderCls = isCrit
                ? "border-rose-500/40 bg-rose-500/5"
                : isWarn
                ? "border-amber-500/40 bg-amber-500/5"
                : "border-blue-500/40 bg-blue-500/5";

              return (
                <div key={issue.id} className={`p-3.5 rounded-lg border space-y-2 text-xs transition-all ${borderCls}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono uppercase ${
                          isCrit
                            ? "border-rose-500 text-rose-400"
                            : isWarn
                            ? "border-amber-500 text-amber-400"
                            : "border-blue-500 text-blue-400"
                        }`}
                      >
                        {issue.severity} · {issue.issue_type.replace("_", " ")}
                      </Badge>
                      <span className="font-semibold text-foreground font-mono">{issue.character}</span>
                      <span className="text-muted-foreground font-mono text-[10px]">• {issue.scene_ref}</span>
                    </div>
                    {isApplied && (
                      <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                        <Check className="h-3 w-3" /> Fix Applied
                      </span>
                    )}
                  </div>

                  {/* Offending Citation */}
                  {issue.dialogue_citation && (
                    <div className="rounded bg-background/80 p-2 border border-border/70 font-mono text-[11px] italic text-foreground">
                      {issue.dialogue_citation}
                    </div>
                  )}

                  {/* ClickHouse Contradiction Grounding */}
                  {issue.clickhouse_fact_contradicted && (
                    <div className="flex items-start gap-1.5 text-[11px] text-cyan-300/90 font-mono bg-cyan-950/20 p-2 rounded border border-cyan-500/20">
                      <Database className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-cyan-400 block text-[10px] uppercase">
                          ClickHouse Grounding Conflict:
                        </span>
                        <span>{issue.clickhouse_fact_contradicted}</span>
                      </div>
                    </div>
                  )}

                  <p className="text-muted-foreground text-[11px] leading-relaxed">{issue.explanation}</p>

                  {/* Suggested Fix and Action Button */}
                  {issue.suggested_fix && (
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/40">
                      <div className="text-[11px] text-foreground font-mono truncate flex-1">
                        <span className="text-emerald-400 font-semibold mr-1">Proposed Fix:</span>
                        <span className="text-muted-foreground">{issue.suggested_fix}</span>
                      </div>
                      {onApplyFix && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFix(issue)}
                          disabled={isApplied}
                          className="text-[11px] h-7 px-2.5 gap-1 shrink-0 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          <span>{isApplied ? "Applied" : "Apply Fix"}</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-3 border-t border-border text-[10px] font-mono text-muted-foreground">
          <span>ClickHouse Table: story_events (ENGINE = MergeTree)</span>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Close Inspector
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
