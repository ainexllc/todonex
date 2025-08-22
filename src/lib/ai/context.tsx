'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { FeatureType } from './types'

interface AIContextType {
  isEnabled: boolean
  isAvailable: boolean
  setEnabled: (enabled: boolean) => void
  usage: AIUsageStats
  trackUsage: (feature: FeatureType, cost: number, tokensUsed: number) => void
  resetUsage: () => void
}

interface AIUsageStats {
  totalRequests: number
  totalCost: number
  totalTokens: number
  dailyRequests: number
  dailyCost: number
  featureUsage: Record<FeatureType, {
    requests: number
    cost: number
    tokens: number
  }>
  lastReset: Date
}

const defaultUsage: AIUsageStats = {
  totalRequests: 0,
  totalCost: 0,
  totalTokens: 0,
  dailyRequests: 0,
  dailyCost: 0,
  featureUsage: {
    tasks: { requests: 0, cost: 0, tokens: 0 },
    recipes: { requests: 0, cost: 0, tokens: 0 },
    shopping: { requests: 0, cost: 0, tokens: 0 },
    bills: { requests: 0, cost: 0, tokens: 0 },
    notes: { requests: 0, cost: 0, tokens: 0 },
    calendar: { requests: 0, cost: 0, tokens: 0 },
    general: { requests: 0, cost: 0, tokens: 0 },
  },
  lastReset: new Date(),
}

const AIContext = createContext<AIContextType | null>(null)

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true)
  const [isAvailable, setIsAvailable] = useState(false)
  const [usage, setUsage] = useState<AIUsageStats>(defaultUsage)

  // Load settings from localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem('ai-enabled')
    if (savedEnabled !== null) {
      setIsEnabled(JSON.parse(savedEnabled))
    }

    const savedUsage = localStorage.getItem('ai-usage')
    if (savedUsage) {
      try {
        const parsed = JSON.parse(savedUsage)
        
        // Check if we need to reset daily stats (new day)
        const lastReset = new Date(parsed.lastReset)
        const now = new Date()
        const isNewDay = now.toDateString() !== lastReset.toDateString()
        
        if (isNewDay) {
          setUsage({
            ...parsed,
            dailyRequests: 0,
            dailyCost: 0,
            lastReset: now,
          })
        } else {
          setUsage(parsed)
        }
      } catch {
        // Invalid saved data, use defaults
        setUsage(defaultUsage)
      }
    }
  }, [])

  // Save settings to localStorage
  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled)
    localStorage.setItem('ai-enabled', JSON.stringify(enabled))
  }, [])

  // Check AI availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const res = await fetch('/api/ai/chat')
        const data = await res.json()
        setIsAvailable(data.status === 'healthy')
      } catch {
        setIsAvailable(false)
      }
    }

    checkAvailability()
    
    // Check every 5 minutes
    const interval = setInterval(checkAvailability, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Track usage
  const trackUsage = useCallback((feature: FeatureType, cost: number, tokensUsed: number) => {
    setUsage(prev => {
      const updated = {
        ...prev,
        totalRequests: prev.totalRequests + 1,
        totalCost: prev.totalCost + cost,
        totalTokens: prev.totalTokens + tokensUsed,
        dailyRequests: prev.dailyRequests + 1,
        dailyCost: prev.dailyCost + cost,
        featureUsage: {
          ...prev.featureUsage,
          [feature]: {
            requests: prev.featureUsage[feature].requests + 1,
            cost: prev.featureUsage[feature].cost + cost,
            tokens: prev.featureUsage[feature].tokens + tokensUsed,
          },
        },
      }

      // Save to localStorage
      localStorage.setItem('ai-usage', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Reset usage stats
  const resetUsage = useCallback(() => {
    const resetStats = {
      ...defaultUsage,
      lastReset: new Date(),
    }
    setUsage(resetStats)
    localStorage.setItem('ai-usage', JSON.stringify(resetStats))
  }, [])

  const value: AIContextType = {
    isEnabled,
    isAvailable,
    setEnabled,
    usage,
    trackUsage,
    resetUsage,
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}

export function useAIContext(): AIContextType {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAIContext must be used within an AIProvider')
  }
  return context
}

// Hook to check if AI is available for a specific feature
export function useAIFeature(feature: FeatureType) {
  const { isEnabled, isAvailable, usage, trackUsage } = useAIContext()

  const canUseAI = isEnabled && isAvailable

  // Check daily limits (basic rate limiting)
  const dailyLimit = 100 // Adjust based on pricing tier
  const hasReachedLimit = usage.dailyRequests >= dailyLimit

  const makeRequest = useCallback(async (
    endpoint: string,
    data: any
  ) => {
    if (!canUseAI) {
      throw new Error('AI is not available')
    }

    if (hasReachedLimit) {
      throw new Error('Daily AI usage limit reached')
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'AI request failed')
    }

    const result = await response.json()
    
    // Track usage if cost information is available
    if (result.cost && result.tokensUsed) {
      const totalTokens = result.tokensUsed.input + result.tokensUsed.output
      trackUsage(feature, result.cost, totalTokens)
    }

    return result
  }, [canUseAI, hasReachedLimit, feature, trackUsage])

  return {
    canUseAI,
    hasReachedLimit,
    remainingRequests: Math.max(0, dailyLimit - usage.dailyRequests),
    featureUsage: usage.featureUsage[feature],
    makeRequest,
  }
}

// Component to show AI availability status
export function AIStatusIndicator() {
  const { isEnabled, isAvailable, usage } = useAIContext()

  if (!isEnabled) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <div className="w-2 h-2 rounded-full bg-gray-400" />
        AI Disabled
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${
        isAvailable ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className="text-muted-foreground">
        AI {isAvailable ? 'Ready' : 'Unavailable'} • {usage.dailyRequests}/100 today
      </span>
    </div>
  )
}