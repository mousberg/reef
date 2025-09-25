"use client";

import { useMemo } from "react";
import type { AgentTrace, AgentSpan } from "@/types/traces";
import { formatDistanceToNow } from "date-fns";

interface TraceTimelineProps {
  traces: AgentTrace[];
  spans: AgentSpan[];
  onTraceSelect?: (traceId: string) => void;
  onSpanSelect?: (spanId: string) => void;
  className?: string;
}

export function TraceTimeline({
  traces,
  spans,
  onTraceSelect,
  onSpanSelect,
  className = "",
}: TraceTimelineProps) {
  const timelineData = useMemo(() => {
    const items: Array<{
      id: string;
      type: "trace" | "span";
      timestamp: Date;
      title: string;
      status: string;
      data: AgentTrace | AgentSpan;
    }> = [];

    // Helper function to safely convert timestamps
    const toDate = (timestamp: Date | { toDate?: () => Date }): Date => {
      if (timestamp instanceof Date) return timestamp;
      if (
        timestamp &&
        typeof timestamp === "object" &&
        "toDate" in timestamp &&
        typeof timestamp.toDate === "function"
      ) {
        return timestamp.toDate();
      }
      return new Date(timestamp as any);
    };

    // Add traces
    traces.forEach((trace) => {
      items.push({
        id: trace.id,
        type: "trace",
        timestamp: toDate(trace.start_time),
        title: trace.metadata?.name || "Unnamed Trace",
        status: trace.status,
        data: trace,
      });
    });

    // Add spans
    spans.forEach((span) => {
      items.push({
        id: span.id,
        type: "span",
        timestamp: toDate(span.start_time),
        title: span.metadata?.name || "Unnamed Span",
        status: span.status,
        data: span,
      });
    });

    // Sort by timestamp (newest first)
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [traces, spans]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500";
      case "failed":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      case "running":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === "trace") {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      );
    }
  };

  if (timelineData.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-[#556B5D] text-sm">No timeline data available</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-[#2F3037] font-medium text-base flex items-center gap-2">
        <svg
          className="w-5 h-5 text-[#556B5D]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Timeline ({timelineData.length} items)
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[rgba(55,50,47,0.12)]"></div>

        <div className="space-y-4">
          {timelineData.map((item) => (
            <div key={item.id} className="relative flex items-start gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex items-center justify-center">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}
                ></div>
              </div>

              {/* Content */}
              <div
                className="flex-1 bg-white/50 border border-[rgba(55,50,47,0.12)] rounded-lg p-3 cursor-pointer hover:bg-white/70 transition-all duration-200 hover:shadow-md hover:scale-[1.01] animate-in fade-in-0 slide-in-from-right-4"
                onClick={() => {
                  if (item.type === "trace" && onTraceSelect) {
                    onTraceSelect(item.id);
                  } else if (item.type === "span" && onSpanSelect) {
                    onSpanSelect(item.id);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-[#556B5D]">
                      {getTypeIcon(item.type)}
                    </div>
                    <span className="text-[#2F3037] font-medium text-sm">
                      {item.title}
                    </span>
                    <span className="text-[#556B5D] text-xs font-mono bg-[#F7F5F3] px-2 py-1 rounded uppercase">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[#556B5D] text-xs">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium capitalize px-2 py-1 rounded-full ${
                      item.status === "completed"
                        ? "text-emerald-700 bg-emerald-50"
                        : item.status === "failed"
                          ? "text-red-700 bg-red-50"
                          : item.status === "pending"
                            ? "text-yellow-700 bg-yellow-50"
                            : item.status === "running"
                              ? "text-blue-700 bg-blue-50"
                              : "text-[#556B5D] bg-[#F7F5F3]"
                    }`}
                  >
                    {item.status}
                  </span>

                  {item.data &&
                    "metadata" in item.data &&
                    item.data.metadata && (
                      <span className="text-[#556B5D] text-xs">
                        {item.type === "trace"
                          ? (item.data as AgentTrace).metadata.agent_type
                          : (item.data as AgentSpan).type}
                      </span>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
