"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Navigation } from "../../components/navigation"

interface Project {
  id: string
  name: string
  createdAt: any
  updatedAt: any
}

export default function ProjectsPage() {
  const { user, getUserProjects, createProject } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    const fetchProjects = async () => {
      try {
        const userProjects = await getUserProjects(user.uid)
        setProjects(userProjects)
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user, getUserProjects, router])

  const handleCreateProject = async () => {
    if (!user) return

    setCreating(true)
    try {
      const projectId = await createProject(user.uid)
      // Navigate directly to the new project
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error("Failed to create project:", error)
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
        <div className="text-[#37322F] text-lg font-medium leading-6 font-sans">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center max-w-[100vw]">
      <div className="relative flex flex-col justify-start items-center w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen overflow-x-hidden">
          {/* Vertical lines */}
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0" />
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0" />

          <Navigation />

          {/* Main Content */}
          <div className="w-full flex-1 px-6 sm:px-8 md:px-12 lg:px-0 py-8 relative z-10 mt-16">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-[#2F3037] text-3xl sm:text-4xl font-medium leading-tight font-sans mb-4">
                  Your Projects
                </h1>
                <p className="text-[#37322F] text-lg font-medium leading-6 font-sans opacity-70">
                  Manage and organize your Reef projects
                </p>
              </div>

              {projects.length === 0 ? (
                <div className="bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] border border-[rgba(2,6,23,0.08)] rounded-[24px] p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <h2 className="text-[#2F3037] text-2xl font-medium leading-tight font-sans mb-4">
                      No projects yet
                    </h2>
                    <p className="text-[#37322F] text-base font-medium leading-6 font-sans opacity-70 mb-8">
                      Create your first project to get started with Reef. Projects help you organize your work and collaborate with others.
                    </p>
                    <Button
                      onClick={handleCreateProject}
                      disabled={creating}
                      className="bg-[#37322F] hover:bg-[#2F2B28] text-white rounded-[12px] px-6 py-3 text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50"
                    >
                      {creating ? "Creating..." : "Create Your First Project"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {projects.length > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="text-[#37322F] text-lg font-medium leading-6 font-sans">
                        {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                      </div>
                      <Button
                        onClick={handleCreateProject}
                        disabled={creating}
                        className="bg-[#37322F] hover:bg-[#2F2B28] text-white rounded-[12px] px-4 py-2 text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50"
                      >
                        {creating ? "Creating..." : "New Project"}
                      </Button>
                    </div>
                  )}


                  {projects.length > 0 && (
                    <div className="grid gap-6">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] border border-[rgba(2,6,23,0.08)] rounded-[24px] p-8 hover:shadow-[0px_0px_0px_4px_rgba(55,50,47,0.08)] transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-[#2F3037] text-xl font-medium leading-tight font-sans mb-2">
                                {project.name}
                              </h3>
                              <div className="text-[#37322F] text-sm font-medium leading-5 font-sans opacity-50">
                                Created {new Date(project.createdAt?.toDate?.() || project.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => router.push(`/projects/${project.id}`)}
                                className="bg-[#37322F] hover:bg-[#2F2B28] text-white rounded-[12px] px-4 py-2 text-sm font-medium leading-5 font-sans transition-all"
                              >
                                Open
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
