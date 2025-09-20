"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Navigation } from "../../components/navigation"
import { Footer } from "../../components/Footer"

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

          <div className="self-stretch pt-[9px] overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            <Navigation />
            
            {/* Hero Section */}
            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
              <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  <div className="font-title w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col text-[#37322F] text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0">
                    Your AI Agent Projects
                  </div>
                  <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
                    Build, deploy, and manage your intelligent agents.
                    <br className="hidden sm:block" />
                    Create your next breakthrough AI experience.
                  </div>
                </div>
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
          <div className="w-full flex-1 px-6 sm:px-8 md:px-12 lg:px-0 py-8 relative z-10 mt-16">
            <div className="max-w-4xl mx-auto">

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

          <Footer />
        </div>
      </div>
    </div>
  )
}
