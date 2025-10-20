export type ThemeTokenMap = Record<string, string>

export interface ThemeDefinition {
  id: string
  label: string
  description: string
  tokens: ThemeTokenMap
}

const createHsl = (value: string) => value

export const DEFAULT_THEME_ID = 'ember-nightfall'

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'ember-nightfall',
    label: 'Ember Nightfall',
    description: 'Charcoal canvas with ember highlights inspired by our orange + black landing.',
    tokens: {
      background: createHsl('220 45% 6%'),
      foreground: createHsl('210 36% 96%'),
      card: createHsl('220 32% 10%'),
      'card-foreground': createHsl('210 36% 96%'),
      popover: createHsl('220 32% 9%'),
      'popover-foreground': createHsl('210 36% 96%'),
      primary: createHsl('24 96% 53%'),
      'primary-foreground': createHsl('24 100% 98%'),
      secondary: createHsl('219 30% 15%'),
      'secondary-foreground': createHsl('210 32% 92%'),
      muted: createHsl('219 22% 16%'),
      'muted-foreground': createHsl('215 16% 72%'),
      accent: createHsl('24 96% 53%'),
      'accent-foreground': createHsl('210 36% 96%'),
      destructive: createHsl('0 84% 60%'),
      'destructive-foreground': createHsl('0 0% 100%'),
      border: createHsl('220 16% 14%'),
      input: createHsl('220 16% 14%'),
      ring: createHsl('24 96% 53%'),
      'hover-bg': createHsl('220 24% 14%'),
      'active-bg': createHsl('24 96% 47%'),
      'focus-ring': createHsl('24 96% 53%'),
      'dashboard-radial':
        'radial-gradient(circle at 20% -40%, rgba(249, 115, 22, 0.12) 0%, rgba(5, 5, 5, 0) 55%)',
      'dashboard-linear': 'linear-gradient(180deg, rgba(6, 6, 8, 0.98) 0%, rgba(5, 5, 7, 1) 65%)',

      'priority-high': createHsl('0 84% 60%'),
      'priority-high-bg': 'rgba(239, 68, 68, 0.16)',
      'priority-high-text': 'rgba(252, 165, 165, 0.96)',
      'priority-high-border': 'rgba(239, 68, 68, 0.35)',
      'priority-medium': createHsl('24 96% 53%'),
      'priority-medium-bg': 'rgba(249, 115, 22, 0.16)',
      'priority-medium-text': 'rgba(255, 214, 170, 0.92)',
      'priority-medium-border': 'rgba(249, 115, 22, 0.3)',
      'priority-low': createHsl('142 70% 45%'),
      'priority-low-bg': 'rgba(34, 197, 94, 0.18)',
      'priority-low-text': 'rgba(187, 247, 208, 0.95)',
      'priority-low-border': 'rgba(34, 197, 94, 0.35)',

      success: createHsl('142 70% 45%'),
      'success-bg': 'rgba(34, 197, 94, 0.18)',

      'board-background': '#050505',
      'board-surface-color': '#07090d',
      'board-surface-glass': 'rgba(12, 14, 20, 0.94)',
      'board-column-bg': 'rgba(16, 18, 26, 0.95)',
      'board-column-border': 'rgba(255, 255, 255, 0.03)',
      'board-column-border-accent': 'rgba(255, 255, 255, 0.06)',
      'board-column-shadow': '0 24px 50px rgba(0, 0, 0, 0.45)',
      'board-column-hover-shadow': '0 28px 60px rgba(249, 115, 22, 0.18)',
      'board-card-bg': 'rgba(26, 28, 36, 0.96)',
      'board-card-border': 'rgba(255, 255, 255, 0.03)',
      'board-card-shadow': '0 16px 36px rgba(0, 0, 0, 0.35)',
      'board-card-hover-border': 'rgba(255, 255, 255, 0.06)',
      'board-card-hover-shadow': '0 20px 48px rgba(0, 0, 0, 0.32)',
      'board-card-hover-overlay':
        'linear-gradient(135deg, rgba(249, 115, 22, 0.18) 0%, rgba(8, 11, 18, 0) 100%)',
      'board-task-accent': 'linear-gradient(90deg, rgba(249, 115, 22, 0.7), rgba(253, 186, 116, 0.55))',
      'board-task-accent-today': 'linear-gradient(90deg, rgba(253, 186, 116, 0.55), rgba(249, 115, 22, 0.5))',
      'board-task-accent-overdue': 'linear-gradient(90deg, rgba(239, 68, 68, 0.72), rgba(249, 115, 22, 0.45))',
      'board-task-accent-complete': 'linear-gradient(90deg, rgba(34, 197, 94, 0.65), rgba(16, 185, 129, 0.55))',
      'board-chip-bg': 'rgba(255, 255, 255, 0.04)',
      'board-chip-text': 'rgba(220, 226, 238, 0.82)',
      'board-chip-border': 'rgba(255, 255, 255, 0.05)',
      'board-pill-bg': 'rgba(255, 255, 255, 0.04)',
      'board-pill-text': 'rgba(214, 222, 238, 0.78)',
      'board-pill-border': 'rgba(255, 255, 255, 0.05)',
      'board-text-muted': 'rgba(185, 196, 215, 0.68)',
      'board-text-subtle': 'rgba(212, 220, 236, 0.76)',
      'board-text-strong': 'rgba(248, 250, 252, 0.98)',
      'board-heading-color': 'rgba(254, 232, 214, 0.95)',
      'board-icon-muted': 'rgba(160, 173, 196, 0.65)',
      'board-focus-glow': '0 0 0 2px rgba(249, 115, 22, 0.35)',
      'board-column-radius': '18px',
      'board-tag-bg': 'rgba(14, 18, 26, 0.92)',
      'board-tag-border': 'rgba(255, 255, 255, 0.03)',
      'board-tag-text': 'rgba(230, 236, 250, 0.9)',
      'board-due-empty-border': 'rgba(240, 244, 255, 0.06)',
      'board-due-empty-text': 'rgba(212, 220, 236, 0.75)',
      'board-due-empty-bg': 'rgba(14, 18, 26, 0.88)',
      'board-due-today-bg': 'rgba(249, 115, 22, 0.18)',
      'board-due-today-border': 'rgba(249, 115, 22, 0.28)',
      'board-due-today-text': 'rgba(255, 232, 208, 0.9)',
      'board-due-overdue-bg': 'rgba(239, 68, 68, 0.18)',
      'board-due-overdue-border': 'rgba(239, 68, 68, 0.28)',
      'board-due-overdue-text': 'rgba(252, 196, 196, 0.92)',
      'board-due-future-bg': 'rgba(34, 197, 94, 0.16)',
      'board-due-future-border': 'rgba(16, 185, 129, 0.26)',
      'board-due-future-text': 'rgba(189, 247, 208, 0.9)',
      'board-danger-bg': 'rgba(239, 68, 68, 0.2)',
      'board-danger-text': 'rgba(252, 165, 165, 0.95)',
      'board-danger-border': 'rgba(239, 68, 68, 0.38)',
      'board-action-bg': 'rgba(255, 255, 255, 0.05)',
      'board-action-text': 'rgba(248, 244, 236, 0.92)',
      'board-action-border': 'rgba(255, 255, 255, 0.08)'
    }
  },
  {
    id: 'ember-daybreak',
    label: 'Ember Daybreak',
    description: 'Sunlit workspace with warm neutrals and ember highlights.',
    tokens: {
      background: createHsl('36 60% 97%'),
      foreground: createHsl('26 28% 22%'),
      card: createHsl('0 0% 100%'),
      'card-foreground': createHsl('26 28% 22%'),
      popover: createHsl('36 100% 99%'),
      'popover-foreground': createHsl('26 28% 22%'),
      primary: createHsl('24 96% 48%'),
      'primary-foreground': createHsl('24 100% 98%'),
      secondary: createHsl('34 40% 92%'),
      'secondary-foreground': createHsl('26 24% 24%'),
      muted: createHsl('32 28% 90%'),
      'muted-foreground': createHsl('26 22% 45%'),
      accent: createHsl('24 96% 48%'),
      'accent-foreground': createHsl('26 18% 18%'),
      destructive: createHsl('0 78% 60%'),
      'destructive-foreground': createHsl('0 0% 100%'),
      border: createHsl('32 24% 86%'),
      input: createHsl('32 24% 86%'),
      ring: createHsl('24 96% 48%'),
      'hover-bg': createHsl('32 40% 96%'),
      'active-bg': createHsl('24 96% 45%'),
      'focus-ring': createHsl('24 96% 48%'),
      'dashboard-radial':
        'radial-gradient(circle at 18% -40%, rgba(249, 115, 22, 0.14) 0%, rgba(255, 255, 255, 0) 55%)',
      'dashboard-linear':
        'linear-gradient(180deg, rgba(255, 251, 244, 1) 0%, rgba(249, 242, 232, 1) 65%)',

      'priority-high': createHsl('0 78% 60%'),
      'priority-high-bg': 'rgba(239, 68, 68, 0.12)',
      'priority-high-text': 'rgba(185, 28, 28, 0.85)',
      'priority-high-border': 'rgba(239, 68, 68, 0.28)',
      'priority-medium': createHsl('28 92% 52%'),
      'priority-medium-bg': 'rgba(249, 115, 22, 0.12)',
      'priority-medium-text': 'rgba(146, 64, 14, 0.9)',
      'priority-medium-border': 'rgba(249, 115, 22, 0.24)',
      'priority-low': createHsl('148 44% 38%'),
      'priority-low-bg': 'rgba(34, 197, 94, 0.12)',
      'priority-low-text': 'rgba(15, 118, 110, 0.82)',
      'priority-low-border': 'rgba(34, 197, 94, 0.24)',

      success: createHsl('148 44% 38%'),
      'success-bg': 'rgba(34, 197, 94, 0.1)',

      'board-background': '#fbf6ef',
      'board-surface-color': '#ffffff',
      'board-surface-glass': 'rgba(255, 255, 255, 0.97)',
      'board-column-bg': 'rgba(255, 255, 255, 0.96)',
      'board-column-border': 'rgba(26, 26, 37, 0.04)',
      'board-column-border-accent': 'rgba(26, 26, 37, 0.1)',
      'board-column-shadow': '0 16px 32px rgba(26, 26, 37, 0.08)',
      'board-column-hover-shadow': '0 20px 40px rgba(249, 115, 22, 0.12)',
      'board-card-bg': 'rgba(255, 255, 255, 0.98)',
      'board-card-border': 'rgba(26, 26, 37, 0.05)',
      'board-card-shadow': '0 12px 28px rgba(26, 26, 37, 0.08)',
      'board-card-hover-border': 'rgba(249, 115, 22, 0.24)',
      'board-card-hover-shadow': '0 16px 32px rgba(249, 115, 22, 0.12)',
      'board-card-hover-overlay':
        'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(255, 225, 190, 0.24) 60%, rgba(255, 255, 255, 0) 100%)',
      'board-task-accent': 'linear-gradient(90deg, rgba(249, 115, 22, 0.52), rgba(255, 198, 140, 0.55))',
      'board-task-accent-today': 'linear-gradient(90deg, rgba(249, 115, 22, 0.48), rgba(252, 198, 120, 0.52))',
      'board-task-accent-overdue': 'linear-gradient(90deg, rgba(220, 38, 38, 0.52), rgba(249, 115, 22, 0.36))',
      'board-task-accent-complete': 'linear-gradient(90deg, rgba(34, 197, 94, 0.48), rgba(20, 184, 166, 0.42))',
      'board-chip-bg': 'rgba(0, 0, 0, 0.04)',
      'board-chip-text': 'rgba(82, 68, 52, 0.75)',
      'board-chip-border': 'rgba(26, 26, 37, 0.05)',
      'board-pill-bg': 'rgba(0, 0, 0, 0.03)',
      'board-pill-text': 'rgba(82, 68, 52, 0.72)',
      'board-pill-border': 'rgba(26, 26, 37, 0.05)',
      'board-text-muted': 'rgba(120, 94, 60, 0.68)',
      'board-text-subtle': 'rgba(100, 82, 54, 0.7)',
      'board-text-strong': 'rgba(42, 24, 12, 0.9)',
      'board-heading-color': 'rgba(48, 30, 16, 0.92)',
      'board-icon-muted': 'rgba(146, 108, 68, 0.6)',
      'board-focus-glow': '0 0 0 2px rgba(249, 115, 22, 0.25)',
      'board-column-radius': '18px',
      'board-tag-bg': 'rgba(255, 245, 235, 0.92)',
      'board-tag-border': 'rgba(26, 26, 37, 0.05)',
      'board-tag-text': 'rgba(120, 72, 20, 0.78)',
      'board-due-empty-border': 'rgba(26, 26, 37, 0.08)',
      'board-due-empty-text': 'rgba(120, 94, 60, 0.7)',
      'board-due-empty-bg': 'rgba(255, 242, 228, 0.92)',
      'board-due-today-bg': 'rgba(249, 115, 22, 0.12)',
      'board-due-today-border': 'rgba(249, 115, 22, 0.22)',
      'board-due-today-text': 'rgba(130, 70, 22, 0.8)',
      'board-due-overdue-bg': 'rgba(220, 38, 38, 0.12)',
      'board-due-overdue-border': 'rgba(220, 38, 38, 0.22)',
      'board-due-overdue-text': 'rgba(170, 32, 32, 0.82)',
      'board-due-future-bg': 'rgba(34, 197, 94, 0.12)',
      'board-due-future-border': 'rgba(15, 118, 110, 0.2)',
      'board-due-future-text': 'rgba(15, 118, 110, 0.78)',
      'board-danger-bg': 'rgba(220, 38, 38, 0.12)',
      'board-danger-text': 'rgba(170, 32, 32, 0.85)',
      'board-danger-border': 'rgba(220, 38, 38, 0.24)',
      'board-action-bg': 'rgba(0, 0, 0, 0.04)',
      'board-action-text': 'rgba(90, 60, 20, 0.78)',
      'board-action-border': 'rgba(26, 26, 37, 0.08)'
    }
  }
]

const themeMap = new Map<string, ThemeDefinition>()
THEME_DEFINITIONS.forEach((theme) => {
  themeMap.set(theme.id, theme)
})

export function getThemeDefinition(themeId?: string): ThemeDefinition {
  if (!themeId) return themeMap.get(DEFAULT_THEME_ID)!
  return themeMap.get(themeId) ?? themeMap.get(DEFAULT_THEME_ID)!
}

export function getThemeIds(): string[] {
  return THEME_DEFINITIONS.map((theme) => theme.id)
}

export function applyThemeDefinition(theme: ThemeDefinition) {
  if (typeof window === 'undefined') return
  const root = document.documentElement
  Object.entries(theme.tokens).forEach(([token, value]) => {
    root.style.setProperty(`--${token}`, value)
  })
}

export function applyTheme(themeId?: string) {
  const theme = getThemeDefinition(themeId)
  applyThemeDefinition(theme)
}
