"use client";

import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  bubbleType: number;
}

export function BubbleAnimation() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const bubbleImages = ["/bubbles-1.svg", "/bubbles-2.svg", "/bubbles-3.svg"];

  useEffect(() => {
    // Initial bubbles
    const initialBubbles: Bubble[] = [];
    for (let i = 0; i < 7; i++) {
      initialBubbles.push({
        id: i,
        left: Math.random() * 95 + 2.5, // 2.5% to 97.5% (including sides)
        size: Math.random() * 30 + 20, // 20-50px
        duration: Math.random() * 20 + 20, // 20-40s
        delay: Math.random() * 20, // 0-20s delay
        bubbleType: Math.floor(Math.random() * 3), // 0, 1, or 2
      });
    }
    setBubbles(initialBubbles);

    // Add new bubbles over time
    let id = 7;
    const interval = setInterval(() => {
      setBubbles((prev) => [
        ...prev,
        {
          id: id++,
          left: Math.random() * 95 + 2.5,
          size: Math.random() * 30 + 20,
          duration: Math.random() * 20 + 20,
          delay: 0, // New bubbles start immediately
          bubbleType: Math.floor(Math.random() * 3),
        },
      ]);
    }, 2000); // New bubble every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute opacity-50"
          style={{
            left: `${bubble.left}%`,
            bottom: "-40px", // Start below view
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animation: `simpleFloat ${bubble.duration}s infinite linear`,
            animationDelay: `${bubble.delay}s`,
          }}
        >
          <img
            src={bubbleImages[bubble.bubbleType]}
            alt=""
            className="w-full h-full"
          />
        </div>
      ))}

      <style jsx>{`
        @keyframes simpleFloat {
          0% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-30vh) translateX(10px);
          }
          50% {
            transform: translateY(-60vh) translateX(-5px);
          }
          75% {
            transform: translateY(-90vh) translateX(15px);
          }
          100% {
            transform: translateY(-120vh) translateX(-8px);
          }
        }
      `}</style>
    </div>
  );
}
