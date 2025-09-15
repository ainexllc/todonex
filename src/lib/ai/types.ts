import { AIModel } from './anthropic-client'

// Re-export AIModel for cache
export type { AIModel }

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

export interface AIConversation {
  id: string
  messages: AIMessage[]
  context: AIContext
  createdAt: Date
  updatedAt: Date
}

export interface AIContext {
  featureType: FeatureType
  userId: string
  sessionId: string
  metadata?: Record<string, any>
}

export type FeatureType =
  | 'tasks'
  | 'general'

export interface AIUsageMetrics {
  userId: string
  requests: number
  tokensUsed: number
  cost: number
  model: AIModel
  feature: FeatureType
  timestamp: Date
}

export interface AICacheEntry {
  key: string
  response: string
  model: AIModel
  cost: number
  timestamp: Date
  expiresAt: Date
  hitCount: number
}

export interface AIRateLimitInfo {
  requests: number
  windowStart: Date
  remaining: number
  resetTime: Date
}

// Feature-specific request types
export interface TaskAIRequest {
  type: 'create_task' | 'prioritize' | 'breakdown' | 'suggest_due_date'
  input: string
  context?: {
    existingTasks?: any[]
    userPreferences?: any
  }
}


export type FeatureAIRequest =
  | TaskAIRequest

export interface AIError {
  code: string
  message: string
  details?: any
  retryable: boolean
}

// System prompts for different features
export const SYSTEM_PROMPTS: Record<FeatureType, string> = {
  tasks: `You are a helpful task management assistant. Help users create, organize, and prioritize their tasks. Be concise and actionable. Format responses as clear, specific tasks with realistic timeframes.`,

  general: `You are a helpful assistant for a family organization app. Provide brief, actionable responses. Stay focused on productivity and family management topics.`
}

export interface AIFeatureConfig {
  enabled: boolean
  model: AIModel
  maxDailyRequests: number
  cacheEnabled: boolean
  cacheDuration: number // minutes
  rateLimitPerMinute: number
}

export const DEFAULT_FEATURE_CONFIG: Record<FeatureType, AIFeatureConfig> = {
  tasks: {
    enabled: true,
    model: 'claude-3-haiku-20240307',
    maxDailyRequests: 50,
    cacheEnabled: true,
    cacheDuration: 60,
    rateLimitPerMinute: 10,
  },
  general: {
    enabled: true,
    model: 'claude-3-haiku-20240307',
    maxDailyRequests: 15,
    cacheEnabled: true,
    cacheDuration: 30,
    rateLimitPerMinute: 3,
  },
}