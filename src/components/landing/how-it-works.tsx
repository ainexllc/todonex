'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Brain, CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Auto-cycle through steps
          const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 3)
          }, 3000)
          return () => clearInterval(interval)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const steps = [
    {
      icon: MessageSquare,
      title: 'Describe Your Needs',
      description: 'Simply tell our AI what you need to accomplish using natural language. No complex forms or rigid structures.',
      example: '"I need to plan my weekend home renovation project and prepare for next week\'s presentation"',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Brain,
      title: 'AI Processes & Organizes',
      description: 'Our intelligent system analyzes your request, identifies key tasks, sets priorities, and suggests optimal timing.',
      example: 'AI breaks down complex requests into actionable tasks with smart prioritization and scheduling.',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: CheckCircle,
      title: 'Get Organized Tasks',
      description: 'Receive a perfectly structured task list with priorities, deadlines, and actionable steps ready to execute.',
      example: 'Your tasks are organized, prioritized, and ready for action across all your devices.',
      color: 'green',
      gradient: 'from-green-500 to-green-600',
    },
  ]

  const demoMessages = [
    {
      type: 'user',
      text: 'I need to plan my weekend project and shopping',
      time: '2:14 PM',
    },
    {
      type: 'ai',
      text: 'I\'ll help you organize that! I\'ve created a structured plan:',
      time: '2:14 PM',
    },
  ]

  const demoTasks = [
    { text: 'Research project materials and tools needed', priority: 'high', completed: false },
    { text: 'Create detailed shopping list with quantities', priority: 'high', completed: false },
    { text: 'Check home depot store hours and location', priority: 'medium', completed: false },
    { text: 'Plan project timeline for weekend', priority: 'medium', completed: false },
    { text: 'Prepare workspace and safety equipment', priority: 'low', completed: false },
  ]

  return (
    <section ref={sectionRef} className="py-20" id="how-it-works">
      <div className="grok-container">
        {/* Section Header */}
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-20 transition-all duration-1000",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            How It
            <span className="text-purple-600 dark:text-purple-400"> Works</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Three simple steps to transform your productivity with AI-powered task management.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = activeStep === index

              return (
                <div
                  key={step.title}
                  className={cn(
                    "relative transition-all duration-700 cursor-pointer",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
                    isActive ? "scale-105" : "scale-100"
                  )}
                  style={{ transitionDelay: `${index * 200}ms` }}
                  onClick={() => setActiveStep(index)}
                >
                  <Card className={cn(
                    "group border-2 transition-all duration-500 hover:shadow-xl",
                    isActive
                      ? `border-${step.color}-500 shadow-lg bg-gradient-to-br from-white to-${step.color}-50/30 dark:from-gray-900 dark:to-${step.color}-950/30`
                      : "border-border hover:border-gray-300 dark:hover:border-gray-600"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Step Number & Icon */}
                        <div className="flex-shrink-0">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                            isActive
                              ? `bg-gradient-to-br ${step.gradient} shadow-lg scale-110`
                              : "bg-gray-100 dark:bg-gray-800"
                          )}>
                            <Icon className={cn(
                              "h-6 w-6 transition-colors",
                              isActive ? "text-white" : "text-muted-foreground"
                            )} />
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-2 ml-3 transition-all duration-300",
                            isActive
                              ? `bg-${step.color}-600 text-white shadow-md`
                              : "bg-gray-200 dark:bg-gray-700 text-muted-foreground"
                          )}>
                            {index + 1}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-3">
                          <h3 className={cn(
                            "text-xl font-semibold transition-colors",
                            isActive ? `text-${step.color}-600 dark:text-${step.color}-400` : "text-foreground"
                          )}>
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                          <div className={cn(
                            "p-3 rounded-lg border-l-4 transition-all duration-300",
                            isActive
                              ? `border-l-${step.color}-500 bg-${step.color}-50/50 dark:bg-${step.color}-950/20`
                              : "border-l-gray-300 bg-gray-50 dark:bg-gray-800/50"
                          )}>
                            <p className="text-sm italic text-muted-foreground">
                              {step.example}
                            </p>
                          </div>
                        </div>

                        {/* Arrow */}
                        {index < steps.length - 1 && (
                          <div className="absolute -bottom-4 left-8 flex justify-center">
                            <ArrowRight className={cn(
                              "h-5 w-5 rotate-90 transition-colors",
                              isActive ? `text-${step.color}-500` : "text-muted-foreground"
                            )} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>

          {/* Right Column - Interactive Demo */}
          <div className={cn(
            "lg:sticky lg:top-8 transition-all duration-1000 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full" />
                    <div className="w-3 h-3 bg-white/30 rounded-full" />
                    <div className="w-3 h-3 bg-white rounded-full" />
                    <span className="ml-4 font-medium">NextTaskPro AI</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-6 space-y-4 min-h-[200px]">
                  {activeStep >= 0 && (
                    <div className="flex justify-end animate-fade-in">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-xs">
                        <p className="text-sm">{demoMessages[0].text}</p>
                        <p className="text-xs opacity-75 mt-1">{demoMessages[0].time}</p>
                      </div>
                    </div>
                  )}

                  {activeStep >= 1 && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-md max-w-xs">
                        <p className="text-sm text-foreground">{demoMessages[1].text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{demoMessages[1].time}</p>
                      </div>
                    </div>
                  )}

                  {/* Generated Tasks */}
                  {activeStep >= 2 && (
                    <div className="space-y-2 animate-fade-in">
                      <h4 className="text-sm font-medium text-muted-foreground px-2">
                        Generated Tasks:
                      </h4>
                      {demoTasks.map((task, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg border transition-all duration-500 hover:shadow-md cursor-pointer animate-slide-up",
                            "bg-card border-border"
                          )}
                          style={{ animationDelay: `${index * 200}ms` }}
                        >
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            task.priority === 'high' && "bg-red-400",
                            task.priority === 'medium' && "bg-yellow-400",
                            task.priority === 'low' && "bg-green-400"
                          )} />
                          <span className="text-sm text-foreground flex-1">{task.text}</span>
                          <div className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            task.priority === 'high' && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                            task.priority === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                            task.priority === 'low' && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          )}>
                            {task.priority}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </section>
  )
}