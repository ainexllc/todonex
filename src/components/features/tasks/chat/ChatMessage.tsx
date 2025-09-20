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
        "max-w-[80%] space-y-3",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message content */}
        <div className={cn(
          "rounded-xl px-3 py-2 mb-2",
          isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-black text-white"
        )}>
          <div className="text-[13px] whitespace-pre-wrap leading-normal">
            {isAssistant ? renderClickableContent(message.content) : message.content}
          </div>
        </div>

        {/* Task Lists (Assistant only) */}
        {isAssistant && message.taskLists && message.taskLists.length > 0 && (
          <div className="space-y-2 mt-1">
            {message.taskLists.map((taskList) => (
              <Card key={taskList.id} className="border-gray-800 bg-gray-950 rounded-xl overflow-hidden">
                {/* Full-width header with top curves */}
                <div className="bg-gray-800 px-3 py-2 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <List className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <div className="font-semibold text-[13px] text-white">{taskList.title}</div>
                  </div>
                </div>
                <CardContent className="p-3 pb-4">
                  
                  <div className="space-y-1.5 mt-0">
                    {taskList.tasks && taskList.tasks.length > 0 ? (
                      taskList.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg",
                            "hover:bg-gray-800/50 transition-colors",
                            task.completed && "opacity-60"
                          )}
                        >
                          <button
                            onClick={() => onTaskAction('toggle', task.id, { completed: !task.completed })}
                            className="flex-shrink-0 hover:scale-110 transition-transform"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-gray-400 hover:text-blue-400" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-[13px] font-medium text-white",
                              task.completed && "line-through text-gray-500"
                            )}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-[13px] text-gray-400 truncate">
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
                                <span className="text-[13px] text-gray-400">
                                  {formatDueDate(task.dueDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[13px] text-gray-400 italic py-3 text-center">
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
                className="h-8 text-[13px] px-3 py-1"
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
