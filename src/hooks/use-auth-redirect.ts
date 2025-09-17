'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export function useAuthRedirect() {
  const { firebaseUser, initialized, loading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Wait for auth to be initialized
    if (!initialized || loading) {
      console.log('[AuthRedirect] Waiting for auth initialization...')
      return
    }

    // Reset the flag when pathname changes (navigation completed)
    if (hasRedirected.current && pathname) {
      hasRedirected.current = false
    }

    // Define protected and public routes
    const protectedRoutes = ['/tasks', '/dashboard', '/profile', '/settings']
    const publicRoutes = ['/', '/auth', '/signin', '/signup', '/forgot-password']

    const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname?.startsWith('/auth'))

    console.log('[AuthRedirect] Current state:', {
      pathname,
      isAuthenticated: !!firebaseUser,
      isProtectedRoute,
      isPublicRoute,
      hasRedirected: hasRedirected.current,
      userId: firebaseUser?.uid
    })

    // Prevent redirect if we've already redirected in this render cycle
    if (hasRedirected.current) {
      return
    }

    // RULE 1: If authenticated and on public route → redirect to /tasks
    if (firebaseUser && isPublicRoute) {
      console.log('[AuthRedirect] Authenticated user on public route, redirecting to /tasks')
      hasRedirected.current = true
      router.push('/tasks')
      return
    }

    // RULE 2: If not authenticated and on protected route → redirect to /
    if (!firebaseUser && isProtectedRoute) {
      console.log('[AuthRedirect] Unauthenticated user on protected route, redirecting to /')
      hasRedirected.current = true
      router.push('/')
      return
    }

    console.log('[AuthRedirect] User is in the correct location, no redirect needed')
  }, [firebaseUser, initialized, loading, pathname, router])

  // Return false for isRedirecting since we're not tracking it as state anymore
  return { isRedirecting: false }
}