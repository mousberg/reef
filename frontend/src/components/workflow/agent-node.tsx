import { Handle, Position } from "reactflow";
import { WorkflowAgent } from "@/types/workflow";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Image from "next/image";
import {
  Wrench,
  Database,
  Search,
  FileText,
  MessageSquare,
  Code,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Zap,
  Calendar,
  Mail,
} from "lucide-react";

interface AgentNodeProps {
  data: {
    agent: WorkflowAgent;
    agentName: string;
    isFirst?: boolean;
    isLast?: boolean;
  };
}

// Tool mapping for specific service logos
const getToolLogo = (tool: string) => {
  const toolLower = tool.toLowerCase();

  // Map specific services to their logos
  const logoMap: { [key: string]: string } = {
    slack: "/icons/slack.svg",
    github: "/icons/github.svg",
    jira: "/icons/jira.svg",
    notion: "/icons/notion.svg",
    databricks: "/icons/databricks.svg",
    calendar: "/icons/calendar.svg",
    email: "/icons/email.svg",
    contacts: "/icons/contacts.svg",
    linkedin: "/icons/linkedin.svg",
  };

  // Check for exact matches first
  for (const [service, logoPath] of Object.entries(logoMap)) {
    if (toolLower.includes(service)) {
      return logoPath;
    }
  }

  return null; // No specific logo found
};

// Component for rendering tool icons
const ToolIcon = ({
  tool,
  className,
}: {
  tool: string;
  className?: string;
}) => {
  const logoPath = getToolLogo(tool);

  if (logoPath) {
    return (
      <Image
        src={logoPath}
        alt={tool}
        width={12}
        height={12}
        className={className}
      />
    );
  }

  // Fallback to Lucide icons
  const toolLower = tool.toLowerCase();
  let IconComponent = Wrench; // default

  if (toolLower.includes("search") || toolLower.includes("web"))
    IconComponent = Search;
  else if (toolLower.includes("database") || toolLower.includes("sql"))
    IconComponent = Database;
  else if (toolLower.includes("file") || toolLower.includes("document"))
    IconComponent = FileText;
  else if (toolLower.includes("message") || toolLower.includes("chat"))
    IconComponent = MessageSquare;
  else if (toolLower.includes("code") || toolLower.includes("script"))
    IconComponent = Code;
  else if (toolLower.includes("api") || toolLower.includes("http"))
    IconComponent = Globe;
  else if (toolLower.includes("config") || toolLower.includes("setting"))
    IconComponent = Settings;
  else if (toolLower.includes("calendar") || toolLower.includes("schedule"))
    IconComponent = Calendar;
  else if (toolLower.includes("email") || toolLower.includes("mail"))
    IconComponent = Mail;

  return <IconComponent className={className} />;
};

const getNodeColors = (isFirst: boolean, isLast: boolean) => {
  if (isFirst)
    return {
      border: "border-emerald-200",
      bg: "bg-white",
      accent: "text-emerald-600",
      topBar: "bg-emerald-500",
    };
  if (isLast)
    return {
      border: "border-rose-200",
      bg: "bg-white",
      accent: "text-rose-600",
      topBar: "bg-rose-500",
    };
  return {
    border: "border-slate-200",
    bg: "bg-white",
    accent: "text-slate-600",
    topBar: "bg-slate-400",
  };
};

export function AgentNode({ data }: AgentNodeProps) {
  const { agent, isFirst, isLast } = data;
  const [isExpanded, setIsExpanded] = useState(false);

  const colors = getNodeColors(isFirst || false, isLast || false);

  return (
    <div
      className={`
        relative border-2 rounded-2xl shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out cursor-pointer
        w-[260px] backdrop-blur-sm
        ${colors.border} ${colors.bg}
        hover:scale-[1.02] hover:-translate-y-0.5
        ${isExpanded ? "ring-2 ring-blue-300/50 shadow-2xl" : ""}
        group overflow-hidden
      `}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Status indicator bar */}
      <div className={`h-1 w-full ${colors.topBar}`} />

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-white bg-slate-400 hover:bg-slate-600 transition-colors shadow-sm"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-white bg-slate-400 hover:bg-slate-600 transition-colors shadow-sm"
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200/60">
                <Zap className={`w-3.5 h-3.5 ${colors.accent}`} />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 truncate">
                {agent.name}
              </h3>
            </div>

            {/* Status badges */}
            {(isFirst || isLast) && (
              <div className="flex items-center gap-1 mb-2">
                {isFirst && (
                  <Badge className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    START
                  </Badge>
                )}
                {isLast && (
                  <Badge className="text-xs px-2 py-0.5 bg-rose-100 text-rose-700 border-rose-300 shadow-sm">
                    <ArrowRight className="w-3 h-3 mr-1" />
                    END
                  </Badge>
                )}
              </div>
            )}
          </div>

          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors group-hover:bg-slate-100/50">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>

        {/* Task description */}
        <div className="mb-3">
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-medium">
            {agent.task}
          </p>
        </div>

        {/* Tools - Elegant compact display */}
        {agent.tools && agent.tools.length > 0 && (
          <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Settings className="w-3 h-3" />
                Tools
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {agent.tools.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {agent.tools.slice(0, 5).map((tool, index) => {
                return (
                  <div
                    key={index}
                    className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200/60 hover:shadow-md transition-all hover:scale-105"
                    title={tool}
                  >
                    <ToolIcon tool={tool} className="w-3 h-3 text-slate-600" />
                  </div>
                );
              })}
              {agent.tools.length > 5 && (
                <div
                  className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200/60 text-xs text-slate-500 font-semibold min-w-[28px] text-center"
                  title={`${agent.tools.length - 5} more tools`}
                >
                  +{agent.tools.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-4 space-y-3 pt-3 border-t border-slate-200/60">
            {/* Instructions */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="text-xs font-semibold text-slate-700">
                  Instructions
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {agent.instructions}
              </p>
            </div>

            {/* Input/Output Flow */}
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <ArrowRight className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    Input
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {agent.expected_input}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <ArrowRight className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    Output
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {agent.expected_output}
                  </p>
                </div>
              </div>
            </div>

            {/* All Tools - Expanded View */}
            {agent.tools && agent.tools.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-slate-700">
                    All Tools
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {agent.tools.map((tool, index) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/60 shadow-sm"
                      >
                        <ToolIcon
                          tool={tool}
                          className="w-3 h-3 text-slate-600 flex-shrink-0"
                        />
                        <span className="text-xs text-slate-700 truncate font-medium">
                          {tool}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Connected Agents */}
            {agent.connected_agents && agent.connected_agents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-slate-700">
                    Connections
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.connected_agents.map((connectedAgent, index) => (
                    <Badge
                      key={index}
                      className="text-xs border-slate-200 text-slate-700 bg-slate-50 shadow-sm"
                    >
                      {connectedAgent}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
