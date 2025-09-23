interface FeatureCardProps {
  title: string
  description: string
  isActive: boolean
  progress: number
  onClick: () => void
}

export function FeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
}: FeatureCardProps) {
  const isAnalyticsCard = title === "Analytics & insights"
  
  return (
    <div
      className={`w-full md:flex-1 self-stretch px-6 py-5 overflow-hidden flex flex-col justify-start items-start gap-2 cursor-pointer relative ${
        isActive
          ? "bg-white"
          : ""
      } ${
        isAnalyticsCard
          ? "border-l border-r border-border/50"
          : ""
      }`}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-[rgba(50,45,43,0.08)]">
          <div
            className="h-full bg-[#322D2B] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="self-stretch flex justify-center flex-col text-[#49423D] text-sm md:text-sm font-semibold leading-6 md:leading-6 text-center">
        {title}
      </div>
      <div className="self-stretch text-[#605A57] text-[13px] md:text-[13px] font-normal leading-[22px] md:leading-[22px] font-sans text-center">
        {description}
      </div>
    </div>
  )
}