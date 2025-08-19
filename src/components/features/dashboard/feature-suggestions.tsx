'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { FeatureSuggestion } from '@/types'
import { 
  Lightbulb, 
  X, 
  ArrowRight,
  ShoppingCart,
  BarChart3,
  Calendar,
  StickyNote,
  ChefHat,
  CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureSuggestionsProps {
  suggestions: FeatureSuggestion[]
}

const featureIcons: Record<string, any> = {
  shopping: ShoppingCart,
  subscriptions: BarChart3,
  calendar: Calendar,
  notes: StickyNote,
  recipes: ChefHat,
  bills: CreditCard
}

const featureColors: Record<string, string> = {
  shopping: 'from-purple-500/20 to-violet-500/20',
  subscriptions: 'from-pink-500/20 to-rose-500/20',
  calendar: 'from-blue-500/20 to-indigo-500/20',
  notes: 'from-yellow-500/20 to-amber-500/20',
  recipes: 'from-orange-500/20 to-red-500/20',
  bills: 'from-green-500/20 to-emerald-500/20'
}

export function FeatureSuggestions({ suggestions }: FeatureSuggestionsProps) {
  const { dismissSuggestion, trackFeatureUsage } = useAdaptiveStore()

  if (suggestions.length === 0) return null

  const handleSuggestionClick = (suggestion: FeatureSuggestion) => {
    trackFeatureUsage(suggestion.feature, 'suggestion-accepted')
    // Here we would navigate to the feature or show onboarding
    console.log(`Accepted suggestion: ${suggestion.feature}`)
  }

  const handleDismiss = (feature: string, event: React.MouseEvent) => {
    event.stopPropagation()
    dismissSuggestion(feature)
    trackFeatureUsage('suggestions', 'dismissed')
  }

  // Show top 2 suggestions in a horizontal layout
  const topSuggestions = suggestions.slice(0, 2)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold">Suggested for You</h3>
        <span className="text-sm text-muted-foreground">
          Based on your usage patterns
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {topSuggestions.map((suggestion) => {
          const Icon = featureIcons[suggestion.feature] || ArrowRight
          const gradient = featureColors[suggestion.feature] || 'from-gray-500/20 to-gray-600/20'

          return (
            <Card 
              key={suggestion.feature}
              glass 
              className={cn(
                "relative overflow-hidden cursor-pointer group",
                "hover:scale-[1.02] adaptive-transition hover:shadow-lg",
                "bg-gradient-to-br", gradient
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              
              <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg p-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{suggestion.actionText}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            suggestion.confidence > 0.8 ? "bg-green-500" :
                            suggestion.confidence > 0.6 ? "bg-yellow-500" : "bg-orange-500"
                          )} />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(suggestion.confidence * 100)}% match
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/10 dark:hover:bg-black/20 opacity-60 hover:opacity-100"
                    onClick={(e) => handleDismiss(suggestion.feature, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="relative pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  {suggestion.reason}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <span>Priority:</span>
                    <span className="font-medium">#{suggestion.priority}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm font-medium text-primary group-hover:translate-x-1 adaptive-transition">
                    <span>Try it</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Show remaining suggestions in a compact list if there are more */}
      {suggestions.length > 2 && (
        <Card glass className="bg-gradient-to-r from-slate-500/5 to-gray-500/5">
          <CardContent className="p-4">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium flex items-center justify-between hover:text-primary">
                <span>More suggestions ({suggestions.length - 2})</span>
                <ArrowRight className="h-4 w-4 group-open:rotate-90 adaptive-transition" />
              </summary>
              
              <div className="mt-3 space-y-2">
                {suggestions.slice(2).map((suggestion) => {
                  const Icon = featureIcons[suggestion.feature] || ArrowRight
                  
                  return (
                    <div 
                      key={suggestion.feature}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 dark:hover:bg-black/5 cursor-pointer group/item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{suggestion.actionText}</p>
                          <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
                          onClick={(e) => handleDismiss(suggestion.feature, e)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  )
}