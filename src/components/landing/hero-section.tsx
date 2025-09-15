'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Sparkles, Brain, Zap, Users, CheckCircle, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HeroSection() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [animatedText, setAnimatedText] = useState('')

  const fullText = "AI-Powered Task Management That Adapts to You"

  useEffect(() => {
    setIsLoaded(true)

    // Animated typing effect
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setAnimatedText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [])

  const handleGetStarted = () => {
    router.push('/auth?mode=signup')
  }

  const handleWatchDemo = () => {
    // Scroll to demo section or open modal
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  const stats = [
    { icon: Users, label: 'Active Users', value: '10K+' },
    { icon: CheckCircle, label: 'Tasks Completed', value: '1M+' },
    { icon: Zap, label: 'Time Saved', value: '40%' },
    { icon: Brain, label: 'AI Accuracy', value: '95%' },
  ]

  const features = [
    'Natural Language Processing',
    'Smart Priority Detection',
    'Family Collaboration',
    'Cost-Effective AI ($5/month)',
  ]

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Animated Background Elements - Enhanced Blue Theme */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500/25 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-600/15 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-3000" />
      </div>

      <div className="grok-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className={cn(
            "space-y-8 transition-all duration-1000",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-3 w-3" />
              <span>Now with AI-powered task creation</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                <span className="block">{animatedText}</span>
                <span className="block text-blue-600 dark:text-blue-400">
                  {animatedText.length >= fullText.length && (
                    <span className="animate-pulse">|</span>
                  )}
                </span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                Transform your productivity with natural language task creation.
                Just describe what you need to do, and our AI will create organized,
                actionable tasks for you.
              </p>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div
                  key={feature}
                  className={cn(
                    "flex items-center space-x-2 transition-all duration-500",
                    isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  )}
                  style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                >
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-foreground font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleWatchDemo}
                className="group"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-border/50">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className={cn(
                      "text-center space-y-2 transition-all duration-700",
                      isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                    style={{ transitionDelay: `${(index + 1) * 300}ms` }}
                  >
                    <Icon className="h-6 w-6 text-blue-600 mx-auto" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column - Product Preview */}
          <div className={cn(
            "relative transition-all duration-1000 delay-500",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {/* Main Product Card */}
            <Card className="p-8 shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 backdrop-blur-sm">
              <div className="space-y-6">
                {/* Chat Interface Preview */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>AI Assistant Active</span>
                  </div>

                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-xs">
                      <p className="text-sm">I need to plan my weekend project and shopping</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-md max-w-xs">
                      <p className="text-sm text-foreground">I'll help you organize that! I've created:</p>
                    </div>
                  </div>

                  {/* Generated Tasks */}
                  <div className="space-y-2 ml-4">
                    {[
                      { text: 'Plan weekend project scope', priority: 'high' },
                      { text: 'Create shopping list', priority: 'medium' },
                      { text: 'Schedule home depot visit', priority: 'low' },
                    ].map((task, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg border transition-all duration-500",
                          "hover:shadow-md cursor-pointer",
                          isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                        )}
                        style={{ transitionDelay: `${(index + 1) * 800}ms` }}
                      >
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          task.priority === 'high' && "bg-red-400",
                          task.priority === 'medium' && "bg-yellow-400",
                          task.priority === 'low' && "bg-green-400"
                        )} />
                        <span className="text-sm text-foreground">{task.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="h-8 w-8 text-white" />
            </div>

            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <Brain className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}