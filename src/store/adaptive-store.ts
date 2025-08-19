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
  const activeFeatures = features.filter(f => f.hasData)
  const currentTime = new Date()
  const hourOfDay = currentTime.getHours()
  const dayOfWeek = currentTime.getDay()
  
  const widgets: WidgetConfig[] = []
  let position = 0

  // Smart time-based widget prioritization
  const timeBasedPriority = getTimeBasedPriority(activeFeatures, hourOfDay, dayOfWeek)
  const sortedFeatures = [...activeFeatures].sort((a, b) => {
    const aPriority = timeBasedPriority[a.name] || 0
    const bPriority = timeBasedPriority[b.name] || 0
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }
    
    return b.score - a.score
  }).slice(0, 4)

  // Add primary widgets based on intelligent scoring
  sortedFeatures.forEach((feature, index) => {
    const widgetType = getWidgetTypeForFeature(feature.name)
    if (widgetType) {
      const size = getSmartWidgetSize(feature, index, hourOfDay, dayOfWeek)
      widgets.push({
        type: widgetType,
        size,
        position: position++,
        isVisible: true
      })
    }
  })

  // Context-aware secondary widgets
  if (shouldShowQuickActions(activeFeatures, hourOfDay)) {
    widgets.push({
      type: 'quick-actions',
      size: 'small',
      position: position++,
      isVisible: true
    })
  }

  // Add complementary widgets based on feature synergies
  const synergyWidgets = getComplementaryWidgets(activeFeatures)
  synergyWidgets.forEach(widget => {
    widgets.push({
      ...widget,
      position: position++,
      isVisible: true
    })
  })

  return {
    hero: getContextualHero(activeFeatures, hourOfDay, dayOfWeek),
    widgets,
    suggestions: generateSuggestions(features)
  }
}

function getTimeBasedPriority(features: Array<{ name: string; score: number; hasData: boolean }>, hour: number, dayOfWeek: number): Record<string, number> {
  const priority: Record<string, number> = {}
  
  // Morning priorities (7-11 AM)
  if (hour >= 7 && hour <= 11) {
    priority.tasks = 3
    priority.calendar = 3
    priority.bills = 1
    priority.recipes = 1
  }
  
  // Lunch time (11 AM - 2 PM)
  else if (hour >= 11 && hour <= 14) {
    priority.recipes = 2
    priority.shopping = 2
    priority.tasks = 2
    priority.notes = 1
  }
  
  // Afternoon (2-5 PM)
  else if (hour >= 14 && hour <= 17) {
    priority.tasks = 3
    priority.calendar = 2
    priority.notes = 2
    priority.bills = 1
  }
  
  // Evening (5-9 PM)
  else if (hour >= 17 && hour <= 21) {
    priority.recipes = 3
    priority.shopping = 2
    priority.calendar = 2
    priority.subscriptions = 1
  }
  
  // Night time (9 PM - 7 AM)
  else {
    priority.notes = 2
    priority.calendar = 1
    priority.subscriptions = 1
  }

  // Weekend adjustments
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    priority.shopping = (priority.shopping || 0) + 1
    priority.recipes = (priority.recipes || 0) + 1
    priority.bills = (priority.bills || 0) + 1
  }

  return priority
}

function getSmartWidgetSize(feature: { name: string; score: number }, index: number, hour: number, dayOfWeek: number): 'small' | 'medium' | 'large' {
  // Primary feature gets larger size during peak times
  if (index === 0) {
    const timeBasedPriority = getTimeBasedPriority([feature], hour, dayOfWeek)
    if ((timeBasedPriority[feature.name] || 0) >= 3) {
      return 'large'
    }
    return 'medium'
  }
  
  // Secondary features
  if (index === 1 && feature.score > 10) {
    return 'medium'
  }
  
  return 'small'
}

function shouldShowQuickActions(features: Array<{ name: string; score: number; hasData: boolean }>, hour: number): boolean {
  // Always show during peak productivity hours
  if (hour >= 9 && hour <= 11) return true
  if (hour >= 14 && hour <= 16) return true
  
  // Show if user has high engagement with multiple features
  const highEngagementFeatures = features.filter(f => f.score > 5).length
  return highEngagementFeatures >= 2
}

function getComplementaryWidgets(features: Array<{ name: string; score: number; hasData: boolean }>): Partial<WidgetConfig>[] {
  const widgets: Partial<WidgetConfig>[] = []
  const featureNames = features.map(f => f.name)
  
  // Recipe + Shopping synergy
  if (featureNames.includes('recipes') && featureNames.includes('shopping')) {
    widgets.push({
      type: 'meal-planning',
      size: 'medium'
    })
  }
  
  // Tasks + Calendar synergy
  if (featureNames.includes('tasks') && featureNames.includes('calendar')) {
    widgets.push({
      type: 'productivity-overview',
      size: 'small'
    })
  }
  
  // Bills + Subscriptions synergy
  if (featureNames.includes('bills') && featureNames.includes('subscriptions')) {
    widgets.push({
      type: 'financial-overview',
      size: 'medium'
    })
  }
  
  return widgets.slice(0, 2) // Limit complementary widgets
}

function getContextualHero(features: Array<{ name: string; score: number; hasData: boolean }>, hour: number, dayOfWeek: number): string {
  const featureNames = features.map(f => f.name)
  
  // Morning focus
  if (hour >= 7 && hour <= 11) {
    if (featureNames.includes('tasks')) return 'morning-productivity'
    if (featureNames.includes('calendar')) return 'daily-schedule'
  }
  
  // Evening focus
  if (hour >= 17 && hour <= 21) {
    if (featureNames.includes('recipes')) return 'meal-planning'
    if (featureNames.includes('shopping')) return 'shopping-helper'
  }
  
  // Weekend focus
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    if (featureNames.includes('bills')) return 'financial-review'
    if (featureNames.includes('recipes')) return 'weekend-cooking'
  }
  
  // Default based on top feature
  const topFeature = features[0]?.name
  if (topFeature === 'tasks') return 'productivity-hub'
  if (topFeature === 'recipes') return 'meal-planner'
  if (topFeature === 'bills') return 'financial-overview'
  
  return 'adaptive-dashboard'
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
  const currentTime = new Date()
  const hourOfDay = currentTime.getHours()
  const dayOfWeek = currentTime.getDay()
  
  // Time-based suggestions
  if (hourOfDay >= 7 && hourOfDay <= 9 && activeFeatures.includes('tasks')) {
    suggestions.push({
      feature: 'morning-planning',
      reason: 'Perfect time for morning task planning',
      confidence: 0.9,
      actionText: 'Plan Your Day',
      priority: 1
    })
  }

  if (hourOfDay >= 17 && hourOfDay <= 19 && activeFeatures.includes('recipes')) {
    suggestions.push({
      feature: 'dinner-planning',
      reason: 'Dinner time - check your recipes',
      confidence: 0.8,
      actionText: 'Browse Recipes',
      priority: 1
    })
  }

  // Weekend-specific suggestions
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    if (activeFeatures.includes('shopping')) {
      suggestions.push({
        feature: 'weekend-shopping',
        reason: 'Great time to plan your shopping for the week',
        confidence: 0.7,
        actionText: 'Update Shopping Lists',
        priority: 2
      })
    }
    
    if (activeFeatures.includes('bills')) {
      suggestions.push({
        feature: 'financial-review',
        reason: 'Weekend is perfect for reviewing your finances',
        confidence: 0.6,
        actionText: 'Review Bills',
        priority: 3
      })
    }
  }

  // Feature combination suggestions
  if (activeFeatures.includes('recipes') && !activeFeatures.includes('shopping')) {
    suggestions.push({
      feature: 'shopping',
      reason: 'Create shopping lists from your recipes automatically',
      confidence: 0.9,
      actionText: 'Try Shopping Lists',
      priority: 1
    })
  }
  
  if (activeFeatures.includes('bills') && !activeFeatures.includes('subscriptions')) {
    suggestions.push({
      feature: 'subscriptions',
      reason: 'Track subscriptions to identify savings opportunities',
      confidence: 0.8,
      actionText: 'Track Subscriptions',
      priority: 2
    })
  }
  
  if (activeFeatures.includes('tasks') && !activeFeatures.includes('calendar')) {
    suggestions.push({
      feature: 'calendar',
      reason: 'Sync calendar events with tasks for better planning',
      confidence: 0.7,
      actionText: 'Connect Calendar',
      priority: 3
    })
  }

  // Advanced workflow suggestions
  if (activeFeatures.length >= 3) {
    suggestions.push({
      feature: 'workflow-optimization',
      reason: 'You\'re using multiple features - let\'s optimize your workflow',
      confidence: 0.6,
      actionText: 'Optimize Dashboard',
      priority: 4
    })
  }

  // Productivity insights
  if (activeFeatures.includes('tasks') && activeFeatures.includes('calendar')) {
    suggestions.push({
      feature: 'productivity-insights',
      reason: 'Get insights on your task completion patterns',
      confidence: 0.7,
      actionText: 'View Analytics',
      priority: 5
    })
  }
  
  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 4)
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