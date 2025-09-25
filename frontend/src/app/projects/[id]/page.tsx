"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth, type Project } from "@/contexts/AuthContext";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Canvas } from "@/components/canvas";
import { Navigation } from "@/components/navigation";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user, subscribeToProject } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    setLoading(true);

    // Set up real-time subscription to project data
    const unsubscribe = subscribeToProject(
      user.uid,
      projectId,
      (projectData) => {
        if (projectData) {
          setProject(projectData);
          setError(null);
        } else {
          setError("Project not found");
        }
        setLoading(false);
      },
    );

    // Cleanup subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, [user, projectId, subscribeToProject, router]);

  if (loading) {
    return (
      <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#37322F] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[#37322F] text-lg font-medium leading-6 font-sans">
            Loading project...
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center max-w-[100vw]">
        <div className="relative flex flex-col justify-start items-center w-full max-w-[100vw] overflow-x-hidden">
          <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen overflow-x-hidden">
            {/* Vertical lines */}
            <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0" />
            <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0" />

            <Navigation />

            <div className="w-full flex-1 flex flex-col justify-center items-center px-6 sm:px-8 md:px-12 lg:px-0 py-8 relative z-10 mt-16">
              <div className="text-center">
                <h1 className="text-[#2F3037] text-3xl sm:text-4xl font-medium leading-tight font-sans mb-4">
                  {error || "Project not found"}
                </h1>
                <button
                  type="button"
                  onClick={() => router.push("/projects")}
                  className="text-[#37322F] hover:opacity-70 text-lg font-medium leading-6 font-sans transition-all"
                >
                  ← Back to Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative z-10">
      <div className="flex h-full bg-gray-50">
        {/* Left side - Chat Interface */}
        <div className="w-[480px] border-r border-gray-200 bg-white h-full overflow-hidden">
          <ChatInterface
            projectId={projectId}
            initialMessages={project.messages || []}
            projectName={project.name}
          />
        </div>

        {/* Right side - Canvas */}
        <div className="flex-1 h-full overflow-hidden">
          <Canvas project={project} />
        </div>
      </div>
    </div>
  );
}
