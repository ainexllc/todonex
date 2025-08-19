'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  CheckSquare, 
  ShoppingCart, 
  ChefHat, 
  CreditCard, 
  Calendar, 
  StickyNote,
  Settings,
  BarChart3,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { Button } from '@/components/ui/button'

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home, feature: 'dashboard' },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, feature: 'tasks' },
  { name: 'Shopping', href: '/shopping', icon: ShoppingCart, feature: 'shopping' },
  { name: 'Recipes', href: '/recipes', icon: ChefHat, feature: 'recipes' },
  { name: 'Bills', href: '/bills', icon: CreditCard, feature: 'bills' },
  { name: 'Calendar', href: '/calendar', icon: Calendar, feature: 'calendar' },
  { name: 'Notes', href: '/notes', icon: StickyNote, feature: 'notes' },
  { name: 'Subscriptions', href: '/subscriptions', icon: BarChart3, feature: 'subscriptions' },
]

export function Navigation() {
  const pathname = usePathname()
  const { trackFeatureUsage, usagePattern } = useAdaptiveStore()

  const handleNavClick = (feature: string) => {
    trackFeatureUsage(feature, 'navigate')
  }

  // Get feature usage for adaptive ordering
  const getFeatureScore = (feature: string) => {
    return usagePattern?.featureUsage[feature]?.count || 0
  }

  // Sort navigation items by usage, but keep Dashboard first
  const sortedItems = [
    navigationItems[0], // Dashboard always first
    ...navigationItems.slice(1).sort((a, b) => getFeatureScore(b.feature) - getFeatureScore(a.feature))
  ]

  return (
    <nav className="fixed inset-y-0 left-0 z-50 w-64 glass-effect border-r border-glass">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"></div>
            <span className="text-xl font-bold text-foreground">HomeKeep</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 space-y-1 px-3 py-4">
          {sortedItems.map((item) => {
            const isActive = pathname === item.href
            const usageCount = getFeatureScore(item.feature)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavClick(item.feature)}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium adaptive-transition",
                  "hover:bg-white/10 dark:hover:bg-black/20 min-touch",
                  isActive
                    ? "bg-white/20 text-foreground dark:bg-white/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {usageCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">
                    {usageCount > 99 ? '99+' : usageCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-glass/50 p-4">
          <Button 
            size="touch" 
            className="w-full glass hover:bg-white/20 dark:hover:bg-black/20"
            onClick={() => trackFeatureUsage('quick-action', 'open')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
        </div>

        {/* Settings */}
        <div className="border-t border-glass/50 p-3">
          <Link
            href="/settings"
            onClick={() => handleNavClick('settings')}
            className={cn(
              "group flex items-center rounded-lg px-3 py-2 text-sm font-medium adaptive-transition",
              "hover:bg-white/10 dark:hover:bg-black/20 text-muted-foreground hover:text-foreground min-touch"
            )}
          >
            <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
            Settings
          </Link>
        </div>
      </div>
    </nav>
  )
}