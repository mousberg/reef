"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Navigation } from "../../components/navigation";
import { Footer } from "../../components/Footer";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import { AnimatedAIInput } from "../../components/ui/animated-ai-input";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  createdAt: any;
  updatedAt: any;
}

export default function ProjectsPage() {
  const { user, getUserProjects, deleteProject, updateProjectName } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    projectId: string | null;
    projectName: string;
  }>({ isOpen: false, projectId: null, projectName: "" });
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchProjects = async () => {
      try {
        const userProjects = await getUserProjects(user.uid);
        setProjects(userProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, getUserProjects, router]);

  const handleDeleteProject = async () => {
    console.log("handleDeleteProject called");
    console.log("user:", user);
    console.log("confirmDialog:", confirmDialog);

    if (!user || !confirmDialog.projectId) {
      console.log("Early return: missing user or projectId");
      return;
    }

    console.log("Starting delete process for:", confirmDialog.projectId);
    setDeleting(confirmDialog.projectId);

    try {
      console.log("Calling deleteProject...");
      await deleteProject(user.uid, confirmDialog.projectId);
      console.log("Delete successful, updating UI...");

      setProjects(projects.filter((p) => p.id !== confirmDialog.projectId));
      console.log("Showing success toast...");
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleting(null);
      setConfirmDialog({ isOpen: false, projectId: null, projectName: "" });
    }
  };

  const openDeleteConfirmation = (projectId: string, projectName: string) => {
    console.log("openDeleteConfirmation called with:", {
      projectId,
      projectName,
    });
    setConfirmDialog({ isOpen: true, projectId, projectName });
    setActiveDropdown(null);
  };

  const closeDeleteConfirmation = () => {
    setConfirmDialog({ isOpen: false, projectId: null, projectName: "" });
  };

  const startRename = (projectId: string, currentName: string) => {
    setEditingProject(projectId);
    setEditingName(currentName);
    setActiveDropdown(null);
  };

  const cancelRename = useCallback(() => {
    setEditingProject(null);
    setEditingName("");
  }, []);

  const handleRename = async (projectId: string) => {
    if (!user || !editingName.trim()) return;

    const trimmedName = editingName.trim();
    if (trimmedName.length === 0) {
      toast.error("Project name cannot be empty");
      return;
    }

    setRenaming(projectId);
    try {
      await updateProjectName(user.uid, projectId, trimmedName);
      setProjects(
        projects.map((p) =>
          p.id === projectId
            ? { ...p, name: trimmedName, updatedAt: new Date() }
            : p,
        ),
      );
      toast.success("Project renamed successfully");
      setEditingProject(null);
      setEditingName("");
    } catch (error) {
      console.error("Failed to rename project:", error);
      toast.error("Failed to rename project");
    } finally {
      setRenaming(null);
    }
  };

  // Close dropdown and editing when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Close dropdown if clicking outside
      if (!target.closest("[data-dropdown-container]")) {
        setActiveDropdown(null);
      }

      // Close editing if clicking outside the input
      if (!target.closest("[data-editing-container]")) {
        if (editingProject) {
          cancelRename();
        }
      }
    };

    if (activeDropdown || editingProject) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeDropdown, editingProject, cancelRename]);

  if (loading) {
    return (
      <div className="w-full min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-foreground dark:border-foreground border-t-transparent rounded-full animate-spin"></div>
          <div className="text-foreground text-lg font-medium leading-6 font-sans">
            Loading projects...
          </div>
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

          <div className="self-stretch pt-[9px] overflow-hidden flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            <Navigation />

            {/* Hero Section */}
            <div className="pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
              <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8"></div>
              </div>

              {/* Background pattern */}
              <div className="absolute top-[232px] sm:top-[248px] md:top-[264px] lg:top-[320px] left-1/2 transform -translate-x-1/2 z-0 pointer-events-none overflow-hidden max-w-[100vw]">
                <img
                  src="/mask-group-pattern.svg"
                  alt=""
                  className="w-[100vw] max-w-[936px] sm:max-w-[1200px] md:max-w-[1400px] lg:max-w-[1600px] h-auto opacity-30 sm:opacity-40 md:opacity-50 mix-blend-multiply"
                  style={{
                    filter: "hue-rotate(15deg) saturate(0.7) brightness(1.2)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full flex-1 px-6 sm:px-8 md:px-12 lg:px-0 py-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              {projects.length === 0 ? (
                <div className="bg-card dark:bg-card/95 shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] dark:shadow-[0px_0px_0px_4px_rgba(255,255,255,0.05)] border border-border/20 dark:border-border/30 rounded-[24px] p-12 text-center">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-foreground text-2xl font-medium leading-tight font-sans mb-4">
                      No projects yet
                    </h2>
                    <p className="text-foreground/70 text-base font-medium leading-6 font-sans mb-8">
                      Create your first project to get started with Reef.
                      Projects help you organize your work and collaborate with
                      others.
                    </p>

                    {/* AI Input for creating first project */}
                    <div className="w-full">
                      <AnimatedAIInput />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {projects.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="text-foreground text-lg font-medium leading-6 font-sans">
                          {projects.length}{" "}
                          {projects.length === 1 ? "project" : "projects"}
                        </div>
                      </div>

                      {/* AI Input for creating new projects */}
                      <div className="w-full">
                        <AnimatedAIInput />
                      </div>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div className="grid gap-6">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="bg-card dark:bg-card/95 shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] dark:shadow-[0px_0px_0px_4px_rgba(255,255,255,0.05)] border border-border/20 dark:border-border/30 rounded-[24px] p-8 hover:shadow-[0px_0px_0px_4px_rgba(55,50,47,0.08)] dark:hover:shadow-[0px_0px_0px_4px_rgba(255,255,255,0.08)] transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {editingProject === project.id ? (
                                <div className="mb-2" data-editing-container>
                                  <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) =>
                                      setEditingName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleRename(project.id);
                                      } else if (e.key === "Escape") {
                                        cancelRename();
                                      }
                                    }}
                                    className="text-foreground text-xl font-medium leading-tight font-sans bg-background dark:bg-card border border-foreground rounded-[8px] px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                                    disabled={renaming === project.id}
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      onClick={() => handleRename(project.id)}
                                      disabled={
                                        renaming === project.id ||
                                        !editingName.trim()
                                      }
                                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[8px] px-3 py-1 text-xs font-medium leading-4 font-sans transition-all disabled:opacity-50"
                                    >
                                      {renaming === project.id
                                        ? "Saving..."
                                        : "Save"}
                                    </Button>
                                    <Button
                                      onClick={cancelRename}
                                      disabled={renaming === project.id}
                                      className="bg-background dark:bg-card hover:bg-accent text-foreground border border-foreground rounded-[8px] px-3 py-1 text-xs font-medium leading-4 font-sans transition-all disabled:opacity-50"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <h3 className="text-foreground text-xl font-medium leading-tight font-title mb-2">
                                  {project.name}
                                </h3>
                              )}
                              <div className="text-foreground/50 text-sm font-medium leading-5 font-sans">
                                Created{" "}
                                {new Date(
                                  project.createdAt?.toDate?.() ||
                                    project.createdAt,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            {editingProject !== project.id && (
                              <div className="flex gap-2 items-center">
                                <Button
                                  onClick={() => {
                                    setOpening(project.id);
                                    router.push(`/projects/${project.id}`);
                                  }}
                                  disabled={opening === project.id}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[12px] px-4 py-2 text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50"
                                >
                                  {opening === project.id ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                      Opening...
                                    </div>
                                  ) : (
                                    "Open"
                                  )}
                                </Button>

                                {/* Three dots menu */}
                                <div
                                  className="relative"
                                  data-dropdown-container
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(
                                        "Three dots clicked, current activeDropdown:",
                                        activeDropdown,
                                      );
                                      setActiveDropdown(
                                        activeDropdown === project.id
                                          ? null
                                          : project.id,
                                      );
                                      console.log(
                                        "Setting activeDropdown to:",
                                        activeDropdown === project.id
                                          ? null
                                          : project.id,
                                      );
                                    }}
                                    className="p-2 hover:bg-accent dark:hover:bg-accent/50 rounded-[8px] transition-colors"
                                    aria-label="More options"
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      className="text-foreground/60 hover:text-foreground"
                                    >
                                      <title>More options</title>
                                      <circle
                                        cx="8"
                                        cy="3"
                                        r="1.5"
                                        fill="currentColor"
                                      />
                                      <circle
                                        cx="8"
                                        cy="8"
                                        r="1.5"
                                        fill="currentColor"
                                      />
                                      <circle
                                        cx="8"
                                        cy="13"
                                        r="1.5"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  </button>

                                  {/* Dropdown menu */}
                                  {activeDropdown === project.id && (
                                    <div className="absolute right-0 top-full mt-2 bg-card dark:bg-card/95 border border-border/30 rounded-[12px] shadow-[0px_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0px_4px_12px_rgba(0,0,0,0.3)] py-1 min-w-[120px] z-50">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startRename(project.id, project.name);
                                        }}
                                        disabled={renaming === project.id}
                                        className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent dark:hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {renaming === project.id
                                          ? "Renaming..."
                                          : "Rename"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(
                                            "Delete button clicked for project:",
                                            project.id,
                                          );
                                          openDeleteConfirmation(
                                            project.id,
                                            project.name,
                                          );
                                        }}
                                        disabled={deleting === project.id}
                                        className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {deleting === project.id
                                          ? "Deleting..."
                                          : "Delete"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Footer />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description={`Are you sure you want to delete "${confirmDialog.projectName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        loading={deleting !== null}
      />

      {/* ElevenLabs AI Assistant Widget */}
      <elevenlabs-convai agent-id="agent_3101k5p8y1r2e25bn1bb4rjpx932"></elevenlabs-convai>
      <script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        async
        type="text/javascript"
      ></script>
    </div>
  );
}
