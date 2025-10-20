'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'
import {
  createDocument,
  updateDocument,
  deleteDocument,
  subscribeToUserDocuments
} from '@/lib/firebase-data'
import { getBestIconForList, type IconName } from '@/lib/utils/icon-matcher'
import { suggestColorForList, type ListColorKey } from '@/lib/utils/list-colors'
import type { Task, TaskList, ChatMessage } from '@/types/task'

interface UseTaskChatResult {
  messages: ChatMessage[]
  sendMessage: (message: string) => Promise<void>
  loading: boolean
  error: string | null
  taskLists: TaskList[]
  createTaskList: (title: string, tasks: Task[], options?: { icon?: IconName; color?: ListColorKey }) => void
  updateTaskList: (id: string, updates: Partial<TaskList>) => void
  deleteTaskList: (id: string) => void
  resetConversation: () => void
}

export function useTaskChat(): UseTaskChatResult {
  const normalizeTaskFromFirebase = useCallback((task: any): Task => {
    const baseTask: Task = {
      ...task,
      completed: task.completed ?? false,
      priority: task.priority ?? 'medium',
      status: task.status ?? 'upcoming'
    }

    if (task.dueDate) {
      const due = new Date(task.dueDate)
      baseTask.dueDate = isNaN(due.getTime()) ? undefined : due
    } else {
      baseTask.dueDate = undefined
    }

    if (task.completedAt) {
      const completedDate = new Date(task.completedAt)
      baseTask.completedAt = isNaN(completedDate.getTime()) ? null : completedDate
    } else {
      baseTask.completedAt = null
    }

    if (task.habitSettings) {
      const { lastCompletion, ...habitRest } = task.habitSettings
      baseTask.habitSettings = {
        ...habitRest,
        lastCompletion: lastCompletion ? new Date(lastCompletion) : null,
        streak: task.habitSettings.streak ?? 0,
        bestStreak: task.habitSettings.bestStreak ?? 0,
        totalCompletions: task.habitSettings.totalCompletions ?? 0
      }
    } else {
      baseTask.habitSettings = undefined
    }

    baseTask.isHabit = task.isHabit ?? Boolean(task.habitSettings)

    return baseTask
  }, [])

  const prepareTaskForFirebase = useCallback((task: Task) => {
    const firebaseTask: Record<string, any> = {
      id: task.id,
      title: task.title,
      completed: task.completed ?? false,
      priority: task.priority ?? 'medium'
    }

    if (task.description) firebaseTask.description = task.description
    if (task.category) firebaseTask.category = task.category
    if (task.categories && Array.isArray(task.categories)) firebaseTask.categories = task.categories
    if (task.tags && Array.isArray(task.tags)) firebaseTask.tags = task.tags
    if (task.status) firebaseTask.status = task.status
    if (task.note) firebaseTask.note = task.note
    if (typeof task.archived === 'boolean') firebaseTask.archived = task.archived
    if (task.archivedAt) {
      const archivedDate = new Date(task.archivedAt)
      if (!isNaN(archivedDate.getTime())) {
        firebaseTask.archivedAt = archivedDate.toISOString()
      }
    }

    if (task.completedAt) {
      const completedDate = new Date(task.completedAt)
      if (!isNaN(completedDate.getTime())) {
        firebaseTask.completedAt = completedDate.toISOString()
      }
    } else {
      firebaseTask.completedAt = null
    }

    if (task.dueDate) {
      const dueDate = new Date(task.dueDate)
      if (!isNaN(dueDate.getTime())) {
        firebaseTask.dueDate = dueDate.toISOString()
      }
    }

    if (task.isHabit || task.habitSettings) {
      firebaseTask.isHabit = Boolean(task.isHabit ?? task.habitSettings)
      if (task.habitSettings) {
        const { lastCompletion, ...habitRest } = task.habitSettings
        firebaseTask.habitSettings = {
          ...habitRest,
          lastCompletion: lastCompletion ? new Date(lastCompletion).toISOString() : null
        }
      }
    }

    return firebaseTask
  }, [])

  const { user } = useAuthStore()
  const { trackTaskUsage } = useAdaptiveStore()
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taskLists, setTaskLists] = useState<TaskList[]>([])

  // Function to reload task lists from Firebase
  const reloadTaskLists = useCallback(async () => {
    if (!user) return

    try {
      const { getUserDocuments } = await import('@/lib/firebase-data')
      const lists = await getUserDocuments<TaskList>('taskLists', 'updatedAt')

      // Sort by order field (ascending), with undefined order values at the end
      // No longer deduplicating - users can have multiple lists with the same title if they want
      const sortedLists = [...lists].sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER
        return orderA - orderB
      }).map(list => ({
        ...list,
        tasks: Array.isArray(list.tasks) ? list.tasks.map(task => normalizeTaskFromFirebase(task)) : []
      }))

      setTaskLists(sortedLists)
    } catch (error) {
      void error
    }
  }, [normalizeTaskFromFirebase, user])

  // Delete task list from Firebase (moved up to fix circular dependency)
  const deleteTaskListFromFirebase = useCallback(async (id: string) => {
    try {
      await deleteDocument('taskLists', id)
      // Don't reload here - let the caller handle state updates
    } catch (error) {
      throw error // Re-throw to let caller know deletion failed
    }
  }, [])

  // Cleanup duplicate lists in Firebase
  const cleanupDuplicateLists = useCallback(async () => {
    if (!user) return

    try {
      const { getUserDocuments } = await import('@/lib/firebase-data')
      const lists = await getUserDocuments<TaskList>('taskLists', 'updatedAt')

      // Find duplicates by title
      const duplicateGroups: Map<string, TaskList[]> = new Map()

      lists.forEach(list => {
        const key = list.title.toLowerCase()
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, [])
        }
        duplicateGroups.get(key)!.push(list)
      })

      // Delete older duplicates, keeping only the most recent
      for (const [title, duplicates] of duplicateGroups) {
        if (duplicates.length > 1) {

          // Sort by date (most recent first)
          duplicates.sort((a, b) => {
            const dateA = (a.updatedAt || a.createdAt) as any
            const dateB = (b.updatedAt || b.createdAt) as any
            return dateB - dateA
          })

          // Keep the first (most recent) and delete the rest
          for (let i = 1; i < duplicates.length; i++) {
            await deleteTaskListFromFirebase(duplicates[i].id)
          }
        }
      }

      // Reload lists after cleanup
      await reloadTaskLists()
    } catch (error) {
      void error
    }
  }, [user, deleteTaskListFromFirebase, reloadTaskLists])

  // Load Firebase task lists when user is authenticated
  useEffect(() => {
    if (!user) {
      setTaskLists([])
      return
    }
    // Just load lists without aggressive cleanup
    // The cleanupDuplicateLists function was too aggressive and deleted user lists
    reloadTaskLists()
  }, [user, reloadTaskLists])

  // Save task list to Firebase
  const saveTaskListToFirebase = useCallback(async (taskList: TaskList) => {
    try {

      // Convert Date objects to ISO strings for Firebase
      const tasksForFirebase = taskList.tasks.map((task: any) => {
        const firebaseTask = prepareTaskForFirebase(task as Task)

        return firebaseTask
      })

      // Create document data without undefined fields
      const documentData: any = {
        title: taskList.title,
        tasks: tasksForFirebase
      }

      // Only add category if it's defined
      if (taskList.category !== undefined) {
        documentData.category = taskList.category
      }

      await createDocument('taskLists', taskList.id, documentData)
      // Reload task lists to update UI
      await reloadTaskLists()
    } catch (error) {
      void error
    }
  }, [prepareTaskForFirebase, reloadTaskLists])

  // Update task list in Firebase
  const updateTaskListInFirebase = useCallback(async (id: string, updates: Partial<TaskList>) => {
    try {

      // If updates contain tasks, convert Date objects to ISO strings
      const firebaseUpdates: any = { ...updates }
      if (firebaseUpdates.tasks && Array.isArray(firebaseUpdates.tasks)) {
        firebaseUpdates.tasks = firebaseUpdates.tasks.map((task: any) => prepareTaskForFirebase(task))
      }

      await updateDocument('taskLists', id, firebaseUpdates)

      // For simple updates (title, color, icon), just update the local state
      // instead of doing a full reload to avoid flickering
      if (!firebaseUpdates.tasks) {
        setTaskLists(prev => prev.map(list =>
          list.id === id ? { ...list, ...updates } : list
        ))
      } else {
        // Only reload for task updates
        await reloadTaskLists()
      }
    } catch (error) {
      void error
    }
  }, [prepareTaskForFirebase, reloadTaskLists])


  const sendMessage = useCallback(async (message: string) => {
    if (!user || loading) return

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/tasks/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: user.id,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          existingTaskLists: taskLists
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await response.json()
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        taskLists: data.taskLists,
        suggestions: data.suggestions
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Update task lists if new ones were created
      if (data.taskLists && data.taskLists.length > 0) {
        const updatedTaskLists = [...taskLists]

        data.taskLists.forEach((newList: any) => {
          // Parse dates in tasks that come from the API (JSON serialization converts Date to string)
          if (newList.tasks && Array.isArray(newList.tasks)) {
            newList.tasks = newList.tasks.map((task: any) => normalizeTaskFromFirebase(task))
          }
          // Handle list deletion operation
          if (newList.operation === 'deleteList') {
            // Remove ALL lists with matching title
            const titleToDelete = newList.title.toLowerCase()
            // Filter out all lists with matching title
            const filteredLists = updatedTaskLists.filter(list =>
              list.title.toLowerCase() !== titleToDelete
            )
            // Replace the array with filtered version
            updatedTaskLists.length = 0
            updatedTaskLists.push(...filteredLists)
          } else if (newList.isAddToExisting) {
            // Find existing list to modify
            const existingIndex = updatedTaskLists.findIndex(list => list.id === newList.id)
            if (existingIndex !== -1) {
              if (newList.operation === 'delete' && newList.tasksToDelete) {
                // Remove specified tasks from existing list
                updatedTaskLists[existingIndex] = {
                  ...updatedTaskLists[existingIndex],
                  tasks: updatedTaskLists[existingIndex].tasks.filter(task =>
                    !newList.tasksToDelete.some((titleToDelete: string) =>
                      task.title.toLowerCase() === titleToDelete.toLowerCase()
                    )
                  )
                }
              } else if (newList.operation === 'update' && newList.tasks && newList.tasks.length > 0) {
                // Update existing tasks (merge changes, don't add duplicates)
                const updatedTasks = [...updatedTaskLists[existingIndex].tasks]

                newList.tasks.forEach((updatedTask: Task) => {
                  const taskIndex = updatedTasks.findIndex(task =>
                    task.title.toLowerCase() === updatedTask.title.toLowerCase()
                  )

                  if (taskIndex === -1) {
                    return
                  }

                  // Update existing task by merging properties
                  updatedTasks[taskIndex] = {
                    ...updatedTasks[taskIndex],
                    ...updatedTask
                  }
                })

                updatedTaskLists[existingIndex] = {
                  ...updatedTaskLists[existingIndex],
                  tasks: updatedTasks
                }
              } else {
                // Add tasks to existing list (default behavior for new tasks)
                updatedTaskLists[existingIndex] = {
                  ...updatedTaskLists[existingIndex],
                  tasks: [...updatedTaskLists[existingIndex].tasks, ...(newList.tasks || [])]
                }
              }
            }
          } else {
            // Add as new list (only for add operations)
            if (newList.operation !== 'delete' && newList.operation !== 'deleteList') {
              updatedTaskLists.push(newList)
            }
          }
        })
        
        setTaskLists(updatedTaskLists)

        // Save all changes to Firebase
        for (const newList of data.taskLists) {
          try {
            if (newList.operation === 'deleteList') {
              // Delete ALL lists with matching title from Firebase
              const listsToDelete = taskLists.filter(list =>
                list.title.toLowerCase() === newList.title.toLowerCase()
              )

              // Delete all matching lists
              for (const list of listsToDelete) {
                await deleteTaskListFromFirebase(list.id)
              }
            } else if (newList.isAddToExisting) {
              // Update existing list in Firebase
              const existingIndex = updatedTaskLists.findIndex(list => list.id === newList.id)
              if (existingIndex !== -1) {
                // Convert Date objects to ISO strings for Firebase
                const tasksForFirebase = updatedTaskLists[existingIndex].tasks.map((task: any) => prepareTaskForFirebase(task))

                await updateTaskListInFirebase(newList.id, {
                  tasks: tasksForFirebase
                })
              }
            } else {
              // Save new list to Firebase (only for add operations)
              if (newList.operation !== 'delete' && newList.operation !== 'deleteList') {
                await saveTaskListToFirebase(newList)
              }
            }
          } catch (error) {
            void error
          }
        }
      }

      trackTaskUsage('ai_chat')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      
      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorChatMessage])
    } finally {
      setLoading(false)
    }
  }, [deleteTaskListFromFirebase, loading, messages, normalizeTaskFromFirebase, prepareTaskForFirebase, saveTaskListToFirebase, taskLists, trackTaskUsage, updateTaskListInFirebase, user])

  const createTaskList = useCallback(async (title: string, tasks: Task[], options: { icon?: IconName; color?: ListColorKey } = {}) => {
    // Check if a task list with the same title already exists
    const existingList = taskLists.find(list =>
      list.title.toLowerCase() === title.toLowerCase()
    )

    if (existingList) {
      // Filter out duplicate tasks (same title, case insensitive) and completed tasks
      const existingTaskTitles = new Set(
        existingList.tasks
          .filter(task => !task.completed) // Only check against active tasks
          .map(task => task.title.toLowerCase().trim())
      )

      const newTasksToAdd = tasks.filter(newTask => {
        const normalizedTitle = newTask.title.toLowerCase().trim()
        const isDuplicate = existingTaskTitles.has(normalizedTitle)

        return !isDuplicate
      })

      if (newTasksToAdd.length > 0) {
        const updatePayload: Partial<TaskList> = { tasks: [...existingList.tasks, ...newTasksToAdd] }
        if (options.icon) {
          updatePayload.icon = options.icon
        }
        if (options.color) {
          updatePayload.color = options.color
        }
        await updateTaskListInFirebase(existingList.id, updatePayload)
      }
    } else {
      // Create new task list with unique tasks only
      const uniqueTasks = tasks.filter((task, index, array) => {
        const normalizedTitle = task.title.toLowerCase().trim()
        return index === array.findIndex(t => t.title.toLowerCase().trim() === normalizedTitle)
      })

      const newTaskList: TaskList = {
        id: `list-${Date.now()}`,
        title,
        tasks: uniqueTasks,
        createdAt: new Date(),
        // Auto-detect icon and color based on title
        icon: options.icon ?? getBestIconForList(title),
        color: options.color ?? suggestColorForList(title)
      }

      await saveTaskListToFirebase(newTaskList)
    }
  }, [taskLists, saveTaskListToFirebase, updateTaskListInFirebase])

  const updateTaskList = useCallback(async (id: string, updates: Partial<TaskList>) => {
    await updateTaskListInFirebase(id, updates)
  }, [updateTaskListInFirebase])

  const deleteTaskList = useCallback(async (id: string) => {
    await deleteTaskListFromFirebase(id)
  }, [deleteTaskListFromFirebase])

  const resetConversation = useCallback(() => {
    setMessages([])
    setError(null)
    setLoading(false)
  }, [])

  return {
    messages,
    sendMessage,
    loading,
    error,
    taskLists,
    createTaskList,
    updateTaskList,
    deleteTaskList,
    resetConversation,
    reloadTaskLists
  }
}
