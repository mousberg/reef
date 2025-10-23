"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import { Button } from "../../components/ui/button";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../../lib/firebase";
import { toast } from "sonner";
import { Footer } from "../../components/Footer";
import {
  GoogleIcon,
  GitHubIcon,
  NotionIcon,
  SlackIcon,
  XIcon,
} from "../../components/ProviderIcons";
import { Skeleton } from "../../components/ui/skeleton";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  lastLoggedIn: any;
  lastLoggedInIp: string;
  termsAccepted: boolean;
  marketingAccepted: boolean;
  createdAt: any;
}

export default function SettingsPage() {
  const { user, getUserData, logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editableData, setEditableData] = useState({
    firstName: "",
    lastName: "",
    marketingAccepted: false,
  });
  const [authorizingTool, setAuthorizingTool] = useState<string | null>(null);
  const [connectedTools, setConnectedTools] = useState<Record<string, boolean>>(
    {},
  );
  const [checkingStatus, setCheckingStatus] = useState(true);
  const router = useRouter();

  // Available Arcade tools
  const availableTools = [
    {
      id: "google",
      name: "Google",
      description: "Access Gmail and Google services",
      icon: GoogleIcon,
      scopes: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
      ],
      enabled: true,
    },
    {
      id: "github",
      name: "GitHub",
      description: "Access repositories and code",
      icon: GitHubIcon,
      scopes: ["repo"],
      enabled: true,
    },
    {
      id: "notion",
      name: "Notion",
      description: "Connect your Notion workspace",
      icon: NotionIcon,
      enabled: true,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Integrate with Slack channels",
      icon: SlackIcon,
      scopes: [
        "channels.read",
        "channels.write",
        "groups.read",
        "groups:history",
        "groups:write",
        "im:history",
        "im:read",
        "im:write",
        "mpim:history",
        "mpim:read",
        "mpim:write",
        "users:read",
        "users:read.email",
      ],
      enabled: true,
    },
    {
      id: "x",
      name: "X",
      description: "Integrate with X (Twitter)",
      icon: XIcon,
      scopes: ["tweet.read", "tweet.write"],
      enabled: true,
    },
  ];

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchUserData = async () => {
      try {
        const data = await getUserData(user.uid);
        setUserData(data);
        if (data) {
          setEditableData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            marketingAccepted: data.marketingAccepted || false,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, getUserData, router]);

  // Check authorization status for all tools
  useEffect(() => {
    const checkToolStatus = async () => {
      if (!user) return;

      setCheckingStatus(true);
      const statusChecks = availableTools.map(async (tool) => {
        if (!tool.enabled) return { toolId: tool.id, authorized: false };

        try {
          const response = await fetch("/api/arcade/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.uid, toolId: tool.id }),
          });
          const data = await response.json();
          return { toolId: tool.id, authorized: data.authorized || false };
        } catch (error) {
          console.error(`Failed to check status for ${tool.id}:`, error);
          return { toolId: tool.id, authorized: false };
        }
      });

      const results = await Promise.all(statusChecks);
      const statusMap = results.reduce(
        (acc, { toolId, authorized }) => {
          acc[toolId] = authorized;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      setConnectedTools(statusMap);
      setCheckingStatus(false);
    };

    if (user) {
      checkToolStatus();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !userData) return;

    setSaving(true);
    try {
      const userDocRef = doc(firestore, "users", user.uid);
      await updateDoc(userDocRef, {
        firstName: editableData.firstName,
        lastName: editableData.lastName,
        marketingAccepted: editableData.marketingAccepted,
        lastUpdated: serverTimestamp(),
      });

      // Update local state
      setUserData({
        ...userData,
        firstName: editableData.firstName,
        lastName: editableData.lastName,
        marketingAccepted: editableData.marketingAccepted,
      });

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save user data:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleAuthorizeTool = async (toolId: string, scopes?: string[]) => {
    if (!user) return;

    setAuthorizingTool(toolId);
    try {
      const response = await fetch("/api/arcade/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          toolId,
          scopes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start authorization");
      }

      // Redirect to Arcade's authorization URL
      window.location.href = data.authorization_url;
    } catch (error: any) {
      console.error("Failed to authorize tool:", error);
      toast.error(
        error.message || "Failed to authorize tool. Please try again.",
      );
      setAuthorizingTool(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
        <div className="text-foreground text-lg font-medium leading-6 font-sans">
          Loading...
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="w-full min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
        <div className="text-foreground text-lg font-medium leading-6 font-sans">
          User data not found
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-start items-center max-w-[100vw]">
      <div className="relative flex flex-col justify-start items-center w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen overflow-x-hidden">
          {/* Vertical lines */}
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-border/50 shadow-[1px_0px_0px_background] dark:shadow-[1px_0px_0px_rgba(0,0,0,0.3)] z-0" />
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-border/50 shadow-[1px_0px_0px_background] dark:shadow-[1px_0px_0px_rgba(0,0,0,0.3)] z-0" />

          <Navigation />

          {/* Main Content */}
          <div className="w-full flex-1 px-6 sm:px-8 md:px-12 lg:px-0 py-8 relative z-10 mt-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card dark:bg-card/95 shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] dark:shadow-[0px_0px_0px_4px_rgba(255,255,255,0.05)] border border-border/20 dark:border-border/30 rounded-[24px] p-8 sm:p-10">
                <div className="text-center mb-8">
                  <h1 className="text-foreground text-2xl sm:text-3xl font-medium leading-tight font-sans mb-2">
                    Settings
                  </h1>
                  <p className="text-foreground/70 text-sm font-medium leading-5 font-sans">
                    Manage your account settings and preferences
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-foreground text-sm font-medium leading-5 font-sans mb-2"
                      >
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={editableData.firstName}
                        onChange={(e) =>
                          setEditableData({
                            ...editableData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-background dark:bg-card border border-border rounded-[12px] text-foreground text-sm font-medium leading-5 font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-foreground text-sm font-medium leading-5 font-sans mb-2"
                      >
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={editableData.lastName}
                        onChange={(e) =>
                          setEditableData({
                            ...editableData,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-background dark:bg-card border border-border rounded-[12px] text-foreground text-sm font-medium leading-5 font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-foreground text-sm font-medium leading-5 font-sans mb-2"
                    >
                      Email
                    </label>
                    <div
                      id="email"
                      className="w-full px-4 py-3 bg-muted border border-border rounded-[12px] text-foreground text-sm font-medium leading-5 font-sans"
                    >
                      {userData.email}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="marketing"
                      className="block text-foreground text-sm font-medium leading-5 font-sans mb-2"
                    >
                      Marketing Communications
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="marketing"
                        checked={editableData.marketingAccepted}
                        onChange={(e) =>
                          setEditableData({
                            ...editableData,
                            marketingAccepted: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary bg-background dark:bg-card border-border rounded focus:ring-primary focus:ring-2"
                      />
                      <label
                        htmlFor="marketing"
                        className="text-foreground text-sm font-medium leading-5 font-sans"
                      >
                        I agree to receive marketing communications and updates
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex justify-between items-center mb-6">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[12px] px-8 py-3 text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>

                  {/* Arcade Tool Integrations */}
                  <div className="mb-6 pb-6 border-b border-border">
                    <div className="mb-4">
                      <h3 className="text-foreground text-lg font-medium leading-6 font-sans mb-1">
                        Tool Integrations
                      </h3>
                      <p className="text-foreground/70 text-sm font-medium leading-5 font-sans">
                        Connect tools to enable AI agent capabilities
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {checkingStatus ? (
                        // Skeleton loading state
                        <>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="relative bg-background dark:bg-card/50 border border-border rounded-[16px] p-5 flex flex-col justify-between"
                            >
                              <div className="mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <Skeleton className="h-8 w-8 rounded-lg" />
                                  <Skeleton className="h-5 w-24" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4 mt-2" />
                              </div>
                              <Skeleton className="h-10 w-full rounded-[10px]" />
                            </div>
                          ))}
                        </>
                      ) : (
                        // Actual tool cards
                        availableTools.map((tool) => {
                          const Icon = tool.icon;
                          const isConnected = connectedTools[tool.id] || false;
                          const isDisabled =
                            !tool.enabled || authorizingTool === tool.id;

                          return (
                            <div
                              key={tool.id}
                              className={`relative bg-background dark:bg-card/50 border rounded-[16px] p-5 flex flex-col justify-between transition-all ${
                                tool.enabled
                                  ? isConnected
                                    ? "border-green-500/40 hover:border-green-500/60 hover:shadow-lg"
                                    : "border-border hover:border-primary/40 hover:shadow-lg"
                                  : "border-border/50 opacity-60"
                              }`}
                            >
                              {isConnected && (
                                <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-semibold px-2 py-1 rounded-full">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  CONNECTED
                                </div>
                              )}

                              <div className="mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="flex-shrink-0">
                                    <Icon />
                                  </div>
                                  <h4 className="text-foreground text-base font-semibold leading-5 font-sans">
                                    {tool.name}
                                  </h4>
                                </div>
                                <p className="text-foreground/60 text-sm font-medium leading-5 font-sans">
                                  {tool.description}
                                </p>
                              </div>

                              <Button
                                onClick={() =>
                                  tool.enabled &&
                                  handleAuthorizeTool(
                                    tool.id,
                                    "scopes" in tool ? tool.scopes : undefined,
                                  )
                                }
                                disabled={isDisabled}
                                className={`w-full rounded-[10px] px-4 py-2.5 text-sm font-semibold leading-5 font-sans transition-all ${
                                  tool.enabled
                                    ? isConnected
                                      ? "bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20"
                                      : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md disabled:opacity-50"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                                }`}
                              >
                                {authorizingTool === tool.id
                                  ? "Connecting..."
                                  : tool.enabled
                                    ? isConnected
                                      ? "Reconnect"
                                      : "Connect"
                                    : "Coming Soon"}
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-foreground text-lg font-medium leading-6 font-sans mb-1">
                        Account Actions
                      </h3>
                      <p className="text-foreground/70 text-sm font-medium leading-5 font-sans">
                        Manage your account settings
                      </p>
                    </div>
                    <Button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-[12px] px-6 py-3 text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50"
                    >
                      {loggingOut ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}
