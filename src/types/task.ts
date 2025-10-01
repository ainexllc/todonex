/**
 * Central Task and TaskList Type Definitions
 *
 * These types are used throughout the application for type safety
 * and consistency. Import from this file instead of defining locally.
 */

import type { IconName } from '@/lib/utils/icon-matcher'
import type { ListColorKey } from '@/lib/utils/list-colors'

/**
 * Task Priority Levels
 */
export type TaskPriority = 'low' | 'medium' | 'high'

/**
 * View Mode Options for Task Lists
 */
export type ViewMode = 'masonry' | 'timeline'

/**
 * Task Status Types
 */
export type TaskStatus = 'today' | 'upcoming' | 'done'

/**
 * Individual Task
 */
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  completedAt?: Date | null
  priority: TaskPriority
  dueDate?: Date
  category?: string
  categories?: string[]
  tags?: string[]
  status: TaskStatus
  note?: string
}

/**
 * Task List with Customization Options
 */
export interface TaskList {
  id: string
  title: string
  tasks: Task[]
  category?: string
  createdAt: Date
  order?: number           // Display order (lower numbers appear first)

  // Customization fields
  icon?: IconName          // Lucide icon name (e.g., 'ShoppingCart')
  color?: ListColorKey     // Color key from palette (e.g., 'blue')
  viewMode?: ViewMode      // Preferred view mode for this list
}

/**
 * Chat Message for AI Assistant
 */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  taskLists?: TaskList[]
  suggestions?: string[]
}
