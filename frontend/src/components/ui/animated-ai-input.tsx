"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export function AnimatedAIInput() {
  const [value, setValue] = useState("");
  const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini");
  const [isCreating, setIsCreating] = useState(false);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user, createProject } = useAuth();

  const staticText = "Create an agent that ";
  const dynamicTexts = [
    "responds to my whatsapp messages",
    "books me an uber ride",
    "researches my X feed",
  ];

  const AI_MODELS = [
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-5-chat",
    "mistral-large",
    "magistral-medium", // Magistral Medium 1.2 (Sep 2025, reasoning+vision, 128k)
    "codestral-2508", // Codestral 2508 (Jul 2025, coding, 256k)
  ];

  // Animated typing effect for placeholder
  useEffect(() => {
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const typeEffect = () => {
      const currentDynamicText = dynamicTexts[currentTextIndex];

      if (!isDeleting) {
        // Typing forward
        const dynamicPart = currentDynamicText.slice(0, currentCharIndex + 1);
        setAnimatedPlaceholder(staticText + dynamicPart);
        currentCharIndex++;

        if (currentCharIndex === currentDynamicText.length) {
          // Pause at end before deleting
          timeoutId = setTimeout(() => {
            isDeleting = true;
            typeEffect();
          }, 2000);
          return;
        }

        timeoutId = setTimeout(typeEffect, 50);
      } else {
        // Deleting backward
        const dynamicPart = currentDynamicText.slice(0, currentCharIndex);
        setAnimatedPlaceholder(staticText + dynamicPart);
        currentCharIndex--;

        if (currentCharIndex < 0) {
          // Move to next text
          currentTextIndex = (currentTextIndex + 1) % dynamicTexts.length;
          isDeleting = false;
          currentCharIndex = 0;

          // Pause before typing next
          timeoutId = setTimeout(typeEffect, 500);
          return;
        }

        timeoutId = setTimeout(typeEffect, 30);
      }
    };

    // Start the animation
    typeEffect();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = async () => {
    if (!value.trim()) return;

    // Check if user is authenticated
    if (!user) {
      router.push("/auth");
      return;
    }

    setIsCreating(true);
    try {
      // Create project in Firebase
      const projectId = await createProject(user.uid);

      // Navigate to project page with initial prompt
      router.push(`/projects/${projectId}?prompt=${encodeURIComponent(value)}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = value.trim().length > 0;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  // Maintain focus when layout changes
  useEffect(() => {
    if (hasContent && textareaRef.current) {
      // When transitioning to expanded layout, maintain focus
      const timeoutId = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Position cursor at end
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [hasContent]);

  return (
    <div className="w-full max-w-[700px] lg:w-[700px] mx-auto py-6 px-4">
      <div className="bg-background/20 dark:bg-zinc-600/10 backdrop-blur-lg rounded-[32px] p-1.5 border border-border/15 shadow-2xl transition-all duration-300 ease-in-out">
        <div className="bg-background/40 dark:bg-zinc-500/15 backdrop-blur-md rounded-[28px] border border-border/20 p-3 transition-all duration-300 ease-in-out">
          <div className="flex flex-col gap-2">
            {/* Textarea */}
            <textarea
              key="main-textarea"
              ref={textareaRef}
              value={value}
              placeholder={animatedPlaceholder}
              className="w-full bg-transparent border-none outline-none resize-none text-[15px] text-foreground placeholder-zinc-600 dark:placeholder-zinc-400 px-2"
              rows={1}
              onKeyDown={handleKeyDown}
              onChange={(e) => setValue(e.target.value)}
              style={{
                maxHeight: "200px",
                overflowY: "auto",
              }}
            />

            {/* Bottom row - always present but conditionally visible */}
            <div
              className={`flex items-center transition-all duration-300 ease-in-out ${hasContent ? "justify-between opacity-100 h-auto" : "justify-end opacity-0 h-0 overflow-hidden"}`}
            >
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="pl-3 pr-8 py-1.5 bg-secondary/50 hover:bg-secondary/70 border border-border/50 rounded-xl text-xs font-medium text-foreground cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='%23666' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "12px 12px",
                }}
              >
                {AI_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSubmit}
                disabled={!hasContent || isCreating}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                type="button"
              >
                {isCreating ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="animate-spin text-primary-foreground"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      className="opacity-75"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary-foreground"
                  >
                    <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
                  </svg>
                )}
              </button>
            </div>

            {/* Buttons row - visible when no content */}
            <div
              className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${!hasContent ? "justify-end opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}`}
            >
              <button
                disabled={false}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-700 dark:border-gray-600 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-800 dark:hover:border-gray-500 cursor-pointer"
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-700 dark:text-gray-600"
                >
                  <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
