"use client";

import { Button } from "@/components/ui/button";
import type { KanbanTask } from "../../../utils/types";
import { AlertTriangle, RefreshCw, XCircle } from "lucide-react";

export function AiStatusBar({
  task,
  aiState,
  onRun,
  onCancel,
  onRetry,
  onResolveOAuth,
  onProvide,
}: {
  task: KanbanTask;
  aiState?: string;
  onRun: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onResolveOAuth: () => void;
  onProvide: () => void;
}) {
  if (!task.mcpWorkflow) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
      {aiState === "running" && (
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      )}

      {aiState === "failed" && (
        <div className="inline-flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-2 py-1 text-destructive">
          <XCircle className="h-4 w-4" />
          <span>{task.aiErrorMessage || "Workflow failed"}</span>
          <Button size="sm" className="ml-2 h-7 px-2 inline-flex items-center gap-1" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 shrink-0" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {aiState === "blocked" && (
        <div className="inline-flex items-center gap-2 rounded border border-amber-400/40 bg-amber-50 px-2 py-1 text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Missing: {(task.aiMissingParams || []).join(", ") || "required parameters"}
          </span>
          <Button size="sm" variant="outline" className="ml-2 h-7 px-2" onClick={onProvide}>
            Provide
          </Button>
          <Button size="sm" className="ml-1 h-7 px-2 inline-flex items-center gap-1" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 shrink-0" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {aiState === "requires_oauth" && (
        <div className="inline-flex items-center gap-2 rounded border border-amber-400/40 bg-amber-50 px-2 py-1 text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          <span>Authorization required</span>
          <Button size="sm" variant="outline" className="ml-2 h-7 px-2" onClick={onResolveOAuth}>
            Connect
          </Button>
          <Button size="sm" className="ml-1 h-7 px-2 inline-flex items-center gap-1" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 shrink-0" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {(aiState === "pending" || aiState === undefined) && (
        <Button size="sm" onClick={onRun}>
          Run
        </Button>
      )}
    </div>
  );
}
