'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
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
  
  // Emergency bypass for persistent loading issues in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => {
        if (!initialized && loading) {
          setEmergencyBypass(true)
        }
      }, 15000) // 15 seconds
      
      return () => clearTimeout(timer)
    }
  }, [initialized, loading])


  // Let individual pages handle their own authentication redirects
  // MainLayout no longer handles redirects to avoid conflicts with page-level logic

  // Show loading spinner during initialization (unless emergency bypass is active)
  if ((!initialized || loading) && !emergencyBypass) {
    return (
      <div className="h-screen overflow-hidden bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading TodoNex...</p>
          <p className="text-xs text-muted-foreground opacity-60">
            Initialized: {initialized ? 'Yes' : 'No'} | Loading: {loading ? 'Yes' : 'No'}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setEmergencyBypass(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
              >
                Emergency Bypass (Dev Only)
              </button>
              <button
                onClick={() => window.location.reload()}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Force Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show auth layout for authentication pages
  if (!firebaseUser || pathname?.startsWith('/auth')) {
    return (
      <div className="h-screen overflow-hidden bg-background">
        {children}
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      {children}
    </div>
  )
}
