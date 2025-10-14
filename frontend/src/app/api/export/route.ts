import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { workflowState, userId } = body || {};

    if (!workflowState || typeof workflowState !== "object") {
      return new Response(
        JSON.stringify({ error: "workflowState is required" }),
        { status: 400 },
      );
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
      });
    }

    const FACTORY_URL = process.env.FACTORY_URL || "https://coral-factory-540229907345.europe-west1.run.app";
    const FACTORY_TOKEN = process.env.FACTORY_TOKEN || "bearer-token-2024";

    // Transform UI state into WorkflowConfig expected by the backend.
    // Backend expects top-level WorkflowConfig Body (not wrapped):
    // {
    //   objective: string,
    //   relations_type: "manager" | "chain" | "group-chat" | "triage" | "single",
    //   model_name: string,
    //   api_key: string,
    //   agents: AgentConfig[]
    // }
    const agentsArray = Array.isArray(workflowState.agents)
      ? workflowState.agents
      : Object.values(workflowState.agents || {});

    const workflowConfig = {
      objective:
        workflowState.objective ?? workflowState.main_task ?? "",
      relations_type:
        workflowState.relations_type ??
        workflowState.relations?.type ??
        workflowState.relations ??
        "manager",
      model_name: workflowState.model_name ?? "gpt-4o-mini",
      api_key: workflowState.api_key ?? "",
      agents: agentsArray,
    };

    const res = await fetch(`${FACTORY_URL}/verify/workflow`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FACTORY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workflowConfig),
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
          error: "Factory verify failed",
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
