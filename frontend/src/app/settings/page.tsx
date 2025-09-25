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
  const router = useRouter();

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
