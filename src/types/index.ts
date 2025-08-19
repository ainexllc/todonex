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
  billReminders: boolean
  subscriptionAlerts: boolean
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
  | 'upcoming-bills'
  | 'active-shopping-lists'
  | 'this-week-meals'
  | 'today-events'
  | 'recent-notes'
  | 'subscription-overview'
  | 'spending-chart'
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

// Shopping List Types
export interface ShoppingList {
  id: string
  name: string
  type: 'grocery' | 'hardware' | 'pharmacy' | 'custom'
  items: ShoppingItem[]
  store?: StoreProfile
  budget?: number
  sharedWith: string[]
  familyId?: string
  createdBy: string
  isArchived: boolean
  lastUpdated: Date
}

export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  aisle?: string
  price?: number
  checked: boolean
  image?: string
  barcode?: string
  recipeId?: string
  addedBy: string
  notes?: string
}

export interface StoreProfile {
  id: string
  name: string
  address: string
  layout?: { [category: string]: string } // category -> aisle mapping
}

// Recipe Management Types
export interface Recipe {
  id: string
  name: string
  description: string
  ingredients: Ingredient[]
  instructions: Instruction[]
  prepTime: number
  cookTime: number
  servings: number
  nutrition?: NutritionInfo
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  images: string[]
  video?: string
  source?: string
  rating: number
  reviews: Review[]
  familyFavorite: boolean
  familyId?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
  notes?: string
  optional: boolean
}

export interface Instruction {
  id: string
  step: number
  text: string
  image?: string
  timer?: number
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export interface Review {
  id: string
  userId: string
  rating: number
  comment: string
  createdAt: Date
}

// Financial Management Types
export interface Bill {
  id: string
  name: string
  amount: number
  dueDate: Date
  frequency: 'once' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly'
  category: string
  isPaid: boolean
  paymentMethod?: PaymentMethod
  attachments?: string[]
  reminders?: Reminder[]
  autopay?: boolean
  familyId?: string
  createdBy: string
  paidBy?: string
  paidAt?: Date
  notes?: string
  description?: string
  isRecurring?: boolean
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly'
  createdAt: Date
  updatedAt: Date
}

export interface PaymentMethod {
  id: string
  type: 'credit' | 'debit' | 'bank' | 'cash' | 'other'
  name: string
  last4?: string
}

export interface Budget {
  id: string
  name: string
  amount: number
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  categories: CategoryBudget[]
  familyId?: string
  familyMembers: string[]
  alerts: BudgetAlert[]
  startDate: Date
  endDate?: Date
}

export interface CategoryBudget {
  category: string
  budgeted: number
  spent: number
  remaining: number
}

export interface BudgetAlert {
  type: 'warning' | 'exceeded'
  threshold: number
  enabled: boolean
}

// Subscription Tracking Types
export interface Subscription {
  id: string
  service: string
  logo?: string
  cost: number
  billingCycle: 'monthly' | 'quarterly' | 'yearly'
  nextBilling: Date
  category: string
  isActive: boolean
  usage: UsageMetrics
  sharedWith: string[]
  familyId?: string
  cancellationUrl?: string
  trialEnd?: Date
  autoRenewal: boolean
  createdBy: string
}

export interface UsageMetrics {
  lastUsed?: Date
  frequency: number // uses per period
  healthScore: number // 0-100
}

// Calendar Types
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay: boolean
  recurring?: RecurrencePattern
  attendees: string[]
  location?: string
  reminders: Reminder[]
  source: 'local' | 'google' | 'outlook' | 'apple'
  familyId?: string
  category: string
  color?: string
  createdBy: string
}

// Notes Types
export interface Note {
  id: string
  title?: string
  content: string
  type: 'text' | 'checklist' | 'voice' | 'image'
  tags: string[]
  isPinned: boolean
  sharedWith: string[]
  familyId?: string
  attachments: string[]
  lastModified: Date
  createdBy: string
  createdAt: Date
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