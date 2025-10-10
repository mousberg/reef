import { NextRequest, NextResponse } from "next/server";
import { Arcade } from "@arcadeai/arcadejs";
import { writeFileSync } from "fs";
import { join } from "path";

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
      // Get all tools for the user to check authorization status
      const tools = await client.tools.list({ user_id: userId });

      // Check if any tool has authorization for this provider
      let isAuthorized = false;
      const logLines: string[] = [];

      logLines.push(`\n=== Checking authorization for ${toolId} ===`);
      logLines.push(`User: ${userId}\n`);

      let matchCount = 0;

      for await (const tool of tools) {
        // Only log tools that match the provider we're looking for
        const providerId = tool.requirements?.authorization?.provider_id;
        if (providerId === toolId) {
          matchCount++;
          logLines.push(`\n>>> MATCH #${matchCount}: ${tool.name} <<<`);

          if (tool.requirements) {
            logLines.push(`  Requirements met: ${tool.requirements.met}`);

            // Check authorization status
            if (tool.requirements.authorization) {
              logLines.push(
                `  Authorization status: ${tool.requirements.authorization.status}`
              );
              logLines.push(
                `  Token status: ${tool.requirements.authorization.token_status}`
              );
              logLines.push(
                `  Provider ID: ${tool.requirements.authorization.provider_id}`
              );
            }

            // Check secret requirements
            if (tool.requirements.secrets) {
              tool.requirements.secrets.forEach((secret: any) => {
                logLines.push(`  Secret '${secret.key}' met: ${secret.met}`);
                if (!secret.met && secret.status_reason) {
                  logLines.push(`    Reason: ${secret.status_reason}`);
                }
              });
            }
          }

          logLines.push("---\n");

          // Check if tool matches our provider and is authorized
          if (
            tool.requirements?.authorization?.provider_id === toolId &&
            tool.requirements?.authorization?.token_status === "completed"
          ) {
            isAuthorized = true;
          }
        }
      }

      logLines.push(`\nTotal matching tools for ${toolId}: ${matchCount}`);

      logLines.push(`\nResult: ${toolId} authorized = ${isAuthorized}`);

      // Write to file
      const logPath = join(process.cwd(), `arcade-tools-${toolId}.txt`);
      writeFileSync(logPath, logLines.join("\n"), "utf-8");
      console.log(`📝 Log written to: ${logPath}`);

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

      // If there's an error, assume not authorized
      return NextResponse.json({
        success: true,
        authorized: false,
        toolId,
      });
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
