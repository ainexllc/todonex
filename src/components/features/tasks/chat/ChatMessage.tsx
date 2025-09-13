'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Edit, Trash2, Plus, Calendar, Flag } from 'lucide-react'
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
          "rounded-2xl px-4 py-3",
          isUser 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted/50 text-foreground"
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className={cn(
            "text-xs mt-1 opacity-70",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {format(message.timestamp, 'HH:mm')}
          </p>
        </div>

        {/* Task Lists (Assistant only) */}
        {isAssistant && message.taskLists && message.taskLists.length > 0 && (
          <div className="space-y-3">
            {message.taskLists.map((taskList) => (
              <Card key={taskList.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">{taskList.title}</h3>
                    {taskList.category && (
                      <Badge variant="outline" className="text-xs">
                        {taskList.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {taskList.tasks.map((task) => (
                      <div 
                        key={task.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg",
                          "hover:bg-muted/30 transition-colors",
                          task.completed && "opacity-60"
                        )}
                      >
                        <button
                          onClick={() => onTaskAction('toggle', task.id, { completed: !task.completed })}
                          className="flex-shrink-0 hover:scale-110 transition-transform"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium",
                            task.completed && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {task.priority && task.priority !== 'medium' && (
                            <Flag className={cn(
                              "h-3 w-3",
                              task.priority === 'high' && "text-red-500",
                              task.priority === 'low' && "text-green-500"
                            )} />
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDueDate(task.dueDate)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Suggestions (Assistant only) */}
        {isAssistant && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
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
