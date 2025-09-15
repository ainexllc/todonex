'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthForm } from '@/components/features/auth/auth-form'
import { Card } from '@/components/ui/card'
import { Sparkles, Brain, Users, Zap, CheckCircle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const [currentSlide, setCurrentSlide] = useState(0)
  const initialMode = searchParams?.get('mode') as 'signin' | 'signup' || 'signin'

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Task Creation',
      description: 'Describe your tasks in natural language and watch AI create perfectly organized, actionable lists.',
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      icon: Zap,
      title: 'Smart Prioritization',
      description: 'Our AI automatically detects and assigns priorities based on urgency and importance.',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: Users,
      title: 'Family Collaboration',
      description: 'Share tasks with family members and keep everyone organized and accountable.',
      gradient: 'from-green-500 to-blue-600',
    },
  ]

  const testimonial = {
    text: "NextTaskPro transformed how I manage my daily tasks. The AI understands exactly what I need!",
    author: "Sarah Chen",
    role: "Project Manager",
    rating: 5,
  }

  // Auto-rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="dark min-h-screen bg-gray-950 flex">
      {/* Left Side - Features Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="max-w-md">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-12">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">NextTaskPro</span>
            </div>

            {/* Feature Carousel */}
            <div className="space-y-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                const isActive = currentSlide === index

                return (
                  <div
                    key={index}
                    className={cn(
                      "transition-all duration-700",
                      isActive ? "opacity-100 translate-x-0" : "opacity-40 translate-x-4"
                    )}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                        isActive
                          ? "bg-white/20 backdrop-blur-sm scale-110"
                          : "bg-white/10"
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-white/80 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Indicators */}
            <div className="flex space-x-2 mt-12">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    currentSlide === index ? "bg-white w-8" : "bg-white/40"
                  )}
                />
              ))}
            </div>

            {/* Testimonial */}
            <Card className="mt-12 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <div className="p-6">
                <div className="flex space-x-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-sm mb-4 italic">
                  "{testimonial.text}"
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{testimonial.author}</div>
                    <div className="text-white/60 text-xs">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 bg-gray-900">
        <div className="w-full max-w-md">
          <AuthForm mode={initialMode} />
        </div>
      </div>
    </div>
  )
}