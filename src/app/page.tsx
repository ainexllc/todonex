'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sparkles, Check } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { AuthForm } from '@/components/features/auth/auth-form'
import { SimpleFooter } from '@/components/landing/simple-footer'
import { DashboardShell } from '@/components/features/tasks/DashboardShell'
import { DEFAULT_THEME_ID } from '@/lib/theme/registry'

const FEATURE_CARDS = [
  {
    title: 'Capture in seconds',
    description:
      'Drop tasks from voice, chat, or keyboard without losing momentum. TodoNex keeps pace and context automatically.'
  },
  {
    title: 'Plan with clarity',
    description:
      'Swap between focus and board views, sequence priorities instantly, and give stakeholders a live picture of progress.'
  },
  {
    title: 'Execute together',
    description:
      'Keep teams aligned with shared automations, AI nudges, and rituals that surface exactly what needs attention next.'
  }
]

const HIGHLIGHT_POINTS = [
  'AI copilots orchestrate every backlog',
  'Capture from email, chat, and voice in one place',
  'Realtime automations keep everyone aligned'
]

function LandingWordmark() {
  return (
    <div className="logo-wordmark flex items-center text-[43.6px] font-bold font-[family-name:var(--font-kanit)] tracking-[-1.526px]">
      <span className="text-orange-500">Todo</span>
      <span className="text-white">Ne</span>
      <span className="relative inline-block -ml-[21px] translate-y-[7px]" style={{ width: 87.2, height: 87.2 }}>
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true" focusable="false">
          <rect x="10" y="10" width="15" height="15" fill="#f97316" />
          <rect x="30" y="30" width="15" height="15" fill="#f97316" />
          <rect x="50" y="50" width="15" height="15" fill="#f97316" />
          <rect x="70" y="70" width="15" height="15" fill="#f97316" />
          <rect x="70" y="10" width="15" height="15" fill="white" />
          <rect x="50" y="30" width="15" height="15" fill="white" />
          <rect x="30" y="50" width="15" height="15" fill="white" />
          <rect x="10" y="70" width="15" height="15" fill="white" />
        </svg>
      </span>
    </div>
  )
}

function LandingContent() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (!theme || theme === 'system') {
      setTheme(DEFAULT_THEME_ID)
    }
  }, [theme, setTheme])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-gray-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.25),_transparent_55%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,_rgba(255,115,35,0.12)_0%,_rgba(17,17,17,0.85)_45%,_rgba(6,6,6,1)_100%)]" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:py-7">
        <LandingWordmark />
        <div className="hidden items-center gap-3 md:flex">
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-orange-300">
            Alpha access
          </span>
          <a href="#features" className="text-sm text-gray-300 transition hover:text-white">
            Features
          </a>
          <a href="#automations" className="text-sm text-gray-300 transition hover:text-white">
            Automations
          </a>
          <a href="#faq" className="text-sm text-gray-300 transition hover:text-white">
            FAQ
          </a>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-start gap-12 px-6 pb-24 pt-10 lg:grid-cols-[1.1fr_minmax(0,1fr)] lg:pb-28 lg:pt-16">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-orange-300">
            <Sparkles className="h-3.5 w-3.5" />
            New
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
            Plan bold work on an AI-tuned productivity canvas.
          </h1>
          <p className="max-w-xl text-lg text-gray-400">
            TodoNex blends natural language capture with adaptive automations so your team can move from ideas to done
            without losing momentum or control.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
            {HIGHLIGHT_POINTS.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-orange-400" />
                {point}
              </div>
            ))}
          </div>
        </div>

        <AuthForm mode="signin" />
      </section>

      <section id="features" className="relative border-t border-white/5 bg-black/60 py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_60%)] opacity-70" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_CARDS.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#0b0b0b] via-[#090909] to-[#050505] p-6 transition hover:border-orange-500/50"
            >
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="automations" className="border-t border-white/5 bg-[#070707] py-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 text-center sm:gap-8">
          <span className="self-center rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
            Automations
          </span>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Launch rituals that dispatch nudges, follow-ups, and summaries automatically.
          </h2>
          <p className="text-sm text-gray-400 sm:text-base">
            TodoNex coordinates stand-ups, deep-work blocks, and stakeholder updates with the same AI copilots that shape
            your backlog. Everything stays auditable and on-brand.
          </p>
        </div>
      </section>

      <section id="faq" className="border-t border-white/5 bg-black py-16">
        <div className="mx-auto w-full max-w-5xl space-y-6 px-6 sm:space-y-8">
          <h2 className="text-center text-3xl font-semibold text-white sm:text-4xl">Questions teams ask us</h2>
          <div className="space-y-4 text-left">
            <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
              <p className="text-sm font-semibold text-white sm:text-base">Does TodoNex replace our existing PM stack?</p>
              <p className="mt-2 text-sm text-gray-400">
                We sit alongside your current tooling. TodoNex syncs tasks via integrations and pipes insights back into
                Slack, Teams, Notion, and more.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
              <p className="text-sm font-semibold text-white sm:text-base">How opinionated are the automations?</p>
              <p className="mt-2 text-sm text-gray-400">
                Automations are templates you can edit down to the variable. Adjust triggers, approvals, and the tone of AI
                language so they mirror your rituals.
              </p>
            </div>
          </div>
        </div>
      </section>

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
