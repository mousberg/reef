"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ChatInterface } from "@/components/chat-interface"
import { Canvas } from "@/components/canvas"


export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { user, getProjectById } = useAuth()

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    const fetchProject = async () => {
      try {
        setLoading(true)
        const projectData = await getProjectById(user.uid, projectId)

        if (!projectData) {
          setError("Project not found")
          return
        }

        setProject(projectData)
      } catch (err) {
        console.error("Failed to fetch project:", err)
        setError("Failed to load project")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [user, projectId, getProjectById, router])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-gray-600">Loading project...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Project not found"}
          </h1>
          <button
            onClick={() => router.push("/projects")}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left side - Chat Interface */}
      <div className="w-[480px] border-r border-gray-200 bg-white">
        <ChatInterface
          projectId={projectId}
          initialMessages={project.messages || []}
          projectName={project.name}
        />
      </div>

      {/* Right side - Canvas */}
      <div className="flex-1">
        <Canvas projectId={projectId} />
      </div>
    </div>
  )
}
