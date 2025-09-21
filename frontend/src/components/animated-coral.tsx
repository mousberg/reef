"use client"

import { useState, useEffect } from 'react'

const coralFrames = [
  `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢷⣤⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢰⡗⠀⠀⢠⡀⣠⡄⠀⠈⣿⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠸⢶⣤⣄⢿⡇⠀⠀⠈⣿⠏⠀⠀⠀⣿⡀⠀⣴⠟⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠙⠻⣿⣦⡀⢸⡏⠀⠀⠀⠀⢹⣇⣼⣏⣀⣀⣠⣤⡦⠀⠀⠀⠀
⠀⠀⠀⢰⣶⡄⠀⠀⠘⢿⣿⣾⣧⠀⠀⠀⠀⣼⣿⠟⠉⠉⠉⢉⡀⠀⠀⠀⠀⠀
⠀⠘⠷⠶⢿⣿⡄⠀⠀⠀⠙⠿⣿⣦⣄⡀⣼⣿⠃⠀⠰⣦⣀⣸⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠈⣿⣷⠀⠀⠀⢀⠀⠈⠛⠿⣿⣿⡏⠀⠀⠀⠈⣹⡟⠀⠀⣀⣤⣄⠀
⠀⠀⢠⡶⠟⠻⣿⣧⡀⣰⠏⠀⠀⠀⠀⢸⣿⡇⠀⣀⣠⣾⣯⣶⣶⣾⡏⠁⠀⠀
⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣀⠀⠀⠀⠀⠸⣿⣷⣿⣿⣿⣯⣉⡉⠉⠙⢷⡄⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣷⣦⣄⣠⣾⣿⠋⠀⠀⠀⠈⣩⡿⠷⣤⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀  ⣶⡶⠟⠛⠛⢿⣿⡿⠁⠀⠀⠀⠀⣰⡟⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠹⠇⠀⠀⠀⣼⣿⠃⠀⠀⠀⠀⠀⠉⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`
]

export function AnimatedCoral() {
  const [currentFrame, setCurrentFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % coralFrames.length)
    }, 800) // Change frame every 800ms

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="text-center">
        <pre className="text-pink-500 text-xs leading-tight font-mono mb-4 select-none">
          {coralFrames[currentFrame]}
        </pre>
        <div className="text-gray-600 text-lg font-medium">
          Create your first workflow to see the magic happen
        </div>
        <div className="text-gray-400 text-sm mt-2">
          Use the AI chat to describe what you want to build
        </div>
      </div>
    </div>
  )
}
