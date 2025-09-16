'use client'

import { useState } from 'react'
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { SimpleFooter } from "@/components/landing/simple-footer";
import { AuthForm } from "@/components/features/auth/auth-form";

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-gray-900 to-slate-900 text-foreground">
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