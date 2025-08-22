'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { Sidebar } from './Sidebar'
import { MobileNavigation } from './mobile-navigation'
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
  const [emergencyBypass, setEmergencyBypass] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  // Emergency bypass for persistent loading issues in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => {
        if (!initialized && loading) {
          console.warn('MainLayout: Emergency bypass activated due to persistent loading')
          setEmergencyBypass(true)
        }
      }, 15000) // 15 seconds
      
      return () => clearTimeout(timer)
    }
  }, [initialized, loading])

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

  // Show loading spinner during initialization (unless emergency bypass is active)
  if ((!initialized || loading) && !emergencyBypass) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading NextTaskPro...</p>
          <p className="text-xs text-muted-foreground opacity-60">
            Initialized: {initialized ? 'Yes' : 'No'} | Loading: {loading ? 'Yes' : 'No'}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={() => setEmergencyBypass(true)}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
            >
              Emergency Bypass (Dev Only)
            </button>
          )}
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
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar />
      )}
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-auto page-transition",
        isMobile && "pb-16" // Mobile bottom nav height
      )}>
        {children}
      </main>
      
      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNavigation />
      )}
    </div>
  )
}