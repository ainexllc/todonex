/**
 * Natural Language Parser for Task Creation
 * Extracts structured data from free-form text input
 */

export interface ParsedTaskData {
  extractedDueDate?: Date
  extractedTime?: string
  extractedPriority?: 'low' | 'medium' | 'high'
  extractedDuration?: string
  extractedRecurring?: boolean
  extractedLocation?: string
  cleanedTitle?: string
}

/**
 * Parse natural language input to extract task metadata
 */
export function parseNaturalLanguage(input: string): ParsedTaskData {
  const result: ParsedTaskData = {}
  let cleanedText = input.trim()

  // Extract dates
  const dateResult = extractDate(cleanedText)
  if (dateResult.date) {
    result.extractedDueDate = dateResult.date
    cleanedText = dateResult.cleanedText
  }

  // Extract times
  const timeResult = extractTime(cleanedText)
  if (timeResult.time) {
    result.extractedTime = timeResult.time
    cleanedText = timeResult.cleanedText
  }

  // Extract priority
  const priorityResult = extractPriority(cleanedText)
  if (priorityResult.priority) {
    result.extractedPriority = priorityResult.priority
    cleanedText = priorityResult.cleanedText
  }

  // Extract duration
  const durationResult = extractDuration(cleanedText)
  if (durationResult.duration) {
    result.extractedDuration = durationResult.duration
    cleanedText = durationResult.cleanedText
  }

  // Extract recurring patterns
  const recurringResult = extractRecurring(cleanedText)
  if (recurringResult.isRecurring) {
    result.extractedRecurring = true
    cleanedText = recurringResult.cleanedText
  }

  // Extract location
  const locationResult = extractLocation(cleanedText)
  if (locationResult.location) {
    result.extractedLocation = locationResult.location
    cleanedText = locationResult.cleanedText
  }

  result.cleanedTitle = cleanedText.trim()
  return result
}

/**
 * Extract date information from text
 */
function extractDate(text: string): { date?: Date; cleanedText: string } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Date patterns
  const patterns = [
    // Relative dates
    { pattern: /\b(today|tod)\b/gi, offset: 0 },
    { pattern: /\b(tomorrow|tmrw|tom)\b/gi, offset: 1 },
    { pattern: /\b(day after tomorrow|overmorrow)\b/gi, offset: 2 },
    { pattern: /\b(yesterday|yest)\b/gi, offset: -1 },
    
    // This/next week patterns
    { pattern: /\b(this|next)\s+(monday|mon)\b/gi, weekday: 1 },
    { pattern: /\b(this|next)\s+(tuesday|tue|tues)\b/gi, weekday: 2 },
    { pattern: /\b(this|next)\s+(wednesday|wed)\b/gi, weekday: 3 },
    { pattern: /\b(this|next)\s+(thursday|thu|thur|thurs)\b/gi, weekday: 4 },
    { pattern: /\b(this|next)\s+(friday|fri)\b/gi, weekday: 5 },
    { pattern: /\b(this|next)\s+(saturday|sat)\b/gi, weekday: 6 },
    { pattern: /\b(this|next)\s+(sunday|sun)\b/gi, weekday: 0 },
    
    // Standalone weekdays (defaults to next occurrence)
    { pattern: /\b(monday|mon)\b/gi, weekday: 1 },
    { pattern: /\b(tuesday|tue|tues)\b/gi, weekday: 2 },
    { pattern: /\b(wednesday|wed)\b/gi, weekday: 3 },
    { pattern: /\b(thursday|thu|thur|thurs)\b/gi, weekday: 4 },
    { pattern: /\b(friday|fri)\b/gi, weekday: 5 },
    { pattern: /\b(saturday|sat)\b/gi, weekday: 6 },
    { pattern: /\b(sunday|sun)\b/gi, weekday: 0 },
    
    // In X days
    { pattern: /\bin\s+(\d+)\s+days?\b/gi, inDays: true },
    { pattern: /\bin\s+a\s+week\b/gi, offset: 7 },
    { pattern: /\bin\s+(\d+)\s+weeks?\b/gi, inWeeks: true },
  ]

  let cleanedText = text
  let extractedDate: Date | undefined

  for (const pattern of patterns) {
    const match = text.match(pattern.pattern)
    if (match) {
      cleanedText = text.replace(pattern.pattern, '').replace(/\s+/g, ' ').trim()
      
      if ('offset' in pattern) {
        extractedDate = new Date(today.getTime() + pattern.offset * 24 * 60 * 60 * 1000)
      } else if ('weekday' in pattern) {
        extractedDate = getNextWeekday(pattern.weekday!)
      } else if ('inDays' in pattern) {
        const days = parseInt(match[0].match(/\d+/)?.[0] || '1')
        extractedDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
      } else if ('inWeeks' in pattern) {
        const weeks = parseInt(match[0].match(/\d+/)?.[0] || '1')
        extractedDate = new Date(today.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)
      }
      break
    }
  }

  // Try parsing explicit dates (MM/DD, MM-DD, MM/DD/YYYY, etc.)
  if (!extractedDate) {
    const dateFormats = [
      /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, // MM/DD/YYYY
      /\b(\d{1,2})-(\d{1,2})-(\d{4})\b/g,  // MM-DD-YYYY
      /\b(\d{1,2})\/(\d{1,2})\b/g,         // MM/DD
      /\b(\d{1,2})-(\d{1,2})\b/g,          // MM-DD
    ]

    for (const format of dateFormats) {
      const match = format.exec(text)
      if (match) {
        const [fullMatch, month, day, year] = match
        const currentYear = now.getFullYear()
        const parsedYear = year ? parseInt(year) : currentYear
        const parsedMonth = parseInt(month) - 1 // JavaScript months are 0-indexed
        const parsedDay = parseInt(day)
        
        if (parsedMonth >= 0 && parsedMonth <= 11 && parsedDay >= 1 && parsedDay <= 31) {
          extractedDate = new Date(parsedYear, parsedMonth, parsedDay)
          cleanedText = text.replace(fullMatch, '').replace(/\s+/g, ' ').trim()
        }
        break
      }
    }
  }

  return { date: extractedDate, cleanedText }
}

/**
 * Extract time information from text
 */
function extractTime(text: string): { time?: string; cleanedText: string } {
  const timePatterns = [
    /\b(\d{1,2}):(\d{2})\s*(am|pm)\b/gi,    // 5:30 PM
    /\b(\d{1,2})\s*(am|pm)\b/gi,            // 5 PM
    /\b(\d{1,2}):(\d{2})\b/gi,              // 17:30 (24-hour)
    /\bat\s+(\d{1,2})\b/gi,                 // at 5
  ]

  let cleanedText = text
  let extractedTime: string | undefined

  for (const pattern of timePatterns) {
    const match = pattern.exec(text)
    if (match) {
      cleanedText = text.replace(match[0], '').replace(/\s+/g, ' ').trim()
      extractedTime = match[0].trim()
      break
    }
  }

  return { time: extractedTime, cleanedText }
}

/**
 * Extract priority information from text
 */
function extractPriority(text: string): { priority?: 'low' | 'medium' | 'high'; cleanedText: string } {
  const priorityPatterns = [
    { pattern: /\b(urgent|critical|asap|high priority|important|emergency)\b/gi, priority: 'high' as const },
    { pattern: /\b(medium priority|normal|regular)\b/gi, priority: 'medium' as const },
    { pattern: /\b(low priority|when i have time|eventually|someday)\b/gi, priority: 'low' as const },
    { pattern: /\b(!!|!!!) /gi, priority: 'high' as const },
    { pattern: /\b! /gi, priority: 'medium' as const },
  ]

  let cleanedText = text
  let extractedPriority: 'low' | 'medium' | 'high' | undefined

  for (const pattern of priorityPatterns) {
    if (pattern.pattern.test(text)) {
      cleanedText = text.replace(pattern.pattern, '').replace(/\s+/g, ' ').trim()
      extractedPriority = pattern.priority
      break
    }
  }

  return { priority: extractedPriority, cleanedText }
}

/**
 * Extract duration information from text
 */
function extractDuration(text: string): { duration?: string; cleanedText: string } {
  const durationPatterns = [
    /\b(\d+)\s*hours?\b/gi,
    /\b(\d+)\s*hrs?\b/gi,
    /\b(\d+)\s*minutes?\b/gi,
    /\b(\d+)\s*mins?\b/gi,
    /\b(\d+)\s*days?\b/gi,
    /\bquick\b/gi,      // quick = ~15 mins
    /\bfast\b/gi,       // fast = ~15 mins
    /\blong\b/gi,       // long = ~2 hours
  ]

  let cleanedText = text
  let extractedDuration: string | undefined

  for (const pattern of durationPatterns) {
    const match = pattern.exec(text)
    if (match) {
      cleanedText = text.replace(match[0], '').replace(/\s+/g, ' ').trim()
      
      if (match[0].toLowerCase().includes('quick') || match[0].toLowerCase().includes('fast')) {
        extractedDuration = '15 minutes'
      } else if (match[0].toLowerCase().includes('long')) {
        extractedDuration = '2 hours'
      } else {
        extractedDuration = match[0].trim()
      }
      break
    }
  }

  return { duration: extractedDuration, cleanedText }
}

/**
 * Extract recurring patterns from text
 */
function extractRecurring(text: string): { isRecurring?: boolean; cleanedText: string } {
  const recurringPatterns = [
    /\b(daily|every day|each day)\b/gi,
    /\b(weekly|every week|each week)\b/gi,
    /\b(monthly|every month|each month)\b/gi,
    /\b(recurring|repeat|routine)\b/gi,
  ]

  let cleanedText = text
  let isRecurring = false

  for (const pattern of recurringPatterns) {
    if (pattern.test(text)) {
      cleanedText = text.replace(pattern, '').replace(/\s+/g, ' ').trim()
      isRecurring = true
      break
    }
  }

  return { isRecurring, cleanedText }
}

/**
 * Extract location information from text
 */
function extractLocation(text: string): { location?: string; cleanedText: string } {
  const locationPatterns = [
    /\bat\s+([A-Za-z\s]+)\b/gi,
    /\bin\s+([A-Za-z\s]+)\b/gi,
    /\b@\s*([A-Za-z\s]+)\b/gi,
  ]

  let cleanedText = text
  let extractedLocation: string | undefined

  for (const pattern of locationPatterns) {
    const match = pattern.exec(text)
    if (match && match[1] && match[1].length > 2) {
      cleanedText = text.replace(match[0], '').replace(/\s+/g, ' ').trim()
      extractedLocation = match[1].trim()
      break
    }
  }

  return { location: extractedLocation, cleanedText }
}

/**
 * Get the next occurrence of a specific weekday
 */
function getNextWeekday(targetDay: number): Date {
  const today = new Date()
  const currentDay = today.getDay()
  let daysUntilTarget = targetDay - currentDay
  
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7 // Next week
  }
  
  const targetDate = new Date(today.getTime() + daysUntilTarget * 24 * 60 * 60 * 1000)
  return new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
}

/**
 * Format a date for form input (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}