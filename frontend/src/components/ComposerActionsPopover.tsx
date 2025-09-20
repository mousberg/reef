"use client"
import { useState, ReactNode, FC } from "react"
import { Paperclip, Bot, Search, Palette, BookOpen, MoreHorizontal, Globe, ChevronRight, LucideIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

import { ActionItem } from "@/types/ui"

type Action = Omit<ActionItem, "icon"> & {
  icon: LucideIcon | FC
}

interface ComposerActionsPopoverProps {
  children: ReactNode
}

interface ActionButtonProps {
  action: Action
  onAction: (action: () => void) => void
}

const ActionButton: FC<ActionButtonProps> = ({ action, onAction }) => {
  const IconComponent = action.icon
  const isCustomIcon = typeof IconComponent === "function" && !("displayName" in IconComponent)
  
  return (
    <button
      onClick={() => onAction(action.action)}
      className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
    >
      {isCustomIcon ? <IconComponent /> : <IconComponent className="h-4 w-4" />}
      <span>{action.label}</span>
      {action.badge && (
        <span className="ml-auto px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
          {action.badge}
        </span>
      )}
    </button>
  )
}

const ComposerActionsPopover: FC<ComposerActionsPopoverProps> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [showMore, setShowMore] = useState<boolean>(false)

  const mainActions: Action[] = [
    {
      icon: Paperclip,
      label: "Add photos & files",
      action: () => console.log("Add photos & files"),
    },
    {
      icon: Bot,
      label: "Agent mode",
      badge: "NEW",
      action: () => console.log("Agent mode"),
    },
    {
      icon: Search,
      label: "Deep research",
      action: () => console.log("Deep research"),
    },
    {
      icon: Palette,
      label: "Create image",
      action: () => console.log("Create image"),
    },
    {
      icon: BookOpen,
      label: "Study and learn",
      action: () => console.log("Study and learn"),
    },
  ]

  const moreActions: Action[] = [
    {
      icon: Globe,
      label: "Web search",
      action: () => console.log("Web search"),
    },
    {
      icon: Palette,
      label: "Canvas",
      action: () => console.log("Canvas"),
    },
    {
      icon: () => (
        <div className="h-4 w-4 rounded bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
          <div className="h-2 w-2 bg-white rounded-full" />
        </div>
      ),
      label: "Connect Google Drive",
      action: () => console.log("Connect Google Drive"),
    },
    {
      icon: () => (
        <div className="h-4 w-4 rounded bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
          <div className="h-2 w-2 bg-white rounded-full" />
        </div>
      ),
      label: "Connect OneDrive",
      action: () => console.log("Connect OneDrive"),
    },
    {
      icon: () => (
        <div className="h-4 w-4 rounded bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center">
          <div className="h-2 w-2 bg-white rounded-full" />
        </div>
      ),
      label: "Connect Sharepoint",
      action: () => console.log("Connect Sharepoint"),
    },
  ]

  const handleAction = (action: () => void): void => {
    action()
    setOpen(false)
    setShowMore(false)
  }

  const handleMoreClick = (): void => {
    setShowMore(true)
  }

  const handleOpenChange = (newOpen: boolean): void => {
    setOpen(newOpen)
    if (!newOpen) {
      setShowMore(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start" side="top">
        {!showMore ? (
          <div className="p-3">
            <div className="space-y-1">
              {mainActions.map((action, index) => (
                <ActionButton key={index} action={action} onAction={handleAction} />
              ))}
              <button
                onClick={handleMoreClick}
                className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span>More</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex">
            <div className="flex-1 p-3 border-r border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                {mainActions.map((action, index) => (
                  <ActionButton key={index} action={action} onAction={handleAction} />
                ))}
                <button
                  onClick={handleMoreClick}
                  className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span>More</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-3">
              <div className="space-y-1">
                {moreActions.map((action, index) => (
                  <ActionButton key={index} action={action} onAction={handleAction} />
                ))}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default ComposerActionsPopover