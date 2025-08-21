"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KanbanTask } from "../utils/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTaskStore } from "../utils/store";
import AiTaskModal from "../AiTaskModal";
import { Confetti } from "@/components/magicui/confetti";
import EditTaskDialog from "./EditTaskDialog";
import { DragHeader } from "./card/components/DragHeader";
import { AssignmentSelect } from "./card/components/AssignmentSelect";
import { LeadInfo } from "./card/components/LeadInfo";
import { Attachments } from "./card/components/Attachments";
import { Media } from "./card/components/Media";
import { AiHeaderControls } from "./card/components/AiHeaderControls";
import { AiStatusBar } from "./card/components/AiStatusBar";

const priorityBadgeVariant = {
	low: "outline",
	medium: "default",
	high: "destructive",
} as const;

interface TaskCardProps {
	task: KanbanTask;
	isOverlay?: boolean;
}

export type TaskType = "Task";
export interface TaskDragData {
  type: TaskType;
  task: KanbanTask;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const [assignedTeamMember, setAssignedTeamMember] = useState(
    task.assignedToTeamMember || "",
  );
  const [aiOpen, setAiOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevStatus = useRef(task.status);
  const confettiKey = useMemo(() => `kanban_confetti_${task.id}`, [task.id]);

  const {
    runAi,
    retryAi,
    cancelAi,
    requireOAuth,
    resolveOAuth,
    setAiBlocked,
    removeTask,
  } = useTaskStore();

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task } satisfies TaskDragData,
    attributes: { roleDescription: "Task" },
  });

  const style = { transition, transform: CSS.Translate.toString(transform) } as const;

  const variants = cva("", {
    variants: {
      dragging: { over: "ring-2 opacity-30", overlay: "ring-2 ring-primary" },
    },
  });

  const handleAssign = (val: string) => {
    setAssignedTeamMember(val);
    task.assignedToTeamMember = val;
  };

  const aiState = task.aiState || "pending";
  // Ticking clock while running to update elapsed/ETA in tooltip
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (aiState !== "running") return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [aiState]);
  // force re-render while running to update elapsed/ETA in header tooltip
  useMemo(() => tick, [tick]);
  const aiBadge = useMemo(() => {
    switch (aiState) {
      case "running":
        return { label: "AI • Running", variant: "default" as const };
      case "success":
        return { label: "AI • Success", variant: "secondary" as const };
      case "failed":
        return { label: "AI • Failed", variant: "destructive" as const };
      case "blocked":
        return { label: "AI • Blocked", variant: "outline" as const };
      case "requires_oauth":
        return { label: "AI • Connect", variant: "outline" as const };
      case "pending":
      default:
        return { label: "AI • Pending", variant: "outline" as const };
    }
  }, [aiState]);

  // Trigger confetti when status transitions into DONE
  useEffect(() => {
    const was = prevStatus.current;
    const now = task.status;
    if (was !== "DONE" && now === "DONE") {
      // Respect reduced motion
      if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        prevStatus.current = now;
        try {
          localStorage.setItem(confettiKey, "1");
        } catch {}
        return;
      }
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1200);
      try {
        localStorage.setItem(confettiKey, "1");
      } catch {}
      return () => clearTimeout(t);
    }
    prevStatus.current = now;
  }, [task.status, confettiKey]);

  // On first view of a task already in DONE, show confetti once (then remember)
  useEffect(() => {
    if (task.status !== "DONE") return;
    let alreadyShown = false;
    try {
      alreadyShown = localStorage.getItem(confettiKey) === "1";
    } catch {}
    if (!alreadyShown) {
      if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        try {
          localStorage.setItem(confettiKey, "1");
        } catch {}
        return;
      }
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1200);
      try {
        localStorage.setItem(confettiKey, "1");
      } catch {}
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${variants({ dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined })} relative`}
    >
      <DragHeader
        attributes={attributes as any}
        listeners={listeners}
        onEdit={() => setEditOpen(true)}
        onDelete={() => removeTask(String(task.id))}
        aiControls={
          task.mcpWorkflow ? (
            <AiHeaderControls
              task={task}
              aiState={aiState}
              aiBadge={aiBadge}
              onOpen={() => setAiOpen(true)}
              onCancel={() => cancelAi(task.id)}
              onRetry={() => retryAi(task.id)}
            />
          ) : null
        }
      />

      <CardContent className="whitespace-pre-wrap px-3 pt-3 pb-6 text-left">
        <div className="font-semibold text-lg">{task.title}</div>
        {task.description && (
          <div className="mt-2 text-muted-foreground text-sm">
            {task.description}
          </div>
        )}

        {task.priority && (
          <div className="mt-2 text-sm">
            <span className="font-semibold">Priority: </span>
            <Badge
              variant={priorityBadgeVariant[task.priority] || "outline"}
              className="ml-2"
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </div>
        )}

        {task.dueDate && (
          <div className="mt-2 text-sm">
            <span className="font-semibold">Due Date: </span>
            <span className="text-muted-foreground">{task.dueDate}</span>
          </div>
        )}

        <LeadInfo task={task} />

        <AssignmentSelect value={assignedTeamMember} onChange={handleAssign} />

        <Attachments attachments={task.attachments} />
        <Media youtubeUrl={task.youtubeUrl} outputVideoUrl={task.outputVideoUrl} />

        <AiStatusBar
          task={task}
          aiState={aiState}
          onRun={() => runAi(task.id)}
          onCancel={() => cancelAi(task.id)}
          onRetry={() => retryAi(task.id)}
          onResolveOAuth={() => resolveOAuth(task.id)}
          onProvide={() => setAiOpen(true)}
        />
      </CardContent>
      {task.mcpWorkflow && (
        <AiTaskModal task={task} open={aiOpen} onOpenChange={setAiOpen} />
      )}
      <EditTaskDialog
        task={task}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      {showConfetti && (
        <Confetti
          className="pointer-events-none absolute inset-0 z-[60] h-full w-full"
          options={{ particleCount: 60, ticks: 120 }}
          globalOptions={{ useWorker: true, resize: true }}
        />
      )}
    </Card>
  );
}
