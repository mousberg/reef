"use client"

export default function CTASection() {
  return (
    <div className="w-full relative overflow-hidden flex flex-col justify-center items-center gap-2">
      {/* Content */}
      <div className="self-stretch px-6 md:px-24 py-12 md:py-12 border-t border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6 relative z-10">

        <div className="w-full max-w-[586px] px-6 py-5 md:py-8 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-6 relative z-20">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="font-title self-stretch text-center flex justify-center flex-col text-[#49423D] text-4xl md:text-6xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
              Automate your life with AI agents.
            </div>
          </div>
          <div className="w-full max-w-[497px] flex flex-col justify-center items-center gap-12">
            <div className="flex flex-col justify-center items-center gap-4">
              <img src="/stamp.webp" alt="Made by Reef" className="h-48 w-auto" />
              <div className="text-[rgba(73,66,61,0.90)] text-sm font-medium leading-[18px] font-sans flex items-center gap-1">
                Made with <img src="/heart.svg" alt="heart" className="w-4 h-4 inline" /> in New York
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
