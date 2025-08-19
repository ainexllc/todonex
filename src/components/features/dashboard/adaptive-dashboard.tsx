'use client'

import { useEffect } from 'react'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { useAuthStore } from '@/store/auth-store'
import { WelcomeWidget } from './widgets/welcome-widget'
import { GettingStartedWidget } from './widgets/getting-started-widget'
import { FeatureCardsWidget } from './widgets/feature-cards-widget'
import { QuickActionsWidget } from './widgets/quick-actions-widget'
import { TasksWidget } from './widgets/tasks-widget'
import { TodayTasksWidget } from './widgets/today-tasks-widget'
import { ShoppingWidget } from './widgets/shopping-widget'
import { RecipesWidget } from './widgets/recipes-widget'
import { NotesWidget } from './widgets/notes-widget'
import { SubscriptionsWidget } from './widgets/subscriptions-widget'
import { CalendarWidget } from './widgets/calendar-widget'
import { 
  UpcomingBillsWidget,
  TodayEventsWidget,
  RecentNotesWidget,
  SubscriptionOverviewWidget
} from './widgets/placeholder-widgets'
import { FeatureSuggestions } from './feature-suggestions'
import { DashboardHero } from './dashboard-hero'
import { WidgetConfig } from '@/types'
import { cn } from '@/lib/utils'

const widgetComponents = {
  'welcome': WelcomeWidget,
  'getting-started': GettingStartedWidget,
  'feature-cards': FeatureCardsWidget,
  'quick-actions': QuickActionsWidget,
  'tasks': TasksWidget,
  'today-tasks': TodayTasksWidget,
  'shopping': ShoppingWidget,
  'active-shopping-lists': ShoppingWidget, // Using ShoppingWidget as placeholder
  'recipes': RecipesWidget,
  'this-week-meals': RecipesWidget, // Using RecipesWidget as placeholder
  'upcoming-bills': UpcomingBillsWidget,
  'today-events': CalendarWidget,
  'recent-notes': NotesWidget,
  'subscription-overview': SubscriptionsWidget,
  'spending-chart': UpcomingBillsWidget, // Using UpcomingBillsWidget as placeholder
  'task-stats': TasksWidget, // Using TasksWidget as placeholder
}

export function AdaptiveDashboard() {
  const { user } = useAuthStore()
  const { 
    currentLayout, 
    calculateAdaptiveLayout, 
    trackFeatureUsage,
    suggestions,
    isFirstVisit 
  } = useAdaptiveStore()

  useEffect(() => {
    // Calculate layout on mount
    const layout = calculateAdaptiveLayout()
    if (!currentLayout) {
      useAdaptiveStore.getState().setCurrentLayout(layout)
    }
  }, [calculateAdaptiveLayout, currentLayout])

  useEffect(() => {
    // Track dashboard view
    trackFeatureUsage('dashboard', 'view', Date.now())
  }, [trackFeatureUsage])

  if (!currentLayout) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }


  return (
    <div className="space-y-8">
      {/* Hero Section */}
      {currentLayout.hero && (
        <DashboardHero type={currentLayout.hero} user={user} />
      )}

      {/* Feature Suggestions */}
      {suggestions.length > 0 && (
        <FeatureSuggestions suggestions={suggestions} />
      )}

      {/* Adaptive Widget Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        {currentLayout.widgets
          .filter(widget => widget.isVisible)
          .sort((a, b) => a.position - b.position)
          .map((widget) => {
            const WidgetComponent = widgetComponents[widget.type]
            
            if (!WidgetComponent) {
              console.warn(`Widget component not found for type: ${widget.type}`)
              return null
            }

            return (
              <div
                key={`${widget.type}-${widget.position}`}
                className={cn(
                  "adaptive-transition hover:scale-[1.02] hover:shadow-lg",
                  widget.size === 'large' && "sm:col-span-2 lg:col-span-2",
                  widget.size === 'medium' && "col-span-1",
                  widget.size === 'small' && "col-span-1"
                )}
              >
                <WidgetComponent 
                  size={widget.size === 'full' ? 'large' : widget.size}
                  settings={widget.settings}
                />
              </div>
            )
          })
        }
      </div>

      {/* Empty State for completely new users */}
      {isFirstVisit && currentLayout.widgets.length === 0 && (
        <div className="flex h-96 flex-col items-center justify-center space-y-4 text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-20"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Welcome to NextTaskPro!</h2>
            <p className="text-muted-foreground max-w-md">
              Your intelligent home management platform is ready. Start by exploring the features or adding your first task, bill, or recipe.
            </p>
          </div>
          <QuickActionsWidget size="medium" />
        </div>
      )}

      {/* Development info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 rounded-lg bg-gray-100 dark:bg-gray-800 p-4 text-sm">
          <details>
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <pre className="mt-2 text-xs">
              {JSON.stringify({ 
                layout: currentLayout.hero,
                widgets: currentLayout.widgets.length,
                suggestions: suggestions.length,
                isFirstVisit 
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}