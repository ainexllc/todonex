/**
 * Tests for auto-completion functionality
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock Firebase functions
const mockGetUserDocuments = jest.fn()
const mockUpdateDocument = jest.fn()

jest.mock('../firebase-data', () => ({
  getUserDocuments: mockGetUserDocuments,
  updateDocument: mockUpdateDocument
}))

// Import after mocking
import { autoCompleteTasksDueToday, getTasksDueToday } from '../auto-completion'

describe('Auto-completion functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('autoCompleteTasksDueToday', () => {
    it('should complete tasks that are due today', async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const mockTaskLists = [
        {
          id: 'list1',
          title: 'Daily Tasks',
          tasks: [
            {
              id: 'task1',
              title: 'Morning exercise',
              completed: false,
              priority: 'medium' as const,
              dueDate: today // Due today
            },
            {
              id: 'task2',
              title: 'Read book',
              completed: false,
              priority: 'low' as const,
              dueDate: new Date(today.getTime() + 86400000) // Due tomorrow
            },
            {
              id: 'task3',
              title: 'Already completed',
              completed: true,
              priority: 'high' as const,
              dueDate: today // Due today but already completed
            }
          ],
          createdAt: new Date()
        }
      ]

      mockGetUserDocuments.mockResolvedValue(mockTaskLists)
      mockUpdateDocument.mockResolvedValue(undefined)

      const result = await autoCompleteTasksDueToday()

      expect(result.completedCount).toBe(1)
      expect(result.updatedLists).toEqual(['Daily Tasks'])
      expect(result.errors).toHaveLength(0)

      // Verify that updateDocument was called with the correct data
      expect(mockUpdateDocument).toHaveBeenCalledWith(
        'taskLists',
        'list1',
        expect.objectContaining({
          tasks: expect.arrayContaining([
            expect.objectContaining({
              id: 'task1',
              title: 'Morning exercise',
              completed: true,
              completedAt: expect.any(String)
            })
          ])
        })
      )
    })

    it('should handle empty task lists', async () => {
      mockGetUserDocuments.mockResolvedValue([])

      const result = await autoCompleteTasksDueToday()

      expect(result.completedCount).toBe(0)
      expect(result.updatedLists).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
      expect(mockUpdateDocument).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      mockGetUserDocuments.mockRejectedValue(new Error('Database error'))

      const result = await autoCompleteTasksDueToday()

      expect(result.completedCount).toBe(0)
      expect(result.updatedLists).toHaveLength(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Database error')
    })

    it('should not complete tasks without due dates', async () => {
      const mockTaskLists = [
        {
          id: 'list1',
          title: 'No Due Date Tasks',
          tasks: [
            {
              id: 'task1',
              title: 'Task without due date',
              completed: false,
              priority: 'medium' as const
              // No dueDate property
            }
          ],
          createdAt: new Date()
        }
      ]

      mockGetUserDocuments.mockResolvedValue(mockTaskLists)

      const result = await autoCompleteTasksDueToday()

      expect(result.completedCount).toBe(0)
      expect(result.updatedLists).toHaveLength(0)
      expect(mockUpdateDocument).not.toHaveBeenCalled()
    })

    it('should handle tasks due in the past', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)

      const mockTaskLists = [
        {
          id: 'list1',
          title: 'Past Due Tasks',
          tasks: [
            {
              id: 'task1',
              title: 'Overdue task',
              completed: false,
              priority: 'high' as const,
              dueDate: yesterday
            }
          ],
          createdAt: new Date()
        }
      ]

      mockGetUserDocuments.mockResolvedValue(mockTaskLists)

      const result = await autoCompleteTasksDueToday()

      expect(result.completedCount).toBe(0)
      expect(result.updatedLists).toHaveLength(0)
      expect(mockUpdateDocument).not.toHaveBeenCalled()
    })
  })

  describe('getTasksDueToday', () => {
    it('should return tasks that are due today', async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const mockTaskLists = [
        {
          id: 'list1',
          title: 'Daily Tasks',
          tasks: [
            {
              id: 'task1',
              title: 'Task due today',
              completed: false,
              priority: 'medium' as const,
              dueDate: today
            },
            {
              id: 'task2',
              title: 'Task due tomorrow',
              completed: false,
              priority: 'low' as const,
              dueDate: new Date(today.getTime() + 86400000)
            }
          ],
          createdAt: new Date()
        }
      ]

      mockGetUserDocuments.mockResolvedValue(mockTaskLists)

      const result = await getTasksDueToday()

      expect(result.taskLists).toHaveLength(1)
      expect(result.taskLists[0].listTitle).toBe('Daily Tasks')
      expect(result.taskLists[0].tasks).toHaveLength(1)
      expect(result.taskLists[0].tasks[0].title).toBe('Task due today')
    })

    it('should handle errors gracefully', async () => {
      mockGetUserDocuments.mockRejectedValue(new Error('Database error'))

      const result = await getTasksDueToday()

      expect(result.taskLists).toHaveLength(0)
    })
  })
})