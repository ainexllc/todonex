// User and Authentication Types
export interface User {
  id: string
  email: string
  displayName: string | null
  photoURL: string | null
  familyId?: string
  role: 'user' | 'admin' | 'child'
  preferences: UserPreferences
  createdAt: Date
  lastLoginAt: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  colorMode: 'default' | 'high-contrast' | 'colorblind'
  layout: 'comfortable' | 'compact' | 'cozy'
  language: string
  timezone: string
  notifications: NotificationSettings
  dataSync: 'wifi-only' | 'always' | 'manual'
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  taskReminders: boolean
}

// Adaptive Dashboard Types
export interface UsagePattern {
  userId: string
  featureUsage: {
    [feature: string]: {
      count: number
      lastUsed: Date
      frequency: 'daily' | 'weekly' | 'monthly' | 'rare'
      totalTime: number // in milliseconds
    }
  }
  dashboardConfig: DashboardConfig
  lastCalculated: Date
}

export interface DashboardConfig {
  primaryWidgets: WidgetConfig[]
  secondaryWidgets: WidgetConfig[]
  hiddenFeatures: string[]
  layout: 'onboarding' | 'single' | 'balanced' | 'power'
}

export interface WidgetConfig {
  type: WidgetType
  size: 'small' | 'medium' | 'large' | 'full'
  position: number
  isVisible: boolean
  settings?: Record<string, any>
}

export type WidgetType = 
  | 'welcome'
  | 'getting-started'
  | 'feature-cards'
  | 'quick-actions'
  | 'today-tasks'
  | 'task-stats'

// Family and Household Types
export interface Family {
  id: string
  name: string
  members: string[]
  admins: string[]
  settings: FamilySettings
  createdAt: Date
  inviteCode?: string
}

export interface FamilySettings {
  allowChildAccess: boolean
  requireApproval: boolean
  sharedBudget: boolean
  timezone: string
}

// Task Management Types
export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed'
  recurring?: RecurrencePattern
  assignedTo: string[]
  familyId?: string
  category: string
  tags: string[]
  attachments: string[]
  location?: GeoLocation
  reminders: Reminder[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  interval: number
  daysOfWeek?: number[]
  endDate?: Date
  endAfter?: number
}


// Common Types
export interface Reminder {
  id: string
  time: Date
  type: 'email' | 'push' | 'sms'
  message?: string
  sent: boolean
}

export interface GeoLocation {
  latitude: number
  longitude: number
  address?: string
}

// Adaptive System Types
export interface FeatureSuggestion {
  feature: string
  reason: string
  confidence: number
  actionText: string
  priority: number
}

export interface DashboardLayout {
  hero?: string
  widgets: WidgetConfig[]
  suggestions?: FeatureSuggestion[]
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Form and Input Types
export interface FormField {
  name: string
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea'
  label: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// Navigation Types
export interface NavigationItem {
  name: string
  href: string
  icon: string
  badge?: number
  active?: boolean
  children?: NavigationItem[]
}

export interface AdaptiveNavigation {
  primary: NavigationItem[]
  secondary: NavigationItem[]
  suggested: NavigationItem[]
  hidden: NavigationItem[]
}