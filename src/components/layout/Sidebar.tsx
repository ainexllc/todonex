'use client'

import { useState, useEffect } from 'react'
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
  TrendingUp,
  ChevronsLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { ProfileDropdown } from './ProfileDropdown'

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home, feature: 'dashboard' },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, feature: 'tasks' },
  { name: 'Shopping', href: '/shopping', icon: ShoppingCart, feature: 'shopping' },
  { name: 'Recipes', href: '/recipes', icon: ChefHat, feature: 'recipes' },
  { name: 'Bills', href: '/bills', icon: CreditCard, feature: 'bills' },
  { name: 'Calendar', href: '/calendar', icon: Calendar, feature: 'calendar' },
  { name: 'Notes', href: '/notes', icon: StickyNote, feature: 'notes' },
  { name: 'Subscriptions', href: '/subscriptions', icon: BarChart3, feature: 'subscriptions' },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, feature: 'analytics' },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { trackFeatureUsage } = useAdaptiveStore()
  const { user } = useAuthStore()

  // Load collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const handleNavClick = (feature: string) => {
    trackFeatureUsage(feature, 'navigate')
  }

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
    trackFeatureUsage('sidebar', newState ? 'collapse' : 'expand')
  }

  return (
    <div 
      data-testid="sidebar"
      className={cn(
        "flex flex-col h-screen border-r grok-elevation sidebar-collapse",
        isCollapsed ? "w-20" : "w-60"
      )}
    >
      {/* Logo/Brand Section - Removed for cleaner look */}

      {/* Navigation Items */}
      <div className="flex-1 p-3 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => handleNavClick(item.feature)}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-lg nav-item",
                "relative",
                isActive && "bg-primary/10 text-primary border-l-3 border-primary",
                !isActive && "text-muted-foreground hover:text-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0 grok-icon" />
              {!isCollapsed && (
                <span className="ml-3 flex-1">{item.name}</span>
              )}
              
              {/* Active indicator when collapsed */}
              {isCollapsed && isActive && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Bottom Section: Profile, Settings, Collapse Button */}
      <div className="border-t border-border">
        {/* Profile Section */}
        <ProfileDropdown isCollapsed={isCollapsed} />

        {/* Collapse Button (when collapsed - positioned below profile) */}
        {isCollapsed && (
          <div className="p-3 flex justify-center">
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="sm"
              className="collapse-button grok-button"
              title="Expand sidebar"
            >
              <ChevronsLeft 
                className="h-4 w-4 collapse-icon rotated"
              />
            </Button>
          </div>
        )}

        {/* Collapse Button (when expanded - positioned at bottom-right) */}
        {!isCollapsed && (
          <div className="relative">
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="sm"
              className="collapse-button grok-button absolute bottom-4 right-4"
              title="Collapse sidebar"
            >
              <ChevronsLeft className="h-4 w-4 collapse-icon" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}