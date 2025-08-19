'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { 
  CheckSquare, 
  ShoppingCart, 
  ChefHat, 
  CreditCard, 
  Calendar,
  StickyNote,
  BarChart3,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureCardsWidgetProps {
  size?: 'small' | 'medium' | 'large'
  settings?: Record<string, any>
}

const features = [
  {
    name: 'Task Management',
    description: 'Organize your to-dos and projects',
    icon: CheckSquare,
    href: '/tasks',
    feature: 'tasks',
    color: 'from-blue-500/20 to-blue-600/10',
    examples: ['Daily chores', 'Project deadlines', 'Shopping reminders']
  },
  {
    name: 'Bill Tracking',
    description: 'Never miss a payment again',
    icon: CreditCard,
    href: '/bills',
    feature: 'bills',
    color: 'from-green-500/20 to-green-600/10',
    examples: ['Utilities', 'Subscriptions', 'Credit cards']
  },
  {
    name: 'Recipe Manager',
    description: 'Build your family cookbook',
    icon: ChefHat,
    href: '/recipes',
    feature: 'recipes',
    color: 'from-orange-500/20 to-orange-600/10',
    examples: ['Family favorites', 'Meal planning', 'Grocery lists']
  },
  {
    name: 'Shopping Lists',
    description: 'Smart grocery organization',
    icon: ShoppingCart,
    href: '/shopping',
    feature: 'shopping',
    color: 'from-purple-500/20 to-purple-600/10',
    examples: ['Grocery trips', 'Store layouts', 'Price tracking']
  },
  {
    name: 'Calendar Sync',
    description: 'Unified family scheduling',
    icon: Calendar,
    href: '/calendar',
    feature: 'calendar',
    color: 'from-indigo-500/20 to-indigo-600/10',
    examples: ['Google Calendar', 'Family events', 'Reminders']
  },
  {
    name: 'Quick Notes',
    description: 'Capture ideas and reminders',
    icon: StickyNote,
    href: '/notes',
    feature: 'notes',
    color: 'from-yellow-500/20 to-yellow-600/10',
    examples: ['Voice memos', 'Lists', 'Family updates']
  }
]

export function FeatureCardsWidget({ size = 'medium' }: FeatureCardsWidgetProps) {
  const { trackFeatureUsage, usagePattern } = useAdaptiveStore()

  const handleFeatureClick = (feature: string) => {
    trackFeatureUsage(feature, 'explore-from-cards')
  }

  const getUsageCount = (feature: string) => {
    return usagePattern?.featureUsage[feature]?.count || 0
  }

  const sortedFeatures = [...features].sort((a, b) => {
    const aCount = getUsageCount(a.feature)
    const bCount = getUsageCount(b.feature)
    return bCount - aCount
  })

  return (
    <Card glass>
      <CardHeader>
        <CardTitle className="text-lg">Explore Features</CardTitle>
        <p className="text-sm text-muted-foreground">
          Discover what HomeKeep can do for your family
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-3">
          {sortedFeatures.slice(0, size === 'small' ? 3 : 6).map((feature) => {
            const Icon = feature.icon
            const usageCount = getUsageCount(feature.feature)
            const isUsed = usageCount > 0

            return (
              <Link
                key={feature.feature}
                href={feature.href}
                onClick={() => handleFeatureClick(feature.feature)}
                className={cn(
                  "block rounded-lg p-3 adaptive-transition",
                  "hover:scale-[1.02] hover:shadow-md",
                  isUsed 
                    ? "bg-primary/5 ring-1 ring-primary/20" 
                    : "hover:bg-white/10 dark:hover:bg-black/10"
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "rounded-lg p-2 bg-gradient-to-br",
                    feature.color,
                    isUsed && "ring-2 ring-primary/20"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">
                        {feature.name}
                        {isUsed && (
                          <span className="ml-2 text-xs text-primary">
                            ✓ Active
                          </span>
                        )}
                      </h4>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {feature.description}
                    </p>
                    
                    {/* Show usage count or examples */}
                    {isUsed ? (
                      <p className="text-xs text-primary">
                        Used {usageCount} time{usageCount !== 1 ? 's' : ''}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {feature.examples.slice(0, 2).join(' • ')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        
        {size !== 'small' && (
          <div className="mt-4 pt-4 border-t border-glass/50">
            <p className="text-xs text-muted-foreground text-center">
              💡 Your most-used features will appear at the top of your dashboard
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}