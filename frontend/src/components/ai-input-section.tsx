"use client"

import { AnimatedAIInput } from "./ui/animated-ai-input"

export function AIInputSection() {
  return (
    <div className="w-full max-w-[960px] lg:w-[960px] py-12 sm:py-16 md:py-20 lg:py-24 flex flex-col justify-center items-center relative">
      {/* Background light image */}
      <div className="absolute w-full mx-auto left-1/2 transform -translate-x-1/2 top-0 bottom-0 flex items-center justify-center rounded-2xl overflow-hidden">
        <img
          src="/bgLight.webp"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10 w-full">
        <AnimatedAIInput />
      </div>
    </div>
  )
}