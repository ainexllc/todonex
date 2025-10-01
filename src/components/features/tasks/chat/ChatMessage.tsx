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
  onTaskAction?: (action: string, taskId?: string, data?: any) => void
  onSendMessage?: (message: string) => void
}

interface ClickableAction {
  text: string
  action: string
  data?: any
  className?: string
}

export function ChatMessage({ message, onTaskAction, onSendMessage }: ChatMessageProps) {
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
            onClick={() => onTaskAction?.(action.action, undefined, action.data)}
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
        "max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] space-y-1.5",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message content */}
        <div className={cn(
          "chat-message rounded-sm px-2 py-1.5",
          isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-gray-800/70 text-gray-100 border border-gray-700/50"
        )}>
          <div className="text-xs whitespace-pre-wrap leading-relaxed">
            {isAssistant ? renderClickableContent(message.content) : message.content}
          </div>
        </div>

        {/* Task Lists (Assistant only) */}
        {isAssistant && message.taskLists && message.taskLists.length > 0 && (
          <div className="space-y-1">
            {message.taskLists.map((taskList) => (
              <div
                key={taskList.id}
                className="border border-gray-800/30 bg-gray-900/60 rounded overflow-hidden"
              >
                {/* Responsive header */}
                <div className="bg-gray-800/40 px-2 py-1 border-b border-gray-800/30">
                  <div className="flex items-center gap-1.5">
                    <List className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-300 text-xs">
                      {taskList.title}
                    </span>
                  </div>
                </div>

                {/* Tasks list */}
                <div className="p-1.5">
                  {taskList.tasks && taskList.tasks.length > 0 ? (
                    <div className="space-y-0.5">
                      {taskList.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-start gap-1.5 py-1 px-1.5 rounded-sm",
                            "hover:bg-gray-800/20 transition-colors",
                            task.completed && "opacity-60"
                          )}
                        >
                          <button
                            onClick={() => onTaskAction?.('toggle', task.id, { completed: !task.completed })}
                            className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-gray-400 hover:text-blue-400" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                "text-gray-200 text-xs leading-tight",
                                task.completed && "line-through text-gray-500"
                              )}
                            >
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="text-gray-500 mt-0.5 text-xs leading-tight">
                                {task.description}
                              </div>
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
                              <div className="flex items-center gap-0.5">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-400 text-xs">
                                  {formatDueDate(task.dueDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-center py-1.5 text-xs">
                      No tasks in this list yet
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions (Assistant only) - Quick action buttons */}
        {isAssistant && message.suggestions && message.suggestions.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400 font-medium px-1">Quick actions:</div>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage?.(suggestion)}
                  className="group relative h-auto min-h-[28px] px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
                    bg-gradient-to-r from-blue-600/90 to-blue-500/90 hover:from-blue-500 hover:to-blue-400
                    text-white shadow-sm hover:shadow-md
                    border border-blue-400/20 hover:border-blue-300/40
                    active:scale-95 transform
                    flex items-center gap-1.5 break-words text-left"
                >
                  <span className="text-blue-100 group-hover:text-white transition-colors flex-shrink-0">▸</span>
                  <span className="break-words">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
