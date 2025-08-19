'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { FeatureSuggestion } from '@/types'
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Clock, 
  Zap,
  ArrowRight,
  X,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import { isAfter, subDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface IntelligentSuggestionsProps {
  className?: string
}

interface SmartSuggestion extends FeatureSuggestion {
  category: 'productivity' | 'efficiency' | 'organization' | 'automation'
  impact: 'high' | 'medium' | 'low'
  timeToValue: string
  description: string
}

export function IntelligentSuggestions({ className }: IntelligentSuggestionsProps) {
  const { usagePattern, addSuggestion, dismissSuggestion, suggestions, dismissedSuggestions } = useAdaptiveStore()
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([])

  useEffect(() => {
    if (usagePattern) {
      const newSuggestions = generateIntelligentSuggestions(usagePattern as Record<string, unknown>)
      setSmartSuggestions(newSuggestions)
      
      // Add suggestions to store
      newSuggestions.forEach(suggestion => {
        if (!dismissedSuggestions.includes(suggestion.feature)) {
          addSuggestion(suggestion)
        }
      })
    }
  }, [usagePattern, addSuggestion, dismissedSuggestions])

  const generateIntelligentSuggestions = (pattern: Record<string, unknown>): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = []
    const features = Object.entries((pattern as { featureUsage: Record<string, { count: number }> }).featureUsage)
    const activeFeatures = features.filter(([, data]) => data.count > 0)

    // Productivity Suggestions
    if (hasFeature(activeFeatures, 'tasks') && !hasFeature(activeFeatures, 'calendar')) {
      suggestions.push({
        feature: 'calendar',
        reason: 'Sync your tasks with calendar events for better time management',
        confidence: 0.9,
        actionText: 'Connect Calendar',
        priority: 1,
        category: 'productivity',
        impact: 'high',
        timeToValue: '5 minutes',
        description: 'Integrate calendar to see tasks alongside events and never miss deadlines'
      })
    }

    // Organization Suggestions
    if (hasFeature(activeFeatures, 'recipes') && !hasFeature(activeFeatures, 'shopping')) {
      suggestions.push({
        feature: 'shopping',
        reason: 'Automatically generate shopping lists from your recipes',
        confidence: 0.85,
        actionText: 'Try Shopping Lists',
        priority: 2,
        category: 'organization',
        impact: 'high',
        timeToValue: '2 minutes',
        description: 'Convert recipe ingredients into organized shopping lists with one click'
      })
    }

    // Financial Efficiency
    if (hasFeature(activeFeatures, 'bills') && !hasFeature(activeFeatures, 'subscriptions')) {
      suggestions.push({
        feature: 'subscriptions',
        reason: 'Track recurring subscriptions to identify potential savings',
        confidence: 0.8,
        actionText: 'Track Subscriptions',
        priority: 3,
        category: 'efficiency',
        impact: 'medium',
        timeToValue: '10 minutes',
        description: 'Monitor subscription costs and get alerts for renewals to avoid unwanted charges'
      })
    }

    // Note-taking Enhancement
    if (hasFeature(activeFeatures, 'tasks') && !hasFeature(activeFeatures, 'notes')) {
      suggestions.push({
        feature: 'notes',
        reason: 'Capture ideas and details that support your tasks',
        confidence: 0.7,
        actionText: 'Start Taking Notes',
        priority: 4,
        category: 'organization',
        impact: 'medium',
        timeToValue: '1 minute',
        description: 'Keep important information organized with rich text notes and checklists'
      })
    }

    // Usage Pattern Insights
    const tasksUsage = getFeatureUsage(activeFeatures, 'tasks')
    if (tasksUsage && tasksUsage.frequency === 'daily' && getFeatureUsage(activeFeatures, 'dashboard')?.count < 5) {
      suggestions.push({
        feature: 'dashboard',
        reason: 'Customize your dashboard to see task overview at a glance',
        confidence: 0.75,
        actionText: 'Optimize Dashboard',
        priority: 5,
        category: 'efficiency',
        impact: 'medium',
        timeToValue: '3 minutes',
        description: 'Arrange widgets to match your workflow and save time navigating'
      })
    }

    // Feature Discovery for New Users
    if (activeFeatures.length <= 2) {
      const nextFeatureMap: Record<string, SmartSuggestion> = {
        tasks: {
          feature: 'tasks',
          reason: 'Start organizing your daily activities and goals',
          confidence: 0.9,
          actionText: 'Create Your First Task',
          priority: 1,
          category: 'productivity',
          impact: 'high',
          timeToValue: '30 seconds',
          description: 'Simple task management to keep track of what needs to be done'
        },
        bills: {
          feature: 'bills',
          reason: 'Never miss a payment deadline again',
          confidence: 0.8,
          actionText: 'Add Your First Bill',
          priority: 2,
          category: 'organization',
          impact: 'high',
          timeToValue: '2 minutes',
          description: 'Track due dates and amounts for all your recurring bills'
        },
        recipes: {
          feature: 'recipes',
          reason: 'Organize your favorite meals and plan your cooking',
          confidence: 0.7,
          actionText: 'Save Your First Recipe',
          priority: 3,
          category: 'organization',
          impact: 'medium',
          timeToValue: '3 minutes',
          description: 'Keep your recipes organized and accessible anywhere'
        }
      }

      Object.values(nextFeatureMap).forEach(suggestion => {
        if (!hasFeature(activeFeatures, suggestion.feature)) {
          suggestions.push(suggestion)
        }
      })
    }

    // Advanced Workflow Suggestions
    if (activeFeatures.length >= 4) {
      const advancedUsage = getFeatureUsage(activeFeatures, 'tasks')
      if (advancedUsage && advancedUsage.count > 20) {
        suggestions.push({
          feature: 'analytics',
          reason: 'Review your productivity patterns and optimize your workflow',
          confidence: 0.6,
          actionText: 'View Analytics',
          priority: 6,
          category: 'automation',
          impact: 'low',
          timeToValue: '1 minute',
          description: 'Discover insights about your feature usage and productivity trends'
        })
      }
    }

    // Inactivity Suggestions
    const lastWeek = subDays(new Date(), 7)
    activeFeatures.forEach(([feature, data]: any) => {
      if (data.lastUsed && isAfter(lastWeek, data.lastUsed) && data.count > 5) {
        suggestions.push({
          feature: `revisit-${feature}`,
          reason: `You haven't used ${feature} recently - might be worth revisiting`,
          confidence: 0.5,
          actionText: `Return to ${feature}`,
          priority: 10,
          category: 'efficiency',
          impact: 'low',
          timeToValue: '30 seconds',
          description: `You previously found value in ${feature} - consider incorporating it back into your routine`
        })
      }
    })

    return suggestions
      .filter(s => !dismissedSuggestions.includes(s.feature))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 6) // Limit to top 6 suggestions
  }

  const hasFeature = (features: any[], featureName: string): boolean => {
    return features.some(([name]) => name === featureName)
  }

  const getFeatureUsage = (features: any[], featureName: string): any => {
    const feature = features.find(([name]) => name === featureName)
    return feature ? feature[1] : null
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Target className="h-4 w-4" />
      case 'efficiency': return <Zap className="h-4 w-4" />
      case 'organization': return <CheckCircle className="h-4 w-4" />
      case 'automation': return <Sparkles className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const handleAcceptSuggestion = (suggestion: SmartSuggestion) => {
    // Navigate to the suggested feature
    if (suggestion.feature.startsWith('revisit-')) {
      const feature = suggestion.feature.replace('revisit-', '')
      window.location.href = `/${feature}`
    } else if (suggestion.feature === 'analytics') {
      window.location.href = '/analytics'
    } else {
      window.location.href = `/${suggestion.feature}`
    }
  }

  const handleDismissSuggestion = (feature: string) => {
    dismissSuggestion(feature)
  }

  if (smartSuggestions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <span>Smart Suggestions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Use NextTaskPro features to unlock personalized suggestions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <span>Smart Suggestions</span>
          <Badge variant="secondary">{smartSuggestions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {smartSuggestions.map((suggestion) => (
            <div key={suggestion.feature} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getCategoryIcon(suggestion.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{suggestion.actionText}</h3>
                      <Badge variant="outline" className={cn("text-xs", getImpactColor(suggestion.impact))}>
                        {suggestion.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{suggestion.timeToValue}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{Math.round(suggestion.confidence * 100)}% match</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    className="h-8"
                  >
                    Try It
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissSuggestion(suggestion.feature)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}