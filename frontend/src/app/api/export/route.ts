import { NextRequest } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

// Transform frontend WorkflowState to Factory WorkflowConfig
function transformToFactoryConfig(workflowState: any): any {
  const agentsArray = Array.isArray(workflowState.agents)
    ? workflowState.agents
    : Object.values(workflowState.agents || {});

  // Transform each agent to factory format
  const factoryAgents = agentsArray.map((agent: any) => ({
    name: agent.name || "Unnamed Agent",
    persona: agent.instructions || agent.task || "AI Assistant",
    output: agent.expected_output || "Provide a helpful response",
    guidelines: agent.instructions || "",
    mcp_servers: [], // Can be populated later if needed
    toolkits: agent.tools || [], // Arcade toolkit names
  }));

  // Map relations to valid factory enum values
  // Valid values: 'manager', 'chain', 'group-chat', 'triage', 'single'
  let relationType = "single"; // default
  const relations = workflowState.relations?.toLowerCase() || "";

  if (relations.includes("manager") || relations.includes("delegate")) {
    relationType = "manager";
  } else if (relations.includes("chain") || relations.includes("sequential")) {
    relationType = "chain";
  } else if (relations.includes("group") || relations.includes("chat")) {
    relationType = "group-chat";
  } else if (relations.includes("triage") || relations.includes("handoff")) {
    relationType = "triage";
  } else if (agentsArray.length === 1) {
    relationType = "single";
  } else if (agentsArray.length > 1) {
    // Default to manager for multiple agents
    relationType = "manager";
  }

  return {
    objective: workflowState.main_task || "Complete the user's task",
    relations_type: relationType,
    model_name: "gpt-4o",
    api_key: process.env.OPENAI_API_KEY || "",
    agents: factoryAgents,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { workflowState, userId, projectId } = body || {};

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

    if (!projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
      });
    }

    const FACTORY_URL = process.env.FACTORY_URL || "https://coral-factory-540229907345.europe-west1.run.app";
    const FACTORY_TOKEN =
      process.env.FACTORY_TOKEN || "bearer-token-2024";

    // Transform WorkflowState to Factory WorkflowConfig
    const builtWorkflow = transformToFactoryConfig(workflowState);

    // Verify the workflow with factory
    const res = await fetch(`${FACTORY_URL}/verify/workflow`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FACTORY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(builtWorkflow),
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
          error: "Factory verification failed",
          status: res.status,
          data,
        }),
        { status: 502 },
      );
    }

    // Store builtWorkflow in Firebase
    try {
      const projectRef = doc(firestore, "users", userId, "projects", projectId);
      await updateDoc(projectRef, {
        builtWorkflow,
        updatedAt: new Date().toISOString(),
      });
    } catch (firebaseErr: any) {
      return new Response(
        JSON.stringify({
          error: "Failed to store workflow in Firebase",
          message: firebaseErr?.message || String(firebaseErr),
        }),
        { status: 500 },
      );
    }

    return new Response(JSON.stringify({ success: true, builtWorkflow }), {
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
