import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface SaveWorkflowOptions {
  workflowState: any;
  userId: string;
  projectId: string;
}

interface SaveWorkflowResult {
  success: boolean;
  builtWorkflow?: any;
  error?: string;
}

export function useSaveWorkflow() {
  const [isSaving, setIsSaving] = useState(false);

  const saveWorkflow = async ({
    workflowState,
    userId,
    projectId,
  }: SaveWorkflowOptions): Promise<SaveWorkflowResult> => {
    setIsSaving(true);

    try {
      // Step 1: Verify workflow with Factory API
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowState }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          error: data?.error || "Factory verification failed",
        };
      }

      const { builtWorkflow } = data;

      if (!builtWorkflow) {
        return {
          success: false,
          error: "No workflow data returned from API",
        };
      }

      // Step 2: Save to Firestore (with auth context)
      const projectRef = doc(firestore, "users", userId, "projects", projectId);

      await setDoc(
        projectRef,
        {
          builtWorkflow,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return {
        success: true,
        builtWorkflow,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "Failed to save workflow",
      };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveWorkflow,
    isSaving,
  };
}
