'use client'

import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getThemeDefinition, getThemeIds, DEFAULT_THEME_ID } from '@/lib/theme/registry'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const themeIds = useMemo(() => getThemeIds(), [])
  const activeThemeId = mounted ? (theme ?? DEFAULT_THEME_ID) : DEFAULT_THEME_ID
  const activeTheme = getThemeDefinition(activeThemeId)

  const handleNextTheme = () => {
    const currentIndex = themeIds.indexOf(activeThemeId)
    const nextIndex = (currentIndex + 1) % themeIds.length
    setTheme(themeIds[nextIndex])
  }

  const accentGradient = activeTheme.tokens['board-task-accent']
  const primaryHsl = activeTheme.tokens['primary']
  const previewBackground = accentGradient
    ? accentGradient
    : primaryHsl
      ? `hsl(${primaryHsl})`
      : 'linear-gradient(135deg, rgba(148, 163, 184, 0.45), rgba(59, 130, 246, 0.3))'

  const previewStyle: CSSProperties = {
    background: previewBackground,
    boxShadow: '0 0 12px rgba(15, 23, 42, 0.15)'
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3 gap-2 rounded-full"
      >
        <div className="h-4 w-4 rounded-full bg-muted" />
        <span className="text-xs font-medium text-muted-foreground">Theme</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleNextTheme}
      className={cn(
        'h-9 px-3 gap-2 rounded-full border border-border/40 bg-background/60 backdrop-blur transition-all duration-200',
        'hover:border-primary/40 hover:bg-background/70'
      )}
    >
      <span
        aria-hidden
        className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
        style={previewStyle}
      />
      <span className="text-xs font-medium text-muted-foreground">
        {activeTheme.label}
      </span>
      <ChevronRight className="h-3 w-3 text-muted-foreground/80" />
      <span className="sr-only">Cycle theme</span>
    </Button>
  )
}
