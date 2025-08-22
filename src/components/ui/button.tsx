import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-touch touch-action-manipulation grok-button-enhanced",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
        outline: "border-2 border-border bg-background text-foreground shadow-sm hover:shadow-md hover:bg-hover-bg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
        ghost: "text-foreground hover:bg-hover-bg hover:-translate-y-0.5 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        success: "bg-green-500 text-white shadow-sm hover:shadow-md hover:bg-green-600 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
      },
      size: {
        default: "h-10 px-6 py-2.5 rounded-xl",
        sm: "h-8 px-4 py-1.5 rounded-lg text-xs",
        lg: "h-12 px-8 py-3 rounded-xl text-base",
        icon: "h-10 w-10 rounded-xl",
        touch: "min-h-touch min-w-touch h-12 px-6 rounded-xl", // Mobile-first touch-friendly
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }