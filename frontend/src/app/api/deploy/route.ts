import { NextRequest } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, userId, projectId } = body || {};

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
      });
    }

    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
      });
    }

    if (!projectId || typeof projectId !== "string") {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
      });
    }

    // Get the builtWorkflow from Firebase
    let builtWorkflow: any;
    try {
      const projectRef = doc(firestore, "users", userId, "projects", projectId);
      const projectSnap = await getDoc(projectRef);

      if (!projectSnap.exists()) {
        return new Response(
          JSON.stringify({ error: "Project not found" }),
          { status: 404 },
        );
      }

      builtWorkflow = projectSnap.data()?.builtWorkflow;

      if (!builtWorkflow) {
        return new Response(
          JSON.stringify({
            error: "Workflow not built yet. Please click 'Build' first."
          }),
          { status: 400 },
        );
      }
    } catch (firebaseErr: any) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch workflow from Firebase",
          message: firebaseErr?.message || String(firebaseErr),
        }),
        { status: 500 },
      );
    }

    const FACTORY_URL =
      process.env.FACTORY_URL ||
      "https://coral-factory-540229907345.europe-west1.run.app";
    const FACTORY_TOKEN =
      process.env.FACTORY_TOKEN || "coral-bearer-token-2024";

    // Payload for factory /run/workflow/local endpoint
    const payload = {
      workflow_config: builtWorkflow,
      user_id: userId,
      user_task: query,
    };

    const res = await fetch(`${FACTORY_URL}/run/workflow/local`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FACTORY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          error: "Factory run failed",
          status: res.status,
          data,
        }),
        { status: 502 },
      );
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Internal error",
        message: err?.message || String(err),
      }),
      { status: 500 },
    );
  }
}
