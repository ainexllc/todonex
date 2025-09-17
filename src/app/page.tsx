'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthRedirect } from '@/hooks/use-auth-redirect'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { SimpleFooter } from "@/components/landing/simple-footer";
import { AuthForm } from "@/components/features/auth/auth-form";

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const { firebaseUser, initialized, loading, user } = useAuthStore()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  // Use centralized authentication redirect hook
  useAuthRedirect()

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await signOut(auth)
      console.log('User signed out successfully')
      setSigningOut(false)
    } catch (error) {
      console.error('Sign out error:', error)
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-gray-900 to-slate-900 text-foreground">
      {/* Auth Status Bar - Only show when authenticated and not redirecting */}
      {firebaseUser && !signingOut && (
        <div className="fixed top-0 right-0 z-50 p-4 flex items-center space-x-4 bg-slate-800/80 backdrop-blur rounded-bl-lg">
          <div className="flex items-center space-x-2">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                <User className="h-4 w-4 text-slate-300" />
              </div>
            )}
            <span className="text-sm text-slate-300">{user?.displayName || user?.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={signingOut}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </Button>
          <Button
            size="sm"
            onClick={() => router.push('/tasks')}
            className="bg-primary text-primary-foreground"
          >
            Go to Tasks
          </Button>
        </div>
      )}
      <div className="flex min-h-screen">
        {/* Left Side - Content */}
        <div className="flex-1 flex flex-col lg:w-1/2">
          {/* Hero Section */}
          <HeroSection authMode={authMode} setAuthMode={setAuthMode} />

          {/* Features Section */}
          <section className="flex-1 bg-slate-800/30 backdrop-blur-sm">
            <FeaturesGrid />
          </section>

          {/* Footer */}
          <SimpleFooter />
        </div>

        {/* Right Side - Auth Form */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-800/50 backdrop-blur border-l border-slate-700/50">
          <div className="flex items-center justify-center w-full p-8">
            <div className="w-full max-w-md">
              <AuthForm mode={authMode} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Auth Section */}
      <div className="lg:hidden bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-md mx-auto">
            <AuthForm mode={authMode} />
          </div>
        </div>
      </div>
    </div>
  );
}