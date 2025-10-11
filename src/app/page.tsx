'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, ArrowRight, Command } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AuthForm } from '@/components/features/auth/auth-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { SimpleFooter } from '@/components/landing/simple-footer'
import { DashboardShell } from '@/components/features/tasks/DashboardShell'

const FEATURE_PREVIEWS = [
  {
    id: 'board',
    title: 'Plan in color-coded columns',
    description: 'Drag & drop tasks across AI-enhanced board views.',
    image: '/previews/board-light.png'
  },
  {
    id: 'list',
    title: 'Switch to list focus instantly',
    description: 'Filter and sort with lightning-fast keyboard commands.',
    image: '/previews/list-dark.png'
  },
  {
    id: 'ai',
    title: 'Co-create tasks with AI',
    description: 'Capture voice notes or describe projects in natural language.',
    image: '/previews/ai-assistant.png'
  }
]

const WORKFLOW_STEPS = [
  {
    title: 'Capture in seconds',
    description:
      'Use keyboard shortcuts, voice capture, or the AI assistant to turn thoughts into tasks without breaking your flow.'
  },
  {
    title: 'Plan with clarity',
    description:
      'Move tasks across board and list views, assign priorities, and keep context with inline notes and tags.'
  },
  {
    title: 'Execute together',
    description:
      'Share workspaces, comment in real time, and let TodoNex surface what matters most every day.'
  }
]

function LandingContent() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)

  const goToAuth = () => {
    const authSection = document.getElementById('auth-card')
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const featurePreview = FEATURE_PREVIEWS[activePreviewIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">TodoNex</p>
              <p className="text-base font-semibold">AI-first productivity</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-2 text-xs md:inline-flex"
              onClick={goToAuth}
            >
              <Command className="h-3 w-3" />
              Invite your team
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-16">
          <div className="relative z-10 flex flex-col gap-8 lg:col-span-7">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <Sparkles className="h-3 w-3" />
                Built for AI-assisted teams
              </span>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Plan, capture, and complete tasks faster with TodoNex.
              </h1>
              <p className="max-w-xl text-base text-muted-foreground">
                TodoNex blends natural language capture, voice commands, and flexible board views so your team always
                knows what’s next. Switch themes, automate busywork, and stay perfectly aligned.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={goToAuth} className="gap-2">
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setAuthMode('signup')}
                  className="gap-2 text-sm"
                >
                  Explore features
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-border/50 bg-gradient-to-br from-background/60 via-background/40 to-background/20 p-6 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Themes for every workflow</p>
                  <p className="text-xs text-muted-foreground">Preview board, list, and AI-assisted views.</p>
                </div>
                <div className="flex gap-2">
                  {FEATURE_PREVIEWS.map((preview, index) => (
                    <button
                      key={preview.id}
                      type="button"
                      className={`flex h-10 items-center justify-center rounded-full border border-border/40 bg-background/70 px-3 text-xs text-muted-foreground transition hover:border-border hover:text-foreground ${
                        activePreviewIndex === index ? 'border-primary text-foreground shadow-sm' : ''
                      }`}
                      onClick={() => {
                        setActivePreviewIndex(index)
                        setAuthMode(index % 2 === 0 ? 'signup' : 'signin')
                      }}
                      aria-pressed={activePreviewIndex === index}
                    >
                      {preview.title.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-border/60 bg-background/80 shadow-inner">
                <div className="relative aspect-video">
                  <Image src={featurePreview.image} alt={featurePreview.title} fill className="object-cover" priority />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-background/70 p-5 text-sm">
                <p className="font-semibold text-foreground">Loved by fast-moving teams</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  “TodoNex is the first tool that makes AI feel natural in daily planning.”
                </p>
                <p className="mt-3 text-[11px] font-medium text-muted-foreground">Laura Chen • Head of Product, Nimbus</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/70 p-5 text-sm">
                <p className="font-semibold text-foreground">Keyboard-first experience</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Power users fly with shortcuts, command palette, and bulk editing.
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/70 p-5 text-sm">
                <p className="font-semibold text-foreground">Realtime sync</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Collaborate instantly—assign, comment, and track progress live.
                </p>
              </div>
            </div>
          </div>

          <div id="auth-card" className="lg:col-span-5">
            <div className="sticky top-20">
              <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
                <div className="mb-6 flex flex-col gap-2">
                  <h2 className="text-xl font-semibold text-foreground">Ready when you are</h2>
                  <p className="text-sm text-muted-foreground">
                    Create your workspace in seconds. No credit card required.
                  </p>
                </div>
                <Tabs
                  value={authMode}
                  onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin" className="mt-4">
                    <AuthForm mode="signin" />
                  </TabsContent>
                  <TabsContent value="signup" className="mt-4">
                    <AuthForm mode="signup" />
                  </TabsContent>
                </Tabs>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-primary/70">Why teams switch</p>
                  <ul className="space-y-1.5">
                    <li>• Capture tasks via AI, voice, or keyboard in seconds.</li>
                    <li>• Switch between board, timeline, and list views instantly.</li>
                    <li>• Collaborate live with shared workspaces and comments.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/40 bg-background/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <FeaturesGrid />
          </div>
        </section>

        <section className="border-t border-border/40 bg-background/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                How modern teams ship faster with TodoNex
              </h2>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                A guided workflow that keeps planning, execution, and collaboration in perfect sync.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {WORKFLOW_STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-border/40 bg-background/70 p-6 text-left shadow-sm transition hover:border-border hover:shadow-md"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background text-sm font-semibold text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-4 text-base font-semibold text-foreground">{step.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/40 bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-6 rounded-3xl border border-primary/40 bg-primary/10 p-8 text-center shadow-lg sm:p-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Launching soon
              </span>
              <h3 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Bring TodoNex into your team’s daily rhythm
              </h3>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Join the waitlist to get early access to AI-assisted planning, keyboard-first tasking, and collaborative
                workspaces designed for high-performing teams.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" onClick={goToAuth} className="gap-2">
                  Join the beta
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setAuthMode('signin')}
                  className="gap-2 text-sm"
                >
                  See dashboard demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SimpleFooter />
    </div>
  )
}

export default function Page() {
  const { firebaseUser } = useAuthStore()

  if (firebaseUser) {
    return <DashboardShell redirectUnauthed={false} />
  }

  return <LandingContent />
}
