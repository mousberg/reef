import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, userId } = body || {};

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

    const FACTORY_URL =
      process.env.FACTORY_URL ||
      "https://coral-factory-540229907345.europe-west1.run.app";
    const FACTORY_TOKEN =
      process.env.FACTORY_TOKEN || "coral-bearer-token-2024";

    const payload = {
      workflow_name: "test_workflow",
      deploy_type: "local",
      user_id: userId,
      query,
    };

    const res = await fetch(`${FACTORY_URL}/deploy/workflow`, {
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
          error: "Factory deploy failed",
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
