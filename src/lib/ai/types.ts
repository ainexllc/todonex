import { AIModel } from './anthropic-client'

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
  | 'recipes' 
  | 'shopping'
  | 'bills'
  | 'notes'
  | 'calendar'
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

export interface RecipeAIRequest {
  type: 'suggest_recipe' | 'modify_recipe' | 'meal_plan' | 'ingredient_substitute'
  input: string
  context?: {
    ingredients?: string[]
    dietaryRestrictions?: string[]
    cookingTime?: number
  }
}

export interface ShoppingAIRequest {
  type: 'categorize_items' | 'suggest_quantities' | 'find_alternatives' | 'optimize_list'
  input: string
  context?: {
    existingList?: any[]
    storeLayout?: string[]
  }
}

export interface BillAIRequest {
  type: 'analyze_spending' | 'suggest_savings' | 'categorize_expense' | 'predict_due_date'
  input: string
  context?: {
    bills?: any[]
    budgetGoals?: any
  }
}

export interface NoteAIRequest {
  type: 'summarize' | 'extract_tags' | 'suggest_title' | 'format_content'
  input: string
  context?: {
    existingTags?: string[]
    noteType?: string
  }
}

export type FeatureAIRequest = 
  | TaskAIRequest 
  | RecipeAIRequest 
  | ShoppingAIRequest 
  | BillAIRequest 
  | NoteAIRequest

export interface AIError {
  code: string
  message: string
  details?: any
  retryable: boolean
}

// System prompts for different features
export const SYSTEM_PROMPTS: Record<FeatureType, string> = {
  tasks: `You are a helpful task management assistant. Help users create, organize, and prioritize their tasks. Be concise and actionable. Format responses as clear, specific tasks with realistic timeframes.`,

  recipes: `You are a knowledgeable cooking assistant. Help users with recipes, meal planning, and cooking tips. Consider dietary restrictions and available ingredients. Keep suggestions practical and easy to follow.`,

  shopping: `You are a smart shopping assistant. Help users organize shopping lists, suggest quantities, and find alternatives. Group items by store sections and consider seasonal availability.`,

  bills: `You are a financial assistant focused on bill management and budgeting. Help users track expenses, identify savings opportunities, and manage due dates. Be practical and money-conscious in your advice.`,

  notes: `You are a note organization assistant. Help users structure, summarize, and categorize their notes. Keep formatting clean and suggest relevant tags for easy retrieval.`,

  calendar: `You are a scheduling assistant. Help users manage their time, resolve conflicts, and plan events efficiently. Consider travel time and work-life balance in your suggestions.`,

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
  recipes: {
    enabled: true,
    model: 'claude-3-haiku-20240307',
    maxDailyRequests: 30,
    cacheEnabled: true,
    cacheDuration: 240, // 4 hours
    rateLimitPerMinute: 5,
  },
  shopping: {
    enabled: true,
    model: 'claude-3-haiku-20240307',
    maxDailyRequests: 40,
    cacheEnabled: true,
    cacheDuration: 30,
    rateLimitPerMinute: 8,
  },
  bills: {
    enabled: true,
    model: 'claude-3-5-sonnet-20241022', // Complex analysis
    maxDailyRequests: 10,
    cacheEnabled: false, // Sensitive financial data
    cacheDuration: 0,
    rateLimitPerMinute: 3,
  },
  notes: {
    enabled: true,
    model: 'claude-3-haiku-20240307',
    maxDailyRequests: 25,
    cacheEnabled: true,
    cacheDuration: 120,
    rateLimitPerMinute: 6,
  },
  calendar: {
    enabled: true,
    model: 'claude-3-haiku-20240307',
    maxDailyRequests: 20,
    cacheEnabled: true,
    cacheDuration: 60,
    rateLimitPerMinute: 5,
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