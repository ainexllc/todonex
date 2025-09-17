'use client'

import { TaskChatInterface } from '@/components/features/tasks/chat/TaskChatInterface'
import { useAuthRedirect } from '@/hooks/use-auth-redirect'

export default function TasksPage() {
  // Use centralized authentication redirect hook
  useAuthRedirect()

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TaskChatInterface className="flex-1" />
    </div>
  )
}