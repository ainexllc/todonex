'use client'

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { ComponentProps, ReactNode, useEffect } from 'react'
import { applyTheme, DEFAULT_THEME_ID, getThemeIds } from '@/lib/theme/registry'

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>

function ThemeSynchronizer({ children }: { children: ReactNode }) {
  const { theme, resolvedTheme } = useTheme()
  const activeTheme = theme === 'system' ? resolvedTheme : theme

  useEffect(() => {
    applyTheme(activeTheme ?? DEFAULT_THEME_ID)
  }, [activeTheme])

  return <>{children}</>
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={DEFAULT_THEME_ID}
      themes={getThemeIds()}
      enableSystem={false}
      storageKey="todonex-theme"
      disableTransitionOnChange
      {...props}
    >
      <ThemeSynchronizer>{children}</ThemeSynchronizer>
    </NextThemesProvider>
  )
}
