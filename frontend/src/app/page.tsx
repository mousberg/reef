"use client";

import { useEffect, useRef } from "react";
import { Navigation } from "../components/navigation";
import { LandingHero } from "../components/landing-hero";
import DocumentationSection from "../components/documentation-section";
import SocialProofSection from "../components/social-proof-section";
// import TestimonialsSection from "../components/testimonials-section"
import FAQSection from "../components/faq-section";
import CTASection from "../components/cta-section";
import { Footer } from "../components/Footer";

export default function LandingPage() {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="w-full min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-start items-center max-w-[100vw]">
      <div className="relative flex flex-col justify-start items-center w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen overflow-x-hidden">
          {/* Vertical lines */}
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-border/50 shadow-[1px_0px_0px_rgba(255,255,255,0.1)] dark:shadow-[1px_0px_0px_rgba(0,0,0,0.3)] z-0" />
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-border/50 shadow-[1px_0px_0px_rgba(255,255,255,0.1)] dark:shadow-[1px_0px_0px_rgba(0,0,0,0.3)] z-0" />

          <div className="self-stretch pt-[9px] overflow-hidden flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            <Navigation />
            <LandingHero />
            <DocumentationSection />
            <SocialProofSection />
            {/* <TestimonialsSection /> */}
            <FAQSection />
            <CTASection />
          </div>

          <Footer />
        </div>
      </div>

      {/* ElevenLabs AI Assistant Widget */}
      <elevenlabs-convai agent-id="agent_3101k5p8y1r2e25bn1bb4rjpx932"></elevenlabs-convai>
      <script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        async
        type="text/javascript"
      ></script>
    </div>
  );
}
