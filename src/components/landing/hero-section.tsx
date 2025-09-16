'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

interface HeroSectionProps {
  authMode: 'signin' | 'signup'
  setAuthMode: (mode: 'signin' | 'signup') => void
}

export function HeroSection({ authMode, setAuthMode }: HeroSectionProps) {
  return (
    <section className="py-12 lg:py-20 bg-gradient-to-b from-transparent to-slate-800/20">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center lg:text-left space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur text-slate-300 px-4 py-2 rounded-full text-sm font-medium border border-slate-700/50">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Task Management</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
              Simple Task Management
              <span className="block text-primary">That Actually Works</span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed">
              Transform your productivity with AI-powered task creation.
              Just describe what you need to do in natural language.
            </p>
          </div>

          {/* Mode Switch Buttons - Mobile/Small screens */}
          <div className="flex gap-2 justify-center lg:justify-start lg:hidden">
            <Button
              size="sm"
              variant={authMode === 'signup' ? 'default' : 'outline'}
              onClick={() => setAuthMode('signup')}
              className={authMode === 'signup' ? 'bg-primary text-primary-foreground' : 'border-slate-600 text-slate-300'}
            >
              Sign Up
            </Button>
            <Button
              size="sm"
              variant={authMode === 'signin' ? 'default' : 'outline'}
              onClick={() => setAuthMode('signin')}
              className={authMode === 'signin' ? 'bg-primary text-primary-foreground' : 'border-slate-600 text-slate-300'}
            >
              Sign In
            </Button>
          </div>

          {/* Benefits List */}
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3 text-slate-300">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>AI understands natural language</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Smart priority detection</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Family collaboration tools</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}