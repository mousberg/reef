import { NextRequest, NextResponse } from "next/server";
import { Arcade } from "@arcadeai/arcadejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, toolId } = body;

    // Validate required parameters
    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

    if (!toolId) {
      return NextResponse.json(
        { error: "Missing required parameter: toolId" },
        { status: 400 }
      );
    }

    // Initialize Arcade client
    const client = new Arcade();

    try {
      // Fetch tools for the requested toolkit
      const tools = await client.tools.list({
        toolkit: toolId,
        user_id: userId,
        limit: 30,
      });

      // Check if any tool in this toolkit has completed token status
      const isAuthorized = tools.items.some(
        (tool) =>
          tool.requirements?.authorization?.token_status === "completed"
      );

      return NextResponse.json({
        success: true,
        authorized: isAuthorized,
        toolId,
      });
    } catch (error: any) {
      console.error(
        "Error checking authorization status",
        "status code:",
        error.status,
        "data:",
        error.data
      );

      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch tools",
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Error in Arcade status route:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
