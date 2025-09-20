import type React from "react"

interface EffortlessIntegrationProps {
  width?: number | string
  height?: number | string
  className?: string
}

const EffortlessIntegration: React.FC<EffortlessIntegrationProps> = ({ 
  width = 482, 
  height = 300, 
  className = "" 
}) => {
  const centerX = 250
  const centerY = 179

  const getPositionOnRing = (ringRadius: number, angle: number) => ({
    x: centerX + ringRadius * Math.cos(angle),
    y: centerY + ringRadius * Math.sin(angle),
  })

  return (
    <div
      className={className}
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/10 pointer-events-none z-10" />

      {/* Concentric rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-[#37322f]/20 opacity-80" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-[#37322f]/25 opacity-70" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-[#37322f]/30 opacity-60" />

      {/* Logo constellation */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[358px]">
        {/* Central hub */}
        <div 
          className="absolute w-[72px] h-[72px] bg-[#37322f] rounded-full shadow-lg flex items-center justify-center text-white font-bold text-[32px]"
          style={{ left: `${centerX - 36}px`, top: `${centerY - 36}px` }}
        >
          b
        </div>

        {/* Service logos */}
        {[
          { service: 'github', ring: 80, angle: Math.PI, bg: '#000', filter: 'brightness(0) invert(1)' },
          { service: 'slack', ring: 80, angle: 0, bg: '#fff', filter: 'none' },
          { service: 'figma', ring: 120, angle: -Math.PI / 4, bg: '#EEEFE8', filter: 'none' },
          { service: 'discord', ring: 120, angle: (3 * Math.PI) / 4, bg: '#5865F2', filter: 'brightness(0) invert(1)' },
          { service: 'notion', ring: 120, angle: (5 * Math.PI) / 4, bg: '#fff', filter: 'none' },
          { service: 'stripe', ring: 160, angle: Math.PI, bg: '#635BFF', filter: 'brightness(0) invert(1)' },
          { service: 'framer', ring: 160, angle: 0, bg: '#000', filter: 'brightness(0) invert(1)' },
        ].map(({ service, ring, angle, bg, filter }) => {
          const pos = getPositionOnRing(ring, angle)
          return (
            <div
              key={service}
              className="absolute w-8 h-8 rounded-full shadow-lg flex items-center justify-center"
              style={{ 
                left: `${pos.x - 16}px`, 
                top: `${pos.y - 16}px`,
                background: bg 
              }}
            >
              <img
                src={`https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${service}.svg`}
                alt={service}
                className="w-[18px] h-[18px]"
                style={{ filter }}
              />
            </div>
          )
        })}

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(55, 50, 47, 0.1)" />
              <stop offset="50%" stopColor="rgba(55, 50, 47, 0.05)" />
              <stop offset="100%" stopColor="rgba(55, 50, 47, 0.1)" />
            </linearGradient>
          </defs>
          
          {[80, 120, 160].map(radius =>
            [0, Math.PI, -Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4].map((angle, i) => {
              if ((radius === 80 && i > 1) || (radius === 160 && i > 1)) return null
              if (radius === 120 && i < 2) return null
              const pos = getPositionOnRing(radius, angle)
              return (
                <line
                  key={`${radius}-${i}`}
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="url(#connectionGradient)"
                  strokeWidth="1"
                  opacity={radius === 80 ? "0.2" : radius === 120 ? "0.15" : "0.1"}
                />
              )
            })
          )}
        </svg>
      </div>
    </div>
  )
}

export default EffortlessIntegration
