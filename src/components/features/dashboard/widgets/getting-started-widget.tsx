'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { 
  CheckSquare, 
  ShoppingCart, 
  ChefHat, 
  CreditCard, 
  Calendar,
  StickyNote,
  BarChart3,
  ArrowRight,
  Check
} from 'lucide-react'

interface GettingStartedWidgetProps {
  size?: 'small' | 'medium' | 'large'
  settings?: Record<string, unknown>
}

const quickStartActions = [
  {
    id: 'first-task',
    title: 'Add Your First Task',
    description: 'Start organizing with a simple to-do item',
    icon: CheckSquare,
    feature: 'tasks',
    href: '/tasks',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'track-bill',
    title: 'Track a Bill',
    description: 'Never miss a payment again',
    icon: CreditCard,
    feature: 'bills',
    href: '/bills',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'save-recipe',
    title: 'Save a Recipe',
    description: 'Build your family recipe collection',
    icon: ChefHat,
    feature: 'recipes',
    href: '/recipes',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'shopping-list',
    title: 'Create Shopping List',
    description: 'Organize your grocery trips',
    icon: ShoppingCart,
    feature: 'shopping',
    href: '/shopping',
    color: 'from-purple-500 to-purple-600'
  }
]

export function GettingStartedWidget({ size = 'large' }: GettingStartedWidgetProps) {
  const { trackFeatureUsage, usagePattern, setFirstVisit } = useAdaptiveStore()
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set())

  const handleActionClick = (action: typeof quickStartActions[0]) => {
    trackFeatureUsage(action.feature, 'quick-start')
    setCompletedActions(prev => new Set(prev).add(action.id))
    
    // After user takes first action, they're no longer a first-time visitor
    if (completedActions.size === 0) {
      setFirstVisit(false)
    }
  }

  const getUsageCount = (feature: string) => {
    return usagePattern?.featureUsage[feature]?.count || 0
  }

  return (
    <Card glass className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center space-x-2">
          <span>🚀</span>
          <span>Quick Start</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose what you&apos;d like to try first. NextTaskPro will adapt to show you more of what you use.
        </p>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid gap-3 sm:grid-cols-2">
          {quickStartActions.map((action) => {
            const usageCount = getUsageCount(action.feature)
            const isCompleted = usageCount > 0 || completedActions.has(action.id)
            const Icon = action.icon

            return (
              <Button
                key={action.id}
                variant="ghost"
                className={`h-auto p-4 justify-start text-left adaptive-transition hover:scale-[1.02] ${
                  isCompleted ? 'ring-2 ring-primary/20 bg-primary/5' : 'hover:bg-white/10'
                }`}
                onClick={() => handleActionClick(action)}
                disabled={isCompleted}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className={`rounded-lg p-2 bg-gradient-to-br ${action.color} ${
                    isCompleted ? 'opacity-60' : ''
                  }`}>
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <Icon className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">
                        {action.title}
                        {usageCount > 0 && (
                          <span className="ml-2 text-xs text-primary">
                            ({usageCount} times)
                          </span>
                        )}
                      </h4>
                      {!isCompleted && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-glass/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress: {completedActions.size + Object.keys(usagePattern?.featureUsage || {}).filter(k => (usagePattern?.featureUsage?.[k]?.count || 0) > 0).length} / {quickStartActions.length}</span>
            <span>Dashboard adapts as you explore</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}