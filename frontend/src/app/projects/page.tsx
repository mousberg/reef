"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"

interface Project {
  id: string
  name: string
  description: string
  createdAt: any
  updatedAt: any
}

export default function ProjectsPage() {
  const { user, getUserProjects, createProject } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newProjectName.trim()) return

    setCreating(true)
    try {
      const projectId = await createProject(user.uid, newProjectName.trim(), newProjectDescription.trim())
      const newProject: Project = {
        id: projectId,
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setProjects([...projects, newProject])
      setNewProjectName("")
      setNewProjectDescription("")
      setShowCreateForm(false)
    } catch (error) {
      console.error("Failed to create project:", error)
    } finally {
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

          {/* Navigation */}
          <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
            <div className="w-full h-0 border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]" />
            
            <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-[#F7F5F3] backdrop-blur-sm shadow-[0px_0px_0px_2px_white] overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
              <div className="flex justify-center items-center">
                <div className="font-title flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans">
                  Reef
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full flex-1 px-6 sm:px-8 md:px-12 lg:px-0 py-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-[#2F3037] text-3xl sm:text-4xl font-medium leading-tight font-sans mb-4">
                  Your Projects
                </h1>
                <p className="text-[#37322F] text-lg font-medium leading-6 font-sans opacity-70">
                  Manage and organize your Reef projects
                </p>
              </div>

              {projects.length === 0 && !showCreateForm ? (
                <div className="bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] border border-[rgba(2,6,23,0.08)] rounded-[24px] p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <h2 className="text-[#2F3037] text-2xl font-medium leading-tight font-sans mb-4">
                      No projects yet
                    </h2>
                    <p className="text-[#37322F] text-base font-medium leading-6 font-sans opacity-70 mb-8">
                      Create your first project to get started with Reef. Projects help you organize your work and collaborate with others.
                    </p>
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="bg-[#37322F] hover:bg-[#2F2B28] text-white rounded-[12px] px-6 py-3 text-sm font-medium leading-5 font-sans transition-all"
                    >
                      Create Your First Project
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
                        onClick={() => setShowCreateForm(true)}
                        className="bg-[#37322F] hover:bg-[#2F2B28] text-white rounded-[12px] px-4 py-2 text-sm font-medium leading-5 font-sans transition-all"
                      >
                        New Project
                      </Button>
                    </div>
                  )}

                  {showCreateForm && (
                    <div className="bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] border border-[rgba(2,6,23,0.08)] rounded-[24px] p-8">
                      <h3 className="text-[#2F3037] text-xl font-medium leading-tight font-sans mb-6">
                        Create New Project
                      </h3>
                      <form onSubmit={handleCreateProject} className="space-y-4">
                        <div>
                          <label htmlFor="projectName" className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                            Project Name
                          </label>
                          <input
                            type="text"
                            id="projectName"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans focus:outline-none focus:border-[#37322F] focus:ring-[3px] focus:ring-[rgba(55,50,47,0.1)] transition-all"
                            placeholder="Enter project name"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="projectDescription" className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                            Description (Optional)
                          </label>
                          <textarea
                            id="projectDescription"
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans focus:outline-none focus:border-[#37322F] focus:ring-[3px] focus:ring-[rgba(55,50,47,0.1)] transition-all resize-none"
                            placeholder="Describe your project"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            type="submit" 
                            disabled={creating || !newProjectName.trim()}
                            className="bg-[#37322F] hover:bg-[#2F2B28] text-white rounded-[12px] px-6 py-3 text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50"
                          >
                            {creating ? "Creating..." : "Create Project"}
                          </Button>
                          <Button 
                            type="button"
                            onClick={() => {
                              setShowCreateForm(false)
                              setNewProjectName("")
                              setNewProjectDescription("")
                            }}
                            className="bg-[#F7F5F3] hover:bg-[#EEEDEB] text-[#37322F] border border-[rgba(55,50,47,0.12)] rounded-[12px] px-6 py-3 text-sm font-medium leading-5 font-sans transition-all"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
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
                              {project.description && (
                                <p className="text-[#37322F] text-base font-medium leading-6 font-sans opacity-70 mb-4">
                                  {project.description}
                                </p>
                              )}
                              <div className="text-[#37322F] text-sm font-medium leading-5 font-sans opacity-50">
                                Created {new Date(project.createdAt?.toDate?.() || project.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
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