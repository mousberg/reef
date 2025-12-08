"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  Trash2,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ScheduledTask, cronToText } from "@/types/schedule";
import { Timestamp } from "firebase/firestore";

interface ScheduledTasksListProps {
  tasks: ScheduledTask[];
  onToggleEnabled: (taskId: string, enabled: boolean) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onRunNow?: (taskId: string) => Promise<void>;
  loading?: boolean;
}

export function ScheduledTasksList({
  tasks,
  onToggleEnabled,
  onDelete,
  onRunNow,
  loading = false,
}: ScheduledTasksListProps) {
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [processingTasks, setProcessingTasks] = useState<Set<string>>(
    new Set(),
  );

  const handleToggle = async (taskId: string, enabled: boolean) => {
    setProcessingTasks((prev) => new Set(prev).add(taskId));
    try {
      await onToggleEnabled(taskId, enabled);
    } finally {
      setProcessingTasks((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTaskId) return;

    setProcessingTasks((prev) => new Set(prev).add(deleteTaskId));
    try {
      await onDelete(deleteTaskId);
      setDeleteTaskId(null);
    } finally {
      setProcessingTasks((prev) => {
        const next = new Set(prev);
        next.delete(deleteTaskId);
        return next;
      });
    }
  };

  const handleRunNow = async (taskId: string) => {
    if (!onRunNow) return;

    setProcessingTasks((prev) => new Set(prev).add(taskId));
    try {
      await onRunNow(taskId);
    } finally {
      setProcessingTasks((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const formatTimestamp = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate();
      return format(date, "MMM d, yyyy HH:mm");
    } catch {
      return "-";
    }
  };

  const getScheduleText = (task: ScheduledTask) => {
    if (task.schedule.type === "once") {
      return task.schedule.runAt
        ? `Once on ${formatTimestamp(task.schedule.runAt)}`
        : "One-time";
    }

    if (task.schedule.type === "recurring" && task.schedule.cron) {
      return cronToText(task.schedule.cron);
    }

    return "Unknown";
  };

  const getStatusBadge = (task: ScheduledTask) => {
    if (!task.enabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }

    if (task.lastStatus === "running") {
      return (
        <Badge variant="default" className="bg-blue-500">
          <Clock className="mr-1 h-3 w-3" />
          Running
        </Badge>
      );
    }

    if (task.lastStatus === "success") {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Success
        </Badge>
      );
    }

    if (task.lastStatus === "failed") {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    }

    return <Badge variant="outline">Scheduled</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">
          Loading scheduled tasks...
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Scheduled Tasks</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Create a schedule to automatically run your workflows at specific
          times or intervals
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Enabled</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const isProcessing = processingTasks.has(task.id);

              return (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{task.workflowName}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {task.query}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{getScheduleText(task)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatTimestamp(task.nextRun)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatTimestamp(task.lastRun)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(task)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={task.enabled}
                      onCheckedChange={(checked) =>
                        handleToggle(task.id, checked)
                      }
                      disabled={isProcessing}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isProcessing}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onRunNow && (
                          <DropdownMenuItem
                            onClick={() => handleRunNow(task.id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Run Now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setDeleteTaskId(task.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteTaskId !== null}
        onOpenChange={(open) => !open && setDeleteTaskId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scheduled Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scheduled task? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
