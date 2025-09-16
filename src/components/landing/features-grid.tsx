'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Brain, MessageSquare, Users } from 'lucide-react'

export function FeaturesGrid() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Creation',
      description: 'Describe your tasks in natural language and watch AI create perfectly organized, actionable lists.'
    },
    {
      icon: MessageSquare,
      title: 'Smart Organization',
      description: 'Automatic priority detection and intelligent categorization keeps your tasks perfectly organized.'
    },
    {
      icon: Users,
      title: 'Family Collaboration',
      description: 'Share tasks with family members and keep everyone organized and accountable together.'
    }
  ]

  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center lg:text-left space-y-4 mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              Everything you need to stay organized
            </h2>
            <p className="text-slate-300 max-w-xl">
              Powerful features designed to make task management effortless and intuitive.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid lg:grid-cols-1 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-colors backdrop-blur">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">
                          {feature.title}
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}