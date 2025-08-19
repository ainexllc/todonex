'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { 
  Plus, 
  CheckSquare, 
  ShoppingCart, 
  ChefHat, 
  CreditCard, 
  Calendar,
  StickyNote,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickActionsWidgetProps {
  size?: 'small' | 'medium' | 'large'
  settings?: Record<string, any>
}

const quickActions = [
  {
    id: 'add-task',
    label: 'Add Task',
    icon: CheckSquare,
    feature: 'tasks',
    color: 'from-blue-500 to-blue-600',
    action: 'Create a new task or reminder'
  },
  {
    id: 'add-bill',
    label: 'Add Bill',
    icon: CreditCard,
    feature: 'bills',
    color: 'from-green-500 to-green-600',
    action: 'Track a new bill or expense'
  },
  {
    id: 'add-recipe',
    label: 'Save Recipe',
    icon: ChefHat,
    feature: 'recipes',
    color: 'from-orange-500 to-orange-600',
    action: 'Add a recipe to your collection'
  },
  {
    id: 'shopping-list',
    label: 'Shopping List',
    icon: ShoppingCart,
    feature: 'shopping',
    color: 'from-purple-500 to-purple-600',
    action: 'Start a new shopping list'
  },
  {
    id: 'add-event',
    label: 'Add Event',
    icon: Calendar,
    feature: 'calendar',
    color: 'from-indigo-500 to-indigo-600',
    action: 'Schedule a new event'
  },
  {
    id: 'quick-note',
    label: 'Quick Note',
    icon: StickyNote,
    feature: 'notes',
    color: 'from-yellow-500 to-yellow-600',
    action: 'Jot down a quick note'
  }
]

export function QuickActionsWidget({ size = 'medium' }: QuickActionsWidgetProps) {
  const { trackFeatureUsage, usagePattern } = useAdaptiveStore()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleActionClick = (action: typeof quickActions[0]) => {
    trackFeatureUsage(action.feature, 'quick-add')
    // Here we would typically open a modal or navigate to the add form
    console.log(`Quick action: ${action.action}`)
  }

  const getUsageScore = (feature: string) => {
    const usage = usagePattern?.featureUsage[feature]
    if (!usage) return 0
    
    // Calculate score based on count and recency
    const recency = Math.max(0, 7 - (Date.now() - usage.lastUsed.getTime()) / (1000 * 60 * 60 * 24))
    return usage.count + recency
  }

  // Sort actions by usage, showing most used first
  const sortedActions = [...quickActions].sort((a, b) => {
    return getUsageScore(b.feature) - getUsageScore(a.feature)
  })

  const visibleActions = size === 'small' 
    ? sortedActions.slice(0, 2)
    : isExpanded 
      ? sortedActions 
      : sortedActions.slice(0, 4)

  return (
    <Card glass className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5"></div>
      
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Zap className="h-5 w-5 text-primary" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className={cn(
          "grid gap-2",
          size === 'small' ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
        )}>
          {visibleActions.map((action) => {
            const Icon = action.icon
            const usageCount = usagePattern?.featureUsage[action.feature]?.count || 0

            return (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-auto p-3 justify-start adaptive-transition",
                  "hover:scale-[1.02] hover:bg-white/10 dark:hover:bg-black/10",
                  usageCount > 0 && "ring-1 ring-primary/20 bg-primary/5"
                )}
                onClick={() => handleActionClick(action)}
              >
                <div className="flex items-center space-x-2 text-left">
                  <div className={cn(
                    "rounded-md p-1.5 bg-gradient-to-br",
                    action.color
                  )}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{action.label}</p>
                    {usageCount > 0 && (
                      <p className="text-xs text-primary">
                        {usageCount} time{usageCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        {/* Expand/Collapse for medium/large sizes */}
        {size !== 'small' && sortedActions.length > 4 && (
          <div className="mt-3 pt-3 border-t border-glass/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs hover:bg-white/10 dark:hover:bg-black/10"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : `Show ${sortedActions.length - 4} More`}
            </Button>
          </div>
        )}

        {/* Usage tip */}
        {Object.keys(usagePattern?.featureUsage || {}).length === 0 && (
          <div className="mt-3 pt-3 border-t border-glass/50">
            <p className="text-xs text-muted-foreground text-center">
              💡 Most-used actions will appear at the top
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}