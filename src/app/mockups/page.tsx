'use client'

import { cn } from '@/lib/utils'

const MOCKUPS: Array<{
  id: string
  title: string
  tagline: string
  description: string
  accents: string[]
  preview: {
    board: string
    column: string
    card: string
    cardAccent?: string
    header?: string
  }
}> = [
  {
    id: 'aurora-flow',
    title: 'Aurora Flow',
    tagline: 'Gradient energy with live status beams',
    description:
      'Atmospheric teal-to-violet gradients, glowing column dividers, and focus outlines that pulse when tasks approach their due date.',
    accents: ['Dynamic header shimmer', 'Animated status beams', 'Glowing drag handles'],
    preview: {
      board: 'bg-gradient-to-br from-slate-950 via-purple-900 to-cyan-800',
      column: 'bg-white/10 border border-white/10',
      card: 'bg-slate-900/80 border border-cyan-400/40',
      cardAccent: 'bg-cyan-400/60'
    }
  },
  {
    id: 'glass-blueprint',
    title: 'Glass Blueprint',
    tagline: 'Frosted layers over structural grid',
    description:
      'Frosted glass kanban cards float above a blueprint grid with cyan structural lines and crisp typography for design-forward teams.',
    accents: ['Blueprint background grid', 'Frosted glass cards', 'Compact info bars'],
    preview: {
      board: 'bg-slate-900 bg-[radial-gradient(circle_at_top,_#0ea5e920,_transparent_60%)]',
      column: 'bg-white/12 backdrop-blur border border-cyan-200/30',
      card: 'bg-white/18 backdrop-blur border border-white/20',
      cardAccent: 'bg-cyan-300/60'
    }
  },
  {
    id: 'productivity-heatmap',
    title: 'Productivity Heatmap',
    tagline: 'Color-coded workload density',
    description:
      'Warm-to-cool column bands telegraph workload intensity while task cards carry temperature chips that shift color as urgency rises.',
    accents: ['Heat-based column bands', 'Urgency chips', 'Muted slate surface'],
    preview: {
      board: 'bg-slate-950',
      column: 'bg-gradient-to-b from-orange-500/30 via-amber-400/20 to-emerald-500/20 border border-slate-800',
      card: 'bg-slate-900 border border-white/5',
      cardAccent: 'bg-gradient-to-r from-amber-400 to-orange-500'
    }
  },
  {
    id: 'timeline-split',
    title: 'Split Focus Timeline',
    tagline: 'Kanban up top, schedule below',
    description:
      'Hybrid board pairs vertical columns with a timeline strip for drag-to-schedule flows, blending planning and execution on one screen.',
    accents: ['Dual-layer layout', 'Time-of-day swimlanes', 'Drag-to-schedule hints'],
    preview: {
      board: 'bg-slate-950',
      column: 'bg-slate-900/70 border border-slate-800',
      card: 'bg-slate-800/80 border border-slate-700',
      header: 'bg-slate-900/90',
      cardAccent: 'bg-sky-400/70'
    }
  },
  {
    id: 'pinned-panels',
    title: 'Pinned Panels',
    tagline: 'Sticky toolheads & hover ribbons',
    description:
      'Column headers become action hubs with quick filters, AI suggestions, and add-task shortcuts while cards reveal metadata on hover ribbons.',
    accents: ['Sticky action headers', 'Hover metadata ribbons', 'Ambient accent stroke'],
    preview: {
      board: 'bg-slate-950',
      column: 'bg-slate-900/80 border border-indigo-500/30',
      card: 'bg-slate-800/70 border border-white/10',
      cardAccent: 'bg-indigo-400/70'
    }
  },
  {
    id: 'calm-workbench',
    title: 'Calm Workbench',
    tagline: 'Minimalist executive aesthetic',
    description:
      'Bone-white canvas, serif headlines, and priority folds instead of badges craft a calm, leadership-ready view focused on clarity.',
    accents: ['Serif section titles', 'Corner-fold priority markers', 'Soft bone palette'],
    preview: {
      board: 'bg-[#f3f1ee]',
      column: 'bg-white border border-[#d9d4cd]',
      card: 'bg-white shadow-[0_12px_30px_rgba(112,72,0,0.08)] border border-[#ede7de]',
      cardAccent: 'bg-[#d3b17d]'
    }
  },
  {
    id: 'command-center',
    title: 'Command Center',
    tagline: 'Neon edges with command palette',
    description:
      'Dark charcoal UI with luminous edges, quick command palette, live completion gauges, and single-card focus mode for power users.',
    accents: ['Command palette', 'Neon edge glow', 'Integrated completion gauge'],
    preview: {
      board: 'bg-slate-950',
      column: 'bg-slate-900/80 border border-fuchsia-500/40',
      card: 'bg-slate-900 border border-white/10 shadow-[0_0_25px_rgba(217,70,239,0.25)]',
      cardAccent: 'bg-fuchsia-400/80'
    }
  },
  {
    id: 'hybrid-matrix',
    title: 'Hybrid Matrix',
    tagline: 'Columns meet micro-calendars',
    description:
      'Each column transforms into a stacked tile with integrated calendar micro views, enabling in-place rescheduling and rollups.',
    accents: ['Calendar mini panels', 'Drag-to-reschedule drop zones', 'Summary rollups'],
    preview: {
      board: 'bg-slate-950',
      column: 'bg-slate-900/80 border border-emerald-500/30',
      card: 'bg-slate-800/70 border border-emerald-500/30',
      cardAccent: 'bg-emerald-400/70'
    }
  },
  {
    id: 'adaptive-glow',
    title: 'Adaptive Glow',
    tagline: 'Circadian-aware theming',
    description:
      'Gradient beams shift with time of day—sunrise, midday, dusk, midnight—while cards adjust iconography and color temperature automatically.',
    accents: ['Time-based gradients', 'Circadian icon set', 'Adaptive color temperature'],
    preview: {
      board: 'bg-gradient-to-br from-orange-500/40 via-purple-600/40 to-slate-950',
      column: 'bg-white/10 border border-white/15 backdrop-blur',
      card: 'bg-slate-900/70 border border-white/10',
      cardAccent: 'bg-orange-300/70'
    }
  },
  {
    id: 'accessible-bold',
    title: 'Accessible Bold',
    tagline: 'High contrast, inclusive spacing',
    description:
      'Ink-and-ivory contrast, colorblind-safe markers, 18px base type, and adjustable spacing ensure accessibility without sacrificing flair.',
    accents: ['Colorblind-safe markers', 'Text scaling controls', 'Keyboard-first focus states'],
    preview: {
      board: 'bg-[#0f172a]',
      column: 'bg-[#0b1220] border border-[#1f2937]',
      card: 'bg-[#111827] border border-white/20',
      cardAccent: 'bg-[#22d3ee]',
      header: 'bg-[#1f2937]'
    }
  }
]

function PreviewColumn({
  preview,
  variant
}: {
  preview: (typeof MOCKUPS)[number]['preview']
  variant: 'left' | 'middle' | 'right'
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-2 rounded-xl p-2',
        preview.column,
        variant === 'middle' && 'scale-95 opacity-95',
        variant === 'right' && 'scale-[0.9] opacity-90'
      )}
    >
      <div className={cn('mb-1 h-4 w-20 rounded-full text-xs font-medium', preview.header ?? preview.card)} />
      {[0, 1].map((index) => (
        <div key={index} className={cn('rounded-lg border px-2 py-2 shadow-sm', preview.card)}>
          <div className="flex items-center justify-between">
            <span className="h-3 w-12 rounded-full bg-white/40" />
            <span className="h-2 w-2 rounded-full bg-white/30" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={cn('h-1.5 flex-1 rounded-full', preview.cardAccent)} />
            <span className="h-1.5 w-6 rounded-full bg-white/20" />
          </div>
          <div className="mt-2 flex gap-1">
            <span className="h-1 w-6 rounded-full bg-white/10" />
            <span className="h-1 w-8 rounded-full bg-white/10" />
            <span className="h-1 w-5 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MockupsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Exploration Gallery</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Board View Mockups · Early Visual Directions
          </h1>
          <p className="max-w-3xl text-base text-slate-300">
            Ten distinct visual explorations for TodoNex’s kanban board. Each tile highlights the core styling ideas, key
            accents, and a lightweight preview block to help compare directions before moving into high-fidelity design.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {MOCKUPS.map((mockup, index) => (
            <section
              key={mockup.id}
              className={cn(
                'group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.45)] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_35px_120px_rgba(56,189,248,0.25)]',
                index % 2 === 0 ? 'md:translate-y-0' : 'md:translate-y-8'
              )}
            >
              <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-60" />
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{`Concept ${String(index + 1).padStart(2, '0')}`}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{mockup.title}</h2>
                  <p className="mt-1 text-sm font-medium text-cyan-300">{mockup.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{mockup.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                  {mockup.accents.map((accent) => (
                    <span key={accent} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                      {accent}
                    </span>
                  ))}
                </div>

                <div className="relative h-48 rounded-2xl border border-white/5 p-3">
                  <div
                    className={cn(
                      'flex h-full items-start gap-3 overflow-hidden rounded-2xl border border-white/5 p-3',
                      mockup.preview.board
                    )}
                  >
                    <PreviewColumn preview={mockup.preview} variant="left" />
                    <PreviewColumn preview={mockup.preview} variant="middle" />
                    <PreviewColumn preview={mockup.preview} variant="right" />
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
