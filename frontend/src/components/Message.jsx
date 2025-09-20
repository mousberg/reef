import { cls } from "./utils"

export default function Message({ role, children }) {
  const isUser = role === "user"
  return (
    <div className={cls("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cls(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          isUser
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800",
        )}
      >
        {children}
      </div>
    </div>
  )
}
