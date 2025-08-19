'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { Navigation } from './navigation'
import { MobileNavigation } from './mobile-navigation'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { 
    user,
    firebaseUser,
    loading,
    initialized 
  } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Track app launch when user is available
  useEffect(() => {
    if (user && initialized) {
      trackFeatureUsage('app', 'launch')
    }
  }, [user, initialized, trackFeatureUsage])

  // Handle authentication redirects
  useEffect(() => {
    if (initialized && !loading) {
      const isAuthPage = pathname?.startsWith('/auth')
      
      if (!firebaseUser && !isAuthPage) {
        router.push('/auth')
      } else if (firebaseUser && isAuthPage) {
        router.push('/')
      }
    }
  }, [firebaseUser, initialized, loading, pathname, router])

  // Show loading spinner during initialization
  if (!initialized || loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading NextTaskPro...</p>
        </div>
      </div>
    )
  }

  // Show auth layout for authentication pages
  if (!firebaseUser || pathname?.startsWith('/auth')) {
    return (
      <div className="min-h-dvh bg-background">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop Navigation */}
      {!isMobile && (
        <Navigation />
      )}
      
      {/* Main Content */}
      <div className={cn(
        "min-h-dvh transition-all duration-300",
        !isMobile && "pl-64", // Desktop sidebar width
        isMobile && "pb-16" // Mobile bottom nav height
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 glass-effect border-b border-glass">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-semibold text-foreground">
              NextTaskPro
            </h1>
            
            {/* Theme toggle and user menu */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="h-8 w-8 rounded-full glass-effect"></div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      
      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNavigation />
      )}
    </div>
  )
}