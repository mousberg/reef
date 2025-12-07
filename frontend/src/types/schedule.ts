import { Timestamp } from "firebase/firestore";

/**
 * Schedule type - defines when a task should run
 */
export interface Schedule {
  type: "once" | "recurring";
  cron?: string; // For recurring: cron expression (e.g., "0 9 * * *" for daily at 9am)
  runAt?: Timestamp; // For once: specific datetime to run
}

/**
 * Scheduled task stored in Firestore
 * Path: users/{userId}/projects/{projectId}/scheduledTasks/{taskId}
 */
export interface ScheduledTask {
  id: string;
  userId: string;
  projectId: string;
  workflowName: string;
  builtWorkflow: any; // Factory-ready workflow config
  query: string; // The task/question to execute
  schedule: Schedule;
  enabled: boolean;
  lastRun?: Timestamp;
  nextRun?: Timestamp;
  lastTraceId?: string;
  lastStatus?: "success" | "failed" | "running";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Task execution history record
 * Path: users/{userId}/taskExecutions/{executionId}
 */
export interface TaskExecution {
  id: string;
  taskId: string;
  projectId: string;
  workflowName: string;
  query: string;
  traceId?: string;
  status: "success" | "failed" | "running";
  error?: string;
  executedAt: Timestamp;
}

/**
 * Form data for creating/editing a scheduled task
 */
export interface ScheduledTaskFormData {
  workflowName: string;
  query: string;
  scheduleType: "once" | "recurring";
  runAt?: Date; // For one-time tasks
  cronExpression?: string; // For recurring tasks
  enabled: boolean;
}

/**
 * Common cron expressions for quick selection
 */
export const CRON_PRESETS = {
  "Every 15 minutes": "*/15 * * * *",
  "Every 30 minutes": "*/30 * * * *",
  "Every hour": "0 * * * *",
  "Every 6 hours": "0 */6 * * *",
  "Daily at 9 AM": "0 9 * * *",
  "Daily at 6 PM": "0 18 * * *",
  "Weekly on Monday at 9 AM": "0 9 * * 1",
  "Monthly on 1st at 9 AM": "0 9 1 * *",
} as const;

/**
 * Helper to parse cron expression into human-readable text
 */
export function cronToText(cron: string): string {
  const preset = Object.entries(CRON_PRESETS).find(
    ([, value]) => value === cron
  );
  if (preset) return preset[0];

  // Simple cron parser for display
  const parts = cron.split(" ");
  if (parts.length !== 5) return cron;

  const [minute, hour, day, month, dayOfWeek] = parts;

  if (minute.startsWith("*/")) {
    const interval = minute.substring(2);
    return `Every ${interval} minutes`;
  }

  if (hour.startsWith("*/")) {
    const interval = hour.substring(2);
    return `Every ${interval} hours`;
  }

  if (day === "*" && month === "*" && dayOfWeek === "*") {
    return `Daily at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }

  return cron; // Fallback to raw cron
}
