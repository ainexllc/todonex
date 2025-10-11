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
        className: 'text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary/80'
      },
      {
        pattern: /add(?:ed)?\s+(?:the\s+)?(?:following\s+)?tasks?[:\s]?([^\n.!?]+)/gi,
        action: 'add_tasks',
        className: 'text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary/80'
      },
      {
        pattern: /mark(?:ed)?\s+(?:as\s+)?complete(?:d)?[:\s]?([^\n.!?]+)/gi,
        action: 'mark_complete',
        className: 'text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary/80'
      },
      {
        pattern: /delete(?:d)?\s+(?:the\s+)?(?:task\s+)?["']?([^"'\n.!?]+)["']?/gi,
        action: 'delete_task',
        className: 'text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary/80'
      }
    ]

    const processedContent = content
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

    const processedContent = content
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
        <div
          className={cn(
            "chat-message rounded-sm px-2 py-1.5",
            isUser
              ? "ml-auto bg-primary text-primary-foreground"
              : "border border-border/60 bg-muted text-foreground"
          )}
        >
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
                className="overflow-hidden rounded border border-border/60 bg-muted/60"
              >
                {/* Responsive header */}
                <div className="border-b border-border/60 bg-muted/70 px-2 py-1">
                  <div className="flex items-center gap-1.5">
                    <List className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">
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
                            "flex items-start gap-1.5 rounded-sm px-1.5 py-1 transition-colors",
                            "hover:bg-muted/70",
                            task.completed && "opacity-70"
                          )}
                        >
                          <button
                            onClick={() => onTaskAction?.('toggle', task.id, { completed: !task.completed })}
                            className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div
                              className={cn(
                                "text-xs leading-tight text-foreground",
                                task.completed && "line-through text-muted-foreground"
                              )}
                            >
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="mt-0.5 text-xs leading-tight text-muted-foreground">
                                {task.description}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-shrink-0 items-center gap-1">
                            {task.priority && task.priority !== 'medium' && (
                              <Flag
                                className={cn(
                                  "h-3 w-3",
                                  task.priority === 'high' && "text-red-500",
                                  task.priority === 'low' && "text-green-500"
                                )}
                              />
                            )}
                            {task.dueDate && (
                              <div className="flex items-center gap-0.5 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">
                                  {formatDueDate(task.dueDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-1.5 text-center text-xs italic text-muted-foreground">
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
            <div className="px-1 text-xs font-medium text-muted-foreground">Quick actions:</div>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage?.(suggestion)}
                  className="group relative flex min-h-[28px] items-center gap-1.5 break-words rounded-md border border-primary/40 bg-gradient-to-r from-primary/80 to-primary px-3 py-1.5 text-left text-xs font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:from-primary/70 hover:to-primary/90 hover:shadow-md active:scale-95"
                >
                  <span className="flex-shrink-0 transition-colors group-hover:text-primary-foreground/80">
                    ▸
                  </span>
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
