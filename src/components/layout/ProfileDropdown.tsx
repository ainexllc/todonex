'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  Settings, 
  Bug, 
  Users, 
  HelpCircle, 
  CreditCard, 
  LogOut,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface ProfileDropdownProps {
  isCollapsed?: boolean
}

const menuItems = [
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    action: null
  },
  {
    label: 'Report Issue',
    icon: Bug,
    href: '/support/report',
    action: null
  },
  {
    label: 'Community',
    icon: Users,
    href: '/community',
    action: null
  },
  {
    label: 'FAQ',
    icon: HelpCircle,
    href: '/help/faq',
    action: null
  },
  {
    label: 'Manage Subscription',
    icon: CreditCard,
    href: '/subscription',
    action: null
  },
  {
    label: 'Sign Out',
    icon: LogOut,
    href: null,
    action: 'signOut'
  }
]

export function ProfileDropdown({ isCollapsed = false }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, signOut } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleProfileClick = () => {
    setIsOpen(!isOpen)
    trackFeatureUsage('profile', isOpen ? 'close_menu' : 'open_menu')
  }

  const handleMenuItemClick = async (item: typeof menuItems[0]) => {
    setIsOpen(false)
    trackFeatureUsage('profile', `menu_${item.label.toLowerCase().replace(' ', '_')}`)
    
    if (item.action === 'signOut') {
      await signOut()
    }
  }

  if (isCollapsed) {
    // When collapsed, don't show dropdown - just the profile icon
    return (
      <div className="px-3 pt-3 flex justify-center">
        <div className="nav-item rounded-lg p-2 cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-white" />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon */}
      <div className="px-3 pt-3">
        <button
          onClick={handleProfileClick}
          className="nav-item rounded-lg p-2 cursor-pointer hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
          title="Profile Menu"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-white" />
            )}
          </div>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "absolute bottom-full left-3 right-3 mb-2 z-50",
          "bg-background border border-border rounded-lg shadow-lg",
          "grok-elevation overflow-hidden"
        )}>
          <div className="py-2">
            {/* Settings */}
            <Link
              href="/settings"
              onClick={() => handleMenuItemClick({ label: 'Settings', icon: Settings, href: '/settings', action: null })}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm",
                "text-foreground hover:bg-hover-light dark:hover:bg-hover-dark",
                "transition-colors duration-200 cursor-pointer"
              )}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </Link>

            {/* Theme Toggle */}
            <div className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-sm",
              "text-foreground hover:bg-hover-light dark:hover:bg-hover-dark",
              "transition-colors duration-200"
            )}>
              <div className="h-4 w-4 flex items-center justify-center">
                <ThemeToggle />
              </div>
              <span>Theme</span>
            </div>

            {/* Separator */}
            <div className="mx-4 my-2 border-t border-border" />

            {/* Other menu items (excluding Settings since it's now at the top) */}
            {menuItems.filter(item => item.label !== 'Settings').map((item, index) => {
              const Icon = item.icon
              
              if (item.href) {
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => handleMenuItemClick(item)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm",
                      "text-foreground hover:bg-hover-light dark:hover:bg-hover-dark",
                      "transition-colors duration-200 cursor-pointer"
                    )}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </Link>
                )
              }

              return (
                <button
                  key={index}
                  onClick={() => handleMenuItemClick(item)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm",
                    "text-foreground hover:bg-hover-light dark:hover:bg-hover-dark",
                    "transition-colors duration-200 cursor-pointer text-left",
                    item.action === 'signOut' && "text-red-600 dark:text-red-400"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4",
                    item.action === 'signOut' 
                      ? "text-red-600 dark:text-red-400" 
                      : "text-muted-foreground"
                  )} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}