/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Get the current user's local date in YYYY-MM-DD format
 * This is used for date inputs and validation to ensure consistency with user's timezone
 */
export function getCurrentUserDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format a date for display in the user's locale
 */
export function formatDisplayDate(date: Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return 'No date'
  
  // Convert Firebase Timestamp to Date if needed
  const dateObj = date instanceof Date ? date : new Date(date)
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  }
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj)
}

/**
 * Check if a date is in the past relative to user's current date
 */
export function isDateInPast(dateString: string): boolean {
  const currentDate = getCurrentUserDate()
  return dateString < currentDate
}

/**
 * Check if a date is overdue (past current date and not completed)
 */
export function isOverdue(dueDate: Date | null | undefined, completed: boolean = false): boolean {
  if (!dueDate || completed) return false
  const dueDateObj = new Date(dueDate)
  if (isNaN(dueDateObj.getTime())) return false
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDateObj.setHours(0, 0, 0, 0)
  
  return dueDateObj < today
}

/**
 * Check if a date is due soon (within 24 hours)
 */
export function isDueSoon(dueDate: Date | null | undefined, completed: boolean = false): boolean {
  if (!dueDate || completed) return false
  const dueDateObj = new Date(dueDate)
  if (isNaN(dueDateObj.getTime())) return false
  
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  dueDateObj.setHours(0, 0, 0, 0)
  
  return dueDateObj <= tomorrow
}

/**
 * Convert various date formats to a standardized Date object
 */
export function normalizeDate(date: any): Date | null {
  if (!date) return null
  
  // Firebase Timestamp
  if (date.toDate && typeof date.toDate === 'function') {
    return date.toDate()
  }
  
  // Already a Date object
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date
  }
  
  // String or number
  const dateObj = new Date(date)
  return isNaN(dateObj.getTime()) ? null : dateObj
}