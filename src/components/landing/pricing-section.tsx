'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PricingSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
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

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for trying out NextTaskPro',
      price: { monthly: 0, yearly: 0 },
      features: [
        '10 AI task creations per month',
        'Basic task management',
        'Single user account',
        'Mobile & web access',
        'Standard support',
      ],
      limitations: [
        'Limited AI usage',
        'No team collaboration',
        'Basic templates only',
      ],
      cta: 'Get Started Free',
      popular: false,
      color: 'gray',
    },
    {
      name: 'Pro',
      description: 'Our most popular plan for individuals',
      price: { monthly: 5, yearly: 48 },
      features: [
        'Unlimited AI task creations',
        'Advanced natural language processing',
        'Smart priority detection',
        'Family collaboration (up to 5 members)',
        'Custom templates and workflows',
        'Calendar integration',
        'Advanced analytics',
        'Priority support',
        'Offline mode',
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      popular: true,
      color: 'blue',
    },
    {
      name: 'Team',
      description: 'For larger families and small teams',
      price: { monthly: 12, yearly: 120 },
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Advanced team analytics',
        'Custom integrations',
        'Admin controls',
        'SSO authentication',
        'Advanced security features',
        'Dedicated account manager',
        'White-label options',
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple',
    },
  ]

  const costBreakdown = {
    aiRequests: 1000,
    haikuUsage: 0.95,
    sonnetUsage: 0.05,
    haikuCost: 0.25,
    sonnetCost: 3.0,
    totalCost: (1000 * 0.95 * 0.25 / 1000000) + (1000 * 0.05 * 3.0 / 1000000),
  }

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/10" id="pricing">
      <div className="grok-container">
        {/* Section Header */}
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-16 transition-all duration-1000",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Simple, Transparent
            <span className="text-blue-600 dark:text-blue-400"> Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            Choose the perfect plan for your productivity needs. No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-muted p-1 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                billingCycle === 'monthly'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative",
                billingCycle === 'yearly'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                20% off
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={cn(
                "relative transition-all duration-700 hover:shadow-2xl",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                plan.popular
                  ? "border-2 border-blue-500 shadow-xl scale-105 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20"
                  : "border border-border hover:border-gray-300 dark:hover:border-gray-600 bg-background"
              )}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <p className="text-muted-foreground">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="pt-4">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-foreground">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Save ${(plan.price.monthly * 12) - plan.price.yearly}/year
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start space-x-3"
                    >
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={cn(
                    "w-full font-medium transition-all duration-300",
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                      : "bg-background hover:bg-muted border border-border text-foreground"
                  )}
                  size="lg"
                >
                  {plan.cta}
                  {plan.popular && <Sparkles className="ml-2 h-4 w-4" />}
                </Button>

                {/* Additional Info */}
                {plan.name === 'Free' && (
                  <p className="text-xs text-muted-foreground text-center">
                    No credit card required
                  </p>
                )}
                {plan.name === 'Pro' && (
                  <p className="text-xs text-muted-foreground text-center">
                    14-day free trial
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cost Transparency Section */}
        <div className={cn(
          "bg-white dark:bg-gray-900 rounded-3xl p-8 border border-border shadow-lg transition-all duration-1000 delay-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Transparent AI Cost Breakdown
            </h3>
            <p className="text-muted-foreground">
              See exactly how we keep our AI costs low while maintaining quality
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Cost Chart */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Claude Haiku (95%)</span>
                </div>
                <span className="text-sm text-muted-foreground">$0.25/$1.25 per M tokens</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Claude Sonnet (5%)</span>
                </div>
                <span className="text-sm text-muted-foreground">$3/$15 per M tokens</span>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-l-4 border-green-500">
                <p className="font-semibold text-green-700 dark:text-green-300">
                  Average cost per request: &lt;$0.001
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Monthly budget: ~$5 for unlimited usage
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Why this matters:</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    <strong>95% efficiency:</strong> Using Claude Haiku for most tasks keeps costs ultra-low
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    <strong>Smart routing:</strong> Complex requests automatically use Claude Sonnet when needed
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    <strong>Aggressive caching:</strong> 70-80% cache hit rate reduces API calls
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    <strong>Predictable pricing:</strong> No usage surprises or hidden fees
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={cn(
          "mt-16 text-center transition-all duration-1000 delay-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Can I change plans anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Is there a free trial?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Pro plan includes a 14-day free trial. Free plan is always available with no credit card required.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">What about data security?</h4>
              <p className="text-sm text-muted-foreground">
                Your data is encrypted in transit and at rest. We use Firebase security rules and never share your information.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">How does AI cost monitoring work?</h4>
              <p className="text-sm text-muted-foreground">
                We track AI usage in real-time and provide detailed analytics. You'll never be surprised by costs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}