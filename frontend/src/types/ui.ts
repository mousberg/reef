import { ReactNode, FC, ComponentType } from "react";
import { LucideIcon } from "lucide-react";

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  style?: React.CSSProperties;
}

export interface ActionItem {
  id?: string;
  label: string;
  icon: LucideIcon | FC | ComponentType<any>;
  badge?: string;
  description?: string;
  action: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "default" | "primary" | "secondary" | "danger";
  shortcut?: string;
}

export interface PopoverProps extends BaseComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

export interface ButtonProps extends BaseComponentProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  icon?: LucideIcon | FC;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "error" | "warning" | "info";
}

export interface LoadingStateProps extends BaseComponentProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export interface ErrorStateProps extends BaseComponentProps {
  error: Error | string;
  retry?: () => void;
  title?: string;
}
