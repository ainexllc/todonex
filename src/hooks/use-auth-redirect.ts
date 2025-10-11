'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

interface AuthRedirectOptions {
  disablePublicRedirect?: boolean
  disableProtectedRedirect?: boolean
  protectedRoutes?: string[]
  publicRoutes?: string[]
  destinationForAuthed?: string
  destinationForGuests?: string
}

export function useAuthRedirect(options: AuthRedirectOptions = {}) {
  const { firebaseUser, initialized, loading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirected = useRef(false)

  const {
    disablePublicRedirect = false,
    disableProtectedRedirect = false,
    protectedRoutes = ['/tasks', '/profile', '/settings'],
    publicRoutes = ['/', '/auth', '/signin', '/signup', '/forgot-password'],
    destinationForAuthed = '/tasks',
    destinationForGuests = '/'
  } = options

  useEffect(() => {
    // Wait for auth to be initialized
    if (!initialized || loading) return

    // Reset the flag when pathname changes (navigation completed)
    if (hasRedirected.current && pathname) {
      hasRedirected.current = false
    }

    // Define protected and public routes
    const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname?.startsWith('/auth'))

    // Prevent redirect if we've already redirected in this render cycle
    if (hasRedirected.current) return

    // RULE 1: If authenticated and on public route → redirect to /tasks
    if (!disablePublicRedirect && firebaseUser && isPublicRoute) {
      hasRedirected.current = true
      router.push(destinationForAuthed)
      return
    }

    // RULE 2: If not authenticated and on protected route → redirect to /
    if (!disableProtectedRedirect && !firebaseUser && isProtectedRoute) {
      hasRedirected.current = true
      router.push(destinationForGuests)
      return
    }
  }, [firebaseUser, initialized, loading, pathname, router])

  // Return false for isRedirecting since we're not tracking it as state anymore
  return { isRedirecting: false }
}
