import { Handle, Position } from "reactflow";
import Image from "next/image";
import {
  Calendar,
  Users,
  Database,
  Mail,
  Github,
  CheckSquare,
  FileText,
  MessageSquare,
  Wrench,
  Search,
  Globe,
  Code,
  Terminal,
  File,
  Settings,
  Brain,
  BookOpen,
  Calculator,
  Clock,
  Monitor,
  Cloud,
  Zap,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Facebook,
  Chrome,
  Building2,
  CreditCard,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Users2,
  MessageCircle,
  Video,
  Camera,
  Share2,
  Briefcase,
  DollarSign,
  Target,
  Megaphone,
  PieChart,
  Workflow,
  Boxes,
  Package,
  Truck,
  Server,
  Layers,
  Shield,
  Lock,
} from "lucide-react";

interface ToolNodeProps {
  data: {
    tool: string;
    parentAgent: string;
  };
}

export function ToolNode({ data }: ToolNodeProps) {
  const { tool } = data;

  // Map of available tool icons (SVG paths)
  const toolIcons: Record<string, string> = {
    calendar: "/icons/calendar.svg",
    contacts: "/icons/contacts.svg",
    databricks: "/icons/databricks.svg",
    email: "/icons/email.svg",
    github: "/icons/github.svg",
    jira: "/icons/jira.svg",
    notion: "/icons/notion.svg",
    slack: "/icons/slack.svg",
  };

  // Function to get appropriate Lucide icon based on tool name
  const getLucideIcon = (toolName: string) => {
    const name = toolName.toLowerCase();

    // Popular brand mappings using contains
    if (name.includes("google")) return Chrome;
    if (name.includes("linkedin")) return Linkedin;
    if (
      name.includes("twitter") ||
      name.includes("x.com") ||
      name.includes(" x ")
    )
      return Twitter;
    if (name.includes("youtube")) return Youtube;
    if (name.includes("instagram")) return Instagram;
    if (name.includes("facebook") || name.includes("meta")) return Facebook;
    if (name.includes("github")) return Github;
    if (name.includes("tiktok")) return Video;
    if (name.includes("snapchat")) return Camera;
    if (name.includes("discord")) return MessageCircle;
    if (name.includes("whatsapp")) return MessageSquare;
    if (name.includes("telegram")) return MessageCircle;
    if (name.includes("pinterest")) return Share2;
    if (name.includes("reddit")) return MessageCircle;

    // B2B SaaS tools
    if (name.includes("salesforce")) return Building2;
    if (name.includes("hubspot")) return TrendingUp;
    if (name.includes("intercom")) return MessageCircle;
    if (name.includes("zendesk")) return Users2;
    if (name.includes("freshworks") || name.includes("freshdesk"))
      return Users2;
    if (name.includes("pipedrive")) return Target;
    if (name.includes("zoho")) return Briefcase;
    if (name.includes("mailchimp")) return Megaphone;
    if (name.includes("stripe")) return CreditCard;
    if (name.includes("paypal")) return DollarSign;
    if (name.includes("shopify")) return ShoppingCart;
    if (name.includes("square")) return CreditCard;
    if (name.includes("quickbooks")) return Calculator;
    if (name.includes("xero")) return BarChart3;
    if (name.includes("asana")) return CheckSquare;
    if (name.includes("trello")) return CheckSquare;
    if (name.includes("monday")) return Workflow;
    if (name.includes("clickup")) return CheckSquare;
    if (name.includes("airtable")) return Database;
    if (name.includes("tableau")) return PieChart;
    if (name.includes("looker")) return BarChart3;
    if (name.includes("power bi") || name.includes("powerbi")) return PieChart;
    if (name.includes("segment")) return Layers;
    if (name.includes("mixpanel")) return BarChart3;
    if (name.includes("amplitude")) return TrendingUp;
    if (name.includes("snowflake")) return Database;
    if (name.includes("bigquery")) return Database;
    if (name.includes("redshift")) return Database;
    if (name.includes("postgres") || name.includes("postgresql"))
      return Database;
    if (name.includes("mysql")) return Database;
    if (name.includes("mongodb")) return Database;
    if (name.includes("redis")) return Database;
    if (name.includes("elasticsearch")) return Search;
    if (name.includes("kubernetes") || name.includes("k8s")) return Boxes;
    if (name.includes("docker")) return Package;
    if (name.includes("jenkins")) return Workflow;
    if (name.includes("gitlab")) return Code;
    if (name.includes("bitbucket")) return Code;
    if (name.includes("aws")) return Cloud;
    if (name.includes("azure")) return Cloud;
    if (name.includes("gcp") || name.includes("google cloud")) return Cloud;
    if (name.includes("vercel")) return Zap;
    if (name.includes("netlify")) return Globe;
    if (name.includes("heroku")) return Cloud;
    if (name.includes("cloudflare")) return Shield;
    if (name.includes("twilio")) return MessageCircle;
    if (name.includes("sendgrid")) return Mail;
    if (name.includes("okta")) return Lock;
    if (name.includes("auth0")) return Shield;
    if (name.includes("supabase")) return Database;
    if (name.includes("firebase")) return Database;
    if (name.includes("planetscale")) return Database;
    if (name.includes("neon")) return Database;
    if (name.includes("railway")) return Truck;
    if (name.includes("render")) return Server;

    // Exact matches for specific tools
    const exactMatches = {
      calendar: Calendar,
      contacts: Users,
      databricks: Database,
      email: Mail,
      jira: CheckSquare,
      notion: FileText,
      slack: MessageSquare,
      search: Search,
      web: Globe,
      code: Code,
      terminal: Terminal,
      bash: Terminal,
      file: File,
      settings: Settings,
      config: Settings,
      ai: Brain,
      llm: Brain,
      docs: BookOpen,
      documentation: BookOpen,
      calculator: Calculator,
      compute: Calculator,
      time: Clock,
      timer: Clock,
      monitor: Monitor,
      system: Monitor,
      cloud: Cloud,
      api: Zap,
      webhook: Zap,
      tool: Wrench,
    };

    return exactMatches[name as keyof typeof exactMatches] || Wrench;
  };

  const iconPath = toolIcons[tool.toLowerCase()];
  const LucideIcon = getLucideIcon(tool);

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3 min-w-[80px] text-center relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2"
        style={{ left: "50%", transform: "translateX(-50%)" }}
      />

      <div className="flex flex-col items-center gap-2">
        {iconPath ? (
          <Image
            src={iconPath}
            alt={tool}
            width={24}
            height={24}
            className="opacity-80"
          />
        ) : (
          <LucideIcon size={24} className="opacity-80 text-gray-600" />
        )}
        <span className="text-xs font-medium text-gray-700 truncate max-w-[70px]">
          {tool}
        </span>
      </div>
    </div>
  );
}
