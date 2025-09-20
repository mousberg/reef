import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-16">
      <div className="max-w-[1060px] mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Hero Content */}
          <div className="max-w-[937px] flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-6">
              <h1 className="font-title max-w-[748px] text-center text-[#37322f] text-5xl md:text-[80px] font-normal leading-tight md:leading-[96px] font-serif">
                Lovable for AI agents by Reefs
              </h1>
              <p className="max-w-[506px] text-center text-[#37322f]/80 text-lg font-medium leading-7">
                Build, deploy, and manage AI agents effortlessly. The developer-first platform for creating intelligent agents that users love.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
