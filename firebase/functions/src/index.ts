import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Scheduled task interface matching Firestore schema
 */
interface ScheduledTask {
  id: string;
  userId: string;
  projectId: string;
  workflowName: string;
  builtWorkflow: any;
  query: string;
  schedule: {
    type: "once" | "recurring";
    cron?: string; // For recurring: cron expression
    runAt?: admin.firestore.Timestamp; // For once: specific datetime
  };
  enabled: boolean;
  lastRun?: admin.firestore.Timestamp;
  nextRun?: admin.firestore.Timestamp;
  lastTraceId?: string;
  lastStatus?: "success" | "failed" | "running";
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

/**
 * Parse cron expression to get next run time
 * Simple implementation for common patterns
 */
function getNextRunTime(cronExpression: string, lastRun?: Date): Date {
  const now = lastRun || new Date();
  const parts = cronExpression.split(" ");

  // Simple cron parser for common patterns
  // Format: minute hour day month dayOfWeek
  // Examples:
  // "0 9 * * *" = Daily at 9:00 AM
  // "0 */6 * * *" = Every 6 hours
  // "*/15 * * * *" = Every 15 minutes

  const [minute, hour, day, month, dayOfWeek] = parts;

  const next = new Date(now);

  // Handle minute interval
  if (minute.startsWith("*/")) {
    const interval = parseInt(minute.substring(2));
    next.setMinutes(Math.ceil(next.getMinutes() / interval) * interval);
    next.setSeconds(0);
    next.setMilliseconds(0);
    return next;
  }

  // Handle hour interval
  if (hour.startsWith("*/")) {
    const interval = parseInt(hour.substring(2));
    next.setHours(Math.ceil(next.getHours() / interval) * interval);
    next.setMinutes(parseInt(minute) || 0);
    next.setSeconds(0);
    next.setMilliseconds(0);
    return next;
  }

  // Handle daily schedule
  if (day === "*" && month === "*" && dayOfWeek === "*") {
    next.setHours(parseInt(hour) || 0);
    next.setMinutes(parseInt(minute) || 0);
    next.setSeconds(0);
    next.setMilliseconds(0);

    // If time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  // Default: add 5 minutes (fallback)
  next.setMinutes(next.getMinutes() + 5);
  return next;
}

/**
 * Calculate next run time based on schedule
 */
function calculateNextRun(task: ScheduledTask): Date | null {
  if (!task.enabled) return null;

  if (task.schedule.type === "once") {
    if (task.schedule.runAt) {
      const runAt = task.schedule.runAt.toDate();
      // Only return if in the future
      return runAt > new Date() ? runAt : null;
    }
    return null;
  }

  if (task.schedule.type === "recurring" && task.schedule.cron) {
    return getNextRunTime(
      task.schedule.cron,
      task.lastRun?.toDate()
    );
  }

  return null;
}

/**
 * Execute a workflow by calling the Coral Factory API
 */
async function executeWorkflow(
  task: ScheduledTask
): Promise<{ success: boolean; traceId?: string; error?: string }> {
  try {
    const factoryUrl = process.env.FACTORY_URL ||
      "https://coral-factory-540229907345.europe-west1.run.app";
    const factoryToken = process.env.FACTORY_TOKEN;

    if (!factoryToken) {
      throw new Error("FACTORY_TOKEN environment variable not set");
    }

    console.log(`Executing workflow for task ${task.id}`);

    const response = await fetch(
      `${factoryUrl}/run/workflow/local`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${factoryToken}`,
        },
        body: JSON.stringify({
          workflow_config: task.builtWorkflow,
          user_id: task.userId,
          user_task: task.query,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Factory API error: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      traceId: result.trace_id,
    };
  } catch (error) {
    console.error(`Error executing workflow for task ${task.id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Process scheduled tasks that are due to run
 * This function is triggered by Cloud Scheduler every 5 minutes
 */
export const processScheduledTasks = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes max
    memory: "512MB",
  })
  .https.onRequest(async (req, res) => {
    try {
      console.log("Processing scheduled tasks...");

      const now = admin.firestore.Timestamp.now();
      const nowDate = now.toDate();

      // Query all enabled tasks across all users
      const tasksSnapshot = await db
        .collectionGroup("scheduledTasks")
        .where("enabled", "==", true)
        .get();

      if (tasksSnapshot.empty) {
        console.log("No enabled scheduled tasks found");
        res.status(200).json({
          success: true,
          message: "No tasks to process",
          processed: 0,
        });
        return;
      }

      console.log(`Found ${tasksSnapshot.size} enabled tasks`);

      let processedCount = 0;
      let errorCount = 0;

      const processPromises = tasksSnapshot.docs.map(async (doc) => {
        const task = {
          id: doc.id,
          ...doc.data(),
        } as ScheduledTask;

        // Calculate next run if not set
        let nextRunDate = task.nextRun?.toDate();
        if (!nextRunDate) {
          nextRunDate = calculateNextRun(task);
          if (nextRunDate) {
            await doc.ref.update({
              nextRun: admin.firestore.Timestamp.fromDate(nextRunDate),
            });
          }
        }

        // Check if task is due
        const isDue = nextRunDate && nextRunDate <= nowDate;

        if (!isDue) {
          console.log(
            `Task ${task.id} not due yet. Next run: ${nextRunDate}`
          );
          return;
        }

        console.log(`Executing task ${task.id}...`);

        // Execute the workflow
        const result = await executeWorkflow(task);

        // Update task record
        const updateData: any = {
          lastRun: now,
          updatedAt: now,
        };

        if (result.success) {
          updateData.lastTraceId = result.traceId;
          updateData.lastStatus = "running";
          processedCount++;
        } else {
          updateData.lastStatus = "failed";
          errorCount++;
        }

        // Calculate next run time
        const nextRun = calculateNextRun(task);
        if (nextRun) {
          updateData.nextRun =
            admin.firestore.Timestamp.fromDate(nextRun);
        } else {
          // For one-time tasks, disable after execution
          if (task.schedule.type === "once") {
            updateData.enabled = false;
          }
        }

        await doc.ref.update(updateData);

        // Log execution to a separate collection for history
        await db
          .collection("users")
          .doc(task.userId)
          .collection("taskExecutions")
          .add({
            taskId: task.id,
            projectId: task.projectId,
            workflowName: task.workflowName,
            query: task.query,
            traceId: result.traceId,
            status: result.success ? "success" : "failed",
            error: result.error,
            executedAt: now,
          });
      });

      // Wait for all tasks to process
      await Promise.all(processPromises);

      console.log(
        `Processed ${processedCount} tasks, ${errorCount} errors`
      );

      res.status(200).json({
        success: true,
        message: "Scheduled tasks processed",
        processed: processedCount,
        errors: errorCount,
      });
    } catch (error) {
      console.error("Error processing scheduled tasks:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

/**
 * HTTP endpoint to manually trigger scheduled task processing
 * Useful for testing
 */
export const triggerScheduledTasks = functions.https.onCall(
  async (data, context) => {
    // Ensure the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    try {
      // Trigger the scheduled task processor
      const processUrl = process.env.FUNCTIONS_URL ||
        `https://us-central1-reefs-c1adb.cloudfunctions.net/processScheduledTasks`;

      const response = await fetch(processUrl, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error triggering scheduled tasks:", error);
      throw new functions.https.HttpsError(
        "internal",
        error instanceof Error ? error.message : String(error)
      );
    }
  }
);
