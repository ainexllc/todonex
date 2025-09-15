'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

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


  // Handle authentication redirects
  useEffect(() => {
    if (initialized && !loading) {
      const isAuthPage = pathname?.startsWith('/auth')
      const isPublicPage = pathname === '/' || pathname === '/landing' // Allow root and landing to be public

      // Only redirect to root if user is trying to access auth pages while authenticated
      if (firebaseUser && isAuthPage) {
        router.push('/')
      }
      // No longer redirect unauthenticated users away from protected pages - let each page handle its own auth state
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
    <div className="min-h-dvh bg-background flex flex-col">
      {children}
    </div>
  )
}