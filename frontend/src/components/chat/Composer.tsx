"use client";

import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Loader2, Plus, Mic } from "lucide-react";
import ComposerActionsPopover from "./ComposerActionsPopover";
import { cls } from "../../lib/utils";

interface ComposerProps {
  onSend?: (message: string) => Promise<void> | void;
  busy?: boolean;
}

export interface ComposerRef {
  insertTemplate: (templateContent: string) => void;
  focus: () => void;
}

const Composer = forwardRef<ComposerRef, ComposerProps>(function Composer(
  { onSend, busy },
  ref,
) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const [pendingMessage, setPendingMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content with max height limit
  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      const lineHeight = 20; // Approximate line height in pixels
      const minHeight = 40;

      // Reset height to calculate scroll height
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const calculatedLines = Math.max(
        1,
        Math.floor((scrollHeight - 16) / lineHeight),
      ); // 16px for padding

      setLineCount(calculatedLines);

      if (calculatedLines <= 12) {
        // Auto-expand for 1-12 lines
        textarea.style.height = `${Math.max(minHeight, scrollHeight)}px`;
        textarea.style.overflowY = "hidden";
      } else {
        // Fixed height with scroll for 12+ lines
        textarea.style.height = `${minHeight + 11 * lineHeight}px`; // 12 lines total
        textarea.style.overflowY = "auto";
      }
    }
  }, [value]);

  // Handle busy state changes - restore message when no longer busy
  useEffect(() => {
    if (!busy && !sending && pendingMessage && !value) {
      setValue(pendingMessage);
      setPendingMessage("");
    }
  }, [busy, sending, pendingMessage, value]);

  // Expose methods to parent component via ref
  useImperativeHandle(
    ref,
    () => ({
      // Insert template content into composer, maintaining existing text
      insertTemplate: (templateContent: string) => {
        setValue((prev) => {
          const newValue = prev
            ? `${prev}\n\n${templateContent}`
            : templateContent;
          // Focus and position cursor at end after state update
          setTimeout(() => {
            inputRef.current?.focus();
            const length = newValue.length;
            inputRef.current?.setSelectionRange(length, length);
          }, 0);
          return newValue;
        });
      },
      // Focus the input field
      focus: () => {
        inputRef.current?.focus();
      },
    }),
    [],
  );

  // Handle sending message with validation and cleanup
  async function handleSend() {
    if (!value.trim() || sending) return;
    setSending(true);
    const messageToSend = value.trim();

    // Store message and clear input immediately when sending
    setPendingMessage(messageToSend);
    setValue("");

    try {
      await onSend?.(messageToSend);
      setPendingMessage(""); // Clear pending message after successful send
      inputRef.current?.focus(); // Keep focus for continuous typing
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="w-full flex flex-col items-center px-4 pb-6 pt-2">
      <div className="w-full max-w-3xl">
        <div
          className={cls(
            "relative flex items-center gap-3 rounded-[26px] border bg-white shadow-sm dark:bg-zinc-950 transition-all duration-200",
            "border-zinc-300 dark:border-zinc-700 px-4",
            lineCount > 1 ? "py-3" : "py-2",
          )}
        >
          <ComposerActionsPopover>
            <button
              className="inline-flex shrink-0 items-center justify-center rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
              title="Add attachment"
            >
              <Plus className="h-5 w-5" />
            </button>
          </ComposerActionsPopover>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={busy ? "AI is thinking..." : "Message"}
              rows={1}
              disabled={busy}
              className={cls(
                "w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-zinc-400 transition-all duration-200",
                "py-3 leading-5",
                busy && "cursor-not-allowed opacity-60",
              )}
              style={{
                height: "auto",
                overflowY: lineCount > 12 ? "auto" : "hidden",
                maxHeight: lineCount > 12 ? "300px" : "auto",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex shrink-0 items-center justify-center rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors">
              <Mic className="h-5 w-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={sending || busy || !value.trim()}
              className={cls(
                "inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-black text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                (sending || busy || !value.trim()) &&
                  "opacity-50 cursor-not-allowed",
              )}
            >
              {sending || busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon"
                >
                  <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Composer;
