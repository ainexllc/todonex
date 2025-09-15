'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
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

  // Auto-rotate testimonials
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isVisible])

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Project Manager',
      company: 'Tech Startup',
      image: '/testimonials/sarah.jpg',
      content: 'NextTaskPro transformed how I manage my team. The AI understands context perfectly and creates detailed task breakdowns that would take me hours to plan manually.',
      rating: 5,
      highlight: 'Saves 5+ hours per week'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Freelance Designer',
      company: 'Creative Agency',
      image: '/testimonials/mike.jpg',
      content: 'As a freelancer juggling multiple clients, NextTaskPro keeps me organized without the complexity of enterprise tools. The natural language input is a game-changer.',
      rating: 5,
      highlight: 'Increased productivity by 40%'
    },
    {
      name: 'Jennifer Park',
      role: 'Marketing Director',
      company: 'E-commerce',
      image: '/testimonials/jennifer.jpg',
      content: 'The family collaboration features help my team stay in sync. We can assign tasks naturally and everyone knows what needs to be done without constant meetings.',
      rating: 5,
      highlight: 'Reduced meetings by 60%'
    },
    {
      name: 'David Thompson',
      role: 'Software Engineer',
      company: 'Fortune 500',
      image: '/testimonials/david.jpg',
      content: 'I was skeptical about AI task management, but NextTaskPro proves its worth daily. The smart prioritization helps me focus on what truly matters.',
      rating: 5,
      highlight: 'Better focus and clarity'
    },
  ]

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '1M+', label: 'Tasks Created' },
    { number: '40%', label: 'Time Saved' },
    { number: '4.9/5', label: 'User Rating' },
  ]

  const companies = [
    { name: 'TechCorp', logo: '/logos/techcorp.svg' },
    { name: 'InnovateNow', logo: '/logos/innovatenow.svg' },
    { name: 'DigitalFirst', logo: '/logos/digitalfirst.svg' },
    { name: 'CloudWorks', logo: '/logos/cloudworks.svg' },
    { name: 'StartupHub', logo: '/logos/startuphub.svg' },
  ]

  return (
    <section ref={sectionRef} className="py-20" id="testimonials">
      <div className="grok-container">
        {/* Section Header */}
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-16 transition-all duration-1000",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Loved by
            <span className="text-purple-600 dark:text-purple-400"> Thousands</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            See how NextTaskPro is transforming productivity for individuals and teams worldwide.
          </p>
        </div>

        {/* Stats */}
        <div className={cn(
          "grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 transition-all duration-1000 delay-200",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center space-y-2"
            >
              <div className="text-3xl lg:text-4xl font-bold text-foreground">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Featured Testimonial */}
        <div className={cn(
          "mb-16 transition-all duration-1000 delay-400",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 overflow-hidden">
            <CardContent className="p-12 text-center relative">
              {/* Quote Icon */}
              <div className="absolute top-8 left-8 opacity-10">
                <Quote className="h-16 w-16 text-purple-600" />
              </div>

              {/* Stars */}
              <div className="flex justify-center space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Content */}
              <blockquote className="text-xl lg:text-2xl text-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                "{testimonials[currentTestimonial].content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonials[currentTestimonial].name[0]}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-muted-foreground">
                    {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {testimonials[currentTestimonial].highlight}
                  </div>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center space-x-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-300",
                      currentTestimonial === index
                        ? "bg-purple-600 scale-125"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-purple-400"
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonial Grid */}
        <div className={cn(
          "grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 transition-all duration-1000 delay-600",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
              onClick={() => setCurrentTestimonial(index)}
            >
              <CardContent className="p-6 space-y-4">
                {/* Stars */}
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground leading-relaxed">
                  "{testimonial.content.length > 120
                    ? testimonial.content.substring(0, 120) + '...'
                    : testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trusted By Section */}
        <div className={cn(
          "text-center transition-all duration-1000 delay-800",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <h3 className="text-lg font-medium text-muted-foreground mb-8">
            Trusted by teams at
          </h3>

          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60 hover:opacity-80 transition-opacity">
            {companies.map((company, index) => (
              <div
                key={company.name}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">
                    {company.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-sm">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={cn(
          "text-center mt-16 transition-all duration-1000 delay-1000",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Ready to join thousands of satisfied users?
            </h3>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Start your journey to better productivity today. No credit card required for the free plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-purple-600 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                Start Free Trial
              </button>
              <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-medium rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}