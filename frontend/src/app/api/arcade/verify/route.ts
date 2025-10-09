import { NextRequest, NextResponse } from "next/server";
import { Arcade } from "@arcadeai/arcadejs";

export async function GET(req: NextRequest) {
  try {
    // Get flow_id and state (user_id) from query string
    const { searchParams } = new URL(req.url);
    const flow_id = searchParams.get("flow_id");
    const state = searchParams.get("state");

    // Validate required parameters
    if (!flow_id) {
      return NextResponse.json(
        { error: "Missing required parameter: flow_id" },
        { status: 400 },
      );
    }

    if (!state) {
      return NextResponse.json(
        { error: "Missing required parameter: state (user_id)" },
        { status: 400 },
      );
    }

    // Use the user ID from state parameter
    const user_id_from_your_app_session = state;

    // Initialize Arcade client (uses ARCADE_API_KEY from env)
    const client = new Arcade();

    // Confirm the user's identity
    try {
      const result = await client.auth.confirmUser({
        flow_id: flow_id as string,
        user_id: user_id_from_your_app_session,
      });

      // Wait for auth completion
      const authResponse = await client.auth.waitForCompletion(result.auth_id);

      if (authResponse.status === "completed") {
        // Option 1: Redirect to Arcade's next_uri
        // return NextResponse.redirect(result.next_uri);

        // Option 2: Render a success page
        return NextResponse.json({
          success: true,
          message: "Thanks for authorizing!",
          auth_id: result.auth_id,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Something went wrong. Please try again.",
            status: authResponse.status,
          },
          { status: 400 },
        );
      }
    } catch (error: any) {
      console.error(
        "Error during verification",
        "status code:",
        error.status,
        "data:",
        error.data,
      );

      return NextResponse.json(
        {
          error: "User verification failed",
          status: error.status,
          data: error.data,
        },
        { status: error.status || 500 },
      );
    }
  } catch (err: any) {
    console.error("Error in Arcade verifier route:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err?.message || String(err),
      },
      { status: 500 },
    );
  }
}
