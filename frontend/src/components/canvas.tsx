"use client";

import { WorkflowCanvas } from "./workflow/workflow-canvas";
import { AnimatedCoral } from "./animated-coral";
import { useState } from "react";
import type { Project } from "@/contexts/AuthContext";
import { RunQueryAlertDialog } from "./ui/run-query-alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CanvasProps {
  project: Project;
}

export function Canvas({ project }: CanvasProps) {
  const { user } = useAuth();

  // Convert workflowState to JSON string for WorkflowCanvas component
  const workflowJson = project.workflowState
    ? JSON.stringify(project.workflowState, null, 2)
    : undefined;

  const [exporting, setExporting] = useState(false);
  const [running, setRunning] = useState(false);
  const [showQueryDialog, setShowQueryDialog] = useState(false);

  const handleExport = async () => {
    if (!project.workflowState) {
      toast.error("No workflow to export");
      return;
    }

    if (!user?.uid) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setExporting(true);
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowState: project.workflowState,
          userId: user.uid,
          projectId: project.id
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Export failed");
        return;
      }

      toast.success("Workflow built successfully");
    } catch (e: any) {
      toast.error(e?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleRun = () => {
    setShowQueryDialog(true);
  };

  const handleQuerySubmit = async (query: string) => {
    if (!user?.uid) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setRunning(true);
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          userId: user.uid,
          projectId: project.id
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Run failed");
        return;
      }

      toast.success("Workflow started successfully");
    } catch (e: any) {
      toast.error(e?.message || "Run failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Workflow Canvas
            </h2>
            <span className="text-sm text-gray-500">
              {project.workflowState
                ? "AI agents running on the Coral Protocol"
                : "No workflow created yet"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="relative px-4 py-[6px] bg-emerald-600 dark:bg-emerald-700 shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.15)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-full h-full absolute left-0 top-0 bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
              <span className="text-white text-[13px] font-medium leading-5 font-sans relative z-10">
                {running ? "Running..." : "Run"}
              </span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="relative px-4 py-[6px] bg-slate-600 dark:bg-slate-700 shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.15)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-full h-full absolute left-0 top-0 bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
              <span className="text-white text-[13px] font-medium leading-5 font-sans relative z-10">
                {exporting ? "Building..." : "Build"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden">
        {project.workflowState ? (
          <WorkflowCanvas jsonContent={workflowJson} />
        ) : (
          <AnimatedCoral />
        )}
      </div>

      {/* Query Dialog */}
      <RunQueryAlertDialog
        open={showQueryDialog}
        onOpenChange={setShowQueryDialog}
        onSubmit={handleQuerySubmit}
      />
    </div>
  );
}
