import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105 hover:shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "border-secondary/20 bg-secondary/10 text-secondary-foreground hover:bg-secondary/20",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline: "text-foreground border-border bg-card hover:bg-hover-bg",
        success: "border-green-500/20 bg-green-500/10 text-green-600 hover:bg-green-500/20",
        warning: "border-orange-500/20 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
        "priority-high": "border-priority-high-border bg-priority-high-bg text-priority-high",
        "priority-medium": "border-priority-medium-border bg-priority-medium-bg text-priority-medium",
        "priority-low": "border-priority-low-border bg-priority-low-bg text-priority-low",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }