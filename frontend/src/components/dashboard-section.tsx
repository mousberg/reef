interface DashboardSectionProps {
  activeCard: number
}

const dashboardImages = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dsadsadsa.jpg-xTHS4hGwCWp2H5bTj8np6DXZUyrxX7.jpeg",
    alt: "Schedules Dashboard - Customer Subscription Management"
  },
  {
    src: "/analytics-dashboard-with-charts-graphs-and-data-vi.jpg",
    alt: "Analytics Dashboard"
  },
  {
    src: "/data-visualization-dashboard-with-interactive-char.jpg",
    alt: "Data Visualization Dashboard"
  }
]

export function DashboardSection({ activeCard }: DashboardSectionProps) {
  return (
    <div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-16 mb-0 lg:pb-0">
      <div className="w-full max-w-[960px] lg:w-[960px] h-[200px] sm:h-[280px] md:h-[450px] lg:h-[695.55px] bg-white shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9.06px] flex flex-col justify-start items-start">
        <div className="self-stretch flex-1 flex justify-start items-start">
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full overflow-hidden">
              {dashboardImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    activeCard === index 
                      ? "opacity-100 scale-100 blur-0" 
                      : "opacity-0 scale-95 blur-sm"
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={`w-full h-full ${index === 2 ? "object-contain" : "object-cover"}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}