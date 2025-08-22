export interface TaskEnhancement {
  description?: string
  priority?: 'low' | 'medium' | 'high'
  estimatedDuration?: string
  tips?: string[]
  subtasks?: string[]
  dependencies?: string[]
  suggestedDueDate?: string
  suggestedTime?: string
  category?: string
  // Extracted fields from natural language
  extractedDueDate?: Date
  extractedTime?: string
  extractedPriority?: 'low' | 'medium' | 'high'
  extractedDuration?: string
  extractedRecurring?: boolean
  extractedLocation?: string
}

export interface TaskAIResponse {
  success: boolean
  data?: TaskEnhancement
  error?: string
  cost?: number
  responseTime?: number
  cached?: boolean
}

// Enhanced task data that includes AI fields
export interface EnhancedTaskData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  categoryId?: string
  // AI Enhancement fields
  aiEnhanced?: boolean
  aiEstimatedDuration?: string
  aiTips?: string[]
  aiSubtasks?: string[]
  aiDependencies?: string[]
  aiCategory?: string
  aiGeneratedAt?: Date
  aiModel?: string
  aiCost?: number
}