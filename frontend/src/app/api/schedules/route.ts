import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/schedules?projectId={projectId}&userId={userId}
 * Fetch all scheduled tasks for a project
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const userId = searchParams.get("userId");

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: "projectId and userId are required" },
        { status: 400 }
      );
    }

    const tasksSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("projects")
      .doc(projectId)
      .collection("scheduledTasks")
      .orderBy("createdAt", "desc")
      .get();

    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching scheduled tasks:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch scheduled tasks",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schedules
 * Create a new scheduled task
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      projectId,
      workflowName,
      builtWorkflow,
      query,
      schedule,
      enabled = true,
    } = body;

    // Validation
    if (!userId || !projectId || !workflowName || !builtWorkflow || !query || !schedule) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (schedule.type !== "once" && schedule.type !== "recurring") {
      return NextResponse.json(
        { error: "Invalid schedule type. Must be 'once' or 'recurring'" },
        { status: 400 }
      );
    }

    if (schedule.type === "recurring" && !schedule.cron) {
      return NextResponse.json(
        { error: "Cron expression required for recurring schedules" },
        { status: 400 }
      );
    }

    if (schedule.type === "once" && !schedule.runAt) {
      return NextResponse.json(
        { error: "runAt timestamp required for one-time schedules" },
        { status: 400 }
      );
    }

    const now = Timestamp.now();

    // Convert runAt to Timestamp if it's a Date string
    let scheduleData = { ...schedule };
    if (schedule.type === "once" && schedule.runAt) {
      scheduleData.runAt = Timestamp.fromDate(new Date(schedule.runAt));
    }

    // Calculate initial nextRun
    let nextRun: Timestamp | null = null;
    if (schedule.type === "once" && scheduleData.runAt) {
      nextRun = scheduleData.runAt;
    } else if (schedule.type === "recurring") {
      // For recurring, Cloud Function will calculate on first run
      nextRun = now; // Run immediately on first schedule
    }

    const taskData = {
      userId,
      projectId,
      workflowName,
      builtWorkflow,
      query,
      schedule: scheduleData,
      enabled,
      nextRun,
      createdAt: now,
      updatedAt: now,
    };

    const taskRef = await adminDb
      .collection("users")
      .doc(userId)
      .collection("projects")
      .doc(projectId)
      .collection("scheduledTasks")
      .add(taskData);

    return NextResponse.json({
      success: true,
      taskId: taskRef.id,
      task: { id: taskRef.id, ...taskData },
    });
  } catch (error) {
    console.error("Error creating scheduled task:", error);
    return NextResponse.json(
      {
        error: "Failed to create scheduled task",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/schedules
 * Update an existing scheduled task
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, projectId, taskId, updates } = body;

    if (!userId || !projectId || !taskId || !updates) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const taskRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("projects")
      .doc(projectId)
      .collection("scheduledTasks")
      .doc(taskId);

    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
      return NextResponse.json(
        { error: "Scheduled task not found" },
        { status: 404 }
      );
    }

    // Process schedule updates if present
    if (updates.schedule) {
      if (updates.schedule.type === "once" && updates.schedule.runAt) {
        updates.schedule.runAt = Timestamp.fromDate(
          new Date(updates.schedule.runAt)
        );
      }

      // Recalculate nextRun if schedule changed
      if (updates.schedule.type === "once" && updates.schedule.runAt) {
        updates.nextRun = updates.schedule.runAt;
      }
    }

    await taskRef.update({
      ...updates,
      updatedAt: Timestamp.now(),
    });

    const updatedDoc = await taskRef.get();

    return NextResponse.json({
      success: true,
      task: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error) {
    console.error("Error updating scheduled task:", error);
    return NextResponse.json(
      {
        error: "Failed to update scheduled task",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schedules?userId={userId}&projectId={projectId}&taskId={taskId}
 * Delete a scheduled task
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    if (!userId || !projectId || !taskId) {
      return NextResponse.json(
        { error: "userId, projectId, and taskId are required" },
        { status: 400 }
      );
    }

    const taskRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("projects")
      .doc(projectId)
      .collection("scheduledTasks")
      .doc(taskId);

    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
      return NextResponse.json(
        { error: "Scheduled task not found" },
        { status: 404 }
      );
    }

    await taskRef.delete();

    return NextResponse.json({
      success: true,
      message: "Scheduled task deleted",
    });
  } catch (error) {
    console.error("Error deleting scheduled task:", error);
    return NextResponse.json(
      {
        error: "Failed to delete scheduled task",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
