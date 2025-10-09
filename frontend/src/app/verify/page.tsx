"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyAuthorization = async () => {
      // Get flow_id from URL query params
      const flow_id = searchParams.get("flow_id");

      if (!flow_id) {
        setStatus("error");
        setMessage("Missing flow_id parameter");
        return;
      }

      if (!user) {
        setStatus("error");
        setMessage("User not authenticated");
        return;
      }

      try {
        // Call the API route with flow_id and user_id as state
        const response = await fetch(
          `/api/arcade/verify?flow_id=${flow_id}&state=${user.uid}`,
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Authorization successful!");

          // Redirect to settings after 2 seconds
          setTimeout(() => {
            router.push("/settings");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(
            data.error ||
              data.message ||
              "Authorization failed. Please try again.",
          );
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    if (user) {
      verifyAuthorization();
    }
  }, [searchParams, user, router]);

  return (
    <div className="w-full min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
      <div className="max-w-md w-full px-6">
        <div className="bg-card dark:bg-card/95 shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] dark:shadow-[0px_0px_0px_4px_rgba(255,255,255,0.05)] border border-border/20 dark:border-border/30 rounded-[24px] p-8 text-center">
          {status === "loading" && (
            <>
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <h2 className="text-foreground text-xl font-semibold leading-6 font-sans mb-2">
                Verifying Authorization
              </h2>
              <p className="text-foreground/70 text-sm font-medium leading-5 font-sans">
                Please wait while we complete your authorization...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-4">
                <svg
                  className="inline-block h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-foreground text-xl font-semibold leading-6 font-sans mb-2">
                Authorization Successful!
              </h2>
              <p className="text-foreground/70 text-sm font-medium leading-5 font-sans mb-4">
                {message}
              </p>
              <p className="text-foreground/50 text-xs font-medium leading-4 font-sans">
                Redirecting to settings...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-4">
                <svg
                  className="inline-block h-12 w-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-foreground text-xl font-semibold leading-6 font-sans mb-2">
                Authorization Failed
              </h2>
              <p className="text-foreground/70 text-sm font-medium leading-5 font-sans mb-4">
                {message}
              </p>
              <button
                onClick={() => router.push("/settings")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[12px] px-6 py-3 text-sm font-medium leading-5 font-sans transition-all"
              >
                Back to Settings
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
