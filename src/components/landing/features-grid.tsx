'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Brain,
  MessageSquare,
  Target,
  Users,
  DollarSign,
  RefreshCw,
  Sparkles,
  Clock,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function FeaturesGrid() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: Brain,
      title: 'AI Task Creation',
      description: 'Describe what you need to do in natural language, and our AI creates structured, actionable tasks with priorities and deadlines.',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: MessageSquare,
      title: 'Natural Language Processing',
      description: 'No complex forms or rigid structures. Just tell our AI what you need to accomplish, like talking to a personal assistant.',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: Target,
      title: 'Smart Prioritization',
      description: 'Our AI analyzes your tasks and automatically assigns priorities based on urgency, importance, and your personal patterns.',
      color: 'green',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: Users,
      title: 'Family Collaboration',
      description: 'Share task lists with family members, assign responsibilities, and keep everyone organized and accountable.',
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      icon: DollarSign,
      title: 'Cost-Effective AI',
      description: 'Advanced AI capabilities at just $5/month with 95% usage of efficient Claude Haiku model for maximum value.',
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: RefreshCw,
      title: 'Real-time Sync',
      description: 'Your tasks sync instantly across all devices. Start on mobile, continue on desktop, with offline support.',
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: Clock,
      title: 'Smart Scheduling',
      description: 'AI suggests optimal times for tasks based on your habits, calendar, and energy levels throughout the day.',
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600',
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your data is encrypted and secure. We use Firebase security rules and never share your personal information.',
      color: 'red',
      gradient: 'from-red-500 to-red-600',
    },
    {
      icon: Sparkles,
      title: 'Intelligent Suggestions',
      description: 'Get proactive suggestions for breaking down complex projects, setting reminders, and optimizing your workflow.',
      color: 'violet',
      gradient: 'from-violet-500 to-violet-600',
    },
  ]

  return (
    <section ref={sectionRef} className="py-16" id="features">
      <div className="grok-container">
        {/* Section Header */}
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-16 transition-all duration-1000",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Powerful Features for
            <span className="text-blue-600 dark:text-blue-400"> Modern Productivity</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Everything you need to transform your task management experience with AI-powered intelligence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className={cn(
                  "group hover:shadow-xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 backdrop-blur-sm hover:-translate-y-2",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{
                  transitionDelay: `${index * 150}ms`,
                  animationDelay: `${index * 150}ms`
                }}
              >
                <CardContent className="p-8 space-y-4">
                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                    feature.gradient
                  )}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                    feature.gradient
                  )} />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className={cn(
          "text-center mt-16 transition-all duration-1000 delay-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-3xl p-8 md:p-12 border border-border/50">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Ready to supercharge your productivity?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who have transformed their task management with AI.
              Start free and experience the future of productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                Start Free Trial
                <Sparkles className="ml-2 h-4 w-4 inline group-hover:rotate-12 transition-transform" />
              </button>
              <button className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-foreground font-medium rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}