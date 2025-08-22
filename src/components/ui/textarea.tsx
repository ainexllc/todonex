import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl bg-card px-4 py-3 text-sm font-medium",
          "border-2 border-border backdrop-filter backdrop-blur-sm",
          "placeholder:text-muted-foreground placeholder:font-normal",
          "transition-all duration-200 resize-vertical",
          "hover:border-primary/30 hover:bg-hover-bg",
          "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
          "focus:bg-card focus:shadow-lg focus:shadow-primary/5",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
          "grok-textarea line-height-relaxed tracking-normal",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }