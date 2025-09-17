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

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  category?: string
}

interface TaskList {
  id: string
  title: string
  tasks: Task[]
  category?: string
  createdAt: Date
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  taskLists?: TaskList[]
  suggestions?: string[]
}

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

      console.log(`Loaded ${lists.length} lists, deduplicated to ${uniqueLists.length}`)
      setTaskLists(uniqueLists)
    } catch (error) {
      console.log('Error loading task lists:', error)
    }
  }, [user])

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
      await createDocument('taskLists', taskList.id, {
        title: taskList.title,
        tasks: taskList.tasks,
        category: taskList.category
      })
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
      await updateDocument('taskLists', id, updates)
      console.log('Successfully updated task list in Firebase:', id)
      // Reload task lists to update UI
      await reloadTaskLists()
    } catch (error) {
      console.error('Failed to update task list in Firebase:', error)
    }
  }, [reloadTaskLists])

  // Delete task list from Firebase
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
              } else {
                // Add tasks to existing list (default behavior)
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
                await updateTaskListInFirebase(newList.id, {
                  tasks: updatedTaskLists[existingIndex].tasks
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
      // Add tasks to existing list instead of creating a new one
      const updatedTasks = [...existingList.tasks, ...tasks]
      await updateTaskListInFirebase(existingList.id, { tasks: updatedTasks })
    } else {
      // Create new task list
      const newTaskList: TaskList = {
        id: `list-${Date.now()}`,
        title,
        tasks,
        createdAt: new Date()
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
