import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  isSameDay
} from 'date-fns'
import type { HabitSettings, HabitFrequency, Task } from '@/types/task'

const DEFAULT_INTERVAL_DAYS = 1

/**
 * Resolve the cadence into a day interval for streak calculations or custom repeats.
 */
export function getHabitIntervalDays(settings?: HabitSettings): number {
  if (!settings) return DEFAULT_INTERVAL_DAYS

  switch (settings.frequency) {
    case 'daily':
      return 1
    case 'weekly':
      return 7
    case 'monthly':
      // Months vary in length; treat as ~30 days when working with differences.
      return 30
    case 'custom':
      return Math.max(settings.intervalDays ?? DEFAULT_INTERVAL_DAYS, 1)
    default:
      return DEFAULT_INTERVAL_DAYS
  }
}

/**
 * Calculate the next due date for a habit after logging a completion.
 */
export function calculateNextDueDate(task: Task, completionDate = new Date()): Date | undefined {
  if (!task.isHabit || !task.habitSettings) {
    return task.dueDate
  }

  const settings = task.habitSettings
  const baseDate = task.dueDate ?? completionDate

  switch (settings.frequency) {
    case 'daily':
      return addDays(baseDate, 1)
    case 'weekly':
      return addWeeks(baseDate, 1)
    case 'monthly':
      return addMonths(baseDate, 1)
    case 'custom': {
      const interval = Math.max(settings.intervalDays ?? DEFAULT_INTERVAL_DAYS, 1)
      return addDays(baseDate, interval)
    }
    default:
      return task.dueDate
  }
}

function isConsecutiveCompletion(
  previousCompletion: Date,
  currentCompletion: Date,
  frequency: HabitFrequency,
  intervalDays: number
): boolean {
  if (isSameDay(previousCompletion, currentCompletion)) {
    return true
  }

  switch (frequency) {
    case 'daily': {
      const diff = differenceInCalendarDays(currentCompletion, previousCompletion)
      return diff === 1
    }
    case 'weekly': {
      const diff = differenceInCalendarDays(currentCompletion, previousCompletion)
      return diff > 0 && diff <= 7
    }
    case 'monthly': {
      const diff = differenceInCalendarMonths(currentCompletion, previousCompletion)
      return diff === 1
    }
    case 'custom': {
      const diff = differenceInCalendarDays(currentCompletion, previousCompletion)
      return diff === intervalDays
    }
    default:
      return false
  }
}

/**
 * Update a habit task with a new manual completion log.
 */
export function applyHabitCompletion(task: Task, completionDate = new Date()): Task {
  if (!task.isHabit || !task.habitSettings) {
    return task
  }

  const settings = task.habitSettings
  const previousCompletion = settings.lastCompletion ? new Date(settings.lastCompletion) : null
  const intervalDays = getHabitIntervalDays(settings)

  let streak = settings.streak ?? 0
  let bestStreak = settings.bestStreak ?? 0

  if (!previousCompletion) {
    streak = 1
  } else if (isConsecutiveCompletion(previousCompletion, completionDate, settings.frequency, intervalDays)) {
    // Avoid double-counting when logging multiple times the same day
    if (!isSameDay(previousCompletion, completionDate)) {
      streak += 1
    }
  } else {
    streak = 1
  }

  if (streak > bestStreak) {
    bestStreak = streak
  }

  const totalCompletions = (settings.totalCompletions ?? 0) + 1
  const updatedDueDate = calculateNextDueDate(task, completionDate)

  return {
    ...task,
    dueDate: updatedDueDate,
    habitSettings: {
      ...settings,
      lastCompletion: completionDate,
      streak,
      bestStreak,
      totalCompletions
    }
  }
}
