interface DecorativePatternProps {
  side?: "left" | "right"
  patternCount?: number
  className?: string
}

export function DecorativePattern({ 
  patternCount = 50,
  className = ""
}: DecorativePatternProps) {
  return (
    <div className={`w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden ${className}`}>
      <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start overflow-hidden">
        {Array.from({ length: patternCount }).map((_, i) => (
          <div
            key={i}
            className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
          />
        ))}
      </div>
    </div>
  )
}