'use client'

import { useState, useCallback } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'

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
  const { trackFeatureUsage } = useAdaptiveStore()
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taskLists, setTaskLists] = useState<TaskList[]>(() => {
    // Load task lists from localStorage on initialization
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('task-chat-lists')
        return saved ? JSON.parse(saved) : []
      } catch {
        return []
      }
    }
    return []
  })

  // Save task lists to localStorage whenever they change
  const saveTaskLists = useCallback((lists: TaskList[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('task-chat-lists', JSON.stringify(lists))
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
          userId: user.uid,
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
          if (newList.isAddToExisting) {
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
            if (newList.operation !== 'delete') {
              updatedTaskLists.push(newList)
            }
          }
        })
        
        setTaskLists(updatedTaskLists)
        saveTaskLists(updatedTaskLists)
      }

      trackFeatureUsage('tasks', 'ai_chat')
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
  }, [user, messages, taskLists, loading, trackFeatureUsage])

  const createTaskList = useCallback((title: string, tasks: Task[]) => {
    // Check if a task list with the same title already exists
    const existingList = taskLists.find(list => 
      list.title.toLowerCase() === title.toLowerCase()
    )
    
    if (existingList) {
      // Add tasks to existing list instead of creating a new one
      const updatedList = {
        ...existingList,
        tasks: [...existingList.tasks, ...tasks]
      }
      
      const newTaskLists = taskLists.map(list => 
        list.id === existingList.id ? updatedList : list
      )
      setTaskLists(newTaskLists)
      saveTaskLists(newTaskLists)
    } else {
      // Create new task list
      const newTaskList: TaskList = {
        id: `list-${Date.now()}`,
        title,
        tasks,
        createdAt: new Date()
      }
      const newTaskLists = [...taskLists, newTaskList]
      setTaskLists(newTaskLists)
      saveTaskLists(newTaskLists)
    }
  }, [taskLists, saveTaskLists])

  const updateTaskList = useCallback((id: string, updates: Partial<TaskList>) => {
    const newTaskLists = taskLists.map(list => 
      list.id === id ? { ...list, ...updates } : list
    )
    setTaskLists(newTaskLists)
    saveTaskLists(newTaskLists)
  }, [taskLists, saveTaskLists])

  const deleteTaskList = useCallback((id: string) => {
    const newTaskLists = taskLists.filter(list => list.id !== id)
    setTaskLists(newTaskLists)
    saveTaskLists(newTaskLists)
  }, [taskLists, saveTaskLists])

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
    resetConversation
  }
}
