'use client'

import { FeatureCard } from './FeatureCard'
import { Sparkles, LayoutGrid, Users } from 'lucide-react'

export function FeaturesSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Everything you need to stay organized
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Powerful features designed to make task management effortless and intuitive.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Sparkles}
              title="AI Assistant"
              description="Generate tasks from natural language. Just describe what you need to do and let AI create perfectly structured tasks for you."
            />
            <FeatureCard
              icon={LayoutGrid}
              title="Board & List Views"
              description="Organize tasks your way with multiple view options. Switch between kanban boards, lists, calendars, and more."
            />
            <FeatureCard
              icon={Users}
              title="Collaborate"
              description="Share tasks with your family and team. Keep everyone on the same page with real-time updates and assignments."
            />
          </div>
        </div>
      </div>
    </section>
  )
}
