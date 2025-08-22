import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl bg-card px-4 py-3 text-sm font-medium",
          "border-2 border-border backdrop-filter backdrop-blur-sm",
          "placeholder:text-muted-foreground placeholder:font-normal",
          "transition-all duration-200",
          "hover:border-primary/30 hover:bg-hover-bg",
          "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
          "focus:bg-card focus:shadow-lg focus:shadow-primary/5",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
          "grok-input touch-friendly tracking-normal", // 44px minimum height + normal letter spacing
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }