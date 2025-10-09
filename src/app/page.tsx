'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useAuthRedirect } from '@/hooks/use-auth-redirect'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Sparkles } from 'lucide-react'
import HeroSectionV2 from "@/components/landing/HeroSectionV2"
import { FeaturesGrid } from "@/components/landing/features-grid"
import { SimpleFooter } from "@/components/landing/simple-footer"
import { AuthForm } from "@/components/features/auth/auth-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const { firebaseUser } = useAuthStore()
  const router = useRouter()

  // Use centralized authentication redirect hook
  useAuthRedirect()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TodoNex</span>
            </div>

            {/* Right side - Theme toggle + Auth button */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {!firebaseUser && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const authSection = document.getElementById('auth-section')
                    if (authSection) {
                      authSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="hidden sm:flex"
                >
                  Get Started
                </Button>
              )}
              {firebaseUser && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push('/tasks')}
                >
                  Go to Tasks
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Single Column */}
      <main className="w-full">
        {/* Hero Section */}
        <HeroSectionV2 authMode={authMode} setAuthMode={setAuthMode} />

        {/* Features Section */}
        <section className="w-full py-12 md:py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FeaturesGrid />
          </div>
        </section>

        {/* Auth Section */}
        {!firebaseUser && (
          <section id="auth-section" className="w-full py-12 md:py-16 lg:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-md mx-auto">
                {/* Tabs for Sign In / Sign Up */}
                <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin">
                    <AuthForm mode="signin" />
                  </TabsContent>
                  <TabsContent value="signup">
                    <AuthForm mode="signup" />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <SimpleFooter />
    </div>
  )
}