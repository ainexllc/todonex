'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap,
  Eye,
  Lightbulb,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow, format, subDays, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'

interface UsageAnalyticsProps {
  className?: string
}

interface FeatureInsight {
  name: string
  displayName: string
  count: number
  lastUsed: Date
  frequency: string
  totalTime: number
  score: number
  trend: 'up' | 'down' | 'stable'
  insights: string[]
}

const featureDisplayNames: Record<string, string> = {
  dashboard: 'Dashboard',
  tasks: 'Task Management',
  shopping: 'Shopping Lists',
  recipes: 'Recipe Manager',
  bills: 'Bills & Budget',
  calendar: 'Calendar',
  notes: 'Notes',
  subscriptions: 'Subscriptions',
  settings: 'Settings'
}

export function UsageAnalytics({ className }: UsageAnalyticsProps) {
  const { usagePattern, calculateAdaptiveLayout } = useAdaptiveStore()
  const [insights, setInsights] = useState<FeatureInsight[]>([])
  const [totalEngagement, setTotalEngagement] = useState(0)
  const [activeFeatures, setActiveFeatures] = useState(0)

  useEffect(() => {
    if (usagePattern) {
      const featureInsights = Object.entries(usagePattern.featureUsage).map(([name, data]) => {
        const score = calculateFeatureScore(data)
        return {
          name,
          displayName: featureDisplayNames[name] || name,
          count: data.count,
          lastUsed: data.lastUsed,
          frequency: data.frequency,
          totalTime: data.totalTime,
          score,
          trend: calculateTrend(data),
          insights: generateFeatureInsights(name, data)
        }
      }).sort((a, b) => b.score - a.score)

      setInsights(featureInsights)
      setTotalEngagement(featureInsights.reduce((sum, f) => sum + f.totalTime, 0))
      setActiveFeatures(featureInsights.filter(f => f.count > 0).length)
    }
  }, [usagePattern])

  const calculateFeatureScore = (data: { count: number; lastUsed: Date; totalTime: number }): number => {
    const recency = Math.max(0, 7 - (Date.now() - data.lastUsed.getTime()) / (1000 * 60 * 60 * 24))
    const frequency = data.count
    const engagement = data.totalTime / 1000 / 60 // minutes
    
    return (recency * 0.3) + (frequency * 0.5) + (engagement * 0.2)
  }

  const calculateTrend = (data: { count: number; lastUsed: Date }): 'up' | 'down' | 'stable' => {
    const daysSinceLastUse = (Date.now() - data.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceLastUse <= 1) return 'up'
    if (daysSinceLastUse > 7) return 'down'
    return 'stable'
  }

  const generateFeatureInsights = (feature: string, data: { count: number; lastUsed: Date; totalTime: number; frequency: string }): string[] => {
    const insights: string[] = []
    const avgSessionTime = data.totalTime / Math.max(1, data.count) / 1000 / 60 // minutes

    if (data.frequency === 'daily') {
      insights.push('High engagement - you use this daily')
    } else if (data.frequency === 'weekly') {
      insights.push('Regular usage - you check this weekly')
    } else if (data.frequency === 'rare') {
      insights.push('Opportunity to explore this feature more')
    }

    if (avgSessionTime > 5) {
      insights.push('Deep engagement - you spend quality time here')
    } else if (avgSessionTime < 1) {
      insights.push('Quick interactions - efficient usage')
    }

    const daysSinceLastUse = (Date.now() - data.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceLastUse > 7) {
      insights.push('Consider revisiting this feature')
    } else if (daysSinceLastUse < 1) {
      insights.push('Recently active')
    }

    return insights
  }

  const getEngagementLevel = (): { level: string; color: string; description: string } => {
    if (activeFeatures >= 6) {
      return { level: 'Power User', color: 'text-green-600', description: 'You\'re maximizing NextTaskPro' }
    } else if (activeFeatures >= 3) {
      return { level: 'Active User', color: 'text-blue-600', description: 'Great feature adoption' }
    } else if (activeFeatures >= 1) {
      return { level: 'Getting Started', color: 'text-yellow-600', description: 'Explore more features' }
    } else {
      return { level: 'New User', color: 'text-gray-600', description: 'Welcome to NextTaskPro' }
    }
  }

  const engagement = getEngagementLevel()
  const avgDailyTime = totalEngagement / 1000 / 60 / 7 // average minutes per day over week
  const topFeature = insights[0]

  const handleRecalculateLayout = () => {
    calculateAdaptiveLayout()
  }

  if (!usagePattern) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Usage Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Start using NextTaskPro to see your analytics</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Usage Analytics</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleRecalculateLayout}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Layout
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Engagement Level</p>
                <p className={cn("text-lg font-bold", engagement.color)}>{engagement.level}</p>
                <p className="text-xs text-muted-foreground">{engagement.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Active Features</p>
                <p className="text-2xl font-bold">{activeFeatures}</p>
                <p className="text-xs text-muted-foreground">out of {Object.keys(featureDisplayNames).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Daily Usage</p>
                <p className="text-2xl font-bold">{avgDailyTime.toFixed(0)}m</p>
                <p className="text-xs text-muted-foreground">average per day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Top Feature</p>
                <p className="text-lg font-bold">{topFeature?.displayName || 'None'}</p>
                <p className="text-xs text-muted-foreground">
                  {topFeature ? `${topFeature.count} uses` : 'Start exploring'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Feature Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Use NextTaskPro features to generate insights</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.filter(f => f.count > 0).map((feature) => (
                <div key={feature.name} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{feature.displayName}</h3>
                        <Badge variant={feature.trend === 'up' ? 'default' : feature.trend === 'down' ? 'destructive' : 'secondary'}>
                          {feature.frequency}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Score: {feature.score.toFixed(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <span className="font-medium">Uses:</span> {feature.count}
                        </div>
                        <div>
                          <span className="font-medium">Last used:</span> {formatDistanceToNow(feature.lastUsed, { addSuffix: true })}
                        </div>
                        <div>
                          <span className="font-medium">Total time:</span> {(feature.totalTime / 1000 / 60).toFixed(1)}m
                        </div>
                      </div>

                      {feature.insights.length > 0 && (
                        <div className="space-y-1">
                          {feature.insights.map((insight, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <div className="w-1 h-1 rounded-full bg-primary"></div>
                              <span className="text-muted-foreground">{insight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center ml-4">
                      {feature.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {feature.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                      {feature.trend === 'stable' && <div className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}