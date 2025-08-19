'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Navigation } from './navigation'
import { MobileNavigation } from './mobile-navigation'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { 
    setFirebaseUser, 
    setUser, 
    setLoading, 
    setInitialized, 
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

  // Initialize Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || userData.displayName,
              photoURL: firebaseUser.photoURL || userData.photoURL,
              familyId: userData.familyId,
              role: userData.role || 'user',
              preferences: userData.preferences,
              createdAt: userData.createdAt?.toDate() || new Date(),
              lastLoginAt: new Date()
            })
            
            // Track app launch
            trackFeatureUsage('app', 'launch')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
      setInitialized(true)
    })

    return unsubscribe
  }, [setFirebaseUser, setUser, setLoading, setInitialized, trackFeatureUsage])

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
      <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading HomeKeep...</p>
        </div>
      </div>
    )
  }

  // Show auth layout for authentication pages
  if (!firebaseUser || pathname?.startsWith('/auth')) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
              HomeKeep
            </h1>
            
            {/* User menu will go here */}
            <div className="flex items-center space-x-4">
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