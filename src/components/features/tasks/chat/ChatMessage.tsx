'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Edit, Trash2, Plus, Calendar, Flag, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

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
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  taskLists?: TaskList[]
  suggestions?: string[]
}

interface ChatMessageProps {
  message: ChatMessage
  onTaskAction: (action: string, taskId?: string, data?: any) => void
}

export function ChatMessage({ message, onTaskAction }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300'
    }
  }

  const formatDueDate = (date: Date) => {
    const today = new Date()
    const dueDate = new Date(date)
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0) return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  }

  return (
    <div className={cn(
      "flex w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] space-y-3",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message content */}
        <div className={cn(
          "rounded-2xl px-4 py-3 mb-3",
          isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-black text-white"
        )}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        {/* Task Lists (Assistant only) */}
        {isAssistant && message.taskLists && message.taskLists.length > 0 && (
          <div className="space-y-3 mt-2">
            {message.taskLists.map((taskList) => (
              <Card key={taskList.id} className="border-gray-800 bg-gray-950 rounded-xl overflow-hidden">
                {/* Full-width header with top curves */}
                <div className="bg-gray-800 px-4 py-3 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <h3 className="font-semibold text-sm text-white">{taskList.title}</h3>
                  </div>
                </div>
                <CardContent className="p-4 pb-6">
                  
                  <div className="space-y-2 mt-0">
                    {taskList.tasks && taskList.tasks.length > 0 ? (
                      taskList.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg",
                            "hover:bg-gray-800/50 transition-colors",
                            task.completed && "opacity-60"
                          )}
                        >
                          <button
                            onClick={() => onTaskAction('toggle', task.id, { completed: !task.completed })}
                            className="flex-shrink-0 hover:scale-110 transition-transform"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400 hover:text-blue-400" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium text-white",
                              task.completed && "line-through text-gray-500"
                            )}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-gray-400 truncate">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {task.priority && task.priority !== 'medium' && (
                              <Flag className={cn(
                                "h-3 w-3",
                                task.priority === 'high' && "text-red-400",
                                task.priority === 'low' && "text-green-400"
                              )} />
                            )}
                            {task.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  {formatDueDate(task.dueDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic py-3 text-center">
                        No tasks in this list yet
                      </p>
                    )}
                  </div>

                  {/* Extra bottom padding */}
                  <div className="pb-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Suggestions (Assistant only) */}
        {isAssistant && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-700">
            {message.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-8 text-xs px-3 py-1"
                onClick={() => onTaskAction('suggestion', undefined, suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
