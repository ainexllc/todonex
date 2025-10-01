'use client'

import { useState, useEffect } from 'react'
import { useAuthRedirect } from '@/hooks/use-auth-redirect'
import { useTaskChat } from '@/hooks/useTaskChat'
import { useIsMobile } from '@/hooks/use-media-query'
import { UnifiedTaskView } from '@/components/features/tasks/UnifiedTaskView'
import { FloatingAIButton } from '@/components/features/tasks/FloatingAIButton'
import { AIAssistantModal } from '@/components/features/tasks/AIAssistantModal'
import { cn } from '@/lib/utils'

export default function TasksPage() {
  // Auth redirect hook
  useAuthRedirect()

  const isMobile = useIsMobile()

  // Local UI state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  // Task management from hook
  const {
    messages,
    sendMessage,
    loading,
    error,
    taskLists,
    updateTaskList,
    deleteTaskList,
    createTaskList
  } = useTaskChat()

  const handleDeleteTaskList = async (taskListId: string) => {
    await deleteTaskList(taskListId)
  }

  const handleTaskUpdate = async (taskId: string, listId: string, updates: any) => {
    const taskList = taskLists.find(list => list.id === listId)
    if (!taskList) return

    const updatedTasks = taskList.tasks.map((task: any) =>
      task.id === taskId ? { ...task, ...updates } : task
    )

    // Prepare tasks for Firebase
    const tasksForFirebase = updatedTasks.map((task: any) => {
      const firebaseTask: any = {
        id: task.id,
        title: task.title,
        completed: task.completed || false,
        priority: task.priority || 'medium',
        completedAt: null
      }

      if (task.completedAt) {
        const completedDate = new Date(task.completedAt)
        if (!isNaN(completedDate.getTime())) {
          firebaseTask.completedAt = completedDate.toISOString()
        }
      }

      if (task.description) firebaseTask.description = task.description
      if (task.category) firebaseTask.category = task.category
      if (task.categories && Array.isArray(task.categories)) firebaseTask.categories = task.categories
      if (task.tags && Array.isArray(task.tags)) firebaseTask.tags = task.tags

      if (task.dueDate) {
        const dueDate = new Date(task.dueDate)
        if (!isNaN(dueDate.getTime())) {
          firebaseTask.dueDate = dueDate.toISOString()
        }
      }

      return firebaseTask
    })

    await updateTaskList(listId, { tasks: tasksForFirebase })
  }

  const handleTaskDelete = async (taskId: string, listId: string) => {
    const taskList = taskLists.find(list => list.id === listId)
    if (!taskList) return

    const updatedTasks = taskList.tasks.filter((task: any) => task.id !== taskId)

    const tasksForFirebase = updatedTasks.map((task: any) => {
      const firebaseTask: any = {
        id: task.id,
        title: task.title,
        completed: task.completed || false,
        priority: task.priority || 'medium',
        completedAt: null
      }

      if (task.completedAt) {
        const completedDate = new Date(task.completedAt)
        if (!isNaN(completedDate.getTime())) {
          firebaseTask.completedAt = completedDate.toISOString()
        }
      }

      if (task.description) firebaseTask.description = task.description
      if (task.category) firebaseTask.category = task.category
      if (task.categories && Array.isArray(task.categories)) firebaseTask.categories = task.categories
      if (task.tags && Array.isArray(task.tags)) firebaseTask.tags = task.tags

      if (task.dueDate) {
        const dueDate = new Date(task.dueDate)
        if (!isNaN(dueDate.getTime())) {
          firebaseTask.dueDate = dueDate.toISOString()
        }
      }

      return firebaseTask
    })

    await updateTaskList(listId, { tasks: tasksForFirebase })
  }

  const handleTaskToggle = async (taskId: string, listId: string, completed: boolean) => {
    const updates: any = { completed }
    if (completed) {
      updates.completedAt = new Date()
    } else {
      updates.completedAt = null
    }
    await handleTaskUpdate(taskId, listId, updates)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-900">
      {/* Main Unified View */}
      <div className="flex-1 overflow-hidden">
        <UnifiedTaskView
          taskLists={taskLists}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onTaskToggle={handleTaskToggle}
          onTaskListDelete={handleDeleteTaskList}
        />
      </div>

      {/* Floating AI Assistant Button */}
      <FloatingAIButton
        onClick={() => setIsAIModalOpen(true)}
        messageCount={messages.length}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        messages={messages}
        onSendMessage={sendMessage}
        loading={loading}
        error={error}
        onTaskAction={async (action, taskId, data) => {
          // Handle AI task actions (create, update, etc.)
          if (action === 'create') {
            await createTaskList(data.title, data.tasks)
          }
        }}
      />
    </div>
  )
}