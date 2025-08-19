'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  CheckSquare, 
  ShoppingCart, 
  ChefHat, 
  CreditCard,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdaptiveStore } from '@/store/adaptive-store'

// Mobile navigation shows top 4 most used features + home
const mobileNavigationItems = [
  { name: 'Home', href: '/', icon: Home, feature: 'dashboard' },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, feature: 'tasks' },
  { name: 'Shopping', href: '/shopping', icon: ShoppingCart, feature: 'shopping' },
  { name: 'Recipes', href: '/recipes', icon: ChefHat, feature: 'recipes' },
  { name: 'Bills', href: '/bills', icon: CreditCard, feature: 'bills' },
]

export function MobileNavigation() {
  const pathname = usePathname()
  const { trackFeatureUsage, usagePattern } = useAdaptiveStore()

  const handleNavClick = (feature: string) => {
    trackFeatureUsage(feature, 'navigate')
  }

  // Get feature usage for adaptive ordering
  const getFeatureScore = (feature: string) => {
    return usagePattern?.featureUsage[feature]?.count || 0
  }

  // Sort by usage but keep Home first
  const sortedItems = [
    mobileNavigationItems[0], // Home always first
    ...mobileNavigationItems.slice(1).sort((a, b) => getFeatureScore(b.feature) - getFeatureScore(a.feature)).slice(0, 3)
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-glass">
      <div className="flex h-16">
        {/* Navigation items */}
        {sortedItems.map((item, index) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => handleNavClick(item.feature)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center adaptive-transition min-touch",
                "hover:bg-white/10 dark:hover:bg-black/20",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5",
                isActive && "text-primary"
              )} />
              <span className={cn(
                "mt-1 text-xs font-medium",
                isActive && "text-primary"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}

        {/* Quick Add FAB */}
        <button
          onClick={() => trackFeatureUsage('quick-action', 'open')}
          className="flex flex-1 flex-col items-center justify-center text-primary hover:text-primary/80 adaptive-transition min-touch"
        >
          <div className="rounded-full bg-primary p-2">
            <Plus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="mt-1 text-xs font-medium">Add</span>
        </button>
      </div>
    </nav>
  )
}