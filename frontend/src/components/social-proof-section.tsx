"use client";

import type React from "react";

const logoData = [
  { icon: "/icons/calendar.svg", name: "Calendar" },
  { icon: "/icons/contacts.svg", name: "Contacts" },
  { icon: "/icons/databricks.svg", name: "Databricks" },
  { icon: "/icons/email.svg", name: "Email" },
  { icon: "/icons/github.svg", name: "GitHub" },
  { icon: "/icons/jira.svg", name: "Jira" },
  { icon: "/icons/notion.svg", name: "Notion" },
  { icon: "/icons/slack.svg", name: "Slack" },
];

export default function SocialProofSection() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
          <div className="w-full max-w-[472.55px] text-center flex justify-center flex-col text-[#49423D] dark:text-zinc-100 text-xl md:text-2xl font-semibold leading-7 md:leading-8 font-title tracking-tight">
            Integrate with existing tools
          </div>
          <div className="self-stretch text-center text-[#605A57] dark:text-zinc-400 text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
            Feel the power of AI agents by integrating them with the tools you
            love
          </div>
        </div>
      </div>

      {/* Logo Grid */}
      <div className="self-stretch border-[rgba(55,50,47,0.12)] flex justify-center items-start">
        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
          {/* Left decorative pattern */}
          <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
              />
            ))}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-0">
          {/* Logo Grid - Responsive grid */}
          {logoData.map((logo, index) => {
            const isMobileFirstColumn = index % 2 === 0;
            const isDesktopFirstColumn = index % 4 === 0;
            const isDesktopLastColumn = index % 4 === 3;
            const isDesktopTopRow = index < 4;
            const isDesktopBottomRow = index >= 4;

            return (
              <div
                key={index}
                className={`
                  h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 flex justify-center items-center
                  border-t border-b border-[rgba(227,226,225,0.5)]
                  ${index < 6 ? "sm:border-b-[0.5px]" : "sm:border-b"}
                  ${index >= 6 ? "border-b" : ""}
                  ${isMobileFirstColumn ? "border-r-[0.5px]" : ""}
                  sm:border-r-[0.5px] sm:border-l-0
                  ${isDesktopFirstColumn ? "md:border-l" : "md:border-l-[0.5px]"}
                  ${isDesktopLastColumn ? "md:border-r" : "md:border-r-[0.5px]"}
                  ${isDesktopTopRow ? "md:border-b-[0.5px]" : ""}
                  ${isDesktopBottomRow ? "md:border-t-[0.5px] md:border-b" : ""}
                  border-[#E3E2E1]
                `}
              >
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10">
                  <img
                    src={logo.icon}
                    alt={logo.name}
                    className="w-full h-full object-contain brightness-0 dark:brightness-100 dark:invert"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
          {/* Right decorative pattern */}
          <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
