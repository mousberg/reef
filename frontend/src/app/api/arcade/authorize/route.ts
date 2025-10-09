import { NextRequest, NextResponse } from "next/server";
import { Arcade } from "@arcadeai/arcadejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, toolId, scopes } = body;

    // Validate required parameters
    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 },
      );
    }

    if (!toolId) {
      return NextResponse.json(
        { error: "Missing required parameter: toolId" },
        { status: 400 },
      );
    }

    // Initialize Arcade client
    const client = new Arcade();

    try {
      // Start the authorization flow with optional scopes
      const result = await client.auth.start(userId, toolId, {
        scopes: scopes || [],
      });

      // Check if we got a URL to redirect to
      if (!result.url) {
        throw new Error("No authorization URL returned from Arcade");
      }

      // Return the authorization URL for the client to redirect to
      return NextResponse.json({
        success: true,
        authorization_url: result.url,
        auth_id: result.id,
      });
    } catch (error: any) {
      console.error(
        "Error starting authorization",
        "status code:",
        error.status,
        "data:",
        error.data,
      );

      return NextResponse.json(
        {
          error: "Failed to start authorization",
          status: error.status,
          data: error.data,
        },
        { status: error.status || 500 },
      );
    }
  } catch (err: any) {
    console.error("Error in Arcade authorize route:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err?.message || String(err),
      },
      { status: 500 },
    );
  }
}
