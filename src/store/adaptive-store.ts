import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UsagePattern, DashboardConfig, WidgetConfig, FeatureSuggestion, DashboardLayout } from '@/types'

interface AdaptiveState {
  // Usage tracking
  usagePattern: UsagePattern | null
  dashboardConfig: DashboardConfig | null
  currentLayout: DashboardLayout | null

  // Feature discovery
  suggestions: FeatureSuggestion[]
  dismissedSuggestions: string[]

  // Dashboard state
  widgetOrder: string[]
  hiddenWidgets: string[]
  isFirstVisit: boolean

  // Actions
  trackTaskUsage: (action: string, duration?: number) => void
  updateDashboardConfig: (config: Partial<DashboardConfig>) => void
  setCurrentLayout: (layout: DashboardLayout) => void
  addSuggestion: (suggestion: FeatureSuggestion) => void
  dismissSuggestion: (feature: string) => void
  reorderWidgets: (order: string[]) => void
  toggleWidgetVisibility: (widgetType: string) => void
  calculateAdaptiveLayout: () => DashboardLayout
  setFirstVisit: (isFirst: boolean) => void
}

const getDefaultDashboardConfig = (): DashboardConfig => ({
  primaryWidgets: [
    { type: 'getting-started', size: 'large', position: 0, isVisible: true },
    { type: 'tasks', size: 'medium', position: 1, isVisible: true },
    { type: 'quick-actions', size: 'small', position: 2, isVisible: true }
  ],
  secondaryWidgets: [],
  hiddenFeatures: [],
  layout: 'onboarding'
})

export const useAdaptiveStore = create<AdaptiveState>()(
  persist(
    (set, get) => ({
      usagePattern: null,
      dashboardConfig: getDefaultDashboardConfig(),
      currentLayout: null,
      suggestions: [],
      dismissedSuggestions: [],
      widgetOrder: ['getting-started', 'tasks', 'quick-actions'],
      hiddenWidgets: [],
      isFirstVisit: true,

      trackTaskUsage: (action, duration = 0) => {
        const { usagePattern } = get()
        const now = new Date()

        const updatedPattern: UsagePattern = {
          userId: usagePattern?.userId || 'anonymous',
          featureUsage: {
            ...usagePattern?.featureUsage,
            tasks: {
              count: (usagePattern?.featureUsage.tasks?.count || 0) + 1,
              lastUsed: now,
              frequency: calculateFrequency(usagePattern?.featureUsage.tasks?.count || 0),
              totalTime: (usagePattern?.featureUsage.tasks?.totalTime || 0) + duration
            }
          },
          dashboardConfig: usagePattern?.dashboardConfig || getDefaultDashboardConfig(),
          lastCalculated: now
        }

        set({ usagePattern: updatedPattern })

        // Trigger layout recalculation after usage tracking
        const newLayout = get().calculateAdaptiveLayout()
        set({ currentLayout: newLayout })
      },

      updateDashboardConfig: (config) => {
        const { dashboardConfig } = get()
        const updatedConfig = { ...dashboardConfig, ...config }
        set({ dashboardConfig: updatedConfig })
      },

      setCurrentLayout: (layout) => set({ currentLayout: layout }),

      addSuggestion: (suggestion) => {
        const { suggestions, dismissedSuggestions } = get()
        if (!dismissedSuggestions.includes(suggestion.feature)) {
          const exists = suggestions.find(s => s.feature === suggestion.feature)
          if (!exists) {
            set({ suggestions: [...suggestions, suggestion] })
          }
        }
      },

      dismissSuggestion: (feature) => {
        const { suggestions, dismissedSuggestions } = get()
        set({
          suggestions: suggestions.filter(s => s.feature !== feature),
          dismissedSuggestions: [...dismissedSuggestions, feature]
        })
      },

      reorderWidgets: (order) => set({ widgetOrder: order }),

      toggleWidgetVisibility: (widgetType) => {
        const { hiddenWidgets } = get()
        const isHidden = hiddenWidgets.includes(widgetType)
        set({
          hiddenWidgets: isHidden 
            ? hiddenWidgets.filter(w => w !== widgetType)
            : [...hiddenWidgets, widgetType]
        })
      },

      calculateAdaptiveLayout: () => {
        const { usagePattern, isFirstVisit } = get()

        // First visit - show onboarding
        if (isFirstVisit || !usagePattern) {
          return {
            hero: 'welcome',
            widgets: [
              { type: 'getting-started', size: 'large', position: 0, isVisible: true },
              { type: 'tasks', size: 'medium', position: 1, isVisible: true },
              { type: 'quick-actions', size: 'small', position: 2, isVisible: true }
            ],
            suggestions: []
          }
        }

        const taskUsage = usagePattern.featureUsage.tasks
        const hasTaskData = taskUsage && taskUsage.count > 0

        // No task usage yet - keep onboarding
        if (!hasTaskData) {
          return {
            hero: 'welcome',
            widgets: [
              { type: 'getting-started', size: 'large', position: 0, isVisible: true },
              { type: 'tasks', size: 'medium', position: 1, isVisible: true }
            ],
            suggestions: []
          }
        }

        // Task-focused layout
        return {
          hero: 'productivity-hub',
          widgets: [
            { type: 'tasks', size: 'large', position: 0, isVisible: true },
            { type: 'task-stats', size: 'medium', position: 1, isVisible: true },
            { type: 'quick-actions', size: 'small', position: 2, isVisible: true }
          ],
          suggestions: generateTaskSuggestions(taskUsage)
        }
      },

      setFirstVisit: (isFirst) => set({ isFirstVisit: isFirst })
    }),
    {
      name: 'adaptive-store',
      partialize: (state) => ({
        usagePattern: state.usagePattern,
        dashboardConfig: state.dashboardConfig,
        dismissedSuggestions: state.dismissedSuggestions,
        widgetOrder: state.widgetOrder,
        hiddenWidgets: state.hiddenWidgets,
        isFirstVisit: state.isFirstVisit
      }),
      onRehydrateStorage: () => (state) => {
        // Rehydrate Date objects from strings
        if (state?.usagePattern) {
          if (state.usagePattern.lastCalculated && typeof state.usagePattern.lastCalculated === 'string') {
            state.usagePattern.lastCalculated = new Date(state.usagePattern.lastCalculated)
          }

          // Rehydrate feature usage dates
          Object.keys(state.usagePattern.featureUsage).forEach(feature => {
            const usage = state.usagePattern!.featureUsage[feature]
            if (usage && usage.lastUsed && typeof usage.lastUsed === 'string') {
              usage.lastUsed = new Date(usage.lastUsed)
            }
          })
        }
      },
    }
  )
)

// Helper functions
function calculateFrequency(count: number): 'daily' | 'weekly' | 'monthly' | 'rare' {
  if (count >= 30) return 'daily'
  if (count >= 7) return 'weekly'
  if (count >= 1) return 'monthly'
  return 'rare'
}

function generateTaskSuggestions(taskUsage?: { count: number; lastUsed: Date; totalTime: number }): FeatureSuggestion[] {
  const suggestions: FeatureSuggestion[] = []
  const currentTime = new Date()
  const hourOfDay = currentTime.getHours()

  // Morning task planning suggestion
  if (hourOfDay >= 7 && hourOfDay <= 9 && taskUsage && taskUsage.count > 0) {
    suggestions.push({
      feature: 'morning-planning',
      reason: 'Perfect time for morning task planning',
      confidence: 0.9,
      actionText: 'Plan Your Day',
      priority: 1
    })
  }

  // Evening review suggestion
  if (hourOfDay >= 17 && hourOfDay <= 19 && taskUsage && taskUsage.count > 0) {
    suggestions.push({
      feature: 'task-review',
      reason: 'Review your task progress and plan tomorrow',
      confidence: 0.8,
      actionText: 'Review Progress',
      priority: 2
    })
  }

  // Productivity insights for active users
  if (taskUsage && taskUsage.count > 20) {
    suggestions.push({
      feature: 'productivity-insights',
      reason: 'Get insights on your task completion patterns',
      confidence: 0.7,
      actionText: 'View Analytics',
      priority: 3
    })
  }

  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 3)
}

function getDefaultLayout(): DashboardLayout {
  return {
    hero: 'welcome',
    widgets: [
      { type: 'getting-started', size: 'large', position: 0, isVisible: true },
      { type: 'tasks', size: 'medium', position: 1, isVisible: true },
      { type: 'quick-actions', size: 'small', position: 2, isVisible: true }
    ]
  }
}