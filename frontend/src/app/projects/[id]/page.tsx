"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { Canvas } from "@/components/canvas"

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id as string

  // TODO: In future, fetch project data based on projectId
  // For now, we'll use hardcoded data
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left side - Chat Interface */}
      <div className="w-[480px] border-r border-gray-200 bg-white">
        <ChatInterface projectId={projectId} />
      </div>
      
      {/* Right side - Canvas */}
      <div className="flex-1">
        <Canvas projectId={projectId} />
      </div>
    </div>
  )
}