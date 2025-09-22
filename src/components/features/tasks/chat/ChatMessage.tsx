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

interface ClickableAction {
  text: string
  action: string
  data?: any
  className?: string
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

  // Parse message content for clickable actions
  const parseMessageForActions = (content: string) => {
    // Define patterns that should be clickable
    const actionPatterns = [
      {
        pattern: /create(?:d)?\s+(?:a\s+)?(?:new\s+)?(?:task\s+)?list(?:\s+called)?[\s:"]*([^"\n.!?]+)/gi,
        action: 'create_list',
        className: 'text-blue-400 hover:text-blue-300 underline cursor-pointer'
      },
      {
        pattern: /add(?:ed)?\s+(?:the\s+)?(?:following\s+)?tasks?[:\s]?([^\n.!?]+)/gi,
        action: 'add_tasks',
        className: 'text-green-400 hover:text-green-300 underline cursor-pointer'
      },
      {
        pattern: /mark(?:ed)?\s+(?:as\s+)?complete(?:d)?[:\s]?([^\n.!?]+)/gi,
        action: 'mark_complete',
        className: 'text-green-400 hover:text-green-300 underline cursor-pointer'
      },
      {
        pattern: /delete(?:d)?\s+(?:the\s+)?(?:task\s+)?["']?([^"'\n.!?]+)["']?/gi,
        action: 'delete_task',
        className: 'text-red-400 hover:text-red-300 underline cursor-pointer'
      }
    ]

    let processedContent = content
    const actions: ClickableAction[] = []

    actionPatterns.forEach(({ pattern, action, className }) => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const fullMatch = match[0]
        const actionData = match[1]?.trim()

        if (actionData) {
          actions.push({
            text: fullMatch,
            action,
            data: actionData,
            className
          })
        }
      }
    })

    return { processedContent, actions }
  }

  const renderClickableContent = (content: string) => {
    const { actions } = parseMessageForActions(content)

    if (actions.length === 0) {
      return <span>{content}</span>
    }

    let processedContent = content
    const elements: React.ReactNode[] = []
    let lastIndex = 0

    actions.forEach((action, index) => {
      const actionIndex = processedContent.indexOf(action.text, lastIndex)

      if (actionIndex !== -1) {
        // Add text before the action
        if (actionIndex > lastIndex) {
          elements.push(
            <span key={`text-${index}`}>
              {processedContent.substring(lastIndex, actionIndex)}
            </span>
          )
        }

        // Add clickable action
        elements.push(
          <button
            key={`action-${index}`}
            onClick={() => onTaskAction(action.action, undefined, action.data)}
            className={cn(
              'inline text-[13px] transition-colors',
              action.className
            )}
            title={`Click to ${action.action.replace('_', ' ')}: ${action.data}`}
          >
            {action.text}
          </button>
        )

        lastIndex = actionIndex + action.text.length
      }
    })

    // Add remaining text
    if (lastIndex < processedContent.length) {
      elements.push(
        <span key="text-end">
          {processedContent.substring(lastIndex)}
        </span>
      )
    }

    return <>{elements}</>
  }

  return (
    <div className={cn(
      "flex w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] space-y-2 sm:space-y-3",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message content */}
        <div className={cn(
          "chat-message rounded-sm px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5",
          isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-gray-800/70 text-gray-100 border border-gray-700/50"
        )}>
          <div className="text-xs sm:text-sm md:text-base whitespace-pre-wrap leading-relaxed">
            {isAssistant ? renderClickableContent(message.content) : message.content}
          </div>
        </div>

        {/* Task Lists (Assistant only) */}
        {isAssistant && message.taskLists && message.taskLists.length > 0 && (
          <div className="space-y-1 sm:space-y-2">
            {message.taskLists.map((taskList) => (
              <div
                key={taskList.id}
                className="border border-gray-800/30 bg-gray-900/60 rounded overflow-hidden"
              >
                {/* Responsive header */}
                <div className="bg-gray-800/40 px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5 border-b border-gray-800/30">
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                    <List className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-300 text-xs sm:text-sm md:text-base">
                      {taskList.title}
                    </span>
                  </div>
                </div>

                {/* Tasks list */}
                <div className="p-1.5 sm:p-2 md:p-3">
                  {taskList.tasks && taskList.tasks.length > 0 ? (
                    <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5">
                      {taskList.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-start gap-1.5 sm:gap-2 md:gap-3 py-0.5 sm:py-1 md:py-1.5 px-1 sm:px-2 md:px-3 rounded-sm",
                            "hover:bg-gray-800/20 transition-colors",
                            task.completed && "opacity-60"
                          )}
                        >
                          <button
                            onClick={() => onTaskAction('toggle', task.id, { completed: !task.completed })}
                            className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400 hover:text-blue-400" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                "text-gray-200 text-xs sm:text-sm md:text-base leading-tight sm:leading-normal",
                                task.completed && "line-through text-gray-500"
                              )}
                            >
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="text-gray-500 mt-0.5 text-xs sm:text-sm md:text-sm leading-tight">
                                {task.description}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                            {task.priority && task.priority !== 'medium' && (
                              <Flag className={cn(
                                "h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4",
                                task.priority === 'high' && "text-red-400",
                                task.priority === 'low' && "text-green-400"
                              )} />
                            )}
                            {task.dueDate && (
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-400" />
                                <span className="text-gray-400 text-xs sm:text-xs md:text-sm">
                                  {formatDueDate(task.dueDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-center py-1 sm:py-2 text-xs sm:text-sm">
                      No tasks in this list yet
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions (Assistant only) */}
        {isAssistant && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {message.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-6 sm:h-7 md:h-8 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
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
