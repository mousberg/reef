"use client";

import { useState } from "react";

interface JsonViewerProps {
  data: any;
  title: string;
  className?: string;
}

export function JsonViewer({ data, title, className = "" }: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
    return null;
  }

  const formatJson = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const getPreview = (obj: any): string => {
    if (typeof obj === "string")
      return obj.length > 50 ? obj.substring(0, 50) + "..." : obj;
    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (keys.length === 0) return "{}";
      if (keys.length === 1) return `{ ${keys[0]}: ... }`;
      return `{ ${keys.slice(0, 2).join(", ")}${keys.length > 2 ? ", ..." : ""} }`;
    }
    return String(obj);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h4 className="text-[#2F3037] font-medium text-sm">{title}</h4>
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <span className="text-[#556B5D] text-xs font-mono bg-[#F7F5F3] px-2 py-1 rounded">
              {getPreview(data)}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-[#556B5D] transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="relative animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <pre className="bg-[#F7F5F3] p-3 rounded-lg text-xs overflow-auto max-h-64 text-[#37322F] border border-[rgba(55,50,47,0.12)] font-mono leading-relaxed">
            {formatJson(data)}
          </pre>
        </div>
      )}
    </div>
  );
}
