import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hover?: boolean
    variant?: 'default' | 'elevated' | 'glass' | 'subtle'
    elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  }
>(({ className, hover = false, variant = 'default', elevation = 'sm', ...props }, ref) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-card border border-border/50 shadow-lg backdrop-blur-sm'
      case 'glass':
        return 'bg-card/95 border border-border/30 backdrop-blur-xl shadow-xl'
      case 'subtle':
        return 'bg-card/50 border border-border/20 backdrop-blur-sm'
      default:
        return 'bg-card border border-border/40'
    }
  }

  const getElevationClasses = () => {
    switch (elevation) {
      case 'none':
        return ''
      case 'sm':
        return 'shadow-sm'
      case 'md':
        return 'shadow-md'
      case 'lg':
        return 'shadow-lg shadow-black/5 dark:shadow-black/20'
      case 'xl':
        return 'shadow-xl shadow-black/10 dark:shadow-black/30'
      default:
        return 'shadow-sm'
    }
  }

  const getHoverClasses = () => {
    if (!hover) return ''
    
    return `cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/8 dark:hover:shadow-black/25 hover:-translate-y-0.5 hover:border-primary/20`
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl text-card-foreground transition-all duration-200",
        getVariantClasses(),
        getElevationClasses(),
        getHoverClasses(),
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: 'tight' | 'normal' | 'relaxed'
  }
>(({ className, spacing = 'normal', ...props }, ref) => {
  const getSpacingClasses = () => {
    switch (spacing) {
      case 'tight':
        return 'space-y-1 p-4'
      case 'relaxed':
        return 'space-y-2 p-6'
      default:
        return 'space-y-1.5 p-5'
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col border-b border-border/20 bg-gradient-to-r from-transparent to-muted/5",
        getSpacingClasses(),
        className
      )}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }
>(({ className, size = 'md', ...props }, ref) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-base font-medium'
      case 'lg':
        return 'text-xl font-semibold'
      case 'xl':
        return 'text-2xl font-bold'
      default:
        return 'text-lg font-semibold'
    }
  }

  return (
    <h3
      ref={ref}
      className={cn(
        "leading-tight tracking-tight text-foreground transition-colors",
        getSizeClasses(),
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: 'xs' | 'sm' | 'md'
    weight?: 'normal' | 'medium' | 'semibold'
  }
>(({ className, size = 'sm', weight = 'normal', ...props }, ref) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-xs'
      case 'md':
        return 'text-base'
      default:
        return 'text-sm'
    }
  }

  const getWeightClasses = () => {
    switch (weight) {
      case 'medium':
        return 'font-medium'
      case 'semibold':
        return 'font-semibold'
      default:
        return 'font-normal'
    }
  }

  return (
    <p
      ref={ref}
      className={cn(
        "text-muted-foreground leading-relaxed transition-colors",
        getSizeClasses(),
        getWeightClasses(),
        className
      )}
      {...props}
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: 'tight' | 'normal' | 'relaxed'
    noPadding?: boolean
  }
>(({ className, spacing = 'normal', noPadding = false, ...props }, ref) => {
  const getSpacingClasses = () => {
    if (noPadding) return ''
    
    switch (spacing) {
      case 'tight':
        return 'p-4'
      case 'relaxed':
        return 'p-6'
      default:
        return 'p-5'
    }
  }

  return (
    <div 
      ref={ref} 
      className={cn(
        "first:pt-0 last:pb-0",
        getSpacingClasses(),
        className
      )} 
      {...props} 
    />
  )
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: 'tight' | 'normal' | 'relaxed'
    justify?: 'start' | 'center' | 'end' | 'between' | 'around'
    border?: boolean
  }
>(({ className, spacing = 'normal', justify = 'start', border = false, ...props }, ref) => {
  const getSpacingClasses = () => {
    switch (spacing) {
      case 'tight':
        return 'p-4 pt-0'
      case 'relaxed':
        return 'p-6 pt-0'
      default:
        return 'p-5 pt-0'
    }
  }

  const getJustifyClasses = () => {
    switch (justify) {
      case 'center':
        return 'justify-center'
      case 'end':
        return 'justify-end'
      case 'between':
        return 'justify-between'
      case 'around':
        return 'justify-around'
      default:
        return 'justify-start'
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center transition-colors",
        border && "border-t border-border/20 bg-gradient-to-r from-transparent to-muted/5",
        getSpacingClasses(),
        getJustifyClasses(),
        className
      )}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }