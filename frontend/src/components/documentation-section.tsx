"use client";

import type React from "react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import DiffusionImage from "./ui/diffusion-image";

export default function DocumentationSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a placeholder until theme is mounted to prevent hydration mismatch
  const factoryImage = mounted
    ? theme === "dark"
      ? "/factoryDark.png"
      : "/factoryLight.png"
    : "/factoryLight.png"; // fallback

  return (
    <div className="w-full border-b border-border/50 flex flex-col justify-center items-center">
      {/* Header Section */}
      {/* <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-6 py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4 shadow-none">
          <Badge
            icon={
              <div className="w-[10.50px] h-[10.50px] outline outline-[1.17px] outline-[#37322F] outline-offset-[-0.58px] rounded-full"></div>
            }
            text="Platform Features"
          />
          <div className="self-stretch text-center flex justify-center flex-col text-[#49423D] text-3xl md:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
            Streamline your business operations
          </div>
          <div className="self-stretch text-center text-[#605A57] text-base font-normal leading-7 font-sans">
            Manage schedules, analyze data, and collaborate with your team
            <br />
            all in one powerful platform.
          </div>
        </div>
      </div> */}

      {/* Content Section */}
      <div className="self-stretch px-4 md:px-9 overflow-hidden flex justify-start items-center">
        <div className="flex-1 py-8 md:py-11 flex flex-col md:flex-row justify-start items-end gap-6 md:gap-12">
          {/* Left Column - Image */}
          <div className="w-full md:w-auto rounded-lg flex flex-col justify-center items-center gap-2 order-1 md:order-1 md:px-0 px-[00]">
            <div className="w-full md:w-[580px] h-[250px] md:h-[420px] bg-card shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] dark:shadow-[0px_0px_0px_0.9056603908538818px_rgba(255,255,255,0.05)] overflow-hidden rounded-lg flex flex-col justify-start items-start">
              <DiffusionImage
                src={factoryImage}
                alt="Factory"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column - Single Feature */}
          <div className="w-full md:w-auto md:max-w-[400px] flex flex-col justify-end items-center gap-4 order-2 md:order-2">
            <div className="w-full flex flex-col justify-start items-start">
              <div className="px-6 w-full flex flex-col gap-3">
                <div className="self-stretch flex justify-center flex-col text-foreground text-xl md:text-2xl font-semibold leading-7 md:leading-8 font-title">
                  Launch on Factory
                </div>
                <div className="self-stretch text-muted-foreground text-base md:text-lg font-normal leading-6 md:leading-7 whitespace-pre-line">
                  Create and connect fully functional agents in minutes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
