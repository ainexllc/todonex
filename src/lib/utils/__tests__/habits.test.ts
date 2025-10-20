import { describe, it, expect } from '@jest/globals'
import { addDays, addWeeks, addMonths } from 'date-fns'
import { calculateNextDueDate, applyHabitCompletion } from '../habits'
import type { Task } from '../../types/task'

const createHabitTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'habit-1',
  title: 'Daily stretch',
  completed: false,
  priority: 'medium',
  status: 'upcoming',
  dueDate: new Date('2024-04-01T00:00:00.000Z'),
  isHabit: true,
  habitSettings: {
    frequency: 'daily',
    streak: 0,
    bestStreak: 0,
    totalCompletions: 0,
    lastCompletion: null
  },
  ...overrides
})

describe('habit utilities', () => {
  describe('calculateNextDueDate', () => {
    it('advances daily habits by one day from the due date anchor', () => {
      const baseTask = createHabitTask({
        dueDate: new Date('2024-04-02T00:00:00.000Z')
      })

      const nextDue = calculateNextDueDate(baseTask)

      expect(nextDue?.toISOString()).toBe(new Date('2024-04-03T00:00:00.000Z').toISOString())
    })

    it('supports weekly and monthly cadences', () => {
      const weeklyTask = createHabitTask({
        habitSettings: {
          frequency: 'weekly',
          streak: 0,
          bestStreak: 0,
          totalCompletions: 0,
          lastCompletion: null
        }
      })

      const monthlyTask = createHabitTask({
        habitSettings: {
          frequency: 'monthly',
          streak: 0,
          bestStreak: 0,
          totalCompletions: 0,
          lastCompletion: null
        }
      })

      expect(calculateNextDueDate(weeklyTask)?.toISOString()).toBe(addWeeks(weeklyTask.dueDate!, 1).toISOString())
      expect(calculateNextDueDate(monthlyTask)?.toISOString()).toBe(addMonths(monthlyTask.dueDate!, 1).toISOString())
    })

    it('uses custom interval when provided', () => {
      const customTask = createHabitTask({
        habitSettings: {
          frequency: 'custom',
          intervalDays: 3,
          streak: 0,
          bestStreak: 0,
          totalCompletions: 0,
          lastCompletion: null
        }
      })

      const completionDate = new Date('2024-04-01T05:00:00.000Z')
      const nextDue = calculateNextDueDate(customTask, completionDate)

      expect(nextDue?.toISOString()).toBe(addDays(customTask.dueDate!, 3).toISOString())
    })
  })

  describe('applyHabitCompletion', () => {
    it('initialises streak data on first completion', () => {
      const task = createHabitTask()
      const completedTask = applyHabitCompletion(task, new Date('2024-04-01T09:00:00.000Z'))

      expect(completedTask.habitSettings?.streak).toBe(1)
      expect(completedTask.habitSettings?.bestStreak).toBe(1)
      expect(completedTask.habitSettings?.totalCompletions).toBe(1)
      expect(completedTask.habitSettings?.lastCompletion?.toISOString()).toBe('2024-04-01T09:00:00.000Z')
    })

    it('increments streak when completions are consecutive', () => {
      const task = createHabitTask({
        dueDate: new Date('2024-04-03T00:00:00.000Z'),
        habitSettings: {
          frequency: 'daily',
          streak: 1,
          bestStreak: 1,
          totalCompletions: 1,
          lastCompletion: new Date('2024-04-02T09:00:00.000Z')
        }
      })

      const updated = applyHabitCompletion(task, new Date('2024-04-03T07:30:00.000Z'))

      expect(updated.habitSettings?.streak).toBe(2)
      expect(updated.habitSettings?.bestStreak).toBe(2)
      expect(updated.habitSettings?.totalCompletions).toBe(2)
      expect(updated.dueDate?.toISOString()).toBe(addDays(task.dueDate!, 1).toISOString())
    })
  })
})
