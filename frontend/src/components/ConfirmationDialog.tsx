import { useState, useEffect } from "react";
import { Button } from "./ui/button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  loading = false,
}: ConfirmationDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`relative bg-white rounded-[24px] shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] border border-[rgba(2,6,23,0.08)] p-8 mx-4 max-w-md w-full transition-all duration-200 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="text-center">
          <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-3">
            {title}
          </h2>
          <p className="text-[#37322F] text-base leading-6 font-sans opacity-70 mb-8">
            {description}
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={onClose}
              disabled={loading}
              className="bg-[#F7F5F3] hover:bg-[#EFEDE9] text-[#37322F] border border-[rgba(55,50,47,0.12)] rounded-[12px] px-6 py-3 text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50"
            >
              {cancelText}
            </Button>
            <Button
              onClick={() => {
                console.log(
                  "Confirmation button clicked, calling onConfirm...",
                );
                onConfirm();
              }}
              disabled={loading}
              className={`rounded-[12px] px-6 py-3 text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50 ${
                confirmVariant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-[#37322F] hover:bg-[#2F2B28] text-white"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
