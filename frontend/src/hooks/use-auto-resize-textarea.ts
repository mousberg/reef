import { useRef, useCallback } from "react";

interface UseAutoResizeTextareaProps {
  minHeight?: number;
  maxHeight?: number;
}

export function useAutoResizeTextarea({
  minHeight = 72,
  maxHeight = 300,
}: UseAutoResizeTextareaProps = {}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to allow shrinking
    textarea.style.height = "auto";

    // Calculate new height
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight));

    // Set the new height
    textarea.style.height = `${newHeight}px`;
  }, [minHeight, maxHeight]);

  return {
    textareaRef,
    adjustHeight,
  };
}
