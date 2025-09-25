"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

interface DiffusionImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function DiffusionImage({
  src,
  className = "",
}: DiffusionImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animationRef = useRef<number | null>(null);
  const [ref] = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Initial pixelated state
      ctx.imageSmoothingEnabled = false;
      const initialPixelSize = 8;
      const smallWidth = Math.ceil(img.width / initialPixelSize);
      const smallHeight = Math.ceil(img.height / initialPixelSize);

      // Draw pixelated version
      ctx.drawImage(img, 0, 0, smallWidth, smallHeight);
      ctx.drawImage(
        canvas,
        0,
        0,
        smallWidth,
        smallHeight,
        0,
        0,
        img.width,
        img.height,
      );

      setImageLoaded(true);
    };

    img.src = src;
  }, [src]);

  useEffect(() => {
    if (!imageLoaded) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    let isLoaded = false;

    const updatePixelation = () => {
      if (!isLoaded) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate progress from when image enters viewport to when it's centered
      const imageCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;

      // Progress goes from 0 to 1 as image moves from bottom to center of viewport
      let progress = 1 - (imageCenter - viewportCenter) / (viewportHeight / 2);
      progress = Math.max(0, Math.min(1, progress));

      // Apply easing
      const easeInOutQuad = (t: number) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const easedProgress = easeInOutQuad(progress);

      // Calculate pixel size based on progress (8 to 1)
      const currentPixelSize = Math.max(1, Math.floor(8 * (1 - easedProgress)));

      if (currentPixelSize > 1) {
        ctx.imageSmoothingEnabled = false;
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) return;

        const smallWidth = Math.ceil(img.width / currentPixelSize);
        const smallHeight = Math.ceil(img.height / currentPixelSize);

        tempCanvas.width = smallWidth;
        tempCanvas.height = smallHeight;

        tempCtx.drawImage(img, 0, 0, smallWidth, smallHeight);

        ctx.clearRect(0, 0, img.width, img.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          tempCanvas,
          0,
          0,
          smallWidth,
          smallHeight,
          0,
          0,
          img.width,
          img.height,
        );

        // Subtle blend
        if (easedProgress > 0.6) {
          ctx.save();
          ctx.globalAlpha = (easedProgress - 0.6) * 2.5;
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(img, 0, 0);
          ctx.restore();
        }
      } else {
        ctx.imageSmoothingEnabled = true;
        ctx.clearRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
      }
    };

    const handleScroll = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(updatePixelation);
    };

    img.onload = () => {
      isLoaded = true;
      // Initial update
      updatePixelation();

      // Listen to scroll events
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll, { passive: true });
    };

    img.src = src;

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [imageLoaded, src]);

  return (
    <div ref={ref} className={className}>
      <div ref={containerRef} className="w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </div>
  );
}
