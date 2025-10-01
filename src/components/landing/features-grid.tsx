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
    <div className="max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
          Everything you need to stay organized
        </h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
          Powerful features designed to make task management effortless and intuitive.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card key={index} className="border border-border bg-card hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
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
  )
}