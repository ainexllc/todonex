'use client'

import { TaskChatInterface } from '@/components/features/tasks/chat/TaskChatInterface'
import { useAuthStore } from '@/store/auth-store'

export default function TasksPage() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please sign in to access tasks.</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TaskChatInterface className="flex-1" />
    </div>
  )
}