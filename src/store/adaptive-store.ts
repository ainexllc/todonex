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
  trackFeatureUsage: (feature: string, action: string, duration?: number) => void
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
    { type: 'feature-cards', size: 'medium', position: 1, isVisible: true },
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
      widgetOrder: ['getting-started', 'feature-cards', 'quick-actions'],
      hiddenWidgets: [],
      isFirstVisit: true,

      trackFeatureUsage: (feature, action, duration = 0) => {
        const { usagePattern } = get()
        const now = new Date()
        
        const updatedPattern: UsagePattern = {
          userId: usagePattern?.userId || 'anonymous',
          featureUsage: {
            ...usagePattern?.featureUsage,
            [feature]: {
              count: (usagePattern?.featureUsage[feature]?.count || 0) + 1,
              lastUsed: now,
              frequency: calculateFrequency(usagePattern?.featureUsage[feature]?.count || 0),
              totalTime: (usagePattern?.featureUsage[feature]?.totalTime || 0) + duration
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
        const { usagePattern, dashboardConfig, isFirstVisit } = get()
        
        // First visit - show onboarding
        if (isFirstVisit || !usagePattern) {
          return {
            hero: 'welcome',
            widgets: [
              { type: 'getting-started', size: 'large', position: 0, isVisible: true },
              { type: 'feature-cards', size: 'medium', position: 1, isVisible: true },
              { type: 'quick-actions', size: 'small', position: 2, isVisible: true }
            ],
            suggestions: []
          }
        }

        const features = Object.entries(usagePattern.featureUsage)
          .map(([name, data]) => ({
            name,
            score: calculateFeatureScore(data),
            hasData: data.count > 0
          }))
          .sort((a, b) => b.score - a.score)

        const activeFeatures = features.filter(f => f.hasData)
        
        // No features used yet - keep onboarding
        if (activeFeatures.length === 0) {
          return {
            hero: 'welcome',
            widgets: [
              { type: 'getting-started', size: 'large', position: 0, isVisible: true },
              { type: 'feature-cards', size: 'medium', position: 1, isVisible: true }
            ]
          }
        }

        // Single feature - specialized layout
        if (activeFeatures.length === 1) {
          return getSpecializedLayout(activeFeatures[0].name)
        }

        // Multiple features - balanced adaptive layout
        return getAdaptiveLayout(features)
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

function calculateFeatureScore(data: { count: number; lastUsed: Date; totalTime: number }): number {
  const recency = Math.max(0, 7 - (Date.now() - data.lastUsed.getTime()) / (1000 * 60 * 60 * 24))
  const frequency = data.count
  const engagement = data.totalTime / 1000 / 60 // minutes
  
  return (recency * 0.3) + (frequency * 0.5) + (engagement * 0.2)
}

function getSpecializedLayout(feature: string): DashboardLayout {
  const layouts: Record<string, DashboardLayout> = {
    bills: {
      hero: 'financial-overview',
      widgets: [
        { type: 'upcoming-bills', size: 'large', position: 0, isVisible: true },
        { type: 'spending-chart', size: 'medium', position: 1, isVisible: true },
        { type: 'quick-actions', size: 'small', position: 2, isVisible: true }
      ]
    },
    recipes: {
      hero: 'meal-planner',
      widgets: [
        { type: 'recipes', size: 'large', position: 0, isVisible: true },
        { type: 'shopping', size: 'medium', position: 1, isVisible: true },
        { type: 'quick-actions', size: 'small', position: 2, isVisible: true }
      ]
    },
    tasks: {
      hero: 'productivity-hub',
      widgets: [
        { type: 'tasks', size: 'large', position: 0, isVisible: true },
        { type: 'task-stats', size: 'medium', position: 1, isVisible: true },
        { type: 'quick-actions', size: 'small', position: 2, isVisible: true }
      ]
    }
  }
  
  return layouts[feature] || getDefaultLayout()
}

function getAdaptiveLayout(features: Array<{ name: string; score: number; hasData: boolean }>): DashboardLayout {
  const activeFeatures = features.filter(f => f.hasData).slice(0, 3)
  
  const widgets: WidgetConfig[] = []
  let position = 0

  // Add primary widgets based on most used features
  activeFeatures.forEach((feature, index) => {
    const widgetType = getWidgetTypeForFeature(feature.name)
    if (widgetType) {
      widgets.push({
        type: widgetType,
        size: index === 0 ? 'large' : 'medium',
        position: position++,
        isVisible: true
      })
    }
  })

  // Always include quick actions
  widgets.push({
    type: 'quick-actions',
    size: 'small',
    position: position++,
    isVisible: true
  })

  return {
    hero: 'adaptive-dashboard',
    widgets,
    suggestions: generateSuggestions(features)
  }
}

function getWidgetTypeForFeature(feature: string): any {
  const mapping: Record<string, any> = {
    tasks: 'tasks',
    bills: 'upcoming-bills',
    recipes: 'recipes',
    shopping: 'shopping',
    notes: 'recent-notes',
    calendar: 'today-events',
    subscriptions: 'subscription-overview'
  }
  return mapping[feature]
}

function generateSuggestions(features: Array<{ name: string; score: number; hasData: boolean }>): FeatureSuggestion[] {
  const suggestions: FeatureSuggestion[] = []
  const activeFeatures = features.filter(f => f.hasData).map(f => f.name)
  
  // Suggest complementary features
  if (activeFeatures.includes('recipes') && !activeFeatures.includes('shopping')) {
    suggestions.push({
      feature: 'shopping',
      reason: 'Create shopping lists from your recipes',
      confidence: 0.9,
      actionText: 'Try Shopping Lists',
      priority: 1
    })
  }
  
  if (activeFeatures.includes('bills') && !activeFeatures.includes('subscriptions')) {
    suggestions.push({
      feature: 'subscriptions',
      reason: 'Track subscriptions to optimize spending',
      confidence: 0.8,
      actionText: 'Track Subscriptions',
      priority: 2
    })
  }
  
  if (activeFeatures.includes('tasks') && !activeFeatures.includes('calendar')) {
    suggestions.push({
      feature: 'calendar',
      reason: 'Sync calendar for better task planning',
      confidence: 0.7,
      actionText: 'Connect Calendar',
      priority: 3
    })
  }
  
  return suggestions.sort((a, b) => b.priority - a.priority)
}

function getDefaultLayout(): DashboardLayout {
  return {
    hero: 'welcome',
    widgets: [
      { type: 'getting-started', size: 'large', position: 0, isVisible: true },
      { type: 'feature-cards', size: 'medium', position: 1, isVisible: true },
      { type: 'quick-actions', size: 'small', position: 2, isVisible: true }
    ]
  }
}