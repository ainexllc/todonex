'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAIContext } from '@/lib/ai/context'
import { Brain, DollarSign, Zap, BarChart3, RefreshCw } from 'lucide-react'

export function AIUsageDashboard() {
  const { usage, resetUsage, isAvailable } = useAIContext()

  const formatCost = (cost: number) => {
    return cost < 0.01 ? '< $0.01' : `$${cost.toFixed(3)}`
  }

  const formatTokens = (tokens: number) => {
    if (tokens > 1000) return `${(tokens / 1000).toFixed(1)}K`
    return tokens.toString()
  }

  const dailyLimit = 100
  const usagePercentage = (usage.dailyRequests / dailyLimit) * 100

  const topFeatures = Object.entries(usage.featureUsage)
    .sort(([,a], [,b]) => b.requests - a.requests)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">AI Usage Dashboard</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isAvailable ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-muted-foreground">
            {isAvailable ? 'AI Available' : 'AI Unavailable'}
          </span>
        </div>
      </div>

      {/* Today's Usage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Requests</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.dailyRequests}</div>
            <div className="text-xs text-muted-foreground">
              {dailyLimit - usage.dailyRequests} remaining
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  usagePercentage > 80 ? 'bg-red-500' : 
                  usagePercentage > 60 ? 'bg-orange-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCost(usage.dailyCost)}</div>
            <div className="text-xs text-muted-foreground">
              Avg: {formatCost(usage.dailyCost / Math.max(usage.dailyRequests, 1))} per request
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.totalRequests}</div>
            <div className="text-xs text-muted-foreground">
              {formatTokens(usage.totalTokens)} tokens used
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCost(usage.totalCost)}</div>
            <div className="text-xs text-muted-foreground">
              Since {usage.lastReset.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feature Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topFeatures.map(([feature, stats], index) => (
            <div key={feature} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  index === 0 ? 'bg-primary' :
                  index === 1 ? 'bg-orange-500' : 'bg-green-500'
                }`} />
                <span className="font-medium capitalize">{feature}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{stats.requests} requests</div>
                <div className="text-xs text-muted-foreground">
                  {formatCost(stats.cost)} • {formatTokens(stats.tokens)} tokens
                </div>
              </div>
            </div>
          ))}
          
          {topFeatures.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No AI features used yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={resetUsage}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Stats
        </Button>
        
        {usagePercentage > 90 && (
          <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              ⚠️ Daily limit almost reached. Usage will reset tomorrow.
            </p>
          </div>
        )}
      </div>

      {/* Cost Estimation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {Math.round(usage.dailyRequests * 30)}
              </div>
              <div className="text-sm text-muted-foreground">Est. Monthly Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCost(usage.dailyCost * 30)}
              </div>
              <div className="text-sm text-muted-foreground">Est. Monthly Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatTokens(Math.round(usage.totalTokens / Math.max(usage.totalRequests, 1)) * usage.dailyRequests * 30)}
              </div>
              <div className="text-sm text-muted-foreground">Est. Monthly Tokens</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Cost Optimization:</strong> Current usage puts you well under $5/month. 
              Keep using primarily Haiku model for best value.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}