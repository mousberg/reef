import { AIInputSection } from "./ai-input-section"

export function LandingHero() {
  return (
    <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
      <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          <div className="font-title w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col text-[#37322F] text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0">
            Lovable for AI agents
          </div>
          <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
            Build, deploy, and manage AI agents effortlessly.
            <br className="hidden sm:block" />
            The natural language platform for creating intelligent agents that users love.
          </div>
        </div>
      </div>

      {/* AI Input Section */}
      <div className="w-full max-w-[960px] lg:w-[960px] flex flex-col justify-center items-center relative z-10 mt-10 sm:mt-14 md:mt-18 lg:mt-24">
        <AIInputSection />
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
  )
}