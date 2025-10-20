'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DEFAULT_THEME_ID } from '@/lib/theme/registry'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeThemeId = mounted ? (theme ?? DEFAULT_THEME_ID) : DEFAULT_THEME_ID
  const isDay = activeThemeId === 'ember-daybreak'
  const nextTheme = isDay ? 'ember-nightfall' : 'ember-daybreak'
  const label = isDay ? 'Light mode' : 'Dark mode'
  const shortLabel = isDay ? 'Light' : 'Dark'

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/70"
      >
        <Moon className="h-3.5 w-3.5" />
        Theme
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(nextTheme)}
      className="h-8 gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition-colors hover:border-orange-400 hover:bg-orange-500/10 hover:text-white dark:border-white/10"
      aria-pressed={isDay}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
        {isDay ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-amber-300" />}
      </span>
      <span>{shortLabel}</span>
      <span className="sr-only">Switch to {isDay ? 'dark' : 'light'} mode</span>
    </Button>
  )
}
