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
import { getBestIconForList } from '@/lib/utils/icon-matcher'
import { suggestColorForList } from '@/lib/utils/list-colors'
import type { Task, TaskList, ChatMessage } from '@/types/task'

interface UseTaskChatResult {
  messages: ChatMessage[]
  sendMessage: (message: string) => Promise<void>
  loading: boolean
  error: string | null
  taskLists: TaskList[]
  createTaskList: (title: string, tasks: Task[]) => void
  updateTaskList: (id: string, updates: Partial<TaskList>) => void
  deleteTaskList: (id: string) => void
  resetConversation: () => void
}

export function useTaskChat(): UseTaskChatResult {
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

      // Deduplicate lists by title (keep the most recently updated one)
      const uniqueLists = lists.reduce((acc: TaskList[], list) => {
        const existingIndex = acc.findIndex(l => l.title.toLowerCase() === list.title.toLowerCase())
        if (existingIndex !== -1) {
          // Compare updatedAt dates and keep the more recent one
          const existingDate = acc[existingIndex].updatedAt || acc[existingIndex].createdAt
          const newDate = list.updatedAt || list.createdAt
          if (newDate > existingDate) {
            acc[existingIndex] = list
          }
        } else {
          acc.push(list)
        }
        return acc
      }, [])

      // Sort by order field (ascending), with undefined order values at the end
      uniqueLists.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER
        return orderA - orderB
      })

      console.log(`Loaded ${lists.length} lists, deduplicated to ${uniqueLists.length}`)
      setTaskLists(uniqueLists)
    } catch (error) {
      console.log('Error loading task lists:', error)
    }
  }, [user])

  // Delete task list from Firebase (moved up to fix circular dependency)
  const deleteTaskListFromFirebase = useCallback(async (id: string) => {
    try {
      await deleteDocument('taskLists', id)
      console.log('Successfully deleted task list from Firebase:', id)
      // Don't reload here - let the caller handle state updates
    } catch (error) {
      console.error('Failed to delete task list from Firebase:', error)
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
          console.log(`Found ${duplicates.length} duplicate lists for "${title}"`)

          // Sort by date (most recent first)
          duplicates.sort((a, b) => {
            const dateA = (a.updatedAt || a.createdAt) as any
            const dateB = (b.updatedAt || b.createdAt) as any
            return dateB - dateA
          })

          // Keep the first (most recent) and delete the rest
          for (let i = 1; i < duplicates.length; i++) {
            console.log(`Deleting duplicate list: ${duplicates[i].id} (${duplicates[i].title})`)
            await deleteTaskListFromFirebase(duplicates[i].id)
          }
        }
      }

      // Reload lists after cleanup
      await reloadTaskLists()
    } catch (error) {
      console.error('Failed to cleanup duplicate lists:', error)
    }
  }, [user, deleteTaskListFromFirebase, reloadTaskLists])

  // Load Firebase task lists when user is authenticated
  useEffect(() => {
    if (!user) {
      setTaskLists([])
      return
    }
    // Run cleanup once on mount, then load lists
    cleanupDuplicateLists()
  }, [user, cleanupDuplicateLists])

  // Save task list to Firebase
  const saveTaskListToFirebase = useCallback(async (taskList: TaskList) => {
    try {
      console.log('Saving task list to Firebase:', taskList.title, taskList.id)

      // Convert Date objects to ISO strings for Firebase
      const tasksForFirebase = taskList.tasks.map((task: any) => {
        const firebaseTask: any = { ...task }

        // Validate and convert dates
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate)
          if (!isNaN(dueDate.getTime())) {
            firebaseTask.dueDate = dueDate.toISOString()
          } else {
            delete firebaseTask.dueDate
          }
        }

        if (task.completedAt) {
          const completedDate = new Date(task.completedAt)
          if (!isNaN(completedDate.getTime())) {
            firebaseTask.completedAt = completedDate.toISOString()
          } else {
            firebaseTask.completedAt = null
          }
        }

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
      console.log('Successfully saved task list to Firebase:', taskList.title)
      // Reload task lists to update UI
      await reloadTaskLists()
    } catch (error) {
      console.error('Failed to save task list to Firebase:', error)
    }
  }, [reloadTaskLists])

  // Update task list in Firebase
  const updateTaskListInFirebase = useCallback(async (id: string, updates: Partial<TaskList>) => {
    try {
      console.log('Updating task list in Firebase:', id, updates)

      // If updates contain tasks, convert Date objects to ISO strings
      const firebaseUpdates: any = { ...updates }
      if (firebaseUpdates.tasks && Array.isArray(firebaseUpdates.tasks)) {
        firebaseUpdates.tasks = firebaseUpdates.tasks.map((task: any) => {
          const firebaseTask: any = { ...task }

          // Validate and convert dates
          if (task.dueDate) {
            const dueDate = new Date(task.dueDate)
            if (!isNaN(dueDate.getTime())) {
              firebaseTask.dueDate = dueDate.toISOString()
            } else {
              delete firebaseTask.dueDate
            }
          }

          if (task.completedAt) {
            const completedDate = new Date(task.completedAt)
            if (!isNaN(completedDate.getTime())) {
              firebaseTask.completedAt = completedDate.toISOString()
            } else {
              firebaseTask.completedAt = null
            }
          }

          return firebaseTask
        })
      }

      await updateDocument('taskLists', id, firebaseUpdates)
      console.log('Successfully updated task list in Firebase:', id)
      // Reload task lists to update UI
      await reloadTaskLists()
    } catch (error) {
      console.error('Failed to update task list in Firebase:', error)
    }
  }, [reloadTaskLists])


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
        console.log('Received task lists from AI:', data.taskLists)
        const updatedTaskLists = [...taskLists]

        data.taskLists.forEach((newList: any) => {
          // Parse dates in tasks that come from the API (JSON serialization converts Date to string)
          if (newList.tasks && Array.isArray(newList.tasks)) {
            newList.tasks = newList.tasks.map((task: any) => ({
              ...task,
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              completedAt: task.completedAt ? new Date(task.completedAt) : null
            }))
          }
          // Handle list deletion operation
          if (newList.operation === 'deleteList') {
            // Remove ALL lists with matching title
            const titleToDelete = newList.title.toLowerCase()
            const beforeCount = updatedTaskLists.length

            // Filter out all lists with matching title
            const filteredLists = updatedTaskLists.filter(list =>
              list.title.toLowerCase() !== titleToDelete
            )

            const deletedCount = beforeCount - filteredLists.length
            console.log(`Deleting ${deletedCount} list(s) named "${newList.title}"`)

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

                  if (taskIndex !== -1) {
                    // Update existing task by merging properties
                    updatedTasks[taskIndex] = {
                      ...updatedTasks[taskIndex],
                      ...updatedTask
                    }
                    console.log(`Updated task "${updatedTask.title}" in list "${updatedTaskLists[existingIndex].title}"`)
                  } else {
                    // Task not found, this shouldn't happen for update operations
                    console.warn(`Task "${updatedTask.title}" not found for update, skipping`)
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
              console.log(`Found ${listsToDelete.length} lists named "${newList.title}" to delete`)

              // Delete all matching lists
              for (const list of listsToDelete) {
                console.log('Deleting list from Firebase:', list.id, list.title)
                await deleteTaskListFromFirebase(list.id)
              }
            } else if (newList.isAddToExisting) {
              // Update existing list in Firebase
              const existingIndex = updatedTaskLists.findIndex(list => list.id === newList.id)
              if (existingIndex !== -1) {
                // Convert Date objects to ISO strings for Firebase
                const tasksForFirebase = updatedTaskLists[existingIndex].tasks.map((task: any) => {
                  const firebaseTask: any = { ...task }

                  // Validate and convert dates
                  if (task.dueDate) {
                    const dueDate = new Date(task.dueDate)
                    if (!isNaN(dueDate.getTime())) {
                      firebaseTask.dueDate = dueDate.toISOString()
                    } else {
                      delete firebaseTask.dueDate
                    }
                  }

                  if (task.completedAt) {
                    const completedDate = new Date(task.completedAt)
                    if (!isNaN(completedDate.getTime())) {
                      firebaseTask.completedAt = completedDate.toISOString()
                    } else {
                      firebaseTask.completedAt = null
                    }
                  }

                  return firebaseTask
                })

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
            console.error('Failed to save task list changes to Firebase:', error)
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
  }, [user, messages, taskLists, loading, trackTaskUsage, deleteTaskListFromFirebase, saveTaskListToFirebase, updateTaskListInFirebase])

  const createTaskList = useCallback(async (title: string, tasks: Task[]) => {
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

        if (isDuplicate) {
          console.log('Duplicate task detected, skipping:', newTask.title)
        }

        return !isDuplicate
      })

      if (newTasksToAdd.length > 0) {
        console.log(`Adding ${newTasksToAdd.length} new tasks to existing list "${title}" (${tasks.length - newTasksToAdd.length} duplicates filtered)`)
        const updatedTasks = [...existingList.tasks, ...newTasksToAdd]
        await updateTaskListInFirebase(existingList.id, { tasks: updatedTasks })
      } else {
        console.log('All tasks were duplicates, no new tasks added to list:', title)
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
        icon: getBestIconForList(title),
        color: suggestColorForList(title)
      }

      if (uniqueTasks.length < tasks.length) {
        console.log(`Filtered ${tasks.length - uniqueTasks.length} duplicate tasks when creating new list "${title}"`)
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
