import { FeatureCard } from "./feature-card"
import { DecorativePattern } from "./decorative-pattern"

interface FeatureCardsSectionProps {
  activeCard: number
  progress: number
  onCardClick: (index: number) => void
}

const featureCards = [
  {
    title: "Plan your schedules",
    description: "Design and orchestrate intelligent AI agent workflows with visual builders."
  },
  {
    title: "Analytics & insights", 
    description: "Monitor agent performance, conversations, and outcomes in real-time."
  },
  {
    title: "Collaborate seamlessly",
    description: "Deploy and manage multiple agents seamlessly across your applications."
  }
]

export function FeatureCardsSection({ activeCard, progress, onCardClick }: FeatureCardsSectionProps) {
  return (
    <div className="self-stretch border-t border-[#E0DEDB] border-b border-[#E0DEDB] flex justify-center items-start">
      <DecorativePattern side="left" />
      
      <div className="flex-1 px-0 sm:px-2 md:px-0 flex flex-col md:flex-row justify-center items-stretch gap-0">
        {featureCards.map((card, index) => (
          <FeatureCard
            key={index}
            title={card.title}
            description={card.description}
            isActive={activeCard === index}
            progress={activeCard === index ? progress : 0}
            onClick={() => onCardClick(index)}
          />
        ))}
      </div>

      <DecorativePattern side="right" />
    </div>
  )
}